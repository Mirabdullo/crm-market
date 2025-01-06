import { Response } from 'express'

export interface IncomingOrderPaymentCreateRequest {
	orderId: string
	supplierId: string
	cash?: number
	transfer?: number
	card?: number
	other?: number
	humo?: number
	description?: string
}

export interface IncomingOrderPaymentRequest {
	cash?: number
	transfer?: number
	card?: number
	other?: number
	humo?: number
}

export interface IncomingOrderPaymentUpdateRequest {
	id: string
	cash?: number
	transfer?: number
	card?: number
	other?: number
	humo?: number
	description?: string
}

export interface IncomingOrderPaymentDeleteRequest {
	id: string
}

export interface IncomingOrderPaymentRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	res: Response
	supplierId?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface IncomingOrderPaymentRetriveRequest {
	id: string
}
