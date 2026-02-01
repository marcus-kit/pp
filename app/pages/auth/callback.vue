<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4" data-testid="callback-page">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
           <UIcon name="i-lucide-refresh-cw" class="w-8 h-8 text-primary-500 animate-spin" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Обработка входа</h1>
        <p class="text-gray-500 dark:text-gray-400">Пожалуйста, подождите...</p>
      </div>

      <Transition name="fade">
        <UAlert
          v-if="error"
          color="red"
          variant="subtle"
          title="Ошибка входа"
          :description="error"
           icon="i-lucide-alert-circle"
          data-testid="callback-error"
        >
          <template #footer>
            <UButton
              to="/auth/login"
              variant="link"
              color="red"
              class="mt-2 p-0"
            >
              Вернуться на страницу входа
            </UButton>
          </template>
        </UAlert>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const router = useRouter()
const supabase = useSupabaseClient()
const error = ref('')

onMounted(async () => {
  try {
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      error.value = sessionError.message || 'Ошибка при получении сессии'
      return
    }

    if (data?.session) {
      await router.push('/dashboard')
    } else {
      error.value = 'Сессия не найдена. Попробуйте войти снова.'
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
