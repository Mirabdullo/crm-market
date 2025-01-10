import { ApiProperty } from '@nestjs/swagger'
import { ReturnedOrderCreateResponse, ReturnedOrderRetriveAllResponse, ReturnedOrderRetriveResponse } from '../interfaces'
import { UserRetrieveResponseDto, UserRetriveResponse } from '../../users'
import { AdminResponse } from '../../admins'
import { ReturnedProductRetrieveResponseDto, ReturnedProductRetriveResponse } from '../../returned-products'

export class ReturnedOrderRetrieveResponseDto implements ReturnedOrderRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	sum: number

	@ApiProperty({ type: Number })
	cashPayment: number

	@ApiProperty({ type: Number })
	fromClient: number

	@ApiProperty({ type: String })
	description: string

	@ApiProperty({ type: Boolean })
	accepted: boolean

	@ApiProperty({ type: Date })
	createdAt: Date

	@ApiProperty({ type: UserRetrieveResponseDto })
	client: UserRetriveResponse

	@ApiProperty({ type: UserRetrieveResponseDto })
	seller: AdminResponse

	@ApiProperty({ type: [ReturnedProductRetrieveResponseDto] })
	products: ReturnedProductRetriveResponse[]
}

export class ReturnedOrderRetrieveAllResponseDto implements ReturnedOrderRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [ReturnedOrderRetrieveResponseDto] })
	data: ReturnedOrderRetriveResponse[]
}

export class ReturnedOrderCreateResponseDto implements ReturnedOrderCreateResponse {
	@ApiProperty({ type: String })
	id: string
}
