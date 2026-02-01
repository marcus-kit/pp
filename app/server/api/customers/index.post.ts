import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'
import { createCustomerSchema } from '~/shared/schemas/customer'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole<Database>(event)
  const merchant = await getOrCreateDefaultMerchant(client)
  
  const body = await readBody(event)
  
  // Валидация через Zod
  const validatedData = createCustomerSchema.parse(body)

  const { data: customer, error } = await client
    .from('customers')
    .insert({
      merchant_id: merchant.id,
      full_name: validatedData.full_name,
      email: validatedData.email,
      phone: validatedData.phone,
      inn: validatedData.inn,
      kpp: validatedData.kpp,
      ogrn: validatedData.ogrn,
      legal_address: validatedData.legal_address
    })
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
