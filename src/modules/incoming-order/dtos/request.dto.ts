import { IsArray, IsBoolean, IsBooleanString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { IncomingOrderCreateRequest, IncomingOrderDeleteRequest, IncomingOrderRetriveAllRequest, IncomingOrderRetriveRequest, IncomingOrderUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IncomingProductCreateRequest, IncomingProductCreateRequestDto } from '../../incoming-products'
import { IncomingOrderPaymentRequest, IncomingOrderPaymentRequestDto } from '../../incoming-order-payment'
import { Response } from 'express'

export class IncomingOrderRetrieveAllRequestDto implements IncomingOrderRetriveAllRequest {
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

	@ApiPropertyOptional({ type: String, example: 'excel' })
	@IsString()
	@IsOptional()
	type?: string

	res: Response

	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	sellerId?: string

	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	supplierId?: string

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

export class IncomingOrderRetrieveRequestDto implements IncomingOrderRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: String, example: 'excel' })
	@IsString()
	@IsOptional()
	type?: string

	res: Response
}

export class IncomingOrderCreateRequestDto implements IncomingOrderCreateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	supplierId: string

	@IsUUID('4')
	@IsOptional()
	userId: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	sum?: number

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	sellingDate: string

	@ApiProperty({ type: IncomingProductCreateRequestDto })
	@IsArray()
	@IsNotEmpty()
	products: IncomingProductCreateRequest[]

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsBoolean()
	@IsOptional()
	accepted?: boolean

	@ApiPropertyOptional({ type: IncomingOrderPaymentRequestDto })
	@IsOptional()
	payment?: IncomingOrderPaymentRequest
}

export class IncomingOrderUpdateRequestDto implements IncomingOrderUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	sellingDate?: string
}

export class IncomingOrderDeleteRequestDto implements IncomingOrderDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
