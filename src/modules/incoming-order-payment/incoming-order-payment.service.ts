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
import { format } from 'date-fns'

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
				supplier: {
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
				supplier: {
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
		const { orderId, supplierId, cash, transfer, card, other } = payload
		const order = orderId
			? await this.#_prisma.incomingOrder.findFirst({
					where: { id: orderId },
			  })
			: null

		const client = await this.#_prisma.users.findFirst({
			where: { id: supplierId },
		})
		console.log('client: ', client)
		if (!client) throw new ForbiddenException('Mijoz topilmadi')
		if (orderId && !order) throw new ForbiddenException('Mahsulot tushiruvi topilmadi')

		const sum = (cash || 0) + (card || 0) + (transfer || 0) + (other || 0)
		await this.#_prisma.incomingOrderPayment.create({
			data: {
				orderId: orderId || null, // Order bo‘lmasa null
				supplierId,
				totalPay: sum,
				cash: cash || 0,
				transfer: transfer || 0,
				card: card || 0,
				other: other || 0,
			},
		})

		const promises = []

		// Agar order mavjud bo'lsa, orderning qarzini yangilash
		if (order) {
			const pSum = order.debt.toNumber() >= sum ? { decrement: sum } : 0
			promises.push(
				this.#_prisma.incomingOrder.update({
					where: { id: orderId },
					data: {
						debt: pSum, // Orderning qarzi kamayadi
					},
				}),
			)

			// Agar order tasdiqlangan bo'lsa, mijozning qarzi o'zgaradi
			if (format(order.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
				console.log('sum: ', sum, supplierId)
				console.log('sum: ', sum, supplierId)
				console.log('supplier: ', supplierId)
				promises.push(
					this.#_prisma.users.update({
						where: { id: supplierId },
						data: {
							debt: { decrement: sum },
						},
					}),
				)
			}
		} else {
			// Agar order yo'q bo'lsa, faqat mijozning qarzi o'zgaradi
			promises.push(
				this.#_prisma.users.update({
					where: { id: supplierId },
					data: {
						debt: { decrement: sum },
					},
				}),
			)
		}

		await Promise.all(promises)

		return null
	}

	async incomingOrderPaymentUpdate(payload: IncomingOrderPaymentUpdateRequest): Promise<null> {
		const { id, cash, transfer, card, other } = payload

		const payment = await this.#_prisma.incomingOrderPayment.findFirst({
			where: { id },
		})
		if (!payment) throw new NotFoundException("To'lov topilmadi")

		const order = payment.orderId
			? await this.#_prisma.incomingOrder.findFirst({
					where: { id: payment.orderId },
			  })
			: null

		const client = await this.#_prisma.users.findFirst({
			where: { id: payment.supplierId },
		})

		if (!client) throw new NotFoundException('Mijoz topilmadi')
		if (payment.orderId && !order) throw new NotFoundException('Mahsulot tushiruvi topilmadi')

		const newSum = (cash || 0) + (card || 0) + (transfer || 0) + (other || 0)
		const previousSum = payment.totalPay.toNumber()
		const difference = newSum - previousSum

		const promises = []

		// To'lovni yangilash
		promises.push(
			this.#_prisma.incomingOrderPayment.update({
				where: { id },
				data: {
					totalPay: newSum,
					cash: cash || 0,
					transfer: transfer || 0,
					card: card || 0,
					other: other || 0,
				},
			}),
		)

		// Agar order mavjud bo'lsa, uning qarzini yangilash
		if (order) {
			const pSum = order.debt.toNumber() >= newSum - payment.totalPay.toNumber() ? -difference : 0
			promises.push(
				this.#_prisma.incomingOrder.update({
					where: { id: payment.orderId },
					data: {
						debt: { increment: pSum }, // Orderning qarz qiymatini farq bo'yicha yangilash
					},
				}),
			)

			// Agar order tasdiqlangan bo'lsa, mijozning qarzini yangilash
			if (format(order.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
				promises.push(
					this.#_prisma.users.update({
						where: { id: payment.orderId },
						data: {
							debt: { increment: -difference }, // Mijozning qarz qiymatini farq bo'yicha yangilash
						},
					}),
				)
			}
		} else {
			// Agar order yo'q bo'lsa, faqat mijozning qarzini yangilash
			promises.push(
				this.#_prisma.users.update({
					where: { id: payment.supplierId },
					data: {
						debt: { increment: -difference }, // Mijozning qarz qiymatini farq bo'yicha yangilash
					},
				}),
			)
		}

		await Promise.all(promises)
		return null
	}

	async incomingOrderPaymentDelete(payload: IncomingOrderPaymentDeleteRequest): Promise<null> {
		const payment = await this.#_prisma.incomingOrderPayment.findFirst({
			where: { id: payload.id },
		})

		if (!payment) throw new NotFoundException("To'lov topilmadi")

		const order = payment.orderId
			? await this.#_prisma.incomingOrder.findFirst({
					where: { id: payment.orderId },
			  })
			: null

		const client = await this.#_prisma.users.findFirst({
			where: { id: payment.supplierId },
		})

		if (!client) throw new NotFoundException('Mijoz topilmadi')

		const promises = []

		// Agar order mavjud bo'lsa, uning qarzini yangilash
		if (order) {
			promises.push(
				this.#_prisma.incomingOrder.update({
					where: { id: payment.orderId },
					data: {
						debt: { increment: payment.totalPay.toNumber() }, // To'lov summasini qaytarish
					},
				}),
			)

			// Agar order tasdiqlangan bo'lsa, mijozning qarzini yangilash
			if (format(order.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
				promises.push(
					this.#_prisma.users.update({
						where: { id: payment.supplierId },
						data: {
							debt: { increment: payment.totalPay.toNumber() }, // To'lov summasini qaytarish
						},
					}),
				)
			}
		} else {
			// Agar order yo'q bo'lsa, faqat mijozning qarzini yangilash
			promises.push(
				this.#_prisma.users.update({
					where: { id: payment.supplierId },
					data: {
						debt: { increment: payment.totalPay.toNumber() }, // To'lov summasini qaytarish
					},
				}),
			)
		}

		// To'lovni o'chirish
		promises.push(
			this.#_prisma.incomingOrderPayment.delete({
				where: { id: payload.id },
			}),
		)

		await Promise.all(promises)

		return null
	}
}
