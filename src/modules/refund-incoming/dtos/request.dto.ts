import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { RefundIncomingCreateRequest, RefundIncomingDeleteRequest, RefundIncomingRetriveAllRequest, RefundIncomingRetriveRequest, RefundIncomingUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ReturnedProductRequest, ReturnedProductRequestDto } from '../../returned-products'

export class RefundIncomingRetrieveAllRequestDto implements RefundIncomingRetriveAllRequest {
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

	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	sellerId?: string

	@ApiPropertyOptional({ type: Boolean, example: false })
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

export class RefundIncomingRetrieveRequestDto implements RefundIncomingRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class RefundIncomingCreateRequestDto implements RefundIncomingCreateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	supplierId: string

	@IsUUID('4')
	@IsOptional()
	userId: string

	@ApiProperty({ type: String })
	@IsString()
	@IsOptional()
	description?: string

	@ApiProperty({ type: [ReturnedProductRequestDto] })
	@IsArray()
	@IsNotEmpty()
	products: ReturnedProductRequest[]
}

export class RefundIncomingUpdateRequestDto implements RefundIncomingUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class RefundIncomingDeleteRequestDto implements RefundIncomingDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
