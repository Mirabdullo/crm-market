import { AdminResponse } from '../../admins'
import { IncomingProductRetriveResponse } from '../../incoming-products'
import { PaymentResponse } from '../../payment'
import { UserRetriveResponse } from '../../users'

export declare interface IncomingOrderRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: IncomingOrderRetriveResponse[]
}

export declare interface IncomingOrderRetriveResponse {
	id: string
	sum: number
	accepted: boolean
	createdAt: Date
	supplier: UserRetriveResponse
	admin: AdminResponse
	payment: PaymentResponse
	incomingProducts: IncomingProductRetriveResponse[]
}
