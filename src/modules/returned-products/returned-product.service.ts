import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	ReturnedProductCreateRequest,
	ReturnedProductDeleteRequest,
	ReturnedProductRetriveAllRequest,
	ReturnedProductRetriveAllResponse,
	ReturnedProductRetriveRequest,
	ReturnedProductRetriveResponse,
	ReturnedProductUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import { TelegramService } from '../telegram'

@Injectable()
export class ReturnedProductService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegram: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegram
	}

	async returnedProductRetrieveAll(payload: ReturnedProductRetriveAllRequest): Promise<ReturnedProductRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const returnedProductList = await this.#_prisma.returnedProduct.findMany({
			where: {
				deletedAt: null,
			},
			select: {
				id: true,
				price: true,
				count: true,
				createdAt: true,
				product: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			...paginationOptions,
		})

		const transformedReturnedProductList = returnedProductList.map((returnedProduct) => ({
			...returnedProduct,
			price: (returnedProduct.price as Decimal).toNumber(),
		}))

		const totalCount = await this.#_prisma.returnedProduct.count({
			where: {
				deletedAt: null,
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedReturnedProductList,
		}
	}

	async returnedProductRetrieve(payload: ReturnedProductRetriveRequest): Promise<ReturnedProductRetriveResponse> {
		const returnedProduct = await this.#_prisma.returnedProduct.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				price: true,
				count: true,
				createdAt: true,
				product: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})
		if (!returnedProduct) {
			throw new NotFoundException('ReturnedProduct not found')
		}
		return {
			...returnedProduct,
			price: (returnedProduct.price as Decimal).toNumber(),
		}
	}

	async returnedProductCreate(payload: ReturnedProductCreateRequest): Promise<null> {
		const [product, order] = await Promise.all([
			this.#_prisma.products.findFirst({
				where: { id: payload.product_id, deletedAt: null },
			}),

			this.#_prisma.returnedOrder.findFirst({ where: { id: payload.order_id }, include: { client: true } }),
		])
		if (!product || !order) throw new NotFoundException('Maxsulot yoki sotuv topilmadi')

		const promises = []

		promises.push(
			this.#_prisma.returnedProduct.create({
				data: {
					orderId: payload.order_id,
					productId: payload.product_id,
					price: payload.price,
					count: payload.count,
				},
			}),
			this.#_prisma.returnedOrder.update({
				where: { id: payload.order_id },
				data: { sum: { increment: payload.price * payload.count } },
			}),
		)

		if (order.accepted) {
			promises.push(
				this.#_prisma.products.update({
					where: { id: payload.product_id },
					data: {
						count: { increment: payload.count },
					},
				})
			)
		}

		await Promise.all(promises)

		return null
	}

	async returnedProductUpdate(payload: ReturnedProductUpdateRequest): Promise<null> {
		const returnedProduct = await this.#_prisma.returnedProduct.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				count: true,
				price: true,
				orderId: true,
				productId: true,
				order: { include: { client: true } },
				product: true,
			},
		})
		if (!returnedProduct) throw new NotFoundException("Ma'lumot topilmadi")

		// Agar o'zgarishlar bo'lsa, davom etamiz
		const newPrice = payload.price ?? returnedProduct.price.toNumber()
		const newCount = payload.count ?? returnedProduct.count
		const newSum = newPrice * newCount
		const currentSum = returnedProduct.price.toNumber() * returnedProduct.count

		const countDifference = payload.count !== returnedProduct.count ? true : false

		await this.#_prisma.$transaction(async (prisma) => {
			// `returnedProducts`ni yangilash
			await prisma.returnedProduct.update({
				where: { id: payload.id },
				data: {
					count: payload.count,
					price: payload.price,
				},
			})

			let sumOption = {}
			if (currentSum > newSum) {
				sumOption = {
					decrement: currentSum - newSum,
				}
			} else {
				sumOption = {
					increment: newSum - currentSum,
				}
			}
			await prisma.returnedOrder.update({
				where: { id: returnedProduct.orderId },
				data: {
					sum: sumOption,
				},
			})

			// `product`ning `count` qiymatini yangilash (faqat returned `accepted` bo'lsa)
			if (countDifference && returnedProduct.order.accepted) {
				let countOption = {}
				if (payload.count > returnedProduct.count) {
					countOption = {
						increment: payload.count - returnedProduct.count,
					}
				} else {
					countOption = {
						decrement: returnedProduct.count - payload.count,
					}
				}
				await prisma.products.update({
					where: { id: returnedProduct.productId },
					data: {
						count: countOption,
					},
				})
			}
		})

		return null
	}

	async returnedProductDelete(payload: ReturnedProductDeleteRequest): Promise<null> {
		const returnedProduct = await this.#_prisma.returnedProduct.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { order: { include: { client: true } }, product: true },
		})

		if (!returnedProduct) throw new NotFoundException('maxsulot topilmadi')

		const sum = returnedProduct.price.toNumber() * returnedProduct.count
		await Promise.all([
			this.#_prisma.returnedProduct.update({
				where: { id: payload.id },
				data: { deletedAt: new Date() },
			}),
			this.#_prisma.returnedOrder.update({
				where: { id: returnedProduct.orderId },
				data: {
					sum: { decrement: sum },
				},
			}),
		])

		if (returnedProduct.order.accepted) {
			await Promise.all([
				this.#_prisma.products.update({
					where: { id: returnedProduct.productId },
					data: { count: { decrement: returnedProduct.count } },
				}),
			])
		}

		return null
	}
}
