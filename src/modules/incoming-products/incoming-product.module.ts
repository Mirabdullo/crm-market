import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { IncomingProductService } from './incoming-product.service'
import { IncomingProductController } from './incoming-product.controller'
import { TelegramModule } from '../telegram'

@Module({
	imports: [PrismaModule, TelegramModule],
	providers: [IncomingProductService],
	controllers: [IncomingProductController],
})
export class IncomingProductModule {}
