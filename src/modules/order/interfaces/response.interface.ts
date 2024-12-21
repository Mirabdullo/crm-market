import { AdminResponse } from '../../admins'
import { OrderProductRetriveResponse } from '../../order-products'
import { PaymentResponse } from '../../payment'
import { UserResponse } from '../../users'

export declare interface OrderRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: OrderRetriveResponse[]
	totalCalc: OrderTotalCalcResponse
}

export declare interface OrderTotalCalcResponse {
	totalSum: number
	totalDebt: number
	totalPay: number
	totalCard: number
	totalCash: number
	totalTransfer: number
	totalOther: number
}

export declare interface WeeklyChartResponse {
	date: string
	sum: number
}
export declare interface OrderStatisticsResponse {
	todaySales: number
	weeklySales: number
	monthlySales: number
	ourDebt: number
	fromDebt: number
	weeklyChart: WeeklyChartResponse[]
}

export declare interface OrderRetriveResponse {
	id: string
	articl: number
	sum: number
	debt: number
	accepted: boolean
	createdAt: Date
	sellingDate: Date
	client: UserResponse
	seller: AdminResponse
	payment: PaymentResponse
	products: OrderProductRetriveResponse[]
}
