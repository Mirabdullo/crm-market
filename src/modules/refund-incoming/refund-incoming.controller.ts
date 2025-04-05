import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { RefundIncomingService } from './refund-incoming.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	RefundIncomingCreateRequestDto,
	RefundIncomingUpdateRequestDto,
	RefundIncomingDeleteRequestDto,
	RefundIncomingRetrieveRequestDto,
	RefundIncomingRetrieveResponseDto,
	RefundIncomingRetrieveAllRequestDto,
	RefundIncomingRetrieveAllResponseDto,
	RefundIncomingCreateResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RefundIncomingCreateResponse, RefundIncomingRetriveAllResponse, RefundIncomingRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { Permission } from '@decorators'
import { Permissions } from '@enums'

@ApiTags('RefundIncoming')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('refund-incoming')
export class RefundIncomingController {
	readonly #_service: RefundIncomingService

	constructor(service: RefundIncomingService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [RefundIncomingRetrieveAllResponseDto] })
	RefundIncomingRetrieveAll(@Query() payload: RefundIncomingRetrieveAllRequestDto): Promise<RefundIncomingRetriveAllResponse> {
		return this.#_service.refundIncomingRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: RefundIncomingRetrieveResponseDto })
	RefundIncomingRetrieve(@Param() payload: RefundIncomingRetrieveRequestDto): Promise<RefundIncomingRetriveResponse> {
		return this.#_service.RefundIncomingRetrieve(payload)
	}

	@Permission(Permissions.ORDER_CREATE)
	@Post()
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({ type: RefundIncomingCreateResponseDto })
	RefundIncomingCreate(@Body() payload: RefundIncomingCreateRequestDto): Promise<RefundIncomingCreateResponse> {
		return this.#_service.RefundIncomingCreate({
			...payload,
		})
	}

	@Permission(Permissions.ORDER_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	RefundIncomingUpdate(@Param() id: RefundIncomingUpdateRequestDto, @Body() payload: RefundIncomingUpdateRequestDto): Promise<null> {
		return this.#_service.RefundIncomingUpdate({
			id,
			...payload,
		})
	}

	@Permission(Permissions.ORDER_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	RefundIncomingDelete(@Param() payload: RefundIncomingDeleteRequestDto): Promise<null> {
		return this.#_service.RefundIncomingDelete(payload)
	}
}
