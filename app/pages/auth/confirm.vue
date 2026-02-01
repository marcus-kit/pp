<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 sm:px-6 lg:px-8" data-testid="confirm-page">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
           <UIcon name="i-lucide-check" class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Проверьте email
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Ссылка для входа отправлена
        </p>
      </div>

      <!-- Card -->
      <UCard class="w-full" :ui="{ body: { base: 'space-y-6' } }">
        <div class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            Мы отправили ссылку для входа на ваш email адрес. Нажмите на ссылку в письме, чтобы войти в аккаунт.
          </p>
          
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Если письмо не пришло:
            </p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
              <li>Проверьте папку спама</li>
              <li>Убедитесь, что email введен правильно</li>
              <li>Подождите несколько минут</li>
            </ul>
          </div>
        </div>

        <template #footer>
          <UButton
            to="/auth/login"
            block
            color="gray"
            variant="solid"
            data-testid="back-to-login-btn"
          >
            Вернуться на страницу входа
          </UButton>
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
// Страница подтверждения email
// Показывается после отправки Magic Link
</script>
