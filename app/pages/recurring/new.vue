<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()
const toast = useToast()

const { data: customers } = await useFetch('/api/customers', {
  query: { limit: 100 }
})

const customerOptions = computed(() => {
  return customers.value?.items.map(c => ({
    label: c.full_name,
    value: c.id
  })) || []
})

const state = reactive({
  customer_id: undefined,
  name: '',
  description: '',
  day_of_month: 1,
  items: [
    { name: 'Услуга', quantity: 1, price: 0, amount: 0 }
  ]
})

watch(() => state.items, (items) => {
  items.forEach(item => {
    item.amount = item.quantity * item.price
  })
}, { deep: true })

const totalAmount = computed(() => {
  return state.items.reduce((sum, item) => sum + item.amount, 0)
})

function addItem() {
  state.items.push({ name: '', quantity: 1, price: 0, amount: 0 })
}

function removeItem(index: number) {
  if (state.items.length > 1) {
    state.items.splice(index, 1)
  }
}

async function onSubmit(event: FormSubmitEvent<any>) {
  try {
    const payload = {
      customer_id: state.customer_id,
      name: state.name,
      description: state.description || null,
      amount: Math.round(totalAmount.value * 100),
      interval: 'monthly' as const,
      day_of_month: state.day_of_month,
      items: state.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price * 100),
        amount: Math.round(item.amount * 100)
      }))
    }

    await $fetch('/api/recurring', {
      method: 'POST',
      body: payload
    })

    toast.add({ title: 'Подписка создана' })
    router.push('/recurring')
  } catch (e: any) {
    console.error(e)
    toast.add({ title: 'Ошибка при создании подписки', description: e.message, color: 'red' })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Новая подписка</h1>
      <UButton
        color="neutral"
        variant="ghost"
        to="/recurring"
      >
        Отмена
      </UButton>
    </div>

    <UForm :state="state" @submit="onSubmit" class="space-y-6">
      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormGroup label="Название" name="name" required class="col-span-full">
            <UInput v-model="state.name" placeholder="Например: Ежемесячная подписка" />
          </UFormGroup>

          <UFormGroup label="Клиент" name="customer_id" required>
            <USelectMenu
              v-model="state.customer_id"
              :options="customerOptions"
              placeholder="Выберите клиента"
              searchable
              value-attribute="value"
            />
          </UFormGroup>

          <UFormGroup 
            label="День выставления" 
            name="day_of_month" 
            required
            help="Счёт будет выставляться каждый месяц в этот день (1-28)"
          >
            <UInput v-model.number="state.day_of_month" type="number" min="1" max="28" />
          </UFormGroup>
          
          <UFormGroup label="Описание" name="description" class="col-span-full">
            <UTextarea v-model="state.description" placeholder="Дополнительная информация" />
          </UFormGroup>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Позиции счёта</h3>
            <UButton
              size="sm"
              icon="i-lucide-plus"
              variant="soft"
              @click="addItem"
            >
              Добавить позицию
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div v-for="(item, index) in state.items" :key="index" class="flex gap-4 items-start">
            <UFormGroup class="flex-1">
              <UInput v-model="item.name" placeholder="Наименование услуги/товара" />
            </UFormGroup>

            <UFormGroup class="w-24">
              <UInput v-model.number="item.quantity" type="number" min="1" placeholder="Кол-во" />
            </UFormGroup>

            <UFormGroup class="w-32">
              <UInput v-model.number="item.price" type="number" min="0" placeholder="Цена" step="0.01">
                <template #trailing>₽</template>
              </UInput>
            </UFormGroup>

            <div class="w-32 py-2 text-right font-mono">
              {{ new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(item.quantity * item.price) }}
            </div>

            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              :disabled="state.items.length === 1"
              @click="removeItem(index)"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end items-center gap-4 text-lg font-bold">
            <span>Итого:</span>
            <span>{{ new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(totalAmount) }}</span>
          </div>
        </template>
      </UCard>

      <div class="flex justify-end gap-4">
        <UButton type="submit" size="lg">
          Создать подписку
        </UButton>
      </div>
    </UForm>
  </div>
</template>
