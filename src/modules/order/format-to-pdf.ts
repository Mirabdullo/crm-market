import { format } from 'date-fns'
import * as Puppeteer from 'puppeteer'
export async function generatePdfBuffer(orderData: any) {
	const browser = await Puppeteer.launch({
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage', // Bu muhim
			'--disable-gpu', // Bu ham
		],
		headless: true,
	})
	const page = await browser.newPage()

	const htmlContent = `
	<!DOCTYPE html>
	<html lang="en">
	
	<head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <style>
		body {
		  font-family: Arial, sans-serif;
		  margin: 20px;
		}
	
		.logo {
		  text-align: center;
		  margin-bottom: 20px;
		}
	
		table {
		  width: 100%;
		  border-collapse: collapse;
		  margin-top: 20px;
		}
	
		th,
		td {
		  border: 1px solid #ddd;
		  padding: 8px;
		  text-align: left;
		}
	
		th {
		  background-color: #f4f4f4;
		}
	
		.total {
		  font-weight: bold;
		  color: red;
		}
	  </style>
	  <title>Order Details</title>
	</head>
	
	<body>
	  <h2 class="logo">SAS-IDEAL</h2>
	  <p><strong>Клиент:</strong> ${orderData.client.name}</p>
	  <p><strong>Дата продажа:</strong> ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}</p>
	
	  <table>
		<thead>
		  <tr>
			<th>№</th>
			<th>Товар или услуга</th>
			<th>Кол-во</th>
			<th>Цена</th>
			<th>Сумма</th>
		  </tr>
		</thead>
		<tbody>
		  ${orderData.products
				.map(
					(product: any, index: number) => `
		  <tr>
			<td>${index + 1}</td>
			<td>${product.product.name}</td>
			<td>${product.count}</td>
			<td>${product.price}</td>
			<td>${product.price.toNumber() * product.count}</td>
		  </tr>
		  `,
				)
				.join('')}
		</tbody>
	  </table>
	
	  <p class="total">Итого: ${orderData.sum}</p>
	</body>
	
	</html>
	`

	// HTML-ni sahifaga joylashtiramiz
	await page.setContent(htmlContent)

	// PDF-ni xotirada yaratamiz
	const pdfBuffer = await page.pdf({ format: 'A4' })
	await browser.close()

	return pdfBuffer
}
