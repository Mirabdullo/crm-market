import { AdminResponse } from '../../admins'
import { ReturnedProductRetriveResponse } from '../../returned-products'
import { UserResponse } from '../../users'

export declare interface RefundIncomingRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: RefundIncomingRetriveResponse[]
}

export declare interface RefundIncomingRetriveResponse {
	id: string
	sum: number
	createdAt: Date
	description: string
	supplier: UserResponse
	seller: AdminResponse
	products: ReturnedProductRetriveResponse[]
}
