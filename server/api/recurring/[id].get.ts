import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID is required' })
  }

  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('recurring_invoices')
    .select('*, customer:customers(full_name)')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      message: 'Recurring invoice not found'
    })
  }

  return data
})
