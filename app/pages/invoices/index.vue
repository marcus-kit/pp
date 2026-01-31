<script setup lang="ts">
import type { Invoice } from '~/shared/types/database'

definePageMeta({ 
  middleware: 'auth',
  layout: 'dashboard'
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

const { data, status, refresh } = await useFetch('/api/invoices', {
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
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Счета</h1>
        <p class="text-muted-foreground">Управление счетами на оплату</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        to="/invoices/new"
      >
        Создать счёт
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-4 px-4 py-3.5 border-b">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по номеру или клиенту..."
          icon="i-lucide-search"
          class="w-64"
        />

        <USelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Статус"
          class="w-40"
        />

        <div class="flex-1" />

        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          :loading="status === 'pending'"
          @click="refresh()"
        />
      </div>

      <UTable
        :data="data?.items || []"
        :columns="columns"
        :loading="status === 'pending'"
        @select="(row) => router.push(`/invoices/${row.id}`)"
      >
        <template #invoice_number-data="{ row }">
          <span class="font-medium font-mono">{{ row.invoice_number }}</span>
        </template>

        <template #customer-data="{ row }">
          <span v-if="row.customer">{{ row.customer.full_name }}</span>
          <span v-else class="text-muted-foreground">{{ row.payer_name }}</span>
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

      <div v-if="data?.items?.length === 0 && status !== 'pending'" class="p-8 text-center">
        <UIcon name="i-lucide-file-text" class="size-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">Счета не найдены</h3>
        <p class="text-muted-foreground mb-4">Создайте первый счёт на оплату</p>
        <UButton to="/invoices/new" icon="i-lucide-plus">
          Создать счёт
        </UButton>
      </div>

      <div
        v-if="data?.totalPages && data.totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t"
      >
        <p class="text-sm text-muted-foreground">
          Показано {{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, data.total) }} из {{ data.total }}
        </p>
        <UPagination
          v-model="page"
          :total="data.total"
          :page-size="limit"
        />
      </div>
    </UCard>
  </div>
</template>
