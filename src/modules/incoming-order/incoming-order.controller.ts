import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, UseInterceptors } from '@nestjs/common'
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
	IncomingOrderCreateResponseDto,
} from './dtos'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { IncomingOrderCreateResponse, IncomingOrderRetriveAllResponse, IncomingOrderRetriveResponse } from './interfaces'
import { PassUserIdInterceptor } from '../../interceptors'
import { Permission } from '@decorators'
import { Permissions } from '@enums'
import { Response } from 'express'

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

	@Get('upload')
	@ApiOkResponse({ type: [IncomingOrderRetrieveAllResponseDto] })
	IncomingOrderRetrieveAllUpload(@Query() payload: IncomingOrderRetrieveAllRequestDto, @Res() res: Response): Promise<void> {
		return this.#_service.incomingOrderRetrieveAllUpload({
			...payload,
			res,
			pageNumber: payload.pageNumber ?? PAGE_NUMBER,
			pageSize: payload.pageSize ?? PAGE_SIZE,
			pagination: [true, 'true'].includes(payload.pagination) ? false : true,
		})
	}

	@Get(':id')
	@ApiOkResponse({ type: IncomingOrderRetrieveResponseDto })
	IncomingOrderRetrieve(@Param() payload: IncomingOrderRetrieveRequestDto): Promise<IncomingOrderRetriveResponse> {
		return this.#_service.incomingOrderRetrieve({ ...payload })
	}

	@Get('upload/:id')
	@ApiOkResponse({ type: IncomingOrderRetrieveResponseDto })
	IncomingOrderRetrieveUpload(@Param() payload: IncomingOrderRetrieveRequestDto, @Res() res: Response): Promise<void> {
		return this.#_service.incomingOrderRetrieveUpload({ ...payload, res })
	}

	@Permission(Permissions.INCOMING_ORDER_CREATE)
	@Post()
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({ type: IncomingOrderCreateResponseDto })
	IncomingOrderCreate(@Body() payload: IncomingOrderCreateRequestDto): Promise<IncomingOrderCreateResponse> {
		return this.#_service.incomingOrderCreate({
			...payload,
			accepted: [true, 'true'].includes(payload.accepted) ? true : false,
		})
	}

	@Permission(Permissions.INCOMING_ORDER_UPDATE)
	@Patch(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderUpdate(@Param() id: IncomingOrderUpdateRequestDto, @Body() payload: IncomingOrderUpdateRequestDto): Promise<null> {
		return this.#_service.incomingOrderUpdate({ id, ...payload })
	}

	@Permission(Permissions.INCOMING_ORDER_DELETE)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse()
	IncomingOrderDelete(@Param() payload: IncomingOrderDeleteRequestDto): Promise<null> {
		return this.#_service.incomingOrderDelete(payload)
	}
}
