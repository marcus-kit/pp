import { z } from 'zod'

const invoiceItemSchema = z.object({
  name: z.string().min(1, 'Укажите название'),
  quantity: z.number().int().positive('Количество должно быть больше 0'),
  price: z.number().int().nonnegative('Цена не может быть отрицательной'),
  amount: z.number().int().nonnegative('Сумма не может быть отрицательной')
})

export const createRecurringInvoiceSchema = z.object({
  merchant_id: z.string().uuid('Неверный ID мерчанта'),
  customer_id: z.string().uuid('Неверный ID клиента'),
  name: z.string().min(1, 'Укажите название').max(255),
  description: z.string().max(500).nullable().optional(),
  amount: z.number().int().positive('Сумма должна быть больше 0'),
  interval: z.enum(['monthly']),
  day_of_month: z.number().int().min(1).max(28),
  items: z.array(invoiceItemSchema).nullable().optional(),
  starts_at: z.string().datetime().optional()
})

export const updateRecurringInvoiceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).nullable().optional(),
  amount: z.number().int().positive().optional(),
  day_of_month: z.number().int().min(1).max(28).optional(),
  items: z.array(invoiceItemSchema).nullable().optional(),
  is_active: z.boolean().optional(),
  ends_at: z.string().datetime().nullable().optional()
})

export type CreateRecurringInvoiceInput = z.infer<typeof createRecurringInvoiceSchema>
export type UpdateRecurringInvoiceInput = z.infer<typeof updateRecurringInvoiceSchema>
