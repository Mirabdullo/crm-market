import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	IncomingOrderCreateRequest,
	IncomingOrderCreateResponse,
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
import { TelegramService } from '../telegram'

@Injectable()
export class IncomingOrderService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegram: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegram
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
				adminId: payload.sellerId,
			}
		}

		let supplierOption = {}
		if (payload.supplierId) {
			supplierOption = {
				supplierId: payload.supplierId,
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
				...supplierOption,
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
						debt: true,
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
		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: formattedData,
		}
	}

	async incomingOrderRetrieveAllUpload(payload: IncomingOrderRetriveAllRequest): Promise<void> {
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

		await IncomingOrderUpload(formattedData, payload.res)
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

	async incomingOrderRetrieveUpload(payload: IncomingOrderRetriveRequest): Promise<void> {
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
	}

	async incomingOrderCreate(payload: IncomingOrderCreateRequest): Promise<IncomingOrderCreateResponse> {
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

			const now = this.adjustToTashkentTime()

			if (format(sellingDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
				if (mappedProducts.length) {
					const updateProducts = mappedProducts.map((product) =>
						this.#_prisma.products.update({
							where: { id: product.productId },
							data: {
								cost: product.cost,
								count: { increment: product.count },
								...(product.selling_price && { selling_price: product.selling_price }),
								...(product.wholesale_price && { wholesale_price: product.wholesale_price }),
								createdAt: now,
							},
						}),
					)

					await Promise.all(updateProducts)
				}

				await this.#_prisma.incomingOrder.update({
					where: { id: order.id },
					data: {
						accepted: true,
					},
				})

				await this.#_prisma.users.update({
					where: { id: order.supplier.id },
					data: { debt: { increment: order.debt } },
				})
			}

			return {
				...order,
				sum: order.sum?.toNumber(),
				debt: order.debt?.toNumber(),
			}
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

		const now = this.adjustToTashkentTime()
		if (format(incomingOrder.sellingDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && !incomingOrder.accepted) {
			await this.#_prisma.$transaction(async (prisma) => {
				// const sum = incomingOrder.incomingProducts.reduce((acc, product) => acc + product.cost.toNumber() * product.count, 0)
				const updateProducts = incomingOrder.incomingProducts.map((product) =>
					prisma.products.update({
						where: { id: product.productId },
						data: {
							cost: product.cost,
							count: { increment: product.count },
							selling_price: product.selling_price ?? 0,
							wholesale_price: product.wholesale_price ?? 0,
							createdAt: now,
						},
					}),
				)
				await Promise.all(updateProducts)

				await prisma.incomingOrder.update({
					where: { id },
					data: { accepted: true },
				})

				await prisma.users.update({
					where: { id: incomingOrder.supplierId },
					data: { debt: { increment: incomingOrder.debt } },
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
				incomingProducts: { include: { product: true } },
				supplier: true,
				payment: true,
			},
		})

		if (incomingOrders.length === 0) {
			console.log('No incoming orders to process', new Date())
			return
		}

		const now = this.adjustToTashkentTime()
		const transactions = incomingOrders.map((order) => {
			const productUpdates = order.incomingProducts.map((product) =>
				this.#_prisma.products.update({
					where: { id: product.productId },
					data: {
						cost: product.cost,
						count: { increment: product.count },
						...(product.selling_price && { selling_price: product.selling_price }),
						...(product.wholesale_price && { wholesale_price: product.wholesale_price }),
						createdAt: now,
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

			// if (incomingOrders.length) {
			// 	incomingOrders.forEach(async (order) => {
			// 		let text = `📦 новые продукты\n\n💰 сумма: ${order.sum}\n\n💳 долг: ${order.debt}\n\n👨‍💼 клиент: ${order.supplier.name}\n\n`
			// 		order.incomingProducts.forEach((product) => {
			// 			text += `📦 продукт: ${product.product.name}\n💲 цена: ${product.cost}\n#️⃣ кол-ва: ${product.count}\n\n`
			// 		})

			// 		await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)
			// 	})
			// }

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
		if (incomingOrder.accepted) {
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
					data: { debt: { decrement: incomingOrder.sum } },
				}),
			)
		} else {
			promises.push(
				this.#_prisma.incomingProducts.updateMany({
					where: { id: { in: iProductIds } },
					data: { deletedAt: new Date() },
				}),
			)
		}

		if (incomingOrder.payment.length) {
			promises.push(
				this.#_prisma.incomingOrderPayment.update({
					where: { id: incomingOrder.payment[0].id },
					data: { deletedAt: new Date() },
				}),
			)
		}

		await Promise.all([
			...promises,
			this.#_prisma.incomingOrder.update({
				where: { id: incomingOrder.id },
				data: { deletedAt: new Date() },
			}),
		])

		return null
	}

	private adjustToTashkentTime(date?: string): Date {
		// Agar `date` kiritilmagan bo'lsa, hozirgi vaqtni olamiz
		const inputDate = date ? new Date(date) : new Date()

		// Toshkent vaqti (UTC+5) ni hisoblaymiz
		const tashkentTime = new Date(inputDate.getTime() + 5 * 60 * 60 * 1000)

		return tashkentTime
	}
}
