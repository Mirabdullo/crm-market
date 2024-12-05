export interface IncomingOrderPaymentCreateRequest {
	orderId: string
	clientId: string
	cash?: number
	transfer?: number
	card?: number
	other?: number
}

export interface IncomingOrderPaymentUpdateRequest {
	id: string
	cash?: number
	transfer?: number
	card?: number
	other?: number
}

export interface IncomingOrderPaymentDeleteRequest {
	id: string
}

export interface IncomingOrderPaymentRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface IncomingOrderPaymentRetriveRequest {
	id: string
}
