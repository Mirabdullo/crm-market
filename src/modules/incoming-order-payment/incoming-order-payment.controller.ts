import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, UseInterceptors } from '@nestjs/common'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	IncomingOrderPaymentCreateRequestDto,
	IncomingOrderPaymentUpdateRequestDto,
	IncomingOrderPaymentDeleteRequestDto,
	IncomingOrderPaymentRetrieveRequestDto,
	IncomingOrderPaymentRetrieveResponseDto,
	IncomingOrderPaymentRetrieveAllRequestDto,
	IncomingOrderPaymentRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { IncomingOrderPaymentRetriveAllResponse, IncomingOrderPaymentRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { IncomingOrderPaymentService } from './incoming-order-payment.service'
import { Permission } from '@decorators'
import { Permissions } from '@enums'
import { Response } from 'express'

@ApiTags('IncomingOrderPayment')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('incomingOrderPayment')
export class IncomingOrderPaymentController {
	readonly #_service: IncomingOrderPaymentService

	constructor(service: IncomingOrderPaymentService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: IncomingOrderPaymentRetrieveAllResponseDto })
	IncomingOrderPaymentRetrieveAll(@Query() payload: IncomingOrderPaymentRetrieveAllRequestDto): Promise<IncomingOrderPaymentRetriveAllResponse> {
		return this.#_service.incomingOrderPaymentRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get('upload')
	@ApiOkResponse({ type: IncomingOrderPaymentRetrieveAllResponseDto })
	IncomingOrderPaymentRetrieveAllUpload(@Query() payload: IncomingOrderPaymentRetrieveAllRequestDto, @Res() res: Response): Promise<void> {
		return this.#_service.paymentRetrieveAllUpload({
			...payload,
			res,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: IncomingOrderPaymentRetrieveResponseDto })
	IncomingOrderPaymentRetrieve(@Param() payload: IncomingOrderPaymentRetrieveRequestDto): Promise<IncomingOrderPaymentRetriveResponse> {
		return this.#_service.incomingOrderPaymentRetrieve(payload)
	}

	@Permission(Permissions.INCOMING_PAYMENT_CREATE)
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderPaymentCreate(@Body() payload: IncomingOrderPaymentCreateRequestDto): Promise<null> {
		return this.#_service.incomingOrderPaymentCreate(payload)
	}

	@Permission(Permissions.INCOMING_PAYMENT_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderPaymentUpdate(@Param() id: IncomingOrderPaymentUpdateRequestDto, @Body() payload: IncomingOrderPaymentUpdateRequestDto): Promise<null> {
		return this.#_service.incomingOrderPaymentUpdate({ id, ...payload })
	}

	@Permission(Permissions.INCOMING_PAYMENT_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderPaymentDelete(@Param() payload: IncomingOrderPaymentDeleteRequestDto): Promise<null> {
		return this.#_service.incomingOrderPaymentDelete(payload)
	}
}
