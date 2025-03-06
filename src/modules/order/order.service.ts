import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	OrderCreateRequest,
	OrderCreateResponse,
	OrderDeleteRequest,
	OrderRetriveAllRequest,
	OrderRetriveAllResponse,
	OrderRetriveRequest,
	OrderRetriveResponse,
	OrderStatisticsResponse,
	OrderUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import { addDays, addHours, endOfDay, endOfMonth, format, startOfDay, startOfMonth, subDays, subMonths } from 'date-fns'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'
import { OrderUpload } from './excel'
import { TelegramService } from '../telegram'
import { generatePdfBuffer } from './format-to-pdf'

@Injectable()
export class OrderService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegram: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegram
	}

	async OrderRetrieveAll(payload: OrderRetriveAllRequest): Promise<OrderRetriveAllResponse> {
		try {
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

			let searchOption = {}
			if (payload.search) {
				searchOption = {
					client: {
						OR: [{ name: { contains: payload.search, mode: 'insensitive' } }, { phone: { contains: payload.search, mode: 'insensitive' } }],
					},
				}
			}

			let clientOption = {}
			if (payload.clientId) {
				clientOption = {
					clientId: payload.clientId,
				}
			}

			let dateOption = {}
			if (payload.startDate || payload.endDate) {
				const today = new Date(format(payload.startDate, 'yyyy-MM-dd'))
				const endDate = addHours(new Date(endOfDay(payload.endDate)), 3)

				dateOption = {
					sellingDate: {
						...(payload.startDate ? { gte: today } : {}),
						...(payload.endDate ? { lte: endDate } : {}),
					},
				}
			}

			let acceptedOption = {}
			if (payload.accepted) {
				acceptedOption = {
					accepted: true,
				}
			}

			const OrderList = await this.#_prisma.order.findMany({
				where: {
					deletedAt: null,
					...sellerOption,
					...searchOption,
					...dateOption,
					...clientOption,
					...acceptedOption,
				},
				select: {
					id: true,
					articl: true,
					sum: true,
					debt: true,
					accepted: true,
					createdAt: true,
					sellingDate: true,
					client: {
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
						where: { deletedAt: null },
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
					products: {
						where: { deletedAt: null },
						select: {
							id: true,
							cost: true,
							count: true,
							price: true,
							createdAt: true,
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

			const formattedData = OrderList.map((order) => ({
				id: order.id,
				articl: order.articl,
				client: order.client,
				sum: order.sum.toNumber(),
				debt: order.debt.toNumber(),
				accepted: order.accepted,
				createdAt: order.createdAt,
				sellingDate: order.sellingDate,
				seller: order.admin,
				payment: order.payment.map((pay) => {
					return {
						...pay,
						totalPay: pay?.totalPay?.toNumber() || 0,
						debt: pay?.debt?.toNumber() || 0,
						cash: pay?.cash?.toNumber() || 0,
						card: pay?.card?.toNumber() || 0,
						transfer: pay?.transfer?.toNumber() || 0,
						other: pay?.other?.toNumber() || 0,
					}
				})[0],
				products: order.products.map((prod) => ({
					...prod,
					id: prod.id,
					cost: (prod.cost as Decimal).toNumber(),
					price: (prod.price as Decimal).toNumber(),
					count: prod.count,
				})),
			}))

			const totalCalc = {
				totalSum: 0,
				totalDebt: 0,
				totalPay: 0,
				totalCard: 0,
				totalCash: 0,
				totalTransfer: 0,
				totalOther: 0,
			}

			formattedData.forEach((order) => {
				totalCalc.totalSum += order.sum
				totalCalc.totalDebt += order.debt
				totalCalc.totalPay += order?.payment?.totalPay || 0
				totalCalc.totalCard += order?.payment?.card || 0
				totalCalc.totalCash += order?.payment?.cash || 0
				totalCalc.totalTransfer += order?.payment?.transfer || 0
				totalCalc.totalOther += order?.payment?.other || 0
			})

			const totalCount = await this.#_prisma.order.count({
				where: {
					deletedAt: null,
					...sellerOption,
					...searchOption,
					...dateOption,
					...clientOption,
				},
			})

			return {
				totalCount: totalCount,
				pageNumber: payload.pageNumber,
				pageSize: payload.pageSize,
				pageCount: Math.ceil(totalCount / payload.pageSize),
				data: formattedData,
				totalCalc,
			}
		} catch (error) {
			console.log(error)
		}
	}

	async OrderRetrieveAllUpload(payload: OrderRetriveAllRequest): Promise<void> {
		try {
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

			let searchOption = {}
			if (payload.search) {
				searchOption = {
					client: {
						OR: [{ name: { contains: payload.search, mode: 'insensitive' } }, { phone: { contains: payload.search, mode: 'insensitive' } }],
					},
				}
			}

			let clientOption = {}
			if (payload.clientId) {
				clientOption = {
					clientId: payload.clientId,
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

			let acceptedOption = {}
			if (payload.accepted) {
				acceptedOption = {
					accepted: payload.accepted,
				}
			}

			const OrderList = await this.#_prisma.order.findMany({
				where: {
					deletedAt: null,
					...sellerOption,
					...searchOption,
					...dateOption,
					...clientOption,
					...acceptedOption,
				},
				select: {
					id: true,
					articl: true,
					sum: true,
					debt: true,
					accepted: true,
					createdAt: true,
					sellingDate: true,
					client: {
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
						where: { deletedAt: null },
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
					products: {
						where: { deletedAt: null },
						select: {
							id: true,
							cost: true,
							count: true,
							price: true,
							createdAt: true,
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

			const formattedData = OrderList.map((order) => ({
				id: order.id,
				articl: order.articl,
				client: order.client,
				sum: order.sum.toNumber(),
				debt: order.debt.toNumber(),
				accepted: order.accepted,
				createdAt: order.createdAt,
				sellingDate: order.sellingDate,
				seller: order.admin,
				payment: order.payment.map((pay) => {
					return {
						...pay,
						totalPay: pay?.totalPay?.toNumber() || 0,
						debt: pay?.debt?.toNumber() || 0,
						cash: pay?.cash?.toNumber() || 0,
						card: pay?.card?.toNumber() || 0,
						transfer: pay?.transfer?.toNumber() || 0,
						other: pay?.other?.toNumber() || 0,
					}
				})[0],
				products: order.products.map((prod) => ({
					...prod,
					id: prod.id,
					cost: (prod.cost as Decimal).toNumber(),
					price: (prod.price as Decimal).toNumber(),
					count: prod.count,
				})),
			}))

			await OrderUpload(formattedData, payload.res)
		} catch (error) {
			console.log(error)
		}
	}

	async OrderRetrieve(payload: OrderRetriveRequest): Promise<OrderRetriveResponse> {
		const Order = await this.#_prisma.order.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				sum: true,
				articl: true,
				accepted: true,
				createdAt: true,
				sellingDate: true,
				debt: true,
				client: {
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
					where: { deletedAt: null },
					select: {
						id: true,
						totalPay: true,
						debt: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						description: true,
						createdAt: true,
					},
				},
				products: {
					where: { deletedAt: null },
					select: {
						id: true,
						cost: true,
						count: true,
						price: true,
						createdAt: true,
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

		if (!Order) {
			throw new NotFoundException('Order not found')
		}

		return {
			id: Order.id,
			articl: Order.articl,
			seller: Order.admin,
			client: Order.client,
			sum: Order.sum.toNumber(),
			debt: Order.debt.toNumber(),
			accepted: Order.accepted,
			createdAt: Order.createdAt,
			sellingDate: Order.sellingDate,
			payment: Order.payment.map((payment) => {
				return {
					...payment,
					totalPay: (payment.totalPay as Decimal).toNumber() || 0,
					debt: (payment.debt as Decimal).toNumber() || 0,
					cash: (payment.cash as Decimal).toNumber() || 0,
					card: (payment.card as Decimal).toNumber() || 0,
					transfer: (payment.transfer as Decimal).toNumber() || 0,
					other: (payment.other as Decimal).toNumber() || 0,
				}
			})[0],
			products: Order.products.map((prod) => ({
				...prod,
				cost: (prod.cost as Decimal).toNumber(),
				price: (prod.price as Decimal).toNumber(),
				count: prod.count,
			})),
		}
	}

	async orderStatistics(): Promise<OrderStatisticsResponse> {
		const today = new Date(format(new Date(), 'yyyy-MM-dd'))
		const endDate = addHours(new Date(endOfDay(today)), 3)
		console.log(today, endDate)

		const todaySales = await this.#_prisma.order.aggregate({
			_sum: { sum: true },
			where: { sellingDate: { gte: today, lte: endDate }, accepted: true, deletedAt: null },
		})

		// Haftalik sotuvlar uchun
		const week = new Date()
		const weekStart = addHours(new Date(week.setDate(today.getDate() - 6)), 3)

		const weeklySales = await this.#_prisma.order.aggregate({
			_sum: { sum: true },
			where: { sellingDate: { gte: weekStart, lte: endDate }, accepted: true, deletedAt: null },
		})

		const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
		const startOfLastMonth = new Date(format(lastMonth, 'yyyy-MM-dd'))

		const monthlySales = await this.#_prisma.order.aggregate({
			_sum: { sum: true },
			where: { sellingDate: { gte: startOfLastMonth, lte: endDate }, accepted: true, deletedAt: null },
		})

		const ourDebtClient = await this.#_prisma.users.aggregate({
			_sum: { debt: true },
			where: {
				debt: { lt: 0 },
				type: 'client',
				deletedAt: null,
			},
		})

		const ourDebtSupplier = await this.#_prisma.users.aggregate({
			_sum: { debt: true },
			where: {
				debt: { lt: 0 },
				type: 'supplier',
				deletedAt: null,
			},
		})

		const fromDebtClient = await this.#_prisma.users.aggregate({
			_sum: { debt: true },
			where: {
				debt: { gt: 0 },
				type: 'client',
				deletedAt: null,
			},
		})

		const fromDebtSupplier = await this.#_prisma.users.aggregate({
			_sum: { debt: true },
			where: {
				debt: { gt: 0 },
				type: 'supplier',
				deletedAt: null,
			},
		})

		const weeklyChart = await this.#_prisma.$queryRaw`SELECT DATE_TRUNC('day', "created_at") AS date,
		  SUM("sum") AS totalSum FROM "order"
		WHERE "selling_date" BETWEEN ${weekStart} AND ${endDate} AND "accepted" = true AND "deleted_at" IS NULL
		GROUP BY DATE_TRUNC('day', "created_at")
		ORDER BY DATE_TRUNC('day', "created_at") ASC;
	  `

		const dates = []
		for (let i = 0; i < 7; i++) {
			dates.push(format(addDays(weekStart, i), 'yyyy-MM-dd'))
		}

		const weeklyChartArray = dates.map((date) => {
			const found = Array.isArray(weeklyChart) ? weeklyChart.find((item) => format(item.date, 'yyyy-MM-dd') === date) : 0
			return {
				date,
				sum: found ? found.totalsum.toNumber() : 0,
			}
		})

		return {
			todaySales: todaySales._sum.sum ? todaySales._sum.sum.toNumber() : 0,
			weeklySales: weeklySales._sum.sum ? weeklySales._sum.sum.toNumber() : 0,
			monthlySales: monthlySales._sum.sum ? monthlySales._sum.sum.toNumber() : 0,
			ourDebt: {
				client: ourDebtClient._sum.debt ? ourDebtClient._sum.debt.toNumber() : 0,
				supplier: ourDebtSupplier._sum.debt ? ourDebtSupplier._sum.debt.toNumber() : 0,
			},
			fromDebt: {
				client: fromDebtClient._sum.debt ? fromDebtClient._sum.debt.toNumber() : 0,
				supplier: fromDebtSupplier._sum.debt ? fromDebtSupplier._sum.debt.toNumber() : 0,
			},
			weeklyChart: weeklyChartArray,
		}
	}

	async orderUpload(payload: { res: Response; id: string }): Promise<void> {
		const { res, id } = payload
		const order = await this.#_prisma.order.findUnique({
			where: { id },
			select: {
				id: true,
				sum: true,
				articl: true,
				accepted: true,
				createdAt: true,
				debt: true,
				client: {
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
					where: { deletedAt: null },
					select: {
						id: true,
						totalPay: true,
						debt: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						createdAt: true,
					},
				},
				products: {
					where: { deletedAt: null },
					select: {
						id: true,
						cost: true,
						count: true,
						price: true,
						createdAt: true,
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

		if (!order) {
			throw new NotFoundException('Order not found')
		}

		// 1. Excel Workbook yaratish
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Order List')

		// Xaridor nomi uchun titleRow
		const titleRow = worksheet.addRow([
			`Xaridor: ${order.client.name}`, // A1
			'', // B1 (bo'sh, chunki A1:C1 birlashtiriladi)
			'', // C1 (bo'sh, chunki A1:C1 birlashtiriladi)
			`Telefon: ${order.client.phone}`, // D1
			'', // E1 (bo'sh, chunki D1:F1 birlashtiriladi)
			'', // F1 (bo'sh, chunki D1:F1 birlashtiriladi)
		])

		// Xaridor nomi uchun A1:C1 birlashtirish
		worksheet.mergeCells('A1:C1')

		// Telefon raqami uchun D1:F1 birlashtirish
		worksheet.mergeCells('D1:F1')

		titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' } // Chapga joylashtirish
		titleRow.font = { bold: true, size: 12 } // Bold va shrift o'lchami
		titleRow.height = 20 // Qator balandligi

		// 2. Jadval sarlavhalarini qo'shish
		const headerRow = worksheet.addRow(['№', 'Махсулот номи', '√', 'Сони', 'Нархи', 'Суммаси'])
		headerRow.font = { bold: true }
		headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
		headerRow.height = 18

		// 2. Har bir ustunning kengligini belgilash
		worksheet.getColumn(1).width = 6 // № ustuni
		worksheet.getColumn(2).width = 55 // Махсулот номи
		worksheet.getColumn(3).width = 20 // √ ustuni
		worksheet.getColumn(4).width = 20 // Сони
		worksheet.getColumn(5).width = 20 // Нархи
		worksheet.getColumn(6).width = 20 // Суммаси

		// Sarlavha ustunlarini style
		headerRow.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			}
		})

		// 3. Order ma'lumotlarini qo'shish
		const totalSum = order.products.reduce((sum, product) => sum + product.price.toNumber() * product.count, 0)
		order.products.forEach((product, index) => {
			const row = worksheet.addRow([
				index + 1, // №
				product.product.name, // Махсулот номи
				'', // √ ustuni bo'sh
				product.count, // Сони
				product.price.toNumber(), // Нархи
				product.price.toNumber() * product.count, // Суммаси
			])

			// Qatorlarga chegara va markaziy formatlash
			row.eachCell((cell, colNumber) => {
				// Agar katak "B" ustunida bo'lsa (maxsulot nomi), chapga tekislash
				if (colNumber === 2) {
					cell.alignment = { vertical: 'middle', horizontal: 'left' }
				} else {
					// Boshqa kataklar uchun markaziy formatlash
					cell.alignment = { vertical: 'middle', horizontal: 'center' }
				}

				// Chegara qo'shish
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				}
			})
		})

		// 4. Umumiy summa va to'lov ma'lumotlarini qo'shish
		worksheet.addRow([])
		const summaryRow1 = worksheet.addRow(['', '', '', '', 'Жами сумма:', totalSum])
		const summaryRow2 = worksheet.addRow(['', '', '', '', 'Тулов килинди:', order.payment[0]?.totalPay.toNumber() || 0])

		summaryRow1.getCell(5).font = { bold: true }
		summaryRow2.getCell(5).font = { bold: true }

		// 5. Style qo'shish
		worksheet.eachRow((row) => {
			row.eachCell((cell) => {
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				}
			})
		})

		// 6. Foydalanuvchiga yuklash
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename=order.xlsx')

		await workbook.xlsx.write(res)
		res.end()
	}

	async OrderCreate(payload: OrderCreateRequest): Promise<OrderCreateResponse> {
		try {
			const { clientId, userId, products, sellingDate } = payload

			// Mijozni tekshirish
			const user = await this.#_prisma.users.findFirst({
				where: { id: clientId, deletedAt: null },
			})
			if (!user) throw new NotFoundException('Mijoz topilmadi')

			const totalSum = products.reduce((sum, product) => sum + product.price * product.count, 0)

			const now = this.adjustToTashkentTime()

			const order = await this.#_prisma.order.create({
				data: {
					clientId: clientId,
					adminId: userId,
					sum: totalSum,
					debt: totalSum,
					sellingDate: sellingDate ? new Date(sellingDate) : now,
				},
			})

			// OrderProductlar yaratish uchun
			const orderProductsData = products.map((product) => ({
				orderId: order.id,
				productId: product.product_id,
				cost: 0,
				count: product.count,
				price: product.price,
			}))

			await this.#_prisma.orderProducts.createMany({ data: orderProductsData })

			return {
				id: order.id,
			}
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException('Kutilmagan xatolik!')
		}
	}

	async OrderUpdate(payload: OrderUpdateRequest): Promise<null> {
		const { id, accepted, clientId, sellingDate, sendUser } = payload

		// 1. Get order with all necessary data
		const order = await this.#_prisma.order.findUnique({
			where: { id },
			select: {
				id: true,
				sellingDate: true,
				accepted: true,
				articl: true,
				client: {
					select: {
						id: true,
						name: true,
						chatId: true,
					},
				},
				payment: true,
				debt: true,
				sum: true,
				clientId: true,
				admin: {
					select: { name: true },
				},
				products: {
					select: {
						id: true,
						cost: true,
						count: true,
						price: true,
						productId: true,
						product: {
							select: { name: true },
						},
					},
				},
			},
		})

		if (!order) {
			throw new NotFoundException("Ma'lumot topilmadi")
		}

		try {
			await this.#_prisma.$transaction(async (tx) => {
				// 2. Handle client change for accepted order
				if (clientId && order.accepted) {
					const newClient = await tx.users.findFirst({
						where: {
							id: clientId,
							type: 'client',
							deletedAt: null,
						},
					})

					if (!newClient) {
						throw new NotFoundException('Client topilmadi')
					}

					// Update old client's debt
					await tx.users.update({
						where: { id: order.clientId },
						data: { debt: { decrement: order.debt } },
					})

					// Update new client's debt
					await tx.users.update({
						where: { id: newClient.id },
						data: { debt: { increment: order.debt } },
					})
				}

				// 3. Handle order acceptance
				if (accepted && !order.accepted) {
					const targetClientId = clientId || order.clientId

					// Prepare all update operations
					const updateOperations = [
						// Update client debt
						tx.users.update({
							where: { id: targetClientId },
							data: { debt: { increment: order.debt } },
						}),
						// Update product counts
						...order.products.map((pr) =>
							tx.products.update({
								where: { id: pr.productId },
								data: { count: { decrement: pr.count } },
							}),
						),
					]

					await Promise.all(updateOperations)
				}

				let date = undefined
				if (sellingDate) {
					date = new Date(sellingDate)
					let now = this.adjustToTashkentTime()
					if (format(date, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd')) {
						date = new Date(format(date, 'yyyy-MM-dd'))
					} else {
						date = date.toISOString().split('T')[0] + 'T' + now.toISOString().split('T')[1]
					}
				}

				if (accepted) {
					date = this.adjustToTashkentTime()
				}

				await tx.order.update({
					where: { id },
					data: {
						accepted,
						clientId,
						sellingDate: date,
					},
				})
			})

			// 5. Handle notifications (outside transaction as it's not critical)
			if (accepted && !order.accepted) {
				await this.sendOrderNotifications(
					{
						...order,
						clientId: clientId ?? order.clientId,
					},
					sendUser,
				)
			}

			return null
		} catch (error) {
			console.error('OrderUpdate error:', error)

			if (error instanceof NotFoundException) {
				throw error
			}

			throw new InternalServerErrorException("Kutilmagan xatolik! Qaytadan urinib ko'ring")
		}
	}

	private async sendOrderNotifications(order: any, sendUser?: boolean): Promise<void> {
		try {
			const text = `💼 продажа\n\n✍️ ид заказа: ${order.articl}\n\n💵 сумма: ${order.sum.toNumber().toFixed(1)}\n\n💳 долг: ${order.debt.toFixed(1)}\n\n👨‍💼 клиент: ${order.client.name}`

			// Send to order channel
			// await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

			// Send PDF document
			const pdfBuffer = await generatePdfBuffer(order)
			await this.#_telegram.sendMessageWithDocument(parseInt(process.env.ORDER_CHANEL_ID), text, Buffer.from(pdfBuffer), 'order-details.pdf')
			// await this.#_telegram.sendDocument(parseInt(process.env.ORDER_CHANEL_ID), Buffer.from(pdfBuffer), 'order-details.pdf')

			// Send to user if requested and chat ID exists
			if (sendUser && order.client.chatId) {
				await this.#_telegram.sendMessageWithDocument(parseInt(order.client.chatId), text, Buffer.from(pdfBuffer), 'order-details.pdf')

				// await this.#_telegram.sendMessage()
				// console.log(pdfBuffer)
				// await this.#_telegram.sendDocument(Number(order.client.chatId), Buffer.from(pdfBuffer), 'order-details.pdf')
			}
		} catch (error) {
			console.error('Notification error:', error)
			// Don't throw error as notifications are not critical
		}
	}

	async OrderDelete(payload: OrderDeleteRequest): Promise<null> {
		const order = await this.#_prisma.order.findUnique({
			where: { id: payload.id, deletedAt: null },
			select: {
				id: true,
				sellingDate: true,
				accepted: true,
				articl: true,
				client: true,
				payment: true,
				debt: true,
				sum: true,
				clientId: true,
				products: {
					select: {
						id: true,
						cost: true,
						count: true,
						price: true,
						productId: true,
						product: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		})

		if (!order) throw new NotFoundException('maxsulot topilmadi')

		const promises: any = []
		const orderProductIds = order.products.map((product) => product.id)
		promises.push(
			this.#_prisma.orderProducts.updateMany({
				where: { id: { in: orderProductIds } },
				data: { deletedAt: new Date() },
			}),
		)

		if (order.accepted) {
			const products = order.products.map((product) =>
				this.#_prisma.products.update({
					where: { id: product.productId },
					data: { count: { increment: product.count } },
				}),
			)

			promises.push(
				...products,
				this.#_prisma.users.update({
					where: { id: order.clientId },
					data: { debt: { decrement: order.sum.toNumber() - (order.payment.length ? order.payment[0].totalPay.toNumber() : 0) } },
				}),
			)

			let text = `продажа удалена\nид заказа: ${order.articl}\nсумма: ${order.sum.toFixed(1)}\nдолг: ${order.debt.toFixed(1)}\nклиент: ${order.client.name}\n\n`
			order.products.forEach((product) => {
				text += `продукт: ${product.product.name}\nцена: ${product.price}\nкол-ва: ${product.count}\n\n`
			})

			await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

			if (payload.sendUser && order.client.chatId) {
				await this.#_telegram.sendMessage(Number(order.client.chatId), text)
			}
		}

		if (order.payment?.length) {
			promises.push(
				this.#_prisma.payment.update({
					where: { id: order.payment[0].id },
					data: { deletedAt: new Date() },
				}),
			)
		}

		await Promise.all([
			...promises,
			this.#_prisma.order.update({
				where: { id: payload.id },
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
