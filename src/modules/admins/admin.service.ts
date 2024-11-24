import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import * as bcrypt from 'bcrypt'
import { AdminCreateRequest, AdminDeleteRequest, AdminRetriveAllRequest, AdminRetriveAllResponse, AdminRetriveRequest, AdminRetriveResponse, AdminUpdateRequest } from './interfaces'

@Injectable()
export class AdminService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async adminRetrieveAll(payload: AdminRetriveAllRequest): Promise<AdminRetriveAllResponse> {
		const adminList = await this.#_prisma.admins.findMany({
			where: {
				deletedAt: null,
				name: { contains: payload.search, mode: 'insensitive' },
				phone: { contains: payload.search, mode: 'insensitive' },
			},
			take: payload.pageSize,
			skip: (payload.pageNumber - 1) * payload.pageSize,
			select: {
				id: true,
				name: true,
				phone: true,
				role: true,
				createdAt: true,
			},
			orderBy: [{ createdAt: 'desc' }],
		})

		const totalCount = await this.#_prisma.admins.count({
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
			data: adminList,
		}
	}

	async adminRetrieve(payload: AdminRetriveRequest): Promise<AdminRetriveResponse> {
		const admin = await this.#_prisma.admins.findUnique({
			where: { id: payload.id, deletedAt: null },
			select: {
				id: true,
				name: true,
				phone: true,
				role: true,
				createdAt: true,
				permissions: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})
		if (!admin) {
			throw new NotFoundException('Admin not found')
		}
		return admin
	}

	async adminCreate(payload: AdminCreateRequest): Promise<null> {
		const admin = await this.#_prisma.admins.findFirst({
			where: {phone: payload.phone,}
		})

		if (admin && admin.deletedAt === null) {
			throw new ForbiddenException('This phone already exists')
		} else if (admin && admin.createdAt !== null) { 
			throw new ForbiddenException('This user deleted')
		}

		const hashedPassword = await bcrypt.hash(payload.password, 7)

		await this.#_prisma.admins.create({
			data: {
				name: payload.name,
				phone: payload.phone,
				password: hashedPassword,
			},
		})

		return null
	}

	async adminUpdate(payload: AdminUpdateRequest): Promise<null> {
		const admin = await this.#_prisma.admins.findUnique({
			where: {id: payload.id}
		})

		if (!admin) throw new NotFoundException('admin not found')

		await this.#_prisma.admins.update({
			where: { id: payload.id, deletedAt: null },
			data: {
				name: payload.name,
				phone: payload.phone,
			},
		})

		return null
	}

	async adminDelete(payload: AdminDeleteRequest): Promise<null> {
		const admin = await this.#_prisma.admins.findUnique({
			where: {id: payload.id}
		})

		if (!admin) throw new NotFoundException('admin not found')

		await this.#_prisma.admins.update({
			where: { id: payload.id, deletedAt: null },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
