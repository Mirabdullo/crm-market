export declare interface IncomingOrderPaymentRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	totalCalc: IPaymentTotalCalcResponse
	data: IncomingOrderPaymentRetriveResponse[]
}

export declare interface IPaymentTotalCalcResponse {
	totalPay: number
	totalCard: number
	totalCash: number
	totalTransfer: number
	totalOther: number
}

export declare interface IncomingOrderPaymentRetriveResponse {
	id: string
	cash: number
	transfer: number
	card: number
	other: number
	humo: number
	createdAt: Date
	// order: IncomingOrderPaymentOrder
	// supplier: IncomingOrderPaymentClient
}

export declare interface IncomingOrderPaymentResponse {
	id: string
	cash: number
	transfer: number
	card: number
	other: number
	humo: number
	createdAt: Date
}

export declare interface IncomingOrderPaymentOrder {
	id: string
	sum: number
	debt: number
}

export declare interface IncomingOrderPaymentClient {
	id: string
	name: string
	phone: string
}
