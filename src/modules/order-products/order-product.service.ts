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
import { generatePdfBuffer, generatePdfBufferWithProduct } from '../order/format-to-pdf'

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

			this.#_prisma.order.findFirst({
				where: { id: payload.order_id },
				select: {
					id: true,
					sellingDate: true,
					accepted: true,
					articl: true,
					debt: true,
					sum: true,
					clientId: true,
					client: {
						select: {
							name: true,
							chatId: true,
						},
					},
					products: {
						select: {
							id: true,
							cost: true,
							count: true,
							price: true,
							productId: true,
							product: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			}),
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

			const text = `📦 Товар добавлен\n\n✍️ ид заказа: ${order.articl}\n\n💰 сумма: ${(order.sum.toNumber() + payload.price * payload.count).toFixed(1)}\n\n💳 долг: ${
				(order.debt.toNumber() + payload.price * payload.count).toFixed(1)
			}\n\n👨‍💼 клиент: ${order.client.name}`
			await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

			const pdfBuffer = await generatePdfBufferWithProduct(order, {
				name: product.name,
				price: payload.price,
				count: payload.count,
			})

			await this.#_telegram.sendDocument(parseInt(process.env.ORDER_CHANEL_ID), Buffer.from(pdfBuffer), 'order-details.pdf')

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

		const { price = orderProduct.price.toNumber(), count = orderProduct.count } = payload

		const productSum = orderProduct.price.toNumber() * orderProduct.count
		const newSum = price * count
		const orderDifference = newSum - productSum

		await this.#_prisma.$transaction(async (prisma) => {
			await prisma.orderProducts.update({
				where: { id: payload.id },
				data: { price, count },
			})

			await prisma.order.update({
				where: { id: orderProduct.orderId },
				data: { sum: { increment: newSum - productSum }, debt: { increment: newSum - productSum } },
			})

			if (orderProduct.order.accepted) {
				await prisma.products.update({
					where: { id: orderProduct.productId },
					data: { count: { increment: count - orderProduct.count } },
				})

				await prisma.users.update({
					where: { id: orderProduct.order.clientId },
					data: { debt: { increment: newSum - productSum } },
				})

				const text = `Товар обновлено\nид заказа: ${orderProduct.order.articl}\nсумма: ${Number(orderProduct.order.sum.toNumber().toFixed(1)) + orderDifference}\nдолг: ${
					Number(orderProduct.order.debt.toNumber().toFixed(1)) + orderDifference
				}\nклиент: ${orderProduct.order.client.name}\n\nпродукт: ${orderProduct.product.name}\nцена: ${price}\nкол-ва: ${count}`

				await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

				if (payload.sendUser && orderProduct.order.client.chatId) {
					await this.#_telegram.sendMessage(Number(orderProduct.order.client.chatId), text)
				}
			}
		})

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

			const text = `Товар удалено\nид заказа: ${orderProduct.order.articl}\nклиент: ${orderProduct.order.client.name}\n\nпродукт: ${
				orderProduct.product.name
			}\nцена: ${orderProduct.price.toFixed(1)}\nкол-ва: ${orderProduct.count.toFixed(1)}`

			await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

			if (payload.sendUser && orderProduct.order.client.chatId) {
				await this.#_telegram.sendMessage(Number(orderProduct.order.client.chatId), text)
			}
		}

		return null
	}
}
