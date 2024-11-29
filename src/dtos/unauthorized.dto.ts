import { ApiProperty } from '@nestjs/swagger'

export class UnauthorizedDto {
	@ApiProperty({ example: 'message', type: String })
	message: string
}
