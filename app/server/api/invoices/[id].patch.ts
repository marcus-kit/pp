import { updateInvoiceSchema } from '~/shared/schemas/invoice'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, (body) => updateInvoiceSchema.parse(body))
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('invoices')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data
})
