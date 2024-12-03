export declare interface IncomingProductRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: IncomingProductRetriveResponse[]
}

export declare interface IncomingProductRetriveResponse {
	id: string
	cost: number
	count: number
	createdAt: Date
	selling_price: number
	wholesale_price: number
	product: ProductForIncomingProduct
}

export declare interface ProductForIncomingProduct {
	id: string
	name: string
	count: number
}
