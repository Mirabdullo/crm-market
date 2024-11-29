import type { ExceptionFilter } from '@nestjs/common'
import { Catch } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
	catch(exception: any): Observable<any> {
		console.log('exception:', exception)
		return throwError(() => exception.response)
	}
}
