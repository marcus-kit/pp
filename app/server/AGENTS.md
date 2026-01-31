# Server Directory

Nitro server: API endpoints, scheduled tasks, utilities.

## Structure

```
server/
├── api/           # REST endpoints
│   ├── customers/ # CRUD клиентов
│   ├── invoices/  # CRUD счетов
│   ├── recurring/ # Повторяющиеся счета
│   ├── merchant/  # Профиль мерчанта
│   ├── stats/     # Dashboard данные
│   └── public/    # Без аутентификации
├── tasks/         # Scheduled tasks (Nitro)
└── utils/         # Server utilities
```

## API Endpoint Pattern

```typescript
// api/[resource]/index.get.ts - список
// api/[resource]/index.post.ts - создание
// api/[resource]/[id].get.ts - один элемент
// api/[resource]/[id].patch.ts - обновление
// api/[resource]/[id].delete.ts - удаление
```

## Authentication

```typescript
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const client = await serverSupabaseClient<Database>(event)
  
  // Получаем merchant_id текущего пользователя
  const { data: merchant } = await client
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (!merchant) {
    throw createError({ statusCode: 403, statusMessage: 'Merchant profile not found' })
  }
  
  // Теперь используем merchant.id для фильтрации
})
```

## Public Endpoints

```typescript
// api/public/* - без аутентификации
export default defineEventHandler(async (event) => {
  // Используем service role для обхода RLS
  const client = await serverSupabaseServiceRole<Database>(event)
  
  const token = getRouterParam(event, 'token')
  // ...
})
```

## Validation

```typescript
import { createCustomerSchema } from '~/shared/schemas/customer'

// Вариант 1: parse (выбрасывает ошибку)
const body = await readValidatedBody(event, (b) => createCustomerSchema.parse(b))

// Вариант 2: safeParse (возвращает результат)
const validation = createCustomerSchema.safeParse(body)
if (!validation.success) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Validation Error',
    data: validation.error.errors
  })
}
```

## Query с Supabase

```typescript
// Пагинация
const { page = 1, limit = 20 } = query
const offset = (page - 1) * limit
const { data, count } = await client
  .from('customers')
  .select('*', { count: 'exact' })
  .eq('merchant_id', merchant.id)
  .range(offset, offset + limit - 1)

// Поиск
.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

// Relations
.select('*, customer:customers(full_name), merchant:merchants(*)')

// RPC
const { data } = await client.rpc('generate_invoice_number', {
  merchant_id_param: merchant.id
})
```

## Error Handling

```typescript
const { data, error } = await client.from('table').select()

if (error) {
  // PGRST116 = no rows returned
  if (error.code === 'PGRST116') {
    return null
  }
  throw createError({ statusCode: 500, statusMessage: error.message })
}
```

## Scheduled Tasks

```typescript
// tasks/process-recurring.ts
export default defineTask({
  meta: {
    name: 'process-recurring',
    description: 'Обработка повторяющихся счетов'
  },
  async run() {
    // Используем service role (обход RLS)
    const client = createClient<Database>(url, serviceRoleKey)
    // ...
    return { result: 'ok' }
  }
})
```

## Utils

- `pdf-generator.ts` - генерация PDF счетов (PDFKit)
- `qr-sbp.ts` - QR-коды по ГОСТ Р 56042-2014
