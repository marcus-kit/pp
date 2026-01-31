import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database'

export default defineTask({
  meta: {
    name: 'process-recurring',
    description: 'Process recurring invoices and generate new ones'
  },
  async run({ payload, context }) {
    const client = serverSupabaseServiceRole<Database>()
    const today = new Date().toISOString()

    const { data: recurring, error: fetchError } = await client
      .from('recurring_invoices')
      .select('*, customer:customers(full_name, legal_address)')
      .eq('is_active', true)
      .lte('next_generation_at', today)

    if (fetchError) {
      console.error('Failed to fetch recurring invoices:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!recurring || recurring.length === 0) {
      return { success: true, processed: 0, created: 0 }
    }

    let created = 0
    const errors: Array<{ id: string; error: string }> = []

    for (const rec of recurring) {
      try {
        const { data: invoiceNumber, error: numError } = await client.rpc('generate_invoice_number', { 
          merchant_id_param: rec.merchant_id 
        })

        if (numError) {
          throw new Error(`Failed to generate invoice number: ${numError.message}`)
        }

        const { error: insertError } = await client
          .from('invoices')
          .insert({
            merchant_id: rec.merchant_id,
            customer_id: rec.customer_id,
            invoice_number: invoiceNumber,
            public_token: crypto.randomUUID(),
            payer_name: rec.customer?.full_name || 'Клиент',
            payer_address: rec.customer?.legal_address || null,
            amount: rec.amount,
            description: rec.description || rec.name,
            period_start: null,
            period_end: null,
            status: 'draft',
            issued_at: new Date().toISOString(),
            due_date: null,
            paid_at: null,
            items: rec.items
          })

        if (insertError) {
          throw new Error(`Failed to create invoice: ${insertError.message}`)
        }

        const nextGeneration = new Date(rec.next_generation_at!)
        nextGeneration.setMonth(nextGeneration.getMonth() + 1)

        const { error: updateError } = await client
          .from('recurring_invoices')
          .update({
            last_generated_at: today,
            next_generation_at: nextGeneration.toISOString()
          })
          .eq('id', rec.id)

        if (updateError) {
          throw new Error(`Failed to update recurring invoice: ${updateError.message}`)
        }

        created++
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push({ id: rec.id, error: errorMessage })
        console.error(`Error processing recurring invoice ${rec.id}:`, errorMessage)
      }
    }

    return {
      success: errors.length === 0,
      processed: recurring.length,
      created,
      errors
    }
  }
})
