export declare interface PaymentRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: PaymentRetriveResponse[]
}

export declare interface PaymentRetriveResponse {
	id: string
	cash: number
	transfer: number
	card: number
	other: number
	description: string
	createdAt: Date
}

export declare interface PaymentResponse {
	id: string
	totalPay: number
	debt: number
	cash: number
	transfer: number
	card: number
	other: number
	description: string
	createdAt: Date
}

export declare interface PaymentOrder {
	id: string
	sum: number
	debt: number
}

export declare interface PaymentClient {
	id: string
	name: string
	phone: string
}
