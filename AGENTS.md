# PP Invoicing System

PayPal-like инвойсинговая система для российского рынка.

## Stack

- **Framework**: Nuxt 4 + Nitro
- **UI**: Nuxt UI 4.4 + Tailwind CSS
- **Database**: PostgreSQL + Supabase (RLS enabled)
- **Auth**: Magic Link (Supabase Auth) — **ВРЕМЕННО ОТКЛЮЧЕНА**
- **Deploy**: Dokploy @ pp.doka.team

## Project Structure

```
app/
├── pages/           # Nuxt pages (auto-routing)
├── server/          # Nitro API + tasks + utils (см. app/server/AGENTS.md)
├── shared/          # Types, schemas, constants (см. app/shared/AGENTS.md)
├── components/      # Vue components
├── composables/     # Vue composables
├── middleware/      # Route middleware
├── layouts/         # Page layouts
└── assets/          # CSS, static files
sql/                 # Database migrations
tests/               # E2E tests
```

## Critical Rules

### Money: ALWAYS Kopeks
```typescript
// DB и API: копейки (integer)
// UI: рубли (отображение)
// Конвертация: onSubmit (рубли → копейки), formatCurrency (копейки → рубли)
total_amount: 150000  // = 1500.00 руб
```

### RLS: Server-Side merchant_id
```typescript
// НИКОГДА не доверяй merchant_id с клиента
const { data: merchant } = await client
  .from('merchants')
  .select('id')
  .eq('user_id', user.id)
  .single()

// Используй merchant.id для фильтрации
.eq('merchant_id', merchant.id)
```

### Invoice Numbers: Server-Generated Only
```typescript
// НИКОГДА не принимай номер счёта с клиента
const { data: invoiceNumber } = await client.rpc('generate_invoice_number', {
  merchant_id_param: merchant.id
})
```

### Dates Format
- `due_date`, `period_start`, `period_end`: `YYYY-MM-DD`
- `created_at`, `updated_at`: ISO timestamp
- Recurring day: 1-28 only (избегаем проблем с февралём)

### Supabase Clients
```typescript
// Авторизованные запросы (с RLS)
const client = await serverSupabaseClient<Database>(event)

// Публичные endpoints / scheduled tasks (обход RLS)
const client = await serverSupabaseServiceRole<Database>(event)
```

## API Conventions

Детали: `app/server/AGENTS.md`

```
api/
├── customers/     # CRUD клиентов
├── invoices/      # CRUD счетов + статусы
├── recurring/     # Повторяющиеся счета
├── merchant/      # Профиль мерчанта
├── stats/         # Dashboard статистика
└── public/        # Публичный доступ (без auth)
```

## Validation

Zod schemas в `app/shared/schemas/`:
- `createCustomerSchema`, `updateCustomerSchema`
- `createInvoiceSchema`, `updateInvoiceSchema`
- `createRecurringInvoiceSchema`, `updateRecurringInvoiceSchema`
- `updateMerchantSchema`

```typescript
const body = await readValidatedBody(event, (b) => createInvoiceSchema.parse(b))
```

## Error Handling

```typescript
throw createError({
  statusCode: 401,  // 400, 403, 404, 500
  statusMessage: 'Unauthorized'
})
```

## PDF & QR

- PDF: PDFKit, A4, шрифт Helvetica
- QR: ГОСТ Р 56042-2014, формат ST00012 (UTF-8)
- Pipe символ (|) в значениях QR экранировать

## Scheduled Tasks

```typescript
// nuxt.config.ts
scheduledTasks: {
  '0 2 * * *': ['process-recurring']  // 2:00 AM daily
}
```

## Environment

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

## File Naming

- API: `[resource]/index.[method].ts`, `[resource]/[id].[method].ts`
- Pages: `[resource]/index.vue`, `[resource]/[id].vue`
- Schemas: `[resource].ts` в `app/shared/schemas/`

## Known Issues

### Auth отключена

Magic Link авторизация временно отключена из-за проблем с PKCE flow:
- PKCE требует сохранения `code_verifier` в cookies при отправке OTP
- При переходе по ссылке из email `code_verifier` не находится
- Ошибка: "PKCE code verifier not found in storage"

**Что пробовали:**
- `@nuxtjs/supabase` с `useSsrCookies: true` (default)
- Implicit flow с `flowType: 'implicit'`
- Ручной `exchangeCodeForSession(code)`

**Нужно разобраться:**
- Правильная настройка cookies для SSR
- Возможно проблема в Cloudflare / Traefik прокси
- Альтернатива: OAuth провайдеры (Google, GitHub)
