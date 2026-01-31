<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="text-2xl font-bold text-primary-600">PP Invoicing</NuxtLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8" v-if="user">
              <NuxtLink to="/dashboard" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" active-class="border-primary-500 text-gray-900">
                Обзор
              </NuxtLink>
              <NuxtLink to="/invoices" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" active-class="border-primary-500 text-gray-900">
                Счета
              </NuxtLink>
              <NuxtLink to="/customers" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" active-class="border-primary-500 text-gray-900">
                Клиенты
              </NuxtLink>
              <NuxtLink to="/recurring" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" active-class="border-primary-500 text-gray-900">
                Подписки
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center">
            <div v-if="user" class="flex items-center gap-4">
              <NuxtLink to="/settings" class="text-gray-500 hover:text-gray-700" title="Настройки">
                <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6" />
              </NuxtLink>
              <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-right-on-rectangle" @click="logout" title="Выйти" />
            </div>
            <div v-else>
              <UButton to="/auth/login" color="primary" variant="solid">Войти</UButton>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/auth/login')
}
</script>
