import { ApiProperty } from '@nestjs/swagger'
import { PaymentClient, PaymentOrder, PaymentResponse, PaymentRetriveAllResponse, PaymentRetriveResponse } from '../interfaces'

export class PaymentOrderDto implements PaymentOrder {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	sum: number

	@ApiProperty({ type: Number })
	debt: number
}

export class PaymentClientDto implements PaymentClient {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	phone: string
}

export class PaymentRetrieveResponseDto implements PaymentRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	cash: number

	@ApiProperty({ type: Number })
	card: number

	@ApiProperty({ type: Number })
	transfer: number

	@ApiProperty({ type: Number })
	other: number

	@ApiProperty({ type: Date })
	createdAt: Date

	@ApiProperty({ type: PaymentOrderDto })
	order: PaymentOrder

	@ApiProperty({ type: PaymentClientDto })
	client: PaymentClient

	@ApiProperty({ type: String })
	description: string
}

export class PaymentResponseDto implements PaymentResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	totalPay: number

	@ApiProperty({ type: Number })
	debt: number

	@ApiProperty({ type: Number })
	cash: number

	@ApiProperty({ type: Number })
	card: number

	@ApiProperty({ type: Number })
	transfer: number

	@ApiProperty({ type: Number })
	other: number

	@ApiProperty({ type: Date })
	createdAt: Date

	@ApiProperty({ type: String })
	description: string
}

export class PaymentRetrieveAllResponseDto implements PaymentRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [PaymentRetrieveResponseDto] })
	data: PaymentRetriveResponse[]
}
