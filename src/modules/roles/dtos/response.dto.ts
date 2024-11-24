import { ApiProperty } from '@nestjs/swagger'
import { RoleRetriveAllResponse, RoleRetriveResponse } from '../interfaces'

export class RoleRetrieveResponseDto implements RoleRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	phone: string

	@ApiProperty({ type: Date })
	createdAt: Date
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
