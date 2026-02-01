import { updateRecurringInvoiceSchema } from '~/shared/schemas/recurring'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID is required' })
  }

  const client = await serverSupabaseServiceRole<Database>(event)
  const merchant = await getOrCreateDefaultMerchant(client)

  const body = await readBody(event)
  const validated = await updateRecurringInvoiceSchema.parseAsync(body)

  const { data, error } = await client
    .from('recurring_invoices')
    .update(validated)
    .eq('id', id)
    .eq('merchant_id', merchant.id)
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
