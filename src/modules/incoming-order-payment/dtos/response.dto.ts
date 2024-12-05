import { ApiProperty } from '@nestjs/swagger'
import { IncomingOrderPaymentClient, IncomingOrderPaymentOrder, IncomingOrderPaymentRetriveAllResponse, IncomingOrderPaymentRetriveResponse } from '../interfaces'

export class IncomingOrderPaymentOrderDto implements IncomingOrderPaymentOrder {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	sum: number

	@ApiProperty({ type: Number })
	debt: number
}

export class IncomingOrderPaymentClientDto implements IncomingOrderPaymentClient {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	phone: string
}

export class IncomingOrderPaymentRetrieveResponseDto implements IncomingOrderPaymentRetriveResponse {
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

	@ApiProperty({ type: IncomingOrderPaymentOrderDto })
	order: IncomingOrderPaymentOrder

	@ApiProperty({ type: IncomingOrderPaymentClientDto })
	client: IncomingOrderPaymentClient
}

export class IncomingOrderPaymentResponseDto implements IncomingOrderPaymentRetriveResponse {
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
}

export class IncomingOrderPaymentRetrieveAllResponseDto implements IncomingOrderPaymentRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [IncomingOrderPaymentRetrieveResponseDto] })
	data: IncomingOrderPaymentRetriveResponse[]
}
