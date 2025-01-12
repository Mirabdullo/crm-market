export declare interface RefundIncomingProductRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: RefundIncomingProductRetriveResponse[]
}

export declare interface RefundIncomingProductRetriveResponse {
	id: string
	count: number
	price: number
	createdAt: Date
	product: ProductForRefundIncomingProduct
}

export declare interface ProductForRefundIncomingProduct {
	id: string
	name: string
}
