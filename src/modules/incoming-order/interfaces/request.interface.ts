import { IncomingProductCreateRequest } from '../../incoming-products'

export interface IncomingOrderCreateRequest {
	supplierId: string
	sum?: number
	createdAt: string
	accepted?: boolean
	products: IncomingProductCreateRequest[]
}

export interface IncomingOrderUpdateRequest {
	id: string
	count?: number
	cost?: number
	accepted?: boolean
}

export interface IncomingOrderDeleteRequest {
	id: string
}

export interface IncomingOrderRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface IncomingOrderRetriveRequest {
	id: string
}
