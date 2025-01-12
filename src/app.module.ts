import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma'
import { databaseConfig } from './configs'
import { JwtModule } from '@nestjs/jwt'
import {
	AdminModule,
	AuthModule,
	IncomingOrderModule,
	IncomingOrderPaymentModule,
	IncomingProductModule,
	OrderModule,
	OrderProductModule,
	PaymentModule,
	PermissionModule,
	ProductModule,
	RefundIncomingModule,
	RefundIncomingProductModule,
	ReturnedProductModule,
	RoleModule,
	UserModule,
} from './modules'
import { TelegramModule } from './modules/telegram'
import { ReturnedOrderModule } from './modules/returned-order/returned-order.module'

@Module({
	imports: [
		JwtModule.register({ global: true }),
		ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
		PrismaModule,
		AuthModule,
		ReturnedOrderModule,
		ReturnedProductModule,
		RefundIncomingModule,
		RefundIncomingProductModule,
		AdminModule,
		UserModule,
		RoleModule,
		PermissionModule,
		ProductModule,
		IncomingOrderModule,
		IncomingProductModule,
		IncomingOrderPaymentModule,
		OrderModule,
		OrderProductModule,
		PaymentModule,
		TelegramModule,
	],
})
export class AppModule {}
