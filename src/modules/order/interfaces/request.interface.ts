import { Response } from 'express'
import { OrderProductRequest } from '../../order-products'

export interface OrderCreateRequest {
	clientId: string
	sum?: number
	sellingDate?: string
	accepted?: boolean
	description?: string
	products: OrderProductRequest[]
	userId: string
}

export interface OrderCreateResponse {
	id: string
}

export interface OrderUpdateRequest {
	id: string
	accepted?: boolean
	sellingDate?: string
	description?: string
	sendUser?: boolean
	clientId?: string
}

export interface OrderDeleteRequest {
	id: string
	sendUser?: boolean
}

export interface OrderRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	sellerId?: string
	clientId?: string
	pagination?: boolean
	type?: string
	res: Response
	startDate?: string
	endDate?: string
	accepted?: boolean
}

export interface OrderRetriveRequest {
	id: string
}
