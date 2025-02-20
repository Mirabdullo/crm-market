import * as ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { OrderRetriveAllResponse } from './interfaces'
import { Response } from 'express'
import * as path from 'path'
import * as fs from 'fs'

export async function OrderUpload(data: OrderRetriveAllResponse['data'], res: Response): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('продажа')

	const sum = data.reduce((sum, item) => sum + item.sum, 0)

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Общая сумма:   ${sum}`
	worksheet.getCell('A1').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Клиент', 'тел', 'Cумма', 'Продавец', 'Информация', 'Долг', 'Дата продажа'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 6
	worksheet.getColumn(2).width = 26
	worksheet.getColumn(3).width = 20
	worksheet.getColumn(3).width = 20
	worksheet.getColumn(4).width = 20
	worksheet.getColumn(5).width = 20
	worksheet.getColumn(6).width = 20
	worksheet.getColumn(7).width = 24

	headerRow.eachCell((cell) => {
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' },
		}
	})

	data.forEach((order, index) => {
		const row = worksheet.addRow([
			index + 1,
			order.client.name,
			order.client.phone,
			order.sum,
			order.seller.phone,
			'',
			order.debt,
			format(order.sellingDate, 'dd.MM.yyyy HH:mm'),
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

	let date = new Date().toLocaleString()
	date = date.replaceAll(',', '')
	date = date.replaceAll('.', '')
	date = date.replaceAll(' ', '')
	date = date.replaceAll(':', '')

	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	res.setHeader('Content-Disposition', `attachment; filename=prodaja${date}.xlsx`)

	await workbook.xlsx.write(res)
	res.end()
}

export async function ReedExcelFile() {
	const workbook = new ExcelJS.Workbook()
	const filename = path.resolve('products.xlsx')
	console.log('Reading file:', filename)

	const newData: any[] = []

	// Faylni o'qish
	await workbook.xlsx.readFile(filename)

	// Birinchi varaqni olish
	const worksheet = workbook.getWorksheet(1) // Birinchi varaq
	worksheet.eachRow((row, rowNumber) => {
		// Ma'lumotlarni `newData` massiviga qo'shish
		if (rowNumber > 3) {
			newData.push({
				name: row.getCell(1).value?.toString().toUpperCase() || '',
				cost: row.getCell(8).value || 0,
				count: row.getCell(4).value || 0,
				min_amount: row.getCell(11).value || 0,
				selling_price: row.getCell(6).value || 0,
				unit: 'dona',
				wholesale_price: row.getCell(7).value || 0,
			})
		}
	})
	console.log('productlar: ', newData.length)
	return newData
}

export async function ReedExcelFile2() {
	const workbook = new ExcelJS.Workbook()
	const filename = path.resolve('users.xlsx')
	console.log('Reading file:', filename)

	const newData: any = []

	try {
		// Check if file exists
		if (!fs.existsSync(filename)) {
			throw new Error(`File not found: ${filename}`)
		}
		console.log(1)
		// Read the file
		await workbook.xlsx.readFile(filename)
		console.log(2)
		// Get the first worksheet
		const worksheet = workbook.getWorksheet(1)
		console.log(3)
		if (!worksheet) {
			throw new Error('Worksheet not found')
		}
		console.log('sheet: ', worksheet)
		// Process each row
		worksheet.eachRow((row, rowNumber) => {
			try {
				// Skip header rows (first 3 rows)
				if (rowNumber <= 3) return

				const productData = {
					name: (row.getCell(2).value?.toString() || '').toUpperCase(),
					debt: Number(row.getCell(3).value) || 0,
					phone: row.getCell(6).value || '0000000000',
					updatedAt: row.getCell(11).value ? row.getCell(11).value.toString().split(' ')[0] : undefined,
					type: 'client',
				}

				// Validate data
				if (!productData.name) {
					console.warn(`Warning: Empty product name at row ${rowNumber}`)
				}

				newData.push(productData)
			} catch (rowError) {
				console.error(`Error processing row ${rowNumber}:`, rowError)
			}
		})

		return newData
	} catch (error) {
		console.error('Failed to read Excel file:', error)
		throw new Error('Failed to read Excel file: ' + error.message)
	}
}
