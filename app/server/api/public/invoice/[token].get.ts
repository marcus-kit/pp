import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  
  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  const client = serverSupabaseServiceRole<Database>(event)

  const { data: invoice, error } = await client
    .from('invoices')
    .select('*, merchant:merchants(*), customer:customers(*)')
    .eq('public_token', token)
    .single()

  if (error || !invoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  if (invoice.status === 'sent') {
    const { error: updateError } = await client
      .from('invoices')
      .update({ status: 'viewed' })
      .eq('id', invoice.id)
      
    if (!updateError) {
      invoice.status = 'viewed'
    }
  }

  return invoice
})
