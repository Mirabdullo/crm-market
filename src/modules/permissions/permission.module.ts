import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { PermissionService } from './permission.service'
import { PermissionController } from './permission.controller'

@Module({
	imports: [PrismaModule],
	providers: [PermissionService],
	controllers: [PermissionController],
})
export class PermissionModule {}
