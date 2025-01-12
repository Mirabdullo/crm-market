import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { RefundIncomingProductService } from './refund-incoming-product.service'
import { RefundIncomingProductController } from './refund-incoming-product.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [RefundIncomingProductService],
	controllers: [RefundIncomingProductController],
})
export class RefundIncomingProductModule {}
