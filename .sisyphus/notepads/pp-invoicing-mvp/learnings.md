# PP Invoicing MVP - Learnings

## Schema Design Decisions

### 1. Multi-Tenant Architecture
- **merchant_id** on all tables for RLS isolation
- Each merchant sees only their own data
- Customers and invoices scoped to merchant

### 2. Money Storage
- All amounts stored as INTEGER in kopecks (not decimal)
- 10000 kopecks = 100.00 RUB
- Avoids floating-point precision issues
- Matches billing industry standard

### 3. UUID Primary Keys
- All tables use `gen_random_uuid()` for PK
- Distributed system friendly
- No sequential ID leakage

### 4. Public Invoice Access
- **public_token** UUID on invoices table
- Allows anonymous access to specific invoice
- Separate from merchant_id for RLS
- Enables public invoice links without auth

### 5. RLS Policies Pattern
- Service role: full access (FOR ALL TO service_role USING (true))
- Authenticated users: scoped to own merchant via subquery
- Anon users: limited to public_token access
- Prevents cross-merchant data leakage

### 6. Recurring Invoices
- Separate table for templates
- day_of_month (1-28) for safe monthly scheduling
- next_generation_at for cron job targeting
- Flexible JSONB items for service snapshots

### 7. Timestamps
- All tables have created_at, updated_at
- Using timestamptz (not timestamp) for timezone safety
- Triggers auto-update updated_at on changes

### 8. Constraints
- UNIQUE (merchant_id, invoice_number) for invoice numbering
- UNIQUE public_token for secure access
- CHECK constraints on day_of_month (1-28)
- Foreign keys with ON DELETE CASCADE/RESTRICT

## RLS Isolation Strategy

### Merchants Table
- Users can only view/update their own profile
- Linked via auth.uid() = user_id

### Customers Table
- Subquery: merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
- Prevents viewing other merchants' customers

### Invoices Table
- Same subquery pattern as customers
- Anon users can view via public_token (no RLS restriction)
- Service role bypasses all policies

### Recurring Invoices Table
- Same subquery pattern
- Ensures template isolation per merchant

## Indexes
- merchant_id on all tables (RLS filtering)
- status on invoices (common queries)
- is_active on recurring_invoices (active templates)
- public_token on invoices (public access lookup)
- next_generation_at on recurring_invoices (cron scheduling)

## Task 2: TypeScript Types and Zod Schemas

### Files Created
1. **shared/types/database.ts** - All database entity interfaces
   - Merchant, Customer, Invoice, RecurringInvoice
   - Insert/Update type variants using Omit/Partial
   - Database schema interface for Supabase client typing
   - All fields match SQL schema exactly

2. **shared/schemas/merchant.ts** - Zod validation for merchants
   - createMerchantSchema: full validation with user_id
   - updateMerchantSchema: partial fields for updates
   - Type inference with z.infer<>

3. **shared/schemas/customer.ts** - Zod validation for customers
   - createCustomerSchema: requires merchant_id
   - updateCustomerSchema: optional fields

4. **shared/schemas/invoice.ts** - Zod validation for invoices
   - createInvoiceSchema: full invoice creation
   - updateInvoiceSchema: status/date updates only
   - searchInvoicesSchema: query params with coerce.number()
   - InvoiceItem nested schema for line items

5. **shared/schemas/recurring.ts** - Zod validation for recurring invoices
   - createRecurringInvoiceSchema: template creation
   - updateRecurringInvoiceSchema: template updates
   - day_of_month validation (1-28)

6. **shared/constants/statuses.ts** - Status enums and UI mappings
   - MERCHANT_TYPES: individual, self_employed, company
   - INVOICE_STATUSES: draft, sent, viewed, paid, cancelled, overdue
   - RECURRING_INTERVALS: monthly
   - Each with label (Russian) and icon (Lucide)

7. **app/composables/useFormatters.ts** - Formatting utilities
   - formatMoney(kopecks): converts to RUB with Intl.NumberFormat
   - formatDate(dateString): ISO to localized date
   - formatDateTime(dateString): ISO to localized date+time

### Type System Patterns
- **No 'any' types** - all fields explicitly typed
- **Nullable fields**: use `string | null` (not `string | undefined`)
- **Money**: always `number` (kopecks as integer)
- **Dates**: ISO strings for dates (YYYY-MM-DD), ISO strings for timestamps
- **Enums**: union types for TypeScript, z.enum() for Zod

### Zod Validation Patterns
- **UUID validation**: z.string().uuid('error message')
- **Money validation**: z.number().int().positive()
- **Query params**: z.coerce.number() for string→number conversion
- **Nullable fields**: z.string().nullable().optional()
- **Enums**: z.enum(['value1', 'value2'])

### Export Structure
- shared/types/index.ts exports all from database.ts
- shared/schemas/index.ts exports all schema files
- Enables: `import { Merchant, createMerchantSchema } from '~/shared'`

## Future Phases
- Phase 2: Payments table (separate from invoices)
- Phase 3: Statement imports and transaction matching
- Phase 4: Automated invoice generation from recurring templates

## Task 3: Database Migrations Applied

### Migration Execution
- Applied SQL schema from `sql/001-schema.sql` to Supabase self-hosted instance
- Location: supabase.doka.team (port 5434)
- Method: Direct psql connection via SSH to doka-server

### Tables Created
1. **merchants** - Seller profiles with auth.users link
   - user_id (UNIQUE) for RLS isolation
   - merchant_type enum (individual, self_employed, company)
   - Full business details (INN, KPP, OGRN, address)

2. **customers** - Buyer profiles per merchant
   - merchant_id FK for RLS isolation
   - Full business details (INN, KPP, OGRN, address)
   - Indexed on merchant_id for fast filtering

3. **invoices** - Invoice documents
   - merchant_id + invoice_number UNIQUE constraint
   - public_token UUID for anonymous access
   - Status enum (draft, sent, viewed, paid, cancelled, overdue)
   - JSONB items for flexible line items
   - Indexed on merchant_id, status, issued_at, public_token

4. **recurring_invoices** - Invoice templates
   - merchant_id for RLS isolation
   - day_of_month (1-28) for safe monthly scheduling
   - next_generation_at for cron job targeting
   - Indexed on merchant_id, is_active, next_generation_at

### RLS Policies Verified
- **merchants**: Users see only own profile (auth.uid() = user_id)
- **customers**: Users see only own merchant's customers (subquery)
- **invoices**: Users see only own merchant's invoices + anon via public_token
- **recurring_invoices**: Users see only own merchant's templates
- **service_role**: Full access on all tables (for backend operations)

### Functions Created
- **generate_invoice_number(merchant_id)**: Returns INV-YYYY-NNNN format
  - YYYY: current year
  - NNNN: zero-padded sequential number per merchant per year
  - Prevents duplicate invoice numbers within merchant scope

### Triggers Created
- **trg_*_updated_at**: Auto-updates updated_at timestamp on all tables
- Uses update_updated_at() function for consistency

### Indexes Created
- merchant_id on all tables (RLS filtering performance)
- status on invoices (common query filter)
- is_active on recurring_invoices (active templates lookup)
- public_token on invoices (public access lookup)
- next_generation_at on recurring_invoices (cron scheduling)
- issued_at on invoices (date range queries)

### Supabase Configuration
- ANON_KEY: eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9...
- SERVICE_ROLE_KEY: eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9...
- Stored in .env.example for reference
- Database credentials in .env.example for local development

### Verification Results
✓ All 4 tables created successfully
✓ RLS enabled on all tables (rowsecurity = true)
✓ 21 RLS policies created and active
✓ generate_invoice_number function created
✓ All triggers created
✓ All indexes created

### Notes for Next Tasks
- Database is ready for API implementation (Task 6)
- RLS policies enforce merchant isolation automatically
- generate_invoice_number() can be called from API before INSERT
- Service role key needed for backend operations (create invoices, etc.)
- Anon key sufficient for public invoice viewing

## Task 3: Magic Link Authentication with Supabase

### Files Created
1. **app/pages/auth/login.vue** - Magic Link login form
   - Email-only input (no password)
   - Uses Supabase signInWithOtp() for Magic Link
   - Redirect URL: /auth/callback
   - Success message: "Ссылка для входа отправлена на ваш email!"
   - Error handling with message display
   - Styled with Tailwind + Nuxt UI components (UInput, UButton)

2. **app/pages/auth/callback.vue** - OAuth callback handler
   - Processes Supabase auth callback
   - Checks for active session
   - Redirects to /dashboard on success
   - Redirects to /auth/confirm if no session
   - Shows loading spinner during processing

3. **app/pages/auth/confirm.vue** - Email confirmation page
   - Static page shown after Magic Link sent
   - Instructions for user to check email
   - Tips for spam folder, email validation
   - Link back to login page

4. **app/middleware/auth.ts** - Route protection middleware
   - Public routes: /auth/login, /auth/callback, /auth/confirm
   - Protected routes: require active session
   - Redirects unauthenticated users to /auth/login
   - Uses Supabase getSession() for auth check

5. **app/pages/dashboard.vue** - Protected dashboard page
   - Accessible only to authenticated users
   - Logout button that calls supabase.auth.signOut()
   - Placeholder for future invoice/customer management

6. **nuxt.config.ts** - Updated runtime config
   - Added public.supabaseUrl and public.supabaseKey
   - Uses environment variables with placeholders
   - Accessible on client-side for Supabase client creation

### Authentication Flow
1. User visits /auth/login
2. Enters email and clicks "Отправить ссылку входа"
3. signInWithOtp() sends Magic Link to email
4. User clicks link in email → redirects to /auth/callback
5. Callback page checks session and redirects to /dashboard
6. Middleware protects /dashboard - requires active session
7. User can logout from dashboard → redirects to /auth/login

### Key Patterns
- **Supabase Client Creation**: `createClient(url, key)` on client-side
- **Magic Link**: `signInWithOtp({ email, options: { emailRedirectTo } })`
- **Session Check**: `getSession()` returns `{ data: { session } }`
- **Middleware**: `defineNuxtRouteMiddleware(async (to, from) => {})`
- **Navigation**: `navigateTo('/path')` for redirects
- **Runtime Config**: `useRuntimeConfig().public.supabaseUrl`

### Environment Variables Required
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Notes
- @nuxtjs/supabase module not used - using @supabase/supabase-js directly
- Middleware runs on every route navigation
- Public routes bypass auth check
- Session stored in Supabase auth state (localStorage)
- Magic Link valid for 24 hours by default
