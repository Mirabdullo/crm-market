import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma'
import { databaseConfig } from './configs'
import { JwtModule } from '@nestjs/jwt'
import { AdminModule, AuthModule, PermissionModule, ProductModule, RoleModule, UserModule } from './modules'

@Module({
	imports: [
		JwtModule.register({ global: true }),
		ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
		PrismaModule,
		AuthModule,
		AdminModule,
		UserModule,
		RoleModule,
		PermissionModule,
		ProductModule,
	],
})
export class AppModule {}