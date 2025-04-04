import { IsBooleanString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import {
	IncomingOrderPaymentCreateRequest,
	IncomingOrderPaymentDeleteRequest,
	IncomingOrderPaymentRequest,
	IncomingOrderPaymentRetriveAllRequest,
	IncomingOrderPaymentRetriveRequest,
	IncomingOrderPaymentUpdateRequest,
} from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Response } from 'express'

export class IncomingOrderPaymentRetrieveAllRequestDto implements IncomingOrderPaymentRetriveAllRequest {
	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	supplierId?: string

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

	res: Response

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	search?: string

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsBooleanString()
	@IsOptional()
	pagination?: boolean

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	startDate?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	endDate?: string
}

export class IncomingOrderPaymentRetrieveRequestDto implements IncomingOrderPaymentRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class IncomingOrderPaymentCreateRequestDto implements IncomingOrderPaymentCreateRequest {
	@ApiProperty({ type: String, example: 'uuid' })
	@IsUUID('4')
	@IsOptional()
	orderId: string

	@ApiProperty({ type: String, example: 'uuid' })
	@IsUUID('4')
	@IsNotEmpty()
	supplierId: string

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

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	description?: string
}

export class IncomingOrderPaymentRequestDto implements IncomingOrderPaymentRequest {
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

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	humo?: number
}

export class IncomingOrderPaymentUpdateRequestDto implements IncomingOrderPaymentUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

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

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	description?: string
}

export class IncomingOrderPaymentDeleteRequestDto implements IncomingOrderPaymentDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
