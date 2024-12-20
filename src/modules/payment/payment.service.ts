import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	PaymentCreateRequest,
	PaymentDeleteRequest,
	PaymentRetriveAllRequest,
	PaymentRetriveAllResponse,
	PaymentRetriveRequest,
	PaymentRetriveResponse,
	PaymentUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'

@Injectable()
export class PaymentService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async paymentRetrieveAll(payload: PaymentRetriveAllRequest): Promise<PaymentRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const paymentList = await this.#_prisma.payment.findMany({
			where: {},
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				createdAt: true,
				description: true,
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

		const transformedPaymentList = paymentList.map((payment) => ({
			...payment,
			cash: (payment.cash as Decimal).toNumber(),
			card: payment.card ? (payment.card as Decimal).toNumber() : undefined,
			transfer: (payment.transfer as Decimal).toNumber(),
			other: (payment.other as Decimal).toNumber(),
		}))

		const totalCount = await this.#_prisma.payment.count({
			where: { deletedAt: null },
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedPaymentList,
		}
	}

	async paymentRetrieve(payload: PaymentRetriveRequest): Promise<PaymentRetriveResponse> {
		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				description: true,
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
		if (!payment) {
			throw new NotFoundException('Payment not found')
		}
		return {
			...payment,
			cash: (payment.cash as Decimal).toNumber(),
			card: payment.card ? (payment.card as Decimal).toNumber() : undefined,
			transfer: (payment.transfer as Decimal).toNumber(),
			other: (payment.other as Decimal).toNumber(),
		}
	}

	async paymentCreate(payload: PaymentCreateRequest): Promise<null> {
		const { card, transfer, other, cash, orderId, clientId, description } = payload
		const order = await this.#_prisma.order.findFirst({
			where: { id: orderId },
			include: { products: true },
		})
		if (!order) throw new ForbiddenException('This payment already exists')

		const sum = (card || 0) + (transfer || 0) + (other || 0) + (cash || 0)
		if (sum > 0) {
			await this.#_prisma.payment.create({
				data: {
					orderId: payload.orderId,
					clientId: payload.clientId,
					cash: payload.cash,
					transfer: payload.transfer,
					card: payload.card,
					other: payload.other,
					description: payload.description,
				},
			})

			await this.#_prisma.order.update({
				where: { id: orderId },
				data: { debt: { decrement: sum }, accepted: true },
			})

			await this.#_prisma.users.update({
				where: { id: clientId },
				data: { debt: { increment: order.sum.toNumber() - sum } },
			})

			const updatedProducts = order.products.map((pro) =>
				this.#_prisma.products.update({
					where: { id: pro.productId },
					data: { count: { decrement: pro.count } },
				}),
			)
		}

		return null
	}

	async paymentUpdate(payload: PaymentUpdateRequest): Promise<null> {
		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id },
		})
		if (!payment) throw new NotFoundException('payment not found')

		await this.#_prisma.payment.update({
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

	async paymentDelete(payload: PaymentDeleteRequest): Promise<null> {
		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!payment) throw new NotFoundException('payment not found')

		await this.#_prisma.payment.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
