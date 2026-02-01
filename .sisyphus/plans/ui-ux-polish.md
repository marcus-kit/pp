# PP Invoicing - UI/UX Polish

## TL;DR

> **Quick Summary**: Полная переработка UI/UX для PP Invoicing с PayPal-like стилем. Обновление навигации с мобильным Drawer, унификация иконок на lucide, авто dark mode, и систематическая полировка всех страниц.
> 
> **Deliverables**:
> - Обновлённый layout с NavigationMenu + мобильный Drawer
> - app.config.ts с PayPal синей темой (#0070BA)
> - Все иконки унифицированы на lucide
> - Auto dark mode (prefers-color-scheme)
> - Все страницы с loading states и улучшенным дизайном
> - Playwright тесты для верификации
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 3/3b → Tasks 4-11 (parallel) → Task 12

---

## Context

### Original Request
Продолжить разработку PayPal-like инвойсинговой системы с фокусом на полировку UI/UX.

### Interview Summary
**Key Discussions**:
- **Направление работы**: Полная переработка UI/UX всех страниц
- **Навигация**: Top bar с hamburger menu (Drawer) для мобильных
- **Цвета**: PayPal Modern Blue (#0070BA)
- **Dark Mode**: Авто по системным настройкам (без toggle)
- **Icons**: Унификация на lucide
- **Public Invoice**: Общий стиль с админкой
- **Auth pages**: Включены в редизайн

**Research Findings**:
- Текущий layout: только default.vue с ручной навигацией
- 9 файлов ссылаются на несуществующий layout 'dashboard':
  - `app/pages/invoices/index.vue`, `new.vue`, `[id].vue`
  - `app/pages/customers/index.vue`, `new.vue`, `[id].vue`
  - `app/pages/recurring/index.vue`, `new.vue`, `[id].vue`
- Иконки смешанные: heroicons + lucide
- Мобильного меню нет вообще
- Dark mode CSS поддержка есть, но не настроен colorMode
- Auth middleware блокирует доступ к защищённым страницам (нужен bypass для e2e)

### Metis Review
**Identified Gaps** (addressed):
- PayPal blue hex code → #0070BA (Modern)
- Mobile menu style → Drawer (left direction)
- Public invoice scope → Общий стиль
- Auth pages → Включены

---

## Work Objectives

### Core Objective
Создать профессиональный, современный UI в стиле PayPal с полной адаптацией для мобильных устройств и поддержкой темной темы.

### Concrete Deliverables
- `app/app.config.ts` - конфигурация темы Nuxt UI
- `app/layouts/default.vue` - обновлённый layout с NavigationMenu + Drawer
- Все `.vue` файлы без heroicons (только lucide)
- Все страницы с skeleton loaders
- `tests/e2e/ui-polish.spec.ts` - Playwright тесты

### Definition of Done
- [ ] `grep -r "i-heroicons" app/ --include="*.vue" | wc -l` = 0
- [ ] Все страницы отображаются корректно на 375px, 768px, 1280px
- [ ] Dark mode работает автоматически по системным настройкам
- [ ] Мобильное меню открывается и закрывается
- [ ] Playwright тесты проходят

### Must Have
- NavigationMenu компонент для десктоп навигации
- Drawer компонент для мобильной навигации (direction="left")
- PayPal blue (#0070BA) как primary color
- Auto dark mode (prefers-color-scheme)
- Skeleton loaders на всех страницах со списками
- data-testid атрибуты для Playwright

### Must NOT Have (Guardrails)
- ❌ НЕ добавлять manual color mode toggle (только auto)
- ❌ НЕ менять логику форм и валидацию
- ❌ НЕ менять API endpoints или серверный код
- ❌ НЕ добавлять breadcrumbs, notifications, user dropdown
- ❌ НЕ добавлять новые runtime зависимости (devDependencies для тестов разрешены: @playwright/test)
- ❌ НЕ создавать новые компоненты (использовать Nuxt UI)
- ❌ НЕ добавлять анимации кроме встроенных в Nuxt UI
- ❌ НЕ менять структуру роутов или layouts (кроме default.vue)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (нужно создать)
- **User wants tests**: YES (Playwright)
- **Framework**: Playwright

### Playwright Test Structure
Каждая страница тестируется на:
1. 3 viewport размера (375px mobile, 768px tablet, 1280px desktop)
2. Light и Dark mode
3. Ключевые интерактивные элементы

### Auth Bypass Strategy for E2E Tests
Поскольку Magic Link auth временно отключена, для Playwright тестов используем:
- Публичный runtime config флаг `NUXT_PUBLIC_E2E_TEST=true`
- В `nuxt.config.ts` добавить: `runtimeConfig: { public: { e2eTest: '' } }`
- В middleware использовать: `useRuntimeConfig().public.e2eTest === 'true'`
- Playwright `webServer` запускает Nuxt с `NUXT_PUBLIC_E2E_TEST=true`
- Это позволит тестировать UI страниц без реального логина
- **ВАЖНО**: Флаг работает ТОЛЬКО в dev режиме, в production игнорируется

### Evidence to Capture
- Screenshots в `.sisyphus/evidence/`
- Console errors отсутствуют
- Все assertions проходят

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Setup Playwright infrastructure + auth bypass
└── Task 2: Create app.config.ts with theme

Wave 2 (After Wave 1):
├── Task 3: Update default.vue layout with NavigationMenu + Drawer
└── Task 3b: Remove layout: 'dashboard' from all pages

Wave 3 (After Wave 2):
├── Task 4: Migrate icons (heroicons → lucide)
└── Tasks 5-11: Polish individual pages (parallel)

Wave 4 (After all pages done):
└── Task 12: Final Playwright tests
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 12 | 2 |
| 2 | None | 3, 3b | 1 |
| 3 | 2 | 4-11 | 3b |
| 3b | 2 | 5-11 | 3 |
| 4 | 3, 3b | 12 | 5, 6, 7, 8, 9, 10, 11 |
| 5-11 | 3, 3b | 12 | 4 and each other |
| 12 | All | None | None |

---

## TODOs

- [ ] 1. Setup Playwright Test Infrastructure + Auth Bypass

  **What to do**:
  - Установить Playwright: `bun add -D @playwright/test`
  - Создать `playwright.config.ts` с настройками viewports
  - Настроить `webServer` в playwright.config.ts для запуска Nuxt с `NUXT_PUBLIC_E2E_TEST=true`:
    ```typescript
    webServer: {
      command: 'NUXT_PUBLIC_E2E_TEST=true bun run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    }
    ```
  - Добавить runtime config в `nuxt.config.ts`:
    ```typescript
    runtimeConfig: {
      public: {
        e2eTest: '', // будет заменено на 'true' через env
        // ...existing public config
      }
    }
    ```
  - Добавить auth bypass в `app/middleware/auth.ts`:
    ```typescript
    // В начале middleware
    const config = useRuntimeConfig()
    if (config.public.e2eTest === 'true' && import.meta.dev) {
      return // Пропускаем auth для e2e тестов в dev режиме
    }
    ```
  - Создать базовый тест для проверки setup
  - Добавить script в package.json: `"test:e2e": "playwright test"`

  **Must NOT do**:
  - НЕ устанавливать дополнительные testing libraries
  - НЕ настраивать CI/CD
  - НЕ отключать auth в production

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Простая конфигурационная задача, без сложной логики
  - **Skills**: [`playwright`]
    - `playwright`: Настройка Playwright конфигурации

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 12
  - **Blocked By**: None

  **References**:
  - `package.json` - добавить devDependency и script
  - `app/middleware/auth.ts` - добавить bypass для e2e тестов через runtime config
  - `nuxt.config.ts:37-48` - runtimeConfig секция для добавления e2eTest
  - Playwright docs: viewport configuration, webServer config

  **Acceptance Criteria**:
  ```bash
  # Проверить установку
  bun playwright --version
  # Assert: выводит версию (e.g., "Version 1.x.x")
  
  # Проверить конфиг
  test -f playwright.config.ts && echo "EXISTS"
  # Assert: EXISTS
  
  # Проверить auth bypass добавлен (использует runtime config)
  grep -q "e2eTest" app/middleware/auth.ts && echo "BYPASS_EXISTS"
  # Assert: BYPASS_EXISTS
  
  # Проверить runtime config добавлен
  grep -q "e2eTest" nuxt.config.ts && echo "CONFIG_EXISTS"
  # Assert: CONFIG_EXISTS
  
  # Запустить тесты (должен быть хотя бы 1 passing)
  bun test:e2e --reporter=list
  # Assert: exit code 0, "1 passed"
  ```

  **Commit**: YES
  - Message: `chore: setup playwright test infrastructure with auth bypass`
  - Files: `playwright.config.ts`, `package.json`, `tests/e2e/example.spec.ts`, `app/middleware/auth.ts`, `nuxt.config.ts`

---

- [ ] 2. Create app.config.ts with PayPal Theme

  **What to do**:
  - Создать `app/app.config.ts`
  - Настроить primary color: PayPal Blue (#0070BA)
  - Настроить neutral color: gray
  - Убедиться что colorMode работает в auto режиме

  **Must NOT do**:
  - НЕ добавлять color mode toggle
  - НЕ менять другие настройки

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Один файл конфигурации
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3-11
  - **Blocked By**: None

  **References**:
  - Nuxt UI docs: https://ui.nuxt.com/getting-started/theme
  - PayPal brand colors: #0070BA (primary)

  **Acceptance Criteria**:
  ```bash
  # Файл существует
  test -f app/app.config.ts && echo "EXISTS"
  # Assert: EXISTS
  
  # Содержит primary color
  grep -q "0070BA\|primary" app/app.config.ts && echo "HAS_PRIMARY"
  # Assert: HAS_PRIMARY
  ```

  **Playwright verification** (после запуска dev server):
  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000
  2. Check computed style of primary button
  3. Assert: background color contains PayPal blue (#0070BA or RGB equivalent)
  4. Screenshot: .sisyphus/evidence/task-2-theme-colors.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add app.config.ts with PayPal theme`
  - Files: `app/app.config.ts`

---

- [ ] 3. Update default.vue Layout with NavigationMenu + Drawer

  **What to do**:
  - Заменить ручную навигацию на `UNavigationMenu` компонент
  - Добавить `UDrawer` для мобильного меню (direction="left")
  - Добавить hamburger кнопку для мобильных (скрыта на sm+)
  - Централизовать nav items в одном массиве
  - Добавить data-testid атрибуты

  **Must NOT do**:
  - НЕ добавлять user dropdown, notifications, search
  - НЕ менять структуру main content area
  - НЕ добавлять sidebar

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Работа с UI компонентами, навигацией, responsive design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Работа с Nuxt UI компонентами, адаптивный дизайн

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Tasks 4-11
  - **Blocked By**: Task 2

  **References**:
  - `app/layouts/default.vue` - текущий layout для рефакторинга
  - Nuxt UI NavigationMenu: horizontal menu с items array
  - Nuxt UI Drawer: direction="left", v-model:open

  **Acceptance Criteria**:
  ```bash
  # Проверить что используются Nuxt UI компоненты
  grep -q "UNavigationMenu" app/layouts/default.vue && echo "HAS_NAV_MENU"
  # Assert: HAS_NAV_MENU
  
  grep -q "UDrawer" app/layouts/default.vue && echo "HAS_DRAWER"
  # Assert: HAS_DRAWER
  
  # Проверить data-testid
  grep -q 'data-testid="mobile-menu-button"' app/layouts/default.vue && echo "HAS_TESTID"
  # Assert: HAS_TESTID
  ```

  **Playwright verification**:
  ```
  # Desktop viewport (1280px):
  1. Navigate to: http://localhost:3000/dashboard
  2. Assert: NavigationMenu visible
  3. Assert: hamburger button NOT visible (hidden on desktop)
  
  # Mobile viewport (375px):
  1. Set viewport: { width: 375, height: 812 }
  2. Navigate to: http://localhost:3000/dashboard
  3. Assert: hamburger button visible
  4. Click: [data-testid="mobile-menu-button"]
  5. Assert: Drawer is visible
  6. Click: "Счета" link in Drawer
  7. Assert: URL is /invoices
  8. Screenshot: .sisyphus/evidence/task-3-mobile-menu.png
  ```

  **Commit**: YES
  - Message: `feat(ui): update layout with NavigationMenu and mobile Drawer`
  - Files: `app/layouts/default.vue`

---

- [ ] 3b. Remove `layout: 'dashboard'` from All Pages

  **What to do**:
  - Удалить `layout: 'dashboard'` из definePageMeta во всех затронутых файлах:
    - `app/pages/invoices/index.vue`
    - `app/pages/invoices/new.vue`
    - `app/pages/invoices/[id].vue`
    - `app/pages/customers/index.vue`
    - `app/pages/customers/new.vue`
    - `app/pages/customers/[id].vue`
    - `app/pages/recurring/index.vue`
    - `app/pages/recurring/new.vue`
    - `app/pages/recurring/[id].vue`
  - Оставить только `middleware: 'auth'` в definePageMeta (если есть)

  **Must NOT do**:
  - НЕ создавать новый layout 'dashboard'
  - НЕ менять другие настройки в definePageMeta

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Простая search & remove операция
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Tasks 5-11
  - **Blocked By**: Task 2

  **References**:
  - `app/pages/invoices/index.vue:4-7` - пример definePageMeta с layout
  - Все 9 файлов указанных выше

  **Acceptance Criteria**:
  ```bash
  # Проверить что layout: 'dashboard' нигде не используется
  grep -r "layout: 'dashboard'" app/pages/ --include="*.vue" | wc -l
  # Assert: 0
  
  # Проверить что middleware: 'auth' остался
  grep -r "middleware: 'auth'" app/pages/ --include="*.vue" | wc -l
  # Assert: > 0
  ```

  **Commit**: YES
  - Message: `fix: remove references to non-existent dashboard layout`
  - Files: 9 файлов в app/pages/

---

- [ ] 4. Migrate All Icons from Heroicons to Lucide

  **What to do**:
  - Найти все использования `i-heroicons-*`
  - Заменить на эквиваленты `i-lucide-*`
  - Маппинг иконок:
    - `i-heroicons-arrow-right` → `i-lucide-arrow-right`
    - `i-heroicons-cog-6-tooth` → `i-lucide-settings`
    - `i-heroicons-arrow-path` → `i-lucide-loader-2`
    - `i-heroicons-exclamation-circle` → `i-lucide-alert-circle`
    - `i-heroicons-arrow-right-on-rectangle` → `i-lucide-log-out`
    - `i-heroicons-document-arrow-down` → `i-lucide-download`
    - Другие по аналогии

  **Must NOT do**:
  - НЕ добавлять анимации на иконки
  - НЕ менять размеры иконок

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Search & replace операция, атомарная
  - **Skills**: []
    - No special skills - используем ast_grep_replace или grep + edit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5-11)
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/layouts/default.vue` - иконки в навигации
  - `app/pages/i/[token].vue` - иконки загрузки и ошибок
  - `app/pages/dashboard.vue` - иконки в StatCard
  - Lucide icons: https://lucide.dev/icons

  **Acceptance Criteria**:
  ```bash
  # Проверить что нет heroicons
  grep -r "i-heroicons" app/ --include="*.vue" | wc -l
  # Assert: 0
  
  # Проверить что lucide используются
  grep -r "i-lucide" app/ --include="*.vue" | wc -l
  # Assert: > 0
  ```

  **Commit**: YES
  - Message: `refactor(ui): migrate all icons from heroicons to lucide`
  - Files: все .vue файлы с иконками

---

- [ ] 5. Polish Dashboard Page

  **What to do**:
  - Проверить и улучшить skeleton loaders (уже есть базовые)
  - Убедиться что StatCard использует lucide иконки
  - Проверить responsive на всех viewport
  - Добавить data-testid для ключевых элементов

  **Must NOT do**:
  - НЕ менять логику загрузки данных
  - НЕ менять структуру статистики

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Полировка UI компонентов
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 4, 6-11)
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/pages/dashboard.vue` - текущая реализация
  - `app/components/StatCard.vue` - компонент статистики

  **Acceptance Criteria**:
  **Playwright verification**:
  ```
  # Test at 3 viewports (375px, 768px, 1280px):
  1. Navigate to: http://localhost:3000/dashboard
  2. Wait for: loading skeleton to disappear OR data to load
  3. Assert: StatCards visible (3 cards)
  4. Assert: Recent invoices table visible
  5. Screenshot: .sisyphus/evidence/task-5-dashboard-{viewport}.png
  
  # Dark mode test:
  1. Emulate: colorScheme: 'dark'
  2. Navigate to: http://localhost:3000/dashboard
  3. Assert: background is dark (not #F9FAFB)
  4. Screenshot: .sisyphus/evidence/task-5-dashboard-dark.png
  ```

  **Commit**: NO (группируется с Task 12)

---

- [ ] 6. Polish Invoices List Page

  **What to do**:
  - Убрать ссылку на несуществующий layout 'dashboard'
  - Добавить/улучшить skeleton loader для таблицы
  - Проверить empty state
  - Проверить responsive для filters и table
  - Добавить data-testid

  **Must NOT do**:
  - НЕ менять логику поиска и фильтрации
  - НЕ менять пагинацию

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Работа с таблицами, фильтрами, responsive
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 4, 5, 7-11)
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/pages/invoices/index.vue` - текущая реализация
  - Nuxt UI UTable: loading state, empty state

  **Acceptance Criteria**:
  ```bash
  # Проверить что layout: 'dashboard' убран
  grep -q "layout: 'dashboard'" app/pages/invoices/index.vue || echo "LAYOUT_FIXED"
  # Assert: LAYOUT_FIXED
  ```

  **Playwright verification**:
  ```
  # Mobile (375px):
  1. Navigate to: http://localhost:3000/invoices
  2. Assert: filters stack vertically or are in dropdown
  3. Assert: table scrolls horizontally
  4. Screenshot: .sisyphus/evidence/task-6-invoices-mobile.png
  
  # Desktop (1280px):
  1. Navigate to: http://localhost:3000/invoices
  2. Assert: filters in row
  3. Assert: table fully visible
  4. Screenshot: .sisyphus/evidence/task-6-invoices-desktop.png
  ```

  **Commit**: NO (группируется с Task 12)

---

- [ ] 7. Polish Customers List Page

  **What to do**:
  - Добавить skeleton loader для списка
  - Улучшить empty state
  - Проверить responsive
  - Добавить data-testid

  **Must NOT do**:
  - НЕ менять CRUD логику
  - НЕ менять форму создания

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/pages/customers/index.vue`
  - `app/pages/customers/new.vue`
  - `app/pages/customers/[id].vue`

  **Acceptance Criteria**:
  **Playwright verification**:
  ```
  # Test customer list:
  1. Navigate to: http://localhost:3000/customers
  2. Assert: page loads without console errors
  3. Screenshot: .sisyphus/evidence/task-7-customers.png
  ```

  **Commit**: NO (группируется с Task 12)

---

- [ ] 8. Polish Recurring Invoices Page

  **What to do**:
  - Добавить skeleton loader
  - Улучшить empty state
  - Проверить responsive
  - Добавить data-testid

  **Must NOT do**:
  - НЕ менять логику recurring
  - НЕ менять формы

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/pages/recurring/index.vue`
  - `app/pages/recurring/new.vue`
  - `app/pages/recurring/[id].vue`

  **Acceptance Criteria**:
  **Playwright verification**:
  ```
  1. Navigate to: http://localhost:3000/recurring
  2. Assert: page loads
  3. Screenshot: .sisyphus/evidence/task-8-recurring.png
  ```

  **Commit**: NO (группируется с Task 12)

---

- [ ] 9. Polish Settings Page

  **What to do**:
  - Улучшить форму профиля мерчанта
  - Добавить loading state на save
  - Проверить responsive для формы
  - Добавить data-testid

  **Must NOT do**:
  - НЕ менять валидацию
  - НЕ менять API calls

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/pages/settings.vue`

  **Acceptance Criteria**:
  **Playwright verification**:
  ```
  1. Navigate to: http://localhost:3000/settings
  2. Assert: form fields visible
  3. Assert: save button present
  4. Screenshot: .sisyphus/evidence/task-9-settings.png
  ```

  **Commit**: NO (группируется с Task 12)

---

- [ ] 10. Polish Public Invoice Page

  **What to do**:
  - Применить общий стиль с админкой
  - Улучшить loading и error states
  - Убедиться что иконки lucide
  - Проверить responsive
  - Проверить dark mode
  - Добавить data-testid

  **Must NOT do**:
  - НЕ добавлять навигацию (это публичная страница)
  - НЕ менять структуру данных

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/pages/i/[token].vue` - публичная страница счёта

  **Acceptance Criteria**:
  **Playwright verification**:
  ```
  # Note: нужен валидный token для теста, или mock
  1. Navigate to: http://localhost:3000/i/test-token
  2. If error page: assert error UI is styled correctly
  3. Screenshot: .sisyphus/evidence/task-10-public-invoice.png
  ```

  **Commit**: NO (группируется с Task 12)

---

- [ ] 11. Polish Auth Pages

  **What to do**:
  - Обновить login page с новым стилем
  - Обновить callback и confirm pages
  - Проверить responsive
  - Добавить loading states
  - Добавить data-testid

  **Must NOT do**:
  - НЕ менять auth логику
  - НЕ пытаться починить PKCE

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/pages/auth/login.vue`
  - `app/pages/auth/callback.vue`
  - `app/pages/auth/confirm.vue`

  **Acceptance Criteria**:
  **Playwright verification**:
  ```
  1. Navigate to: http://localhost:3000/auth/login
  2. Assert: login form visible
  3. Assert: email input present
  4. Assert: submit button present
  5. Screenshot: .sisyphus/evidence/task-11-auth.png
  ```

  **Commit**: NO (группируется с Task 12)

---

- [ ] 12. Final Playwright Tests Suite

  **What to do**:
  - Создать полный тест suite в `tests/e2e/ui-polish.spec.ts`
  - Тесты для каждой страницы:
    - 3 viewports (375px, 768px, 1280px)
    - Light и Dark mode
    - Mobile menu open/close/navigate
  - Тест для icon audit (no heroicons)
  - Сохранить все screenshots в evidence

  **Must NOT do**:
  - НЕ создавать функциональные тесты (только UI/визуальные)
  - НЕ тестировать API

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Playwright UI тесты
  - **Skills**: [`playwright`]
    - `playwright`: Написание Playwright тестов

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None (final task)
  - **Blocked By**: All previous tasks

  **References**:
  - `playwright.config.ts` - конфигурация (Task 1)
  - Все страницы с data-testid атрибутами

  **Acceptance Criteria**:
  ```bash
  # Запустить все тесты
  bun test:e2e
  # Assert: exit code 0, all tests passing
  
  # Проверить screenshots созданы
  ls -la .sisyphus/evidence/*.png | wc -l
  # Assert: > 10 screenshots
  
  # Проверить icon audit
  grep -r "i-heroicons" app/ --include="*.vue" | wc -l
  # Assert: 0
  ```

  **Commit**: YES
  - Message: `feat(ui): complete UI/UX polish with Playwright tests`
  - Files: `tests/e2e/ui-polish.spec.ts`, все изменённые .vue файлы
  - Pre-commit: `bun test:e2e`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore: setup playwright test infrastructure with auth bypass` | playwright.config.ts, package.json, tests/e2e/example.spec.ts, app/middleware/auth.ts | bun test:e2e |
| 2 | `feat(ui): add app.config.ts with PayPal theme` | app/app.config.ts | manual |
| 3 | `feat(ui): update layout with NavigationMenu and mobile Drawer` | app/layouts/default.vue | manual |
| 3b | `fix: remove references to non-existent dashboard layout` | 9 files in app/pages/ | grep check |
| 4 | `refactor(ui): migrate all icons from heroicons to lucide` | multiple .vue files | grep check |
| 12 | `feat(ui): complete UI/UX polish with Playwright tests` | tests/e2e/ui-polish.spec.ts + pages | bun test:e2e |

---

## Success Criteria

### Verification Commands
```bash
# Icon audit
grep -r "i-heroicons" app/ --include="*.vue" | wc -l
# Expected: 0

# Playwright tests
bun test:e2e
# Expected: All tests passing

# Theme config
test -f app/app.config.ts && echo "EXISTS"
# Expected: EXISTS
```

### Final Checklist
- [ ] Все "Must Have" присутствуют
- [ ] Все "Must NOT Have" отсутствуют
- [ ] Все Playwright тесты проходят
- [ ] Нет heroicons в коде
- [ ] Мобильное меню работает
- [ ] Dark mode работает автоматически
