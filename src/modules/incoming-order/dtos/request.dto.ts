import { IsArray, IsBooleanString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { IncomingOrderCreateRequest, IncomingOrderDeleteRequest, IncomingOrderRetriveAllRequest, IncomingOrderRetriveRequest, IncomingOrderUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IncomingProductCreateRequest, IncomingProductRetrieveResponseDto } from '../../incoming-products'

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
}

export class IncomingOrderCreateRequestDto implements IncomingOrderCreateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	supplierId: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	sum?: number

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	createdAt: string

	@ApiProperty({ type: IncomingProductRetrieveResponseDto })
	@IsArray()
	@IsNotEmpty()
	products: IncomingProductCreateRequest[]

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsBooleanString()
	@IsOptional()
	accepted?: boolean
}

export class IncomingOrderUpdateRequestDto implements IncomingOrderUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsBooleanString()
	@IsOptional()
	accepted?: boolean
}

export class IncomingOrderDeleteRequestDto implements IncomingOrderDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
