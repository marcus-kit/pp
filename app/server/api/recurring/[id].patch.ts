import { updateRecurringInvoiceSchema } from '~/shared/schemas/recurring'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID is required' })
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
