# PP Invoicing System

PayPal-like инвойсинговая система для российского рынка.

**Generated:** 2026-02-01 | **Commit:** 95793b7 | **Branch:** main

## Stack

- **Framework**: Nuxt 4 + Nitro
- **UI**: Nuxt UI 4.4 + Tailwind CSS 4
- **Database**: PostgreSQL + Supabase (RLS enabled)
- **Auth**: Magic Link (Supabase Auth) — **ВРЕМЕННО ОТКЛЮЧЕНА**
- **Deploy**: Dokploy @ pp.doka.team
- **Icons**: Lucide (i-lucide-*)
- **Theme**: PayPal Blue (#0070BA), auto dark mode

## Project Structure

```
pp/
├── app/
│   ├── pages/           # Nuxt pages (auto-routing)
│   ├── server/          # Nitro API + tasks + utils (см. app/server/AGENTS.md)
│   ├── shared/          # Types, schemas, constants (см. app/shared/AGENTS.md)
│   ├── components/      # Vue components (StatCard)
│   ├── composables/     # useFormatters() - money/date formatting
│   ├── middleware/      # auth.ts, onboarding.global.ts
│   ├── layouts/         # default.vue with NavigationMenu + Drawer
│   └── assets/css/      # Tailwind main.css
├── sql/                 # Database migrations
└── .sisyphus/           # Work plans and notepads
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| API endpoints | `app/server/api/` | See `app/server/AGENTS.md` |
| Zod schemas | `app/shared/schemas/` | See `app/shared/AGENTS.md` |
| DB types | `app/shared/types/database.ts` | Supabase generated |
| Page forms | `app/pages/*/new.vue`, `[id].vue` | Invoice, Customer, Recurring |
| PDF generation | `app/server/utils/pdf-generator.ts` | PDFKit, A4 |
| QR codes | `app/server/utils/qr-sbp.ts` | ГОСТ Р 56042-2014 |
| Theme config | `app/app.config.ts` | Colors: blue primary |
| Layout | `app/layouts/default.vue` | NavigationMenu + mobile Drawer |

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
├── merchant/      # Профиль мерчанта (singular - один на user)
├── stats/         # Dashboard статистика
├── public/        # Публичный доступ (без auth)
└── invoice/[token]/ # PDF по токену (публичный)
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

## Frontend Patterns

### Data Fetching
```typescript
// Списки - useLazyFetch (не блокирует навигацию)
const { data, status, refresh } = useLazyFetch('/api/invoices', {
  query: { page, search },
  watch: [page, search]
})

// Детали - useFetch (блокирует до загрузки)
const { data } = await useFetch(`/api/invoices/${id}`)

// Мутации - $fetch
await $fetch('/api/invoices', { method: 'POST', body })
```

### Notifications & Navigation
```typescript
const toast = useToast()
const router = useRouter()

toast.add({ title: 'Успешно сохранено' })
toast.add({ title: 'Ошибка', description: error.message, color: 'red' })
router.push('/invoices')
```

### Form Pattern
```vue
<UForm :schema="createInvoiceSchema" :state="state" @submit="onSubmit">
  <UFormGroup label="Название" name="name" required>
    <UInput v-model="state.name" />
  </UFormGroup>
</UForm>
```

### Status Colors
```typescript
const statusColors: Record<string, string> = {
  draft: 'gray', sent: 'blue', viewed: 'amber',
  paid: 'green', cancelled: 'red', overdue: 'red'
}
```

## UI Components (Nuxt UI)

**Layout**: UContainer, UCard, UNavigationMenu, UDrawer
**Forms**: UForm, UFormGroup, UInput, UTextarea, USelect, USelectMenu
**Data**: UTable, UPagination, UBadge, USkeleton
**Actions**: UButton, UDropdown, UIcon
**Icons**: Lucide - `icon="i-lucide-plus"`, `icon="i-lucide-trash-2"`

## Error Handling

```typescript
throw createError({
  statusCode: 401,  // 400, 403, 404, 500
  statusMessage: 'Unauthorized'
})
```

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
SUPABASE_KEY=
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

## Commands

```bash
bun run dev      # Development server
bun run build    # Production build
bun run preview  # Preview production
```
