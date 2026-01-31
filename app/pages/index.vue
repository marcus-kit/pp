<template>
  <div class="text-center py-20">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">PP Invoicing</h1>
    <p class="text-xl text-gray-600 mb-8">Простая система выставления счетов для предпринимателей</p>
    <div class="flex justify-center gap-4">
      <UButton v-if="user" to="/dashboard" size="xl" color="primary">Перейти в кабинет</UButton>
      <UButton v-else to="/auth/login" size="xl" color="primary">Войти</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>
