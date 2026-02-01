export default defineNuxtRouteMiddleware((to) => {
  // TODO: Временно отключена авторизация для разработки
  // Удалить эту строку когда auth будет настроена
  return

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
