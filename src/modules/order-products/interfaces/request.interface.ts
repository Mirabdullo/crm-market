export interface OrderProductCreateRequest {
	order_id: string
	product_id: string
	price: number
	cost?: number
	count: number
	sendUser?: boolean
}

export interface OrderProductRequest {
	product_id: string
	price: number
	cost?: number
	count: number
}

export interface OrderProductUpdateRequest {
	id: string
	cost?: number
	count?: number
	price?: number
	sendUser?: boolean
}

export interface OrderProductDeleteRequest {
	id: string
	sendUser?: boolean
}

export interface OrderProductRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface OrderProductRetriveRequest {
	id: string
}
