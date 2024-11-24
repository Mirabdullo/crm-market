import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'

@Module({
	imports: [PrismaModule],
	providers: [AdminService],
	controllers: [AdminController],
})
export class AdminModule {}
