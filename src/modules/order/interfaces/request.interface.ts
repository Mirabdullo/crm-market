import { OrderProductCreateRequest } from '../../order-products'

export interface OrderCreateRequest {
	clientId: string
	sum?: number
	createdAt: string
	accepted?: boolean
	products: OrderProductCreateRequest[]
	userId: string
}

export interface OrderUpdateRequest {
	id: string
	sum?: number
	accepted?: boolean
}

export interface OrderDeleteRequest {
	id: string
}

export interface OrderRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface OrderRetriveRequest {
	id: string
}
