import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	IncomingOrderCreateRequest,
	IncomingOrderDeleteRequest,
	IncomingOrderRetriveAllRequest,
	IncomingOrderRetriveAllResponse,
	IncomingOrderRetriveRequest,
	IncomingOrderRetriveResponse,
	IncomingOrderUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'

@Injectable()
export class IncomingOrderService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async incomingOrderRetrieveAll(payload: IncomingOrderRetriveAllRequest): Promise<IncomingOrderRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const incomingOrderList = await this.#_prisma.incomingOrder.findMany({
			where: {
				deletedAt: null,
			},
			select: {
				id: true,
				sum: true,
				accepted: true,
				createdAt: true,
				supplier: {
					select: {
						id: true,
						name: true,
						phone: true,
						createdAt: true,
					},
				},
				incomingProducts: {
					select: {
						id: true,
						cost: true,
						count: true,
						createdAt: true,
						selling_price: true,
						wholesale_price: true,
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

		const formattedData = incomingOrderList.map((order) => ({
			...order,
			sum: order.sum.toNumber(),
			accepted: order.accepted,
			createdAt: order.createdAt,
			supplier: {
				id: order.supplier.id,
				name: order.supplier.name,
				phone: order.supplier.phone,
				createdAt: order.supplier.createdAt,
			},
			incomingProducts: order.incomingProducts.map((incomingProduct) => ({
				id: incomingProduct.id,
				cost: incomingProduct.cost.toNumber(),
				count: incomingProduct.count,
				createdAt: incomingProduct.createdAt,
				selling_price: incomingProduct.selling_price.toNumber(),
				wholesale_price: incomingProduct.wholesale_price.toNumber(),
				product: {
					id: incomingProduct.product.id,
					name: incomingProduct.product.name,
					count: incomingProduct.product.count,
				},
			})),
		}))

		const totalCount = await this.#_prisma.incomingOrder.count({
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

	async incomingOrderRetrieve(payload: IncomingOrderRetriveRequest): Promise<IncomingOrderRetriveResponse> {
		const incomingOrder = await this.#_prisma.incomingOrder.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				sum: true,
				accepted: true,
				createdAt: true,
				supplier: {
					select: {
						id: true,
						name: true,
						phone: true,
						createdAt: true,
					},
				},
				incomingProducts: {
					select: {
						id: true,
						cost: true,
						count: true,
						createdAt: true,
						selling_price: true,
						wholesale_price: true,
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

		if (!incomingOrder) {
			throw new NotFoundException('IncomingOrder not found')
		}

		return {
			...incomingOrder,
			sum: incomingOrder.sum.toNumber(),
			accepted: incomingOrder.accepted,
			createdAt: incomingOrder.createdAt,
			supplier: {
				id: incomingOrder.supplier.id,
				name: incomingOrder.supplier.name,
				phone: incomingOrder.supplier.phone,
				createdAt: incomingOrder.supplier.createdAt,
			},
			incomingProducts: incomingOrder.incomingProducts.map((incomingProduct) => ({
				id: incomingProduct.id,
				cost: incomingProduct.cost.toNumber(),
				count: incomingProduct.count,
				createdAt: incomingProduct.createdAt,
				selling_price: incomingProduct.selling_price.toNumber(),
				wholesale_price: incomingProduct.wholesale_price.toNumber(),
				product: {
					id: incomingProduct.product.id,
					name: incomingProduct.product.name,
					count: incomingProduct.product.count,
				},
			})),
		}
	}

	async incomingOrderCreate(payload: IncomingOrderCreateRequest): Promise<null> {
		const user = await this.#_prisma.users.findFirst({
			where: { id: payload.supplierId, deletedAt: null },
		})
		if (!user) throw new NotFoundException('Yetkazib beruvchi topilmadi')

		const order = await this.#_prisma.incomingOrder.create({
			data: {
				supplierId: payload.supplierId,
				sum: payload.sum,
				accepted: payload.accepted,
			},
		})

		const products = payload.products.map((product) => {
			return {
				incomingOrderId: order.id,
				productId: product.product_id,
				cost: product.cost,
				count: product.count,
				selling_price: product.selling_price,
				wholesale_price: product.wholesale_price,
			}
		})

		await this.#_prisma.incomingProducts.createMany({
			data: products,
		})

		return null
	}

	async incomingOrderUpdate(payload: IncomingOrderUpdateRequest): Promise<null> {
		const incomingOrder = await this.#_prisma.incomingOrder.findUnique({
			where: { id: payload.id },
		})
		if (!incomingOrder) throw new NotFoundException("Ma'lumot topilmadi")

		await this.#_prisma.incomingOrder.update({
			where: { id: payload.id },
			data: {
				accepted: payload.accepted,
			},
		})

		return null
	}

	async incomingOrderDelete(payload: IncomingOrderDeleteRequest): Promise<null> {
		const incomingOrder = await this.#_prisma.incomingOrder.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!incomingOrder) throw new NotFoundException('maxsulot topilmadi')

		await this.#_prisma.incomingOrder.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
