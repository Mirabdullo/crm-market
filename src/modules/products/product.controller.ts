import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import { ProductService } from './product.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	ProductCreateRequestDto,
	ProductUpdateRequestDto,
	ProductDeleteRequestDto,
	ProductRetrieveRequestDto,
	ProductRetrieveResponseDto,
	ProductRetrieveAllRequestDto,
	ProductRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ProductRetriveAllResponse, ProductRetriveResponse } from './interfaces'

@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
	readonly #_service: ProductService

	constructor(service: ProductService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: ProductRetrieveAllResponseDto })
	ProductRetrieveAll(@Query() payload: ProductRetrieveAllRequestDto): Promise<ProductRetriveAllResponse> {
		return this.#_service.productRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: ProductRetrieveResponseDto })
	ProductRetrieve(@Param() payload: ProductRetrieveRequestDto): Promise<ProductRetriveResponse> {
		return this.#_service.productRetrieve(payload)
	}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ProductCreate(@Body() payload: ProductCreateRequestDto): Promise<null> {
		return this.#_service.productCreate(payload)
	}

	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ProductUpdate(@Param() id: ProductUpdateRequestDto, @Body() payload: ProductUpdateRequestDto): Promise<null> {
		return this.#_service.productUpdate({ id, ...payload })
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	ProductDelete(@Param() payload: ProductDeleteRequestDto): Promise<null> {
		return this.#_service.productDelete(payload)
	}
}