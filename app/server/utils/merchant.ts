import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/shared/types/database'

export async function getOrCreateDefaultMerchant(client: SupabaseClient<Database>) {
  const { data: merchant } = await client
    .from('merchants')
    .select('id')
    .limit(1)
    .single()

  if (merchant) return merchant

  const { data: newMerchant, error } = await client
    .from('merchants')
    .insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      merchant_type: 'company',
      full_name: 'Тестовая компания',
      email: 'test@example.com'
    })
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: 'Failed to create merchant' })
  return newMerchant!
}
