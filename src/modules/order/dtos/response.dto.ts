import { ApiProperty } from '@nestjs/swagger'
import { DebtResponse, OrderCreateResponse, OrderRetriveAllResponse, OrderRetriveResponse, OrderStatisticsResponse, OrderTotalCalcResponse, WeeklyChartResponse } from '../interfaces'
import { UserRetrieveResponseDto, UserRetriveResponse } from '../../users'
import { AdminResponse } from '../../admins'
import { PaymentResponseDto, PaymentResponse } from '../../payment'
import { OrderProductRetrieveResponseDto, OrderProductRetriveResponse } from '../../order-products'

export class OrderRetrieveResponseDto implements OrderRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	articl: number

	@ApiProperty({ type: Number })
	sum: number

	@ApiProperty({ type: Number })
	debt: number

	@ApiProperty({ type: Boolean })
	accepted: boolean

	@ApiProperty({ type: Date })
	createdAt: Date

	@ApiProperty({ type: Date })
	sellingDate: Date

	@ApiProperty({ type: UserRetrieveResponseDto })
	client: UserRetriveResponse

	@ApiProperty({ type: UserRetrieveResponseDto })
	seller: AdminResponse

	@ApiProperty({ type: PaymentResponseDto })
	payment: PaymentResponse

	@ApiProperty({ type: [OrderProductRetrieveResponseDto] })
	products: OrderProductRetriveResponse[]
}

export class OrderTotalCalcResponseDto implements OrderTotalCalcResponse {
	@ApiProperty({ type: Number })
	totalSum: number

	@ApiProperty({ type: Number })
	totalDebt: number

	@ApiProperty({ type: Number })
	totalPay: number

	@ApiProperty({ type: Number })
	totalCard: number

	@ApiProperty({ type: Number })
	totalTransfer: number

	@ApiProperty({ type: Number })
	totalCash: number

	@ApiProperty({ type: Number })
	totalOther: number
}

export class OrderRetrieveAllResponseDto implements OrderRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [OrderRetrieveResponseDto] })
	data: OrderRetriveResponse[]

	@ApiProperty({ type: OrderTotalCalcResponseDto })
	totalCalc: OrderTotalCalcResponse
}

export class OrderCreateResponseDto implements OrderCreateResponse {
	@ApiProperty({ type: String })
	id: string
}

export class WeeklyChartResponseDto implements WeeklyChartResponse {
	@ApiProperty({ type: String })
	date: string

	@ApiProperty({ type: Number })
	sum: number
}

export class DebtResponseDto implements DebtResponse {
	@ApiProperty({ type: Number })
	client: number

	@ApiProperty({ type: Number })
	supplier: number
}

export class OrderStatisticsResponseDto implements OrderStatisticsResponse {
	@ApiProperty({ type: Number })
	todaySales: number

	@ApiProperty({ type: Number })
	weeklySales: number

	@ApiProperty({ type: Number })
	monthlySales: number

	@ApiProperty({ type: DebtResponseDto })
	ourDebt: DebtResponse

	@ApiProperty({ type: DebtResponseDto })
	fromDebt: DebtResponse

	@ApiProperty({ type: [WeeklyChartResponseDto] })
	weeklyChart: WeeklyChartResponse[]
}
