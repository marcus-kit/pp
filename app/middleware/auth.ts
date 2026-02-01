export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  
  // E2E тесты: bypass auth если флаг установлен
  if (config.public.e2eTest === 'true' && import.meta.dev) {
    return
  }

  const user = useSupabaseUser()

  // Публичные маршруты, доступные без аутентификации
  const publicRoutes = ['/auth/login', '/auth/callback', '/auth/confirm']

  // Если маршрут публичный - пропускаем проверку
  if (publicRoutes.includes(to.path)) {
    return
  }

  if (!user.value) {
    return navigateTo('/auth/login')
  }
})
