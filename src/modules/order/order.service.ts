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
import { addDays, addHours, endOfDay, format, startOfDay, subDays, subMonths } from 'date-fns'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'
import { getEndDate, getStartDate } from '../../helpers'

@Injectable()
export class OrderService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async OrderRetrieveAll(payload: OrderRetriveAllRequest): Promise<OrderRetriveAllResponse> {
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
			totalCalc.totalPay += order?.payment?.totalPay
			totalCalc.totalCard += order?.payment?.card
			totalCalc.totalCash += order?.payment?.cash
			totalCalc.totalTransfer += order?.payment?.transfer
			totalCalc.totalOther += order?.payment?.other
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

		const todaySales = await this.#_prisma.order.aggregate({
			_sum: { sum: true },
			where: { createdAt: { gte: today, lte: endDate } },
		})

		const week = subDays(today, 7)
		const weeklySales = await this.#_prisma.order.aggregate({
			_sum: { sum: true },
			where: { createdAt: { gte: startOfDay(week), lte: endDate } },
		})

		const month = subMonths(today, 1)
		const monthlySales = await this.#_prisma.order.aggregate({
			_sum: { sum: true },
			where: { createdAt: { gte: month, lte: endDate } },
		})

		const ourDebt = await this.#_prisma.users.aggregate({
			_sum: { debt: true },
			where: {
				OR: [
					{ debt: { lt: 0 }, type: 'client' },
					{ debt: { lt: 0 }, type: 'supplier' },
				],
			},
		})

		const fromDebt = await this.#_prisma.users.aggregate({
			_sum: { debt: true },
			where: {
				OR: [
					{ debt: { gt: 0 }, type: 'client' },
					{ debt: { gt: 0 }, type: 'supplier' },
				],
			},
		})

		const weeklyChart = await this.#_prisma.$queryRaw`SELECT DATE_TRUNC('day', "created_at") AS date,
		  SUM("sum") AS totalSum FROM "order"
		WHERE "created_at" BETWEEN ${week} AND ${today}
		GROUP BY DATE_TRUNC('day', "created_at")
		ORDER BY DATE_TRUNC('day', "created_at") ASC;
	  `

		const dates = []
		for (let i = 0; i < 7; i++) {
			dates.push(format(addDays(week, i), 'yyyy-MM-dd'))
		}

		const weeklyChartArray = dates.map((date) => {
			const found = Array.isArray(weeklyChart) ? weeklyChart.find((item) => format(item.date, 'yyyy-MM-dd') === date) : 0
			console.log('found: ', found)
			return {
				date,
				sum: found ? found.totalsum.toNumber() : 0,
			}
		})

		return {
			todaySales: todaySales._sum.sum ? todaySales._sum.sum.toNumber() : 0,
			weeklySales: weeklySales._sum.sum ? weeklySales._sum.sum.toNumber() : 0,
			monthlySales: monthlySales._sum.sum ? monthlySales._sum.sum.toNumber() : 0,
			ourDebt: ourDebt._sum.debt ? ourDebt._sum.debt.toNumber() : 0,
			fromDebt: fromDebt._sum.debt ? fromDebt._sum.debt.toNumber() : 0,
			weeklyChart: weeklyChartArray,
		}
	}

	async orderUpload(payload: { res: Response; id: string }): Promise<any> {
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
		const titleRow = worksheet.addRow([`Xaridor: ${order.client.name}`])
		worksheet.mergeCells('A1:F1') // A1 dan E1 gacha kataklarni birlashtirish

		titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' } // Chapga joylashtirish
		titleRow.font = { bold: true, size: 12 } // Bold va shrift o'lchami
		titleRow.height = 20 // Qator balandligi

		// 2. Jadval sarlavhalarini qo'shish
		const headerRow = worksheet.addRow(['№', 'Махсулот номи', '√', 'Сони', 'Нархи', 'Суммаси'])
		headerRow.font = { bold: true }
		headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
		headerRow.height = 18

		// 2. Har bir ustunning kengligini belgilash
		worksheet.getColumn(1).width = 5 // № ustuni
		worksheet.getColumn(2).width = 30 // Махсулот номи
		worksheet.getColumn(3).width = 8 // √ ustuni
		worksheet.getColumn(4).width = 10 // Сони
		worksheet.getColumn(5).width = 20 // Нархи
		worksheet.getColumn(6).width = 15 // Суммаси

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
			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' }
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
		worksheet.eachRow((row, rowNumber) => {
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

			const order = await this.#_prisma.order.create({
				data: {
					clientId: clientId,
					adminId: userId,
					sum: totalSum,
					debt: totalSum,
					sellingDate,
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
		try {
			const { id, accepted } = payload

			const order = await this.#_prisma.order.findUnique({
				where: { id },
				include: { payment: true, products: true },
			})
			if (!order) throw new NotFoundException("Ma'lumot topilmadi")

			if (accepted) {
				const updatedProducts = order.products.map((pr) =>
					this.#_prisma.products.update({
						where: { id: pr.productId },
						data: { count: { decrement: pr.count } },
					}),
				)

				await Promise.all([
					...updatedProducts,
					this.#_prisma.users.update({
						where: { id: order.clientId },
						data: { debt: { increment: order.debt } },
					}),
				])
			}

			return null
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException("Kutilmagan xatolik! Qaytadan urinib ko'ring")
		}
	}

	async OrderDelete(payload: OrderDeleteRequest): Promise<null> {
		const order = await this.#_prisma.order.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { products: true, payment: true },
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
					data: { debt: { decrement: order.sum.toNumber() - order.debt.toNumber() } },
				}),
			)
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
}
