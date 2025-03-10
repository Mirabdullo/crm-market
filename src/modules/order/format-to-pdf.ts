import { format } from 'date-fns'
import * as Puppeteer from 'puppeteer'

console.log(__dirname)
export async function generatePdfBuffer(orderData: any) {
	const filePath = __dirname + '../../'
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
	
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
		  }
	  
		  .logo {
			text-align: right;
		  }
	  
		  .logo img {
			max-width: 150px; /* Logoning maksimal kengligi */
			height: auto;
		  }
	  
		  .client-info {
			text-align: left;
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
		<div class="header">
   		 <div class="client-info">
       		<p><strong>Клиент:</strong> ${orderData.client.name}</p>
      		<p><strong>Дата продажа:</strong> ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}</p>
   		 </div>
   		 <div class="logo">
     		 <img src="../../../media/logo.svg" alt="SAS-IDEAL Logo"> 
   		 </div>
 		</div>


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

export async function generatePdfBufferWithProduct(orderData: any, payload: any) {
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
	
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
		  }
	  
		  .logo {
			text-align: right;
		  }
	  
		  .logo img {
			max-width: 150px; /* Logoning maksimal kengligi */
			height: auto;
		  }
	  
		  .client-info {
			text-align: left;
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

		.new {
			text-align: center;
			margin-bottom: 10px;
		}
	  </style>
	  <title>Order Details</title>
	</head>
	
	<body>
	<div class="header">
	<div class="client-info">
	   <p><strong>Клиент:</strong> ${orderData.client.name}</p>
	  <p><strong>Дата продажа:</strong> ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}</p>
	</div>
	<div class="logo">
	  <img src="../../../media/logo.svg" alt="SAS-IDEAL Logo"> 
	  </div>
      </div>

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
	  </table>

	  <h3 class="new">Добавлены новые товары</h3>

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

		<tr>
		  <td>1</td>
		  <td>${payload.name}</td>
		  <td>${payload.count}</td>
		  <td>${payload.price}</td>
		  <td>${payload.price * payload.count}</td>
		</tr>
		
	  </tbody>
	</table>
	
	  <p class="total">Итого: ${orderData.sum.toNumber() + payload.price * payload.count}</p>
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
