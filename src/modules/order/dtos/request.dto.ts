import { IsArray, IsBoolean, IsBooleanString, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderCreateRequest, OrderDeleteRequest, OrderRetriveAllRequest, OrderRetriveRequest, OrderUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OrderProductRequest, OrderProductRequestDto, RemoveOrderProductsRequest, RemoveOrderProductsRequestDto } from '../../order-products'
import { PaymentRequest, PaymentRequestDto, PaymentUpdateRequest } from '../../payment'

export class OrderRetrieveAllRequestDto implements OrderRetriveAllRequest {
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

export class OrderRetrieveRequestDto implements OrderRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class OrderCreateRequestDto implements OrderCreateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	clientId: string

	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	userId: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	sum?: number

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	createdAt: string

	@ApiProperty({ type: [OrderProductRequestDto] })
	@IsArray()
	@IsNotEmpty()
	products: OrderProductRequest[]

	@ApiPropertyOptional({ type: PaymentRequestDto })
	@IsOptional()
	payment?: PaymentRequest

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsBoolean()
	@IsOptional()
	accepted?: boolean
}

export class OrderUpdateRequestDto implements OrderUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	sum?: number

	@ApiPropertyOptional({ type: [OrderProductRequestDto] })
	@IsArray()
	@IsOptional()
	addProducts?: OrderProductRequest[]

	@ApiPropertyOptional({ type: [RemoveOrderProductsRequestDto] })
	@IsArray()
	@IsOptional()
	removeProducts?: RemoveOrderProductsRequest[]

	@ApiPropertyOptional({ type: PaymentRequestDto })
	@IsOptional()
	@IsObject()
	payment?: PaymentUpdateRequest

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsBoolean()
	@IsOptional()
	accepted?: boolean
}

export class OrderDeleteRequestDto implements OrderDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}