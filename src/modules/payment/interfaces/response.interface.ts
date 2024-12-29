export declare interface PaymentRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	totalCalc: PaymentTotalCalcResponse
	data: PaymentRetriveResponse[]
}

export declare interface PaymentTotalCalcResponse {
	totalPay: number
	totalCard: number
	totalCash: number
	totalTransfer: number
	totalOther: number
}

export declare interface PaymentRetriveResponse {
	id: string
	totalPay: number
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
