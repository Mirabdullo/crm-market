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

@Injectable()
export class OrderProductService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
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

			this.#_prisma.order.findFirst({ where: { id: payload.order_id } }),
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
						count: product.count + payload.count,
						cost: payload.cost,
					},
				}),
				this.#_prisma.users.update({
					where: { id: order.clientId },
					data: { debt: { increment: payload.price * payload.count } },
				}),
			)
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
				order: { select: { clientId: true, accepted: true } },
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
						data: { sum: { increment: orderDifference } },
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
				}
			})
		}

		return null
	}

	async orderProductDelete(payload: OrderProductDeleteRequest): Promise<null> {
		const orderProduct = await this.#_prisma.orderProducts.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { order: true },
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
		}

		return null
	}
}
