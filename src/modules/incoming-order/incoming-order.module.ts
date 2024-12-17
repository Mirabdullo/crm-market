import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ScheduleModule } from '@nestjs/schedule'
import { IncomingOrderService } from './incoming-order.service'
import { IncomingOrderController } from './incoming-order.controller'

@Module({
	imports: [PrismaModule, ScheduleModule.forRoot()],
	providers: [IncomingOrderService],
	controllers: [IncomingOrderController],
})
export class IncomingOrderModule {}
