import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { AdminSignInRequest, AdminSignInResponse } from './interfaces'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '@prisma'
import { AdminRetriveResponse } from '../admins'
import { JwtConfig } from '../../configs'

@Injectable()
export class AuthService {
	readonly #_prisma: PrismaService
	private readonly jwtService: JwtService
	constructor(jwtService: JwtService, prisma: PrismaService) {
		this.jwtService = jwtService
		this.#_prisma = prisma
	}

	async adminSignIn(payload: AdminSignInRequest): Promise<AdminSignInResponse> {
		const admin = await this.#_prisma.admins.findFirst({
			where: { phone: payload.phone, deletedAt: null },
			select: {
				id: true,
				name: true,
				phone: true,
				password: true,
				createdAt: true,
				role: true,
				permissions: {
					select: {
						id: true,
						key: true,
						name: true,
					},
				},
			},
		})
		if (!admin) {
			throw new UnauthorizedException('admin not found')
		}

		const isCorrect = await bcrypt.compare(payload.password, admin.password)
		if (!isCorrect) {
			throw new UnauthorizedException('admin not found')
		}
		delete admin.password
		const token = await this.getAccessToken(admin)
		return { data: admin, accessToken: token }
	}

	private async getAccessToken(payload: AdminRetriveResponse): Promise<string> {
		const accessToken = await this.jwtService.signAsync(
			{
				id: payload.id,
				name: payload.name,
				phone: payload.phone,
				role: payload.role,
				permissions: payload.permissions.map((p: any) => p.key),
			},
			{
				secret: JwtConfig.accessToken.key,
				expiresIn: JwtConfig.accessToken.time,
			},
		)

		return accessToken
	}

	// private async getRefreshToken(payload: { id: string }): Promise<string> {
	// 	const refreshToken = await this.jwtService.signAsync(payload, {
	// 		secret: JwtConfig.refreshToken.key,
	// 		expiresIn: JwtConfig.refreshToken.time,
	// 	})
	// 	return refreshToken
	// }
}
