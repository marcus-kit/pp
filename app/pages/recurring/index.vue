<script setup lang="ts">
import type { RecurringInvoice } from '~/shared/types/database'

definePageMeta({ 
  middleware: 'auth'
})

const router = useRouter()

const activeFilter = ref<boolean | undefined>(undefined)

const filterOptions = [
  { label: 'Все', value: undefined },
  { label: 'Активные', value: true },
  { label: 'Неактивные', value: false }
]

const { data, status, refresh } = useLazyFetch('/api/recurring', {
  query: {
    is_active: activeFilter
  },
  watch: [activeFilter]
})

const columns = [
  { key: 'name', label: 'Название' },
  { key: 'customer', label: 'Клиент' },
  { key: 'amount', label: 'Сумма' },
  { key: 'next_generation_at', label: 'Следующий счёт' },
  { key: 'is_active', label: 'Статус' },
  { key: 'actions', label: '' }
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount / 100)
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="space-y-6" data-testid="recurring-page">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" data-testid="page-title">Регулярные счета</h1>
        <p class="text-gray-600 dark:text-gray-400">Автоматическое выставление счетов</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        to="/recurring/new"
        data-testid="create-recurring-button"
      >
        Создать подписку
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 py-3.5 border-b">
        <USelect
          v-model="activeFilter"
          :options="filterOptions"
          placeholder="Статус"
          class="w-full sm:w-40"
          data-testid="status-filter"
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

      <div v-if="status === 'pending' && !data" class="p-4 space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center justify-between">
          <div class="space-y-2">
            <USkeleton class="h-5 w-48" />
            <USkeleton class="h-4 w-32" />
          </div>
          <div class="flex gap-2">
            <USkeleton class="h-8 w-8" />
            <USkeleton class="h-8 w-8" />
          </div>
        </div>
      </div>

      <UTable
        v-else
        :data="data?.items || []"
        :columns="columns"
        :loading="status === 'pending'"
        @select="(row) => router.push(`/recurring/${row.id}`)"
        data-testid="recurring-table"
      >
        <template #name-data="{ row }">
          <div>
            <div class="font-medium">{{ row.name }}</div>
            <div v-if="row.description" class="text-sm text-gray-600 dark:text-gray-400">
              {{ row.description }}
            </div>
          </div>
        </template>

        <template #customer-data="{ row }">
          <span v-if="row.customer">{{ row.customer.full_name }}</span>
          <span v-else class="text-gray-600 dark:text-gray-400">—</span>
        </template>

        <template #amount-data="{ row }">
          {{ formatCurrency(row.amount) }}
        </template>

        <template #next_generation_at-data="{ row }">
          {{ formatDate(row.next_generation_at) }}
        </template>

        <template #is_active-data="{ row }">
          <UBadge :color="row.is_active ? 'green' : 'gray'" variant="subtle">
            {{ row.is_active ? 'Активна' : 'Неактивна' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2" @click.stop>
            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="ghost"
              size="sm"
              :to="`/recurring/${row.id}`"
              :data-testid="`view-recurring-${row.id}`"
            />
          </div>
        </template>
      </UTable>

      <div v-if="data?.items?.length === 0 && status !== 'pending'" class="p-8 text-center" data-testid="empty-state">
        <div class="bg-neutral-50 dark:bg-neutral-900 rounded-full p-4 w-fit mx-auto mb-4">
          <UIcon name="i-lucide-repeat" class="size-8 text-gray-600 dark:text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold mb-2">Подписки не найдены</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Настройте регулярное выставление счетов для ваших клиентов.
        </p>
        <UButton to="/recurring/new" icon="i-lucide-plus" data-testid="empty-state-create-button">
          Создать подписку
        </UButton>
      </div>
    </UCard>
  </div>
</template>
