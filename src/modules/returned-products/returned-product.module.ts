import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ReturnedProductService } from './returned-product.service'
import { ReturnedProductController } from './returned-product.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [ReturnedProductService],
	controllers: [ReturnedProductController],
})
export class ReturnedProductModule {}
