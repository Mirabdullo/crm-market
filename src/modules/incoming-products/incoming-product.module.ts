import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { IncomingProductService } from './incoming-product.service'
import { IncomingProductController } from './incoming-product.controller'

@Module({
	imports: [PrismaModule],
	providers: [IncomingProductService],
	controllers: [IncomingProductController],
})
export class IncomingProductModule {}
