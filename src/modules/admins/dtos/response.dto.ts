import { ApiProperty } from '@nestjs/swagger'
import { AdminPermissions, AdminRetriveAllResponse, AdminRetriveResponse } from '../interfaces'

export class AdminPermissionsDto implements AdminPermissions {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string
}

export class AdminRetrieveResponseDto implements AdminRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	phone: string

	@ApiProperty({ type: String })
	role: string

	@ApiProperty({ type: Date })
	createdAt: Date

	@ApiProperty({ type: [AdminPermissionsDto] })
	permissions?: AdminPermissions[]
}

export class AdminRetrieveAllResponseDto implements AdminRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [AdminRetrieveResponseDto] })
	data: AdminRetriveResponse[]
}
