// Конфигурация Nuxt для PayPal-like invoicing системы
export default defineNuxtConfig({
  compatibilityDate: '2025-01-30',

  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/supabase'
  ],

  // Подключаем CSS с Tailwind и Nuxt UI
  css: ['~/assets/css/main.css'],

  // Nuxt UI - настройки
  icon: {
    collections: ['lucide']
  },

  // Nitro server
  nitro: {
    preset: 'node-server',
    experimental: {
      websocket: true,
      tasks: true
    },
    scheduledTasks: {
      '0 2 * * *': ['process-recurring']
    }
  },

  // Runtime config
  runtimeConfig: {
    // Серверные переменные (не публичные)
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,

    // Публичные переменные (доступны на клиенте)
    public: {
      appName: 'PP Invoicing',
      appVersion: '1.0.0',
      supabaseUrl: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
      supabaseKey: process.env.SUPABASE_KEY || 'placeholder-key'
    }
  },

  supabase: {
    // Отключаем SSR cookies чтобы использовать implicit flow
    // (PKCE требует сохранения code_verifier, что не работает при переходе из email)
    useSsrCookies: false,
    clientOptions: {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true
      }
    },
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      include: undefined,
      exclude: ['/', '/i/*'],
      saveRedirectToCookie: true
    }
  },

  // DevTools
  devtools: { enabled: true }
})
