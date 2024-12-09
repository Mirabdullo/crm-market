import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	OrderCreateRequest,
	OrderDeleteRequest,
	OrderRetriveAllRequest,
	OrderRetriveAllResponse,
	OrderRetriveRequest,
	OrderRetriveResponse,
	OrderUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'

@Injectable()
export class OrderService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async OrderRetrieveAll(payload: OrderRetriveAllRequest): Promise<OrderRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const OrderList = await this.#_prisma.order.findMany({
			where: {
				deletedAt: null,
			},
			select: {
				id: true,
				articl: true,
				sum: true,
				accepted: true,
				createdAt: true,
				client: {
					select: {
						id: true,
						name: true,
						phone: true,
						createdAt: true,
					},
				},
				admin: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
				payment: {
					select: {
						id: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						createdAt: true,
					},
				},
				products: {
					select: {
						id: true,
						cost: true,
						count: true,
						price: true,
						avarage_cost: true,
						createdAt: true,
						product: {
							select: {
								id: true,
								name: true,
								count: true,
							},
						},
					},
				},
			},
			...paginationOptions,
		})

		const formattedData = OrderList.map((order) => ({
			id: order.id,
			articl: order.articl,
			client: order.client,
			sum: order.sum.toNumber(),
			accepted: order.accepted,
			createdAt: order.createdAt,
			seller: order.admin,
			payment: order.payment.map((pay) => {
				return {
					...pay,
					cash: (pay.cash as Decimal).toNumber(),
					card: (pay.card as Decimal).toNumber(),
					transfer: (pay.transfer as Decimal).toNumber(),
					other: (pay.other as Decimal).toNumber(),
				}
			})[0],
			products: order.products.map((prod) => ({
				...prod,
				id: prod.id,
				cost: (prod.cost as Decimal).toNumber(),
				price: (prod.price as Decimal).toNumber(),
				count: prod.count,
				avarage_cost: (prod.avarage_cost as Decimal).toNumber(),
			})),
		}))

		const totalCount = await this.#_prisma.order.count({
			where: {
				deletedAt: null,
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: formattedData,
		}
	}

	async OrderRetrieve(payload: OrderRetriveRequest): Promise<OrderRetriveResponse> {
		const Order = await this.#_prisma.order.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				sum: true,
				articl: true,
				accepted: true,
				createdAt: true,
				client: {
					select: {
						id: true,
						name: true,
						phone: true,
						createdAt: true,
					},
				},
				admin: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
				payment: {
					select: {
						id: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						createdAt: true,
					},
				},
				products: {
					select: {
						id: true,
						cost: true,
						count: true,
						price: true,
						avarage_cost: true,
						createdAt: true,
						product: {
							select: {
								id: true,
								name: true,
								count: true,
							},
						},
					},
				},
			},
		})

		if (!Order) {
			throw new NotFoundException('Order not found')
		}

		return {
			id: Order.id,
			articl: Order.articl,
			seller: Order.admin,
			client: Order.client,
			sum: Order.sum.toNumber(),
			accepted: Order.accepted,
			createdAt: Order.createdAt,
			payment: Order.payment.map((payment) => {
				return {
					...payment,
					cash: (payment.cash as Decimal).toNumber(),
					card: (payment.card as Decimal).toNumber(),
					transfer: (payment.transfer as Decimal).toNumber(),
					other: (payment.other as Decimal).toNumber(),
				}
			})[0],
			products: Order.products.map((prod) => ({
				...prod,
				cost: (prod.cost as Decimal).toNumber(),
				price: (prod.price as Decimal).toNumber(),
				count: prod.count,
				avarage_cost: (prod.avarage_cost as Decimal).toNumber(),
			})),
		}
	}

	async OrderCreate(payload: OrderCreateRequest): Promise<null> {
		try {
			const { clientId, userId, products, accepted, payment } = payload

			// Mijozni tekshirish
			const user = await this.#_prisma.users.findFirst({
				where: { id: clientId, deletedAt: null },
			})
			if (!user) throw new NotFoundException('Mijoz topilmadi')

			// Buyurtma yaratish
			const totalSum = products.reduce((sum, product) => sum + product.price, 0)
			const debt = totalSum - (payment?.card || 0) - (payment?.cash || 0) - (payment?.transfer || 0) - (payment?.other || 0)

			const order = await this.#_prisma.order.create({
				data: {
					clientId,
					adminId: userId,
					sum: totalSum,
					debt,
					accepted,
				},
			})

			// OrderProductlar yaratish uchun
			const orderProductsData = products.map((product) => ({
				orderId: order.id,
				productId: product.product_id,
				cost: product.cost,
				count: product.count,
				price: product.price,
				avarage_cost: product.avarage_cost,
			}))

			const promises = [this.#_prisma.orderProducts.createMany({ data: orderProductsData })]
			await Promise.all(promises)

			// To'lovni boshqarish
			if (payment) {
				this.#_prisma.payment.create({
					data: {
						orderId: order.id,
						clientId,
						card: payment.card,
						cash: payment.cash,
						transfer: payment.transfer,
						other: payment.other,
					},
				})
			}

			if (accepted) {
				const productUpdates = products.map((product) =>
					this.#_prisma.products.update({
						where: { id: product.product_id },
						data: { count: { decrement: product.count } },
					}),
				)

				await Promise.all([
					...productUpdates,
					await this.#_prisma.users.update({
						where: { id: clientId },
						data: { debt: { increment: debt } },
					}),
				])
			}

			return null
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException('Kutilmagan xatolik!')
		}
	}

	async OrderUpdate(payload: OrderUpdateRequest): Promise<null> {
		const order = await this.#_prisma.order.findUnique({
			where: { id: payload.id },
		})
		if (!order) throw new NotFoundException("Ma'lumot topilmadi")

		await this.#_prisma.order.update({
			where: { id: payload.id },
			data: {
				accepted: payload.accepted,
			},
		})

		return null
	}

	async OrderDelete(payload: OrderDeleteRequest): Promise<null> {
		const order = await this.#_prisma.order.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!order) throw new NotFoundException('maxsulot topilmadi')

		await this.#_prisma.order.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
