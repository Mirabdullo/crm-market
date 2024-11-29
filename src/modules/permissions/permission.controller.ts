import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	PermissionCreateRequestDto,
	PermissionUpdateRequestDto,
	PermissionDeleteRequestDto,
	PermissionRetrieveRequestDto,
	PermissionRetrieveResponseDto,
	PermissionRetrieveAllRequestDto,
	PermissionRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PermissionRetriveAllResponse, PermissionRetriveResponse } from './interfaces'

@ApiTags('Permission')
@ApiBearerAuth()
@Controller('permission')
export class PermissionController {
	readonly #_service: PermissionService

	constructor(service: PermissionService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: PermissionRetrieveAllResponseDto })
	PermissionRetrieveAll(@Query() payload: PermissionRetrieveAllRequestDto): Promise<PermissionRetriveAllResponse> {
		return this.#_service.permissionRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get('role/:id')
	@ApiOkResponse({ type: PermissionRetrieveResponseDto })
	PermissionRetrieveByRoleId(@Param() payload: PermissionRetrieveRequestDto): Promise<PermissionRetriveResponse[]> {
		return this.#_service.permissionRetrieveByRoleId(payload)
	}

	@Get(':id')
	@ApiOkResponse({ type: PermissionRetrieveResponseDto })
	PermissionRetrieve(@Param() payload: PermissionRetrieveRequestDto): Promise<PermissionRetriveResponse> {
		return this.#_service.permissionRetrieve(payload)
	}

	@Post()
	@ApiNoContentResponse()
	PermissionCreate(@Body() payload: PermissionCreateRequestDto): Promise<null> {
		return this.#_service.permissionCreate(payload)
	}

	@Patch(':id')
	PermissionUpdate(@Param() id: PermissionUpdateRequestDto, @Body() payload: PermissionUpdateRequestDto): Promise<null> {
		return this.#_service.permissionUpdate({ id, ...payload })
	}

	@Delete(':id')
	PermissionDelete(@Param() payload: PermissionDeleteRequestDto): Promise<null> {
		return this.#_service.permissionDelete(payload)
	}
}
