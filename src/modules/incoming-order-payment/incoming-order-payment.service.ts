import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	IncomingOrderPaymentCreateRequest,
	IncomingOrderPaymentDeleteRequest,
	IncomingOrderPaymentRetriveAllRequest,
	IncomingOrderPaymentRetriveAllResponse,
	IncomingOrderPaymentRetriveRequest,
	IncomingOrderPaymentRetriveResponse,
	IncomingOrderPaymentUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import * as ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { TelegramService } from '../telegram'

@Injectable()
export class IncomingOrderPaymentService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegram: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegram
	}

	async incomingOrderPaymentRetrieveAll(payload: IncomingOrderPaymentRetriveAllRequest): Promise<IncomingOrderPaymentRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		let clientOption = {}
		if (payload.supplierId) {
			clientOption = {
				supplierId: payload.supplierId,
			}
		}

		const incomingOrderPaymentList = await this.#_prisma.incomingOrderPayment.findMany({
			where: { deletedAt: null, ...clientOption },
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				humo: true,
				createdAt: true,
				order: {
					select: {
						id: true,
						sum: true,
						debt: true,
					},
				},
				supplier: {
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

		const transformedIncomingOrderPaymentList = incomingOrderPaymentList.map((incomingOrderPayment) => ({
			...incomingOrderPayment,
			cash: (incomingOrderPayment.cash as Decimal).toNumber(),
			card: incomingOrderPayment.card ? (incomingOrderPayment.card as Decimal).toNumber() : undefined,
			transfer: (incomingOrderPayment.transfer as Decimal).toNumber(),
			other: (incomingOrderPayment.other as Decimal).toNumber(),
			humo: (incomingOrderPayment.humo as Decimal).toNumber(),
		}))

		const totalCount = await this.#_prisma.incomingOrderPayment.count({
			where: { deletedAt: null },
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedIncomingOrderPaymentList,
		}
	}

	async paymentRetrieveAllUpload(payload: IncomingOrderPaymentRetriveAllRequest): Promise<void> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
			}
		}

		let clientOption = {}
		if (payload.supplierId) {
			clientOption = {
				supplierId: payload.supplierId,
			}
		}

		let searchOption = {}
		if (payload.search) {
			searchOption = {
				supplier: {
					OR: [{ name: { contains: payload.search, mode: 'insensitive' } }, { phone: { contains: payload.search, mode: 'insensitive' } }],
				},
			}
		}

		const incomingOrderPaymentList = await this.#_prisma.incomingOrderPayment.findMany({
			where: { deletedAt: null, ...clientOption, ...searchOption },
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				humo: true,
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
				supplier: {
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

		const totalCalc = {
			totalPay: 0,
			totalCard: 0,
			totalCash: 0,
			totalTransfer: 0,
			totalOther: 0,
		}

		incomingOrderPaymentList.forEach((payment) => {
			totalCalc.totalCard += payment.card.toNumber()
			totalCalc.totalCash += payment.cash.toNumber()
			totalCalc.totalTransfer += payment.transfer.toNumber()
			totalCalc.totalOther += payment.other.toNumber()
		})

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Report')

		worksheet.mergeCells('A1:C1')
		worksheet.getCell('A1').value = 'Отчёт по по погашениям клиентов'
		worksheet.getCell('A1').font = { bold: true }

		worksheet.mergeCells('A2:C2')
		worksheet.getCell('A2').value = `Начало: ${format(payload.startDate, 'dd/MM/yyyy')}`
		worksheet.getCell('A2').font = { bold: true }

		worksheet.mergeCells('A3:C3')
		worksheet.getCell('A3').value = `Конец: ${format(payload.startDate, 'dd/MM/yyyy')}`
		worksheet.getCell('A3').font = { bold: true }

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
		worksheet.getColumn(7).width = 16
		worksheet.getColumn(8).width = 16
		worksheet.getColumn(9).width = 20
		worksheet.getColumn(10).width = 20

		headerRow.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			}
		})

		// Ma'lumotlarni kiritish
		incomingOrderPaymentList.forEach((payment, index: number) => {
			const row = worksheet.addRow([
				index + 1,
				payment.supplier.name,
				payment.description,
				payment.cash.toNumber(),
				payment.card.toNumber(),
				payment.transfer.toNumber(),
				payment.other.toNumber(),
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

		const endRow = worksheet.addRow([
			'№',
			'Клиент',
			'Информация',
			`Сумма: ${totalCalc.totalCash}`,
			`Сумма: ${totalCalc.totalCard}`,
			`Сумма: ${totalCalc.totalTransfer}`,
			`Сумма: ${totalCalc.totalOther}`,
			`Сумма: 0`,
			'',
			'',
		])

		endRow.font = { bold: true }

		payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		payload.res.setHeader(
			'Content-Disposition',
			`attachment; filename=отчёт по погашениям клиентов с ${format(new Date(payload.startDate), 'dd-MM-yyyy')} по ${format(new Date(payload.endDate), 'dd-MM-yyyy')}.xlsx`,
		)

		await workbook.xlsx.write(payload.res)
		payload.res.end()
	}

	async incomingOrderPaymentRetrieve(payload: IncomingOrderPaymentRetriveRequest): Promise<IncomingOrderPaymentRetriveResponse> {
		const incomingOrderPayment = await this.#_prisma.incomingOrderPayment.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				card: true,
				cash: true,
				transfer: true,
				other: true,
				humo: true,
				createdAt: true,
				order: {
					select: {
						id: true,
						sum: true,
						debt: true,
					},
				},
				supplier: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
			},
		})
		if (!incomingOrderPayment) {
			throw new NotFoundException('IncomingOrderPayment not found')
		}
		return {
			...incomingOrderPayment,
			cash: (incomingOrderPayment.cash as Decimal).toNumber(),
			card: incomingOrderPayment.card ? (incomingOrderPayment.card as Decimal).toNumber() : undefined,
			transfer: (incomingOrderPayment.transfer as Decimal).toNumber(),
			other: (incomingOrderPayment.other as Decimal).toNumber(),
			humo: (incomingOrderPayment.humo as Decimal).toNumber(),
		}
	}

	async incomingOrderPaymentCreate(payload: IncomingOrderPaymentCreateRequest): Promise<null> {
		const { orderId, supplierId, cash, transfer, card, other } = payload
		const order = orderId
			? await this.#_prisma.incomingOrder.findFirst({
					where: { id: orderId },
			  })
			: null

		const client = await this.#_prisma.users.findFirst({
			where: { id: supplierId },
		})

		if (!client) throw new ForbiddenException('Mijoz topilmadi')
		if (orderId && !order) throw new ForbiddenException('Mahsulot tushiruvi topilmadi')

		const sum = (cash || 0) + (card || 0) + (transfer || 0) + (other || 0)

		if (sum > 0) {
			const payment = await this.#_prisma.incomingOrderPayment.create({
				data: {
					orderId: orderId || null, // Order bo‘lmasa null
					supplierId,
					totalPay: sum,
					cash: cash || 0,
					transfer: transfer || 0,
					card: card || 0,
					other: other || 0,
				},
				include: { order: true, supplier: true },
			})

			try {
				const message = `${order ? 'тип: для новых продуктов\n' : 'тип: для поставщика\n'}👨‍💼 Поставщик: ${payment.supplier.name}\n💰 Сумма: ${
					payment.totalPay
				}\n\n💵 наличными: ${payment.cash}\n💳 карты: ${payment.card}\n💸 перечислением: ${payment.transfer}\n♻️ други: ${payment.other}\n🕐 Дата: ${format(
					new Date(),
					'yyyy-MM-dd HH:mm',
				)}\n📔 Инфо: ${payment.description}\n📍 id: #${payment.id}`
				await this.#_telegram.sendMessage(parseInt(process.env.PAYMENT_CHANEL_ID), message)
			} catch (error) {
				console.log(error)
			}
		}

		const promises = []

		// Agar order mavjud bo'lsa, orderning qarzini yangilash
		if (order) {
			const pSum = order.debt.toNumber() >= sum ? { decrement: sum } : 0
			promises.push(
				this.#_prisma.incomingOrder.update({
					where: { id: orderId },
					data: {
						debt: pSum, // Orderning qarzi kamayadi
					},
				}),
			)

			// Agar order tasdiqlangan bo'lsa, mijozning qarzi o'zgaradi
			if (format(order.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
				promises.push(
					this.#_prisma.users.update({
						where: { id: supplierId },
						data: {
							debt: { decrement: sum },
						},
					}),
				)
			}
		} else {
			// Agar order yo'q bo'lsa, faqat mijozning qarzi o'zgaradi
			promises.push(
				this.#_prisma.users.update({
					where: { id: supplierId },
					data: {
						debt: { decrement: sum },
					},
				}),
			)
		}

		await Promise.all(promises)

		return null
	}

	async incomingOrderPaymentUpdate(payload: IncomingOrderPaymentUpdateRequest): Promise<null> {
		const { id, cash, transfer, card, other, description } = payload

		const payment = await this.#_prisma.incomingOrderPayment.findFirst({
			where: { id },
			include: { order: true, supplier: true },
		})
		if (!payment) throw new NotFoundException("To'lov topilmadi")

		const order = payment.orderId
			? await this.#_prisma.incomingOrder.findFirst({
					where: { id: payment.orderId },
			  })
			: null

		const client = await this.#_prisma.users.findFirst({
			where: { id: payment.supplierId },
		})

		if (!client) throw new NotFoundException('Mijoz topilmadi')
		if (payment.orderId && !order) throw new NotFoundException('Mahsulot tushiruvi topilmadi')

		const newSum = (cash || 0) + (card || 0) + (transfer || 0) + (other || 0)
		const previousSum = payment.totalPay.toNumber()
		const difference = newSum - previousSum

		const promises = []

		// To'lovni yangilash
		promises.push(
			this.#_prisma.incomingOrderPayment.update({
				where: { id },
				data: {
					totalPay: newSum,
					cash: cash || 0,
					transfer: transfer || 0,
					card: card || 0,
					other: other || 0,
				},
			}),
		)

		// Agar order mavjud bo'lsa, uning qarzini yangilash
		if (order) {
			const pSum = order.debt.toNumber() >= newSum - payment.totalPay.toNumber() ? -difference : 0
			promises.push(
				this.#_prisma.incomingOrder.update({
					where: { id: payment.orderId },
					data: {
						debt: { increment: pSum }, // Orderning qarz qiymatini farq bo'yicha yangilash
					},
				}),
			)

			// Agar order tasdiqlangan bo'lsa, mijozning qarzini yangilash
			if (format(order.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
				promises.push(
					this.#_prisma.users.update({
						where: { id: payment.supplierId },
						data: {
							debt: { increment: -difference }, // Mijozning qarz qiymatini farq bo'yicha yangilash
						},
					}),
				)
			}
		} else {
			// Agar order yo'q bo'lsa, faqat mijozning qarzini yangilash
			promises.push(
				this.#_prisma.users.update({
					where: { id: payment.supplierId },
					data: {
						debt: { increment: -difference }, // Mijozning qarz qiymatini farq bo'yicha yangilash
					},
				}),
			)
		}

		try {
			const message = `обновлено\n\n${order ? 'тип: для новых продуктов\n' : 'тип: для поставщика\n'}👨‍💼 Поставщик: ${
				payment.supplier.name
			}\n💰 Сумма: ${newSum}\n\nналичными: ${cash || payment.cash}\n💳 карты: ${card || payment.card}\n💸 перечислением: ${transfer || payment.transfer}\n♻️ други: ${
				other || payment.other
			}\n🕐 Дата: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n📔 Инфо: ${description || payment.description}\n📍 id: #${payment.id}`
			await this.#_telegram.sendMessage(parseInt(process.env.PAYMENT_CHANEL_ID), message)
		} catch (error) {
			console.log(error)
		}

		await Promise.all(promises)
		return null
	}

	async incomingOrderPaymentDelete(payload: IncomingOrderPaymentDeleteRequest): Promise<null> {
		const payment = await this.#_prisma.incomingOrderPayment.findFirst({
			where: { id: payload.id },
			include: { supplier: true, order: true },
		})

		if (!payment) throw new NotFoundException("To'lov topilmadi")

		const order = payment.orderId
			? await this.#_prisma.incomingOrder.findFirst({
					where: { id: payment.orderId },
			  })
			: null

		const client = await this.#_prisma.users.findFirst({
			where: { id: payment.supplierId },
		})

		if (!client) throw new NotFoundException('Mijoz topilmadi')

		const promises = []

		// Agar order mavjud bo'lsa, uning qarzini yangilash
		if (order) {
			promises.push(
				this.#_prisma.incomingOrder.update({
					where: { id: payment.orderId },
					data: {
						debt: { increment: payment.totalPay.toNumber() }, // To'lov summasini qaytarish
					},
				}),
			)

			// Agar order tasdiqlangan bo'lsa, mijozning qarzini yangilash
			if (format(order.sellingDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd')) {
				promises.push(
					this.#_prisma.users.update({
						where: { id: payment.supplierId },
						data: {
							debt: { increment: payment.totalPay.toNumber() }, // To'lov summasini qaytarish
						},
					}),
				)
			}
		} else {
			// Agar order yo'q bo'lsa, faqat mijozning qarzini yangilash
			promises.push(
				this.#_prisma.users.update({
					where: { id: payment.supplierId },
					data: {
						debt: { increment: payment.totalPay.toNumber() }, // To'lov summasini qaytarish
					},
				}),
			)
		}

		// To'lovni o'chirish
		promises.push(
			this.#_prisma.incomingOrderPayment.delete({
				where: { id: payload.id },
			}),
		)

		await Promise.all(promises)

		try {
			const message = `🗑 удалено\n\n${order ? 'тип: новых продуктов\n' : 'тип: поставщика\n'}Поставщик: ${payment.supplier.name}\n💰 Сумма: ${
				payment.totalPay
			}\n\nналичными: ${payment.cash}\nкарты: ${payment.card}\nперечислением: ${payment.transfer}\nдруги: ${payment.other}\nДата: ${format(
				new Date(),
				'yyyy-MM-dd HH:mm',
			)}\nИнфо: ${payment.description}\nid: #${payment.id}`
			await this.#_telegram.sendMessage(parseInt(process.env.PAYMENT_CHANEL_ID), message)
		} catch (error) {
			console.log(error)
		}
		return null
	}
}
