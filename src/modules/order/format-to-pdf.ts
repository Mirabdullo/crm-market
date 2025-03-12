import { format } from 'date-fns'
import * as path from 'path'
import * as Puppeteer from 'puppeteer'
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';


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
     		 <img src="./logo.png" alt="SAS-IDEAL Logo"> 
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
  // Yangi PDFDocument yaratamiz
  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    size: 'A4',
  });

  // PDF kontentni buffer sifatida qaytarish uchun
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  
  let pdfBuffer: Buffer;
  const promise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });

  // Sahifa fonti va shriftni o'rnatamiz
  doc.font('Helvetica');
  
  // Header qismi
  doc.fontSize(12);
  // Client ma'lumotlari
  doc.text(`Клиент: ${orderData.client.name}`, 50, 50);
  doc.text(`Дата продажа: ${format(orderData.sellingDate, 'yyyy-MM-dd HH:mm:ss')}`, 50, 70);

  // Logo (agar logo fayli mavjud bo'lsa)
  try {
    const logoPath = path.resolve('./logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 400, 50, { width: 150 });
    }
  } catch (error) {
    console.error('Logo yuklanmadi:', error);
  }

  // Jadval 1: Mavjud tovarlar
  doc.moveDown(3);
  drawTable(
    doc, 
    ['№', 'Товар или услуга', 'Кол-во', 'Цена', 'Сумма'],
    orderData.products.map((product: any, index: number) => [
      (index + 1).toString(),
      product.product.name,
      product.count.toString(),
      product.price.toString(),
      (product.price.toNumber() * product.count).toString()
    ]),
    50, 
    doc.y, 
    [40, 200, 60, 100, 100]
  );

  // Yangi tovarlar sarlavhasi
  doc.moveDown(2);
  doc.fontSize(14);
  const textWidth = doc.widthOfString('Добавлены новые товары');
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const textX = doc.page.margins.left + (pageWidth - textWidth) / 2;
  doc.text('Добавлены новые товары', textX, doc.y);
  doc.fontSize(12);
  doc.moveDown();

  // Jadval 2: Yangi tovarlar
  drawTable(
    doc, 
    ['№', 'Товар или услуга', 'Кол-во', 'Цена', 'Сумма'],
    [
      ['1', payload.name, payload.count.toString(), payload.price.toString(), (payload.price * payload.count).toString()]
    ],
    50, 
    doc.y, 
    [40, 200, 60, 100, 100]
  );

  // Jami summa
  doc.moveDown(2);
  doc.fontSize(12).fillColor('red');
  doc.text(`Итого: ${orderData.sum.toNumber() + payload.price * payload.count}`, { align: 'right' });
  doc.fillColor('black');

  // PDF generatsiyani yakunlaymiz
  doc.end();
  
  return promise;
}

// Jadval chizish uchun yordamchi funksiya
function drawTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][], x: number, y: number, columnWidths: number[]) {
  const rowHeight = 30;
  let currentY = y;

  // Jadval sarlavhasi
  doc.rect(x, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
    .fillAndStroke('#f4f4f4', '#000000');
  
  let currentX = x;
  headers.forEach((header, i) => {
    doc.fillColor('#000000').text(
      header,
      currentX + 5,
      currentY + 10,
      { width: columnWidths[i] - 10 }
    );
    currentX += columnWidths[i];
  });
  currentY += rowHeight;

  // Jadval qatorlari
  rows.forEach((row) => {
    currentX = x;
    
    // Ushbu qator uchun to'rtburchak
    doc.rect(x, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
      .stroke();
    
    // Qator ma'lumotlari
    row.forEach((cell, i) => {
      // Vertikal chiziq
      doc.moveTo(currentX, currentY)
        .lineTo(currentX, currentY + rowHeight)
        .stroke();
      
      // Cell ma'lumotlari
      doc.text(
        cell,
        currentX + 5,
        currentY + 10,
        { width: columnWidths[i] - 10 }
      );
      
      currentX += columnWidths[i];
    });
    
    // Oxirgi vertikal chiziq
    doc.moveTo(currentX, currentY)
      .lineTo(currentX, currentY + rowHeight)
      .stroke();
    
    currentY += rowHeight;
  });

  return currentY;
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
