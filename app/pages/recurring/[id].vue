<script setup lang="ts">
import type { RecurringInvoice } from '~/shared/types/database'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data: recurring, status, refresh } = await useFetch<RecurringInvoice>(`/api/recurring/${route.params.id}`)

const isProcessing = ref(false)

async function toggleActive() {
  if (!recurring.value) return
  
  const action = recurring.value.is_active ? 'деактивировать' : 'активировать'
  if (!confirm(`Вы уверены, что хотите ${action} эту подписку?`)) return

  isProcessing.value = true
  try {
    await $fetch(`/api/recurring/${route.params.id}`, {
      method: 'PATCH',
      body: {
        is_active: !recurring.value.is_active
      }
    })
    await refresh()
    toast.add({ title: 'Статус обновлен' })
  } catch (e: any) {
    console.error(e)
    toast.add({ title: 'Ошибка обновления', description: e.message, color: 'red' })
  } finally {
    isProcessing.value = false
  }
}

async function deleteRecurring() {
  if (!confirm('Вы уверены, что хотите удалить эту подписку? Это действие необратимо.')) return

  isProcessing.value = true
  try {
    await $fetch(`/api/recurring/${route.params.id}`, { method: 'DELETE' })
    toast.add({ title: 'Подписка удалена' })
    router.push('/recurring')
  } catch (e: any) {
    console.error(e)
    toast.add({ title: 'Ошибка удаления', description: e.message, color: 'red' })
    isProcessing.value = false
  }
}

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
  <div v-if="recurring" class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          to="/recurring"
        />
        <div>
          <h1 class="text-2xl font-bold flex items-center gap-3">
            {{ recurring.name }}
            <UBadge :color="recurring.is_active ? 'green' : 'gray'" variant="subtle" size="lg">
              {{ recurring.is_active ? 'Активна' : 'Неактивна' }}
            </UBadge>
          </h1>
          <p class="text-muted-foreground">
            Создана {{ formatDate(recurring.created_at) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          :icon="recurring.is_active ? 'i-lucide-pause' : 'i-lucide-play'"
          :color="recurring.is_active ? 'orange' : 'green'"
          variant="soft"
          :loading="isProcessing"
          @click="toggleActive"
        >
          {{ recurring.is_active ? 'Деактивировать' : 'Активировать' }}
        </UButton>

        <UDropdown :items="[[
          { label: 'Удалить', icon: 'i-lucide-trash-2', click: deleteRecurring, color: 'red' }
        ]]">
          <UButton icon="i-lucide-more-vertical" color="neutral" variant="ghost" />
        </UDropdown>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Позиции счёта</h3>
          </template>

          <UTable
            :rows="recurring.items || []"
            :columns="[
              { key: 'name', label: 'Наименование' },
              { key: 'quantity', label: 'Кол-во' },
              { key: 'price', label: 'Цена' },
              { key: 'amount', label: 'Сумма' }
            ]"
          >
            <template #price-data="{ row }">
              {{ formatCurrency(row.price) }}
            </template>
            <template #amount-data="{ row }">
              {{ formatCurrency(row.amount) }}
            </template>
          </UTable>

          <div class="flex justify-end p-4 border-t">
            <div class="text-right">
              <p class="text-sm text-muted-foreground">Итого к оплате</p>
              <p class="text-2xl font-bold">{{ formatCurrency(recurring.amount) }}</p>
            </div>
          </div>
        </UCard>

        <UCard v-if="recurring.description">
          <template #header>
            <h3 class="text-lg font-semibold">Описание</h3>
          </template>
          <div class="prose dark:prose-invert max-w-none">
            <p class="whitespace-pre-wrap">{{ recurring.description }}</p>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Клиент</h3>
          </template>
          
          <div class="space-y-4">
            <div v-if="recurring.customer">
              <p class="text-sm text-muted-foreground">Имя</p>
              <p class="font-medium">{{ recurring.customer.full_name }}</p>
            </div>
            <div>
              <UButton
                variant="link"
                :to="`/customers/${recurring.customer_id}`"
                class="p-0 h-auto"
              >
                Перейти к профилю клиента
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Расписание</h3>
          </template>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-muted-foreground">Интервал</p>
              <p>Ежемесячно</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">День выставления</p>
              <p>{{ recurring.day_of_month }} число каждого месяца</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Дата начала</p>
              <p>{{ formatDate(recurring.starts_at) }}</p>
            </div>
            <div v-if="recurring.ends_at">
              <p class="text-sm text-muted-foreground">Дата окончания</p>
              <p>{{ formatDate(recurring.ends_at) }}</p>
            </div>
            <div v-if="recurring.last_generated_at">
              <p class="text-sm text-muted-foreground">Последний счёт</p>
              <p>{{ formatDate(recurring.last_generated_at) }}</p>
            </div>
            <div v-if="recurring.next_generation_at && recurring.is_active">
              <p class="text-sm text-muted-foreground">Следующий счёт</p>
              <p class="font-medium text-primary">{{ formatDate(recurring.next_generation_at) }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
