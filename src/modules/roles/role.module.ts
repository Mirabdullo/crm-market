import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'

@Module({
	imports: [PrismaModule],
	providers: [RoleService],
	controllers: [RoleController],
})
export class RoleModule {}
