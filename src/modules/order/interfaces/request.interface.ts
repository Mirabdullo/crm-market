import { OrderProductRequest, OrderProductUpdateRequest } from '../../order-products'
import { PaymentRequest, PaymentUpdateRequest } from '../../payment'

export interface OrderCreateRequest {
	clientId: string
	sum?: number
	createdAt: string
	accepted?: boolean
	products: OrderProductRequest[]
	payment?: PaymentRequest
	userId: string
}

export interface OrderUpdateRequest {
	id: string
	sum?: number
	addProducts: OrderProductUpdateRequest[]
	updateProducts: OrderProductUpdateRequest[]
	removeProducts: string[]
	payment?: PaymentUpdateRequest
	accepted?: boolean
}

export interface OrderDeleteRequest {
	id: string
}

export interface OrderRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	sellerId?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface OrderRetriveRequest {
	id: string
}
