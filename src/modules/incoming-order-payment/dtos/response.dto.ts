import { ApiProperty } from '@nestjs/swagger'
import {
	IPaymentTotalCalcResponse,
	IncomingOrderPaymentClient,
	IncomingOrderPaymentOrder,
	IncomingOrderPaymentResponse,
	IncomingOrderPaymentRetriveAllResponse,
	IncomingOrderPaymentRetriveResponse,
} from '../interfaces'

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

export class IPaymentTotalCalcResponseDto implements IPaymentTotalCalcResponse {
	@ApiProperty({ type: Number })
	totalPay: number

	@ApiProperty({ type: Number })
	totalCard: number

	@ApiProperty({ type: Number })
	totalCash: number

	@ApiProperty({ type: Number })
	totalTransfer: number

	@ApiProperty({ type: Number })
	totalOther: number
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

	@ApiProperty({ type: Number })
	humo: number

	@ApiProperty({ type: Date })
	createdAt: Date

	// @ApiProperty({ type: IncomingOrderPaymentOrderDto })
	// order: IncomingOrderPaymentOrder

	// @ApiProperty({ type: IncomingOrderPaymentClientDto })
	// supplier: IncomingOrderPaymentClient
}

export class IncomingOrderPaymentResponseDto implements IncomingOrderPaymentResponse {
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

	@ApiProperty({ type: Number })
	humo: number

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

	@ApiProperty({ type: IPaymentTotalCalcResponseDto })
	totalCalc: IPaymentTotalCalcResponse

	@ApiProperty({ type: [IncomingOrderPaymentRetrieveResponseDto] })
	data: IncomingOrderPaymentRetriveResponse[]
}
