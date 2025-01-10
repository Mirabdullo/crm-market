export interface ReturnedProductCreateRequest {
	order_id: string
	product_id: string
	price: number
	count: number
}

export interface ReturnedProductRequest {
	product_id: string
	price: number
	count: number
}

export interface ReturnedProductUpdateRequest {
	id: string
	count?: number
	price?: number
}

export interface ReturnedProductDeleteRequest {
	id: string
}

export interface ReturnedProductRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface ReturnedProductRetriveRequest {
	id: string
}
