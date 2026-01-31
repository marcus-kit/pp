<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Загрузка -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-6">
          <svg class="w-8 h-8 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Обработка входа</h1>
        <p class="text-slate-400">Пожалуйста, подождите...</p>
      </div>

      <!-- Сообщение об ошибке -->
      <Transition name="fade">
        <div v-if="error" class="mt-8 p-4 bg-red-900/30 text-red-300 border border-red-700 rounded-lg text-sm">
          <p class="font-medium mb-2">{{ error }}</p>
          <NuxtLink to="/auth/login" class="text-red-200 hover:text-red-100 underline">
            Вернуться на страницу входа
          </NuxtLink>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const error = ref('')

onMounted(async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const config = useRuntimeConfig()

    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey
    )

    // Обработка callback от Supabase
    const { data, error: authError } = await supabase.auth.getSession()

    if (authError) {
      error.value = authError.message || 'Ошибка при обработке входа'
      return
    }

    if (data?.session) {
      // Успешный вход - перенаправляем на dashboard
      await router.push('/dashboard')
    } else {
      // Нет сессии - перенаправляем на confirm
      await router.push('/auth/confirm')
    }
  } catch (err) {
    error.value = 'Произошла ошибка при обработке входа'
    console.error(err)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
