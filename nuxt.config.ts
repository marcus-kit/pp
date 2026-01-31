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

  // TODO: Авторизация временно отключена — Magic Link не работает из-за проблем с PKCE/cookies
  // Нужно разобраться с настройкой Supabase Auth для SSR
  supabase: {
    redirect: false
  },

  // DevTools
  devtools: { enabled: true }
})
