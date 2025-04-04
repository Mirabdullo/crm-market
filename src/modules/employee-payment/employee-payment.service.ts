import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	EmloyeePaymentCreateRequest,
	EmloyeePaymentDeleteRequest,
	EmloyeePaymentRetriveAllRequest,
	EmloyeePaymentRetriveAllResponse,
	EmloyeePaymentRetriveRequest,
	EmloyeePaymentRetriveResponse,
	EmloyeePaymentUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import * as ExcelJS from 'exceljs'
import { addHours, endOfDay, format } from 'date-fns'
import { TelegramService } from '../telegram/telegram.service'
import { generatePdfBuffer } from '../order/format-to-pdf'

@Injectable()
export class EmloyeePaymentService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async employeePaymentRetrieveAll(payload: EmloyeePaymentRetriveAllRequest): Promise<EmloyeePaymentRetriveAllResponse> {
		let paginationOptions = {}
		if (payload.pagination) {
			paginationOptions = {
				take: payload.pageSize,
				skip: (payload.pageNumber - 1) * payload.pageSize,
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

		let sellerOption = {}
		if (payload.sellerId) {
			sellerOption = {
				employeeId: payload.sellerId,
			}
		}

		const employeePaymentList = await this.#_prisma.employeePayment.findMany({
			where: { deletedAt: null, ...searchOption, ...dateOption, ...sellerOption },
			select: {
				id: true,
				sum: true,
				createdAt: true,
				description: true,
				employee: {
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

		const transformedEmloyeePaymentList = employeePaymentList.map((employeePayment) => ({
			...employeePayment,
			sum: employeePayment.sum.toNumber(),
		}))

		const totalCount = await this.#_prisma.employeePayment.count({
			where: { deletedAt: null, ...searchOption, ...dateOption, ...sellerOption },
		})

		return {
			totalCount: totalCount,
			pageNumber: payload.pageNumber,
			pageSize: payload.pageSize,
			pageCount: Math.ceil(totalCount / payload.pageSize),
			data: transformedEmloyeePaymentList,
		}
	}

	async employeePaymentRetrieve(payload: EmloyeePaymentRetriveRequest): Promise<EmloyeePaymentRetriveResponse> {
		const employeePayment = await this.#_prisma.employeePayment.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				sum: true,
				description: true,
				createdAt: true,
				employee: {
					select: {
						id: true,
						name: true,
						phone: true,
					},
				},
			},
		})
		if (!employeePayment) {
			throw new NotFoundException('EmloyeePayment not found')
		}
		return {
			...employeePayment,
			sum: (employeePayment.sum as Decimal).toNumber(),
		}
	}

	async employeePaymentCreate(payload: EmloyeePaymentCreateRequest): Promise<null> {
		const { employeeId, sum, description } = payload

		const condidat = await this.#_prisma.admins.findFirst({
			where: { id: employeeId },
		})

		if (!condidat) {
			throw new NotFoundException('Admin topilmadi!')
		}

		await this.#_prisma.employeePayment.create({
			data: {
				employeeId,
				sum,
				description: description,
			}
		})

		return null
	}

	async employeePaymentUpdate(payload: EmloyeePaymentUpdateRequest): Promise<null> {
		const { id, sum, description } = payload

		const employeePayment = await this.#_prisma.employeePayment.findUnique({
			where: { id },
		})
		if (!employeePayment) throw new NotFoundException('employeePayment not found')


		await this.#_prisma.employeePayment.update({
			where: { id },
			data: {
				sum,
				description,
			},
		})

		return null
	}

	async employeePaymentDelete(payload: EmloyeePaymentDeleteRequest): Promise<null> {
		const employeePayment = await this.#_prisma.employeePayment.findUnique({
			where: { id: payload.id, deletedAt: null },
		})

		if (!employeePayment) throw new NotFoundException('employeePayment not found')

		await this.#_prisma.employeePayment.update({
			where: { id: payload.id },
			data: { deletedAt: new Date() },
		})

		return null
	}
}
