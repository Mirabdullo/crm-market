import { IsBooleanString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { ProductCreateRequest, ProductDeleteRequest, ProductRetriveAllRequest, ProductRetriveRequest, ProductUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ProductRetrieveAllRequestDto implements ProductRetriveAllRequest {
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

export class ProductRetrieveRequestDto implements ProductRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class ProductCreateRequestDto implements ProductCreateRequest {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	count: number

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	unit: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	min_amount: number

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	cost: number

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	selling_price: number

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	wholesale_price: number

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsNotEmpty()
	image?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsNotEmpty()
	category?: string
}

export class ProductUpdateRequestDto implements ProductUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	name?: string

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	count?: number

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsNotEmpty()
	unit?: string

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	min_amount?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	cost?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	selling_price?: number

	@ApiPropertyOptional({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	wholesale_price?: number

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsNotEmpty()
	image?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsNotEmpty()
	category?: string
}

export class ProductDeleteRequestDto implements ProductDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
