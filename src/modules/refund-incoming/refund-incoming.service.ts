import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
	RefundIncomingCreateRequest,
	RefundIncomingCreateResponse,
	RefundIncomingDeleteRequest,
	RefundIncomingRetriveAllRequest,
	RefundIncomingRetriveAllResponse,
	RefundIncomingRetriveRequest,
	RefundIncomingRetriveResponse,
	RefundIncomingUpdateRequest,
} from './interfaces'
import { Decimal } from '../../types'
import { addHours, endOfDay, format } from 'date-fns'
import { TelegramService } from '../telegram'

@Injectable()
export class RefundIncomingService {
	readonly #_prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.#_prisma = prisma
	}

	async refundIncomingRetrieveAll(payload: RefundIncomingRetriveAllRequest): Promise<RefundIncomingRetriveAllResponse> {
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

			const RefundIncomingList = await this.#_prisma.refundIncoming.findMany({
				where: {
					deletedAt: null,
					...sellerOption,
					...searchOption,
					...dateOption,
				},
				select: {
					id: true,
					sum: true,
					description: true,
					createdAt: true,
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

			const formattedData = RefundIncomingList.map((refundIncoming) => ({
				...refundIncoming,
				sum: refundIncoming.sum.toNumber(),
				seller: refundIncoming.admin,
				products: refundIncoming.products.map((prod) => ({
					...prod,
					price: (prod.price as Decimal).toNumber(),
				})),
			}))

			const totalCount = await this.#_prisma.refundIncoming.count({
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
		} catch (error) {
			console.log(error)
		}
	}

	async RefundIncomingRetrieve(payload: RefundIncomingRetriveRequest): Promise<RefundIncomingRetriveResponse> {
		const RefundIncoming = await this.#_prisma.refundIncoming.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				sum: true,
				description: true,
				createdAt: true,
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

		if (!RefundIncoming) {
			throw new NotFoundException('RefundIncoming not found')
		}

		return {
			...RefundIncoming,
			seller: RefundIncoming.admin,
			sum: RefundIncoming.sum.toNumber(),
			products: RefundIncoming.products.map((prod) => ({
				...prod,
				price: (prod.price as Decimal).toNumber(),
			})),
		}
	}

	async RefundIncomingCreate(payload: RefundIncomingCreateRequest): Promise<RefundIncomingCreateResponse> {
		try {
			const { supplierId, products, userId, description } = payload

			// Mijozni tekshirish
			const user = await this.#_prisma.users.findFirst({
				where: { id: supplierId, deletedAt: null },
			})
			if (!user) throw new NotFoundException('Mijoz topilmadi')

			const totalSum = products.reduce((sum, product) => sum + product.price * product.count, 0)

			const now = this.adjustToTashkentTime()

			const refundIncoming = await this.#_prisma.refundIncoming.create({
				data: {
					supplierId: supplierId,
					adminId: userId,
					sum: totalSum,
				},
			})

			const promises: any = []
			products.forEach((product) => {
				promises.push(
					this.#_prisma.refundIncomingProduct.create({
						data: {
							orderId: refundIncoming.id,
							productId: product.product_id,
							count: product.count,
							price: product.price,
						},
					}),
					this.#_prisma.products.update({
						where: { id: product.product_id },
						data: { count: { decrement: product.count } },
					}),
				)
			})

			promises.push(
				this.#_prisma.users.update({
					where: { id: supplierId },
					data: { debt: { increment: totalSum } },
				}),
			)

			await Promise.all(promises)

			return {
				id: refundIncoming.id,
			}
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException('Kutilmagan xatolik!')
		}
	}

	async RefundIncomingUpdate(payload: RefundIncomingUpdateRequest): Promise<null> {
		try {
			// const { id, } = payload

			// const refundIncoming = await this.#_prisma.refundIncoming.findUnique({
			// 	where: { id },
			// 	select: {
			// 		id: true,
			// 		accepted: true,
			// 		client: true,
			// 		sum: true,
			// 		clientId: true,
			// 		cashPayment: true,
			// 		description: true,
			// 		fromClient: true,
			// 		products: {
			// 			select: {
			// 				id: true,
			// 				count: true,
			// 				price: true,
			// 				productId: true,
			// 				product: {
			// 					select: {
			// 						name: true,
			// 					},
			// 				},
			// 			},
			// 		},
			// 	},
			// })
			// if (!refundIncoming) throw new NotFoundException("Ma'lumot topilmadi")

			// if (accepted) {
			// 	const updatedProducts = refundIncoming.products.map((pr) =>
			// 		this.#_prisma.products.update({
			// 			where: { id: pr.productId },
			// 			data: { count: { increment: pr.count } },
			// 		}),
			// 	)

			// 	await Promise.all([
			// 		...updatedProducts,
			// 		this.#_prisma.users.update({
			// 			where: { id: refundIncoming.clientId },
			// 			data: { debt: { decrement: refundIncoming.fromClient } },
			// 		}),
			// 		this.#_prisma.refundIncoming.update({
			// 			where: { id },
			// 			data: {
			// 				accepted: true,
			// 				cashPayment,
			// 				fromClient,
			// 				description,
			// 			},
			// 		}),
			// 	])
			// } else {
			// 	await this.#_prisma.refundIncoming.update({
			// 		where: { id },
			// 		data: {
			// 			cashPayment,
			// 			fromClient,
			// 			description,
			// 		},
			// 	})
			// }

			return null
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException("Kutilmagan xatolik! Qaytadan urinib ko'ring")
		}
	}

	async RefundIncomingDelete(payload: RefundIncomingDeleteRequest): Promise<null> {
		const refundIncoming = await this.#_prisma.refundIncoming.findUnique({
			where: { id: payload.id, deletedAt: null },
			select: {
				id: true,
				sum: true,
				supplierId: true,
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

		if (!refundIncoming) throw new NotFoundException('maxsulot topilmadi')

		const promises: any = []
		const refundIncomingProductIds = refundIncoming.products.map((product) => product.id)
		promises.push(
			this.#_prisma.returnedProduct.updateMany({
				where: { id: { in: refundIncomingProductIds } },
				data: { deletedAt: new Date() },
			}),
		)

		const products = refundIncoming.products.map((product) =>
			this.#_prisma.products.update({
				where: { id: product.productId },
				data: { count: { increment: product.count } },
			}),
		)

		await Promise.all([
			...products,
			this.#_prisma.users.update({
				where: { id: refundIncoming.supplierId },
				data: { debt: { decrement: refundIncoming.sum } },
			}),
			this.#_prisma.refundIncoming.update({
				where: { id: payload.id },
				data: { deletedAt: new Date() },
			}),
		])

		return null
	}

	private adjustToTashkentTime(): Date {
		const tashkentDate = new Date()
		tashkentDate.setTime(tashkentDate.getTime() + 5 * 60 * 60 * 1000)
		return tashkentDate
	}
}
