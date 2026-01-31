import { z } from 'zod'

export const createMerchantSchema = z.object({
  user_id: z.string().uuid('Неверный ID пользователя'),
  merchant_type: z.enum(['individual', 'self_employed', 'company']),
  full_name: z.string().min(1, 'Укажите ФИО').max(255),
  email: z.string().email('Неверный email'),
  phone: z.string().max(20).nullable().optional(),
  inn: z.string().max(12).nullable().optional(),
  kpp: z.string().max(9).nullable().optional(),
  ogrn: z.string().max(15).nullable().optional(),
  legal_address: z.string().max(500).nullable().optional(),
  logo_url: z.string().nullable().optional(),
  bank_name: z.string().max(255).nullable().optional(),
  bank_bic: z.string().length(9, 'БИК должен содержать 9 цифр').nullable().optional(),
  bank_account: z.string().length(20, 'Расчетный счет должен содержать 20 цифр').nullable().optional(),
  bank_corr_account: z.string().length(20, 'Корр. счет должен содержать 20 цифр').nullable().optional()
})

export const updateMerchantSchema = z.object({
  merchant_type: z.enum(['individual', 'self_employed', 'company']).optional(),
  full_name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).nullable().optional(),
  inn: z.string().max(12).nullable().optional(),
  kpp: z.string().max(9).nullable().optional(),
  ogrn: z.string().max(15).nullable().optional(),
  legal_address: z.string().max(500).nullable().optional(),
  logo_url: z.string().nullable().optional(),
  bank_name: z.string().max(255).nullable().optional(),
  bank_bic: z.string().length(9, 'БИК должен содержать 9 цифр').nullable().optional(),
  bank_account: z.string().length(20, 'Расчетный счет должен содержать 20 цифр').nullable().optional(),
  bank_corr_account: z.string().length(20, 'Корр. счет должен содержать 20 цифр').nullable().optional(),
  is_active: z.boolean().optional()
})

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>
