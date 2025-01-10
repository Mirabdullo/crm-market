import { ApiProperty } from '@nestjs/swagger'
import { ReturnedProductRetriveAllResponse, ReturnedProductRetriveResponse, ProductForReturnedProduct } from '../interfaces'

export class ProductForReturnedProductDto implements ProductForReturnedProduct {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string
}

export class ReturnedProductRetrieveResponseDto implements ReturnedProductRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	count: number

	@ApiProperty({ type: String })
	createdAt: Date

	@ApiProperty({ type: Number })
	price: number

	@ApiProperty({ type: ProductForReturnedProductDto })
	product: ProductForReturnedProduct
}

export class ReturnedProductRetrieveAllResponseDto implements ReturnedProductRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [ReturnedProductRetrieveResponseDto] })
	data: ReturnedProductRetriveResponse[]
}
