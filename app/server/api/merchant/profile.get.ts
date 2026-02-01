import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole<Database>(event)

  // Получаем или создаём мерчанта по умолчанию
  const merchant = await getOrCreateDefaultMerchant(client)

  // Получаем полный профиль мерчанта
  const { data, error } = await client
    .from('merchants')
    .select('*')
    .eq('id', merchant.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
