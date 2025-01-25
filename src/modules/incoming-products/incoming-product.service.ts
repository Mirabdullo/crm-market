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
import { format } from 'date-fns'
import { TelegramService } from '../telegram'

@Injectable()
export class IncomingProductService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegram: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegram
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
		const [order, product] = await Promise.all([
			this.#_prisma.incomingOrder.findFirst({
				where: { id: payload.incomingOrderId },
				include: { supplier: true },
			}),
			this.#_prisma.products.findFirst({
				where: { id: payload.product_id, deletedAt: null },
			}),
		])
		if (!product || !order) throw new NotFoundException('Maxsulot topilmadi')
		console.log(payload)
		await this.#_prisma.incomingProducts.create({
			data: {
				incomingOrderId: payload.incomingOrderId,
				selling_price: payload.selling_price ?? undefined,
				wholesale_price: payload.wholesale_price ?? undefined,
				productId: payload.product_id,
				cost: payload.cost,
				count: payload.count,
			},
		})

		await this.#_prisma.incomingOrder.update({
			where: { id: order.id },
			data: {
				sum: { increment: payload.cost * payload.count },
				debt: { increment: payload.cost * payload.count },
			},
		})

		if (order.accepted) {
			await this.#_prisma.products.update({
				where: { id: payload.product_id },
				data: {
					count: { increment: payload.count },
					cost: payload.cost,
					selling_price: payload.selling_price,
					wholesale_price: payload.wholesale_price,
				},
			})

			await this.#_prisma.users.update({
				where: { id: order.supplierId },
				data: { debt: { increment: payload.cost * payload.count } },
			})

			const text = `📦 добавлен новый продукт\n💰 сумма: ${order.sum}\n💳 долг: ${order.debt}\n👨‍💼 клиент: ${order.supplier.name}\n\nпродукт: ${product.name}\n💲 цена: ${payload.cost}\n#️⃣ кол-ва: ${payload.count}`
			await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)
		}

		return null
	}

	async incomingProductUpdate(payload: IncomingProductUpdateRequest): Promise<null> {
		const incomingProduct = await this.#_prisma.incomingProducts.findUnique({
			where: { id: payload.id },
			include: { incomingOrder: true },
		})
		if (!incomingProduct) throw new NotFoundException("Ma'lumot topilmadi")

		await this.#_prisma.incomingProducts.update({
			where: { id: payload.id },
			data: {
				cost: payload.cost,
				count: payload.count,
				selling_price: payload.selling_price,
				wholesale_price: payload.wholesale_price,
			},
		})

		const productSum = incomingProduct.cost.toNumber() * incomingProduct.count
		await this.#_prisma.incomingOrder.update({
			where: { id: incomingProduct.incomingOrderId },
			data: {
				sum: { decrement: productSum - payload.cost * payload.count },
				debt: { decrement: productSum - payload.cost * payload.count },
			},
		})

		if (format(incomingProduct.incomingOrder.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
			await this.#_prisma.users.update({
				where: { id: incomingProduct.incomingOrder.supplierId },
				data: { debt: { decrement: productSum - payload.cost * payload.count } },
			})

			await this.#_prisma.products.update({
				where: { id: incomingProduct.productId },
				data: {
					count: { decrement: incomingProduct.count - payload.count },
					cost: payload.cost,
					selling_price: payload.selling_price,
					wholesale_price: payload.wholesale_price,
				},
			})
		}

		return null
	}

	async incomingProductDelete(payload: IncomingProductDeleteRequest): Promise<null> {
		const incomingProduct = await this.#_prisma.incomingProducts.findFirst({
			where: { id: payload.id, deletedAt: null },
			include: { incomingOrder: true },
		})
		console.log(incomingProduct, payload)
		if (!incomingProduct) throw new NotFoundException('maxsulot topilmadi')

		await this.#_prisma.incomingOrder.update({
			where: { id: incomingProduct.incomingOrderId },
			data: {
				sum: { decrement: incomingProduct.cost.toNumber() * incomingProduct.count },
				debt: { decrement: incomingProduct.cost.toNumber() * incomingProduct.count },
			},
		})

		if (incomingProduct.incomingOrder.accepted) {
			await this.#_prisma.users.update({
				where: { id: incomingProduct.incomingOrder.supplierId },
				data: {
					debt: { decrement: incomingProduct.cost.toNumber() * incomingProduct.count },
				},
			})

			await this.#_prisma.products.update({
				where: { id: incomingProduct.productId },
				data: { count: { decrement: incomingProduct.count } },
			})
		}

		await this.#_prisma.incomingProducts.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
