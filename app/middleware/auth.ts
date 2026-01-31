export default defineNuxtRouteMiddleware(async (to, from) => {
  // Публичные маршруты, доступные без аутентификации
  const publicRoutes = ['/auth/login', '/auth/callback', '/auth/confirm']

  // Если маршрут публичный - пропускаем проверку
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Для остальных маршрутов проверяем аутентификацию
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const config = useRuntimeConfig()

    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Если нет сессии - перенаправляем на login
    if (!session) {
      return navigateTo('/auth/login')
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/auth/login')
  }
})
