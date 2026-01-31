import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~~/shared/types/database'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
