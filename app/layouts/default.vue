<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <!-- Mobile Menu Button -->
              <UButton
                v-if="user"
                icon="i-heroicons-bars-3"
                color="neutral"
                variant="ghost"
                class="sm:hidden mr-2"
                @click="isMobileMenuOpen = true"
                data-testid="mobile-menu-button"
              />
              <NuxtLink to="/" class="text-2xl font-bold text-primary-600">PP Invoicing</NuxtLink>
            </div>
            <!-- Desktop Navigation -->
            <div class="hidden sm:ml-6 sm:flex sm:items-center" v-if="user">
              <UNavigationMenu :items="items" orientation="horizontal" class="gap-4" />
            </div>
          </div>
          <div class="flex items-center">
            <div v-if="user" class="flex items-center gap-4">
              <NuxtLink to="/settings" class="text-gray-500 hover:text-gray-700" title="Настройки">
                <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6" />
              </NuxtLink>
              <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-right-on-rectangle" @click="logout" title="Выйти" />
            </div>
            <div v-else>
              <UButton to="/auth/login" color="primary" variant="solid">Войти</UButton>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer -->
    <UDrawer v-model:open="isMobileMenuOpen" direction="left">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-primary-600">Меню</span>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isMobileMenuOpen = false" />
        </div>
      </template>
      
      <template #body>
        <UNavigationMenu 
          :items="items" 
          orientation="vertical" 
          class="flex-col gap-2" 
          :ui="{ link: 'w-full justify-start' }"
          @click="isMobileMenuOpen = false" 
        />
      </template>
      
      <template #footer>
        <div class="flex flex-col gap-2">
           <UButton to="/settings" color="neutral" variant="ghost" icon="i-heroicons-cog-6-tooth" label="Настройки" class="justify-start" @click="isMobileMenuOpen = false" />
           <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-right-on-rectangle" label="Выйти" class="justify-start" @click="logout" />
        </div>
      </template>
    </UDrawer>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

const isMobileMenuOpen = ref(false)

const items = computed(() => [
  {
    label: 'Обзор',
    to: '/dashboard',
    icon: 'i-heroicons-home'
  },
  {
    label: 'Счета',
    to: '/invoices',
    icon: 'i-heroicons-document-text'
  },
  {
    label: 'Клиенты',
    to: '/customers',
    icon: 'i-heroicons-users'
  },
  {
    label: 'Подписки',
    to: '/recurring',
    icon: 'i-heroicons-arrow-path'
  }
])

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/auth/login')
  isMobileMenuOpen.value = false
}
</script>
