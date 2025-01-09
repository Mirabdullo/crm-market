import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	OrderProductCreateRequest,
	OrderProductDeleteRequest,
	OrderProductRetriveAllRequest,
	OrderProductRetriveAllResponse,
	OrderProductRetriveRequest,
	OrderProductRetriveResponse,
	OrderProductUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import { TelegramService } from '../telegram'

@Injectable()
export class OrderProductService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegram: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegram
	}

	async orderProductRetrieveAll(payload: OrderProductRetriveAllRequest): Promise<OrderProductRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const orderProductList = await this.#_prisma.orderProducts.findMany({
			where: {
				deletedAt: null,
			},
			select: {
				id: true,
				cost: true,
				price: true,
				count: true,
				createdAt: true,
				product: {
					select: {
						id: true,
						name: true,
						count: true,
						createdAt: true,
					},
				},
			},
			...paginationOptions,
		})

		const transformedOrderProductList = orderProductList.map((orderProduct) => ({
			...orderProduct,
			cost: (orderProduct.cost as Decimal).toNumber(),
			price: (orderProduct.price as Decimal).toNumber(),
			product: {
				...orderProduct.product,
			},
		}))

		const totalCount = await this.#_prisma.orderProducts.count({
			where: {
				deletedAt: null,
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedOrderProductList,
		}
	}

	async orderProductRetrieve(payload: OrderProductRetriveRequest): Promise<OrderProductRetriveResponse> {
		const orderProduct = await this.#_prisma.orderProducts.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				cost: true,
				price: true,
				count: true,
				createdAt: true,
				product: {
					select: {
						id: true,
						name: true,
						count: true,
						createdAt: true,
					},
				},
			},
		})
		if (!orderProduct) {
			throw new NotFoundException('OrderProduct not found')
		}
		return {
			...orderProduct,
			cost: (orderProduct.cost as Decimal).toNumber(),
			price: (orderProduct.price as Decimal).toNumber(),
			product: {
				...orderProduct.product,
				id: orderProduct.product.id,
				name: orderProduct.product.name,
				count: orderProduct.product.count,
			},
		}
	}

	async orderProductCreate(payload: OrderProductCreateRequest): Promise<null> {
		const [product, order] = await Promise.all([
			this.#_prisma.products.findFirst({
				where: { id: payload.product_id, deletedAt: null },
			}),

			this.#_prisma.order.findFirst({ where: { id: payload.order_id }, include: { client: true } }),
		])
		if (!product || !order) throw new NotFoundException('Maxsulot yoki sotuv topilmadi')

		const promises = []

		promises.push(
			this.#_prisma.orderProducts.create({
				data: {
					orderId: payload.order_id,
					productId: payload.product_id,
					cost: 0,
					price: payload.price,
					count: payload.count,
				},
			}),
			this.#_prisma.order.update({
				where: { id: payload.order_id },
				data: { sum: { increment: payload.price * payload.count }, debt: { increment: payload.price * payload.count } },
			}),
		)

		if (order.accepted) {
			promises.push(
				this.#_prisma.products.update({
					where: { id: payload.product_id },
					data: {
						count: { decrement: payload.count },
					},
				}),
				this.#_prisma.users.update({
					where: { id: order.clientId },
					data: { debt: { increment: payload.price * payload.count } },
				}),
			)

			const text = `Товар добавлен\nид заказа: ${order.articl}\nсумма: ${order.sum.toNumber() + payload.price * payload.count}\nдолг: ${
				order.debt.toNumber() + payload.price * payload.count
			}\nклиент: ${order.client.name}\n\nпродукт: ${product.name}\nцена: ${payload.price}\nкол-ва: ${payload.count}`

			await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

			if (payload.sendUser && order.client.chatId) {
				await this.#_telegram.sendMessage(Number(order.client.chatId), text)
			}
		}

		await Promise.all(promises)

		return null
	}

	async orderProductUpdate(payload: OrderProductUpdateRequest): Promise<null> {
		const orderProduct = await this.#_prisma.orderProducts.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				cost: true,
				count: true,
				price: true,
				orderId: true,
				productId: true,
				order: { include: { client: true } },
				product: true,
			},
		})
		if (!orderProduct) throw new NotFoundException("Ma'lumot topilmadi")

		const changes: Partial<typeof payload> = {}
		if (payload.price !== orderProduct.price.toNumber()) {
			changes.price = payload.price
		}
		if (payload.count !== orderProduct.count) {
			changes.count = payload.count
		}

		// Agar o'zgarishlar bo'lsa, davom etamiz
		if (Object.keys(changes).length) {
			const newPrice = changes.price ?? orderProduct.price.toNumber()
			const newCount = changes.count ?? orderProduct.count
			const newSum = newPrice * newCount
			const currentSum = orderProduct.price.toNumber() * orderProduct.count

			const orderDifference = newSum - currentSum
			const countDifference = changes.count ? newCount - orderProduct.count : 0

			await this.#_prisma.$transaction(async (prisma) => {
				// `orderProducts`ni yangilash
				await prisma.orderProducts.update({
					where: { id: payload.id },
					data: changes,
				})

				// `order`ning `sum` qiymatini yangilash
				if (orderDifference !== 0) {
					await prisma.order.update({
						where: { id: orderProduct.orderId },
						data: { sum: { increment: orderDifference }, debt: { increment: orderDifference } },
					})

					// `client`ning `debt` qiymatini yangilash
				}

				// `product`ning `count` qiymatini yangilash (faqat order `accepted` bo'lsa)
				if (countDifference !== 0 && orderProduct.order.accepted) {
					await prisma.products.update({
						where: { id: orderProduct.productId },
						data: { count: { decrement: countDifference } },
					})

					await prisma.users.update({
						where: { id: orderProduct.order.clientId },
						data: { debt: { increment: orderDifference } },
					})

					const text = `Товар обновлено\nид заказа: ${orderProduct.order.articl}\nсумма: ${orderProduct.order.sum.toNumber() + orderDifference}\nдолг: ${
						orderProduct.order.debt.toNumber() + orderDifference
					}\nклиент: ${orderProduct.order.client.name}\n\nпродукт: ${orderProduct.product.name}\nцена: ${newPrice}\nкол-ва: ${newCount}`

					await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

					if (payload.sendUser && orderProduct.order.client.chatId) {
						await this.#_telegram.sendMessage(Number(orderProduct.order.client.chatId), text)
					}
				}
			})
		}

		return null
	}

	async orderProductDelete(payload: OrderProductDeleteRequest): Promise<null> {
		const orderProduct = await this.#_prisma.orderProducts.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { order: { include: { client: true } }, product: true },
		})

		if (!orderProduct) throw new NotFoundException('maxsulot topilmadi')

		const sum = orderProduct.price.toNumber() * orderProduct.count
		await Promise.all([
			this.#_prisma.orderProducts.update({
				where: { id: payload.id },
				data: { deletedAt: new Date() },
			}),
			this.#_prisma.order.update({
				where: { id: orderProduct.orderId },
				data: {
					sum: { decrement: sum },
					debt: { decrement: sum },
				},
			}),
		])

		if (orderProduct.order.accepted) {
			await Promise.all([
				this.#_prisma.products.update({
					where: { id: orderProduct.productId },
					data: { count: { increment: orderProduct.count } },
				}),
				this.#_prisma.users.update({
					where: { id: orderProduct.order.clientId },
					data: { debt: { decrement: sum } },
				}),
			])

			const text = `Товар удалено\nид заказа: ${orderProduct.order.articl}\nклиент: ${orderProduct.order.client.name}\n\nпродукт: ${orderProduct.product.name}\nцена: ${orderProduct.price}\nкол-ва: ${orderProduct.count}`

			await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

			if (payload.sendUser && orderProduct.order.client.chatId) {
				await this.#_telegram.sendMessage(Number(orderProduct.order.client.chatId), text)
			}
		}

		return null
	}
}
