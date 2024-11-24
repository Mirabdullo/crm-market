import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	PermissionCreateRequest,
	PermissionDeleteRequest,
	PermissionRetriveAllRequest,
	PermissionRetriveAllResponse,
	PermissionRetriveRequest,
	PermissionRetriveResponse,
	PermissionUpdateRequest,
} from './interfaces'

@Injectable()
export class PermissionService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async permissionRetrieveAll(payload: PermissionRetriveAllRequest): Promise<PermissionRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const permissionList = await this.#_prisma.permissions.findMany({
			where: {
				name: { contains: payload.search, mode: 'insensitive' },
			},
			select: {
				id: true,
				name: true,
			},
			...paginationOptions,
		})

		const totalCount = await this.#_prisma.permissions.count({
			where: {
				name: { contains: payload.search, mode: 'insensitive' },
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: permissionList,
		}
	}

	async permissionRetrieveByRoleId(payload: PermissionRetriveRequest): Promise<PermissionRetriveResponse[]> {
		const permission = await this.#_prisma.permissions.findMany({
			where: { role_id: payload.id },
			select: {
				id: true,
				name: true,
			},
		})

		return permission
	}

	async permissionRetrieve(payload: PermissionRetriveRequest): Promise<PermissionRetriveResponse> {
		const permission = await this.#_prisma.permissions.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				name: true,
			},
		})
		if (!permission) {
			throw new NotFoundException('Permission not found')
		}
		return permission
	}

	async permissionCreate(payload: PermissionCreateRequest): Promise<null> {
		const role = await this.#_prisma.roles.findFirst({
			where: { id: payload.role_id },
		})
		if (!role) throw new NotFoundException('Role not found')

		const permission = await this.#_prisma.permissions.findFirst({
			where: { name: payload.name },
		})
		if (permission) throw new ForbiddenException('This permission already exists')

		await this.#_prisma.permissions.create({
			data: {
				role_id: payload.role_id,
				name: payload.name,
			},
		})

		return null
	}

	async permissionUpdate(payload: PermissionUpdateRequest): Promise<null> {
		const permission = await this.#_prisma.permissions.findUnique({
			where: { id: payload.id },
		})
		if (!permission) throw new NotFoundException('permission not found')

		await this.#_prisma.permissions.update({
			where: { id: payload.id },
			data: {
				name: payload.name,
			},
		})

		return null
	}

	async permissionDelete(payload: PermissionDeleteRequest): Promise<null> {
		const permission = await this.#_prisma.permissions.findUnique({
			where: { id: payload.id },
		})

		if (!permission) throw new NotFoundException('permission not found')

		await this.#_prisma.permissions.delete({
			where: { id: payload.id },
		})

		return null
	}
}
