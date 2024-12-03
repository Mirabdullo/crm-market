import { IncomingProductRetriveResponse } from '../../incoming-products'
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
	incomingProducts: IncomingProductRetriveResponse[]
}
