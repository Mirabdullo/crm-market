export interface IncomingProductCreateRequest {
	product_id: string
	count: number
	cost: number
	accepted?: boolean
}

export interface IncomingProductUpdateRequest {
	id: string
	count?: number
	cost?: number
	accepted?: boolean
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
