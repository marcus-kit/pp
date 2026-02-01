import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID is required' })
  }

  const client = await serverSupabaseServiceRole<Database>(event)
  const merchant = await getOrCreateDefaultMerchant(client)

  const { error } = await client
    .from('recurring_invoices')
    .delete()
    .eq('id', id)
    .eq('merchant_id', merchant.id)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return { success: true }
})
