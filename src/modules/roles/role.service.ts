import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { RoleCreateRequest, RoleDeleteRequest, RoleRetriveAllRequest, RoleRetriveAllResponse, RoleRetriveRequest, RoleRetriveResponse, RoleUpdateRequest } from './interfaces'

@Injectable()
export class RoleService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async roleRetrieveAll(payload: RoleRetriveAllRequest): Promise<RoleRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const roleList = await this.#_prisma.roles.findMany({
			where: {
				name: { contains: payload.search, mode: 'insensitive' },
			},
			select: {
				id: true,
				name: true,
			},
			...paginationOptions
		})

		const totalCount = await this.#_prisma.roles.count({
			where: {
				name: { contains: payload.search, mode: 'insensitive' },
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: roleList,
		}
	}

	async roleRetrieve(payload: RoleRetriveRequest): Promise<RoleRetriveResponse> {
		const role = await this.#_prisma.roles.findUnique({
			where: { id: payload.id},
			select: {
				id: true,
				name: true,
			},
		})
		if (!role) {
			throw new NotFoundException('Role not found')
		}
		return role
	}

	async roleCreate(payload: RoleCreateRequest): Promise<null> {
		const role = await this.#_prisma.roles.findFirst({
			where: {name: payload.name,}
		})

		if (role ) {
			throw new ForbiddenException('This role already exists')
		}

		await this.#_prisma.roles.create({
			data: {
				name: payload.name,
			},
		})

		return null
	}

	async roleUpdate(payload: RoleUpdateRequest): Promise<null> {
		const role = await this.#_prisma.roles.findUnique({
			where: {id: payload.id}
		})

		if (!role) throw new NotFoundException('role not found')

		await this.#_prisma.roles.update({
			where: { id: payload.id },
			data: {
				name: payload.name,
			},
		})

		return null
	}

	async roleDelete(payload: RoleDeleteRequest): Promise<null> {
		const role = await this.#_prisma.roles.findUnique({
			where: {id: payload.id}
		})

		if (!role) throw new NotFoundException('role not found')

		await this.#_prisma.roles.delete({
			where: { id: payload.id },
		})

		return null
	}
}
