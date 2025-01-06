import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { IncomingOrderPaymentService } from './incoming-order-payment.service'
import { IncomingOrderPaymentController } from './incoming-order-payment.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [IncomingOrderPaymentService],
	controllers: [IncomingOrderPaymentController],
})
export class IncomingOrderPaymentModule {}
