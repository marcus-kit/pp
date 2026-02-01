<script setup lang="ts">
import type { Customer } from '~/shared/types/database'

definePageMeta({ 
  middleware: 'auth'
})

const router = useRouter()

const page = ref(1)
const limit = ref(20)
const searchQuery = ref('')

const { data, status, refresh } = await useFetch('/api/customers', {
  query: {
    page,
    limit,
    query: searchQuery
  },
  watch: [page, searchQuery]
})

const columns = [
  { key: 'full_name', label: 'ФИО / Название' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Телефон' },
  { key: 'actions', label: '' }
]

async function deleteCustomer(id: string) {
  if (!confirm('Удалить клиента?')) return
  
  try {
    await $fetch(`/api/customers/${id}`, { method: 'DELETE' })
    refresh()
  } catch (e) {
    console.error('Delete error:', e)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Клиенты</h1>
        <p class="text-muted-foreground">Управление базой клиентов</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        to="/customers/new"
      >
        Добавить клиента
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-4 px-4 py-3.5 border-b">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по имени или email..."
          icon="i-lucide-search"
          class="w-64"
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
      >
        <template #full_name-data="{ row }">
          <NuxtLink
            :to="`/customers/${row.id}`"
            class="font-medium text-primary hover:underline"
          >
            {{ row.full_name }}
          </NuxtLink>
        </template>

        <template #email-data="{ row }">
          <span v-if="row.email">{{ row.email }}</span>
          <span v-else class="text-muted-foreground">—</span>
        </template>

        <template #phone-data="{ row }">
          <span v-if="row.phone">{{ row.phone }}</span>
          <span v-else class="text-muted-foreground">—</span>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="router.push(`/customers/${row.id}`)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              @click="deleteCustomer(row.id)"
            />
          </div>
        </template>
      </UTable>

      <div v-if="data?.items?.length === 0 && status !== 'pending'" class="p-8 text-center">
        <UIcon name="i-lucide-users" class="size-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">Клиенты не найдены</h3>
        <p class="text-muted-foreground mb-4">Добавьте первого клиента</p>
        <UButton to="/customers/new" icon="i-lucide-plus">
          Добавить клиента
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
