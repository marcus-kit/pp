import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient<Database>(event)

  const { error } = await client
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return { success: true }
})
