import { ApiProperty } from '@nestjs/swagger'
import { OrderProductRetriveAllResponse, OrderProductRetriveResponse, ProductForOrderProduct } from '../interfaces'

export class ProductForOrderProductDto implements ProductForOrderProduct {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: Number })
	count: number
}

export class OrderProductRetrieveResponseDto implements OrderProductRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	cost: number

	@ApiProperty({ type: Number })
	count: number

	@ApiProperty({ type: String })
	createdAt: Date

	@ApiProperty({ type: Number })
	price: number

	@ApiProperty({ type: ProductForOrderProductDto })
	product: ProductForOrderProduct
}

export class OrderProductRetrieveAllResponseDto implements OrderProductRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [OrderProductRetrieveResponseDto] })
	data: OrderProductRetriveResponse[]
}
