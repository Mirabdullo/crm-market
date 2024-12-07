import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	IncomingOrderPaymentCreateRequest,
	IncomingOrderPaymentDeleteRequest,
	IncomingOrderPaymentRetriveAllRequest,
	IncomingOrderPaymentRetriveAllResponse,
	IncomingOrderPaymentRetriveRequest,
	IncomingOrderPaymentRetriveResponse,
	IncomingOrderPaymentUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'

@Injectable()
export class IncomingOrderPaymentService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async incomingOrderPaymentRetrieveAll(payload: IncomingOrderPaymentRetriveAllRequest): Promise<IncomingOrderPaymentRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const incomingOrderPaymentList = await this.#_prisma.incomingOrderPayment.findMany({
			where: {},
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				humo: true,
				createdAt: true,
				order: {
					select: {
						id: true,
						sum: true,
						debt: true,
					},
				},
				client: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
			},
			...paginationOptions,
		})

		const transformedIncomingOrderPaymentList = incomingOrderPaymentList.map((incomingOrderPayment) => ({
			...incomingOrderPayment,
			cash: (incomingOrderPayment.cash as Decimal).toNumber(),
			card: incomingOrderPayment.card ? (incomingOrderPayment.card as Decimal).toNumber() : undefined,
			transfer: (incomingOrderPayment.transfer as Decimal).toNumber(),
			other: (incomingOrderPayment.other as Decimal).toNumber(),
			humo: (incomingOrderPayment.humo as Decimal).toNumber(),
		}))

		const totalCount = await this.#_prisma.incomingOrderPayment.count({
			where: { deletedAt: null },
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedIncomingOrderPaymentList,
		}
	}

	async incomingOrderPaymentRetrieve(payload: IncomingOrderPaymentRetriveRequest): Promise<IncomingOrderPaymentRetriveResponse> {
		const incomingOrderPayment = await this.#_prisma.incomingOrderPayment.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				humo: true,
				createdAt: true,
				order: {
					select: {
						id: true,
						sum: true,
						debt: true,
					},
				},
				client: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
			},
		})
		if (!incomingOrderPayment) {
			throw new NotFoundException('IncomingOrderPayment not found')
		}
		return {
			...incomingOrderPayment,
			cash: (incomingOrderPayment.cash as Decimal).toNumber(),
			card: incomingOrderPayment.card ? (incomingOrderPayment.card as Decimal).toNumber() : undefined,
			transfer: (incomingOrderPayment.transfer as Decimal).toNumber(),
			other: (incomingOrderPayment.other as Decimal).toNumber(),
			humo: (incomingOrderPayment.humo as Decimal).toNumber(),
		}
	}

	async incomingOrderPaymentCreate(payload: IncomingOrderPaymentCreateRequest): Promise<null> {
		const order = await this.#_prisma.order.findFirst({
			where: { id: payload.orderId },
		})
		if (!order) throw new ForbiddenException('This incomingOrderPayment already exists')

		await this.#_prisma.incomingOrderPayment.create({
			data: {
				orderId: payload.orderId,
				clientId: payload.clientId,
				cash: payload.cash,
				transfer: payload.transfer,
				card: payload.card,
				other: payload.other,
				humo: payload.humo,
			},
		})

		return null
	}

	async incomingOrderPaymentUpdate(payload: IncomingOrderPaymentUpdateRequest): Promise<null> {
		const incomingOrderPayment = await this.#_prisma.incomingOrderPayment.findUnique({
			where: { id: payload.id },
		})
		if (!incomingOrderPayment) throw new NotFoundException('incomingOrderPayment not found')

		await this.#_prisma.incomingOrderPayment.update({
			where: { id: payload.id },
			data: {
				cash: payload.cash,
				transfer: payload.transfer,
				card: payload.card,
				other: payload.other,
			},
		})

		return null
	}

	async incomingOrderPaymentDelete(payload: IncomingOrderPaymentDeleteRequest): Promise<null> {
		const incomingOrderPayment = await this.#_prisma.incomingOrderPayment.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!incomingOrderPayment) throw new NotFoundException('incomingOrderPayment not found')

		await this.#_prisma.incomingOrderPayment.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
