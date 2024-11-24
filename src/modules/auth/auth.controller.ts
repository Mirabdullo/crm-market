import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AdminSignInRequestDto, AdminSignInResponseDto } from './dtos'
import { AdminSignInResponse } from './interfaces'

@ApiTags('auth')
@Controller()
export class AuthController {
	private readonly service: AuthService
	constructor(service: AuthService) {
		this.service = service
	}

	@HttpCode(HttpStatus.OK)
	@Post('admin/sign-in')
	@ApiResponse({ type: AdminSignInResponseDto })
	adminSignIn(@Body() payload: AdminSignInRequestDto): Promise<AdminSignInResponse> {
		return this.service.adminSignIn(payload)
	}
}
