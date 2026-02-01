# PP Invoicing - Полное исправление ошибок

## TL;DR

> **Quick Summary**: Исправить все API ошибки 401/500 и привести UI в соответствие с Nuxt UI 4
> 
> **Deliverables**:
> - Все API endpoints работают без авторизации
> - UI использует правильные Nuxt UI 4 паттерны
> - Dark mode работает везде
> 
> **Estimated Effort**: Medium (2-3 часа)
> **Parallel Execution**: YES - 3 волны
> **Critical Path**: Task 1 (utility) → Tasks 2-5 (API) → Tasks 6-8 (UI)

---

## Context

### Original Request
Проект PP Invoicing имеет множество ошибок:
- API возвращают 401/500 ошибки
- UI выглядит плохо, смешение тем
- Страницы требуют обновления для отображения

### Interview Summary
**Исследование выявило:**
- 17 API файлов используют `serverSupabaseClient` + `serverSupabaseUser` → 401 при отключенной auth
- 6 API файлов используют `serverSupabaseClient` без auth check → 500 из-за RLS
- 40+ использований несуществующего класса `text-muted-foreground`
- 3 файла используют `:rows` вместо `:data` в UTable
- 7 файлов используют старые цвета вместо semantic

---

## Work Objectives

### Core Objective
Сделать проект полностью работоспособным без авторизации для разработки

### Concrete Deliverables
- Все API endpoints возвращают JSON, не ошибки
- Все страницы рендерятся корректно
- UI консистентен в dark/light mode

### Definition of Done
- [ ] `curl http://localhost:3000/api/customers` → JSON array
- [ ] `curl http://localhost:3000/api/invoices` → JSON array
- [ ] `curl http://localhost:3000/api/recurring` → JSON array
- [ ] Страницы /dashboard, /invoices, /customers, /recurring открываются без ошибок

### Must Have
- Все API работают с `serverSupabaseServiceRole`
- UTable использует `:data` prop
- Semantic colors в UBadge/UButton

### Must NOT Have (Guardrails)
- НЕ использовать `serverSupabaseClient` (требует auth)
- НЕ использовать `serverSupabaseUser` (требует auth)
- НЕ использовать `text-muted-foreground` (не существует)
- НЕ использовать старые цвета (gray, blue, green, red)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Создать merchant utility

Wave 2 (After Wave 1):
├── Task 2: Fix customers API (5 files)
├── Task 3: Fix invoices API (5 files)
├── Task 4: Fix recurring API (5 files)
└── Task 5: Fix merchant API (2 files)

Wave 3 (After Wave 2):
├── Task 6: Fix UTable usage (3 files)
├── Task 7: Fix colors (7 files)
└── Task 8: Fix text-muted-foreground (7 files)
```

---

## TODOs

### Wave 1: Infrastructure

- [x] 1. Создать merchant utility

  **What to do**:
  - Создать файл `app/server/utils/merchant.ts`
  - Функция `getOrCreateDefaultMerchant(client)` получает или создает дефолтного мерчанта

  **Must NOT do**:
  - Не требовать user для получения merchant

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - Паттерн из `app/server/api/stats/dashboard.get.ts` - использует `serverSupabaseServiceRole`

  **Acceptance Criteria**:
  ```typescript
  // Файл: app/server/utils/merchant.ts
  import type { SupabaseClient } from '@supabase/supabase-js'
  import type { Database } from '~/shared/types/database'

  export async function getOrCreateDefaultMerchant(client: SupabaseClient<Database>) {
    const { data: merchant } = await client
      .from('merchants')
      .select('id')
      .limit(1)
      .single()

    if (merchant) return merchant

    const { data: newMerchant, error } = await client
      .from('merchants')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        merchant_type: 'company',
        full_name: 'Тестовая компания',
        email: 'test@example.com'
      })
      .select('id')
      .single()

    if (error) throw createError({ statusCode: 500, statusMessage: 'Failed to create merchant' })
    return newMerchant!
  }
  ```

  **Commit**: YES
  - Message: `feat(api): add merchant utility for dev mode`
  - Files: `app/server/utils/merchant.ts`

---

### Wave 2: API Fixes

- [x] 2. Fix customers API

  **What to do**:
  - В КАЖДОМ файле в `app/server/api/customers/`:
    - Заменить `serverSupabaseClient` на `serverSupabaseServiceRole`
    - Удалить `serverSupabaseUser` и проверку user
    - Для merchant_id использовать `getOrCreateDefaultMerchant(client)`

  **Files**:
  - `customers/index.get.ts`
  - `customers/index.post.ts`
  - `customers/[id].get.ts`
  - `customers/[id].patch.ts`
  - `customers/[id].delete.ts`

  **Pattern**:
  ```typescript
  // БЫЛО:
  import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const client = await serverSupabaseClient<Database>(event)

  // СТАЛО:
  import { serverSupabaseServiceRole } from '#supabase/server'
  import type { Database } from '~/shared/types/database'
  import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'
  
  const client = await serverSupabaseServiceRole<Database>(event)
  const merchant = await getOrCreateDefaultMerchant(client)
  // Использовать merchant.id вместо получения из user
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  ```bash
  curl -s http://localhost:3000/api/customers | jq 'type'
  # Expected: "array"
  ```

  **Commit**: YES
  - Message: `fix(api): switch customers API to service role`
  - Files: `app/server/api/customers/*.ts`

---

- [x] 3. Fix invoices API

  **What to do**:
  - Аналогично Task 2, для всех файлов в `app/server/api/invoices/`

  **Files**:
  - `invoices/index.get.ts`
  - `invoices/index.post.ts`
  - `invoices/[id].get.ts`
  - `invoices/[id].patch.ts`
  - `invoices/[id].delete.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  ```bash
  curl -s http://localhost:3000/api/invoices | jq 'type'
  # Expected: "object" with data array
  ```

  **Commit**: YES
  - Message: `fix(api): switch invoices API to service role`
  - Files: `app/server/api/invoices/*.ts`

---

- [x] 4. Fix recurring API

  **What to do**:
  - Аналогично Task 2, для всех файлов в `app/server/api/recurring/`

  **Files**:
  - `recurring/index.get.ts`
  - `recurring/index.post.ts`
  - `recurring/[id].get.ts`
  - `recurring/[id].patch.ts`
  - `recurring/[id].delete.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  ```bash
  curl -s http://localhost:3000/api/recurring | jq 'type'
  # Expected: "object" with data array
  ```

  **Commit**: YES
  - Message: `fix(api): switch recurring API to service role`
  - Files: `app/server/api/recurring/*.ts`

---

- [x] 5. Fix merchant API

  **What to do**:
  - Аналогично Task 2, для файлов в `app/server/api/merchant/`

  **Files**:
  - `merchant/profile.get.ts`
  - `merchant/profile.patch.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  ```bash
  curl -s http://localhost:3000/api/merchant/profile | jq '.id'
  # Expected: UUID string
  ```

  **Commit**: YES
  - Message: `fix(api): switch merchant API to service role`
  - Files: `app/server/api/merchant/*.ts`

---

### Wave 3: UI Fixes

- [x] 6. Fix UTable `:rows` → `:data`

  **What to do**:
  - Заменить `:rows` на `:data` в UTable компонентах

  **Files**:
  - `app/pages/invoices/[id].vue` (line ~162)
  - `app/pages/recurring/[id].vue` (line ~118)
  - `app/pages/i/[token].vue` (line ~193)

  **Pattern**:
  ```vue
  <!-- БЫЛО -->
  <UTable :rows="items" :columns="columns" />
  
  <!-- СТАЛО -->
  <UTable :data="items" :columns="columns" />
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  ```bash
  grep -r ":rows=" app/pages/ | wc -l
  # Expected: 0
  ```

  **Commit**: YES
  - Message: `fix(ui): use :data prop in UTable (Nuxt UI 4)`
  - Files: `app/pages/invoices/[id].vue`, `app/pages/recurring/[id].vue`, `app/pages/i/[token].vue`

---

- [x] 7. Fix UBadge/UButton colors

  **What to do**:
  - Заменить старые цвета на semantic:
    - `gray` → `neutral`
    - `blue` → `info`
    - `indigo` → `info`
    - `green` → `success`
    - `red` → `error`
    - `orange` → `warning`
    - `amber` → `warning`

  **Files**:
  - `app/pages/invoices/index.vue`
  - `app/pages/invoices/[id].vue`
  - `app/pages/recurring/index.vue`
  - `app/pages/recurring/[id].vue`
  - `app/pages/i/[token].vue`
  - `app/pages/auth/confirm.vue`
  - `app/pages/auth/callback.vue`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  ```bash
  grep -rE "color=['\"]?(gray|blue|green|red|orange|amber|indigo)['\"]?" app/pages/ | wc -l
  # Expected: 0
  ```

  **Commit**: YES
  - Message: `fix(ui): use semantic colors in Nuxt UI 4`
  - Files: (listed above)

---

- [x] 8. Fix `text-muted-foreground` class

  **What to do**:
  - Заменить `text-muted-foreground` на `text-gray-600 dark:text-gray-400`
  - Этот класс не существует в Tailwind

  **Files** (40+ occurrences):
  - `app/pages/customers/index.vue`
  - `app/pages/customers/new.vue`
  - `app/pages/customers/[id].vue`
  - `app/pages/invoices/index.vue`
  - `app/pages/invoices/[id].vue`
  - `app/pages/recurring/index.vue`
  - `app/pages/recurring/[id].vue`

  **Pattern**:
  ```html
  <!-- БЫЛО -->
  <p class="text-muted-foreground">Text</p>
  
  <!-- СТАЛО -->
  <p class="text-gray-600 dark:text-gray-400">Text</p>
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  ```bash
  grep -r "text-muted-foreground" app/pages/ | wc -l
  # Expected: 0
  ```

  **Commit**: YES
  - Message: `fix(ui): replace undefined text-muted-foreground class`
  - Files: (listed above)

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1 | `feat(api): add merchant utility for dev mode` | utils/merchant.ts |
| 2-5 | `fix(api): switch all APIs to service role` | api/**/*.ts |
| 6-8 | `fix(ui): nuxt ui 4 compatibility fixes` | pages/**/*.vue |

---

## Success Criteria

### Verification Commands
```bash
# API должны возвращать JSON
curl -s http://localhost:3000/api/customers | jq 'length'
curl -s http://localhost:3000/api/invoices | jq '.data | length'
curl -s http://localhost:3000/api/recurring | jq '.data | length'
curl -s http://localhost:3000/api/merchant/profile | jq '.id'

# Страницы должны рендериться (200)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/invoices
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/customers
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/recurring

# Не должно быть старых паттернов
grep -r "serverSupabaseClient" app/server/api/ | grep -v ServiceRole | wc -l  # = 0
grep -r "serverSupabaseUser" app/server/api/ | wc -l  # = 0
grep -r "text-muted-foreground" app/pages/ | wc -l  # = 0
grep -r ":rows=" app/pages/ | wc -l  # = 0
```

### Final Checklist
- [ ] Все API возвращают JSON
- [ ] Все страницы рендерятся без ошибок
- [ ] Dark mode работает везде
- [ ] Нет старых Nuxt UI 3 паттернов
