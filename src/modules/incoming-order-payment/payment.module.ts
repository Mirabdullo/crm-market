import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { IncomingOrderPaymentService } from './payment.service'
import { IncomingOrderPaymentController } from './payment.controller'

@Module({
	imports: [PrismaModule],
	providers: [IncomingOrderPaymentService],
	controllers: [IncomingOrderPaymentController],
})
export class IncomingOrderPaymentModule {}
