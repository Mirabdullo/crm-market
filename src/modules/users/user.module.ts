import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { UserService } from './user.service'
import { UserController } from './user.controller'

@Module({
	imports: [PrismaModule],
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {}