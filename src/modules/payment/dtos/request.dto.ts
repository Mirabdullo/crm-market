import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { PaymentCreateRequest, PaymentDeleteRequest, PaymentRequest, PaymentRetriveAllRequest, PaymentRetriveRequest, PaymentUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Response } from 'express'

export class PaymentRetrieveAllRequestDto implements PaymentRetriveAllRequest {
	@ApiPropertyOptional({ type: Number })
	@IsPositive()
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	pageNumber?: number

	@ApiPropertyOptional({ type: Number })
	@IsPositive()
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	pageSize?: number

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	search?: string

	res: Response

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsBoolean()
	@IsOptional()
	pagination?: boolean

	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	clientId?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	startDate?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	endDate?: string
}

export class PaymentRetrieveRequestDto implements PaymentRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class PaymentCreateRequestDto implements PaymentCreateRequest {
	@ApiProperty({ type: String, example: 'uuid' })
	@IsUUID('4')
	@IsOptional()
	orderId?: string

	@ApiProperty({ type: String, example: 'uuid' })
	@IsUUID('4')
	@IsNotEmpty()
	clientId: string

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	totalPay?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	debt?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	cash?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	card?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	transfer?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	other?: number

	@ApiPropertyOptional({ type: Boolean })
	@IsBoolean()
	@IsOptional()
	sendUser?: boolean
}

export class PaymentRequestDto implements PaymentRequest {
	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	totalPay?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	debt?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	cash?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	card?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	transfer?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	other?: number
}

export class PaymentUpdateRequestDto implements PaymentUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	totalPay?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	debt?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	cash?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	card?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	transfer?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	other?: number
}

export class PaymentDeleteRequestDto implements PaymentDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
