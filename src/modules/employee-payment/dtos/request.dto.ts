import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { EmloyeePaymentCreateRequest, EmloyeePaymentDeleteRequest, EmloyeePaymentRequest, EmloyeePaymentRetriveAllRequest, EmloyeePaymentRetriveRequest, EmloyeePaymentUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Response } from 'express'

export class EmloyeePaymentRetrieveAllRequestDto implements EmloyeePaymentRetriveAllRequest {
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

	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	sellerId?: string
}

export class EmloyeePaymentRetrieveRequestDto implements EmloyeePaymentRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class EmloyeePaymentCreateRequestDto implements EmloyeePaymentCreateRequest {
	@ApiProperty({ type: String, example: 'uuid' })
	@IsUUID('4')
	@IsNotEmpty()
	employeeId: string

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	sum: number

	@ApiProperty({ type: String })
	@IsString()
	@IsOptional()
	description?: string

	@IsUUID('4')
	@IsOptional()
	userId: string
}

export class EmloyeePaymentRequestDto implements EmloyeePaymentRequest {
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

export class EmloyeePaymentUpdateRequestDto implements EmloyeePaymentUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	sum?: number

	@ApiProperty({ type: String })
	@IsString()
	@IsOptional()
	description?: string
}

export class EmloyeePaymentDeleteRequestDto implements EmloyeePaymentDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
