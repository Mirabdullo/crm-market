import { json } from 'express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { appConfig } from './configs'
import { PassUserIdInterceptor } from './interceptors'

setImmediate(async (): Promise<void> => {
	const app = await NestFactory.create<INestApplication>(AppModule, { cors: true })

	app.use(json({ limit: '50mb' }))
	
	const swaggerConfig = new DocumentBuilder().addBearerAuth().build()
	const document = SwaggerModule.createDocument(app, swaggerConfig)
	SwaggerModule.setup('docs', app, document)
	
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
	app.useGlobalInterceptors(new PassUserIdInterceptor())
	
	console.log('app config:', appConfig)

	await app.listen(appConfig.port, appConfig.host)
})
