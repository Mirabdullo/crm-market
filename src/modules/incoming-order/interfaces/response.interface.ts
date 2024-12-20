import { AdminResponse } from '../../admins'
import { IncomingProductRetriveResponse } from '../../incoming-products'
import { PaymentResponse } from '../../payment'
import { UserResponse } from '../../users'

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
	debt: number
	accepted: boolean
	createdAt: Date
	sellingDate: Date
	supplier: UserResponse
	admin: AdminResponse
	payment: PaymentResponse
	incomingProducts: IncomingProductRetriveResponse[]
}
