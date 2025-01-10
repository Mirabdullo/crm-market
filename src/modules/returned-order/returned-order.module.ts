import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ReturnedOrderService } from './returned-order.service'
import { ReturnedOrderController } from './returned-order.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [ReturnedOrderService],
	controllers: [ReturnedOrderController],
})
export class ReturnedOrderModule {}
