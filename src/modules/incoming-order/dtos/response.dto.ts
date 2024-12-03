import { ApiProperty } from '@nestjs/swagger'
import { IncomingOrderRetriveAllResponse, IncomingOrderRetriveResponse } from '../interfaces'
import { UserRetrieveResponseDto, UserRetriveResponse } from '../../users'
import { IncomingProductRetrieveResponseDto, IncomingProductRetriveResponse } from '../../incoming-products'

export class IncomingOrderRetrieveResponseDto implements IncomingOrderRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	sum: number

	@ApiProperty({ type: Boolean })
	accepted: boolean

	@ApiProperty({ type: Date })
	createdAt: Date

	@ApiProperty({ type: UserRetrieveResponseDto })
	supplier: UserRetriveResponse

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
