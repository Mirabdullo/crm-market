import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
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
import { addHours, endOfDay, format, startOfDay } from 'date-fns'
import { Cron, CronExpression } from '@nestjs/schedule'

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

		let sellerOption = {}
		if (payload.sellerId) {
			sellerOption = {
				admin: { id: payload.sellerId },
			}
		}

		let searchOption = {}
		if (payload.search) {
			searchOption = {
				OR: [
					{
						supplier: {
							OR: [{ name: { contains: payload.search, mode: 'insensitive' } }, { phone: { contains: payload.search, mode: 'insensitive' } }],
						},
					},
				],
			}
		}

		let dateOption = {}
		if (payload.startDate || payload.endDate) {
			const sDate = new Date(format(payload.startDate, 'yyyy-MM-dd'))
			const eDate = addHours(new Date(endOfDay(payload.endDate)), 3)
			dateOption = {
				createdAt: {
					...(payload.startDate ? { gte: sDate } : {}),
					...(payload.endDate ? { lte: eDate } : {}),
				},
			}
		}

		const incomingOrderList = await this.#_prisma.incomingOrder.findMany({
			where: {
				deletedAt: null,
				...sellerOption,
				...searchOption,
				...dateOption,
			},
			select: {
				id: true,
				sum: true,
				debt: true,
				accepted: true,
				createdAt: true,
				sellingDate: true,
				supplier: {
					select: {
						id: true,
						name: true,
						phone: true,
						createdAt: true,
					},
				},
				admin: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
				payment: {
					select: {
						id: true,
						totalPay: true,
						debt: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						createdAt: true,
						description: true,
					},
				},
				incomingProducts: {
					where: { deletedAt: null },
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
			orderBy: { createdAt: 'desc' },
			...paginationOptions,
		})

		const formattedData = incomingOrderList.map((order) => ({
			...order,
			sum: order.sum?.toNumber(),
			debt: order.debt?.toNumber(),
			payment: order.payment.map((pay) => {
				return {
					...pay,
					totalPay: (pay.totalPay as Decimal).toNumber() || 0,
					debt: (pay.debt as Decimal).toNumber() || 0,
					cash: (pay.cash as Decimal)?.toNumber(),
					card: (pay.card as Decimal)?.toNumber(),
					transfer: (pay.transfer as Decimal)?.toNumber(),
					other: (pay.other as Decimal)?.toNumber(),
				}
			})[0],
			incomingProducts: order.incomingProducts.map((incomingProduct) => ({
				...incomingProduct,
				cost: incomingProduct.cost?.toNumber(),
				selling_price: incomingProduct.selling_price?.toNumber(),
				wholesale_price: incomingProduct.wholesale_price?.toNumber(),
			})),
		}))

		const totalCount = await this.#_prisma.incomingOrder.count({
			where: {
				deletedAt: null,
				...sellerOption,
				...searchOption,
				...dateOption,
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
				debt: true,
				accepted: true,
				createdAt: true,
				sellingDate: true,
				supplier: {
					select: {
						id: true,
						name: true,
						phone: true,
						createdAt: true,
					},
				},
				admin: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
				payment: {
					select: {
						id: true,
						totalPay: true,
						debt: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						createdAt: true,
						description: true,
					},
				},
				incomingProducts: {
					where: { deletedAt: null },
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
			sum: incomingOrder.sum?.toNumber(),
			debt: incomingOrder.debt?.toNumber(),
			payment: incomingOrder.payment.map((payment) => {
				return {
					...payment,
					totalPay: (payment.totalPay as Decimal).toNumber() || 0,
					debt: (payment.debt as Decimal).toNumber() || 0,
					cash: (payment.cash as Decimal)?.toNumber(),
					card: (payment.card as Decimal)?.toNumber(),
					transfer: (payment.transfer as Decimal)?.toNumber(),
					other: (payment.other as Decimal)?.toNumber(),
				}
			})[0],
			incomingProducts: incomingOrder.incomingProducts.map((incomingProduct) => ({
				...incomingProduct,
				cost: incomingProduct.cost?.toNumber(),
				selling_price: incomingProduct.selling_price?.toNumber(),
				wholesale_price: incomingProduct.wholesale_price?.toNumber(),
			})),
		}
	}

	async incomingOrderCreate(payload: IncomingOrderCreateRequest): Promise<null> {
		try {
			const { supplierId, userId, accepted, sellingDate, products, payment } = payload
			const user = await this.#_prisma.users.findFirst({
				where: { id: payload.supplierId, deletedAt: null },
			})
			if (!user) throw new NotFoundException('Yetkazib beruvchi topilmadi')

			const totalSum = products.reduce((sum, product) => sum + product.cost * product.count, 0)

			const order = await this.#_prisma.incomingOrder.create({
				data: {
					supplierId: supplierId,
					adminId: userId,
					sum: totalSum,
					debt: totalSum,
					accepted: accepted,
					sellingDate,
				},
			})

			const mappedProducts = products.map((product) => {
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
				data: mappedProducts,
			})

			return null
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException('Kutilmagan xatolik')
		}
	}

	async incomingOrderUpdate(payload: IncomingOrderUpdateRequest): Promise<null> {
		const { id, sellingDate } = payload

		// Find the incoming order with includes for payment and incoming products
		const incomingOrder = await this.#_prisma.incomingOrder.findUnique({
			where: { id },
			include: { payment: true, incomingProducts: true },
		})

		if (!incomingOrder) {
			throw new NotFoundException("Ma'lumot topilmadi") // Throw error for missing order
		}

		// await this.#_prisma.incomingOrder.update({
		// 	where: { id },
		// 	// data: { sum: { increment: addProductsSum }, debt: { increment: addProductsSum } },
		// })

		return null
	}

	@Cron(CronExpression.EVERY_2_HOURS)
	async acceptIncomingOrders() {
		const incomingOrders = await this.#_prisma.incomingOrder.findMany({
			where: { createdAt: { lte: endOfDay(new Date()) }, deletedAt: null, accepted: false },
			include: { incomingProducts: true, supplier: true, payment: true },
		})

		if (incomingOrders.length) {
			const promises: any = []
			incomingOrders.map((order) => {
				const products = order.incomingProducts.map((p) =>
					this.#_prisma.products.update({
						where: { id: p.productId },
						data: {
							cost: p.cost,
							count: { increment: p.count },
							...(p.selling_price !== null && { selling_price: p.selling_price }),
							...(p.wholesale_price !== null && { wholesale_price: p.wholesale_price }),
						},
					}),
				)

				promises.push(
					...products,
					this.#_prisma.users.update({
						where: { id: order.supplierId },
						data: { debt: { increment: order?.payment[0]?.totalPay.toNumber() - order.sum.toNumber() } },
					}),
				)
			})

			console.log('Cron job ishladi malumot bor', new Date())

			await Promise.all([...promises])
		}

		console.log('cron job')
	}

	async incomingOrderDelete(payload: IncomingOrderDeleteRequest): Promise<null> {
		const incomingOrder = await this.#_prisma.incomingOrder.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { payment: true, incomingProducts: true },
		})

		if (!incomingOrder) throw new NotFoundException('maxsulot topilmadi')

		const promises: any[] = []
		const iProductIds = incomingOrder.incomingProducts.map((p) => p.id)
		if (incomingOrder.accepted) {
			const products = incomingOrder.incomingProducts.map((product) =>
				this.#_prisma.products.update({
					where: { id: product.productId },
					data: { count: { decrement: product.count } },
				}),
			)

			promises.push(
				...products,
				this.#_prisma.users.update({
					where: { id: incomingOrder.supplierId },
					data: { debt: { increment: incomingOrder.sum } },
				}),
			)
		}

		promises.push(
			this.#_prisma.incomingProducts.updateMany({
				where: { id: { in: iProductIds } },
				data: { deletedAt: new Date() },
			}),
			this.#_prisma.incomingOrder.update({
				where: { id: payload.id },
				data: { deletedAt: new Date() },
			}),
			this.#_prisma.payment.update({
				where: { id: incomingOrder.payment[0].id },
				data: { deletedAt: new Date() },
			}),
		)

		return null
	}
}
