<template>
  <ClientOnly>
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
    <template #fallback>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
  </ClientOnly>
</template>
