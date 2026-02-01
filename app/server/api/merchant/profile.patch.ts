import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { updateMerchantSchema } from '~/shared/schemas/merchant'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = updateMerchantSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: validation.error.errors
    })
  }

  const client = await serverSupabaseServiceRole<Database>(event)

  // Получаем или создаём мерчанта по умолчанию
  const merchant = await getOrCreateDefaultMerchant(client)

  const { data, error } = await client
    .from('merchants')
    .update(validation.data)
    .eq('id', merchant.id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
