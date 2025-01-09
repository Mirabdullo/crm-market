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
		try {
			this.bot = new Telegraf(this.token)

			// Start komandasi
			this.bot.start(async (ctx) => {
				await ctx.reply(`Assalomu alaykum!`, {
					parse_mode: 'HTML',
				})
				await ctx.reply(`Iltimos, botdan ro'yxatdan o'tish uchun <b>"📱 Raqamni yuborish"</b>, tugmasini bosing!`, {
					parse_mode: 'HTML',
					...Markup.keyboard([[Markup.button.contactRequest('📱 Raqamni yuborish')]])
						.oneTime()
						.resize(),
				})
			})

			this.bot.on('message', async (ctx) => {
				const telegramId = ctx.from.id
				const text = 'text' in ctx.message ? ctx.message.text : ''

				if (text) {
					const checkUser = await this.prisma.users.findFirst({
						where: { chatId: telegramId, deletedAt: null },
					})

					const user = await this.prisma.users.findFirst({
						where: { phone: text, deletedAt: null },
					})

					if (user) {
						await ctx.reply(`Raqam qabul qilindi. Botimizga xush kelibsiz!\n\n<b>Siz bilan ishlashimizdan xursandmiz😊!</b>`, {
							parse_mode: 'HTML',
						})
					} else {
						if (!checkUser) {
							await ctx.reply(`Raqam noto'g'ri.\nIltimos qayta urinib ko'ring!`, {
								parse_mode: 'HTML',
							})
						}
					}
				}
			})

			this.bot.launch().then(() => {
				console.log('Telegram bot ishga tushdi.')
			})
		} catch (error) {
			console.log(error)
		}
	}

	async sendMessage(chatId: number, text: string, replyMarkup: any = null): Promise<void> {
		try {
			await axios.post(`${this.telegramApiUrl}/sendMessage`, {
				chat_id: chatId,
				text,
			})
		} catch (error) {
			console.error(error)
		}
	}
}
