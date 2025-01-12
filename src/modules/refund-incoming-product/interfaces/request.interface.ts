export interface RefundIncomingProductCreateRequest {
	order_id: string
	product_id: string
	price: number
	count: number
}

export interface RefundIncomingProductRequest {
	product_id: string
	price: number
	count: number
}

export interface RefundIncomingProductUpdateRequest {
	id: string
	count?: number
	price?: number
}

export interface RefundIncomingProductDeleteRequest {
	id: string
}

export interface RefundIncomingProductRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface RefundIncomingProductRetriveRequest {
	id: string
}
