import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ScheduleModule } from '@nestjs/schedule'
import { IncomingOrderService } from './incoming-order.service'
import { IncomingOrderController } from './incoming-order.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, ScheduleModule.forRoot(), TelegramModule],
	providers: [IncomingOrderService],
	controllers: [IncomingOrderController],
})
export class IncomingOrderModule {}
