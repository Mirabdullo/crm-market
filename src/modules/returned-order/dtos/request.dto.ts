import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { ReturnedOrderCreateRequest, ReturnedOrderDeleteRequest, ReturnedOrderRetriveAllRequest, ReturnedOrderRetriveRequest, ReturnedOrderUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ReturnedProductRequest, ReturnedProductRequestDto } from '../../returned-products'
import { Response } from 'express'

export class ReturnedOrderRetrieveAllRequestDto implements ReturnedOrderRetriveAllRequest {
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

	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	sellerId?: string

	@ApiPropertyOptional({ type: String })
	@IsUUID('4')
	@IsOptional()
	clientId?: string

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsOptional()
	pagination?: boolean

	@ApiPropertyOptional({ type: Boolean, example: true })
	@IsOptional()
	accepted?: boolean

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	startDate?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	endDate?: string

	res: Response
}

export class ReturnedOrderRetrieveRequestDto implements ReturnedOrderRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	res: Response
}

export class ReturnedOrderCreateRequestDto implements ReturnedOrderCreateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	clientId: string

	@IsUUID('4')
	@IsOptional()
	userId: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	sum?: number

	@ApiProperty({ type: String })
	@IsString()
	@IsOptional()
	description?: string

	@ApiProperty({ type: String })
	@IsString()
	@IsOptional()
	returnedDate?: string

	@ApiProperty({ type: [ReturnedProductRequestDto] })
	@IsArray()
	@IsNotEmpty()
	products: ReturnedProductRequest[]
}

export class ReturnedOrderUpdateRequestDto implements ReturnedOrderUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: Boolean, example: true })
	@IsOptional()
	accepted?: boolean

	@ApiProperty({ type: String })
	@IsString()
	@IsOptional()
	description?: string

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	cashPayment?: number

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	fromClient?: number

	@ApiPropertyOptional({ type: Boolean, example: false })
	@IsOptional()
	sendUser?: boolean
}

export class ReturnedOrderDeleteRequestDto implements ReturnedOrderDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
