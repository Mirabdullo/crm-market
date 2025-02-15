import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	PaymentCreateRequest,
	PaymentDeleteRequest,
	PaymentRetriveAllRequest,
	PaymentRetriveAllResponse,
	PaymentRetriveRequest,
	PaymentRetriveResponse,
	PaymentUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import * as ExcelJS from 'exceljs'
import { addHours, endOfDay, format } from 'date-fns'
import { TelegramService } from '../telegram/telegram.service'
import { generatePdfBuffer } from '../order/format-to-pdf'

@Injectable()
export class PaymentService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegramService: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegramService
	}

	async paymentRetrieveAll(payload: PaymentRetriveAllRequest): Promise<PaymentRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		let clientOption = {}
		if (payload.clientId) {
			clientOption = {
				clientId: payload.clientId,
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

		const paymentList = await this.#_prisma.payment.findMany({
			where: { deletedAt: null, ...clientOption, ...searchOption, ...dateOption },
			select: {
				id: true,
				totalPay: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				createdAt: true,
				description: true,
				order: {
					select: {
						id: true,
						sum: true,
						debt: true,
					},
				},
				client: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
			},
			...paginationOptions,
			orderBy: { createdAt: 'desc' },
		})

		const transformedPaymentList = paymentList.map((payment) => ({
			...payment,
			totalPay: payment.totalPay.toNumber(),
			cash: (payment.cash as Decimal).toNumber(),
			card: payment.card ? (payment.card as Decimal).toNumber() : undefined,
			transfer: (payment.transfer as Decimal).toNumber(),
			other: (payment.other as Decimal).toNumber(),
		}))

		const totalCount = await this.#_prisma.payment.count({
			where: { deletedAt: null, ...clientOption, ...searchOption, ...dateOption },
		})

		const totalCalc = {
			totalPay: 0,
			totalCard: 0,
			totalCash: 0,
			totalTransfer: 0,
			totalOther: 0,
		}

		transformedPaymentList.forEach((payment) => {
			totalCalc.totalPay += payment.totalPay
			totalCalc.totalCard += payment.card
			totalCalc.totalCash += payment.cash
			totalCalc.totalTransfer += payment.transfer
			totalCalc.totalOther += payment.other
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedPaymentList,
			totalCalc,
		}
	}

	async paymentRetrieveAllUpload(payload: PaymentRetriveAllRequest): Promise<void> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		let clientOption = {}
		if (payload.clientId) {
			clientOption = {
				clientId: payload.clientId,
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

		const paymentList = await this.#_prisma.payment.findMany({
			where: { deletedAt: null, ...clientOption, ...searchOption },
			select: {
				id: true,
				totalPay: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				createdAt: true,
				description: true,
				order: {
					select: {
						id: true,
						sum: true,
						debt: true,
						admin: {
							select: {
								phone: true,
							},
						},
					},
				},
				client: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
			},
			...paginationOptions,
			orderBy: { createdAt: 'desc' },
		})

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Report')

		worksheet.addRow([])
		worksheet.addRow([])

		const headerRow = worksheet.addRow([
			'№',
			'Клиент',
			'Информация',
			'Оплата наличными',
			'Оплата с банковской карты',
			'Оплата перечислением',
			'Оплата другими способами',
			'Оплата через карту Humo',
			'Пользователь',
			'Дата',
		])
		headerRow.font = { bold: true }
		headerRow.alignment = { vertical: 'middle' }
		headerRow.height = 24
		headerRow.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' }

		worksheet.getColumn(1).width = 6
		worksheet.getColumn(2).width = 22
		worksheet.getColumn(3).width = 20
		worksheet.getColumn(4).width = 16
		worksheet.getColumn(5).width = 16
		worksheet.getColumn(6).width = 16
		worksheet.getColumn(6).width = 16
		worksheet.getColumn(6).width = 16
		worksheet.getColumn(6).width = 20
		worksheet.getColumn(6).width = 20

		headerRow.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			}
		})

		// Ma'lumotlarni kiritish
		paymentList.forEach((payment, index: number) => {
			const row = worksheet.addRow([
				index + 1,
				payment.client.name,
				payment.description,
				payment.cash.toNumber(),
				payment.card.toNumber(),
				payment.transfer,
				payment.other,
				0,
				payment?.order?.admin?.phone || '',
				format(payment.createdAt, 'dd.MM.yyyy HH:mm'),
			])

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

		// Excel faylni saqlash
		let date = new Date().toLocaleString()
		date = date.replaceAll(',', '')
		date = date.replaceAll('.', '')
		date = date.replaceAll(' ', '')
		date = date.replaceAll(':', '')

		payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		payload.res.setHeader('Content-Disposition', `attachment; filename=incoming-order-${date}.xlsx`)

		await workbook.xlsx.write(payload.res)
		payload.res.end()
	}

	async paymentRetrieve(payload: PaymentRetriveRequest): Promise<PaymentRetriveResponse> {
		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				totalPay: true,
				description: true,
				createdAt: true,
				order: {
					select: {
						id: true,
						sum: true,
						debt: true,
					},
				},
				client: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
			},
		})
		if (!payment) {
			throw new NotFoundException('Payment not found')
		}
		return {
			...payment,
			totalPay: payment.totalPay.toNumber(),
			cash: (payment.cash as Decimal).toNumber(),
			card: payment.card ? (payment.card as Decimal).toNumber() : undefined,
			transfer: (payment.transfer as Decimal).toNumber(),
			other: (payment.other as Decimal).toNumber(),
		}
	}

	async paymentCreate(payload: PaymentCreateRequest): Promise<null> {
		console.log(payload)
		const { card = 0, transfer = 0, other = 0, cash = 0, orderId, clientId, description } = payload

		const order = orderId
			? await this.#_prisma.order.findFirst({
					where: { id: orderId },
					include: { products: { include: { product: true } }, client: true },
			  })
			: null

		const sum = card + transfer + other + cash

		const payment = await this.#_prisma.$transaction(async (prisma) => {
			let paymentData = null
			if (sum > 0) {
				paymentData = await prisma.payment.create({
					data: {
						orderId: orderId,
						clientId: clientId,
						totalPay: sum,
						cash: cash,
						transfer: transfer,
						card: card,
						other: other,
						description: description,
					},
					select: {
						id: true,
						totalPay: true,
						card: true,
						cash: true,
						transfer: true,
						other: true,
						description: true,
						client: {
							select: {
								name: true,
							},
						},
					},
				})
			}

			if (orderId && order) {
				await Promise.all(
					order.products.map((pro) =>
						prisma.products.update({
							where: { id: pro.productId },
							data: { count: { decrement: pro.count } },
						}),
					),
				)

				const currentDebt = order.debt.toNumber()
				const newDebt = currentDebt - sum

				await prisma.order.update({
					where: { id: orderId },
					data: {
						debt: newDebt,
						accepted: true,
					},
				})
			}

			await prisma.users.update({
				where: { id: clientId },
				data: { debt: { decrement: sum } },
			})

			return paymentData
		})

		if (order && order.accepted === false) {
			const text = `💼 продажа\n\n✍️ ид заказа: ${order.articl}\n\n💵 сумма: ${order.sum}\n\n💳 долг: ${order.debt}\n\n👨‍💼 клиент: ${order.client.name}`

			await this.#_telegram.sendMessage(parseInt(process.env.ORDER_CHANEL_ID), text)

			const pdfBuffer = await generatePdfBuffer(order)

			await this.#_telegram.sendDocument(parseInt(process.env.ORDER_CHANEL_ID), Buffer.from(pdfBuffer), 'order-details.pdf')

			if (payload.sendUser && order.client.chatId) {
				await this.#_telegram.sendMessage(Number(order.client.chatId), text)
			}
		}

		if (payment) {
			const message =
				`${order ? 'тип: для продажи\n' : 'тип: для клиента\n'}` +
				`Клиент: ${payment.client.name}\n` +
				`Сумма: ${payment.totalPay}\n\n` +
				`наличными: ${payment.cash}\n` +
				`карты: ${payment.card}\n` +
				`перечислением: ${payment.transfer}\n` +
				`други: ${payment.other}\n` +
				`Дата: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n` +
				`Инфо: ${payment.description}\n` +
				`id: ${payment.id}`

			await this.#_telegram.sendMessage(parseInt(process.env.PAYMENT_CHANEL_ID), message)
		}

		return null
	}

	async paymentUpdate(payload: PaymentUpdateRequest): Promise<null> {
		const { id, card = 0, transfer = 0, other = 0, cash = 0, description } = payload

		const payment = await this.#_prisma.payment.findUnique({
			where: { id },
			include: { client: true, order: true },
		})
		if (!payment) throw new NotFoundException('payment not found')

		const sum = card + transfer + other + cash

		await this.#_prisma.payment.update({
			where: { id: payload.id },
			data: {
				totalPay: sum,
				cash: cash,
				transfer: transfer,
				card: card,
				other: other,
				description: description,
			},
		})

		const pay = sum - payment.totalPay.toNumber()

		await this.#_prisma.users.update({
			where: { id: payment.clientId },
			data: { debt: { decrement: pay } },
		})

		if (payment.order) {
			await this.#_prisma.order.update({
				where: { id: payment.order.id },
				data: { debt: { decrement: pay } },
			})
		}

		const message = `обновлено\n\n${payment.order ? 'тип: для продажи\n' : 'тип: для клиента\n'}Клиент: ${payment.client.name}\nСумма: ${payment.totalPay}\n\nналичными: ${
			payment.cash
		}\nкарты: ${payment.card}\nперечислением: ${payment.transfer}\nдруги: ${payment.other}\nДата: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\nИнфо: ${
			payment.description
		}\nid: #${payment.id}`

		await this.#_telegram.sendMessage(parseInt(process.env.PAYMENT_CHANEL_ID), message)

		return null
	}

	async paymentDelete(payload: PaymentDeleteRequest): Promise<null> {
		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { order: true, client: true },
		})

		if (!payment) throw new NotFoundException('payment not found')

		await this.#_prisma.payment.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		await this.#_prisma.users.update({
			where: { id: payment.clientId },
			data: { debt: { decrement: payment.totalPay } },
		})

		if (payment.order) {
			await this.#_prisma.order.update({
				where: { id: payment.orderId },
				data: { debt: { increment: payment.totalPay } },
			})
		}

		const message = `удалено\n\n${payment.order ? 'тип: для продажи\n' : 'тип: для клиента\n'}Клиент: ${payment.client.name}\nСумма: ${payment.totalPay}\n\nналичными: ${
			payment.cash
		}\nкарты: ${payment.card}\nперечислением: ${payment.transfer}\nдруги: ${payment.other}\nДата: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\nИнфо: ${
			payment.description
		}\nid: #${payment.id}`
		await this.#_telegram.sendMessage(parseInt(process.env.PAYMENT_CHANEL_ID), message)

		return null
	}
}
