import type { Request } from 'express'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { isJWT } from 'class-validator'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class CheckPermissionGuard implements CanActivate {
	readonly #_reflector: Reflector
	readonly #_jwt: JwtService

	constructor(reflector: Reflector, jwt: JwtService) {
		this.#_reflector = reflector
		this.#_jwt = jwt
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// const permission = this.#_reflector.get<string>(
		// 	PERMISSION,
		// 	context.getHandler(),
		// )

		const request = context.switchToHttp().getRequest<Request>()

		const accessToken = request.headers.authorization?.replace(/^(bearer)\s/i, '')

		if (!accessToken || !isJWT(accessToken)) {
			throw new UnauthorizedException('Unauthorized')
		}

		const user = await this.#_jwt.verify(accessToken, {
			secret: process.env.ACCESS_TOKEN_KEY,
		})

		if (!user) {
			throw new UnauthorizedException('Unauthorized')
		}

		if (!user.roles.includes('super-admin')) {
			// if (!user.permissions.includes(permission)) {
			// 	throw new ForbiddenException('Permission denied')
			// }
		}

		return true
	}
}