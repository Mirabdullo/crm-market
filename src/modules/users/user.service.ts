import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	ClientUploadRequest,
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
import { ClientUpload, SupplierDeedUpload, SupplierDeedUploadWithProduct, UserDeedUpload, UserDeedUploadWithProduct } from './excel'
import { ReedExcelFile2 } from '../order/excel'
import { Response } from 'express'

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

		let orderByOption = {}
		if (payload.orderBy) {
			if (payload.orderBy === 'desc') {
				orderByOption = { debt: 'desc' }
			} else {
				orderByOption = { debt: 'asc' }
			}
		}

		let debtOption = {}
		if (payload.debtType) {
			if (payload.debtType === 'equal') {
				debtOption = { debt: { equals: payload.debt } }
			}

			if (payload.debtType === 'greater') {
				debtOption = { debt: { gt: payload.debt } }
			}

			if (payload.debtType === 'less') {
				debtOption = { debt: { lt: payload.debt } }
			}
		}

		const userList = await this.#_prisma.users.findMany({
			where: {
				deletedAt: null,
				type: payload.type as UserTypeEnum,
				...searchOption,
				...debtOption,
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
			orderBy: [{ createdAt: 'desc' }, orderByOption],
		})

		const totalCount = await this.#_prisma.users.count({
			where: {
				deletedAt: null,
				type: payload.type as UserTypeEnum,
				...searchOption,
				...debtOption,
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
					where: { ...dateOption, accepted: true, deletedAt: null },
					select: {
						id: true,
						sum: true,
						articl: true,
						debt: true,
						sellingDate: true,
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
				returnedOrder: {
					where: { ...dateOption, accepted: true, deletedAt: null },
					select: {
						id: true,
						accepted: true,
						cashPayment: true,
						fromClient: true,
						createdAt: true,
						returnedDate: true,
						sum: true,
						updatedAt: true,
						description: true,
					},
				},
			},
		})

		if (!user) {
			throw new NotFoundException('Client topilmadi')
		}

		const orders = user?.orders?.map((order) => ({ ...order, type: 'order' })) || []
		const payments = user.payments.map((payment) => ({ ...payment, type: 'payment' })) || []
		const returnedOrders = user?.returnedOrder?.map((returnedOrder) => ({ ...returnedOrder, type: 'returned-order' }))
		const combined = [...orders, ...payments, ...returnedOrders]

		const totalDebt = user?.orders?.reduce((sum, order) => sum + order.sum.toNumber(), 0)
		let totalCredit = user?.payments?.reduce((sum, payment) => sum + payment.totalPay.toNumber(), 0)

		totalCredit += user.returnedOrder?.reduce((sum, order) => sum + order.fromClient.toNumber(), 0)
		// Sort combined array
		const sorted = combined.sort((a, b) => {
			const dateA = a.type === 'order' ? a.createdAt : a.updatedAt
			const dateB = b.type === 'order' ? b.createdAt : b.updatedAt
			return new Date(dateA).getTime() - new Date(dateB).getTime()
		})

		return {
			id: id,
			name: user.name,
			phone: user.phone,
			debt: user.debt,
			totalDebt: totalDebt,
			totalCredit: totalCredit,
			data: sorted,
		}
	}

	async clientDeedRetrieveUpload(payload: UserDeedRetrieveRequest): Promise<any> {
		const { id, startDate, endDate, type } = payload
		let dateOption = {}
		if (startDate || endDate) {
			const sDate = new Date(format(startDate, 'yyyy-MM-dd'))
			const eDate = addHours(new Date(endOfDay(endDate)), 3)
			dateOption = {
				createdAt: {
					gte: sDate,
					lte: eDate,
				},
			}
		}

		let productOption = {}
		if (type === 'product') {
			productOption = {
				products: {
					select: {
						id: true,
						cost: true,
						count: true,
						price: true,
						product: {
							select: {
								name: true,
							},
						},
					},
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
						sellingDate: true,
						...productOption,
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
				returnedOrder: {
					where: { ...dateOption, accepted: true, deletedAt: null },
					select: {
						id: true,
						accepted: true,
						cashPayment: true,
						fromClient: true,
						createdAt: true,
						returnedDate: true,
						sum: true,
						updatedAt: true,
						description: true,
						products: {
							select: {
								id: true,
								count: true,
								price: true,
								product: {
									select: {
										name: true,
									},
								},
							},
						},
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

		if (type === 'deed') {
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
			await UserDeedUploadWithProduct(
				{
					id: id,
					name: user.name,
					phone: user.phone,
					debt: user.debt,
					data: sorted,
				},
				payload,
			)
		}
	}

	async supplierDeedRetrieve(payload: UserDeedRetrieveRequest): Promise<any> {
		const { id, startDate, endDate } = payload
		let dateOption = {}
		if (startDate || endDate) {
			const sDate = new Date(format(startDate, 'yyyy-MM-dd'))
			const eDate = addHours(new Date(endOfDay(endDate)), 3)

			dateOption = {
				createdAt: {
					gte: sDate,
					lte: eDate,
				},
			}
		}

		const user = await this.#_prisma.users.findFirst({
			where: { id, deletedAt: null, type: 'supplier' },
			select: {
				id: true,
				name: true,
				phone: true,
				debt: true,
				incomingOrder: {
					where: { ...dateOption, accepted: true, deletedAt: null },
					select: {
						id: true,
						sum: true,
						debt: true,
						createdAt: true,
						updatedAt: true,
						sellingDate: true,
					},
				},
				incomingOrderPayment: {
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
				refundIncoming: {
					where: { ...dateOption, deletedAt: null },
					select: {
						id: true,
						sum: true,
						description: true,
						createdAt: true,
						updatedAt: true,
						products: {
							where: { deletedAt: null },
							select: {
								id: true,
								count: true,
								price: true,
								createdAt: true,
								product: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				},
			},
		})

		if (!user) {
			throw new NotFoundException('Client topilmadi')
		}

		const orders = user?.incomingOrder?.map((order) => ({ ...order, type: 'order' })) || []
		const payments = user.incomingOrderPayment.map((payment) => ({ ...payment, type: 'payment' })) || []
		const refundIncoming = user.refundIncoming?.map((item) => ({ ...item, type: 'refund' })) || []
		const combined = [...orders, ...payments, ...refundIncoming]

		// Sort combined array
		const sorted = combined.sort((a, b) => {
			const dateA = a.type === 'order' ? a.createdAt : a.updatedAt
			const dateB = b.type === 'order' ? b.createdAt : b.updatedAt
			return new Date(dateA).getTime() - new Date(dateB).getTime()
		})

		const totalDebt = user?.incomingOrder?.reduce((sum, order) => sum + order.sum.toNumber(), 0)
		let totalCredit = user?.incomingOrderPayment?.reduce((sum, payment) => sum + payment.totalPay.toNumber(), 0)
		totalCredit += user.refundIncoming?.reduce((sum, item) => sum + item.sum.toNumber(), 0)

		return {
			id: id,
			name: user.name,
			phone: user.phone,
			debt: user.debt,
			totalDebt,
			totalCredit,
			data: sorted,
		}
	}

	async supplierDeedRetrieveUpload(payload: UserDeedRetrieveRequest): Promise<any> {
		const { id, startDate, endDate, type } = payload
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

		let productOption = {}
		let refundOption = {}
		if (type === 'product') {
			productOption = {
				incomingProducts: {
					select: {
						id: true,
						cost: true,
						count: true,
						product: {
							select: {
								name: true,
							},
						},
					},
				},
			}

			refundOption = {
				products: {
					where: { deletedAt: null },
					select: {
						id: true,
						count: true,
						price: true,
						createdAt: true,
						product: {
							select: {
								name: true,
							},
						},
					},
				},
			}
		}

		const user = await this.#_prisma.users.findFirst({
			where: { id, deletedAt: null, type: 'supplier' },
			select: {
				id: true,
				name: true,
				phone: true,
				debt: true,
				incomingOrder: {
					where: { ...dateOption, deletedAt: null },
					select: {
						id: true,
						sum: true,
						debt: true,
						createdAt: true,
						updatedAt: true,
						sellingDate: true,
						...productOption,
					},
				},
				incomingOrderPayment: {
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
				refundIncoming: {
					where: { ...dateOption, deletedAt: null },
					select: {
						id: true,
						sum: true,
						description: true,
						createdAt: true,
						updatedAt: true,
						...refundOption,
					},
				},
			},
		})

		if (!user) {
			throw new NotFoundException('Client topilmadi')
		}

		const orders = user?.incomingOrder?.map((order) => ({ ...order, type: 'order' })) || []
		const payments = user.incomingOrderPayment.map((payment) => ({ ...payment, type: 'payment' })) || []
		const refundIncoming = user.refundIncoming?.map((item) => ({ ...item, type: 'refund' })) || []
		const combined = [...orders, ...payments, ...refundIncoming]

		// Sort combined array
		const sorted = combined.sort((a, b) => {
			const dateA = a.type === 'order' ? a.createdAt : a.updatedAt
			const dateB = b.type === 'order' ? b.createdAt : b.updatedAt
			return new Date(dateA).getTime() - new Date(dateB).getTime()
		})

		if (type === 'deed') {
			await SupplierDeedUpload(
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
			await SupplierDeedUploadWithProduct(
				{
					id: id,
					name: user.name,
					phone: user.phone,
					debt: user.debt,
					data: sorted,
				},
				payload,
			)
		}
	}

	async clientUpload(payload: ClientUploadRequest): Promise<void> {
		const users = await this.#_prisma.users.findMany({
			where: {
				deletedAt: null,
				type: 'client',
			},
			select: {
				id: true,
				name: true,
				phone: true,
				debt: true,
				createdAt: true,
			},
			orderBy: [{ debt: 'desc' }],
		})

		await ClientUpload(users, payload.res)
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

	async supplierCreate(payload: UserCreateRequest): Promise<UserRetriveResponse> {
		const user = await this.#_prisma.users.findFirst({
			where: { phone: payload.phone },
		})

		if (user && user.deletedAt === null) {
			throw new ForbiddenException('This phone already exists')
		} else if (user && user.createdAt !== null) {
			throw new ForbiddenException('This user deleted')
		}

		const condidate = await this.#_prisma.users.create({
			data: {
				name: payload.name,
				phone: payload.phone,
				type: 'supplier',
				debt: 0,
			},
			select: {
				id: true,
				name: true,
				phone: true,
				debt: true,
				createdAt: true,
			},
		})

		const data = await ReedExcelFile2()
		console.log(data[0])
		console.log(data[2])
		console.log(data[4])
		console.log(data[6])
		// await this.#_prisma.users.createMany({
		// 	data,
		// })

		return {
			...condidate,
			debt: condidate.debt.toNumber(),
		}
	}

	async clientCreate(payload: UserCreateRequest): Promise<UserRetriveResponse> {
		const user = await this.#_prisma.users.findFirst({
			where: { phone: payload.phone },
		})

		if (user && user.deletedAt === null) {
			throw new ForbiddenException('This phone already exists')
		} else if (user && user.createdAt !== null) {
			throw new ForbiddenException('This user deleted')
		}

		const condidate = await this.#_prisma.users.create({
			data: {
				name: payload.name,
				phone: payload.phone,
				type: 'client',
				debt: 0,
			},
			select: {
				id: true,
				name: true,
				phone: true,
				debt: true,
				createdAt: true,
			},
		})

		// const data = await ReedExcelFile2()
		// await this.#_prisma.users.createMany({
		// 	data,
		// })

		return {
			...condidate,
			debt: condidate.debt.toNumber(),
		}
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
