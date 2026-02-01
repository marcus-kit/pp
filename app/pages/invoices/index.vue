<script setup lang="ts">
import type { Invoice } from '~/shared/types/database'

definePageMeta({ 
  middleware: 'auth'
})

const router = useRouter()

const page = ref(1)
const limit = ref(20)
const searchQuery = ref('')
const statusFilter = ref<string | undefined>(undefined)

const statusOptions = [
  { label: 'Все', value: undefined },
  { label: 'Черновик', value: 'draft' },
  { label: 'Отправлен', value: 'sent' },
  { label: 'Просмотрен', value: 'viewed' },
  { label: 'Оплачен', value: 'paid' },
  { label: 'Отменен', value: 'cancelled' },
  { label: 'Просрочен', value: 'overdue' }
]

const { data, status, refresh } = useLazyFetch('/api/invoices', {
  query: {
    page,
    limit,
    search: searchQuery,
    status: statusFilter
  },
  watch: [page, searchQuery, statusFilter]
})

const columns = [
  { key: 'invoice_number', label: 'Номер' },
  { key: 'customer', label: 'Клиент' },
  { key: 'amount', label: 'Сумма' },
  { key: 'status', label: 'Статус' },
  { key: 'created_at', label: 'Дата' },
  { key: 'actions', label: '' }
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount / 100)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU')
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'gray'
    case 'sent': return 'blue'
    case 'viewed': return 'indigo'
    case 'paid': return 'green'
    case 'cancelled': return 'red'
    case 'overdue': return 'orange'
    default: return 'gray'
  }
}

function getStatusLabel(status: string) {
  const option = statusOptions.find(o => o.value === status)
  return option ? option.label : status
}
</script>

<template>
  <div class="space-y-6" data-testid="invoices-page">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Счета</h1>
        <p class="text-gray-600 dark:text-gray-400">Управление счетами на оплату</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        to="/invoices/new"
        data-testid="create-invoice-button"
      >
        Создать счёт
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5 border-b">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по номеру или клиенту..."
          icon="i-lucide-search"
          class="w-full sm:w-64"
          data-testid="invoices-search-input"
        />

        <USelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Статус"
          class="w-full sm:w-40"
          data-testid="invoices-status-filter"
        />

        <div class="flex-1" />

        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          :loading="status === 'pending'"
          @click="refresh()"
          data-testid="refresh-button"
          class="self-end sm:self-auto"
        />
      </div>

      <UTable
        :data="data?.items || []"
        :columns="columns"
        :loading="status === 'pending'"
        @select="(row) => router.push(`/invoices/${row.id}`)"
        data-testid="invoices-table"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-12 gap-3" data-testid="invoices-empty-state">
            <UIcon name="i-lucide-file-text" class="size-12 text-gray-600 dark:text-gray-400" />
            <h3 class="text-lg font-semibold">Счета не найдены</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center max-w-sm">
              {{ searchQuery || statusFilter ? 'Попробуйте изменить параметры поиска' : 'Создайте первый счёт на оплату' }}
            </p>
            <UButton
              v-if="!searchQuery && !statusFilter"
              to="/invoices/new"
              icon="i-lucide-plus"
              data-testid="create-invoice-empty-button"
            >
              Создать счёт
            </UButton>
            <UButton
              v-else
              color="neutral"
              variant="ghost"
              @click="searchQuery = ''; statusFilter = undefined"
            >
              Сбросить фильтры
            </UButton>
          </div>
        </template>

        <template #invoice_number-data="{ row }">
          <span class="font-medium font-mono">{{ row.invoice_number }}</span>
        </template>

        <template #customer-data="{ row }">
          <span v-if="row.customer">{{ row.customer.full_name }}</span>
          <span v-else class="text-gray-600 dark:text-gray-400">{{ row.payer_name }}</span>
        </template>

        <template #amount-data="{ row }">
          {{ formatCurrency(row.amount) }}
        </template>

        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(row.status)" variant="subtle">
            {{ getStatusLabel(row.status) }}
          </UBadge>
        </template>

        <template #created_at-data="{ row }">
          {{ formatDate(row.created_at) }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2" @click.stop>
            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="ghost"
              size="sm"
              :to="`/invoices/${row.id}`"
            />
          </div>
        </template>
      </UTable>

      <div
        v-if="data?.totalPages && data.totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Показано {{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, data.total) }} из {{ data.total }}
        </p>
        <UPagination
          v-model="page"
          :total="data.total"
          :page-size="limit"
          data-testid="invoices-pagination"
        />
      </div>
    </UCard>
  </div>
</template>
