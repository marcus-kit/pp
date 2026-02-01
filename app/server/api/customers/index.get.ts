import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole<Database>(event)
  const merchant = await getOrCreateDefaultMerchant(client)
  const query = getQuery(event)

  // Параметры пагинации
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = (page - 1) * limit

  // Построение запроса
  let request = client
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchant.id)

  // Поиск по тексту (имя или email)
  if (query.query) {
    const searchTerm = `%${String(query.query)}%`
    request = request.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
  }

  // Сортировка и пагинация
  const { data, count, error } = await request
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  const total = count || 0

  return {
    items: data || [],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
})
