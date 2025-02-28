import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	ReturnedOrderCreateRequest,
	ReturnedOrderCreateResponse,
	ReturnedOrderDeleteRequest,
	ReturnedOrderRetriveAllRequest,
	ReturnedOrderRetriveAllResponse,
	ReturnedOrderRetriveRequest,
	ReturnedOrderRetriveResponse,
	ReturnedOrderUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import { addHours, endOfDay, format } from 'date-fns'
import { TelegramService } from '../telegram'

@Injectable()
export class ReturnedOrderService {
	readonly #_prisma: PrismaService
	readonly #_telegram: TelegramService

	constructor(prisma: PrismaService, telegram: TelegramService) {
		this.#_prisma = prisma
		this.#_telegram = telegram
	}

	async ReturnedOrderRetrieveAll(payload: ReturnedOrderRetriveAllRequest): Promise<ReturnedOrderRetriveAllResponse> {
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
					accepted: true,
				}
			}

			const ReturnedOrderList = await this.#_prisma.returnedOrder.findMany({
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
					sum: true,
					fromClient: true,
					cashPayment: true,
					description: true,
					accepted: true,
					createdAt: true,
					returnedDate: true,
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
					products: {
						where: { deletedAt: null },
						select: {
							id: true,
							count: true,
							price: true,
							createdAt: true,
							product: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { createdAt: 'desc' },
					},
				},
				orderBy: { createdAt: 'desc' },
				...paginationOptions,
			})

			const formattedData = ReturnedOrderList.map((returnedOrder) => ({
				...returnedOrder,
				sum: returnedOrder.sum.toNumber(),
				fromClient: returnedOrder.fromClient.toNumber(),
				cashPayment: returnedOrder.cashPayment.toNumber(),
				seller: returnedOrder.admin,
				products: returnedOrder.products.map((prod) => ({
					...prod,
					price: (prod.price as Decimal).toNumber(),
				})),
			}))

			const totalCount = await this.#_prisma.returnedOrder.count({
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
			}
		} catch (error) {
			console.log(error)
		}
	}

	async ReturnedOrderRetrieve(payload: ReturnedOrderRetriveRequest): Promise<ReturnedOrderRetriveResponse> {
		const ReturnedOrder = await this.#_prisma.returnedOrder.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				sum: true,
				fromClient: true,
				cashPayment: true,
				description: true,
				accepted: true,
				createdAt: true,
				returnedDate: true,
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
				products: {
					where: { deletedAt: null },
					select: {
						id: true,
						count: true,
						price: true,
						createdAt: true,
						product: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				},
			},
		})

		if (!ReturnedOrder) {
			throw new NotFoundException('ReturnedOrder not found')
		}

		return {
			...ReturnedOrder,
			seller: ReturnedOrder.admin,
			sum: ReturnedOrder.sum.toNumber(),
			cashPayment: ReturnedOrder.cashPayment.toNumber(),
			fromClient: ReturnedOrder.fromClient.toNumber(),
			products: ReturnedOrder.products.map((prod) => ({
				...prod,
				price: (prod.price as Decimal).toNumber(),
				count: prod.count,
			})),
		}
	}

	async ReturnedOrderCreate(payload: ReturnedOrderCreateRequest): Promise<ReturnedOrderCreateResponse> {
		try {
			const { clientId, userId, products, description, returnedDate } = payload

			// Mijozni tekshirish
			const user = await this.#_prisma.users.findFirst({
				where: { id: clientId, deletedAt: null },
			})
			if (!user) throw new NotFoundException('Mijoz topilmadi')

			const totalSum = products.reduce((sum, product) => sum + product.price * product.count, 0)

			const now = this.adjustToTashkentTime(returnedDate)

			const returnedOrder = await this.#_prisma.returnedOrder.create({
				data: {
					clientId: clientId,
					adminId: userId,
					sum: totalSum,
					description,
					returnedDate: now,
				},
			})

			// ReturnedOrderProductlar yaratish uchun
			const returnedOrderProductsData = products.map((product) => ({
				orderId: returnedOrder.id,
				productId: product.product_id,
				count: product.count,
				price: product.price,
			}))

			await this.#_prisma.returnedProduct.createMany({ data: returnedOrderProductsData })

			return {
				id: returnedOrder.id,
			}
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException('Kutilmagan xatolik!')
		}
	}

	async ReturnedOrderUpdate(payload: ReturnedOrderUpdateRequest): Promise<null> {
		try {
			const { id, accepted, cashPayment, description, fromClient, returnedDate } = payload
			console.log(payload)
			const returnedOrder = await this.#_prisma.returnedOrder.findUnique({
				where: { id },
				select: {
					id: true,
					accepted: true,
					client: true,
					sum: true,
					clientId: true,
					cashPayment: true,
					description: true,
					fromClient: true,
					products: {
						select: {
							id: true,
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
			if (!returnedOrder) throw new NotFoundException("Ma'lumot topilmadi")

			const now = returnedDate ? this.adjustToTashkentTime(returnedDate) : undefined

			if (accepted && !returnedOrder.accepted) {
				const updatedProducts = returnedOrder.products.map((pr) =>
					this.#_prisma.products.update({
						where: { id: pr.productId },
						data: { count: { increment: pr.count } },
					}),
				)

				await Promise.all([
					...updatedProducts,
					this.#_prisma.users.update({
						where: { id: returnedOrder.clientId },
						data: { debt: { decrement: fromClient } },
					}),
					this.#_prisma.returnedOrder.update({
						where: { id },
						data: {
							accepted: true,
							cashPayment,
							fromClient,
							description,
							returnedDate: now,
						},
					}),
				])
			} else {
				await this.#_prisma.returnedOrder.update({
					where: { id },
					data: {
						cashPayment,
						fromClient,
						description,
						returnedDate: now,
					},
				})

				if (fromClient !== returnedOrder.fromClient.toNumber()) {
					await this.#_prisma.users.update({
                        where: { id: returnedOrder.clientId },
                        data: { debt: { decrement: fromClient - returnedOrder.fromClient.toNumber() } },
                    })
				}
			}

			return null
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException("Kutilmagan xatolik! Qaytadan urinib ko'ring")
		}
	}

	async ReturnedOrderDelete(payload: ReturnedOrderDeleteRequest): Promise<null> {
		const returnedOrder = await this.#_prisma.returnedOrder.findUnique({
			where: { id: payload.id, deletedAt: null },
			select: {
				id: true,
				accepted: true,
				client: true,
				sum: true,
				clientId: true,
				fromClient: true,
				products: {
					select: {
						id: true,
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

		if (!returnedOrder) throw new NotFoundException('maxsulot topilmadi')

		const promises: any = []
		const returnedOrderProductIds = returnedOrder.products.map((product) => product.id)
		promises.push(
			this.#_prisma.returnedProduct.updateMany({
				where: { id: { in: returnedOrderProductIds } },
				data: { deletedAt: new Date() },
			}),
		)

		if (returnedOrder.accepted) {
			const products = returnedOrder.products.map((product) =>
				this.#_prisma.products.update({
					where: { id: product.productId },
					data: { count: { decrement: product.count } },
				}),
			)

			promises.push(
				...products,
				this.#_prisma.users.update({
					where: { id: returnedOrder.clientId },
					data: { debt: { increment: returnedOrder.fromClient } },
				}),
			)
		}

		await Promise.all([
			...promises,
			this.#_prisma.returnedOrder.update({
				where: { id: payload.id },
				data: { deletedAt: new Date() },
			}),
		])

		return null
	}

	private adjustToTashkentTime(date?: string): Date {
		if (date) {
			const tashkentDate = new Date(date)
			tashkentDate.setTime(tashkentDate.getTime() + 5 * 60 * 60 * 1000)
			return tashkentDate
		} else {
			const tashkentDate = new Date()
			tashkentDate.setTime(tashkentDate.getTime() + 5 * 60 * 60 * 1000)
			return tashkentDate
		}
	}
}
