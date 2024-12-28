import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
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
	UserDeedRetrieveRequestDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UserRetriveAllResponse, UserRetriveResponse } from './interfaces'
import { Permissions } from '@enums'
import { Permission } from '@decorators'
import { Response } from 'express'

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

	@Get('client/deed')
	@ApiOkResponse({ type: UserRetrieveAllResponseDto })
	ClientDeedRetrieve(@Query() payload: UserDeedRetrieveRequestDto): Promise<any> {
		return this.#_service.clientDeedRetrieve({
			...payload,
			startDate: payload.startDate ? payload.startDate : new Date().toDateString(),
			endDate: payload.endDate ? payload.endDate : new Date().toDateString(),
		})
	}

	@Get('client/deed/upload')
	@ApiOkResponse({ type: UserRetrieveAllResponseDto })
	ClientDeedRetrieveUpload(@Query() payload: UserDeedRetrieveRequestDto, @Res() res: Response) {
		const result = this.#_service.clientDeedRetrieveUpload({
			...payload,
			res,
			startDate: payload.startDate ? payload.startDate : new Date().toDateString(),
			endDate: payload.endDate ? payload.endDate : new Date().toDateString(),
		})

		res.json(result)
	}

	@Get('supplier/deed')
	@ApiOkResponse({ type: UserRetrieveAllResponseDto })
	SupplierDeedRetrieve(@Query() payload: UserDeedRetrieveRequestDto): Promise<any> {
		return this.#_service.supplierDeedRetrieve({
			...payload,
			startDate: payload.startDate ? payload.startDate : new Date().toDateString(),
			endDate: payload.endDate ? payload.endDate : new Date().toDateString(),
		})
	}

	@Get('supplier/deed')
	@ApiOkResponse({ type: UserRetrieveAllResponseDto })
	SupplierDeedRetrieveUpload(@Query() payload: UserDeedRetrieveRequestDto, @Res() res: Response) {
		const result = this.#_service.supplierDeedRetrieveUpload({
			...payload,
			res,
			startDate: payload.startDate ? payload.startDate : new Date().toDateString(),
			endDate: payload.endDate ? payload.endDate : new Date().toDateString(),
		})

		res.json(result)
	}

	@Get(':id')
	@ApiOkResponse({ type: UserRetrieveResponseDto })
	UserRetrieve(@Param() payload: UserRetrieveRequestDto): Promise<UserRetriveResponse> {
		return this.#_service.userRetrieve(payload)
	}

	@Permission(Permissions.SUPPLIER_CREATE)
	@Post('supplier')
	@ApiNoContentResponse()
	SupplierCreate(@Body() payload: UserCreateRequestDto): Promise<null> {
		return this.#_service.supplierCreate(payload)
	}

	@Permission(Permissions.CLIENT_CREATE)
	@Post('client')
	@ApiNoContentResponse()
	ClientCreate(@Body() payload: UserCreateRequestDto): Promise<null> {
		return this.#_service.clientCreate(payload)
	}

	@Permission(Permissions.SUPPLIER_UPDATE)
	@Patch(':id')
	UserUpdate(@Param() id: UserUpdateRequestDto, @Body() payload: UserUpdateRequestDto): Promise<null> {
		return this.#_service.userUpdate({ id, ...payload })
	}

	@Permission(Permissions.SUPPLIER_DELETE)
	@Delete(':id')
	UserDelete(@Param() payload: UserDeleteRequestDto): Promise<null> {
		return this.#_service.userDelete(payload)
	}
}
