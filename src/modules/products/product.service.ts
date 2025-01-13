import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	ProductCreateRequest,
	ProductDeleteRequest,
	ProductRetriveAllRequest,
	ProductRetriveAllResponse,
	ProductRetriveRequest,
	ProductRetriveResponse,
	ProductUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'

@Injectable()
export class ProductService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async productRetrieveAll(payload: ProductRetriveAllRequest): Promise<ProductRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const productList = await this.#_prisma.products.findMany({
			where: {
				deletedAt: null,
				name: { contains: payload.search, mode: 'insensitive' },
			},
			select: {
				id: true,
				name: true,
				category: true,
				cost: true,
				count: true,
				createdAt: true,
				image: true,
				min_amount: true,
				selling_price: true,
				unit: true,
				wholesale_price: true,
				_count: true,
				orderProducts: {
					where: { order: { accepted: true } },
					take: 1,
					orderBy: { createdAt: 'desc' },
					select: {
						createdAt: true,
					},
				},
			},
			...paginationOptions,
			orderBy: { createdAt: 'desc' },
		})

		const transformedProductList = productList.map((product) => ({
			...product,
			cost: (product.cost as Decimal).toNumber(),
			selling_price: (product.selling_price as Decimal).toNumber(),
			wholesale_price: (product.wholesale_price as Decimal).toNumber(),
			lastSale: product.orderProducts[0].createdAt,
		}))

		const totalCount = await this.#_prisma.products.aggregate({
			where: {
				deletedAt: null,
				name: { contains: payload.search, mode: 'insensitive' },
			},
			_count: { id: true },
			_sum: { count: true, cost: true, selling_price: true },
		})

		const totalCalc = {
			totalProductCount: totalCount._sum.count || 0,
			totalProductCost: totalCount._sum.cost.toNumber() || 0,
			totalProductPrice: totalCount._sum.selling_price.toNumber() || 0,
		}

		return {
			totalCount: totalCount._count.id || 0,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount._count.id / payload.pageSize),
			totalCalc,
			data: transformedProductList,
		}
	}

	async productRetrieve(payload: ProductRetriveRequest): Promise<ProductRetriveResponse> {
		const product = await this.#_prisma.products.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				name: true,
				cost: true,
				count: true,
				createdAt: true,
				min_amount: true,
				selling_price: true,
				unit: true,
				wholesale_price: true,
				image: true,
				category: true,
			},
		})
		if (!product) {
			throw new NotFoundException('Product not found')
		}
		return {
			...product,
			cost: (product.cost as Decimal).toNumber(),
			selling_price: (product.selling_price as Decimal).toNumber(),
			wholesale_price: (product.wholesale_price as Decimal).toNumber(),
		}
	}

	async productCreate(payload: ProductCreateRequest): Promise<null> {
		const product = await this.#_prisma.products.findFirst({
			where: { name: payload.name },
		})
		if (product) throw new ForbiddenException('This product already exists')

		await this.#_prisma.products.create({
			data: {
				name: payload.name,
				cost: payload.cost,
				count: payload.count,
				min_amount: payload.min_amount ?? 0,
				selling_price: payload.selling_price,
				unit: payload.unit || 'dona',
				wholesale_price: payload.wholesale_price ?? 0,
				image: payload.image || null,
				category: payload.category || null,
			},
		})

		return null
	}

	async productUpdate(payload: ProductUpdateRequest): Promise<null> {
		const product = await this.#_prisma.products.findUnique({
			where: { id: payload.id },
		})
		if (!product) throw new NotFoundException('product not found')

		await this.#_prisma.products.update({
			where: { id: payload.id },
			data: {
				name: payload.name,
				cost: payload.cost,
				count: payload.count,
				min_amount: payload.min_amount,
				selling_price: payload.selling_price,
				unit: payload.unit,
				wholesale_price: payload.wholesale_price,
			},
		})

		return null
	}

	async productDelete(payload: ProductDeleteRequest): Promise<null> {
		const product = await this.#_prisma.products.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!product) throw new NotFoundException('product not found')

		await this.#_prisma.products.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
