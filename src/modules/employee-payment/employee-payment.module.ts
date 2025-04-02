import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { EmloyeePaymentService } from './employee-payment.service'
import { EmloyeePaymentController } from './employee-payment.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [EmloyeePaymentService],
	controllers: [EmloyeePaymentController],
})
export class EmloyeePaymentModule {}
