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
			where: { deletedAt: null },
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
			orderBy: { createdAt: 'desc' },
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

		await this.#_prisma.$transaction(async (prisma) => {
			if (sum > 0) {
				await prisma.payment.create({
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
			}

			const updatedProducts = order.products.map((pro) =>
				prisma.products.update({
					where: { id: pro.productId },
					data: { count: { decrement: pro.count } },
				}),
			)
			await Promise.all(updatedProducts)

			if (payload.orderId) {
				const orderSum = sum > order.debt.toNumber() ? 0 : { decrement: sum }
				await prisma.order.update({
					where: { id: orderId },
					data: { debt: orderSum, accepted: true },
				})
			}

			const remainingDebt = order.sum.toNumber() - sum
			if (remainingDebt > 0) {
				await prisma.users.update({
					where: { id: clientId },
					data: { debt: { increment: remainingDebt } },
				})
			}
		})

		return null
	}

	async paymentUpdate(payload: PaymentUpdateRequest): Promise<null> {
		const { id, card, transfer, other, cash, description } = payload

		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id },
			include: { client: true, order: true },
		})
		if (!payment) throw new NotFoundException('payment not found')

		const sum = (card || 0) + (transfer || 0) + (other || 0) + (cash || 0)

		await this.#_prisma.payment.update({
			where: { id: payload.id },
			data: {
				totalPay: sum,
				cash: payload.cash,
				transfer: payload.transfer,
				card: payload.card,
				other: payload.other,
				description: payload.description,
			},
		})

		await this.#_prisma.users.update({
			where: { id: payment.clientId },
			data: { debt: { decrement: sum - payment.totalPay.toNumber() } },
		})

		if (payment.order) {
			if (sum > payment.order.debt.toNumber()) {
				await this.#_prisma.order.update({
					where: { id: payment.order.id },
					data: { debt: { decrement: 0 } },
				})
			} else {
				await this.#_prisma.order.update({
					where: { id: payment.order.id },
					data: { debt: { decrement: sum - payment.totalPay.toNumber() } },
				})
			}
		}

		return null
	}

	async paymentDelete(payload: PaymentDeleteRequest): Promise<null> {
		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { order: true },
		})

		if (!payment) throw new NotFoundException('payment not found')

		await this.#_prisma.payment.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		await this.#_prisma.users.update({
			where: { id: payment.clientId },
			data: { debt: { decrement: payment.totalPay } },
		})

		if (payment.order) {
			await this.#_prisma.order.update({
				where: { id: payment.orderId },
				data: { debt: { increment: payment.totalPay } },
			})
		}

		return null
	}
}
