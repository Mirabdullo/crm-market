import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import {
	RefundIncomingProductCreateRequest,
	RefundIncomingProductDeleteRequest,
	RefundIncomingProductRequest,
	RefundIncomingProductRetriveAllRequest,
	RefundIncomingProductRetriveRequest,
	RefundIncomingProductUpdateRequest,
} from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RefundIncomingProductRetrieveAllRequestDto implements RefundIncomingProductRetriveAllRequest {
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
	@IsBoolean()
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

export class RefundIncomingProductRetrieveRequestDto implements RefundIncomingProductRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class RefundIncomingProductCreateRequestDto implements RefundIncomingProductCreateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	order_id: string

	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	product_id: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	count: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	price: number
}

export class RefundIncomingProductRequestDto implements RefundIncomingProductRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	product_id: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	count: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	price: number
}

export class RefundIncomingProductUpdateRequestDto implements RefundIncomingProductUpdateRequest {
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
	price?: number
}

export class RefundIncomingProductDeleteRequestDto implements RefundIncomingProductDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
