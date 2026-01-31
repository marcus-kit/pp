<template>
  <UContainer class="py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Обзор</h1>
      <div class="flex gap-3">
        <UButton to="/customers/new" icon="i-heroicons-user-plus" color="white" variant="solid">
          Добавить клиента
        </UButton>
        <UButton to="/invoices/new" icon="i-heroicons-document-plus" color="primary" variant="solid">
          Создать счёт
        </UButton>
      </div>
    </div>

    <div v-if="pending" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <USkeleton class="h-32" v-for="i in 3" :key="i" />
      </div>
      <USkeleton class="h-64" />
    </div>

    <div v-else-if="error" class="text-red-500">
      Ошибка загрузки данных: {{ error.message }}
    </div>

    <div v-else class="space-y-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ожидает оплаты"
          :value="formatMoney(data?.stats.pending || 0)"
          icon="i-heroicons-clock"
          icon-color="text-amber-600"
          icon-bg-color="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Оплачено (этот месяц)"
          :value="formatMoney(data?.stats.paid || 0)"
          icon="i-heroicons-check-circle"
          icon-color="text-green-600"
          icon-bg-color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Просрочено"
          :value="formatMoney(data?.stats.overdue || 0)"
          icon="i-heroicons-exclamation-circle"
          icon-color="text-red-600"
          icon-bg-color="bg-red-100 dark:bg-red-900/30"
        />
      </div>

      <!-- Recent Invoices -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Недавние счета</h2>
            <UButton to="/invoices" variant="ghost" color="gray" size="sm">
              Все счета
              <UIcon name="i-heroicons-arrow-right" />
            </UButton>
          </div>
        </template>

        <UTable :rows="data?.recentInvoices || []" :columns="columns">
          <template #invoice_number-data="{ row }">
            <NuxtLink :to="`/invoices/${row.id}`" class="text-primary-600 hover:text-primary-500 font-medium">
              {{ row.invoice_number }}
            </NuxtLink>
          </template>
          
          <template #amount-data="{ row }">
            {{ formatMoney(row.amount) }}
          </template>

          <template #status-data="{ row }">
            <UBadge :color="getStatusColor(row.status)" variant="subtle">
              {{ getStatusLabel(row.status) }}
            </UBadge>
          </template>

          <template #created_at-data="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </UTable>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { formatMoney, formatDate } = useFormatters()

const { data, pending, error } = await useFetch('/api/stats/dashboard')

const columns = [
  { key: 'invoice_number', label: 'Номер' },
  { key: 'payer_name', label: 'Клиент' },
  { key: 'amount', label: 'Сумма' },
  { key: 'status', label: 'Статус' },
  { key: 'created_at', label: 'Дата создания' }
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'gray',
    sent: 'blue',
    viewed: 'amber',
    paid: 'green',
    cancelled: 'red',
    overdue: 'red'
  }
  return colors[status] || 'gray'
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
</script>
