import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { UserCreateRequest, UserDeleteRequest, UserRetriveAllRequest, UserRetriveAllResponse, UserRetriveRequest, UserRetriveResponse, UserUpdateRequest } from './interfaces'
import { UserTypeEnum } from '@prisma/client'

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

		const userList = await this.#_prisma.users.findMany({
			where: {
				deletedAt: null,
				name: { contains: payload.search, mode: 'insensitive' },
				phone: { contains: payload.search, mode: 'insensitive' },
				type: payload.type as UserTypeEnum,
			},
			...paginationOptions,
			select: {
				id: true,
				name: true,
				phone: true,
				createdAt: true,
			},
			orderBy: [{ createdAt: 'desc' }],
		})

		const totalCount = await this.#_prisma.users.count({
			where: {
				deletedAt: null,
				name: { contains: payload.search, mode: 'insensitive' },
				phone: { contains: payload.search, mode: 'insensitive' },
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: userList,
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
			},
		})
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user
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