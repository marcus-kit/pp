import PDFDocument from 'pdfkit'
import type { Invoice, Merchant, Customer } from '~/shared/types/database'

export interface InvoicePDFData {
  invoice: Invoice
  merchant: Merchant
  customer: Customer
  qrCodeDataUrl?: string
}

const COLORS = {
  black: '#1a1a1a',
  darkGray: '#333333',
  gray: '#666666',
  lightGray: '#999999',
  mutedGray: '#b3b3b3',
  bgGray: '#f8f9fa',
  line: '#e5e7eb',
  accent: '#2563eb'
}

const PAGE_HEIGHT = 841.89
const PAGE_WIDTH = 595.28
const MARGIN_TOP = 50
const MARGIN_BOTTOM = 50
const MARGIN_LEFT = 50
const MARGIN_RIGHT = 50
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT },
        info: {
          Title: `Счет ${data.invoice.invoice_number}`,
          Author: data.merchant.full_name,
          Subject: 'Счет на оплату'
        }
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      let y = MARGIN_TOP

      y = drawHeader(doc, data, MARGIN_LEFT, y, CONTENT_WIDTH)
      y = drawParties(doc, data, MARGIN_LEFT, y, CONTENT_WIDTH)
      y = drawItemsTable(doc, data, MARGIN_LEFT, y, CONTENT_WIDTH)
      y = drawTotal(doc, data, MARGIN_LEFT, y, CONTENT_WIDTH)
      y = drawQRAndBankDetails(doc, data, MARGIN_LEFT, y, CONTENT_WIDTH)
      drawFooter(doc, MARGIN_LEFT, y, CONTENT_WIDTH)

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  data: InvoicePDFData,
  x: number,
  y: number,
  width: number
): number {
  doc.font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(COLORS.black)
    .text('СЧЕТ НА ОПЛАТУ', x, y, { width, align: 'center' })

  const issueDate = new Date(data.invoice.issued_at).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  doc.font('Helvetica')
    .fontSize(11)
    .fillColor(COLORS.gray)
    .text(`№ ${data.invoice.invoice_number} от ${issueDate}`, x, y + 28, { width, align: 'center' })

  if (data.invoice.due_date) {
    const dueDate = new Date(data.invoice.due_date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.gray)
      .text(`Оплатить до: ${dueDate}`, x, y + 48, { width, align: 'center' })
    
    return y + 80
  }

  return y + 70
}

function drawParties(
  doc: PDFKit.PDFDocument,
  data: InvoicePDFData,
  x: number,
  y: number,
  width: number
): number {
  const colWidth = (width - 40) / 2
  const rightColX = x + colWidth + 40

  doc.font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.lightGray)
    .text('ПОЛУЧАТЕЛЬ', x, y)

  doc.font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.black)
    .text(data.merchant.full_name, x, y + 14, { width: colWidth })

  let leftY = y + 28

  const merchantDetails = []
  if (data.merchant.inn) merchantDetails.push(`ИНН: ${data.merchant.inn}`)
  if (data.merchant.kpp) merchantDetails.push(`КПП: ${data.merchant.kpp}`)
  if (data.merchant.legal_address) merchantDetails.push(data.merchant.legal_address)

  merchantDetails.forEach((line) => {
    doc.font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.gray)
      .text(line, x, leftY, { width: colWidth })
    leftY += 14
  })

  doc.font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.lightGray)
    .text('ПЛАТЕЛЬЩИК', rightColX, y)

  doc.font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.black)
    .text(data.customer.full_name, rightColX, y + 14, { width: colWidth })

  let rightY = y + 28

  const customerDetails = []
  if (data.customer.inn) customerDetails.push(`ИНН: ${data.customer.inn}`)
  if (data.customer.kpp) customerDetails.push(`КПП: ${data.customer.kpp}`)
  if (data.customer.legal_address) customerDetails.push(data.customer.legal_address)
  if (data.customer.email) customerDetails.push(data.customer.email)
  if (data.customer.phone) customerDetails.push(data.customer.phone)

  customerDetails.forEach((line) => {
    doc.font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.gray)
      .text(line, rightColX, rightY, { width: colWidth })
    rightY += 14
  })

  return Math.max(leftY, rightY) + 20
}

function drawItemsTable(
  doc: PDFKit.PDFDocument,
  data: InvoicePDFData,
  x: number,
  y: number,
  width: number
): number {
  const items = data.invoice.items || []
  
  if (items.length === 0) {
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.gray)
      .text(data.invoice.description, x, y)
    return y + 30
  }

  const nameColWidth = width * 0.5
  const qtyColWidth = width * 0.15
  const priceColWidth = width * 0.175
  const amountColWidth = width * 0.175

  doc.strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()

  y += 10

  doc.font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.darkGray)

  doc.text('Наименование', x, y, { width: nameColWidth, align: 'left' })
  doc.text('Кол-во', x + nameColWidth, y, { width: qtyColWidth, align: 'center' })
  doc.text('Цена', x + nameColWidth + qtyColWidth, y, { width: priceColWidth, align: 'right' })
  doc.text('Сумма', x + nameColWidth + qtyColWidth + priceColWidth, y, { width: amountColWidth, align: 'right' })

  y += 16

  doc.strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()

  y += 10

  items.forEach((item) => {
    doc.font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.black)

    doc.text(item.name, x, y, { width: nameColWidth, align: 'left' })
    doc.text(item.quantity.toString(), x + nameColWidth, y, { width: qtyColWidth, align: 'center' })
    doc.text(formatRubles(item.price), x + nameColWidth + qtyColWidth, y, { width: priceColWidth, align: 'right' })
    doc.text(formatRubles(item.amount), x + nameColWidth + qtyColWidth + priceColWidth, y, { width: amountColWidth, align: 'right' })

    y += 16
  })

  doc.strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()

  return y + 16
}

function drawTotal(
  doc: PDFKit.PDFDocument,
  data: InvoicePDFData,
  x: number,
  y: number,
  width: number
): number {
  const labelWidth = width * 0.825
  const amountWidth = width * 0.175

  doc.font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(COLORS.black)

  doc.text('Итого:', x, y, { width: labelWidth, align: 'right' })
  doc.text(formatRubles(data.invoice.amount), x + labelWidth, y, { width: amountWidth, align: 'right' })

  return y + 30
}

function drawQRAndBankDetails(
  doc: PDFKit.PDFDocument,
  data: InvoicePDFData,
  x: number,
  y: number,
  width: number
): number {
  const qrSize = 120
  const qrX = x + width - qrSize
  const detailsWidth = width - qrSize - 30
  const startY = y

  if (data.qrCodeDataUrl) {
    try {
      const base64Data = data.qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')
      doc.image(imageBuffer, qrX, y, { width: qrSize, height: qrSize })
    } catch {
      doc.rect(qrX, y, qrSize, qrSize).stroke(COLORS.line)
    }

    doc.font('Helvetica')
      .fontSize(8)
      .fillColor(COLORS.mutedGray)
      .text('Сканируйте для оплаты\nчерез СБП', qrX, y + qrSize + 6, { width: qrSize, align: 'center' })
  }

  doc.font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLORS.darkGray)
    .text('Банковские реквизиты:', x, y)

  y += 18

  const bankDetails = []
  
  if (data.merchant.bank_name) {
    bankDetails.push(`Банк: ${data.merchant.bank_name}`)
  }
  if (data.merchant.bank_bic) {
    bankDetails.push(`БИК: ${data.merchant.bank_bic}`)
  }
  if (data.merchant.bank_account) {
    bankDetails.push(`Р/с: ${data.merchant.bank_account}`)
  }
  if (data.merchant.bank_corr_account) {
    bankDetails.push(`К/с: ${data.merchant.bank_corr_account}`)
  }

  bankDetails.forEach((line) => {
    doc.font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.gray)
      .text(line, x, y, { width: detailsWidth })
    y += 14
  })

  return Math.max(y, startY + qrSize + 30) + 20
}

function drawFooter(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number
): void {
  doc.strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()

  y += 16

  doc.font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.mutedGray)
    .text(
      'Спасибо за ваш бизнес!\nСчет сформирован автоматически и действителен без подписи и печати.',
      x, y, { width, align: 'center' }
    )
}

function formatRubles(kopecks: number): string {
  const rubles = kopecks / 100
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rubles)
}

export function getInvoiceFilename(invoice: Invoice): string {
  const date = new Date(invoice.issued_at).toISOString().split('T')[0]
  const sanitizedNumber = invoice.invoice_number
    .replace(/[^a-zA-Z0-9-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  return `invoice_${sanitizedNumber || 'invoice'}_${date}.pdf`
}
