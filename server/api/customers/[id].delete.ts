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

  // RLS автоматически проверяет merchant_id
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return { success: true }
})
