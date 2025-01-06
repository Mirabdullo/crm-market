import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [PaymentService],
	controllers: [PaymentController],
})
export class PaymentModule {}
