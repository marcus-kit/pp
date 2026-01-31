import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/shared/types/database'
import { createCustomerSchema } from '~/shared/schemas/customer'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = await serverSupabaseClient<Database>(event)
  
  const body = await readBody(event)
  
  // Валидация через Zod
  const validatedData = createCustomerSchema.parse(body)

  // Получаем merchant_id текущего пользователя
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (merchantError || !merchant) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Merchant profile not found'
    })
  }

  const { data: customer, error } = await supabase
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
