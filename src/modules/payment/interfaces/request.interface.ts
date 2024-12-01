export interface PaymentCreateRequest {
	orderId: string
	clientId: string
	cash?: number
	transfer?: number
	card?: number
	other?: number
}

export interface PaymentUpdateRequest {
	id: string
	cash?: number
	transfer?: number
	card?: number
	other?: number
}

export interface PaymentDeleteRequest {
	id: string
}

export interface PaymentRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
	startDate?: string
	endDate?: string
}

export interface PaymentRetriveRequest {
	id: string
}
