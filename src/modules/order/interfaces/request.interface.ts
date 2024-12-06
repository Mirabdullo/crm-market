import { OrderProductCreateRequest } from '../../order-products'
import { PaymentCreateRequest } from '../../payment'

export interface OrderCreateRequest {
	clientId: string
	sum?: number
	createdAt: string
	accepted?: boolean
	products: OrderProductCreateRequest[]
	payment?: PaymentCreateRequest
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
