<script setup lang="ts">
import type { Invoice } from '~/shared/types/database'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data: invoice, status, refresh } = await useFetch<Invoice>(`/api/invoices/${route.params.id}`)

const isProcessing = ref(false)

async function updateStatus(newStatus: string) {
  if (!confirm(`Вы уверены, что хотите изменить статус на "${getStatusLabel(newStatus)}"?`)) return

  isProcessing.value = true
  try {
    await $fetch(`/api/invoices/${route.params.id}`, {
      method: 'PATCH',
      body: {
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : undefined
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

async function deleteInvoice() {
  if (!confirm('Вы уверены, что хотите удалить этот счёт?')) return

  isProcessing.value = true
  try {
    await $fetch(`/api/invoices/${route.params.id}`, { method: 'DELETE' })
    toast.add({ title: 'Счёт удален' })
    router.push('/invoices')
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

function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'neutral'
    case 'sent': return 'info'
    case 'viewed': return 'info'
    case 'paid': return 'success'
    case 'cancelled': return 'error'
    case 'overdue': return 'warning'
    default: return 'neutral'
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    sent: 'Отправлен',
    viewed: 'Просмотрен',
    paid: 'Оплачен',
    cancelled: 'Отменен',
    overdue: 'Просрочен'
  }
  return labels[status] || status
}
</script>

<template>
  <div v-if="invoice" class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          to="/invoices"
        />
        <div>
          <h1 class="text-2xl font-bold flex items-center gap-3">
            Счёт {{ invoice.invoice_number }}
            <UBadge :color="getStatusColor(invoice.status)" variant="subtle" size="lg">
              {{ getStatusLabel(invoice.status) }}
            </UBadge>
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            от {{ formatDate(invoice.created_at) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          v-if="invoice.status === 'draft'"
          icon="i-lucide-send"
          color="primary"
          :loading="isProcessing"
          @click="updateStatus('sent')"
        >
          Отправить
        </UButton>

        <UButton
           v-if="['sent', 'viewed', 'overdue'].includes(invoice.status)"
           icon="i-lucide-check-circle"
           color="success"
           variant="soft"
           :loading="isProcessing"
           @click="updateStatus('paid')"
         >
           Отметить оплаченным
         </UButton>

        <UButton
           v-if="['draft', 'sent', 'viewed', 'overdue'].includes(invoice.status)"
           icon="i-lucide-x-circle"
           color="error"
           variant="ghost"
           :loading="isProcessing"
           @click="updateStatus('cancelled')"
         >
           Отменить
         </UButton>

        <UDropdown :items="[[
           { label: 'Удалить', icon: 'i-lucide-trash-2', click: deleteInvoice, color: 'error' }
         ]]">
          <UButton icon="i-lucide-more-vertical" color="neutral" variant="ghost" />
        </UDropdown>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Позиции</h3>
          </template>

          <UTable
            :data="invoice.items || []"
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
              <p class="text-sm text-gray-600 dark:text-gray-400">Итого к оплате</p>
              <p class="text-2xl font-bold">{{ formatCurrency(invoice.amount) }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Детали</h3>
          </template>
          <div class="prose dark:prose-invert max-w-none">
            <p class="whitespace-pre-wrap">{{ invoice.description }}</p>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Клиент</h3>
          </template>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Плательщик</p>
              <p class="font-medium">{{ invoice.payer_name }}</p>
            </div>
            <div v-if="invoice.payer_address">
              <p class="text-sm text-gray-600 dark:text-gray-400">Адрес</p>
              <p>{{ invoice.payer_address }}</p>
            </div>
            <div v-if="invoice.customer">
              <UButton
                variant="link"
                :to="`/customers/${invoice.customer_id}`"
                class="p-0 h-auto"
              >
                Перейти к профилю клиента
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Даты</h3>
          </template>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Дата выставления</p>
              <p>{{ formatDate(invoice.created_at) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Срок оплаты</p>
              <p :class="{'text-red-500': invoice.status === 'overdue'}">
                {{ formatDate(invoice.due_date) }}
              </p>
            </div>
            <div v-if="invoice.paid_at">
              <p class="text-sm text-gray-600 dark:text-gray-400">Оплачен</p>
              <p class="text-green-600 font-medium">{{ formatDate(invoice.paid_at) }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
