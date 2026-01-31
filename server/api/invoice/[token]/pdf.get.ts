import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { generateInvoicePDF, getInvoiceFilename } from '~/server/utils/pdf-generator'
import { buildQRPaymentData, generateQRPaymentString, generateQRCodeDataURL } from '~/server/utils/qr-sbp'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  
  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  const client = serverSupabaseServiceRole<Database>(event)

  const { data: invoice, error } = await client
    .from('invoices')
    .select('*, merchant:merchants(*), customer:customers(*)')
    .eq('public_token', token)
    .single()

  if (error || !invoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  if (!invoice.merchant || !invoice.customer) {
    throw createError({
      statusCode: 500,
      message: 'Invoice data incomplete'
    })
  }

  const merchant = Array.isArray(invoice.merchant) ? invoice.merchant[0] : invoice.merchant
  const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer

  let qrCodeDataUrl: string | undefined

  if (merchant.bank_account && merchant.bank_bic && merchant.bank_name && merchant.bank_corr_account) {
    try {
      const qrData = buildQRPaymentData(invoice, merchant)
      const qrString = generateQRPaymentString(qrData)
      qrCodeDataUrl = await generateQRCodeDataURL(qrString, { width: 300, margin: 2 })
    } catch (qrError) {
      console.error('QR code generation failed:', qrError)
    }
  }

  const pdfBuffer = await generateInvoicePDF({
    invoice,
    merchant,
    customer,
    qrCodeDataUrl
  })

  const filename = getInvoiceFilename(invoice)

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': pdfBuffer.length.toString(),
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  })

  return pdfBuffer
})
