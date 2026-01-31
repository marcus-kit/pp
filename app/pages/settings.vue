<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { updateMerchantSchema } from '~/shared/schemas/merchant'
import type { Merchant } from '~/shared/types/database'

definePageMeta({
  title: 'Настройки профиля',
  middleware: ['auth']
})

const toast = useToast()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Form state
const form = reactive({
  merchant_type: 'company' as 'individual' | 'self_employed' | 'company',
  full_name: '',
  email: '',
  phone: '',
  inn: '',
  kpp: '',
  ogrn: '',
  legal_address: '',
  bank_name: '',
  bank_bic: '',
  bank_account: '',
  bank_corr_account: '',
  logo_url: ''
})

// Fetch existing profile
const { data: profile, status, refresh } = await useFetch<Merchant>('/api/merchant/profile')

// Initialize form
watch(profile, (newProfile) => {
  if (newProfile) {
    form.merchant_type = newProfile.merchant_type || 'company'
    form.full_name = newProfile.full_name || ''
    form.email = newProfile.email || user.value?.email || ''
    form.phone = newProfile.phone || ''
    form.inn = newProfile.inn || ''
    form.kpp = newProfile.kpp || ''
    form.ogrn = newProfile.ogrn || ''
    form.legal_address = newProfile.legal_address || ''
    form.bank_name = newProfile.bank_name || ''
    form.bank_bic = newProfile.bank_bic || ''
    form.bank_account = newProfile.bank_account || ''
    form.bank_corr_account = newProfile.bank_corr_account || ''
    form.logo_url = newProfile.logo_url || ''
  } else if (user.value?.email) {
    form.email = user.value.email
  }
}, { immediate: true })

// Logo Upload
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement>()

async function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Ошибка', description: 'Выберите изображение', color: 'error' })
    return
  }

  isUploading.value = true
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.value?.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    form.logo_url = publicUrl
    toast.add({ title: 'Логотип загружен', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Ошибка загрузки', description: error.message, color: 'error' })
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeLogo() {
  form.logo_url = ''
}

// Save
const isSaving = ref(false)

async function saveProfile(event: FormSubmitEvent<z.infer<typeof updateMerchantSchema>>) {
  isSaving.value = true
  try {
    await $fetch('/api/merchant/profile', {
      method: 'PATCH',
      body: event.data
    })
    toast.add({ title: 'Профиль сохранён', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Ошибка сохранения', description: error.statusMessage || error.message, color: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Настройки профиля</h1>
      <p class="text-gray-500">Управляйте информацией о вашей компании и реквизитами</p>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="animate-spin size-8 text-primary" />
    </div>

    <UForm v-else :schema="updateMerchantSchema" :state="form" class="space-y-6" @submit="saveProfile">
      <!-- Основная информация -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-building" class="size-5" />
            <h2 class="font-semibold">Основная информация</h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Тип организации" name="merchant_type" class="md:col-span-2">
            <USelect
              v-model="form.merchant_type"
              :items="[
                { label: 'Юридическое лицо', value: 'company' },
                { label: 'Индивидуальный предприниматель', value: 'individual' },
                { label: 'Самозанятый', value: 'self_employed' }
              ]"
              option-attribute="label"
              value-attribute="value"
            />
          </UFormField>

          <UFormField label="Название компании / ФИО" name="full_name" required class="md:col-span-2">
            <UInput v-model="form.full_name" placeholder="ООО «Ромашка»" />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput v-model="form.email" type="email" />
          </UFormField>

          <UFormField label="Телефон" name="phone">
            <UInput v-model="form.phone" placeholder="+7 (999) 000-00-00" />
          </UFormField>

          <UFormField label="ИНН" name="inn">
            <UInput v-model="form.inn" placeholder="1234567890" />
          </UFormField>

          <UFormField label="КПП" name="kpp">
            <UInput v-model="form.kpp" placeholder="123456789" />
          </UFormField>

          <UFormField label="ОГРН" name="ogrn">
            <UInput v-model="form.ogrn" placeholder="1234567890123" />
          </UFormField>

          <UFormField label="Юридический адрес" name="legal_address" class="md:col-span-2">
            <UTextarea v-model="form.legal_address" placeholder="г. Москва, ул. Пушкина, д. 1" />
          </UFormField>
        </div>
      </UCard>

      <!-- Банковские реквизиты -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-landmark" class="size-5" />
            <h2 class="font-semibold">Банковские реквизиты</h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Название банка" name="bank_name" class="md:col-span-2">
            <UInput v-model="form.bank_name" placeholder="ПАО Сбербанк" />
          </UFormField>

          <UFormField label="БИК" name="bank_bic">
            <UInput v-model="form.bank_bic" placeholder="044525225" maxlength="9" />
          </UFormField>

          <UFormField label="Расчетный счет" name="bank_account">
            <UInput v-model="form.bank_account" placeholder="40702810..." maxlength="20" />
          </UFormField>

          <UFormField label="Корр. счет" name="bank_corr_account">
            <UInput v-model="form.bank_corr_account" placeholder="30101810..." maxlength="20" />
          </UFormField>
        </div>
      </UCard>

      <!-- Логотип -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-image" class="size-5" />
            <h2 class="font-semibold">Логотип</h2>
          </div>
        </template>

        <div class="flex items-start gap-6">
          <div v-if="form.logo_url" class="relative group">
            <img :src="form.logo_url" alt="Logo" class="h-24 w-24 object-contain border rounded-lg bg-white" />
            <button
              type="button"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeLogo"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
          <div v-else class="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
            <UIcon name="i-lucide-image" class="size-8" />
          </div>

          <div class="flex-1">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileSelect"
            />
            <UButton
              color="white"
              variant="solid"
              icon="i-lucide-upload"
              :loading="isUploading"
              @click="fileInput?.click()"
            >
              Загрузить логотип
            </UButton>
            <p class="text-xs text-gray-500 mt-2">
              PNG, JPG, SVG до 2MB. Будет отображаться в счетах.
            </p>
          </div>
        </div>
      </UCard>

      <div class="flex justify-end">
        <UButton type="submit" color="primary" size="lg" :loading="isSaving">
          Сохранить изменения
        </UButton>
      </div>
    </UForm>
  </div>
</template>
