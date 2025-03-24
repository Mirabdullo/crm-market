import * as ExcelJS from 'exceljs'
import { UserDeedRetrieveRequest } from './interfaces'
import { format } from 'date-fns'
import { Response } from 'express'

export async function UserDeedUpload(data: any, payload: UserDeedRetrieveRequest): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('client')

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

	worksheet.getColumn(1).width = 6
	worksheet.getColumn(2).width = 30
	worksheet.getColumn(3).width = 30
	worksheet.getColumn(4).width = 20
	worksheet.getColumn(5).width = 20
	worksheet.getColumn(6).width = 30

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
		} else if (entry.type === 'order') {
			totalSum += entry.sum.toNumber()
			const row = worksheet.addRow([index + 1, format(entry.sellingDate, 'dd.MM.yyyy HH:mm'), `Продажа: ${entry.articl}`, entry.sum.toNumber(), '', entry?.description])

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
			totalPay += entry.sum.toNumber()
			const row = worksheet.addRow([index + 1, format(entry.returnedDate, 'dd.MM.yyyy HH:mm'), `Возврат товара`, '', entry.sum.toNumber(), entry.description])

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
	const filename = data.name + '-' + data.debt.toString() + '-' + date.toString()
	payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	payload.res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`)

	await workbook.xlsx.write(payload.res)
	payload.res.end()
}

export async function UserDeedUploadWithProduct(data: any, payload: UserDeedRetrieveRequest): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Report')

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Клиент: ${data.name}`
	worksheet.getCell('A1').font = { bold: true, size: 14 }

	worksheet.mergeCells('D1:F1')
	worksheet.getCell('D1').value = `Остаток: ${data.debt.toNumber()}`
	worksheet.getCell('D1').alignment = { horizontal: 'right' }

	worksheet.mergeCells('A2:F2')
	worksheet.getCell('A2').value = `Акт сверки с ${format(payload.startDate, 'dd.MM.yyyy')} по ${format(payload.endDate, 'dd.MM.yyyy')}`
	worksheet.getCell('A2').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Товар', 'Количество', 'Цена', 'Стоимость', 'Операция', 'Время'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 6
	worksheet.getColumn(2).width = 40
	worksheet.getColumn(3).width = 20
	worksheet.getColumn(4).width = 20
	worksheet.getColumn(5).width = 20
	worksheet.getColumn(6).width = 30
	worksheet.getColumn(7).width = 30

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
		} else if (entry.type === 'order') {
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
		} else {
			totalPay += entry.sum.toNumber()
			if (entry.products.length) {
				entry.products.forEach((product: any) => {
					index += 1
					const row = worksheet.addRow([
						index,
						product.product.name,
						product.count,
						product.price.toNumber(),
						product.count * product.price.toNumber(),
						'Возврат товара',
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
	worksheet.getCell(`A${index + 5}`).font = { bold: true }
	worksheet.getCell(`A${index + 5}`).alignment = { horizontal: 'center', vertical: 'middle' }

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

	const filename = data.name + '-' + data.debt.toString() + '-' + date.toString()
	payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	payload.res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`)

	await workbook.xlsx.write(payload.res)
	payload.res.end()
}

export async function SupplierDeedUpload(data: any, payload: UserDeedRetrieveRequest): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Поставщик')

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Поставщик: ${data.name}`
	worksheet.getCell('A1').font = { bold: true }

	worksheet.mergeCells('D1:F1')
	worksheet.getCell('D1').value = `Остаток: ${data.debt.toNumber()}`
	worksheet.getCell('D1').font = { bold: true }
	worksheet.getCell('D1').alignment = { horizontal: 'right' }

	worksheet.mergeCells('A2:F2')
	worksheet.getCell('A2').value = `Акт сверки с ${format(payload.startDate, 'dd.MM.yyyy')} по ${format(payload.endDate, 'dd.MM.yyyy')}`
	worksheet.getCell('A2').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Время', 'Операция', 'Дебит', 'Кредит', 'Информация'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 6
	worksheet.getColumn(2).width = 30
	worksheet.getColumn(3).width = 30
	worksheet.getColumn(4).width = 20
	worksheet.getColumn(5).width = 20
	worksheet.getColumn(6).width = 30

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
		} else if (entry.type === 'order') {
			totalSum += entry.sum.toNumber()
			const row = worksheet.addRow([index + 1, format(entry.createdAt, 'dd.MM.yyyy HH:mm'), `Приход`, entry.sum.toNumber(), '', ''])

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
			totalPay += entry.sum.toNumber()
			const row = worksheet.addRow([index + 1, format(entry.createdAt, 'dd.MM.yyyy HH:mm'), `Возврат товара`, '', entry.sum.toNumber(), entry.description])

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
	const totalRow = worksheet.addRow(['', 'Всего', '', totalSum, totalPay, ''])
	totalRow.font = { bold: true }

	worksheet.addRow(['', 'Остаток на конец', '', totalSum - totalPay, '', '']).font = { bold: true }

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
	const filename = data.name + '-' + data.debt.toString() + '-' + date.toString()
	payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	payload.res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`)

	await workbook.xlsx.write(payload.res)
	payload.res.end()
}

export async function SupplierDeedUploadWithProduct(data: any, payload: UserDeedRetrieveRequest): Promise<void> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Report')

	worksheet.mergeCells('A1:C1')
	worksheet.getCell('A1').value = `Поставщик: ${data.name}`
	worksheet.getCell('A1').font = { bold: true, size: 14 }

	worksheet.mergeCells('D1:F1')
	worksheet.getCell('D1').value = `Остаток: ${data.debt.toNumber()}`
	worksheet.getCell('D1').alignment = { horizontal: 'right' }

	worksheet.mergeCells('A2:F2')
	worksheet.getCell('A2').value = `Акт сверки с ${format(payload.startDate, 'dd.MM.yyyy')} по ${format(payload.endDate, 'dd.MM.yyyy')}`
	worksheet.getCell('A2').font = { bold: true }
	worksheet.addRow([])

	const headerRow = worksheet.addRow(['№', 'Товар', 'Количество', 'Цена', 'Стоимость', 'Операция', 'Время'])
	headerRow.font = { bold: true }
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
	headerRow.height = 24

	worksheet.getColumn(1).width = 6
	worksheet.getColumn(2).width = 32
	worksheet.getColumn(3).width = 20
	worksheet.getColumn(4).width = 20
	worksheet.getColumn(5).width = 20
	worksheet.getColumn(6).width = 30
	worksheet.getColumn(7).width = 30

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
			const row = worksheet.addRow([index, '', 0, 0, entry.totalPay.toNumber(), 'Выплата долга', format(entry.updatedAt, 'dd.MM.yyyy HH:mm')])

			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' }
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				}
			})
		} else if (entry.type === 'order') {
			totalSum += entry.sum.toNumber()
			if (entry.incomingProducts.length) {
				entry.incomingProducts.forEach((product: any) => {
					index += 1
					const row = worksheet.addRow([
						index,
						product.product.name,
						product.count,
						product.cost.toNumber(),
						product.count * product.cost.toNumber(),
						'Приход',
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
		} else {
			totalPay += entry.sum.toNumber()
			if (entry.products.length) {
				entry.products.forEach((product: any) => {
					index += 1
					const row = worksheet.addRow([
						index,
						product.product.name,
						product.count,
						product.price.toNumber(),
						product.count * product.price.toNumber(),
						'Приход',
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

	worksheet.addRow(['', 'Итого приходов: ', '', '', totalSum, '', '']).font = { bold: true }

	worksheet.addRow(['', 'Итого выплат: ', '', '', totalPay, '', '']).font = { bold: true }

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
	const filename = data.name + '-' + data.debt.toString() + '-' + date.toString()
	payload.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	payload.res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`)

	await workbook.xlsx.write(payload.res)
	payload.res.end()
}

export async function ClientUpload(data: any, res: Response): Promise<void> {
	try {
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Clients')

		worksheet.addRow([])

		const headerRow = worksheet.addRow(['№', 'клиент', 'телефон', 'долг', 'Время'])
		headerRow.font = { bold: true }
		headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
		headerRow.height = 24

		worksheet.getColumn(1).width = 6
		worksheet.getColumn(2).width = 40
		worksheet.getColumn(3).width = 32
		worksheet.getColumn(4).width = 30
		worksheet.getColumn(5).width = 30

		headerRow.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			}
		})

		let totalPay = 0
		// Ma'lumotlarni kiritish
		let index = 0
		data.forEach((entry: any) => {
			totalPay += entry.debt.toNumber()
			index += 1
			const row = worksheet.addRow([index, entry.name, entry.phone, entry.debt.toNumber(), format(entry.createdAt, 'dd.MM.yyyy')])

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

		worksheet.addRow(['', 'Итого долг: ', '', totalPay, '']).font = { bold: true }

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

		worksheet.getColumn(2).alignment = { horizontal: 'left' }

		// Excel faylni saqlash
		let date = new Date().toLocaleString()
		date = date.replaceAll(',', '')
		date = date.replaceAll('.', '')
		date = date.replaceAll(' ', '')
		date = date.replaceAll(':', '')

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent('должники.xlsx')}`)

		await workbook.xlsx.write(res)
		res.end()
	} catch (error) {
		console.log(error)
	}
}
