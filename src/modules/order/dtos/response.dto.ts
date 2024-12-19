import { ApiProperty } from '@nestjs/swagger'
import { OrderCreateResponse, OrderRetriveAllResponse, OrderRetriveResponse, OrderStatisticsResponse, WeeklyChartResponse } from '../interfaces'
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

	@ApiProperty({ type: UserRetrieveResponseDto })
	client: UserRetriveResponse

	@ApiProperty({ type: UserRetrieveResponseDto })
	seller: AdminResponse

	@ApiProperty({ type: PaymentResponseDto })
	payment: PaymentResponse

	@ApiProperty({ type: [OrderProductRetrieveResponseDto] })
	products: OrderProductRetriveResponse[]
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
export class OrderStatisticsResponseDto implements OrderStatisticsResponse {
	@ApiProperty({ type: Number })
	todaySales: number

	@ApiProperty({ type: Number })
	weeklySales: number

	@ApiProperty({ type: Number })
	monthlySales: number

	@ApiProperty({ type: Number })
	ourDebt: number

	@ApiProperty({ type: Number })
	fromDebt: number

	@ApiProperty({ type: [WeeklyChartResponseDto] })
	weeklyChart: WeeklyChartResponse[]
}
