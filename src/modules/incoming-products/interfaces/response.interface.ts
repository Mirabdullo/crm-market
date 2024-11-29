import { ProductRetriveResponse } from '../../products'

export declare interface IncomingProductRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: IncomingProductRetriveResponse[]
}

export declare interface IncomingProductRetriveResponse {
	id: string
	count: number
	cost: number
	product: ProductRetriveResponse
}
