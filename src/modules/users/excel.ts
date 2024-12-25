import * as ExcelJS from 'exceljs'
import { UserDeedRetrieveRequest } from './interfaces'
import { format } from 'date-fns'

export async function UserDeedUpload(data: any, payload: UserDeedRetrieveRequest): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Report')

	// Jadval ustunlarini o'rnatish
	worksheet.columns = [
		{ header: '№', key: 'id', width: 5 },
		{ header: 'Время', key: 'time', width: 20 },
		{ header: 'Операция', key: 'operation', width: 20 },
		{ header: 'Дебит', key: 'debit', width: 10 },
		{ header: 'Кредит', key: 'credit', width: 10 },
		{ header: 'Описание', key: 'description', width: 30 },
	]

	// Bosh ma'lumotlarni kiritish
	worksheet.mergeCells('B1:F1')
	worksheet.getCell('B1').value = `Клиент: ${data.name}`
	worksheet.getCell('B1').font = { bold: true }

	worksheet.mergeCells('B2:F2')
	worksheet.getCell('B2').value = `Акт сверки с ${format(payload.startDate, 'dd.MM.yyyy')} по ${format(payload.endDate, 'dd.MM.yyyy')}`
	worksheet.getCell('B2').font = { bold: true }

	worksheet.getCell('F3').value = `Остаток: ${data.debt.toNumber()}`
	worksheet.getCell('F3').alignment = { horizontal: 'right' }

	// Boshlang'ich o'zgaruvchilarni kiritish
	worksheet.mergeCells('A5:F5')
	worksheet.getCell('A5').value = 'Начальный остаток'
	worksheet.getCell('A5').font = { bold: true }

	worksheet.getCell('E5').value = 0

	// Ma'lumotlarni kiritish
	data.data.forEach((entry: any, index: number) => {
		if (entry.type === 'payment') {
			worksheet.addRow({
				id: index + 1,
				time: format(entry.updatedAt, 'dd.MM.yyyy HH:mm'),
				operation: 'Оплата',
				debit: '',
				credit: entry.totalPay.toNumber(),
				description: entry.description,
			})
		} else {
			worksheet.addRow({
				id: index + 1,
				time: format(entry.createdAt, 'dd.MM.yyyy HH:mm'),
				operation: `Продажа: ${entry.articl}`,
				debit: entry.sum.toNumber(),
				credit: '',
				description: '',
			})
		}
	})

	// Yakuniy hisoblarni kiritish
	const totalRow = worksheet.addRow({
		id: '',
		time: '',
		operation: 'Итого',
		debit: data.reduce((acc: number, order: any) => (acc + order.type === 'order' ? order.sum.toNumber() : 0), 0),
		credit: data.reduce((acc: number, payment: any) => (acc + payment.type === 'payment' ? payment.totalPay.toNumber() : 0), 0),
		description: '',
	})
	totalRow.font = { bold: true }

	worksheet.addRow({
		id: '',
		time: '',
		operation: 'Конечный остаток',
		debit: '',
		credit: '',
		description: data.debt.toNumber(),
	}).font = { bold: true }

	worksheet.addRow({
		id: '',
		time: '',
		operation: 'Остаток на конец',
		debit: '',
		credit: '',
		description: '',
	}).font = { bold: true }

	// Excel faylni saqlash
	let date = new Date().toLocaleString()
	date = date.replaceAll(',', '')
	date = date.replaceAll('.', '')
	date = date.replaceAll(' ', '')
	date = date.replaceAll(':', '')

	return workbook.xlsx.writeFile(`${data.name + date}.xlsx`)
}
