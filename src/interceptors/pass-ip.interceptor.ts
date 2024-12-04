import type { Request } from 'express'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import type { Observable } from 'rxjs'

export class PassIpInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
		const httpContext = context.switchToHttp()

		const request = httpContext.getRequest<Request>()

		Object.assign(request.body, {
			ip: request.ip ?? request.body.ip,
		})

		return next.handle()
	}
}
