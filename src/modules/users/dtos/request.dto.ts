import { IsBooleanString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { UserCreateRequest, UserDeleteRequest, UserRetriveAllRequest, UserRetriveRequest, UserUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

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
