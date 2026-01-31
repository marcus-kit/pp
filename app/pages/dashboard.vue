<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Навигация -->
    <nav class="bg-slate-800 border-b border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl font-bold text-white">PP Invoicing</h1>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Выход
          </button>
        </div>
      </div>
    </nav>

    <!-- Содержимое -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
        <h2 class="text-2xl font-bold text-white mb-4">Добро пожаловать!</h2>
        <p class="text-slate-400 mb-6">
          Вы успешно вошли в систему. Это главная страница приложения.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h3 class="text-lg font-semibold text-white mb-2">Счета</h3>
            <p class="text-slate-400">Управляйте счетами и платежами</p>
          </div>
          <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h3 class="text-lg font-semibold text-white mb-2">Клиенты</h3>
            <p class="text-slate-400">Ведите базу клиентов</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const config = useRuntimeConfig()

    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey
    )

    await supabase.auth.signOut()
    await router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>
