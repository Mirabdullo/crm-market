import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	RefundIncomingProductCreateRequest,
	RefundIncomingProductDeleteRequest,
	RefundIncomingProductRetriveAllRequest,
	RefundIncomingProductRetriveAllResponse,
	RefundIncomingProductRetriveRequest,
	RefundIncomingProductRetriveResponse,
	RefundIncomingProductUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'

@Injectable()
export class RefundIncomingProductService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async refundIncomingProductRetrieveAll(payload: RefundIncomingProductRetriveAllRequest): Promise<RefundIncomingProductRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		const refundIncomingProductList = await this.#_prisma.refundIncomingProduct.findMany({
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

		const transformedRefundIncomingProductList = refundIncomingProductList.map((refundIncomingProduct) => ({
			...refundIncomingProduct,
			price: (refundIncomingProduct.price as Decimal).toNumber(),
		}))

		const totalCount = await this.#_prisma.refundIncomingProduct.count({
			where: {
				deletedAt: null,
			},
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedRefundIncomingProductList,
		}
	}

	async refundIncomingProductRetrieve(payload: RefundIncomingProductRetriveRequest): Promise<RefundIncomingProductRetriveResponse> {
		const refundIncomingProduct = await this.#_prisma.refundIncomingProduct.findUnique({
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
		if (!refundIncomingProduct) {
			throw new NotFoundException('RefundIncomingProduct not found')
		}
		return {
			...refundIncomingProduct,
			price: (refundIncomingProduct.price as Decimal).toNumber(),
		}
	}

	async refundIncomingProductCreate(payload: RefundIncomingProductCreateRequest): Promise<null> {
		const [product, order] = await Promise.all([
			this.#_prisma.products.findFirst({
				where: { id: payload.product_id, deletedAt: null },
			}),

			this.#_prisma.refundIncoming.findFirst({ where: { id: payload.order_id } }),
		])
		if (!product || !order) throw new NotFoundException('Maxsulot yoki sotuv topilmadi')

		const promises = []

		promises.push(
			this.#_prisma.refundIncomingProduct.create({
				data: {
					orderId: payload.order_id,
					productId: payload.product_id,
					price: payload.price,
					count: payload.count,
				},
			}),
			this.#_prisma.refundIncoming.update({
				where: { id: payload.order_id },
				data: { sum: { increment: payload.price * payload.count } },
			}),
			this.#_prisma.products.update({
				where: { id: payload.product_id },
				data: {
					count: { decrement: payload.count },
				},
			}),
			this.#_prisma.users.update({
				where: { id: order.supplierId },
				data: { debt: { increment: payload.price * payload.count } },
			}),
		)

		await Promise.all(promises)

		return null
	}

	async refundIncomingProductUpdate(payload: RefundIncomingProductUpdateRequest): Promise<null> {
		const refundIncomingProduct = await this.#_prisma.refundIncomingProduct.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				count: true,
				price: true,
				orderId: true,
				productId: true,
				order: true,
				product: true,
			},
		})
		if (!refundIncomingProduct) throw new NotFoundException("Ma'lumot topilmadi")

		// Agar o'zgarishlar bo'lsa, davom etamiz
		const newPrice = payload.price ?? refundIncomingProduct.price.toNumber()
		const newCount = payload.count ?? refundIncomingProduct.count
		const newSum = newPrice * newCount
		const currentSum = refundIncomingProduct.price.toNumber() * refundIncomingProduct.count

		const countDifference = payload.count !== refundIncomingProduct.count ? true : false

		await this.#_prisma.$transaction(async (prisma) => {
			// `refundIncomingProducts`ni yangilash
			await prisma.refundIncomingProduct.update({
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
			await prisma.refundIncoming.update({
				where: { id: refundIncomingProduct.orderId },
				data: {
					sum: sumOption,
				},
			})

			await prisma.users.update({
				where: { id: refundIncomingProduct.orderId },
				data: { debt: sumOption },
			})

			if (countDifference) {
				let countOption = {}
				if (payload.count > refundIncomingProduct.count) {
					countOption = {
						decrement: payload.count - refundIncomingProduct.count,
					}
				} else {
					countOption = {
						increment: refundIncomingProduct.count - payload.count,
					}
				}
				await prisma.products.update({
					where: { id: refundIncomingProduct.productId },
					data: {
						count: countOption,
					},
				})
			}
		})

		return null
	}

	async refundIncomingProductDelete(payload: RefundIncomingProductDeleteRequest): Promise<null> {
		const refundIncomingProduct = await this.#_prisma.refundIncomingProduct.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { order: true, product: true },
		})

		if (!refundIncomingProduct) throw new NotFoundException('maxsulot topilmadi')

		const sum = refundIncomingProduct.price.toNumber() * refundIncomingProduct.count
		await Promise.all([
			this.#_prisma.refundIncomingProduct.update({
				where: { id: payload.id },
				data: { deletedAt: new Date() },
			}),
			this.#_prisma.refundIncoming.update({
				where: { id: refundIncomingProduct.orderId },
				data: {
					sum: { decrement: sum },
				},
			}),
			this.#_prisma.products.update({
				where: { id: refundIncomingProduct.productId },
				data: { count: { decrement: refundIncomingProduct.count } },
			}),
			this.#_prisma.users.update({
				where: { id: refundIncomingProduct.order.supplierId },
				data: { debt: { decrement: sum } },
			}),
		])

		await Promise.all([])

		return null
	}
}
