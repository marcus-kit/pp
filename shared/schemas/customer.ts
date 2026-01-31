import { z } from 'zod'

export const createCustomerSchema = z.object({
  merchant_id: z.string().uuid('Неверный ID мерчанта'),
  full_name: z.string().min(1, 'Укажите ФИО').max(255),
  email: z.string().email('Неверный email').nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  inn: z.string().max(12).nullable().optional(),
  kpp: z.string().max(9).nullable().optional(),
  ogrn: z.string().max(15).nullable().optional(),
  legal_address: z.string().max(500).nullable().optional()
})

export const updateCustomerSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  inn: z.string().max(12).nullable().optional(),
  kpp: z.string().max(9).nullable().optional(),
  ogrn: z.string().max(15).nullable().optional(),
  legal_address: z.string().max(500).nullable().optional()
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
