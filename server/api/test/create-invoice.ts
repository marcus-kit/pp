import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event)

  const userId = '00000000-0000-0000-0000-000000000000'
  
  let { data: merchant } = await client
    .from('merchants')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!merchant) {
    const { data: newMerchant, error: merchantError } = await client
      .from('merchants')
      .insert({
        user_id: userId,
        full_name: 'Test Merchant',
        email: 'test@merchant.com',
        merchant_type: 'company',
        inn: '1234567890',
        bank_name: 'Test Bank',
        bank_bic: '044525225',
        bank_account: '40702810000000000001'
      })
      .select()
      .single()
    
    if (merchantError) throw merchantError
    merchant = newMerchant
  }

  let { data: customer } = await client
    .from('customers')
    .select('*')
    .eq('merchant_id', merchant!.id)
    .eq('email', 'customer@example.com')
    .single()

  if (!customer) {
    const { data: newCustomer, error: customerError } = await client
      .from('customers')
      .insert({
        merchant_id: merchant!.id,
        full_name: 'Test Customer',
        email: 'customer@example.com'
      })
      .select()
      .single()

    if (customerError) throw customerError
    customer = newCustomer
  }

  const { data: invoice, error: invoiceError } = await client
    .from('invoices')
    .insert({
      merchant_id: merchant!.id,
      customer_id: customer!.id,
      invoice_number: `TEST-${Date.now()}`,
      payer_name: customer!.full_name,
      amount: 150000,
      description: 'Test Invoice for Public Page',
      status: 'sent',
      items: [
        { name: 'Service A', quantity: 1, price: 100000, amount: 100000 },
        { name: 'Product B', quantity: 2, price: 25000, amount: 50000 }
      ],
      issued_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    .select()
    .single()

  if (invoiceError) throw invoiceError

  return { token: invoice.public_token }
})
