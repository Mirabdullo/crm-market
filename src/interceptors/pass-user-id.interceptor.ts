import type { Request } from 'express'
import type { CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common'
import { Observable } from 'rxjs'
import { isJWT } from 'class-validator'
import { Injectable, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class PassUserIdInterceptor implements NestInterceptor {
	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest<Request>()

		const accessToken = request.headers.authorization?.replace(/^(bearer)\s/i, '')

		if (!accessToken || !isJWT(accessToken)) {
			throw new UnauthorizedException('Unauthorized.')
		}

		const user = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())

		console.log('pass user id interceptor: ', user)
		Object.assign(request.body, {
			id: user.id,
		})

		console.log(request.body)

		return next.handle()
	}
}
