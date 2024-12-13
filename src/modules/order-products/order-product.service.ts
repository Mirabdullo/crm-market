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
					cost: payload.cost,
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
		})
		if (!orderProduct) throw new NotFoundException("Ma'lumot topilmadi")

		await this.#_prisma.orderProducts.update({
			where: { id: payload.id },
			data: {
				cost: payload.cost,
				count: payload.count,
			},
		})

		return null
	}

	async orderProductDelete(payload: OrderProductDeleteRequest): Promise<null> {
		const orderProduct = await this.#_prisma.orderProducts.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!orderProduct) throw new NotFoundException('maxsulot topilmadi')

		await this.#_prisma.orderProducts.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
