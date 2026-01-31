import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = await serverSupabaseClient<Database>(event)
  
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID клиента обязателен'
    })
  }

  // RLS автоматически фильтрует по merchant_id
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Клиент не найден'
    })
  }

  return customer
})
