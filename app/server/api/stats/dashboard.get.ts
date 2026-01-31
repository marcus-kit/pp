import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
  const today = now.toISOString().split('T')[0]

  const pendingPromise = client
    .from('invoices')
    .select('amount')
    .in('status', ['sent', 'viewed'])

  const paidPromise = client
    .from('invoices')
    .select('amount')
    .eq('status', 'paid')
    .gte('paid_at', startOfMonth)
    .lte('paid_at', endOfMonth)

  const overduePromise = client
    .from('invoices')
    .select('amount')
    .in('status', ['sent', 'viewed'])
    .lt('due_date', today)

  const recentPromise = client
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const [pendingRes, paidRes, overdueRes, recentRes] = await Promise.all([
    pendingPromise,
    paidPromise,
    overduePromise,
    recentPromise
  ])

  if (pendingRes.error) throw createError({ status: 500, message: pendingRes.error.message })
  if (paidRes.error) throw createError({ status: 500, message: paidRes.error.message })
  if (overdueRes.error) throw createError({ status: 500, message: overdueRes.error.message })
  if (recentRes.error) throw createError({ status: 500, message: recentRes.error.message })

  const calculateSum = (data: any[]) => data.reduce((sum, item) => sum + item.amount, 0)

  return {
    stats: {
      pending: calculateSum(pendingRes.data || []),
      paid: calculateSum(paidRes.data || []),
      overdue: calculateSum(overdueRes.data || [])
    },
    recentInvoices: recentRes.data || []
  }
})
