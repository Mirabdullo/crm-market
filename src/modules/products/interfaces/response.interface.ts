export declare interface ProductRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	totalCalc: ProductTotalCalc
	data: ProductRetriveResponse[]
}

export declare interface ProductTotalCalc {
	totalProductCount: number
	totalProductCost: number
	totalProductPrice: number
}

export declare interface ProductRetriveResponse {
	id: string
	name: string
	count: number
	unit: string
	min_amount: number
	cost: number
	selling_price: number
	wholesale_price: number
	image?: string
	category?: string
}
