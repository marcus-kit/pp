<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-700 mb-4">
          <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Проверьте email</h1>
        <p class="text-slate-400">Ссылка для входа отправлена</p>
      </div>

      <!-- Карточка -->
      <div class="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 space-y-6">
        <!-- Инструкция -->
        <div class="space-y-4">
          <p class="text-slate-300">
            Мы отправили ссылку для входа на ваш email адрес. Нажмите на ссылку в письме, чтобы войти в аккаунт.
          </p>
          <div class="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p class="text-sm text-slate-400 mb-2">
              <strong>Совет:</strong> Если письмо не пришло:
            </p>
            <ul class="text-sm text-slate-400 space-y-1 ml-4">
              <li>• Проверьте папку спама</li>
              <li>• Убедитесь, что email введен правильно</li>
              <li>• Подождите несколько минут</li>
            </ul>
          </div>
        </div>

        <!-- Кнопка повтора -->
        <div class="pt-4 border-t border-slate-700">
          <NuxtLink
            to="/auth/login"
            class="block w-full text-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Вернуться на страницу входа
          </NuxtLink>
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
// Страница подтверждения email
// Показывается после отправки Magic Link
</script>
