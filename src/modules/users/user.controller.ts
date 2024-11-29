import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	UserCreateRequestDto,
	UserUpdateRequestDto,
	UserDeleteRequestDto,
	UserRetrieveRequestDto,
	UserRetrieveResponseDto,
	UserRetrieveAllRequestDto,
	UserRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UserRetriveAllResponse, UserRetriveResponse } from './interfaces'

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
	readonly #_service: UserService

	constructor(service: UserService) {
		this.#_service = service
	}

	@Get('supplier')
	@ApiOkResponse({ type: UserRetrieveAllResponseDto })
	SupplierRetrieveAll(@Query() payload: UserRetrieveAllRequestDto): Promise<UserRetriveAllResponse> {
		return this.#_service.userRetrieveAll({
			...payload,
			type: 'supplier',
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get('client')
	@ApiOkResponse({ type: UserRetrieveAllResponseDto })
	ClientRetrieveAll(@Query() payload: UserRetrieveAllRequestDto): Promise<UserRetriveAllResponse> {
		return this.#_service.userRetrieveAll({
			...payload,
			type: 'client',
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: UserRetrieveResponseDto })
	UserRetrieve(@Param() payload: UserRetrieveRequestDto): Promise<UserRetriveResponse> {
		return this.#_service.userRetrieve(payload)
	}

	@Post('supplier')
	@ApiNoContentResponse()
	SupplierCreate(@Body() payload: UserCreateRequestDto): Promise<null> {
		return this.#_service.supplierCreate(payload)
	}

	@Post('client')
	@ApiNoContentResponse()
	ClientCreate(@Body() payload: UserCreateRequestDto): Promise<null> {
		return this.#_service.supplierCreate(payload)
	}

	@Patch(':id')
	UserUpdate(@Param() id: UserUpdateRequestDto, @Body() payload: UserUpdateRequestDto): Promise<null> {
		return this.#_service.userUpdate({ id, ...payload })
	}

	@Delete(':id')
	UserDelete(@Param() payload: UserDeleteRequestDto): Promise<null> {
		return this.#_service.userDelete(payload)
	}
}
