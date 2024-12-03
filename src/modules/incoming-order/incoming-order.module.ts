import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { IncomingOrderService } from './incoming-order.service'
import { IncomingOrderController } from './incoming-order.controller'

@Module({
	imports: [PrismaModule],
	providers: [IncomingOrderService],
	controllers: [IncomingOrderController],
})
export class IncomingOrderModule {}
