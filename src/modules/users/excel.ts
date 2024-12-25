import * as ExcelJS from 'exceljs'
import { UserDeedRetrieveRequest } from './interfaces'
import { format } from 'date-fns'

export async function UserDeedUpload(data: any, payload: UserDeedRetrieveRequest): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Report')

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Клиент: ${data.name}`
	worksheet.getCell('A1').font = { bold: true }

	worksheet.mergeCells('D1:F1')
	worksheet.getCell('D1').value = `Остаток: ${data.debt.toNumber()}`
	worksheet.getCell('D1').font = { bold: true }
	worksheet.getCell('D1').alignment = { horizontal: 'right' }

	worksheet.mergeCells('A2:F2')
	worksheet.getCell('A2').value = `Акт сверки с ${format(payload.startDate, 'dd.MM.yyyy')} по ${format(payload.endDate, 'dd.MM.yyyy')}`
	worksheet.getCell('A2').font = { bold: true }
	worksheet.addRow([])
	// Boshlang'ich o'zgaruvchilarni kiritish
	worksheet.mergeCells('A4:C4')
	worksheet.getCell('A4').value = 'Начальный остаток'
	worksheet.getCell('A4').font = { bold: true }

	worksheet.mergeCells('D4:E4')
	worksheet.getCell('D4').value = 0
	worksheet.getCell('D4').font = { bold: true }
	worksheet.getCell('D4').alignment = { horizontal: 'right' }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Время', 'Операция', 'Дебит', 'Кредит', 'Описание'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 5
	worksheet.getColumn(2).width = 20
	worksheet.getColumn(3).width = 16
	worksheet.getColumn(4).width = 10
	worksheet.getColumn(5).width = 10
	worksheet.getColumn(6).width = 20

	headerRow.eachCell((cell) => {
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' },
		}
	})

	let totalSum = 0
	let totalPay = 0
	// Ma'lumotlarni kiritish
	data.data.forEach((entry: any, index: number) => {
		if (entry.type === 'payment') {
			totalPay += entry.totalPay.toNumber()
			const row = worksheet.addRow([index + 1, format(entry.updatedAt, 'dd.MM.yyyy HH:mm'), 'Оплата', '', entry.totalPay.toNumber(), entry.description])

			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' }
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				}
			})
		} else {
			totalSum += entry.sum.toNumber()
			const row = worksheet.addRow([index + 1, format(entry.createdAt, 'dd.MM.yyyy HH:mm'), `Продажа: ${entry.articl}`, entry.sum.toNumber(), '', ''])

			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' }
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				}
			})
		}
	})

	// Yakuniy hisoblarni kiritish
	const totalRow = worksheet.addRow(['', '', 'Итого', totalSum, totalPay, ''])
	totalRow.font = { bold: true }

	worksheet.addRow(['', '', 'Конечный остаток', '', '', data.debt.toNumber()]).font = { bold: true }

	worksheet.addRow(['', '', 'Остаток на конец', '', '', '']).font = { bold: true }

	worksheet.eachRow((row) => {
		row.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			}
		})
	})

	// Excel faylni saqlash
	let date = new Date().toLocaleString()
	date = date.replaceAll(',', '')
	date = date.replaceAll('.', '')
	date = date.replaceAll(' ', '')
	date = date.replaceAll(':', '')

	payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	payload.res.setHeader('Content-Disposition', `attachment; filename=${data.name + date}.xlsx`)

	await workbook.xlsx.write(payload.res)
	payload.res.end()
}

export async function UserDeedUploadWithProduct(data: any, payload: UserDeedRetrieveRequest): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Report')

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Клиент: ${data.name}`
	worksheet.getCell('A1').font = { bold: true }

	worksheet.mergeCells('D1:F1')
	worksheet.getCell('D1').value = `Остаток: ${data.debt.toNumber()}`
	worksheet.getCell('D1').font = { bold: true, size: 14 }
	worksheet.getCell('D1').alignment = { horizontal: 'right' }

	worksheet.mergeCells('A2:F2')
	worksheet.getCell('A2').value = `Акт сверки с ${format(payload.startDate, 'dd.MM.yyyy')} по ${format(payload.endDate, 'dd.MM.yyyy')}`
	worksheet.getCell('A2').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Товар', 'Количество', 'Цена', 'Стоимость', 'Операция', 'Время'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 5
	worksheet.getColumn(2).width = 20
	worksheet.getColumn(3).width = 16
	worksheet.getColumn(4).width = 8
	worksheet.getColumn(5).width = 12
	worksheet.getColumn(6).width = 18
	worksheet.getColumn(7).width = 18

	headerRow.eachCell((cell) => {
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' },
		}
	})

	let totalSum = 0
	let totalPay = 0
	// Ma'lumotlarni kiritish
	let index = 0
	data.data.forEach((entry: any) => {
		if (entry.type === 'payment') {
			totalPay += entry.totalPay.toNumber()
			index += 1
			const row = worksheet.addRow([index, '', 0, entry.totalPay.toNumber(), entry.totalPay.toNumber(), 'Оплата долга', format(entry.updatedAt, 'dd.MM.yyyy HH:mm')])

			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' }
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				}
			})
		} else {
			totalSum += entry.sum.toNumber()
			if (entry.products.length) {
				entry.products.forEach((product: any) => {
					index += 1
					const row = worksheet.addRow([
						index,
						product.product.name,
						product.count,
						product.price.toNumber(),
						product.count * product.price.toNumber(),
						'Продажа',
						format(entry.createdAt, 'dd.MM.yyyy HH:mm'),
					])

					row.eachCell((cell) => {
						cell.alignment = { vertical: 'middle', horizontal: 'center' }
						cell.border = {
							top: { style: 'thin' },
							left: { style: 'thin' },
							bottom: { style: 'thin' },
							right: { style: 'thin' },
						}
					})
				})
			}
		}
	})

	// Yakuniy hisoblarni kiritish
	worksheet.addRow([])
	worksheet.mergeCells(`A${index + 5}:G${index + 5}`)
	worksheet.getCell(`A${index + 5}`).value = 'Итого'
	worksheet.getCell('D1').font = { bold: true }
	worksheet.getCell('D1').alignment = { horizontal: 'center' }

	worksheet.addRow(['', 'Продажи: ', '', '', totalSum, '', '']).font = { bold: true }

	worksheet.addRow(['', 'Оплата: ', '', '', totalPay, '', '']).font = { bold: true }

	worksheet.eachRow((row) => {
		row.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			}
		})
	})

	// Excel faylni saqlash
	let date = new Date().toLocaleString()
	date = date.replaceAll(',', '')
	date = date.replaceAll('.', '')
	date = date.replaceAll(' ', '')
	date = date.replaceAll(':', '')

	payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	payload.res.setHeader('Content-Disposition', `attachment; filename=${data.name + '_' + date}.xlsx`)

	await workbook.xlsx.write(payload.res)
	payload.res.end()
}
