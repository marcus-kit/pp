import { searchInvoicesSchema } from '~/shared/schemas/invoice'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (body) => searchInvoicesSchema.parse(body))
  const client = await serverSupabaseClient<Database>(event)

  let request = client
    .from('invoices')
    .select('*, customer:customers(full_name)', { count: 'exact' })

  if (query.merchant_id) {
    request = request.eq('merchant_id', query.merchant_id)
  }

  if (query.customer_id) {
    request = request.eq('customer_id', query.customer_id)
  }

  if (query.status) {
    request = request.eq('status', query.status)
  }

  if (query.from_date) {
    request = request.gte('created_at', query.from_date)
  }

  if (query.to_date) {
    request = request.lte('created_at', query.to_date)
  }

  if (query.search) {
    request = request.or(`invoice_number.ilike.%${query.search}%,payer_name.ilike.%${query.search}%`)
  }

  const from = (query.page - 1) * query.limit
  const to = from + query.limit - 1

  const { data, error, count } = await request
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return {
    items: data,
    total: count || 0,
    page: query.page,
    limit: query.limit,
    totalPages: count ? Math.ceil(count / query.limit) : 0
  }
})
