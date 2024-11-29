import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'

@Module({
	imports: [PrismaModule],
	providers: [ProductService],
	controllers: [ProductController],
})
export class ProductModule {}
