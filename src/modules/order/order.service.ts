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
import { endOfDay, startOfDay } from 'date-fns'

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

		let sellerOption = {}
		if (payload.sellerId) {
			sellerOption = {
				admin: { id: payload.sellerId },
			}
		}

		let searchOption = {}
		if (payload.search) {
			searchOption = {
				client: {
					OR: [{ name: { contains: payload.search, mode: 'insensitive' } }, { phone: { contains: payload.search, mode: 'insensitive' } }],
				},
			}
		}

		let dateOption = {}
		if (payload.startDate || payload.endDate) {
			dateOption = {
				createdAt: {
					...(payload.startDate ? { gte: startOfDay(new Date(payload.startDate)) } : {}),
					...(payload.endDate ? { lte: endOfDay(new Date(payload.endDate)) } : {}),
				},
			}
		}

		const OrderList = await this.#_prisma.order.findMany({
			where: {
				deletedAt: null,
				...sellerOption,
				...searchOption,
				...dateOption,
			},
			select: {
				id: true,
				articl: true,
				sum: true,
				debt: true,
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
						totalPay: true,
						debt: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						createdAt: true,
					},
				},
				products: {
					where: { deletedAt: null },
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
			orderBy: { createdAt: 'desc' },
			...paginationOptions,
		})

		const formattedData = OrderList.map((order) => ({
			id: order.id,
			articl: order.articl,
			client: order.client,
			sum: order.sum.toNumber(),
			debt: order.debt.toNumber(),
			accepted: order.accepted,
			createdAt: order.createdAt,
			seller: order.admin,
			payment: order.payment.map((pay) => {
				return {
					...pay,
					totalPay: (pay.totalPay as Decimal).toNumber() || 0,
					debt: (pay.debt as Decimal).toNumber() || 0,
					cash: (pay.cash as Decimal).toNumber() || 0,
					card: (pay.card as Decimal).toNumber() || 0,
					transfer: (pay.transfer as Decimal).toNumber() || 0,
					other: (pay.other as Decimal).toNumber() || 0,
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
				...sellerOption,
				...searchOption,
				...dateOption,
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
				debt: true,
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
						totalPay: true,
						debt: true,
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
			debt: Order.debt.toNumber(),
			accepted: Order.accepted,
			createdAt: Order.createdAt,
			payment: Order.payment.map((payment) => {
				return {
					...payment,
					totalPay: (payment.totalPay as Decimal).toNumber() || 0,
					debt: (payment.debt as Decimal).toNumber() || 0,
					cash: (payment.cash as Decimal).toNumber() || 0,
					card: (payment.card as Decimal).toNumber() || 0,
					transfer: (payment.transfer as Decimal).toNumber() || 0,
					other: (payment.other as Decimal).toNumber() || 0,
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
			const totalSum = products.reduce((sum, product) => sum + product.price * product.count, 0)
			const paymentSum = (payment?.card || 0) + (payment?.cash || 0) + (payment?.transfer || 0) + (payment?.other || 0)
			const debt = totalSum - paymentSum

			const order = await this.#_prisma.order.create({
				data: {
					clientId: clientId,
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
				await this.#_prisma.payment.create({
					data: {
						orderId: order.id,
						clientId,
						totalPay: paymentSum,
						debt,
						card: payment?.card || 0,
						cash: payment?.cash || 0,
						transfer: payment?.transfer || 0,
						other: payment?.other || 0,
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
		try {
			const { id, addProducts, removeProducts, payment, accepted } = payload

			const order = await this.#_prisma.order.findUnique({
				where: { id },
				include: { payment: true, products: true },
			})
			if (!order) throw new NotFoundException("Ma'lumot topilmadi")

			const promises: any[] = []

			// Handle added products
			if (addProducts.length && order.accepted) {
				const totalSum = addProducts.reduce((acc, p) => acc + p.price * p.count, 0)

				const mappedAddProducts = addProducts.map((product) => ({
					orderId: order.id,
					productId: product.product_id,
					cost: product.cost,
					count: product.count,
					price: product.price,
					avarage_cost: product.avarage_cost,
				}))

				const updatedProducts = addProducts.map((product) =>
					this.#_prisma.products.update({
						where: { id: product.product_id },
						data: { count: { decrement: product.count } },
					}),
				)

				promises.push(
					this.#_prisma.orderProducts.createMany({ data: mappedAddProducts }),
					...updatedProducts,
					this.#_prisma.order.update({
						where: { id: order.id },
						data: { sum: { increment: totalSum } },
					}),
					this.#_prisma.users.update({
						where: { id: order.clientId },
						data: { debt: { increment: totalSum } },
					}),
				)
			}

			// Handle removed products
			if (removeProducts.length) {
				const totalSum = removeProducts.reduce((acc, p) => acc + p.price * p.count, 0)
				const productIds = removeProducts.map((p) => p.id)

				const updatedProducts = removeProducts.map((product) =>
					this.#_prisma.products.update({
						where: { id: product.product_id },
						data: { count: { increment: product.count } },
					}),
				)

				promises.push(
					...updatedProducts,
					this.#_prisma.orderProducts.updateMany({
						where: { id: { in: productIds } },
						data: { deletedAt: new Date() },
					}),
					this.#_prisma.order.update({
						where: { id: payload.id },
						data: { sum: { decrement: totalSum } },
					}),
					this.#_prisma.users.update({
						where: { id: order.clientId },
						data: { debt: { decrement: totalSum } },
					}),
				)
			}

			// Handle payment updates
			if (payment && Object.keys(payment).length) {
				const paymentSum = (payment.card || 0) + (payment.cash || 0) + (payment.transfer || 0) + (payment.other || 0)

				promises.push(
					this.#_prisma.payment.update({
						where: { id: order.payment[0]?.id },
						data: {
							totalPay: { increment: paymentSum },
							debt: { decrement: paymentSum },
							card: { increment: payment.card || 0 },
							cash: { increment: payment.cash || 0 },
							transfer: { increment: payment.transfer || 0 },
							other: { increment: payment.other || 0 },
						},
					}),
					this.#_prisma.order.update({
						where: { id: order.id },
						data: { debt: { decrement: paymentSum } },
					}),
					this.#_prisma.users.update({
						where: { id: order.clientId },
						data: { debt: { decrement: paymentSum } },
					}),
				)
			}

			// Handle order acceptance
			if (!order.accepted && accepted) {
				const totalSum = order.products.reduce((acc, product) => acc + product.price.toNumber() * product.count, 0)

				const orderProductsUpdates = order.products.map((product) =>
					this.#_prisma.products.update({
						where: { id: product.productId },
						data: { count: { decrement: product.count } },
					}),
				)

				promises.push(
					...orderProductsUpdates,
					this.#_prisma.users.update({
						where: { id: order.clientId },
						data: { debt: { increment: totalSum } },
					}),
				)
			}

			// Execute all promises concurrently
			await Promise.all(promises)

			return null
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException("Kutilmagan xatolik! Qaytadan urinib ko'ring")
		}
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
