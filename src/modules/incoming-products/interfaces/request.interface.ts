export interface IncomingProductCreateRequest {
	incomingOrderId: string
	product_id: string
	cost: number
	count: number
	selling_price?: number
	wholesale_price?: number
}

export interface IncomingProductUpdateRequest {
	id: string
	cost?: number
	count?: number
	selling_price?: number
	wholesale_price?: number
}

export interface IncomingProductDeleteRequest {
	id: string
}

export interface IncomingProductRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface IncomingProductRetriveRequest {
	id: string
}
