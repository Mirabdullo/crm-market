import { Response } from 'express'
import { ReturnedProductRequest } from '../../returned-products'

export interface ReturnedOrderCreateRequest {
	clientId: string
	description?: string
	sum?: number
	accepted?: boolean
	products: ReturnedProductRequest[]
	returnedDate?: string
	userId: string
}

export interface ReturnedOrderCreateResponse {
	id: string
}

export interface ReturnedOrderUpdateRequest {
	id: string
	accepted?: boolean
	fromClient?: number
	cashPayment?: number
	description?: string
	returnedDate?: string
}

export interface ReturnedOrderDeleteRequest {
	id: string
	sendUser?: boolean
}

export interface ReturnedOrderRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	sellerId?: string
	clientId?: string
	pagination?: boolean
	type?: string
	startDate?: string
	endDate?: string
	accepted?: boolean
	res: Response
}

export interface ReturnedOrderRetriveRequest {
	id: string
	res: Response
}
