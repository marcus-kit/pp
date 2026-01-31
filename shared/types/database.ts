// Типы базы данных для системы счетов PP (invoicing)

// === Enums ===

export type MerchantType = 'individual' | 'self_employed' | 'company'
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'cancelled' | 'overdue'
export type RecurringInterval = 'monthly'

// === Таблица: merchants ===

export interface Merchant {
  id: string
  user_id: string
  merchant_type: MerchantType
  full_name: string
  email: string
  phone: string | null
  inn: string | null
  kpp: string | null
  ogrn: string | null
  legal_address: string | null
  logo_url: string | null
  bank_name: string | null
  bank_bic: string | null
  bank_account: string | null
  bank_corr_account: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MerchantInsert = Omit<Merchant, 'id' | 'created_at' | 'updated_at'>
export type MerchantUpdate = Partial<Omit<Merchant, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

// === Таблица: customers ===

export interface Customer {
  id: string
  merchant_id: string
  full_name: string
  email: string | null
  phone: string | null
  inn: string | null
  kpp: string | null
  ogrn: string | null
  legal_address: string | null
  created_at: string
  updated_at: string
}

export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'>
export type CustomerUpdate = Partial<Omit<Customer, 'id' | 'merchant_id' | 'created_at' | 'updated_at'>>

// === Таблица: invoices ===

export interface InvoiceItem {
  name: string
  quantity: number
  price: number // в копейках
  amount: number // в копейках
}

export interface Invoice {
  id: string
  merchant_id: string
  customer_id: string
  invoice_number: string
  public_token: string
  payer_name: string
  payer_address: string | null
  amount: number // в копейках
  description: string
  period_start: string | null // дата в формате YYYY-MM-DD
  period_end: string | null // дата в формате YYYY-MM-DD
  status: InvoiceStatus
  issued_at: string // timestamptz
  due_date: string | null // дата в формате YYYY-MM-DD
  paid_at: string | null // timestamptz
  items: InvoiceItem[] | null
  created_at: string
  updated_at: string
}

export type InvoiceInsert = Omit<Invoice, 'id' | 'public_token' | 'created_at' | 'updated_at'>
export type InvoiceUpdate = Partial<Pick<Invoice, 'status' | 'due_date' | 'paid_at'>>

// === Таблица: recurring_invoices ===

export interface RecurringInvoice {
  id: string
  merchant_id: string
  customer_id: string
  name: string
  description: string | null
  amount: number // в копейках
  interval: RecurringInterval
  day_of_month: number // 1-28
  items: InvoiceItem[] | null
  is_active: boolean
  starts_at: string // timestamptz
  ends_at: string | null // timestamptz
  last_generated_at: string | null // timestamptz
  next_generation_at: string | null // timestamptz
  created_at: string
  updated_at: string
}

export type RecurringInvoiceInsert = Omit<RecurringInvoice, 'id' | 'created_at' | 'updated_at'>
export type RecurringInvoiceUpdate = Partial<Omit<RecurringInvoice, 'id' | 'merchant_id' | 'customer_id' | 'created_at' | 'updated_at'>>

// === Database schema для типизации ===

export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: Merchant
        Insert: MerchantInsert
        Update: MerchantUpdate
      }
      customers: {
        Row: Customer
        Insert: CustomerInsert
        Update: CustomerUpdate
      }
      invoices: {
        Row: Invoice
        Insert: InvoiceInsert
        Update: InvoiceUpdate
      }
      recurring_invoices: {
        Row: RecurringInvoice
        Insert: RecurringInvoiceInsert
        Update: RecurringInvoiceUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      merchant_type: MerchantType
      invoice_status: InvoiceStatus
      recurring_interval: RecurringInterval
    }
  }
}
