import { createInvoiceSchema } from '~/shared/schemas/invoice'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole<Database>(event)

  const merchant = await getOrCreateDefaultMerchant(client)

  const rawBody = await readBody(event)
  
  const bodyWithMerchant = {
    ...rawBody,
    merchant_id: merchant.id
  }

  const body = await createInvoiceSchema.parseAsync(bodyWithMerchant)

  const { data: invoiceNumber, error: numError } = await client.rpc('generate_invoice_number', { 
    merchant_id_param: body.merchant_id 
  })

  if (numError) {
    throw createError({
      statusCode: 500,
      message: 'Failed to generate invoice number: ' + numError.message
    })
  }

  const { data, error } = await client
    .from('invoices')
    .insert({
      ...body,
      invoice_number: invoiceNumber,
      status: 'draft',
      public_token: crypto.randomUUID()
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data
})
