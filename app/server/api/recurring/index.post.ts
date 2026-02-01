import { createRecurringInvoiceSchema } from '~/shared/schemas/recurring'
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

  const body = await createRecurringInvoiceSchema.parseAsync(bodyWithMerchant)

  const now = new Date()
  const nextGeneration = new Date(now.getFullYear(), now.getMonth(), body.day_of_month)
  
  if (nextGeneration <= now) {
    nextGeneration.setMonth(nextGeneration.getMonth() + 1)
  }

  const { data, error } = await client
    .from('recurring_invoices')
    .insert({
      merchant_id: body.merchant_id,
      customer_id: body.customer_id,
      name: body.name,
      description: body.description || null,
      amount: body.amount,
      interval: body.interval,
      day_of_month: body.day_of_month,
      items: body.items || null,
      is_active: true,
      starts_at: body.starts_at || now.toISOString(),
      ends_at: null,
      last_generated_at: null,
      next_generation_at: nextGeneration.toISOString()
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
