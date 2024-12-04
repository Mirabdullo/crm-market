import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { IncomingOrderService } from './incoming-order.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	IncomingOrderCreateRequestDto,
	IncomingOrderUpdateRequestDto,
	IncomingOrderDeleteRequestDto,
	IncomingOrderRetrieveRequestDto,
	IncomingOrderRetrieveResponseDto,
	IncomingOrderRetrieveAllRequestDto,
	IncomingOrderRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { IncomingOrderRetriveAllResponse, IncomingOrderRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'

@ApiTags('IncomingOrder')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('incomingOrder')
export class IncomingOrderController {
	readonly #_service: IncomingOrderService

	constructor(service: IncomingOrderService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [IncomingOrderRetrieveAllResponseDto] })
	IncomingOrderRetrieveAll(@Query() payload: IncomingOrderRetrieveAllRequestDto): Promise<IncomingOrderRetriveAllResponse> {
		return this.#_service.incomingOrderRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: IncomingOrderRetrieveResponseDto })
	IncomingOrderRetrieve(@Param() payload: IncomingOrderRetrieveRequestDto): Promise<IncomingOrderRetriveResponse> {
		return this.#_service.incomingOrderRetrieve(payload)
	}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderCreate(@Body() payload: IncomingOrderCreateRequestDto): Promise<null> {
		return this.#_service.incomingOrderCreate({
			...payload,
			accepted: [true, 'true'].includes(payload.accepted) ? true : false,
		})
	}

	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderUpdate(@Param() id: IncomingOrderUpdateRequestDto, @Body() payload: IncomingOrderUpdateRequestDto): Promise<null> {
		return this.#_service.incomingOrderUpdate({ id, ...payload })
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderDelete(@Param() payload: IncomingOrderDeleteRequestDto): Promise<null> {
		return this.#_service.incomingOrderDelete(payload)
	}
}
