import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { OrderProductService } from './order-product.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	OrderProductCreateRequestDto,
	OrderProductUpdateRequestDto,
	OrderProductDeleteRequestDto,
	OrderProductRetrieveRequestDto,
	OrderProductRetrieveResponseDto,
	OrderProductRetrieveAllRequestDto,
	OrderProductRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { OrderProductRetriveAllResponse, OrderProductRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { Permission } from '@decorators'
import { Permissions } from '@enums'

@ApiTags('OrderProduct')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('orderProduct')
export class OrderProductController {
	readonly #_service: OrderProductService

	constructor(service: OrderProductService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [OrderProductRetrieveAllResponseDto] })
	OrderProductRetrieveAll(@Query() payload: OrderProductRetrieveAllRequestDto): Promise<OrderProductRetriveAllResponse> {
		return this.#_service.orderProductRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: OrderProductRetrieveResponseDto })
	OrderProductRetrieve(@Param() payload: OrderProductRetrieveRequestDto): Promise<OrderProductRetriveResponse> {
		return this.#_service.orderProductRetrieve(payload)
	}

	@Permission(Permissions.ORDER_PRODUCT_CREATE)
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	OrderProductCreate(@Body() payload: OrderProductCreateRequestDto): Promise<null> {
		const sendUser = [true, 'true'].includes(payload.sendUser) ? true : false
		return this.#_service.orderProductCreate({ sendUser, ...payload })
	}

	@Permission(Permissions.ORDER_PRODUCT_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	OrderProductUpdate(@Param() id: OrderProductUpdateRequestDto, @Body() payload: OrderProductUpdateRequestDto): Promise<null> {
		const sendUser = [true, 'true'].includes(payload.sendUser) ? true : false
		return this.#_service.orderProductUpdate({ id, sendUser, ...payload })
	}

	@Permission(Permissions.ORDER_PRODUCT_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	OrderProductDelete(@Param() payload: OrderProductDeleteRequestDto): Promise<null> {
		const sendUser = [true, 'true'].includes(payload.sendUser) ? true : false
		return this.#_service.orderProductDelete({ sendUser, ...payload })
	}
}
