import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const client = await serverSupabaseServiceRole<Database>(event)
  const merchant = await getOrCreateDefaultMerchant(client)

  let request = client
    .from('recurring_invoices')
    .select('*, customer:customers(full_name)', { count: 'exact' })
    .eq('merchant_id', merchant.id)

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
