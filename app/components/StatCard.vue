<template>
  <UCard data-testid="stat-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ value }}</p>
      </div>
      <div :class="['p-3 rounded-full', iconBgColor]">
        <UIcon :name="icon" :class="['w-6 h-6', iconColor]" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string
  icon: string
  iconColor: string
  iconBgColor: string
}>()
</script>
