<script setup lang="ts">
import type { Invoice, Merchant, Customer, InvoiceItem } from '~/shared/types/database'

const route = useRoute()
const token = route.params.token as string

const { data: invoice, pending, error } = await useFetch<Invoice & { merchant: Merchant, customer: Customer }>(`/api/public/invoice/${token}`)

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 2
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const statusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'sent': return 'info'
    case 'viewed': return 'info'
    case 'overdue': return 'error'
    case 'cancelled': return 'neutral'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'paid': return 'Оплачен'
    case 'sent': return 'Отправлен'
    case 'viewed': return 'Просмотрен'
    case 'overdue': return 'Просрочен'
    case 'cancelled': return 'Отменен'
    case 'draft': return 'Черновик'
    default: return status
  }
}

const columns = [
  { key: 'name', label: 'Наименование' },
  { key: 'quantity', label: 'Кол-во' },
  { key: 'price', label: 'Цена' },
  { key: 'amount', label: 'Сумма' }
]

const items = computed(() => {
  if (!invoice.value?.items) return []
  return invoice.value.items.map((item: InvoiceItem) => ({
    name: item.name,
    quantity: item.quantity,
    price: currencyFormatter.format(item.price / 100),
    amount: currencyFormatter.format(item.amount / 100)
  }))
})

const subtotal = computed(() => {
  if (!invoice.value?.items) return 0
  return invoice.value.items.reduce((acc, item) => acc + item.amount, 0)
})

const downloadPdf = () => {
  window.open(`/api/invoice/${token}/pdf`, '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8" data-testid="public-invoice-page">
    <!-- Loading State -->
    <div v-if="pending" class="max-w-4xl mx-auto" data-testid="loading-state">
      <div class="mb-6 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <USkeleton class="h-8 w-48" />
          <USkeleton class="h-6 w-24" />
        </div>
        <USkeleton class="h-9 w-32" />
      </div>

      <UCard class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="space-y-4">
            <USkeleton class="h-12 w-12" />
            <USkeleton class="h-6 w-48" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-32" />
            </div>
          </div>
          <div class="flex flex-col items-end space-y-4">
            <div class="space-y-2 w-full flex flex-col items-end">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-6 w-40" />
            </div>
            <div class="space-y-2 w-full flex flex-col items-end">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-6 w-48" />
            </div>
          </div>
        </div>

        <div class="space-y-4 mb-8">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>

        <div class="flex justify-end">
          <div class="w-full md:w-1/3 space-y-3">
            <div class="flex justify-between">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-4 w-24" />
            </div>
            <div class="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <USkeleton class="h-6 w-24" />
              <USkeleton class="h-6 w-32" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-3xl mx-auto text-center" data-testid="error-state">
      <div class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
         <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Счет не найден</h1>
        <p class="text-gray-600 dark:text-gray-300">Возможно, ссылка устарела или содержит ошибку.</p>
      </div>
    </div>

    <!-- Invoice Content -->
    <div v-else-if="invoice" class="max-w-4xl mx-auto" data-testid="invoice-content">
      <div class="mb-6 flex justify-between items-center" data-testid="invoice-header">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Счет #{{ invoice.invoice_number }}</h1>
          <UBadge :color="statusColor(invoice.status)" variant="subtle">
            {{ statusLabel(invoice.status) }}
          </UBadge>
        </div>
          <UButton
            icon="i-lucide-download"
            color="neutral"
            variant="ghost"
            @click="downloadPdf"
            data-testid="download-pdf-btn"
          >
            Скачать PDF
          </UButton>
      </div>

      <UCard class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Merchant Info -->
          <div data-testid="merchant-info">
            <div v-if="invoice.merchant.logo_url" class="mb-4">
              <img :src="invoice.merchant.logo_url" alt="Logo" class="h-12 object-contain" />
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ invoice.merchant.full_name }}</h2>
            <div class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p v-if="invoice.merchant.inn">ИНН: {{ invoice.merchant.inn }}</p>
              <p v-if="invoice.merchant.phone">{{ invoice.merchant.phone }}</p>
              <p v-if="invoice.merchant.email">{{ invoice.merchant.email }}</p>
            </div>
          </div>

          <!-- Invoice Details & Customer -->
          <div class="text-right">
            <div class="mb-6">
              <p class="text-sm text-gray-500 dark:text-gray-400">Дата выставления</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ dateFormatter.format(new Date(invoice.issued_at)) }}</p>
              
              <div v-if="invoice.due_date" class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">Оплатить до</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ dateFormatter.format(new Date(invoice.due_date)) }}</p>
              </div>
            </div>

            <div data-testid="customer-info">
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Плательщик</p>
              <h3 class="font-medium text-gray-900 dark:text-white">{{ invoice.payer_name }}</h3>
              <p v-if="invoice.payer_address" class="text-sm text-gray-600 dark:text-gray-300">{{ invoice.payer_address }}</p>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="mb-8" data-testid="items-table">
          <UTable :data="items" :columns="columns" :ui="{ th: { base: 'text-left' }, td: { base: 'text-left' } }">
            <template #price-data="{ row }">
              <div class="text-right">{{ row.price }}</div>
            </template>
            <template #amount-data="{ row }">
              <div class="text-right font-medium">{{ row.amount }}</div>
            </template>
            <template #quantity-data="{ row }">
              <div class="text-center">{{ row.quantity }}</div>
            </template>
          </UTable>
        </div>

        <!-- Totals -->
        <div class="border-t border-gray-100 dark:border-gray-800 pt-6" data-testid="invoice-totals">
          <div class="flex justify-end">
            <div class="w-full md:w-1/3 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-300">Итого</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ currencyFormatter.format(subtotal / 100) }}</span>
              </div>
              <div class="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-800">
                <span>К оплате</span>
                <span>{{ currencyFormatter.format(invoice.amount / 100) }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Payment Details -->
      <UCard v-if="invoice.merchant.bank_account" class="bg-gray-50 dark:bg-gray-800/50" data-testid="payment-details">
        <template #header>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Реквизиты для оплаты</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500 dark:text-gray-400">Банк</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ invoice.merchant.bank_name }}</p>
          </div>
          <div>
            <p class="text-gray-500 dark:text-gray-400">БИК</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ invoice.merchant.bank_bic }}</p>
          </div>
          <div>
            <p class="text-gray-500 dark:text-gray-400">Расчетный счет</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ invoice.merchant.bank_account }}</p>
          </div>
          <div v-if="invoice.merchant.bank_corr_account">
            <p class="text-gray-500 dark:text-gray-400">Корр. счет</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ invoice.merchant.bank_corr_account }}</p>
          </div>
        </div>
      </UCard>
      
      <div class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Спасибо за сотрудничество!</p>
      </div>
    </div>
  </div>
</template>
