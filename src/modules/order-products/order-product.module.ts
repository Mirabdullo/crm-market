import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { OrderProductService } from './order-product.service'
import { OrderProductController } from './order-product.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [OrderProductService],
	controllers: [OrderProductController],
})
export class OrderProductModule {}
