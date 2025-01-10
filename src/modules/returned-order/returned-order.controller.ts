import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, UseInterceptors } from '@nestjs/common'
import { ReturnedOrderService } from './returned-order.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	ReturnedOrderCreateRequestDto,
	ReturnedOrderUpdateRequestDto,
	ReturnedOrderDeleteRequestDto,
	ReturnedOrderRetrieveRequestDto,
	ReturnedOrderRetrieveResponseDto,
	ReturnedOrderRetrieveAllRequestDto,
	ReturnedOrderRetrieveAllResponseDto,
	ReturnedOrderCreateResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ReturnedOrderCreateResponse, ReturnedOrderRetriveAllResponse, ReturnedOrderRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { Permission } from '@decorators'
import { Permissions } from '@enums'

@ApiTags('ReturnedOrder')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('returned-order')
export class ReturnedOrderController {
	readonly #_service: ReturnedOrderService

	constructor(service: ReturnedOrderService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [ReturnedOrderRetrieveAllResponseDto] })
	ReturnedOrderRetrieveAll(@Query() payload: ReturnedOrderRetrieveAllRequestDto): Promise<ReturnedOrderRetriveAllResponse> {
		let accepted = undefined
		if (['true', true].includes(payload.accepted) || ['false', false].includes(payload.accepted)) {
			if (['true', true].includes(payload.accepted)) {
				accepted = true
			} else {
				accepted = false
			}
		}
		return this.#_service.ReturnedOrderRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			accepted,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: ReturnedOrderRetrieveResponseDto })
	ReturnedOrderRetrieve(@Param() payload: ReturnedOrderRetrieveRequestDto): Promise<ReturnedOrderRetriveResponse> {
		return this.#_service.ReturnedOrderRetrieve(payload)
	}

	@Permission(Permissions.ORDER_CREATE)
	@Post()
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({ type: ReturnedOrderCreateResponseDto })
	ReturnedOrderCreate(@Body() payload: ReturnedOrderCreateRequestDto): Promise<ReturnedOrderCreateResponse> {
		return this.#_service.ReturnedOrderCreate({
			...payload,
		})
	}

	@Permission(Permissions.ORDER_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ReturnedOrderUpdate(@Param() id: ReturnedOrderUpdateRequestDto, @Body() payload: ReturnedOrderUpdateRequestDto): Promise<null> {
		const accepted = ['true', true].includes(payload.accepted) ? true : false
		return this.#_service.ReturnedOrderUpdate({ id, accepted, ...payload })
	}

	@Permission(Permissions.ORDER_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ReturnedOrderDelete(@Param() payload: ReturnedOrderDeleteRequestDto): Promise<null> {
		return this.#_service.ReturnedOrderDelete(payload)
	}
}
