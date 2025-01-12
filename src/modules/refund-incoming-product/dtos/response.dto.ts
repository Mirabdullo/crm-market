import { ApiProperty } from '@nestjs/swagger'
import { RefundIncomingProductRetriveAllResponse, RefundIncomingProductRetriveResponse, ProductForRefundIncomingProduct } from '../interfaces'

export class ProductForRefundIncomingProductDto implements ProductForRefundIncomingProduct {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string
}

export class RefundIncomingProductRetrieveResponseDto implements RefundIncomingProductRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	count: number

	@ApiProperty({ type: String })
	createdAt: Date

	@ApiProperty({ type: Number })
	price: number

	@ApiProperty({ type: ProductForRefundIncomingProductDto })
	product: ProductForRefundIncomingProduct
}

export class RefundIncomingProductRetrieveAllResponseDto implements RefundIncomingProductRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [RefundIncomingProductRetrieveResponseDto] })
	data: RefundIncomingProductRetriveResponse[]
}
