export interface ProductCreateRequest {
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

export interface ProductUpdateRequest {
	id: string
	name?: string
	count?: number
	unit?: string
	min_amount?: number
	cost?: number
	selling_price?: number
	wholesale_price?: number
	image?: string
	category?: string
}

export interface ProductDeleteRequest {
	id: string
}

export interface ProductRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface ProductRetriveRequest {
	id: string
}
