# Shared Directory

Типы, схемы валидации, константы. Используются и на клиенте, и на сервере.

## Structure

```
shared/
├── types/
│   └── database.ts    # Supabase Database типы
├── schemas/
│   ├── customer.ts    # Zod схемы клиентов
│   ├── invoice.ts     # Zod схемы счетов
│   ├── recurring.ts   # Zod схемы повторяющихся счетов
│   └── merchant.ts    # Zod схемы мерчанта
└── constants/
    └── statuses.ts    # Статусы, типы мерчантов
```

## Database Types

```typescript
// types/database.ts
export type Database = {
  public: {
    Tables: {
      merchants: { Row: {...}, Insert: {...}, Update: {...} }
      customers: { Row: {...}, Insert: {...}, Update: {...} }
      invoices: { Row: {...}, Insert: {...}, Update: {...} }
      invoice_items: { Row: {...}, Insert: {...}, Update: {...} }
      recurring_invoices: { Row: {...}, Insert: {...}, Update: {...} }
    }
    Functions: {
      generate_invoice_number: {...}
    }
  }
}

// Использование
const client = await serverSupabaseClient<Database>(event)
```

## Zod Schemas

### Паттерн: create + update

```typescript
// schemas/customer.ts
export const createCustomerSchema = z.object({
  merchant_id: z.string().uuid(),
  full_name: z.string().min(1),
  email: z.string().email().optional(),
  // ...
})

export const updateCustomerSchema = createCustomerSchema.partial().omit({
  merchant_id: true  // Нельзя менять merchant_id
})
```

### Money: Копейки

```typescript
// Сумма всегда в копейках (integer)
total_amount: z.number().int().min(0)
unit_price: z.number().int().min(0)
```

### Dates

```typescript
// Строка в формате YYYY-MM-DD
due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

// Для повторяющихся: день 1-28
day_of_month: z.number().int().min(1).max(28)
```

### Items Array

```typescript
// schemas/invoice.ts
const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unit_price: z.number().int().min(0)
})

export const createInvoiceSchema = z.object({
  // ...
  items: z.array(invoiceItemSchema).min(1)
})
```

## Constants

```typescript
// constants/statuses.ts
export const INVOICE_STATUSES = {
  draft: 'Черновик',
  sent: 'Отправлен',
  viewed: 'Просмотрен',
  paid: 'Оплачен',
  overdue: 'Просрочен',
  cancelled: 'Отменён'
} as const

export const MERCHANT_TYPES = {
  individual: 'Физическое лицо',
  self_employed: 'Самозанятый',
  ip: 'ИП',
  ooo: 'ООО'
} as const

export type InvoiceStatus = keyof typeof INVOICE_STATUSES
export type MerchantType = keyof typeof MERCHANT_TYPES
```

## Usage

```typescript
// На сервере
import { createInvoiceSchema } from '~/shared/schemas/invoice'
import type { Database } from '~/shared/types/database'
import { INVOICE_STATUSES } from '~/shared/constants/statuses'

// На клиенте
import { INVOICE_STATUSES } from '~/shared/constants/statuses'
```
