import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	UserCreateRequest,
	UserDeedRetrieveRequest,
	UserDeleteRequest,
	UserRetriveAllRequest,
	UserRetriveAllResponse,
	UserRetriveRequest,
	UserRetriveResponse,
	UserUpdateRequest,
} from './interfaces'
import { UserTypeEnum } from '@prisma/client'
import { addHours, endOfDay, format } from 'date-fns'
import { UserDeedUpload } from './excel'

@Injectable()
export class UserService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async userRetrieveAll(payload: UserRetriveAllRequest): Promise<UserRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		let searchOption = {}
		if (payload.search) {
			searchOption = {
				OR: [{ name: { contains: payload.search, mode: 'insensitive' } }, { phone: { contains: payload.search, mode: 'insensitive' } }],
			}
		}

		const userList = await this.#_prisma.users.findMany({
			where: {
				deletedAt: null,
				type: payload.type as UserTypeEnum,
				...searchOption,
			},
			...paginationOptions,
			select: {
				id: true,
				name: true,
				phone: true,
				debt: true,
				createdAt: true,
				orders: {
					take: 1,
					orderBy: { createdAt: 'desc' },
					select: {
						createdAt: true,
					},
				},
				incomingOrder: {
					take: 1,
					orderBy: { createdAt: 'desc' },
					select: {
						createdAt: true,
					},
				},
			},
			orderBy: [{ createdAt: 'desc' }],
		})

		const totalCount = await this.#_prisma.users.count({
			where: {
				deletedAt: null,
				type: payload.type as UserTypeEnum,
				...searchOption,
			},
		})

		if (payload.type === 'client') {
			const formattedData = userList.map((user) => {
				return {
					...user,
					debt: user.debt ? user.debt.toNumber() : 0,
					lastSale: user.orders[0]?.createdAt || null,
				}
			})

			return {
				totalCount: totalCount,
				pageNumber: payload.pageNumber,
				pageSize: payload.pageSize,
				pageCount: Math.ceil(totalCount / payload.pageSize),
				data: formattedData,
			}
		} else {
			const formattedData = userList.map((user) => {
				return {
					...user,
					debt: user.debt ? user.debt.toNumber() : 0,
					lastSale: user.incomingOrder[0]?.createdAt || null,
				}
			})

			return {
				totalCount: totalCount,
				pageNumber: payload.pageNumber,
				pageSize: payload.pageSize,
				pageCount: Math.ceil(totalCount / payload.pageSize),
				data: formattedData,
			}
		}
	}

	async clientDeedRetrieve(payload: UserDeedRetrieveRequest): Promise<any> {
		const { id, startDate, endDate } = payload
		let dateOption = {}
		if (startDate || endDate) {
			const sDate = new Date(format(startDate, 'yyyy-MM-dd'))
			const eDate = addHours(new Date(endOfDay(endDate)), 3)
			console.log(startDate, endDate)
			console.log(sDate, eDate)
			dateOption = {
				createdAt: {
					gte: sDate,
					lte: eDate,
				},
			}
		}

		const user = await this.#_prisma.users.findFirst({
			where: { id, deletedAt: null, type: 'client' },
			select: {
				id: true,
				name: true,
				phone: true,
				debt: true,
				orders: {
					where: { ...dateOption, deletedAt: null },
					select: {
						id: true,
						sum: true,
						articl: true,
						debt: true,
						createdAt: true,
						updatedAt: true,
						accepted: true,
					},
				},
				payments: {
					where: { ...dateOption, deletedAt: null },
					select: {
						id: true,
						card: true,
						cash: true,
						other: true,
						transfer: true,
						totalPay: true,
						description: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		})

		if (!user) {
			throw new NotFoundException('Client topilmadi')
		}

		const orders = user?.orders?.map((order) => ({ ...order, type: 'order' })) || []
		const payments = user.payments.map((payment) => ({ ...payment, type: 'payment' })) || []
		const combined = [...orders, ...payments]

		// Sort combined array
		const sorted = combined.sort((a, b) => {
			const dateA = a.type === 'order' ? a.createdAt : a.updatedAt
			const dateB = b.type === 'order' ? b.createdAt : b.updatedAt
			return new Date(dateA).getTime() - new Date(dateB).getTime()
		})

		if (payload.type === 'excel') {
			await UserDeedUpload(
				{
					id: id,
					name: user.name,
					phone: user.phone,
					debt: user.debt,
					data: sorted,
				},
				payload,
			)
		} else {
			return {
				id: id,
				name: user.name,
				phone: user.phone,
				debt: user.debt,
				data: sorted,
			}
		}
	}

	async userRetrieve(payload: UserRetriveRequest): Promise<UserRetriveResponse> {
		const user = await this.#_prisma.users.findUnique({
			where: { id: payload.id, deletedAt: null },
			select: {
				id: true,
				name: true,
				phone: true,
				createdAt: true,
				debt: true,
				orders: {
					take: 1,
					orderBy: { createdAt: 'desc' },
					select: {
						createdAt: true,
					},
				},
				incomingOrder: {
					take: 1,
					orderBy: { createdAt: 'desc' },
					select: {
						createdAt: true,
					},
				},
			},
		})
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return {
			...user,
			debt: user.debt.toNumber() || 0,
			lastSale: user.orders[0]?.createdAt || user.incomingOrder[0]?.createdAt,
		}
	}

	async supplierCreate(payload: UserCreateRequest): Promise<null> {
		const user = await this.#_prisma.users.findFirst({
			where: { phone: payload.phone },
		})

		if (user && user.deletedAt === null) {
			throw new ForbiddenException('This phone already exists')
		} else if (user && user.createdAt !== null) {
			throw new ForbiddenException('This user deleted')
		}

		await this.#_prisma.users.create({
			data: {
				name: payload.name,
				phone: payload.phone,
				type: 'supplier',
				debt: 0,
			},
		})

		return null
	}

	async clientCreate(payload: UserCreateRequest): Promise<null> {
		const user = await this.#_prisma.users.findFirst({
			where: { phone: payload.phone },
		})

		if (user && user.deletedAt === null) {
			throw new ForbiddenException('This phone already exists')
		} else if (user && user.createdAt !== null) {
			throw new ForbiddenException('This user deleted')
		}

		await this.#_prisma.users.create({
			data: {
				name: payload.name,
				phone: payload.phone,
				type: 'client',
				debt: 0,
			},
		})

		return null
	}

	async userUpdate(payload: UserUpdateRequest): Promise<null> {
		const user = await this.#_prisma.users.findUnique({
			where: { id: payload.id },
		})

		if (!user) throw new NotFoundException('user not found')

		await this.#_prisma.users.update({
			where: { id: payload.id, deletedAt: null },
			data: {
				name: payload.name,
				phone: payload.phone,
			},
		})

		return null
	}

	async userDelete(payload: UserDeleteRequest): Promise<null> {
		const user = await this.#_prisma.users.findUnique({
			where: { id: payload.id },
		})

		if (!user) throw new NotFoundException('user not found')

		await this.#_prisma.users.update({
			where: { id: payload.id, deletedAt: null },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
