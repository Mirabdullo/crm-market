import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, UseInterceptors } from '@nestjs/common'
import { EmloyeePaymentService } from './employee-payment.service'
import { PAGE_NUMBER, PAGE_SIZE } from './constants'
import {
	EmloyeePaymentCreateRequestDto,
	EmloyeePaymentUpdateRequestDto,
	EmloyeePaymentDeleteRequestDto,
	EmloyeePaymentRetrieveRequestDto,
	EmloyeePaymentRetrieveResponseDto,
	EmloyeePaymentRetrieveAllRequestDto,
	EmloyeePaymentRetrieveAllResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { EmloyeePaymentRetriveAllResponse, EmloyeePaymentRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { Permissions } from '@enums'
import { Permission } from '@decorators'
import { Response } from 'express'

@ApiTags('EmloyeePayment')
@UseInterceptors(PassUserIdInterceptor)
@ApiBearerAuth()
@Controller('employeePayment')
export class EmloyeePaymentController {
	readonly #_service: EmloyeePaymentService

	constructor(service: EmloyeePaymentService) {
		this.#_service = service
	}

	@Get()
	@ApiOkResponse({ type: EmloyeePaymentRetrieveAllResponseDto })
	EmloyeePaymentRetrieveAll(@Query() payload: EmloyeePaymentRetrieveAllRequestDto): Promise<EmloyeePaymentRetriveAllResponse> {
		return this.#_service.employeePaymentRetrieveAll({
			...payload,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: EmloyeePaymentRetrieveResponseDto })
	EmloyeePaymentRetrieve(@Param() payload: EmloyeePaymentRetrieveRequestDto): Promise<EmloyeePaymentRetriveResponse> {
		return this.#_service.employeePaymentRetrieve(payload)
	}

	@Permission(Permissions.PAYMENT_CREATE)
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	EmloyeePaymentCreate(@Body() payload: EmloyeePaymentCreateRequestDto): Promise<null> {
		return this.#_service.employeePaymentCreate(payload)
	}

	@Permission(Permissions.PAYMENT_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	EmloyeePaymentUpdate(@Param() id: EmloyeePaymentUpdateRequestDto, @Body() payload: EmloyeePaymentUpdateRequestDto): Promise<null> {
		return this.#_service.employeePaymentUpdate({ id, ...payload })
	}

	@Permission(Permissions.PAYMENT_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	EmloyeePaymentDelete(@Param() payload: EmloyeePaymentDeleteRequestDto): Promise<null> {
		return this.#_service.employeePaymentDelete(payload)
	}
}
