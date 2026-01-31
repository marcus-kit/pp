<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { updateCustomerSchema } from '~/shared/schemas/customer'
import type { z } from 'zod'

definePageMeta({ 
  middleware: 'auth',
  layout: 'dashboard'
})

type Schema = z.output<typeof updateCustomerSchema>

const route = useRoute()
const router = useRouter()
const toast = useToast()

const customerId = route.params.id as string
const { data: customer, status, refresh } = await useFetch(`/api/customers/${customerId}`)

const editMode = ref(false)
const loading = ref(false)

const state = reactive({
  full_name: '',
  email: '',
  phone: '',
  inn: '',
  kpp: '',
  ogrn: '',
  legal_address: ''
})

function startEdit() {
  if (!customer.value) return
  state.full_name = customer.value.full_name
  state.email = customer.value.email || ''
  state.phone = customer.value.phone || ''
  state.inn = customer.value.inn || ''
  state.kpp = customer.value.kpp || ''
  state.ogrn = customer.value.ogrn || ''
  state.legal_address = customer.value.legal_address || ''
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await $fetch(`/api/customers/${customerId}`, { 
      method: 'PATCH', 
      body: event.data 
    })
    toast.add({ 
      title: 'Клиент обновлён', 
      color: 'success' 
    })
    editMode.value = false
    refresh()
  } catch (e: any) {
    toast.add({ 
      title: 'Ошибка', 
      description: e.data?.message || 'Не удалось обновить клиента',
      color: 'error' 
    })
  } finally {
    loading.value = false
  }
}

async function deleteCustomer() {
  if (!confirm('Удалить клиента? Это действие необратимо.')) return
  
  try {
    await $fetch(`/api/customers/${customerId}`, { method: 'DELETE' })
    toast.add({ 
      title: 'Клиент удалён', 
      color: 'success' 
    })
    router.push('/customers')
  } catch (e: any) {
    toast.add({ 
      title: 'Ошибка', 
      description: e.data?.message || 'Не удалось удалить клиента',
      color: 'error' 
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="status === 'pending'" class="space-y-4">
      <USkeleton class="h-8 w-64" />
      <USkeleton class="h-32 w-full" />
    </div>

    <div v-else-if="!customer" class="text-center py-12">
      <UIcon name="i-lucide-user-x" class="size-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold mb-2">Клиент не найден</h3>
      <p class="text-muted-foreground mb-4">Возможно, клиент был удалён</p>
      <UButton to="/customers" icon="i-lucide-arrow-left">
        К списку клиентов
      </UButton>
    </div>

    <template v-else>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UButton 
            icon="i-lucide-arrow-left" 
            variant="ghost" 
            color="neutral" 
            to="/customers" 
          />
          <div>
            <h1 class="text-2xl font-bold">{{ customer.full_name }}</h1>
            <p class="text-sm text-muted-foreground">ID: {{ customer.id }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton 
            v-if="!editMode"
            icon="i-lucide-pencil" 
            label="Редактировать" 
            variant="outline" 
            @click="startEdit" 
          />
          <UButton 
            icon="i-lucide-trash-2" 
            color="error" 
            variant="outline"
            @click="deleteCustomer" 
          />
        </div>
      </div>

      <UForm 
        v-if="editMode"
        :schema="updateCustomerSchema" 
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
            <UFormGroup label="ФИО / Название">
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
            @click="cancelEdit" 
          />
          <UButton 
            type="submit" 
            label="Сохранить" 
            icon="i-lucide-save" 
            :loading="loading" 
          />
        </div>
      </UForm>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-contact" />
              <span class="font-medium">Контакты</span>
            </div>
          </template>
          <dl class="space-y-3">
            <div v-if="customer.email">
              <dt class="text-sm text-muted-foreground">Email</dt>
              <dd class="font-medium">{{ customer.email }}</dd>
            </div>
            <div v-if="customer.phone">
              <dt class="text-sm text-muted-foreground">Телефон</dt>
              <dd class="font-medium">{{ customer.phone }}</dd>
            </div>
            <div v-if="!customer.email && !customer.phone" class="text-muted-foreground">
              Контакты не указаны
            </div>
          </dl>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-text" />
              <span class="font-medium">Реквизиты</span>
            </div>
          </template>
          <dl class="space-y-3">
            <div v-if="customer.inn">
              <dt class="text-sm text-muted-foreground">ИНН</dt>
              <dd class="font-medium font-mono">{{ customer.inn }}</dd>
            </div>
            <div v-if="customer.kpp">
              <dt class="text-sm text-muted-foreground">КПП</dt>
              <dd class="font-medium font-mono">{{ customer.kpp }}</dd>
            </div>
            <div v-if="customer.ogrn">
              <dt class="text-sm text-muted-foreground">ОГРН</dt>
              <dd class="font-medium font-mono">{{ customer.ogrn }}</dd>
            </div>
            <div v-if="customer.legal_address">
              <dt class="text-sm text-muted-foreground">Юридический адрес</dt>
              <dd class="font-medium">{{ customer.legal_address }}</dd>
            </div>
            <div v-if="!customer.inn && !customer.kpp && !customer.ogrn && !customer.legal_address" class="text-muted-foreground">
              Реквизиты не указаны
            </div>
          </dl>
        </UCard>
      </div>
    </template>
  </div>
</template>
