<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <header class="bg-white dark:bg-gray-900 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <!-- Mobile Menu Button -->
              <UButton
                icon="i-lucide-menu"
                color="neutral"
                variant="ghost"
                class="sm:hidden mr-2"
                @click="isMobileMenuOpen = true"
                data-testid="mobile-menu-button"
              />
              <NuxtLink to="/" class="text-2xl font-bold text-primary-600">PP Invoicing</NuxtLink>
            </div>
            <!-- Desktop Navigation -->
            <ClientOnly>
              <div class="hidden sm:ml-6 sm:flex sm:items-center">
                <UNavigationMenu :items="items" orientation="horizontal" class="gap-4" />
              </div>
            </ClientOnly>
          </div>
          <div class="flex items-center gap-4">
            <NuxtLink to="/settings" class="text-gray-500 hover:text-gray-700" title="Настройки">
              <UIcon name="i-lucide-settings" class="w-6 h-6" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer -->
    <ClientOnly>
      <UDrawer v-model:open="isMobileMenuOpen" direction="left">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-xl font-bold text-primary-600">Меню</span>
             <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isMobileMenuOpen = false" />
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
              <UButton to="/settings" color="neutral" variant="ghost" icon="i-lucide-settings" label="Настройки" class="justify-start" @click="isMobileMenuOpen = false" />
           </div>
        </template>
      </UDrawer>
    </ClientOnly>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const isMobileMenuOpen = ref(false)

const items = [
  {
    label: 'Обзор',
    to: '/dashboard',
    icon: 'i-lucide-home'
  },
  {
    label: 'Счета',
    to: '/invoices',
    icon: 'i-lucide-file-text'
  },
  {
    label: 'Клиенты',
    to: '/customers',
    icon: 'i-lucide-users'
  },
  {
    label: 'Подписки',
    to: '/recurring',
    icon: 'i-lucide-refresh-cw'
  }
]


</script>
