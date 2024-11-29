import { ApiProperty } from '@nestjs/swagger'
import { AdminSignInRequest, AdminSignInResponse } from '../interfaces'
import { IsNotEmpty, IsString } from 'class-validator'
import { AdminRetrieveResponseDto, AdminRetriveResponse } from '../../admins'

export class AdminSignInRequestDto implements AdminSignInRequest {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	phone: string

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	password: string
}

export class AdminSignInResponseDto implements AdminSignInResponse {
	@ApiProperty({ type: AdminRetrieveResponseDto })
	data: AdminRetriveResponse

	@ApiProperty({ type: String })
	accessToken: string
}
