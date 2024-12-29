import { ApiProperty } from '@nestjs/swagger'
import { IncomingOrderCreateResponse, IncomingOrderRetriveAllResponse, IncomingOrderRetriveResponse } from '../interfaces'
import { UserRetrieveResponseDto, UserRetriveResponse } from '../../users'
import { IncomingProductRetrieveResponseDto, IncomingProductRetriveResponse } from '../../incoming-products'
import { AdminResponse } from '../../admins'
import { PaymentResponseDto, PaymentResponse } from '../../payment'

export class IncomingOrderRetrieveResponseDto implements IncomingOrderRetriveResponse {
	@ApiProperty({ type: String })
	id: string

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
	supplier: UserRetriveResponse

	@ApiProperty({ type: UserRetrieveResponseDto })
	admin: AdminResponse

	@ApiProperty({ type: PaymentResponseDto })
	payment: PaymentResponse

	@ApiProperty({ type: IncomingProductRetrieveResponseDto })
	incomingProducts: IncomingProductRetriveResponse[]
}

export class IncomingOrderRetrieveAllResponseDto implements IncomingOrderRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [IncomingOrderRetrieveResponseDto] })
	data: IncomingOrderRetriveResponse[]
}

export class IncomingOrderCreateResponseDto implements IncomingOrderCreateResponse {
	@ApiProperty({ type: String })
	id: string

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
	supplier: UserRetriveResponse

	@ApiProperty({ type: UserRetrieveResponseDto })
	admin: AdminResponse
}
