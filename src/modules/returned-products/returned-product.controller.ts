import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { ReturnedProductService } from './returned-product.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	ReturnedProductCreateRequestDto,
	ReturnedProductUpdateRequestDto,
	ReturnedProductDeleteRequestDto,
	ReturnedProductRetrieveRequestDto,
	ReturnedProductRetrieveResponseDto,
	ReturnedProductRetrieveAllRequestDto,
	ReturnedProductRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ReturnedProductRetriveAllResponse, ReturnedProductRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { Permission } from '@decorators'
import { Permissions } from '@enums'

@ApiTags('ReturnedProduct')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('returned-product')
export class ReturnedProductController {
	readonly #_service: ReturnedProductService

	constructor(service: ReturnedProductService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [ReturnedProductRetrieveAllResponseDto] })
	ReturnedProductRetrieveAll(@Query() payload: ReturnedProductRetrieveAllRequestDto): Promise<ReturnedProductRetriveAllResponse> {
		return this.#_service.returnedProductRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: ReturnedProductRetrieveResponseDto })
	ReturnedProductRetrieve(@Param() payload: ReturnedProductRetrieveRequestDto): Promise<ReturnedProductRetriveResponse> {
		return this.#_service.returnedProductRetrieve(payload)
	}

	@Permission(Permissions.ORDER_PRODUCT_CREATE)
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ReturnedProductCreate(@Body() payload: ReturnedProductCreateRequestDto): Promise<null> {
		const sendUser = [true, 'true'].includes(payload.sendUser) ? true : false
		return this.#_service.returnedProductCreate({ sendUser, ...payload })
	}

	@Permission(Permissions.ORDER_PRODUCT_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ReturnedProductUpdate(@Param() id: ReturnedProductUpdateRequestDto, @Body() payload: ReturnedProductUpdateRequestDto): Promise<null> {
		const sendUser = [true, 'true'].includes(payload.sendUser) ? true : false
		return this.#_service.returnedProductUpdate({ id, sendUser, ...payload })
	}

	@Permission(Permissions.ORDER_PRODUCT_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ReturnedProductDelete(@Param() payload: ReturnedProductDeleteRequestDto): Promise<null> {
		const sendUser = [true, 'true'].includes(payload.sendUser) ? true : false
		return this.#_service.returnedProductDelete({ sendUser, ...payload })
	}
}
