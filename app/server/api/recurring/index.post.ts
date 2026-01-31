import { createRecurringInvoiceSchema } from '~/shared/schemas/recurring'
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
