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
import { addHours, endOfDay, format } from 'date-fns'
import { Cron, CronExpression } from '@nestjs/schedule'
import { IncomingOrderUpload, IncomingOrderUploadWithProduct } from './excel'

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
					orderBy: { createdAt: 'desc' },
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

		if (payload.type === 'excel') {
			await IncomingOrderUpload(formattedData, payload.res)
		} else {
			return {
				totalCount: totalCount,
				pageNumber: payload.pageNumber,
				pageSize: payload.pageSize,
				pageCount: Math.ceil(totalCount / payload.pageSize),
				data: formattedData,
			}
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
					orderBy: { createdAt: 'desc' },
				},
			},
		})

		if (!incomingOrder) {
			throw new NotFoundException('IncomingOrder not found')
		}

		if (payload.type === 'excel') {
			await IncomingOrderUploadWithProduct(
				{
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
				},
				payload.res,
			)
		} else {
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
	}

	async incomingOrderCreate(payload: IncomingOrderCreateRequest): Promise<null | any> {
		try {
			const { supplierId, userId, accepted, sellingDate, products } = payload
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
					selling_price: product.selling_price ?? 0,
					wholesale_price: product.wholesale_price ?? 0,
				}
			})

			await this.#_prisma.incomingProducts.createMany({
				data: mappedProducts,
			})

			return order
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException('Kutilmagan xatolik')
		}
	}

	async incomingOrderUpdate(payload: IncomingOrderUpdateRequest): Promise<null> {
		const { id } = payload

		// Find the incoming order with includes for payment and incoming products
		const incomingOrder = await this.#_prisma.incomingOrder.findUnique({
			where: { id },
			include: { payment: true, incomingProducts: true },
		})

		if (!incomingOrder) {
			throw new NotFoundException("Ma'lumot topilmadi") // Throw error for missing order
		}

		if (format(incomingOrder.sellingDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
			await this.#_prisma.$transaction(async (prisma) => {
				const sum = incomingOrder.incomingProducts.reduce((acc, product) => acc + product.cost.toNumber() * product.count, 0)
				const updateProducts = incomingOrder.incomingProducts.map((product) =>
					prisma.products.update({
						where: { id: product.productId },
						data: {
							cost: product.cost,
							count: product.count,
							selling_price: product.selling_price ?? 0,
							wholesale_price: product.wholesale_price ?? 0,
						},
					}),
				)
				await Promise.all(updateProducts)

				await prisma.incomingOrder.update({
					where: { id },
					data: { debt: { increment: sum } },
				})

				await prisma.users.update({
					where: { id: incomingOrder.supplierId },
					data: { debt: {} },
				})
			})
		}

		return null
	}

	@Cron(CronExpression.EVERY_2_HOURS)
	async acceptIncomingOrders() {
		const todayEnd = endOfDay(new Date())

		const incomingOrders = await this.#_prisma.incomingOrder.findMany({
			where: {
				sellingDate: { lte: todayEnd },
				deletedAt: null,
				accepted: false,
			},
			include: {
				incomingProducts: true,
				supplier: true,
				payment: true,
			},
		})

		if (incomingOrders.length === 0) {
			console.log('No incoming orders to process', new Date())
			return
		}

		const transactions = incomingOrders.map((order) => {
			const productUpdates = order.incomingProducts.map((product) =>
				this.#_prisma.products.update({
					where: { id: product.productId },
					data: {
						cost: product.cost,
						count: { increment: product.count },
						...(product.selling_price && { selling_price: product.selling_price }),
						...(product.wholesale_price && { wholesale_price: product.wholesale_price }),
					},
				}),
			)

			const updateUserDebt = this.#_prisma.users.update({
				where: { id: order.supplierId },
				data: {
					debt: { increment: (order.payment?.[0]?.totalPay?.toNumber() || 0) - order.sum.toNumber() },
				},
			})

			const markOrderAccepted = this.#_prisma.incomingOrder.update({
				where: { id: order.id },
				data: { accepted: true },
			})

			return this.#_prisma.$transaction([...productUpdates, updateUserDebt, markOrderAccepted])
		})

		try {
			await Promise.all(transactions)
			console.log('Cron job executed successfully', new Date())
		} catch (error) {
			console.error('Error processing incoming orders:', error)
		}
	}

	async incomingOrderDelete(payload: IncomingOrderDeleteRequest): Promise<null> {
		const incomingOrder = await this.#_prisma.incomingOrder.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { payment: true, incomingProducts: true },
		})

		if (!incomingOrder) throw new NotFoundException('Mahsulotlar tushiruvi topilmadi')

		const promises: any[] = []
		const iProductIds = incomingOrder.incomingProducts.map((p) => p.id)
		if (format(incomingOrder.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
			const products = incomingOrder.incomingProducts.map((product) =>
				this.#_prisma.products.update({
					where: { id: product.productId },
					data: { count: { decrement: product.count } },
				}),
			)

			promises.push(
				...products,
				this.#_prisma.incomingProducts.updateMany({
					where: { id: { in: incomingOrder.incomingProducts.map((p) => p.id) } },
					data: { deletedAt: new Date() },
				}),
				this.#_prisma.users.update({
					where: { id: incomingOrder.supplierId },
					data: { debt: { increment: incomingOrder.sum } },
				}),
				this.#_prisma.incomingOrder.update({
					where: { id: incomingOrder.id },
					data: { deletedAt: new Date() },
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
