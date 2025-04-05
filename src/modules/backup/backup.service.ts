import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import axios from 'axios'
import { spawn } from 'child_process'
import * as FormData from 'form-data'
import { TelegramService } from '../telegram'

@Injectable()
export class BackupService {
	private readonly logger = new Logger(BackupService.name)
	private readonly channelId: string
	private readonly telegramService: TelegramService

	constructor(private configService: ConfigService, telegram: TelegramService) {
		this.channelId = this.configService.get<string>('BACKUP_CHANEL_ID')
		this.telegramService = telegram
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Tashkent' })
	async handleDatabaseBackup() {
		try {
			const timestamp = new Date().toISOString().split('T')[0]
			const fileName = `backup-${timestamp}.sql`

			// 🔹 pg_dump orqali backup olish (bufferga yozish)
			const backupData = await this.dumpDatabase()

			if (!backupData) {
				throw new Error('Backup olishda muammo yuzaga keldi')
			}

			// 🔹 Telegram API ga yuborish
			await this.telegramService.sendDocument(parseInt(this.channelId), backupData, fileName)

			this.logger.log(`✅ Backup muvaffaqiyatli yuborildi: ${fileName}`)
		} catch (error) {
			this.logger.error('Backup failed:', error)

			// Xato haqida xabar yuborish
			this.telegramService.sendMessage(parseInt(this.channelId), `⚠️ Backup failed: ${error.message}`)
		}
	}

	private parseDatabaseUrl(url: string) {
		const regex = /postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/([^?]+)/
		const matches = url.match(regex)

		if (!matches) {
			throw new Error('Invalid database URL')
		}

		return {
			user: matches[1],
			password: matches[2],
			host: matches[3],
			port: matches[4],
			database: matches[5].split('?')[0],
		}
	}

	private dumpDatabase(): Promise<Buffer> {
		const dbUrl = this.configService.get<string>('DATABASE_URL')
		return new Promise((resolve, reject) => {
			const { user, password, host, port, database } = this.parseDatabaseUrl(dbUrl)

			// 🔹 pg_dump ni ishga tushirish
			const pg_dump = spawn('pg_dump', [`-U`, user, `-h`, host, `-p`, port, `-d`, database, `-F`, 'p'], { env: { ...process.env, PGPASSWORD: password } })

			const backupBuffer: Buffer[] = []

			pg_dump.stdout.on('data', (data) => {
				backupBuffer.push(data)
			})

			pg_dump.stderr.on('data', (data) => {
				console.error('pg_dump xatolik:', data.toString())
			})

			pg_dump.on('close', (code) => {
				if (code === 0) {
					resolve(Buffer.concat(backupBuffer))
				} else {
					reject(new Error(`pg_dump tugadi, kod: ${code}`))
				}
			})
		})
	}
}
