import * as ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { Response } from 'express'
import { IncomingOrderRetriveAllResponse, IncomingOrderRetriveResponse } from './interfaces'

export async function IncomingOrderUpload(data: IncomingOrderRetriveAllResponse['data'], res: Response): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('продажа')

	const sum = data.reduce((sum, item) => sum + item.sum, 0)

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Общая сумма:   ${sum}`
	worksheet.getCell('A1').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Поставщик', 'Cумма', 'Кем оприходован', 'Информация', 'Дата прихода'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 5
	worksheet.getColumn(2).width = 20
	worksheet.getColumn(3).width = 14
	worksheet.getColumn(4).width = 16
	worksheet.getColumn(5).width = 12
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
		const row = worksheet.addRow([index + 1, order.supplier.name, order.sum, order.admin.phone, '', format(order.sellingDate, 'dd.MM.yyyy HH:mm')])

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
	res.setHeader('Content-Disposition', `attachment; filename=приход${date}.xlsx`)

	await workbook.xlsx.write(res)
	res.end()
}

export async function IncomingOrderUploadWithProduct(data: IncomingOrderRetriveResponse, res: Response): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('продажа')

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Приход от:   ${format(data.sellingDate, 'dd.MM.yyyy HH:mm')}`
	worksheet.getCell('A1').font = { bold: true }

	worksheet.mergeCells('A2:C2')
	worksheet.getCell('A2').value = `Поставщик:   ${data.supplier.name}`
	worksheet.getCell('A2').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Товар', 'Количество', 'Цена', 'Стоимость'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 5
	worksheet.getColumn(2).width = 20
	worksheet.getColumn(3).width = 14
	worksheet.getColumn(4).width = 12
	worksheet.getColumn(5).width = 14

	headerRow.eachCell((cell) => {
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' },
		}
	})

	let sum = 0
	data.incomingProducts.forEach((product, index) => {
		sum += product.cost * product.count
		const row = worksheet.addRow([index + 1, product.product.name, product.count, product.cost, product.count * product.cost])

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

	worksheet.addRow([])
	const finishedRow = worksheet.addRow(['', 'Итого', '', '', sum])
	finishedRow.font = { bold: true }
	finishedRow.alignment = { horizontal: 'center', vertical: 'middle' }

	let date = new Date().toLocaleString()
	date = date.replaceAll(',', '')
	date = date.replaceAll('.', '')
	date = date.replaceAll(' ', '')
	date = date.replaceAll(':', '')

	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	res.setHeader('Content-Disposition', `attachment; filename=приход_${date}.xlsx`)

	await workbook.xlsx.write(res)
	res.end()
}
