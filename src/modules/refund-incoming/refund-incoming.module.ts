import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { RefundIncomingService } from './refund-incoming.service'
import { RefundIncomingController } from './refund-incoming.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [RefundIncomingService],
	controllers: [RefundIncomingController],
})
export class RefundIncomingModule {}
