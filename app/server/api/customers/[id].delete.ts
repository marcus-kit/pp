import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole<Database>(event)
  const merchant = await getOrCreateDefaultMerchant(client)
  
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID клиента обязателен'
    })
  }

  // Проверяем, что клиент принадлежит мерчанту
  const { error } = await client
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('merchant_id', merchant.id)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return { success: true }
})
