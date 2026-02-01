<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 sm:px-6 lg:px-8" data-testid="login-page">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          PP Invoicing
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Вход в личный кабинет
        </p>
      </div>

      <!-- Form Card -->
      <UCard class="w-full" :ui="{ body: { base: 'space-y-6' } }">
        <!-- Status Message -->
        <Transition name="fade">
          <UAlert
            v-if="message"
            :color="messageType === 'success' ? 'emerald' : 'red'"
            variant="subtle"
            :title="message"
            :icon="messageType === 'success' ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
            data-testid="login-message"
          />
        </Transition>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <UFormGroup label="Email адрес" name="email" required>
            <UInput
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              icon="i-lucide-mail"
              :disabled="loading"
              data-testid="email-input"
              autocomplete="email"
            />
          </UFormGroup>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
            :disabled="loading || !email"
            data-testid="submit-btn"
          >
            {{ loading ? 'Отправка...' : 'Отправить ссылку входа' }}
          </UButton>
        </form>

        <template #footer>
          <p class="text-xs text-center text-gray-500 dark:text-gray-400">
            На указанный email будет отправлена ссылка для входа. Проверьте папку спама, если письмо не пришло.
          </p>
        </template>
      </UCard>

      <!-- Footer -->
      <div class="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© 2025 PP Invoicing. Все права защищены.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false
})

const router = useRouter()
const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const supabase = useSupabaseClient()

const handleLogin = async () => {
  if (!email.value) return

  loading.value = true
  message.value = ''

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      message.value = error.message || 'Ошибка при отправке ссылки'
      messageType.value = 'error'
    } else {
      message.value = 'Ссылка для входа отправлена на ваш email!'
      messageType.value = 'success'
      email.value = ''
    }
  } catch (err) {
    message.value = 'Произошла ошибка. Попробуйте позже.'
    messageType.value = 'error'
    console.error(err)
  } finally {
    loading.value = false
  }
}
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
