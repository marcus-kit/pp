import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { updateCustomerSchema } from '~/shared/schemas/customer'
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

  const body = await readBody(event)
  const validatedData = updateCustomerSchema.parse(body)

  // Проверяем, что клиент принадлежит мерчанту
  const { data: customer, error } = await client
    .from('customers')
    .update(validatedData)
    .eq('id', id)
    .eq('merchant_id', merchant.id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return customer
})
