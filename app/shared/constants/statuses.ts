import type { MerchantType, InvoiceStatus, RecurringInterval } from '../types/database'

// Типы мерчантов
export const MERCHANT_TYPES: Record<MerchantType, { label: string; icon: string }> = {
  individual: { label: 'Физическое лицо', icon: 'i-lucide-user' },
  self_employed: { label: 'Самозанятый', icon: 'i-lucide-briefcase' },
  company: { label: 'Компания', icon: 'i-lucide-building-2' }
}

// Статусы счетов
export const INVOICE_STATUSES: Record<InvoiceStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Черновик', color: 'neutral', icon: 'i-lucide-file-text' },
  sent: { label: 'Отправлен', color: 'info', icon: 'i-lucide-send' },
  viewed: { label: 'Просмотрен', color: 'info', icon: 'i-lucide-eye' },
  paid: { label: 'Оплачен', color: 'success', icon: 'i-lucide-check-circle' },
  cancelled: { label: 'Отменён', color: 'neutral', icon: 'i-lucide-x-circle' },
  overdue: { label: 'Просрочен', color: 'error', icon: 'i-lucide-alert-circle' }
}

// Интервалы повторения
export const RECURRING_INTERVALS: Record<RecurringInterval, { label: string; icon: string }> = {
  monthly: { label: 'Ежемесячно', icon: 'i-lucide-calendar' }
}
