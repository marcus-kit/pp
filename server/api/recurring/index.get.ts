import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const client = await serverSupabaseClient<Database>(event)

  let request = client
    .from('recurring_invoices')
    .select('*, customer:customers(full_name)', { count: 'exact' })

  if (query.merchant_id) {
    request = request.eq('merchant_id', query.merchant_id)
  }

  if (query.customer_id) {
    request = request.eq('customer_id', query.customer_id)
  }

  if (query.is_active !== undefined) {
    request = request.eq('is_active', query.is_active === 'true')
  }

  const { data, error, count } = await request
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return {
    items: data,
    total: count || 0
  }
})
