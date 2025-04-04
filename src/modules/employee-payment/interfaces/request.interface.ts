import { Response } from 'express'

export interface EmloyeePaymentCreateRequest {
	employeeId: string
	sum: number
	description?: string
	sendUser?: boolean
	userId: string
}

export interface EmloyeePaymentRequest {
	totalPay?: number
	debt?: number
	cash?: number
	transfer?: number
	card?: number
	other?: number
	description?: string
}

export interface EmloyeePaymentUpdateRequest {
	id: string
	sum?: number
	description?: string
}

export interface EmloyeePaymentDeleteRequest {
	id: string
}

export interface EmloyeePaymentRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	res: Response
	pagination?: boolean
	startDate?: string
	endDate?: string
	sellerId?: string
}

export interface EmloyeePaymentRetriveRequest {
	id: string
}
