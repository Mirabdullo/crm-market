import { ApiProperty } from '@nestjs/swagger'
import { RoleRetriveAllResponse, RoleRetriveResponse } from '../interfaces'
import { PermissionRetrieveResponseDto, PermissionRetriveResponse } from '../../permissions'

export class RoleRetrieveResponseDto implements RoleRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	key: string

	@ApiProperty({ type: [PermissionRetrieveResponseDto] })
	permissions: PermissionRetriveResponse[]
}

export class RoleRetrieveAllResponseDto implements RoleRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [RoleRetrieveResponseDto] })
	data: RoleRetriveResponse[]
}
