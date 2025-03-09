import { Injectable } from '@nestjs/common'
import { Telegraf, Markup } from 'telegraf'
import { PrismaService } from '@prisma'
import axios from 'axios'

@Injectable()
export class TelegramService {
	private bot: Telegraf
	private readonly token = process.env.BOT_TOKEN
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

			this.bot.on('contact', async (ctx) => {
				const contact = ctx.message.contact
				let num = contact.phone_number.trim().replace(' ', '')
				num = num.replace('+', '')
				
				const telegramId = ctx.message.contact.user_id
				const user = await this.prisma.users.findFirst({
					where: { phone: num, deletedAt: null },
				})

				if (user) {
					if (!user.chatId) {
						await this.prisma.users.update({
							where: { id: user.id },
							data: { chatId: telegramId },
						})

						await ctx.reply(`Raqam qabul qilindi. Botimizga xush kelibsiz!\n\n<b>Siz bilan ishlashimizdan xursandmiz😊!</b>`, {
							parse_mode: 'HTML',
							reply_markup: { remove_keyboard: true },
						})
					} else {
						await ctx.reply(`Siz avval ro'yxatdan o'tgansiz!\n\n<b>Siz bilan ishlayotganimizdan xursandmiz😊!</b>`, {
							parse_mode: 'HTML',
							reply_markup: { remove_keyboard: true },
						})
					}
				} else {
					await ctx.reply(`Raqam noto'g'ri.\nIltimos qayta urinib ko'ring!`, {
						parse_mode: 'HTML',
						reply_markup: { remove_keyboard: true },
					})
				}
			})

			this.bot.on('message', async (ctx) => {
				const telegramId = ctx.from.id
				const text = 'text' in ctx.message ? ctx.message.text : ''

				if (text) {
					const checkUser = await this.prisma.users.findFirst({
						where: { chatId: telegramId, deletedAt: null },
					})

					if (checkUser) {
						await ctx.reply(`Assalomu alaykum!\n\n<b>Siz bilan ishlayotganimizdan xursandmiz😊!</b>`, {
							parse_mode: 'HTML',
						})
					} else {
						const user = await this.prisma.users.findFirst({
							where: { phone: text, deletedAt: null },
						})

						if (user) {
							await this.prisma.users.update({
								where: { id: user.id },
								data: { chatId: telegramId },
							})

							await ctx.reply(`Raqam qabul qilindi. Botimizga xush kelibsiz!\n\n<b>Siz bilan ishlashimizdan xursandmiz😊!</b>`, {
								parse_mode: 'HTML',
							})
						} else {
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

	async sendDocument(chatId: number, pdfBuffer: Buffer, filename: string): Promise<void> {
		await this.bot.telegram.sendDocument(chatId, {
			source: pdfBuffer,
			filename,
		})
	}

	async sendMessageWithDocument(chatId: number, text: string, pdfBuffer: Buffer, filename: string): Promise<void> {
		try {
			await this.bot.telegram.sendDocument(
				chatId,
				{
					source: pdfBuffer,
					filename,
				},
				{
					caption: text, // Fayl bilan birga yuboriladigan matn
				},
			)
		} catch (error) {
			console.log(error)
		}
	}
}
