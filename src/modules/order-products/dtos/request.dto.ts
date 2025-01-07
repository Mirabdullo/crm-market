import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import {
	OrderProductCreateRequest,
	OrderProductDeleteRequest,
	OrderProductRequest,
	OrderProductRetriveAllRequest,
	OrderProductRetriveRequest,
	OrderProductUpdateRequest,
} from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class OrderProductRetrieveAllRequestDto implements OrderProductRetriveAllRequest {
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

export class OrderProductRetrieveRequestDto implements OrderProductRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class OrderProductCreateRequestDto implements OrderProductCreateRequest {
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

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	cost: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	price: number

	@ApiPropertyOptional({ type: Boolean })
	@IsBoolean()
	@IsOptional()
	sendUser?: boolean
}

export class OrderProductRequestDto implements OrderProductRequest {
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
	@IsOptional()
	cost: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	price: number
}

export class OrderProductUpdateRequestDto implements OrderProductUpdateRequest {
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
	price?: number

	@ApiPropertyOptional({ type: Boolean })
	@IsBoolean()
	@IsOptional()
	sendUser?: boolean
}

export class OrderProductDeleteRequestDto implements OrderProductDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: Boolean })
	@IsBoolean()
	@IsOptional()
	sendUser?: boolean
}
