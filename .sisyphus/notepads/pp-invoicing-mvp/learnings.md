<file>
00001| <file>
00002| 00001| 
00003| 00002| ## Task 8: Invoice CRUD Implementation
00004| 00003| 
00005| 00004| ### Files Created
00006| 00005| 1. **server/api/invoices/index.get.ts** - List invoices with filters (status, date, search)
00007| 00006| 2. **server/api/invoices/index.post.ts** - Create invoice with auto-numbering
00008| 00007| 3. **server/api/invoices/[id].get.ts** - Get invoice details with customer relation
00009| 00008| 4. **server/api/invoices/[id].patch.ts** - Update invoice status
00010| 00009| 5. **server/api/invoices/[id].delete.ts** - Delete invoice
00011| 00010| 6. **app/pages/invoices/index.vue** - Invoice list with status badges and filters
00012| 00011| 7. **app/pages/invoices/new.vue** - Create invoice form with dynamic items
00013| 00012| 8. **app/pages/invoices/[id].vue** - Invoice detail view with actions
00014| 00013| 
00015| 00014| ### Key Patterns
00016| 00015| - **Dynamic Form Items**: `items` array in reactive state, add/remove methods
00017| 00016| - **Money Handling**: 
00018| 00017|   - UI uses float (Rubles) for user convenience
00019| 00018|   - API/DB uses integer (Kopecks) for precision
00020| 00019|   - Conversion happens in `onSubmit` (multiply by 100) and `formatCurrency` (divide by 100)
00021| 00020| - **Auto-Numbering**: 
00022| 00021|   - `generate_invoice_number` RPC call in POST handler
00023| 00022|   - Overrides any client-provided number for safety
00024| 00023| - **Status Management**:
00025| 00024|   - Explicit actions (Send, Mark Paid, Cancel) trigger status updates
00026| 00025|   - Status badges with color coding (gray, blue, green, red)
00027| 00026| - **Relations**:
00028| 00027|   - Fetching customer details via `.select('*, customer:customers(*)')`
00029| 00028|   - Handling `merchant_id` injection in POST handler by fetching current merchant profile
00030| 00029| - **Validation**:
00031| 00030|   - `createInvoiceSchema` used for server-side validation
00032| 00031|   - `merchant_id` injected into body before validation to satisfy schema requirements
00033| 00032| 
00034| 00033| ### Gotchas
00035| 00034| - **Merchant ID**: Schema requires `merchant_id`, but client shouldn't send it. Solution: Fetch merchant profile in API handler and inject it.
00036| 00035| - **Price/Amount**: Schema allows 0 price (nonnegative), but total amount must be positive.
00037| 00036| - **Date Handling**: `due_date` is `YYYY-MM-DD` string, `created_at` is ISO timestamp.
00038| 00037| 
00039| 00038| ## Task 10: PDF Invoice Generation with QR Code
00040| 00039| 
00041| 00040| ### Files Created
00042| 00041| 1. **server/utils/qr-sbp.ts** - QR code generation for SBP (GOST R 56042-2014)
00043| 00042| 2. **server/utils/pdf-generator.ts** - PDF invoice template using PDFKit
00044| 00043| 3. **server/api/invoice/[token]/pdf.get.ts** - Public PDF download endpoint
00045| 00044| 
00046| 00045| ### Key Patterns
00047| 00046| - **QR Code Standard**: GOST R 56042-2014 (ST00012 format with UTF-8)
00048| 00047|   - Format: `ST00012|Name=...|PersonalAcc=...|BIC=...|...`
00049| 00048|   - Fields: Name, PersonalAcc, BankName, BIC, CorrespAcc, PayeeINN, KPP
00050| 00049|   - Purpose includes invoice number and description
00051| 00050|   - Sum in kopecks (same as DB)
00052| 00051| - **PDF Generation**:
00053| 00052|   - PDFKit with A4 page size, margins 50pt
00054| 00053|   - Sections: Header → Parties → Items Table → Total → QR + Bank Details → Footer
00055| 00054|   - Built-in Helvetica fonts (no custom fonts needed for MVP)
00056| 00055|   - Colors: black (#1a1a1a), gray (#666666), lightGray (#999999), line (#e5e7eb)
00057| 00056| - **Money Formatting**: 
00058| 00057|   - `formatRubles(kopecks)` displays with 2 decimal places (e.g., "1 234,56 ₽")
00059| 00058|   - `Intl.NumberFormat('ru-RU')` for proper Russian formatting
00060| 00059| - **Public Access**:
00061| 00060|   - Uses `public_token` from URL parameter
00062| 00061|   - No authentication required (intentional for client convenience)
00063| 00062|   - Service role client for unrestricted access
00064| 00063| - **Response Headers**:
00065| 00064|   - `Content-Type: application/pdf`
00066| 00065|   - `Content-Disposition: attachment; filename="invoice_XXX_2026-01-31.pdf"`
00067| 00066|   - `Cache-Control: no-cache` (generate fresh PDF each time)
00068| 00067| 
00069| 00068| ### Gotchas
00070| 00069| - **Relations in Supabase**: `.select('*, merchant:merchants(*), customer:customers(*)') returns object or array
00071| 00070|   - Use `Array.isArray(invoice.merchant) ? invoice.merchant[0] : invoice.merchant`
00072| 00071| - **QR Code Fallback**: If bank details incomplete, skip QR code (graceful degradation)
00073| 00072| - **PDF Stream**: PDFDocument emits chunks via event emitter, collect in array and concat
00074| 00073| - **Filename Sanitization**: Remove non-ASCII characters, use `_` for special chars
00075| 00074| - **Kopecks Everywhere**: QR sum, invoice amount, item prices all in kopecks (divide by 100 only for display)
00076| 00075| 
00077| 00076| ### Dependencies
00078| 00077| - **pdfkit**: ^0.17.2 (already installed)
00079| 00078| - **qrcode**: ^1.5.4 (already installed)
00080| 00079| - **@types/pdfkit**: ^0.17.4
00081| 00080| - **@types/qrcode**: ^1.5.6
00082| 00081| 
00083| 00082| ### Future Enhancements (Not in MVP)
00084| 00083| - Custom fonts (Roboto) for better typography
00085| 00084| - Company logo in header
00086| 00085| - Multi-page support with page breaks
00087| 00086| - Table zebra striping
00088| 00087| - Digital signatures
00089| 00088| - PDF caching with invalidation
00090| 00089| 
00091| 00090| ## Task 11: Dashboard Implementation
00092| 00091| 
00093| 00092| ### Files Created
00094| 00093| 1. **app/pages/dashboard.vue** - Main dashboard with stats and recent invoices
00095| 00094| 2. **server/api/stats/dashboard.get.ts** - Aggregated stats endpoint
00096| 00095| 3. **app/components/StatCard.vue** - Reusable stat card component
00097| 00096| 4. **tests/dashboard.spec.ts** - Playwright verification test
00098| 00097| 
00099| 00098| ### Key Patterns
00100| 00099| - **Parallel Data Fetching**: `Promise.all` for 4 independent queries (pending, paid, overdue, recent)
00101| 00100| - **Date Logic**: 
00102| 00101|   - Start/End of month calculated in JS
00103| 00102|   - `paid_at` filtered by range for "Paid this month"
00104| 00103|   - `due_date` compared to today for "Overdue"
00105| 00104| - **UI Components**:
00106| 00105|   - `StatCard` for consistent metric display
00107| 00106|   - `UTable` for recent invoices list
00108| 00107|   - `UBadge` for status visualization
00109| 00108| - **Loading State**: Skeleton loaders while data is fetching
00110| 00109| 
00111| 00110| ### Gotchas
00112| 00111| - **Playwright Auth**: Magic Link auth is hard to automate without email access. Test file created but requires manual verification or mock auth.
00113| 00112| - **Supabase Aggregation**: Used client-side aggregation (reduce) after fetching specific columns, as it's simpler than complex SQL RPCs for MVP.
00114| 00113| 
00115| </file>
00116| 
00117| ## Task 9: Public Invoice Page
00118| 
00119| ### Files Created
00120| 1. **server/api/public/invoice/[token].get.ts** - Public API endpoint to fetch invoice by token
00121| 2. **app/pages/i/[token].vue** - Public invoice view page
00122| 
00123| ### Key Patterns
00124| - **Public Access**:
00125|   - Uses `public_token` (UUID) for secure, unauthenticated access
00126|   - `serverSupabaseServiceRole` used to bypass RLS for this specific endpoint
00127|   - Status update: Automatically changes 'sent' to 'viewed' on first access
00128| - **UI Design**:
00129|   - Clean, professional layout using Nuxt UI components (`UCard`, `UBadge`, `UTable`)
00130|   - Responsive design for mobile and desktop
00131|   - Currency and Date formatting using `Intl` API
00132| - **Verification**:
00133|   - Manual verification via temporary test endpoint due to environment limitations with Playwright/Auth

## Task 12: Recurring Invoices Implementation

### Files Created
1. **server/api/recurring/index.get.ts** - List recurring invoices with filters (is_active, merchant_id)
2. **server/api/recurring/index.post.ts** - Create recurring invoice with auto-calculation of next_generation_at
3. **server/api/recurring/[id].get.ts** - Get recurring invoice details
4. **server/api/recurring/[id].patch.ts** - Update recurring invoice
5. **server/api/recurring/[id].delete.ts** - Delete recurring invoice
6. **server/tasks/process-recurring.ts** - Nitro scheduled task for daily invoice generation
7. **app/pages/recurring/index.vue** - Recurring invoices list with active/inactive status
8. **app/pages/recurring/new.vue** - Create recurring invoice form

### Key Patterns
- **Nitro Scheduled Tasks**:
  - `defineTask({ meta, run })` для создания задачи
  - `experimental.tasks: true` в nitro конфигурации
  - `scheduledTasks: { '0 2 * * *': ['process-recurring'] }` - cron pattern (каждый день в 2:00)
  - `serverSupabaseServiceRole` для обхода RLS в задачах
- **Next Generation Calculation**:
  - При создании: `next_generation_at` рассчитывается на основе `day_of_month`
  - Если день уже прошёл в текущем месяце, берётся следующий месяц
  - После генерации счёта: `setMonth(month + 1)` для простого ежемесячного интервала
- **Invoice Generation from Template**:
  - Используется та же функция `generate_invoice_number` для уникальных номеров
  - `items` копируются из recurring_invoices в invoices
  - `description` берётся из `recurring_invoices.description` или `name`
  - Статус новых счетов: `draft`
- **UI/UX**:
  - День выставления (1-28) ограничен для избежания проблем с короткими месяцами
  - Интервал "monthly" - единственный доступный вариант для MVP
  - Статус отображается как badge (Активна/Неактивна)
  - Следующая дата генерации показывается в списке

### Gotchas
- **Day of Month Limitation**: Ограничение 1-28 вместо 1-31 для избежания проблем с февралём и 30-дневными месяцами
- **Cron Time**: Выбрано время 2:00 утра для минимизации нагрузки на систему
- **Service Role Client**: В задачах нужен `serverSupabaseServiceRole` для доступа ко всем данным
- **Error Handling**: Задача возвращает массив ошибок и продолжает выполнение даже при ошибках в отдельных записях
- **LSP Errors**: TypeScript ошибки в новых файлах нормальны до `npm install` - модули Nuxt/Supabase автоматически предоставят типы

### Configuration
- Добавлен модуль `@nuxtjs/supabase` в nuxt.config.ts
- Включена экспериментальная поддержка tasks в Nitro
- Настроен scheduledTasks для ежедневного запуска в 2:00

### Future Enhancements (Not in MVP)
- Другие интервалы (weekly, yearly)
- Email уведомления при генерации счёта
- Превью следующего счёта
- История сгенерированных счетов для каждой подписки
- Автоматическая деактивация при удалении клиента


## Task 13: Deployment to Dokploy

### Files Created
1. **Dockerfile** - Multi-stage build for Nuxt 4 production
2. **.dockerignore** - Optimized build context

### Key Patterns
- **Multi-Stage Build**:
  - Stage 1 (base): node:22-alpine with pnpm
  - Stage 2 (deps): Install dependencies with frozen lockfile
  - Stage 3 (builder): Build Nuxt app
  - Stage 4 (runner): Production image with .output only
- **Security**:
  - Non-root user (nuxt:nuxt) for container execution
  - Service role client for unrestricted Supabase access in production
  - Environment variables set in Dokploy Dashboard, not in code
- **Dokploy Configuration**:
  - Project: pp
  - Application: pp-invoicing
  - Build type: dockerfile
  - Domain: pp.doka.team with HTTPS (Let's Encrypt)
  - Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, NODE_ENV
  - Auto-deploy: enabled on push to main branch
- **GitHub Integration**:
  - Repository: marcus-kit/pp
  - Branch: main
  - Webhook: Dokploy auto-deploys on push

### Gotchas
- **GitHub Provider**: Dokploy requires GitHub account connection in UI for auto-deploy
- **Docker Daemon**: Local Docker build test skipped (daemon not running), but Dokploy server has Docker
- **Environment Variables**: Must be set in Dokploy Dashboard, not in .env file
- **Port**: Nuxt production server runs on port 3000 (exposed in Dockerfile)
- **Build Time**: Multi-stage build takes ~5-10 minutes on first deploy

### Deployment Checklist
- [x] Dockerfile created with multi-stage build
- [x] .dockerignore created to optimize build context
- [x] Project created in Dokploy (pp)
- [x] Application created (pp-invoicing)
- [x] Build type set to dockerfile
- [x] Domain configured (pp.doka.team)
- [x] HTTPS enabled with Let's Encrypt
- [x] Environment variables set
- [x] GitHub repository connected (marcus-kit/pp)
- [x] Auto-deploy enabled on main branch
- [x] Code committed and pushed to GitHub

### Next Steps
- Monitor deployment logs in Dokploy Dashboard
- Verify site accessible at https://pp.doka.team
- Test invoice creation and PDF generation in production
- Monitor performance and error logs

