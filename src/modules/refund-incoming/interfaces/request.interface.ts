import { ReturnedProductRequest } from '../../returned-products'

export interface RefundIncomingCreateRequest {
	supplierId: string
	description?: string
	products: ReturnedProductRequest[]
	userId: string
}

export interface RefundIncomingCreateResponse {
	id: string
}

export interface RefundIncomingUpdateRequest {
	id: string
}

export interface RefundIncomingDeleteRequest {
	id: string
}

export interface RefundIncomingRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	sellerId?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface RefundIncomingRetriveRequest {
	id: string
}
