import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~~/shared/types/database'
import { updateMerchantSchema } from '~~/shared/schemas/merchant'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = updateMerchantSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: validation.error.errors
    })
  }

  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('merchants')
    .update(validation.data)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
