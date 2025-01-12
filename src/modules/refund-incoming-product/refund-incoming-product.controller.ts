import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { RefundIncomingProductService } from './refund-incoming-product.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	RefundIncomingProductCreateRequestDto,
	RefundIncomingProductUpdateRequestDto,
	RefundIncomingProductDeleteRequestDto,
	RefundIncomingProductRetrieveRequestDto,
	RefundIncomingProductRetrieveResponseDto,
	RefundIncomingProductRetrieveAllRequestDto,
	RefundIncomingProductRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RefundIncomingProductRetriveAllResponse, RefundIncomingProductRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { Permission } from '@decorators'
import { Permissions } from '@enums'

@ApiTags('RefundIncomingProduct')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('returned-product')
export class RefundIncomingProductController {
	readonly #_service: RefundIncomingProductService

	constructor(service: RefundIncomingProductService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [RefundIncomingProductRetrieveAllResponseDto] })
	RefundIncomingProductRetrieveAll(@Query() payload: RefundIncomingProductRetrieveAllRequestDto): Promise<RefundIncomingProductRetriveAllResponse> {
		return this.#_service.refundIncomingProductRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: RefundIncomingProductRetrieveResponseDto })
	RefundIncomingProductRetrieve(@Param() payload: RefundIncomingProductRetrieveRequestDto): Promise<RefundIncomingProductRetriveResponse> {
		return this.#_service.refundIncomingProductRetrieve(payload)
	}

	@Permission(Permissions.ORDER_PRODUCT_CREATE)
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	RefundIncomingProductCreate(@Body() payload: RefundIncomingProductCreateRequestDto): Promise<null> {
		return this.#_service.refundIncomingProductCreate(payload)
	}

	@Permission(Permissions.ORDER_PRODUCT_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	RefundIncomingProductUpdate(@Param() id: RefundIncomingProductUpdateRequestDto, @Body() payload: RefundIncomingProductUpdateRequestDto): Promise<null> {
		return this.#_service.refundIncomingProductUpdate({ id, ...payload })
	}

	@Permission(Permissions.ORDER_PRODUCT_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	RefundIncomingProductDelete(@Param() payload: RefundIncomingProductDeleteRequestDto): Promise<null> {
		return this.#_service.refundIncomingProductDelete(payload)
	}
}
