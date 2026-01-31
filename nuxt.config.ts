// Конфигурация Nuxt для PayPal-like invoicing системы
export default defineNuxtConfig({
  compatibilityDate: '2025-01-30',

  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vueuse/nuxt'
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
      websocket: true
    }
  },

  // Runtime config
  runtimeConfig: {
    // Серверные переменные (не публичные)
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,

    // Supabase
    supabaseUrl: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
    supabaseKey: process.env.SUPABASE_KEY || 'placeholder-key',

    // Публичные переменные (доступны на клиенте)
    public: {
      appName: 'PP Invoicing',
      appVersion: '1.0.0'
    }
  },

  // DevTools
  devtools: { enabled: true }
})
