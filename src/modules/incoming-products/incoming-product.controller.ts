import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import { IncomingProductService } from './incoming-product.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	IncomingProductCreateRequestDto,
	IncomingProductUpdateRequestDto,
	IncomingProductDeleteRequestDto,
	IncomingProductRetrieveRequestDto,
	IncomingProductRetrieveResponseDto,
	IncomingProductRetrieveAllRequestDto,
	IncomingProductRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { IncomingProductRetriveAllResponse, IncomingProductRetriveResponse } from './interfaces'

@ApiTags('IncomingProduct')
@ApiBearerAuth()
@Controller('incomingProduct')
export class IncomingProductController {
	readonly #_service: IncomingProductService

	constructor(service: IncomingProductService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: [IncomingProductRetrieveAllResponseDto] })
	IncomingProductRetrieveAll(@Query() payload: IncomingProductRetrieveAllRequestDto): Promise<IncomingProductRetriveAllResponse> {
		return this.#_service.incomingProductRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: IncomingProductRetrieveResponseDto })
	IncomingProductRetrieve(@Param() payload: IncomingProductRetrieveRequestDto): Promise<IncomingProductRetriveResponse> {
		return this.#_service.incomingProductRetrieve(payload)
	}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingProductCreate(@Body() payload: IncomingProductCreateRequestDto): Promise<null> {
		return this.#_service.incomingProductCreate(payload)
	}

	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingProductUpdate(@Param() id: IncomingProductUpdateRequestDto, @Body() payload: IncomingProductUpdateRequestDto): Promise<null> {
		return this.#_service.incomingProductUpdate({ id, ...payload })
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingProductDelete(@Param() payload: IncomingProductDeleteRequestDto): Promise<null> {
		return this.#_service.incomingProductDelete(payload)
	}
}
