import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { IncomingOrderPaymentService } from './incoming-order-payment.service'
import { IncomingOrderPaymentController } from './incoming-order-payment.controller'

@Module({
	imports: [PrismaModule],
	providers: [IncomingOrderPaymentService],
	controllers: [IncomingOrderPaymentController],
})
export class IncomingOrderPaymentModule {}
