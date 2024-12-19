export declare interface OrderProductRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: OrderProductRetriveResponse[]
}

export declare interface OrderProductRetriveResponse {
	id: string
	cost: number
	count: number
	price: number
	createdAt: Date
	product: ProductForOrderProduct
}

export declare interface ProductForOrderProduct {
	id: string
	name: string
	count: number
}
