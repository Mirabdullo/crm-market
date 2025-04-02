export declare interface EmloyeePaymentRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: EmloyeePaymentRetriveResponse[]
}

export declare interface EmloyeePaymentTotalCalcResponse {
	totalPay: number
	totalCard: number
	totalCash: number
	totalTransfer: number
	totalOther: number
}

export declare interface EmloyeePaymentRetriveResponse {
	id: string
	sum: number
	description: string
	createdAt: Date
}

export declare interface EmloyeePaymentResponse {
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

export declare interface EmloyeePaymentOrder {
	id: string
	sum: number
	debt: number
}

export declare interface EmloyeePaymentClient {
	id: string
	name: string
	phone: string
}
