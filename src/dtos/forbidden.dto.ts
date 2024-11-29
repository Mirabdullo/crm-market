import { ApiProperty } from '@nestjs/swagger'

export class ForbiddenExceptionDto {
	@ApiProperty({ example: 'message', type: String })
	message: string
}
