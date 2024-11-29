import { IsBooleanString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { PermissionCreateRequest, PermissionDeleteRequest, PermissionRetriveAllRequest, PermissionRetriveRequest, PermissionUpdateRequest } from '../interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PermissionRetrieveAllRequestDto implements PermissionRetriveAllRequest {
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

export class PermissionRetrieveRequestDto implements PermissionRetriveRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class PermissionCreateRequestDto implements PermissionCreateRequest {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	role_id: string
}

export class PermissionUpdateRequestDto implements PermissionUpdateRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string

	@ApiPropertyOptional({ type: String })
	@IsString()
	@IsOptional()
	name?: string
}

export class PermissionDeleteRequestDto implements PermissionDeleteRequest {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}
