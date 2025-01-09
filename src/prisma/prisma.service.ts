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
		this.$extends({
			result: {
			  $allModels: {
				createdAt: {
				  needs: {},
				  compute(data: { createdAt: Date }) {
					if (!data.createdAt) return null;
					const date = new Date(data.createdAt);
					date.setTime(date.getTime() + (5 * 60 * 60 * 1000));
					return date;
				  },
				},
				updatedAt: {
				  needs: {},
				  compute(data: { updatedAt: Date }) {
					if (!data.updatedAt) return null;
					const date = new Date(data.updatedAt);
					date.setTime(date.getTime() + (5 * 60 * 60 * 1000));
					return date;
				  },
				},
			  },
			},
		  });
	}

	async onModuleInit() {
		await this.$connect()

		this.$use
	}

	async onModuleDestroy() {
		await this.$disconnect()
	}
}
