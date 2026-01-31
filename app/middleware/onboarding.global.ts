export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  if (!user.value) return

  if (to.path === '/settings' || to.path.startsWith('/auth')) return

  const isProfileComplete = useState<boolean>('isProfileComplete')
  
  if (isProfileComplete.value === true) return

  const client = useSupabaseClient()
  
  const { data, error } = await client
    .from('merchants')
    .select('full_name, inn')
    .eq('user_id', user.value.id)
    .single()

  if (error || !data || !data.full_name || !data.inn) {
    isProfileComplete.value = false
    return navigateTo('/settings?onboarding=true')
  }

  isProfileComplete.value = true
})
