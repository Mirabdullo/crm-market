import * as ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { OrderRetriveAllResponse } from './interfaces'
import { Response } from 'express'

let res: Response
export async function OrderUpload(data: OrderRetriveAllResponse['data']): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('продажа')

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Общая сумма:   ${100}`
	worksheet.getCell('A1').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Клиент', 'Cумма', 'Продавец', 'Информация', 'Долг', 'Дата продажа'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 5
	worksheet.getColumn(2).width = 20
	worksheet.getColumn(3).width = 14
	worksheet.getColumn(4).width = 16
	worksheet.getColumn(5).width = 12
	worksheet.getColumn(6).width = 10
	worksheet.getColumn(6).width = 16

	headerRow.eachCell((cell) => {
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' },
		}
	})

	data.forEach((order, index) => {
		const row = worksheet.addRow([index + 1, order.client.name, order.sum, order.seller.phone, '', order.debt, format(order.sellingDate, 'dd.MM.yyyy HH:mm')])

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

	let date = new Date().toLocaleString()
	date = date.replaceAll(',', '')
	date = date.replaceAll('.', '')
	date = date.replaceAll(' ', '')
	date = date.replaceAll(':', '')

	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	res.setHeader('Content-Disposition', `attachment; filename=продажа_${date}.xlsx`)

	await workbook.xlsx.write(res)
	res.end()
}
