import { ApiProperty } from '@nestjs/swagger'
import { IncomingProductRetriveAllResponse, IncomingProductRetriveResponse, ProductForIncomingProduct } from '../interfaces'

export class ProductForIncomingProductDto implements ProductForIncomingProduct {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: Number })
	count: number
}

export class IncomingProductRetrieveResponseDto implements IncomingProductRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	cost: number

	@ApiProperty({ type: Number })
	count: number

	@ApiProperty({ type: String })
	createdAt: Date

	@ApiProperty({ type: Number })
	selling_price: number

	@ApiProperty({ type: Number })
	wholesale_price: number

	@ApiProperty({ type: ProductForIncomingProductDto })
	product: ProductForIncomingProduct
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
