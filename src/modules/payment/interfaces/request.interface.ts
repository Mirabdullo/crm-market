import { Response } from 'express'

export interface PaymentCreateRequest {
	orderId?: string
	clientId: string
	cash?: number
	transfer?: number
	card?: number
	other?: number
	description?: string
}

export interface PaymentRequest {
	totalPay?: number
	debt?: number
	cash?: number
	transfer?: number
	card?: number
	other?: number
	description?: string
}

export interface PaymentUpdateRequest {
	id: string
	totalPay?: number
	debt?: number
	cash?: number
	transfer?: number
	card?: number
	other?: number
	description?: string
}

export interface PaymentDeleteRequest {
	id: string
}

export interface PaymentRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	res: Response
	clientId?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface PaymentRetriveRequest {
	id: string
}
