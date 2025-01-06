import { Injectable } from '@nestjs/common'
import { Telegraf, Markup } from 'telegraf'
import { PrismaService } from '@prisma'
import axios from 'axios'

@Injectable()
export class TelegramService {
	private bot: Telegraf
	private readonly token = process.env.BOT_TOKEN
	private userSessions: Map<number, { phone?: string }> = new Map()
	private readonly telegramApiUrl = `https://api.telegram.org/bot${this.token}`

	constructor(private readonly prisma: PrismaService) {
		this.bot = new Telegraf(this.token)

		// Start komandasi
		this.bot.start(async (ctx) => {
			const chatId = ctx.chat.id
			this.userSessions.set(chatId, {}) // Yangi sessiya yaratish
			await ctx.reply('Assalomu alaykum!\nBotimizga xush kelibsiz!\nIltimos telefon raqamingizni kiriting:')
		})

		// Xabarlarni boshqarish
		this.bot.on('text', async (ctx) => {
			const chatId = ctx.chat.id
			const userSession = this.userSessions.get(chatId)

			if (!userSession) {
				await ctx.reply('Iltimos, /start buyruqni bosing.')
				return
			}

			if (!userSession.phone) {
				// Telefon raqami kiritish jarayoni
				userSession.phone = ctx.message.text

				// Foydalanuvchini bazada tekshirish
				const user = await this.prisma.users.findFirst({
					where: {
						phone: userSession.phone,
					},
				})

				if (user) {
					// Chat IDni saqlash
					await this.prisma.users.update({
						where: { id: user.id },
						data: { chatId },
					})

					await ctx.reply('Tizimga muvaffaqiyatli kirdingiz!')
					console.log(`Chat ID ${chatId} foydalanuvchi ${user.id} uchun saqlandi.`)
				} else {
					await ctx.reply("Telefon raqami noto'g'ri. Qayta urinib ko‘ring.")
				}

				// Sessiyani tozalash
				this.userSessions.delete(chatId)
			}
		})

		this.bot.launch().then(() => {
			console.log('Telegram bot ishga tushdi.')
		})
	}

	async sendMessage(chatId: number, text: string, replyMarkup: any = null): Promise<void> {
		try {
			await axios.post(`${this.telegramApiUrl}/sendMessage`, {
				chat_id: chatId,
				text,
				// reply_markup: replyMarkup,
			})
		} catch (error) {
			console.error(error)
		}
	}
}
