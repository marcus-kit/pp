<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { createCustomerSchema } from '~/shared/schemas/customer'
import type { z } from 'zod'

definePageMeta({ 
  middleware: 'auth',
  layout: 'dashboard'
})

type Schema = z.output<typeof createCustomerSchema>

const router = useRouter()
const toast = useToast()

const state = reactive({
  full_name: '',
  email: '',
  phone: '',
  inn: '',
  kpp: '',
  ogrn: '',
  legal_address: ''
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const customer = await $fetch('/api/customers', { 
      method: 'POST', 
      body: event.data 
    })
    toast.add({ 
      title: 'Клиент создан', 
      color: 'success' 
    })
    router.push(`/customers/${customer.id}`)
  } catch (e: any) {
    toast.add({ 
      title: 'Ошибка', 
      description: e.data?.message || 'Не удалось создать клиента',
      color: 'error' 
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <UButton 
        icon="i-lucide-arrow-left" 
        variant="ghost" 
        color="neutral" 
        to="/customers" 
      />
      <div>
        <h1 class="text-2xl font-bold">Новый клиент</h1>
        <p class="text-sm text-muted-foreground">Заполните данные клиента</p>
      </div>
    </div>

    <UForm 
      :schema="createCustomerSchema" 
      :state="state" 
      class="space-y-6" 
      @submit="onSubmit"
    >
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user-circle" class="text-primary" />
            <span class="font-medium">Основные данные</span>
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="ФИО / Название" required>
            <UInput
              v-model="state.full_name"
              placeholder="Иванов Иван Иванович"
              icon="i-lucide-user"
            />
          </UFormGroup>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Email">
              <UInput
                v-model="state.email"
                type="email"
                placeholder="email@example.com"
                icon="i-lucide-mail"
              />
            </UFormGroup>
            <UFormGroup label="Телефон">
              <UInput
                v-model="state.phone"
                placeholder="+7 (900) 123-45-67"
                icon="i-lucide-phone"
              />
            </UFormGroup>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="text-primary" />
            <span class="font-medium">Реквизиты</span>
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="ИНН">
            <UInput
              v-model="state.inn"
              placeholder="1234567890"
              maxlength="12"
            />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="КПП">
              <UInput
                v-model="state.kpp"
                placeholder="123456789"
                maxlength="9"
              />
            </UFormGroup>
            <UFormGroup label="ОГРН">
              <UInput
                v-model="state.ogrn"
                placeholder="1234567890123"
                maxlength="15"
              />
            </UFormGroup>
          </div>
          <UFormGroup label="Юридический адрес">
            <UTextarea
              v-model="state.legal_address"
              placeholder="г. Москва, ул. Ленина, д. 1"
              :rows="2"
            />
          </UFormGroup>
        </div>
      </UCard>

      <div class="flex justify-end gap-3 pt-2">
        <UButton 
          label="Отмена" 
          variant="ghost" 
          color="neutral" 
          to="/customers" 
        />
        <UButton 
          type="submit" 
          label="Создать клиента" 
          icon="i-lucide-user-plus" 
          :loading="loading" 
        />
      </div>
    </UForm>
  </div>
</template>
