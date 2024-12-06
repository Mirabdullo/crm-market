import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'

@Module({
	imports: [PrismaModule],
	providers: [OrderService],
	controllers: [OrderController],
})
export class OrderModule {}
