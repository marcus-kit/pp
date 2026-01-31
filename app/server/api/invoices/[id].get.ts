import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('invoices')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  return data
})
