import { ApiProperty } from '@nestjs/swagger'
import { IncomingProductRetriveAllResponse, IncomingProductRetriveResponse } from '../interfaces'
import { ProductRetrieveResponseDto, ProductRetriveResponse } from '../../products'

export class IncomingProductRetrieveResponseDto implements IncomingProductRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	count: number

	@ApiProperty({ type: Number })
	cost: number

	@ApiProperty({ type: ProductRetrieveResponseDto })
	product: ProductRetriveResponse
}

export class IncomingProductRetrieveAllResponseDto implements IncomingProductRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [IncomingProductRetrieveResponseDto] })
	data: IncomingProductRetriveResponse[]
}
