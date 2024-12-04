import type { Request } from 'express'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common'
import type { Observable } from 'rxjs'

export class PassAccessTokenInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
		const httpContext = context.switchToHttp()
		const request = httpContext.getRequest<Request>()

		const { authorization } = request.headers

		if (!authorization) {
			throw new UnauthorizedException('Provide authorization header')
		}

		Object.assign(request.body, {
			accessToken: authorization ? authorization.replace('Bearer ', '') : '',
		})

		return next.handle()
	}
}
