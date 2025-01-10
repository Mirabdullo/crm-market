import { AdminResponse } from '../../admins'
import { ReturnedProductRetriveResponse } from '../../returned-products'
import { UserResponse } from '../../users'

export declare interface ReturnedOrderRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: ReturnedOrderRetriveResponse[]
}

export declare interface ReturnedOrderRetriveResponse {
	id: string
	sum: number
	fromClient: number
	cashPayment: number
	accepted: boolean
	createdAt: Date
	description: string
	client: UserResponse
	seller: AdminResponse
	products: ReturnedProductRetriveResponse[]
}
