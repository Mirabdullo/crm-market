import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { OrderProductService } from './order-product.service'
import { OrderProductController } from './order-product.controller'

@Module({
	imports: [PrismaModule],
	providers: [OrderProductService],
	controllers: [OrderProductController],
})
export class OrderProductModule {}
