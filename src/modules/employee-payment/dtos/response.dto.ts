import { ApiProperty } from '@nestjs/swagger'
import {
	EmloyeePaymentClient,
	EmloyeePaymentOrder,
	EmloyeePaymentResponse,
	EmloyeePaymentRetriveAllResponse,
	EmloyeePaymentRetriveResponse,
	EmloyeePaymentTotalCalcResponse,
} from '../interfaces'

export class EmloyeePaymentOrderDto implements EmloyeePaymentOrder {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	sum: number

	@ApiProperty({ type: Number })
	debt: number
}

export class EmloyeePaymentClientDto implements EmloyeePaymentClient {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	phone: string
}

export class EmloyeePaymentRetrieveResponseDto implements EmloyeePaymentRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: Number })
	sum: number

	@ApiProperty({ type: Date })
	createdAt: Date

	@ApiProperty({ type: String })
	description: string
}

export class EmloyeePaymentResponseDto implements EmloyeePaymentResponse {
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

export class EmloyeePaymentTotalCalcResponseDto implements EmloyeePaymentTotalCalcResponse {
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

export class EmloyeePaymentRetrieveAllResponseDto implements EmloyeePaymentRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: EmloyeePaymentRetrieveAllResponseDto })
	totalCalc: EmloyeePaymentTotalCalcResponse

	@ApiProperty({ type: [EmloyeePaymentRetrieveResponseDto] })
	data: EmloyeePaymentRetriveResponse[]
}
