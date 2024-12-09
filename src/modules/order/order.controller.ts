import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { OrderService } from './order.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	OrderCreateRequestDto,
	OrderUpdateRequestDto,
	OrderDeleteRequestDto,
	OrderRetrieveRequestDto,
	OrderRetrieveResponseDto,
	OrderRetrieveAllRequestDto,
	OrderRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { OrderRetriveAllResponse, OrderRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'

@ApiTags('Order')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('Order')
export class OrderController {
	readonly #_service: OrderService

	constructor(service: OrderService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [OrderRetrieveAllResponseDto] })
	OrderRetrieveAll(@Query() payload: OrderRetrieveAllRequestDto): Promise<OrderRetriveAllResponse> {
		return this.#_service.OrderRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: OrderRetrieveResponseDto })
	OrderRetrieve(@Param() payload: OrderRetrieveRequestDto): Promise<OrderRetriveResponse> {
		return this.#_service.OrderRetrieve(payload)
	}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	OrderCreate(@Body() payload: OrderCreateRequestDto): Promise<null> {
		return this.#_service.OrderCreate({
			...payload,
			accepted: [true, 'true'].includes(payload.accepted) ? true : false,
		})
	}

	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	OrderUpdate(@Param() id: OrderUpdateRequestDto, @Body() payload: OrderUpdateRequestDto): Promise<null> {
		return this.#_service.OrderUpdate({ id, ...payload })
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	OrderDelete(@Param() payload: OrderDeleteRequestDto): Promise<null> {
		return this.#_service.OrderDelete(payload)
	}
}
