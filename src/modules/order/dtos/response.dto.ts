import { ApiProperty } from '@nestjs/swagger'
import { OrderRetriveAllResponse, OrderRetriveResponse } from '../interfaces'
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
