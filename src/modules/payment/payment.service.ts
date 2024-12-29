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
import { format } from 'date-fns'

@Injectable()
export class PaymentService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
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
			where: { deletedAt: null, ...clientOption, ...searchOption },
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

		worksheet.getColumn(1).width = 5
		worksheet.getColumn(2).width = 20
		worksheet.getColumn(3).width = 16
		worksheet.getColumn(4).width = 12
		worksheet.getColumn(5).width = 12
		worksheet.getColumn(6).width = 12
		worksheet.getColumn(6).width = 12
		worksheet.getColumn(6).width = 12
		worksheet.getColumn(6).width = 16
		worksheet.getColumn(6).width = 16

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
		payload.res.setHeader('Content-Disposition', `attachment; filename=Все погошения-${date}.xlsx`)

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
		const { card, transfer, other, cash, orderId, clientId, description } = payload
		const order = orderId
			? await this.#_prisma.order.findFirst({
					where: { id: orderId },
					include: { products: true },
			  })
			: null

		const sum = (card || 0) + (transfer || 0) + (other || 0) + (cash || 0)

		await this.#_prisma.$transaction(async (prisma) => {
			if (sum > 0) {
				await prisma.payment.create({
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
				})
			}

			if (orderId && order) {
				const updatedProducts = order.products.map((pro) =>
					prisma.products.update({
						where: { id: pro.productId },
						data: { count: { decrement: pro.count } },
					}),
				)
				await Promise.all(updatedProducts)

				const orderSum = sum > order.debt.toNumber() ? 0 : { decrement: sum }
				await prisma.order.update({
					where: { id: orderId },
					data: {
						debt: orderSum,
						accepted: true,
					},
				})
			}

			await prisma.users.update({
				where: { id: clientId },
				data: { debt: { increment: sum } },
			})
		})

		return null
	}

	async paymentUpdate(payload: PaymentUpdateRequest): Promise<null> {
		const { id, card, transfer, other, cash, description } = payload

		const payment = await this.#_prisma.payment.findUnique({
			where: { id },
			include: { client: true, order: true },
		})
		if (!payment) throw new NotFoundException('payment not found')

		const sum = (card || 0) + (transfer || 0) + (other || 0) + (cash || 0)

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

		await this.#_prisma.users.update({
			where: { id: payment.clientId },
			data: { debt: { decrement: sum - payment.totalPay.toNumber() } },
		})

		if (payment.order) {
			if (sum > payment.order.debt.toNumber()) {
				await this.#_prisma.order.update({
					where: { id: payment.order.id },
					data: { debt: { decrement: 0 } },
				})
			} else {
				await this.#_prisma.order.update({
					where: { id: payment.order.id },
					data: { debt: { decrement: sum - payment.totalPay.toNumber() } },
				})
			}
		}

		return null
	}

	async paymentDelete(payload: PaymentDeleteRequest): Promise<null> {
		const payment = await this.#_prisma.payment.findUnique({
			where: { id: payload.id, deletedAt: null },
			include: { order: true },
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

		return null
	}
}
