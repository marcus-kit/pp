<template>
  <UContainer class="py-8" data-testid="dashboard-page">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Обзор</h1>
      <div class="flex gap-3">
         <UButton to="/customers/new" icon="i-lucide-user-plus" color="neutral" variant="solid" data-testid="add-customer-btn">
           Добавить клиента
         </UButton>
         <UButton to="/invoices/new" icon="i-lucide-file-plus" color="primary" variant="solid" data-testid="create-invoice-btn">
           Создать счёт
         </UButton>
      </div>
    </div>

    <div v-if="pending" class="space-y-8" data-testid="dashboard-skeleton">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard v-for="i in 3" :key="i">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-8 w-32" />
            </div>
            <USkeleton class="h-12 w-12 rounded-full" />
          </div>
        </UCard>
      </div>
      
      <UCard>
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-4">
            <USkeleton class="h-6 w-32" />
            <USkeleton class="h-8 w-24" />
          </div>
          <div class="space-y-2">
            <USkeleton class="h-12 w-full" v-for="i in 5" :key="i" />
          </div>
        </div>
      </UCard>
    </div>

    <div v-else-if="error" class="text-red-500">
      Ошибка загрузки данных: {{ error.message }}
    </div>

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="stats-grid">
         <StatCard
           title="Ожидает оплаты"
           :value="formatMoney(data?.stats.pending || 0)"
           icon="i-lucide-clock"
           icon-color="text-amber-600"
           icon-bg-color="bg-amber-100 dark:bg-amber-900/30"
         />
         <StatCard
           title="Оплачено (этот месяц)"
           :value="formatMoney(data?.stats.paid || 0)"
           icon="i-lucide-check-circle"
           icon-color="text-green-600"
           icon-bg-color="bg-green-100 dark:bg-green-900/30"
         />
         <StatCard
           title="Просрочено"
           :value="formatMoney(data?.stats.overdue || 0)"
           icon="i-lucide-alert-circle"
           icon-color="text-red-600"
           icon-bg-color="bg-red-100 dark:bg-red-900/30"
         />
      </div>

      <UCard data-testid="recent-invoices-table">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Недавние счета</h2>
             <UButton to="/invoices" variant="ghost" color="neutral" size="sm">
               Все счета
               <UIcon name="i-lucide-arrow-right" />
             </UButton>
          </div>
        </template>

        <UTable :data="data?.recentInvoices || []" :columns="columns" />
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth'
})

const { formatMoney, formatDate } = useFormatters()

const { data, pending, error } = useLazyFetch('/api/stats/dashboard')

const NuxtLink = resolveComponent('NuxtLink')
const UBadge = resolveComponent('UBadge')

type Invoice = {
  id: string
  invoice_number: string
  payer_name: string
  amount: number
  status: string
  created_at: string
}

const getStatusColor = (status: string) => {
  const colors: Record<string, 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'> = {
    draft: 'neutral',
    sent: 'info',
    viewed: 'warning',
    paid: 'success',
    cancelled: 'error',
    overdue: 'error'
  }
  return colors[status] || 'neutral'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    sent: 'Отправлен',
    viewed: 'Просмотрен',
    paid: 'Оплачен',
    cancelled: 'Отменён',
    overdue: 'Просрочен'
  }
  return labels[status] || status
}

const columns: TableColumn<Invoice>[] = [
  {
    accessorKey: 'invoice_number',
    header: 'Номер',
    cell: ({ row }) => h(NuxtLink, {
      to: `/invoices/${row.original.id}`,
      class: 'text-primary-600 hover:text-primary-500 font-medium'
    }, () => row.getValue('invoice_number'))
  },
  {
    accessorKey: 'payer_name',
    header: 'Клиент'
  },
  {
    accessorKey: 'amount',
    header: 'Сумма',
    cell: ({ row }) => formatMoney(row.getValue('amount'))
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => h(UBadge, {
      color: getStatusColor(row.getValue('status')),
      variant: 'subtle'
    }, () => getStatusLabel(row.getValue('status')))
  },
  {
    accessorKey: 'created_at',
    header: 'Дата создания',
    cell: ({ row }) => formatDate(row.getValue('created_at'))
  }
]
</script>
