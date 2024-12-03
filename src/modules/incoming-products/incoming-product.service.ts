import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	IncomingProductCreateRequest,
	IncomingProductDeleteRequest,
	IncomingProductRetriveAllRequest,
	IncomingProductRetriveAllResponse,
	IncomingProductRetriveRequest,
	IncomingProductRetriveResponse,
	IncomingProductUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'

@Injectable()
export class IncomingProductService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async incomingProductRetrieveAll(payload: IncomingProductRetriveAllRequest): Promise<IncomingProductRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const incomingProductList = await this.#_prisma.incomingProducts.findMany({
			where: {
				deletedAt: null,
			},
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
						createdAt: true,
					},
				},
			},
			...paginationOptions,
		})

		const transformedIncomingProductList = incomingProductList.map((incomingProduct) => ({
			...incomingProduct,
			cost: (incomingProduct.cost as Decimal).toNumber(),
			selling_price: (incomingProduct.selling_price as Decimal).toNumber(),
			wholesale_price: (incomingProduct.wholesale_price as Decimal).toNumber(),
			product: {
				...incomingProduct.product,
			},
		}))

		const totalCount = await this.#_prisma.incomingProducts.count({
			where: {
				deletedAt: null,
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedIncomingProductList,
		}
	}

	async incomingProductRetrieve(payload: IncomingProductRetriveRequest): Promise<IncomingProductRetriveResponse> {
		const incomingProduct = await this.#_prisma.incomingProducts.findUnique({
			where: { id: payload.id },
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
						createdAt: true,
					},
				},
			},
		})
		if (!incomingProduct) {
			throw new NotFoundException('IncomingProduct not found')
		}
		return {
			...incomingProduct,
			cost: (incomingProduct.cost as Decimal).toNumber(),
			selling_price: (incomingProduct.selling_price as Decimal).toNumber(),
			wholesale_price: (incomingProduct.wholesale_price as Decimal).toNumber(),
			product: {
				...incomingProduct.product,
				id: incomingProduct.product.id,
				name: incomingProduct.product.name,
				count: incomingProduct.product.count,
			},
		}
	}

	async incomingProductCreate(payload: IncomingProductCreateRequest): Promise<null> {
		const product = await this.#_prisma.products.findFirst({
			where: { id: payload.product_id, deletedAt: null },
		})
		if (!product) throw new NotFoundException('Maxsulot topilmadi')

		await this.#_prisma.incomingProducts.create({
			data: {
				incomingOrderId: payload.incomingOrderId,
				selling_price: payload.selling_price,
				wholesale_price: payload.wholesale_price,
				productId: payload.product_id,
				cost: payload.cost,
				count: payload.count,
			},
		})

		await this.#_prisma.products.update({
			where: { id: payload.product_id },
			data: {
				avarage_cost: (product.count * product.cost.toNumber() + payload.cost * payload.count) / (product.count + payload.count),
				count: product.count + payload.count,
				cost: payload.cost,
			},
		})

		return null
	}

	async incomingProductUpdate(payload: IncomingProductUpdateRequest): Promise<null> {
		const incomingProduct = await this.#_prisma.incomingProducts.findUnique({
			where: { id: payload.id },
		})
		if (!incomingProduct) throw new NotFoundException("Ma'lumot topilmadi")

		await this.#_prisma.incomingProducts.update({
			where: { id: payload.id },
			data: {
				cost: payload.cost,
				count: payload.count,
			},
		})

		return null
	}

	async incomingProductDelete(payload: IncomingProductDeleteRequest): Promise<null> {
		const incomingProduct = await this.#_prisma.incomingProducts.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!incomingProduct) throw new NotFoundException('maxsulot topilmadi')

		await this.#_prisma.incomingProducts.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
