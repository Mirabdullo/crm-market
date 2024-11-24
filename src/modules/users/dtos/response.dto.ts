import { ApiProperty } from '@nestjs/swagger'
import { UserRetriveAllResponse, UserRetriveResponse } from '../interfaces'

export class UserRetrieveResponseDto implements UserRetriveResponse {
	@ApiProperty({ type: String })
	id: string

	@ApiProperty({ type: String })
	name: string

	@ApiProperty({ type: String })
	phone: string

	@ApiProperty({ type: Date })
	createdAt: Date
}

export class UserRetrieveAllResponseDto implements UserRetriveAllResponse {
	@ApiProperty({ type: Number })
	pageSize: number

	@ApiProperty({ type: Number })
	pageNumber: number

	@ApiProperty({ type: Number })
	pageCount: number

	@ApiProperty({ type: Number })
	totalCount: number

	@ApiProperty({ type: [UserRetrieveResponseDto] })
	data: UserRetriveResponse[]
}
