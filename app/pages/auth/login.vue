<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">PP Invoicing</h1>
        <p class="text-slate-400">Вход в личный кабинет</p>
      </div>

      <!-- Карточка формы -->
      <div class="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
        <!-- Статус сообщение -->
        <Transition name="fade">
          <div v-if="message" :class="['mb-6 p-4 rounded-lg text-sm', messageType === 'success' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700' : 'bg-red-900/30 text-red-300 border border-red-700']">
            {{ message }}
          </div>
        </Transition>

        <!-- Форма -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email input -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-300 mb-2">
              Email адрес
            </label>
            <UInput
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              :disabled="loading"
              class="w-full"
            />
          </div>

          <!-- Submit button -->
          <UButton
            type="submit"
            :loading="loading"
            :disabled="loading || !email"
            class="w-full"
            size="lg"
          >
            <template v-if="!loading">
              Отправить ссылку входа
            </template>
            <template v-else>
              Отправка...
            </template>
          </UButton>
        </form>

        <!-- Информация -->
        <div class="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <p class="text-xs text-slate-400">
            На указанный email будет отправлена ссылка для входа. Проверьте папку спама, если письмо не пришло.
          </p>
        </div>
      </div>

      <!-- Подвал -->
      <div class="text-center mt-8 text-slate-500 text-sm">
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
