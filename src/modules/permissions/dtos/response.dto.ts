import { ApiProperty } from '@nestjs/swagger'
import { PermissionRetriveAllResponse, PermissionRetriveResponse } from '../interfaces'

export class PermissionRetrieveResponseDto implements PermissionRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	key: string
}

export class PermissionRetrieveAllResponseDto implements PermissionRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [PermissionRetrieveResponseDto] })
	data: PermissionRetriveResponse[]
}
