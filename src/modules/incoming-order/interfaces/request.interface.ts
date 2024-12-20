import { IncomingOrderPaymentRequest, IncomingOrderPaymentUpdateRequest } from '../../incoming-order-payment'
import { IncomingProductCreateRequest, IncomingProductRemoveRequest, IncomingProductRequest } from '../../incoming-products'

export interface IncomingOrderCreateRequest {
	supplierId: string
	sum?: number
	sellingDate: string
	accepted?: boolean
	products: IncomingProductCreateRequest[]
	payment?: IncomingOrderPaymentRequest
	userId: string
}

export interface IncomingOrderUpdateRequest {
	id: string
	sellingDate?: string
}

export interface IncomingOrderDeleteRequest {
	id: string
}

export interface IncomingOrderRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	sellerId?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface IncomingOrderRetriveRequest {
	id: string
}
