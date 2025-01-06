import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [OrderService],
	controllers: [OrderController],
})
export class OrderModule {}
