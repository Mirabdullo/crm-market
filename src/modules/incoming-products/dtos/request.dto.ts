import { IsBooleanString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import {
	IncomingProductCreateRequest,
	IncomingProductDeleteRequest,
	IncomingProductRetriveAllRequest,
	IncomingProductRetriveRequest,
	IncomingProductUpdateRequest,
} from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class IncomingProductRetrieveAllRequestDto implements IncomingProductRetriveAllRequest {
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

export class IncomingProductRetrieveRequestDto implements IncomingProductRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class IncomingProductCreateRequestDto implements IncomingProductCreateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	incomingOrderId: string

	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	product_id: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	count: number

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	cost: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	selling_price?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	wholesale_price?: number
}

export class IncomingProductUpdateRequestDto implements IncomingProductUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	count?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	cost?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	selling_price?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsOptional()
	wholesale_price?: number
}

export class IncomingProductDeleteRequestDto implements IncomingProductDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
