<script setup lang="ts">
import type { RecurringInvoice } from '~/shared/types/database'

definePageMeta({ 
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()

const activeFilter = ref<boolean | undefined>(undefined)

const filterOptions = [
  { label: 'Все', value: undefined },
  { label: 'Активные', value: true },
  { label: 'Неактивные', value: false }
]

const { data, status, refresh } = await useFetch('/api/recurring', {
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
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Регулярные счета</h1>
        <p class="text-muted-foreground">Автоматическое выставление счетов</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        to="/recurring/new"
      >
        Создать подписку
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-4 px-4 py-3.5 border-b">
        <USelect
          v-model="activeFilter"
          :options="filterOptions"
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
        @select="(row) => router.push(`/recurring/${row.id}`)"
      >
        <template #name-data="{ row }">
          <div>
            <div class="font-medium">{{ row.name }}</div>
            <div v-if="row.description" class="text-sm text-muted-foreground">
              {{ row.description }}
            </div>
          </div>
        </template>

        <template #customer-data="{ row }">
          <span v-if="row.customer">{{ row.customer.full_name }}</span>
          <span v-else class="text-muted-foreground">—</span>
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
            />
          </div>
        </template>
      </UTable>

      <div v-if="data?.items?.length === 0 && status !== 'pending'" class="p-8 text-center">
        <UIcon name="i-lucide-repeat" class="size-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">Подписки не найдены</h3>
        <p class="text-muted-foreground mb-4">Настройте регулярное выставление счетов</p>
        <UButton to="/recurring/new" icon="i-lucide-plus">
          Создать подписку
        </UButton>
      </div>
    </UCard>
  </div>
</template>
