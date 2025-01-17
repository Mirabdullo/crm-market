import { json } from 'express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { appConfig } from './configs'
import { ReedExcelFile, ReedExcelFile2 } from './modules/order/excel'

setImmediate(async (): Promise<void> => {
	const app = await NestFactory.create<INestApplication>(AppModule, { cors: true })

	app.use(json({ limit: '50mb' }))
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

	const swaggerConfig = new DocumentBuilder().addBearerAuth().build()
	const document = SwaggerModule.createDocument(app, swaggerConfig)
	SwaggerModule.setup('docs', app, document)

	console.log('app config:', appConfig)
	await ReedExcelFile()

	await app.listen(appConfig.port, appConfig.host)
})
