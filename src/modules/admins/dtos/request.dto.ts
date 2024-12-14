import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { AdminCreateRequest, AdminDeleteRequest, AdminRetriveAllRequest, AdminRetriveRequest, AdminUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AdminRetrieveAllRequestDto implements AdminRetriveAllRequest {
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
}

export class AdminRetrieveRequestDto implements AdminRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class AdminCreateRequestDto implements AdminCreateRequest {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	phone: string

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	password: string

	@ApiProperty({ type: [String] })
	@IsArray()
	@IsUUID('4', { each: true })
	@IsNotEmpty()
	permissions: string[]
}

export class AdminUpdateRequestDto implements AdminUpdateRequest {
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

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	password?: string

	@ApiPropertyOptional({ type: [String] })
	@IsArray()
	@IsUUID('4', { each: true })
	@IsOptional()
	connectPermissions: string[]

	@ApiPropertyOptional({ type: [String] })
	@IsArray()
	@IsUUID('4', { each: true })
	@IsOptional()
	disconnectPermissions: string[]
}

export class AdminDeleteRequestDto implements AdminDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
