import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import axios from 'axios'
import { spawn } from 'child_process'
import * as FormData from 'form-data'

@Injectable()
export class BackupService {
	private readonly logger = new Logger(BackupService.name)
	private readonly botToken: string
	private readonly channelId: string

	constructor(private configService: ConfigService) {
		this.botToken = this.configService.get<string>('BOT_TOKEN')
		this.channelId = this.configService.get<string>('BACKUP_CHANEL_ID')
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Tashkent' })
	async handleDatabaseBackup() {
		try {
			const timestamp = new Date().toISOString().split('T')[0]
			const fileName = `backup-${timestamp}.sql`

			// Database URL dan ma'lumotlarni olish
			const dbUrl = this.configService.get<string>('DATABASE_URL')
			const { user, password, host, port, database } = this.parseDatabaseUrl(dbUrl)

			// pg_dump process ni yaratish
			const pg_dump = spawn(
				'pg_dump',
				[
					`-U`,
					user,
					`-h`,
					host,
					`-p`,
					port,
					`-d`,
					database,
					`-F`,
					'p', // plain text format
				],
				{
					env: { ...process.env, PGPASSWORD: password },
				},
			)

			// FormData yaratish
			const form = new FormData()
			form.append('chat_id', this.channelId)
			form.append('document', pg_dump.stdout, {
				filename: fileName,
				contentType: 'application/sql',
			})

			// Telegram API ga yuborish
			const response = await axios.post(`https://api.telegram.org/bot${this.botToken}/sendDocument`, form, {
				headers: {
					...form.getHeaders(),
					'Content-Length': form.getLengthSync(),
				},
				maxContentLength: Infinity,
				maxBodyLength: Infinity,
			})

			if (response.data.ok) {
				this.logger.log(`Backup successfully sent to Telegram`)
			}
		} catch (error) {
			this.logger.error('Backup failed:', error)

			// Xato haqida xabar yuborish
			await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
				chat_id: this.channelId,
				text: `⚠️ Backup failed: ${error.message}`,
			})
		}
	}

	private parseDatabaseUrl(url: string) {
		const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
		const matches = url.match(regex)

		if (!matches) {
			throw new Error('Invalid database URL')
		}

		return {
			user: matches[1],
			password: matches[2],
			host: matches[3],
			port: matches[4],
			database: matches[5],
		}
	}
}
