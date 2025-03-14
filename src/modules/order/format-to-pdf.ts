import { format } from 'date-fns'
import * as path from 'path'
import * as Puppeteer from 'puppeteer'
import * as PDFDocument from 'pdfkit'
import * as fs from 'fs'

export async function generatePdfBuffer(orderData: any) {
	// PDF dokumentni yaratish
	const doc = new PDFDocument({
		margins: { top: 50, bottom: 50, left: 50, right: 50 },
		size: 'A4',
	})

	// PDF bufferini yig'ish uchun
	const buffers: Buffer[] = []
	doc.on('data', buffers.push.bind(buffers))

	const promise = new Promise<Buffer>((resolve) => {
		doc.on('end', () => {
			const pdfBuffer = Buffer.concat(buffers)
			resolve(pdfBuffer)
		})
	})

	const fontPath = path.join(__dirname, '../../../', 'Arial', 'arialmt.ttf')
	const boldFontPath = path.join(__dirname, '../../../', 'Arial', 'arial_bolditalicmt.ttf')

	doc.font(fontPath)

	// Header qismi - Mijoz ma'lumotlari
	doc.fontSize(12)
	doc.text(`Клиент: ${orderData.client.name}`, 50, 50)
	doc.text(`Дата продажа: ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}`, 50, 70)

	// Logo qo'shish (agar ilgari keched qilinmagan bo'lsa)
	try {
		doc.fontSize(16).font(boldFontPath)
		doc.text('SAS-IDEAL', 400, 50, { align: 'right' })
		doc.fontSize(12).font(fontPath)
		// if (!logoBuffer) {
		// 	const logoPath = path.resolve(process.cwd(), 'logo.png')
		// 	if (fs.existsSync(logoPath)) {
		// 		logoBuffer = fs.readFileSync(logoPath)
		// 	}
		// }

		// if (logoBuffer) {
		// 	doc.image(logoBuffer, 400, 50, { width: 120 })
		// } else {
		// 	// Logo o'rniga text bilan almashtirib ko'rish
		// 	doc.fontSize(16).font(boldFontPath)
		// 	doc.text('SAS-IDEAL', 400, 50, { align: 'right' })
		// 	doc.fontSize(12).font(fontPath)
		// }
	} catch (error) {
		console.error('Logo bilan xatolik:', error)
	}

	// Jadval uchun pozitsiya
	doc.moveDown(4) // Jadval uchun joy qoldirish
	const tableTop = doc.y + 10

	// Jadval sarlavhasi
	const headers = ['№', 'Товар или услуга', 'Кол-во', 'Цена', 'Сумма']
	const columnWidths = [40, 200, 70, 100, 100]

	// Jadval o'lchamlari
	const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0)
	const cellPadding = 8
	const lineHeight = 25

	// Sarlavha qismi
	let yPos = tableTop
	let xPos = 50

	// Sarlavha foni
	doc.rect(xPos, yPos, tableWidth, lineHeight).fillAndStroke('#f4f4f4', '#ddd')

	// Sarlavha matni
	headers.forEach((header, i) => {
		doc.fillColor('#000000')
		doc.text(header, xPos + cellPadding, yPos + cellPadding, { width: columnWidths[i] - cellPadding * 2 })
		xPos += columnWidths[i]
	})

	// Jadval qatorlari
	yPos += lineHeight

	// Tovarlar ro'yxati
	orderData.products.forEach((product: any, index: number) => {
		xPos = 50

		// Qator foni
		doc.rect(xPos, yPos, tableWidth, lineHeight).stroke('#ddd')

		// № ustuni
		doc.text((index + 1).toString(), xPos + cellPadding, yPos + cellPadding, { width: columnWidths[0] - cellPadding * 2 })
		xPos += columnWidths[0]

		// Tovar nomi ustuni
		doc.text(product.product.name, xPos + cellPadding, yPos + cellPadding, { width: columnWidths[1] - cellPadding * 2 })
		xPos += columnWidths[1]

		// Miqdor ustuni
		doc.text(product.count.toString(), xPos + cellPadding, yPos + cellPadding, { width: columnWidths[2] - cellPadding * 2 })
		xPos += columnWidths[2]

		// Narx ustuni
		doc.text(product.price.toString(), xPos + cellPadding, yPos + cellPadding, { width: columnWidths[3] - cellPadding * 2 })
		xPos += columnWidths[3]

		// Summa ustuni
		doc.text((product.price.toNumber() * product.count).toString(), xPos + cellPadding, yPos + cellPadding, { width: columnWidths[4] - cellPadding * 2 })

		yPos += lineHeight
	})

	// Jami summa
	doc.moveDown()
	doc.fillColor('red')
	doc.fontSize(12).font(boldFontPath)
	doc.text(`Итого: ${orderData.sum}`, 400, yPos + 20, { align: 'right' })

	// PDF generatsiyani yakunlash
	doc.end()

	return promise
}

// export async function generatePdfBuffer(orderData: any) {
// 	const browser = await Puppeteer.launch({
// 		args: [
// 			'--no-sandbox',
// 			'--disable-setuid-sandbox',
// 			'--disable-dev-shm-usage', // Bu muhim
// 			'--disable-gpu', // Bu ham
// 		],
// 		headless: true,
// 	})
// 	const page = await browser.newPage()

// 	const htmlContent = `
// 	<!DOCTYPE html>
// 	<html lang="en">

// 	<head>
// 	  <meta charset="UTF-8">
// 	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
// 	  <style>
// 		body {
// 		  font-family: Arial, sans-serif;
// 		  margin: 20px;
// 		}

// 		.header {
// 			display: flex;
// 			justify-content: space-between;
// 			align-items: center;
// 			margin-bottom: 20px;
// 		  }

// 		  .logo {
// 			text-align: right;
// 		  }

// 		  .logo img {
// 			max-width: 150px; /* Logoning maksimal kengligi */
// 			height: auto;
// 		  }

// 		  .client-info {
// 			text-align: left;
// 		}

// 		table {
// 		  width: 100%;
// 		  border-collapse: collapse;
// 		  margin-top: 20px;
// 		}

// 		th,
// 		td {
// 		  border: 1px solid #ddd;
// 		  padding: 8px;
// 		  text-align: left;
// 		}

// 		th {
// 		  background-color: #f4f4f4;
// 		}

// 		.total {
// 		  font-weight: bold;
// 		  color: red;
// 		}
// 	  </style>
// 	  <title>Order Details</title>
// 	</head>

// 	<body>
// 		<div class="header">
//    		 <div class="client-info">
//        		<p><strong>Клиент:</strong> ${orderData.client.name}</p>
//       		<p><strong>Дата продажа:</strong> ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}</p>
//    		 </div>
//    		 <div class="logo">
//      		 <img src="./logo.png" alt="SAS-IDEAL Logo">
//    		 </div>
//  		</div>

// 	  <table>
// 		<thead>
// 		  <tr>
// 			<th>№</th>
// 			<th>Товар или услуга</th>
// 			<th>Кол-во</th>
// 			<th>Цена</th>
// 			<th>Сумма</th>
// 		  </tr>
// 		</thead>
// 		<tbody>
// 		  ${orderData.products
// 				.map(
// 					(product: any, index: number) => `
// 		  <tr>
// 			<td>${index + 1}</td>
// 			<td>${product.product.name}</td>
// 			<td>${product.count}</td>
// 			<td>${product.price}</td>
// 			<td>${product.price.toNumber() * product.count}</td>
// 		  </tr>
// 		  `,
// 				)
// 				.join('')}
// 		</tbody>
// 	  </table>

// 	  <p class="total">Итого: ${orderData.sum}</p>
// 	</body>

// 	</html>
// 	`

// 	// HTML-ni sahifaga joylashtiramiz
// 	await page.setContent(htmlContent)

// 	// PDF-ni xotirada yaratamiz
// 	const pdfBuffer = await page.pdf({ format: 'A4' })
// 	await browser.close()

// 	return pdfBuffer
// }

export async function generatePdfBufferWithProduct(orderData: any, payload: any) {
	try {
		// Yangi PDFDocument yaratamiz
		const doc = new PDFDocument({
			margins: { top: 50, bottom: 50, left: 50, right: 50 },
			size: 'A4',
		})

		// PDF kontentni buffer sifatida qaytarish uchun
		const buffers: Buffer[] = []
		doc.on('data', buffers.push.bind(buffers))

		let pdfBuffer: Buffer
		const promise = new Promise<Buffer>((resolve) => {
			doc.on('end', () => {
				pdfBuffer = Buffer.concat(buffers)
				resolve(pdfBuffer)
			})
		})

		const fontPath = path.join(__dirname, '../../../', 'Arial', 'arialmt.ttf')
		const boldFontPath = path.join(__dirname, '../../../', 'Arial', 'arial_bolditalicmt.ttf')
		doc.font(fontPath)

		// Header qismi
		doc.fontSize(12)
		// Client ma'lumotlari
		doc.text(`Клиент: ${orderData.client.name}`, 50, 50)
		doc.text(`Дата продажа: ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}`, 50, 70)

		// if (!logoBuffer) {
		// 	try {
		// 		const logoPath = path.resolve(process.cwd(), 'media/logo.jpg')
		// 		if (fs.existsSync(logoPath)) {
		// 			logoBuffer = fs.readFileSync(logoPath)
		// 		}
		// 	} catch (error) {
		// 		console.error('Logo yuklashda xatolik:', error)
		// 	}
		// }

		// // Keched qilingan bufferni ishlatish
		// if (logoBuffer) {
		// 	doc.image(logoBuffer, 450, 20, { width: 80 })
		// }

		doc.fontSize(16).font(boldFontPath)
		doc.text('SAS-IDEAL', 400, 50, { align: 'right' })
		doc.fontSize(12).font(fontPath)

		// Jadval 1: Mavjud tovarlar
		doc.moveDown(4)
		drawTable(
			doc,
			['№', 'Товар или услуга', 'Кол-во', 'Цена', 'Сумма'],
			orderData.products.map((product: any, index: number) => [
				(index + 1).toString(),
				product.product.name,
				product.count.toString(),
				product.price.toString(),
				(product.price.toNumber() * product.count).toString(),
			]),
			50,
			doc.y,
			[40, 200, 60, 100, 100],
		)

		// Yangi tovarlar sarlavhasi
		doc.moveDown(2)
		doc.fontSize(14)
		const textWidth = doc.widthOfString('Добавлены новые товары')
		const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
		const textX = doc.page.margins.left + (pageWidth - textWidth) / 2
		doc.text('Добавлены новые товары', textX, doc.y)
		doc.fontSize(12)
		doc.moveDown()

		// Jadval 2: Yangi tovarlar
		drawTable(
			doc,
			['№', 'Товар или услуга', 'Кол-во', 'Цена', 'Сумма'],
			[['1', payload.name, payload.count.toString(), payload.price.toString(), (payload.price * payload.count).toString()]],
			50,
			doc.y,
			[40, 200, 60, 100, 100],
		)

		// Jami summa
		doc.moveDown(2)
		doc.fontSize(12).fillColor('red')
		doc.text(`Итого: ${orderData.sum.toNumber() + payload.price * payload.count}`, { align: 'right' })
		doc.fillColor('black')

		// PDF generatsiyani yakunlaymiz
		doc.end()

		return await promise
	} catch (error) {
		console.log(error)
	}
}

function drawTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][], x: number, y: number, columnWidths: number[]) {
	const rowHeight = 30
	let currentY = y

	// Jadval sarlavhasi
	doc.rect(
		x,
		currentY,
		columnWidths.reduce((a, b) => a + b, 0),
		rowHeight,
	).fillAndStroke('#f4f4f4', '#000000')

	let currentX = x
	headers.forEach((header, i) => {
		doc.fillColor('#000000').text(header, currentX + 5, currentY + 10, { width: columnWidths[i] - 10 })
		currentX += columnWidths[i]
	})
	currentY += rowHeight

	// Jadval qatorlari
	rows.forEach((row) => {
		currentX = x

		// Ushbu qator uchun to'rtburchak
		doc.rect(
			x,
			currentY,
			columnWidths.reduce((a, b) => a + b, 0),
			rowHeight,
		).stroke()

		// Qator ma'lumotlari
		row.forEach((cell, i) => {
			// Vertikal chiziq
			doc.moveTo(currentX, currentY)
				.lineTo(currentX, currentY + rowHeight)
				.stroke()

			// Cell ma'lumotlari
			doc.text(cell, currentX + 5, currentY + 10, { width: columnWidths[i] - 10 })

			currentX += columnWidths[i]
		})

		// Oxirgi vertikal chiziq
		doc.moveTo(currentX, currentY)
			.lineTo(currentX, currentY + rowHeight)
			.stroke()

		currentY += rowHeight
	})

	return currentY
}

// export async function generatePdfBufferWithProduct(orderData: any, payload: any) {
// 	const browser = await Puppeteer.launch({
// 		args: [
// 			'--no-sandbox',
// 			'--disable-setuid-sandbox',
// 			'--disable-dev-shm-usage', // Bu muhim
// 			'--disable-gpu', // Bu ham
// 		],
// 		headless: true,
// 	})
// 	const page = await browser.newPage()

// 	const htmlContent = `
// 	<!DOCTYPE html>
// 	<html lang="en">

// 	<head>
// 	  <meta charset="UTF-8">
// 	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
// 	  <style>
// 		body {
// 		  font-family: Arial, sans-serif;
// 		  margin: 20px;
// 		}

// 		.header {
// 			display: flex;
// 			justify-content: space-between;
// 			align-items: center;
// 			margin-bottom: 20px;
// 		  }

// 		  .logo {
// 			text-align: right;
// 		  }

// 		  .logo img {
// 			max-width: 150px; /* Logoning maksimal kengligi */
// 			height: auto;
// 		  }

// 		  .client-info {
// 			text-align: left;
// 		}

// 		table {
// 		  width: 100%;
// 		  border-collapse: collapse;
// 		  margin-top: 20px;
// 		}

// 		th,
// 		td {
// 		  border: 1px solid #ddd;
// 		  padding: 8px;
// 		  text-align: left;
// 		}

// 		th {
// 		  background-color: #f4f4f4;
// 		}

// 		.total {
// 		  font-weight: bold;
// 		  color: red;
// 		}

// 		.new {
// 			text-align: center;
// 			margin-bottom: 10px;
// 		}
// 	  </style>
// 	  <title>Order Details</title>
// 	</head>

// 	<body>
// 	<div class="header">
// 	<div class="client-info">
// 	   <p><strong>Клиент:</strong> ${orderData.client.name}</p>
// 	  <p><strong>Дата продажа:</strong> ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}</p>
// 	</div>
// 	<div class="logo">
// 	  <img src="./logo.png" alt="SAS-IDEAL Logo">
// 	  </div>
//       </div>

// 	  <table>
// 		<thead>
// 		  <tr>
// 			<th>№</th>
// 			<th>Товар или услуга</th>
// 			<th>Кол-во</th>
// 			<th>Цена</th>
// 			<th>Сумма</th>
// 		  </tr>
// 		</thead>
// 		<tbody>
// 		  ${orderData.products
// 				.map(
// 					(product: any, index: number) => `
// 		  <tr>
// 			<td>${index + 1}</td>
// 			<td>${product.product.name}</td>
// 			<td>${product.count}</td>
// 			<td>${product.price}</td>
// 			<td>${product.price.toNumber() * product.count}</td>
// 		  </tr>
// 		  `,
// 				)
// 				.join('')}
// 	  </table>

// 	  <h3 class="new">Добавлены новые товары</h3>

// 	  <table>
// 	  <thead>
// 		<tr>
// 		  <th>№</th>
// 		  <th>Товар или услуга</th>
// 		  <th>Кол-во</th>
// 		  <th>Цена</th>
// 		  <th>Сумма</th>
// 		</tr>
// 	  </thead>
// 	  <tbody>

// 		<tr>
// 		  <td>1</td>
// 		  <td>${payload.name}</td>
// 		  <td>${payload.count}</td>
// 		  <td>${payload.price}</td>
// 		  <td>${payload.price * payload.count}</td>
// 		</tr>

// 	  </tbody>
// 	</table>

// 	  <p class="total">Итого: ${orderData.sum.toNumber() + payload.price * payload.count}</p>
// 	</body>

// 	</html>
// 	`

// 	// HTML-ni sahifaga joylashtiramiz
// 	await page.setContent(htmlContent)

// 	// PDF-ni xotirada yaratamiz
// 	const pdfBuffer = await page.pdf({ format: 'A4' })
// 	await browser.close()

// 	return pdfBuffer
// }
