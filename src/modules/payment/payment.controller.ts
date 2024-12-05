import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	PaymentCreateRequestDto,
	PaymentUpdateRequestDto,
	PaymentDeleteRequestDto,
	PaymentRetrieveRequestDto,
	PaymentRetrieveResponseDto,
	PaymentRetrieveAllRequestDto,
	PaymentRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PaymentRetriveAllResponse, PaymentRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'

@ApiTags('Payment')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
	readonly #_service: PaymentService

	constructor(service: PaymentService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: PaymentRetrieveAllResponseDto })
	PaymentRetrieveAll(@Query() payload: PaymentRetrieveAllRequestDto): Promise<PaymentRetriveAllResponse> {
		return this.#_service.paymentRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: PaymentRetrieveResponseDto })
	PaymentRetrieve(@Param() payload: PaymentRetrieveRequestDto): Promise<PaymentRetriveResponse> {
		return this.#_service.paymentRetrieve(payload)
	}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	PaymentCreate(@Body() payload: PaymentCreateRequestDto): Promise<null> {
		return this.#_service.paymentCreate(payload)
	}

	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	PaymentUpdate(@Param() id: PaymentUpdateRequestDto, @Body() payload: PaymentUpdateRequestDto): Promise<null> {
		return this.#_service.paymentUpdate({ id, ...payload })
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	PaymentDelete(@Param() payload: PaymentDeleteRequestDto): Promise<null> {
		return this.#_service.paymentDelete(payload)
	}
}
