import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/shared/types/database'
import { updateCustomerSchema } from '~/shared/schemas/customer'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = await serverSupabaseClient<Database>(event)
  
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID клиента обязателен'
    })
  }

  const body = await readBody(event)
  const validatedData = updateCustomerSchema.parse(body)

  // RLS автоматически проверяет merchant_id
  const { data: customer, error } = await supabase
    .from('customers')
    .update(validatedData)
    .eq('id', id)
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
