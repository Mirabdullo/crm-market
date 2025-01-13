import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductRetriveAllResponse, ProductRetriveResponse, ProductTotalCalc } from '../interfaces'

export class ProductRetrieveResponseDto implements ProductRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: Number })
	count: number

	@ApiProperty({ type: Number })
	unit: string

	@ApiProperty({ type: Number })
	min_amount: number

	@ApiProperty({ type: Number })
	cost: number

	@ApiProperty({ type: Number })
	selling_price: number

	@ApiProperty({ type: Number })
	wholesale_price: number

	@ApiPropertyOptional({ type: String })
	image?: string

	@ApiPropertyOptional({ type: String })
	category?: string
}

export class ProductTotalCalcDto implements ProductTotalCalc {
	@ApiProperty({ type: Number })
	totalProductCost: number

	@ApiProperty({ type: Number })
	totalProductCount: number

	@ApiProperty({ type: Number })
	totalProductPrice: number
}

export class ProductRetrieveAllResponseDto implements ProductRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: ProductTotalCalcDto })
	totalCalc: ProductTotalCalc

	@ApiProperty({ type: [ProductRetrieveResponseDto] })
	data: ProductRetriveResponse[]
}
