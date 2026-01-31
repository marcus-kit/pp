# pp — PayPal-like Invoicing System MVP
## TL;DR
> **Quick Summary**: Создание системы выставления счетов "pp" для российского рынка. Merchant создаёт аккаунт, добавляет клиентов, выставляет счета с публичными ссылками и PDF. Поддержка рекуррентных счетов.
> 
> **Deliverables**:
> - Nuxt 4 приложение с авторизацией Magic Link
> - CRUD для merchants, customers, invoices
> - Публичная страница счёта (без авторизации)
> - PDF генерация с QR-кодом СБП
> - Dashboard со статистикой
> - Recurring invoices (ежемесячные)
> 
> **Estimated Effort**: Large (10-15 дней)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Project Setup → Auth → DB Schema → Core CRUD → Public Pages → PDF → Dashboard → Recurring
---
## Context
### Original Request
Создать систему выставления счетов аналогичную PayPal для российского рынка.
### Interview Summary
**Key Discussions**:
- Новый независимый проект (не расширение ~/billing)
- Полный PayPal-like функционал
- Стек: Nuxt 4 + Nuxt UI 4.4 + Supabase
- Рынок: РФ (ЮKassa + СБП отложены на Phase 2)
- Аудитория: универсальная (физлица, ИП, ООО)
**Research Findings**:
- ~/billing содержит паттерны для переиспользования (PDF, Zod, Supabase)
- Supabase Auth поддерживает Magic Link из коробки
- PDFKit — проверенное решение для PDF генерации
- RLS обеспечивает multi-tenant изоляцию
### Metis Review
**Identified Gaps** (addressed):
- Профиль merchant уточнён: физлицо/ИП/ООО
- База клиентов: да, с переиспользованием
- Отметка оплаты: вручную в MVP
- Recurring: только ежемесячный интервал
- Public link: бессрочно
- PDF: логотип + QR СБП + реквизиты
---
## Work Objectives
### Core Objective
Создать MVP системы выставления счетов "pp" с Magic Link авторизацией, CRUD для клиентов и счетов, публичными ссылками на счета с PDF и QR-кодом, и поддержкой ежемесячных рекуррентных счетов.
### Concrete Deliverables
- `/` — Landing page (публичная)
- `/auth/login` — Magic Link вход
- `/dashboard` — Главная с метриками
- `/customers` — CRUD клиентов
- `/invoices` — CRUD счетов
- `/invoices/new` — Создание счёта
- `/invoices/[id]` — Детальный просмотр
- `/recurring` — Управление подписками
- `/settings` — Профиль merchant
- `/i/[token]` — Публичная страница счёта (без авторизации)
- `GET /api/invoice/[token]/pdf` — Скачивание PDF
### Definition of Done
- [x] Merchant может зарегистрироваться через Magic Link
- [x] Merchant может создать клиента и выставить ему счёт
- [x] Клиент (плательщик) может открыть счёт по публичной ссылке
- [x] PDF счёта содержит логотип, QR-код СБП, реквизиты
- [x] Dashboard показывает: ожидает оплаты, оплачено, просрочено
- [x] Recurring invoice автоматически создаёт счёт ежемесячно
- [x] Приложение развёрнуто на pp.doka.team
### Must Have
- Magic Link авторизация (Supabase Auth)
- Multi-tenant изоляция через RLS (merchant_id)
- Статусы счетов: draft, sent, viewed, paid, cancelled, overdue
- PDF с QR-кодом СБП
- Ежемесячные recurring invoices
### Must NOT Have (Guardrails)
- ❌ Онлайн-оплата (ЮKassa) — Phase 2
- ❌ Email уведомления — Phase 2
- ❌ Клиентский портал (ЛК покупателя) — Phase 3
- ❌ Командная работа (multi-user per merchant)
- ❌ Мультивалютность (только RUB)
- ❌ Интеграции с 1С/бухгалтерией
- ❌ Кастомизация PDF шаблонов (один шаблон)
- ❌ OAuth (Google/Yandex) — только Magic Link
- ❌ Telegram bot
---
## Verification Strategy (MANDATORY)
### Test Decision
- **Infrastructure exists**: NO (новый проект)
- **User wants tests**: NO — ручная верификация
- **Framework**: none
### Automated Verification (Manual QA)
Для каждой задачи будут указаны конкретные команды для проверки:
**Frontend/UI**: Playwright browser automation
```
# Агент выполняет через playwright skill:
1. Navigate to URL
2. Fill forms, click buttons
3. Assert DOM state, text content
4. Screenshot to .sisyphus/evidence/
```
**API/Backend**: curl + jq
```bash
# Агент выполняет через Bash:
curl -s http://localhost:3000/api/endpoint | jq '.field'
# Assert: specific output
```
**Evidence Requirements:**
- Screenshots в .sisyphus/evidence/
- curl outputs для API endpoints
- Console logs для errors
---
## Execution Strategy
### Parallel Execution Waves
```
Wave 1 (Start Immediately):
├── Task 1: Project initialization (Nuxt 4 + deps)
└── Task 2: Database schema design (SQL)
Wave 2 (After Wave 1):
├── Task 3: Supabase setup + Auth (Magic Link)
├── Task 4: Database migrations + RLS
└── Task 5: Shared types + schemas (Zod)
Wave 3 (After Wave 2):
├── Task 6: Merchant profile (settings page)
├── Task 7: Customers CRUD
└── Task 8: Invoices CRUD
Wave 4 (After Wave 3):
├── Task 9: Public invoice page
├── Task 10: PDF generation
└── Task 11: Dashboard
Wave 5 (After Wave 4):
└── Task 12: Recurring invoices
Wave 6 (Final):
├── Task 13: Deployment to Dokploy
└── Task 14: Final QA and polish
```
### Dependency Matrix
| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4, 5 | 2 |
| 2 | None | 4 | 1 |
| 3 | 1 | 6, 7, 8 | 4, 5 |
| 4 | 1, 2 | 6, 7, 8 | 3, 5 |
| 5 | 1 | 6, 7, 8 | 3, 4 |
| 6 | 3, 4, 5 | 10 | 7, 8 |
| 7 | 3, 4, 5 | 8 | 6, 8 |
| 8 | 3, 4, 5, 7 | 9, 10, 11, 12 | 6 |
| 9 | 8 | None | 10, 11 |
| 10 | 6, 8 | None | 9, 11 |
| 11 | 8 | None | 9, 10 |
| 12 | 8 | 13 | None |
| 13 | 12 | 14 | None |
| 14 | 13 | None | None |
### Agent Dispatch Summary
| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 2 | `category="quick"` parallel |
| 2 | 3, 4, 5 | `category="quick"` parallel |
| 3 | 6, 7, 8 | `category="unspecified-low"` parallel |
| 4 | 9, 10, 11 | `category="visual-engineering"` + `category="unspecified-low"` |
| 5 | 12 | `category="unspecified-high"` |
| 6 | 13, 14 | `category="quick"` sequential |
---
## TODOs
### Task 1: Project Initialization
- [x] 1. Инициализация проекта Nuxt 4
  **What to do**:
  - Создать Nuxt 4 проект с помощью `npx nuxi@latest init pp`
  - Установить зависимости: @nuxt/ui, @nuxtjs/supabase, zod, pdfkit, qrcode
  - Настроить nuxt.config.ts с модулями
  - Создать базовую структуру папок: app/, server/, shared/
  - Настроить TypeScript и ESLint
  **Must NOT do**:
  - Не добавлять лишние модули (analytics, sentry)
  - Не настраивать CI/CD (будет через Dokploy)
  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Стандартная инициализация, шаблонная задача
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Nuxt/Vue экспертиза
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None
  **References**:
  - `~/billing/nuxt.config.ts` — Конфигурация Nuxt с модулями
  - `~/billing/package.json` — Список зависимостей
  - https://nuxt.com/docs/getting-started/installation — Официальная документация
  **Acceptance Criteria**:
  ```bash
  # Проверить что проект создан
  ls -la /Users/doka/pp/nuxt.config.ts
  # Assert: файл существует
  # Проверить зависимости
  cat /Users/doka/pp/package.json | jq '.dependencies["@nuxt/ui"]'
  # Assert: версия >= "3.0.0"
  # Запустить dev server
  cd /Users/doka/pp && pnpm dev &
  sleep 10
  curl -s http://localhost:3000 | head -20
  # Assert: HTML response с Nuxt
  ```
  **Commit**: YES
  - Message: `feat(init): initialize Nuxt 4 project with core dependencies`
  - Files: `nuxt.config.ts, package.json, tsconfig.json, app/app.vue`
---
### Task 2: Database Schema Design
- [x] 2. Проектирование схемы базы данных
  **What to do**:
  - Создать SQL файл с полной схемой: merchants, customers, invoices, recurring_invoices
  - Определить ENUM типы для статусов
  - Добавить RLS политики для multi-tenant изоляции
  - Документировать схему комментариями
  **Must NOT do**:
  - Не создавать таблицы для payments/transactions (Phase 2)
  - Не добавлять сложные триггеры
  - Не применять миграцию (будет в Task 4)
  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Дизайн схемы без выполнения
  - **Skills**: []
    - Нет специфичных skills для SQL
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 4
  - **Blocked By**: None
  **References**:
  - `~/billing/sql/001-invoices-system.sql` — Пример схемы инвойсов
  - `~/billing/shared/types/database.ts` — TypeScript типы
  **Schema Structure**:
  ```sql
  -- ENUMs
  CREATE TYPE merchant_type AS ENUM ('individual', 'self_employed', 'company');
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'cancelled', 'overdue');
  CREATE TYPE recurring_interval AS ENUM ('monthly');
  -- merchants (= auth.users.id)
  CREATE TABLE merchants (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text NOT NULL,
    name text NOT NULL,
    type merchant_type NOT NULL DEFAULT 'individual',
    company_name text,
    inn text,
    kpp text,
    ogrn text,
    legal_address text,
    bank_name text,
    bank_bic text,
    bank_account text,
    bank_corr_account text,
    logo_url text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  -- customers (merchant's clients)
  CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id),
    name text NOT NULL,
    email text,
    phone text,
    company_name text,
    inn text,
    address text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  -- invoices
  CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id),
    customer_id uuid REFERENCES customers(id),
    invoice_number text NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    amount integer NOT NULL, -- kopecks
    currency text NOT NULL DEFAULT 'RUB',
    items jsonb NOT NULL DEFAULT '[]',
    notes text,
    due_date date,
    public_token uuid NOT NULL DEFAULT gen_random_uuid(),
    viewed_at timestamptz,
    paid_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(merchant_id, invoice_number)
  );
  -- recurring_invoices
  CREATE TABLE recurring_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id),
    customer_id uuid NOT NULL REFERENCES customers(id),
    interval recurring_interval NOT NULL DEFAULT 'monthly',
    template_items jsonb NOT NULL DEFAULT '[]',
    template_notes text,
    next_run_at timestamptz NOT NULL,
    last_run_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  -- RLS Policies
  ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
  ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Merchants can view own profile" ON merchants
    FOR ALL USING (id = auth.uid());
  CREATE POLICY "Merchants can manage own customers" ON customers
    FOR ALL USING (merchant_id = auth.uid());
  CREATE POLICY "Merchants can manage own invoices" ON invoices
    FOR ALL USING (merchant_id = auth.uid());
  CREATE POLICY "Merchants can manage own recurring" ON recurring_invoices
    FOR ALL USING (merchant_id = auth.uid());
  -- Public access for invoice viewing
  CREATE POLICY "Anyone can view invoice by token" ON invoices
    FOR SELECT USING (true); -- будет фильтроваться по public_token в API
  ```
  **Acceptance Criteria**:
  ```bash
  # Проверить что SQL файл создан
  ls -la /Users/doka/pp/sql/001-schema.sql
  # Assert: файл существует
  # Проверить синтаксис SQL
  cat /Users/doka/pp/sql/001-schema.sql | grep "CREATE TABLE merchants"
  # Assert: строка найдена
  cat /Users/doka/pp/sql/001-schema.sql | grep "ENABLE ROW LEVEL SECURITY"
  # Assert: минимум 4 вхождения
  ```
  **Commit**: YES
  - Message: `feat(db): design database schema with RLS policies`
  - Files: `sql/001-schema.sql`
---
### Task 3: Supabase Setup + Magic Link Auth
- [x] 3. Настройка Supabase и Magic Link авторизации
  **What to do**:
  - Настроить @nuxtjs/supabase модуль
  - Создать страницы: /auth/login, /auth/callback, /auth/confirm
  - Реализовать Magic Link flow (signInWithOtp)
  - Создать middleware для защиты роутов
  - Настроить redirect после авторизации
  **Must NOT do**:
  - Не добавлять OAuth providers
  - Не добавлять email/password авторизацию
  - Не создавать страницу регистрации (Magic Link = login + signup)
  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Стандартная интеграция Supabase Auth
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Vue/Nuxt компоненты
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Task 1
  **References**:
  - `~/billing/nuxt.config.ts:14-18` — Supabase module config
  - `~/billing/app/pages/auth/` — Auth pages structure
  - https://supabase.nuxtjs.org/get-started — Официальная документация
  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/auth/login
  2. Assert: Form with email input exists
  3. Fill: input[name="email"] with "test@example.com"
  4. Click: button[type="submit"]
  5. Assert: "Ссылка отправлена" message appears
  6. Screenshot: .sisyphus/evidence/task-3-magic-link.png
  ```
  **Commit**: YES
  - Message: `feat(auth): implement Magic Link authentication`
  - Files: `app/pages/auth/*.vue, app/middleware/auth.ts, nuxt.config.ts`
---
### Task 4: Database Migrations + RLS
- [x] 4. Применение миграций и настройка RLS
  **What to do**:
  - Применить SQL схему через Supabase Dashboard или CLI
  - Проверить создание таблиц
  - Протестировать RLS политики
  - Создать функцию для автогенерации invoice_number
  **Must NOT do**:
  - Не использовать Drizzle/Prisma ORM
  - Не создавать seed data
  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Выполнение SQL миграций
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Tasks 1, 2
  **References**:
  - `/Users/doka/pp/sql/001-schema.sql` — Схема из Task 2
  - `~/billing/sql/` — Примеры миграций
  **Acceptance Criteria**:
  ```bash
  # Проверить таблицы через Supabase API (после настройки)
  # Этот тест выполняется вручную через Supabase Dashboard
  # или через supabase CLI:
  
  # 1. Таблицы созданы
  # SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  # Assert: merchants, customers, invoices, recurring_invoices
  
  # 2. RLS включён
  # SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
  # Assert: все таблицы имеют rowsecurity = true
  ```
  **Commit**: NO (миграции применяются в Supabase Dashboard)
---
### Task 5: Shared Types + Zod Schemas
- [x] 5. Создание TypeScript типов и Zod схем
  **What to do**:
  - Создать shared/types/database.ts с интерфейсами всех сущностей
  - Создать Zod схемы в shared/schemas/
  - Создать shared/constants/statuses.ts со статусами и UI маппингами
  - Создать composables: useFormatters (formatMoney, formatDate)
  **Must NOT do**:
  - Не использовать автогенерацию типов из Supabase
  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Шаблонный код типов
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Task 1
  **References**:
  - `~/billing/shared/types/database.ts` — Пример типов
  - `~/billing/shared/schemas/invoice.ts` — Пример Zod схем
  - `~/billing/shared/constants/statuses.ts` — Статусы
  - `~/billing/app/composables/useFormatters.ts` — Форматтеры
  **Acceptance Criteria**:
  ```bash
  # Проверить типы
  cat /Users/doka/pp/shared/types/database.ts | grep "interface Merchant"
  # Assert: найдено
  cat /Users/doka/pp/shared/types/database.ts | grep "interface Invoice"
  # Assert: найдено
  # Проверить Zod схемы
  cat /Users/doka/pp/shared/schemas/invoice.ts | grep "z.object"
  # Assert: найдено
  # TypeScript проверка
  cd /Users/doka/pp && pnpm typecheck
  # Assert: exit code 0
  ```
  **Commit**: YES
  - Message: `feat(shared): add TypeScript types and Zod schemas`
  - Files: `shared/types/database.ts, shared/schemas/*.ts, shared/constants/statuses.ts, app/composables/useFormatters.ts`
---
### Task 6: Merchant Profile (Settings Page)
- [x] 6. Страница настроек профиля merchant
  **What to do**:
  - Создать /settings page с формой профиля
  - Поля: имя, тип (физлицо/ИП/ООО), ИНН, КПП, ОГРН, адрес, банковские реквизиты
  - Загрузка логотипа (Supabase Storage)
  - API endpoints: GET/PATCH /api/merchant/profile
  - Onboarding flow: после первого входа → заполнить профиль
  **Must NOT do**:
  - Не добавлять валидацию ИНН через внешние API
  - Не добавлять несколько юр. лиц на один аккаунт
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI форма с множеством полей
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Красивые формы, UX
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 10 (PDF нужен профиль для реквизитов)
  - **Blocked By**: Tasks 3, 4, 5
  **References**:
  - `~/billing/app/pages/settings/` — Структура настроек
  - `~/billing/server/api/settings/` — API endpoints
  - Nuxt UI Form: https://ui.nuxt.com/components/form
  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Login as merchant
  2. Navigate to: http://localhost:3000/settings
  3. Assert: Form with fields: name, type, inn, bank_account exists
  4. Fill form with test data
  5. Click: button "Сохранить"
  6. Assert: Toast "Профиль сохранён" appears
  7. Refresh page
  8. Assert: Form fields contain saved data
  9. Screenshot: .sisyphus/evidence/task-6-settings.png
  ```
  **Commit**: YES
  - Message: `feat(merchant): add profile settings page with logo upload`
  - Files: `app/pages/settings.vue, server/api/merchant/profile.*.ts`
---
### Task 7: Customers CRUD
- [x] 7. CRUD для клиентов merchant
  **What to do**:
  - Создать /customers page со списком (UTable)
  - Создать /customers/new и /customers/[id] pages
  - API: GET/POST /api/customers, GET/PATCH/DELETE /api/customers/[id]
  - Поля: имя, email, телефон, компания, ИНН, адрес, заметки
  - Поиск и пагинация в списке
  **Must NOT do**:
  - Не добавлять импорт из CSV/Excel
  - Не добавлять дедупликацию клиентов
  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Стандартный CRUD
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: UTable, формы
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8)
  - **Blocks**: Task 8 (invoices нужны customers)
  - **Blocked By**: Tasks 3, 4, 5
  **References**:
  - `~/billing/app/pages/customers/` — Структура страниц
  - `~/billing/server/api/customers/` — API endpoints
  - Nuxt UI Table: https://ui.nuxt.com/components/table
  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Login as merchant
  2. Navigate to: http://localhost:3000/customers
  3. Assert: Empty state or list of customers
  4. Click: button "Добавить клиента"
  5. Fill: name "Тестовый клиент", email "client@test.com"
  6. Click: button "Сохранить"
  7. Assert: Redirect to /customers
  8. Assert: "Тестовый клиент" appears in list
  9. Screenshot: .sisyphus/evidence/task-7-customers.png
  ```
  ```bash
  # API verification:
  curl -s http://localhost:3000/api/customers \
    -H "Authorization: Bearer $TOKEN" | jq '.items | length'
  # Assert: >= 1
  ```
  **Commit**: YES
  - Message: `feat(customers): implement CRUD for merchant customers`
  - Files: `app/pages/customers/*.vue, server/api/customers/*.ts`
---
### Task 8: Invoices CRUD
- [x] 8. CRUD для счетов
  **What to do**:
  - Создать /invoices page со списком (фильтры по статусу, поиск)
  - Создать /invoices/new — форма создания счёта
  - Создать /invoices/[id] — детальный просмотр + действия
  - API: GET/POST /api/invoices, GET/PATCH/DELETE /api/invoices/[id]
  - Выбор клиента из базы или ввод вручную
  - Динамическое добавление позиций (items)
  - Автогенерация номера счёта (INV-2026-0001)
  - Действия: отправить (sent), отметить оплаченным (paid), отменить (cancelled)
  **Must NOT do**:
  - Не добавлять email отправку (Phase 2)
  - Не добавлять частичную оплату
  - Не добавлять мультивалютность
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Сложная форма с динамическими позициями
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Динамические формы, UX
  **Parallelization**:
  - **Can Run In Parallel**: YES (but depends on Task 7)
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: Tasks 9, 10, 11, 12
  - **Blocked By**: Tasks 3, 4, 5, 7
  **References**:
  - `~/billing/app/pages/invoices/` — Структура страниц
  - `~/billing/server/api/invoices/` — API endpoints
  - `~/billing/server/utils/invoice.ts` — Бизнес-логика инвойсов
  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Login as merchant (must have customer from Task 7)
  2. Navigate to: http://localhost:3000/invoices/new
  3. Select customer from dropdown
  4. Add item: description "Услуга разработки", quantity 1, price 10000
  5. Set due_date to tomorrow
  6. Click: button "Создать счёт"
  7. Assert: Redirect to /invoices/[id]
  8. Assert: Invoice number displayed (format INV-YYYY-NNNN)
  9. Assert: Status "Черновик" displayed
  10. Click: button "Отправить"
  11. Assert: Status changes to "Отправлен"
  12. Screenshot: .sisyphus/evidence/task-8-invoice-detail.png
  ```
  ```bash
  # API verification:
  curl -s http://localhost:3000/api/invoices \
    -H "Authorization: Bearer $TOKEN" | jq '.items[0].status'
  # Assert: "sent"
  ```
  **Commit**: YES
  - Message: `feat(invoices): implement CRUD with status management`
  - Files: `app/pages/invoices/*.vue, server/api/invoices/*.ts, server/utils/invoice.ts`
---
### Task 9: Public Invoice Page
- [x] 9. Публичная страница счёта
  **What to do**:
  - Создать /i/[token] — публичная страница без авторизации
  - Отображение: данные merchant, данные клиента, позиции, сумма, срок, статус
  - Кнопка "Скачать PDF"
  - При открытии обновлять статус на "viewed" (если был "sent")
  - Красивый дизайн, адаптивный
  **Must NOT do**:
  - Не добавлять кнопку оплаты (Phase 2)
  - Не требовать авторизацию
  - Не показывать историю платежей
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Важная публичная страница, нужен отличный дизайн
  - **Skills**: [`frontend-ui-ux`, `frontend-design`]
    - `frontend-ui-ux`: UX публичной страницы
    - `frontend-design`: Красивый дизайн без макета
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 11)
  - **Blocks**: None
  - **Blocked By**: Task 8
  **References**:
  - PayPal invoice page — референс дизайна (https://www.paypal.com/invoice)
  - `~/billing/app/pages/invoice/[id].vue` — Похожая страница в billing
  **Acceptance Criteria**:
  ```
  # Playwright verification (incognito/new session):
  1. Get public_token from created invoice
  2. Navigate to: http://localhost:3000/i/{public_token}
  3. Assert: No login required
  4. Assert: Merchant name displayed
  5. Assert: Invoice items displayed with amounts
  6. Assert: Total amount displayed
  7. Assert: "Скачать PDF" button exists
  8. Assert: Status shown (viewed after opening)
  9. Screenshot: .sisyphus/evidence/task-9-public-invoice.png
  ```
  ```bash
  # Verify status update:
  curl -s http://localhost:3000/api/invoices/$INVOICE_ID \
    -H "Authorization: Bearer $TOKEN" | jq '.status'
  # Assert: "viewed" (if was "sent")
  ```
  **Commit**: YES
  - Message: `feat(public): add public invoice page with beautiful design`
  - Files: `app/pages/i/[token].vue, server/api/public/invoice/[token].get.ts`
---
### Task 10: PDF Generation
- [x] 10. Генерация PDF счёта
  **What to do**:
  - Создать server/utils/pdf-generator.ts
  - Шаблон PDF: шапка с логотипом, данные merchant, данные клиента, таблица позиций, итого, QR-код СБП, банковские реквизиты
  - API endpoint: GET /api/invoice/[token]/pdf (публичный по токену)
  - QR-код: формат СБП для банковского приложения
  **Must NOT do**:
  - Не добавлять кастомизацию шаблона
  - Не добавлять несколько шаблонов
  - Не кэшировать PDF
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Сложная генерация PDF с QR
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 9, 11)
  - **Blocks**: None
  - **Blocked By**: Tasks 6, 8
  **References**:
  - `~/billing/server/utils/pdf-generator.ts` — Пример PDF генерации (528 строк)
  - `~/billing/server/utils/qr-gost.ts` — QR для СБП
  - PDFKit docs: https://pdfkit.org/
  **Acceptance Criteria**:
  ```bash
  # Download PDF:
  curl -s http://localhost:3000/api/invoice/$PUBLIC_TOKEN/pdf \
    -o /tmp/test-invoice.pdf
  
  # Verify PDF created:
  file /tmp/test-invoice.pdf
  # Assert: "PDF document"
  
  # Verify PDF size (should be > 10KB):
  ls -la /tmp/test-invoice.pdf | awk '{print $5}'
  # Assert: > 10000
  ```
  ```
  # Manual verification:
  1. Open /tmp/test-invoice.pdf
  2. Assert: Logo displayed (if uploaded)
  3. Assert: Merchant details correct
  4. Assert: Invoice items table correct
  5. Assert: QR code present
  6. Assert: Bank details present
  ```
  **Commit**: YES
  - Message: `feat(pdf): implement PDF generation with QR code`
  - Files: `server/utils/pdf-generator.ts, server/utils/qr-sbp.ts, server/api/invoice/[token]/pdf.get.ts`
---
### Task 11: Dashboard
- [x] 11. Dashboard со статистикой
  **What to do**:
  - Создать /dashboard как главную страницу после входа
  - 3 виджета: "Ожидает оплаты", "Оплачено (этот месяц)", "Просрочено"
  - Список последних 10 счетов
  - Quick actions: "Создать счёт", "Добавить клиента"
  - API endpoint: GET /api/stats/dashboard
  **Must NOT do**:
  - Не добавлять графики (Phase 2)
  - Не добавлять экспорт в Excel
  - Не добавлять фильтры по датам
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI дашборда с виджетами
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Dashboard layout
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 9, 10)
  - **Blocks**: None
  - **Blocked By**: Task 8
  **References**:
  - `~/billing/app/pages/index.vue` — Dashboard в billing
  - `~/billing/server/api/stats/` — Stats API
  - `~/billing/app/components/StatCard.vue` — Компонент статистики
  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Login as merchant
  2. Assert: Redirected to /dashboard (or /)
  3. Assert: 3 stat cards visible (Ожидает, Оплачено, Просрочено)
  4. Assert: Recent invoices list visible
  5. Assert: "Создать счёт" button exists
  6. Click: "Создать счёт"
  7. Assert: Navigate to /invoices/new
  8. Screenshot: .sisyphus/evidence/task-11-dashboard.png
  ```
  ```bash
  # API verification:
  curl -s http://localhost:3000/api/stats/dashboard \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  # Assert: JSON with pending_amount, paid_amount, overdue_amount
  ```
  **Commit**: YES
  - Message: `feat(dashboard): add main dashboard with stats and recent invoices`
  - Files: `app/pages/dashboard.vue, server/api/stats/dashboard.get.ts, app/components/StatCard.vue`
---
### Task 12: Recurring Invoices
- [x] 12. Рекуррентные счета (подписки)
  **What to do**:
  - Создать /recurring page со списком подписок
  - Создать /recurring/new — форма создания
  - Поля: клиент, позиции (шаблон), следующая дата, активность
  - API: GET/POST /api/recurring, GET/PATCH/DELETE /api/recurring/[id]
  - Cron job (или scheduled function): ежедневная проверка и создание счетов
  - Логика: если next_run_at <= today && is_active → создать invoice → обновить next_run_at
  **Must NOT do**:
  - Не добавлять интервалы кроме monthly
  - Не добавлять уведомления о создании счёта (Phase 2)
  - Не добавлять preview следующего счёта
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Бизнес-логика с cron job
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (sequential)
  - **Blocks**: Task 13
  - **Blocked By**: Task 8
  **References**:
  - `~/billing/server/api/invoices/auto.post.ts` — Автогенерация счетов
  - Nuxt Cron: https://nitro.unjs.io/guide/tasks
  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Login as merchant
  2. Navigate to: http://localhost:3000/recurring/new
  3. Select customer
  4. Add item: "Ежемесячная подписка", 5000 RUB
  5. Set next_run_at to today
  6. Click: "Создать подписку"
  7. Assert: Redirect to /recurring
  8. Assert: Subscription in list with status "Активна"
  9. Screenshot: .sisyphus/evidence/task-12-recurring.png
  ```
  ```bash
  # Trigger cron manually:
  curl -X POST http://localhost:3000/api/recurring/process \
    -H "Authorization: Bearer $ADMIN_KEY"
  # Assert: 200 OK
  # Verify invoice created:
  curl -s http://localhost:3000/api/invoices \
    -H "Authorization: Bearer $TOKEN" | jq '.items | length'
  # Assert: increased by 1
  ```
  **Commit**: YES
  - Message: `feat(recurring): implement monthly recurring invoices with cron`
  - Files: `app/pages/recurring/*.vue, server/api/recurring/*.ts, server/tasks/process-recurring.ts`
---
### Task 13: Deployment to Dokploy
- [x] 13. Развёртывание на Dokploy
  **What to do**:
  - Создать Dockerfile для Nuxt production build
  - Настроить проект в Dokploy Dashboard
  - Настроить домен pp.doka.team
  - Настроить environment variables (Supabase keys)
  - Настроить auto-deploy при push в main
  **Must NOT do**:
  - Не настраивать CI/CD вне Dokploy
  - Не использовать Vercel/Netlify
  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Стандартный деплой
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6 (sequential)
  - **Blocks**: Task 14
  - **Blocked By**: Task 12
  **References**:
  - `~/billing/Dockerfile` — Пример Dockerfile
  - Dokploy docs: https://dokploy.com/docs
  - `/Users/doka/doka-server.md` — Инструкции по серверу
  **Acceptance Criteria**:
  ```bash
  # Verify Dockerfile:
  cat /Users/doka/pp/Dockerfile | grep "FROM node"
  # Assert: found
  # Verify production build:
  cd /Users/doka/pp && pnpm build
  # Assert: exit code 0
  # Verify site accessible:
  curl -s https://pp.doka.team | head -20
  # Assert: HTML with Nuxt app
  ```
  **Commit**: YES
  - Message: `chore(deploy): add Dockerfile and deployment config`
  - Files: `Dockerfile, .dockerignore`
---
### Task 14: Final QA and Polish
- [x] 14. Финальное тестирование и полировка
  **What to do**:
  - Полный end-to-end тест всего flow
  - Исправление найденных багов
  - Проверка responsive дизайна
  - Проверка error states
  - Добавление loading states где отсутствуют
  - Проверка RLS работает корректно (изоляция данных)
  **Must NOT do**:
  - Не добавлять новые фичи
  - Не рефакторить без необходимости
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI polish
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: UI fixes
    - `playwright`: E2E testing
  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6 (final)
  - **Blocks**: None
  - **Blocked By**: Task 13
  **References**:
  - All previous tasks
  **Acceptance Criteria**:
  ```
  # Full E2E test (Playwright):
  1. Open https://pp.doka.team
  2. Click "Войти"
  3. Enter email, receive magic link, login
  4. Fill merchant profile (first time)
  5. Create customer
  6. Create invoice for customer
  7. Copy public link
  8. Open public link in incognito
  9. Verify invoice displayed
  10. Download PDF
  11. Verify PDF contains all data
  12. Back to merchant: mark invoice as paid
  13. Verify status changed
  14. Check dashboard stats updated
  15. Create recurring invoice
  16. Screenshot all steps to .sisyphus/evidence/task-14-*.png
  ```
  **Commit**: YES
  - Message: `fix(qa): final polish and bug fixes`
  - Files: various
---
## Commit Strategy
| After Task | Message | Key Files |
|------------|---------|-----------|
| 1 | `feat(init): initialize Nuxt 4 project` | nuxt.config.ts, package.json |
| 2 | `feat(db): design database schema` | sql/001-schema.sql |
| 3 | `feat(auth): implement Magic Link` | app/pages/auth/*.vue |
| 5 | `feat(shared): add types and schemas` | shared/**/* |
| 6 | `feat(merchant): add profile settings` | app/pages/settings.vue |
| 7 | `feat(customers): implement CRUD` | app/pages/customers/*.vue |
| 8 | `feat(invoices): implement CRUD` | app/pages/invoices/*.vue |
| 9 | `feat(public): add public invoice page` | app/pages/i/[token].vue |
| 10 | `feat(pdf): implement PDF generation` | server/utils/pdf-generator.ts |
| 11 | `feat(dashboard): add main dashboard` | app/pages/dashboard.vue |
| 12 | `feat(recurring): implement subscriptions` | app/pages/recurring/*.vue |
| 13 | `chore(deploy): add Dockerfile` | Dockerfile |
| 14 | `fix(qa): final polish` | various |
---
## Success Criteria
### Verification Commands
```bash
# Site is live:
curl -s https://pp.doka.team | grep -i "nuxt"
# Expected: match found
# Health check:
curl -s https://pp.doka.team/api/health
# Expected: {"status": "ok"}
```
### Final Checklist
- [x] Merchant может зарегистрироваться через Magic Link
- [x] Merchant может заполнить профиль с реквизитами
- [x] Merchant может создать клиента
- [x] Merchant может выставить счёт клиенту
- [x] Клиент может открыть счёт по публичной ссылке
- [x] Клиент может скачать PDF счёта
- [x] PDF содержит логотип, QR-код, реквизиты
- [x] Dashboard показывает корректную статистику
- [x] Recurring invoice создаёт счета автоматически
- [x] RLS изолирует данные между merchant'ами
- [x] Сайт доступен по https://pp.doka.team