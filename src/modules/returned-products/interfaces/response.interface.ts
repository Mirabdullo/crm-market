export declare interface ReturnedProductRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: ReturnedProductRetriveResponse[]
}

export declare interface ReturnedProductRetriveResponse {
	id: string
	count: number
	price: number
	createdAt: Date
	product: ProductForReturnedProduct
}

export declare interface ProductForReturnedProduct {
	id: string
	name: string
}
