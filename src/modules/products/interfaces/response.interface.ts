export declare interface ProductRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: ProductRetriveResponse[]
}

export declare interface ProductRetriveResponse {
	id: string
	name: string
	count: number
	unit: string
	min_amount: number
	cost: number
	avarage_cost?: number
	selling_price: number
	wholesale_price: number
	image?: string
	category?: string
}
