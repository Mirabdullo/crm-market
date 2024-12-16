import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { RoleService } from './role.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	RoleCreateRequestDto,
	RoleUpdateRequestDto,
	RoleDeleteRequestDto,
	RoleRetrieveRequestDto,
	RoleRetrieveResponseDto,
	RoleRetrieveAllRequestDto,
	RoleRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RoleRetriveAllResponse, RoleRetriveResponse } from './interfaces'

@ApiTags('Role')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
	readonly #_service: RoleService

	constructor(service: RoleService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: RoleRetrieveAllResponseDto })
	RoleRetrieveAll(@Query() payload: RoleRetrieveAllRequestDto): Promise<RoleRetriveAllResponse> {
		return this.#_service.roleRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? true : false,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: RoleRetrieveResponseDto })
	RoleRetrieve(@Param() payload: RoleRetrieveRequestDto): Promise<RoleRetriveResponse> {
		return this.#_service.roleRetrieve(payload)
	}

	@Post()
	@ApiNoContentResponse()
	ClientCreate(@Body() payload: RoleCreateRequestDto): Promise<null> {
		return this.#_service.roleCreate(payload)
	}

	@Patch(':id')
	RoleUpdate(@Param() id: RoleUpdateRequestDto, @Body() payload: RoleUpdateRequestDto): Promise<null> {
		return this.#_service.roleUpdate({ id, ...payload })
	}

	@Delete(':id')
	RoleDelete(@Param() payload: RoleDeleteRequestDto): Promise<null> {
		return this.#_service.roleDelete(payload)
	}
}
