import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Global, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor(config: ConfigService) {
		super({
			datasources: {
				db: {
					url: config.getOrThrow<string>('database.url'),
				},
			},
		})
	}

	async onModuleInit() {
		await this.$connect()

		this.$use(async (params, next) => {
			if (params.action === 'create' || params.action === 'update') {
				const uzbekistanTime = new Date()
				uzbekistanTime.setHours(uzbekistanTime.getHours() + 5) // GMT+5
				console.log(params, uzbekistanTime)

				if (params.args.data) {
					if (params.action === 'create') {
						params.args.data.createdAt = uzbekistanTime
					}
					params.args.data.updatedAt = uzbekistanTime
				}
			}

			return next(params)
		})
	}

	async onModuleDestroy() {
		await this.$disconnect()
	}
}
