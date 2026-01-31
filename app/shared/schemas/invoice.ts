import { z } from 'zod'

const invoiceItemSchema = z.object({
  name: z.string().min(1, 'Укажите название'),
  quantity: z.number().int().positive('Количество должно быть больше 0'),
  price: z.number().int().nonnegative('Цена не может быть отрицательной'),
  amount: z.number().int().nonnegative('Сумма не может быть отрицательной')
})

export const createInvoiceSchema = z.object({
  merchant_id: z.string().uuid('Неверный ID мерчанта'),
  customer_id: z.string().uuid('Неверный ID клиента'),
  invoice_number: z.string().min(1, 'Укажите номер счета').max(50),
  payer_name: z.string().min(1, 'Укажите плательщика').max(255),
  payer_address: z.string().max(500).nullable().optional(),
  amount: z.number().int().positive('Сумма должна быть больше 0'),
  description: z.string().min(1, 'Укажите описание').max(500),
  period_start: z.string().date().nullable().optional(),
  period_end: z.string().date().nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  items: z.array(invoiceItemSchema).nullable().optional()
})

export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'cancelled', 'overdue']).optional(),
  due_date: z.string().date().nullable().optional(),
  paid_at: z.string().datetime().nullable().optional()
})

export const searchInvoicesSchema = z.object({
  merchant_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'cancelled', 'overdue']).optional(),
  from_date: z.string().date().optional(),
  to_date: z.string().date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type SearchInvoicesInput = z.infer<typeof searchInvoicesSchema>
