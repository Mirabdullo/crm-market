import { IsBooleanString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { DebtTypeEnum, UserCreateRequest, UserDeedRetrieveRequest, UserDeleteRequest, UserRetriveAllRequest, UserRetriveRequest, UserUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Response } from 'express'

export class UserRetrieveAllRequestDto implements UserRetriveAllRequest {
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

	@ApiPropertyOptional({ type: String, example: 'desc' })
	@IsString()
	@IsOptional()
	orderBy?: string

	@ApiPropertyOptional({ type: Number, example: 0 })
	@IsNumber()
	@IsOptional()
	debt?: number

	@ApiPropertyOptional({ enum: ['equal', 'greter', 'less'], example: 'equal' })
	@IsEnum(['equal', 'greater', 'less'])
	@IsOptional()
	debtType?: DebtTypeEnum
}

export class UserRetrieveRequestDto implements UserRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class UserCreateRequestDto implements UserCreateRequest {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	phone: string
}

export class UserUpdateRequestDto implements UserUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	name?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	phone?: string
}

export class UserDeleteRequestDto implements UserDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class UserDeedRetrieveRequestDto implements UserDeedRetrieveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: String, example: 'deed', enum: ['deed', 'product'] })
	@IsString()
	@IsOptional()
	type: string

	res: Response

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	startDate?: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	endDate?: string
}
