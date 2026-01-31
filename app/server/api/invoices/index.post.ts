import { createInvoiceSchema } from '~/shared/schemas/invoice'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const client = await serverSupabaseClient<Database>(event)

  const { data: merchant, error: merchantError } = await client
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (merchantError || !merchant) {
    throw createError({
      statusCode: 400,
      message: 'Merchant profile not found'
    })
  }

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
