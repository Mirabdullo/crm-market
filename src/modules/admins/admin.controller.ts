import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { AdminService } from './admin.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	AdminCreateRequestDto,
	AdminUpdateRequestDto,
	AdminDeleteRequestDto,
	AdminRetrieveRequestDto,
	AdminRetrieveResponseDto,
	AdminRetrieveAllRequestDto,
	AdminRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AdminRetriveAllResponse, AdminRetriveResponse } from './interfaces'
import { Permission } from '@decorators'
import { Permissions } from '@enums'
import { PassUserIdInterceptor } from '../../interceptors'

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
	readonly #_service: AdminService

	constructor(service: AdminService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: AdminRetrieveAllResponseDto })
	AdminRetrieveAll(@Query() payload: AdminRetrieveAllRequestDto): Promise<AdminRetriveAllResponse> {
		return this.#_service.adminRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
		})
	}
	
	@UseInterceptors(PassUserIdInterceptor)
	@Get('profile')
	@ApiOkResponse({ type: AdminRetrieveResponseDto })
	GetProfile(payload: {id: string}): Promise<AdminRetriveResponse> {
		return this.#_service.getProfile(payload)
	}

	@Get(':id')
	@ApiOkResponse({ type: AdminRetrieveResponseDto })
	AdminRetrieve(@Param() payload: AdminRetrieveRequestDto): Promise<AdminRetriveResponse> {
		return this.#_service.adminRetrieve(payload)
	}

	@Permission(Permissions.ADMIN_CREATE)
	@Post()
	@ApiNoContentResponse()
	AdminCreate(@Body() payload: AdminCreateRequestDto): Promise<null> {
		return this.#_service.adminCreate(payload)
	}

	@Permission(Permissions.ADMIN_UPDATE)
	@Patch(':id')
	AdminUpdate(@Param() id: AdminUpdateRequestDto, @Body() payload: AdminUpdateRequestDto): Promise<null> {
		return this.#_service.adminUpdate({ id, ...payload })
	}

	@Permission(Permissions.ADMIN_DELETE)
	@Delete(':id')
	AdminDelete(@Param() payload: AdminDeleteRequestDto): Promise<null> {
		return this.#_service.adminDelete(payload)
	}
}
