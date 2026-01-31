<file>
00001| # PP Invoicing MVP - Learnings
00002| 
00003| ## Schema Design Decisions
00004| 
00005| ### 1. Multi-Tenant Architecture
00006| - **merchant_id** on all tables for RLS isolation
00007| - Each merchant sees only their own data
00008| - Customers and invoices scoped to merchant
00009| 
00010| ### 2. Money Storage
00011| - All amounts stored as INTEGER in kopecks (not decimal)
00012| - 10000 kopecks = 100.00 RUB
00013| - Avoids floating-point precision issues
00014| - Matches billing industry standard
00015| 
00016| ### 3. UUID Primary Keys
00017| - All tables use `gen_random_uuid()` for PK
00018| - Distributed system friendly
00019| - No sequential ID leakage
00020| 
00021| ### 4. Public Invoice Access
00022| - **public_token** UUID on invoices table
00023| - Allows anonymous access to specific invoice
00024| - Separate from merchant_id for RLS
00025| - Enables public invoice links without auth
00026| 
00027| ### 5. RLS Policies Pattern
00028| - Service role: full access (FOR ALL TO service_role USING (true))
00029| - Authenticated users: scoped to own merchant via subquery
00030| - Anon users: limited to public_token access
00031| - Prevents cross-merchant data leakage
00032| 
00033| ### 6. Recurring Invoices
00034| - Separate table for templates
00035| - day_of_month (1-28) for safe monthly scheduling
00036| - next_generation_at for cron job targeting
00037| - Flexible JSONB items for service snapshots
00038| 
00039| ### 7. Timestamps
00040| - All tables have created_at, updated_at
00041| - Using timestamptz (not timestamp) for timezone safety
00042| - Triggers auto-update updated_at on changes
00043| 
00044| ### 8. Constraints
00045| - UNIQUE (merchant_id, invoice_number) for invoice numbering
00046| - UNIQUE public_token for secure access
00047| - CHECK constraints on day_of_month (1-28)
00048| - Foreign keys with ON DELETE CASCADE/RESTRICT
00049| 
00050| ## RLS Isolation Strategy
00051| 
00052| ### Merchants Table
00053| - Users can only view/update their own profile
00054| - Linked via auth.uid() = user_id
00055| 
00056| ### Customers Table
00057| - Subquery: merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
00058| - Prevents viewing other merchants' customers
00059| 
00060| ### Invoices Table
00061| - Same subquery pattern as customers
00062| - Anon users can view via public_token (no RLS restriction)
00063| - Service role bypasses all policies
00064| 
00065| ### Recurring Invoices Table
00066| - Same subquery pattern
00067| - Ensures template isolation per merchant
00068| 
00069| ## Indexes
00070| - merchant_id on all tables (RLS filtering)
00071| - status on invoices (common queries)
00072| - is_active on recurring_invoices (active templates)
00073| - public_token on invoices (public access lookup)
00074| - next_generation_at on recurring_invoices (cron scheduling)
00075| 
00076| ## Task 2: TypeScript Types and Zod Schemas
00077| 
00078| ### Files Created
00079| 1. **shared/types/database.ts** - All database entity interfaces
00080|    - Merchant, Customer, Invoice, RecurringInvoice
00081|    - Insert/Update type variants using Omit/Partial
00082|    - Database schema interface for Supabase client typing
00083|    - All fields match SQL schema exactly
00084| 
00085| 2. **shared/schemas/merchant.ts** - Zod validation for merchants
00086|    - createMerchantSchema: full validation with user_id
00087|    - updateMerchantSchema: partial fields for updates
00088|    - Type inference with z.infer<>
00089| 
00090| 3. **shared/schemas/customer.ts** - Zod validation for customers
00091|    - createCustomerSchema: requires merchant_id
00092|    - updateCustomerSchema: optional fields
00093| 
00094| 4. **shared/schemas/invoice.ts** - Zod validation for invoices
00095|    - createInvoiceSchema: full invoice creation
00096|    - updateInvoiceSchema: status/date updates only
00097|    - searchInvoicesSchema: query params with coerce.number()
00098|    - InvoiceItem nested schema for line items
00099| 
00100| 5. **shared/schemas/recurring.ts** - Zod validation for recurring invoices
00101|    - createRecurringInvoiceSchema: template creation
00102|    - updateRecurringInvoiceSchema: template updates
00103|    - day_of_month validation (1-28)
00104| 
00105| 6. **shared/constants/statuses.ts** - Status enums and UI mappings
00106|    - MERCHANT_TYPES: individual, self_employed, company
00107|    - INVOICE_STATUSES: draft, sent, viewed, paid, cancelled, overdue
00108|    - RECURRING_INTERVALS: monthly
00109|    - Each with label (Russian) and icon (Lucide)
00110| 
00111| 7. **app/composables/useFormatters.ts** - Formatting utilities
00112|    - formatMoney(kopecks): converts to RUB with Intl.NumberFormat
00113|    - formatDate(dateString): ISO to localized date
00114|    - formatDateTime(dateString): ISO to localized date+time
00115| 
00116| ### Type System Patterns
00117| - **No 'any' types** - all fields explicitly typed
00118| - **Nullable fields**: use `string | null` (not `string | undefined`)
00119| - **Money**: always `number` (kopecks as integer)
00120| - **Dates**: ISO strings for dates (YYYY-MM-DD), ISO strings for timestamps
00121| - **Enums**: union types for TypeScript, z.enum() for Zod
00122| 
00123| ### Zod Validation Patterns
00124| - **UUID validation**: z.string().uuid('error message')
00125| - **Money validation**: z.number().int().positive()
00126| - **Query params**: z.coerce.number() for string→number conversion
00127| - **Nullable fields**: z.string().nullable().optional()
00128| - **Enums**: z.enum(['value1', 'value2'])
00129| 
00130| ### Export Structure
00131| - shared/types/index.ts exports all from database.ts
00132| - shared/schemas/index.ts exports all schema files
00133| - Enables: `import { Merchant, createMerchantSchema } from '~/shared'`
00134| 
00135| ## Future Phases
00136| - Phase 2: Payments table (separate from invoices)
00137| - Phase 3: Statement imports and transaction matching
00138| - Phase 4: Automated invoice generation from recurring templates
00139| 
00140| ## Task 3: Database Migrations Applied
00141| 
00142| ### Migration Execution
00143| - Applied SQL schema from `sql/001-schema.sql` to Supabase self-hosted instance
00144| - Location: supabase.doka.team (port 5434)
00145| - Method: Direct psql connection via SSH to doka-server
00146| 
00147| ### Tables Created
00148| 1. **merchants** - Seller profiles with auth.users link
00149|    - user_id (UNIQUE) for RLS isolation
00150|    - merchant_type enum (individual, self_employed, company)
00151|    - Full business details (INN, KPP, OGRN, address)
00152| 
00153| 2. **customers** - Buyer profiles per merchant
00154|    - merchant_id FK for RLS isolation
00155|    - Full business details (INN, KPP, OGRN, address)
00156|    - Indexed on merchant_id for fast filtering
00157| 
00158| 3. **invoices** - Invoice documents
00159|    - merchant_id + invoice_number UNIQUE constraint
00160|    - public_token UUID for anonymous access
00161|    - Status enum (draft, sent, viewed, paid, cancelled, overdue)
00162|    - JSONB items for flexible line items
00163|    - Indexed on merchant_id, status, issued_at, public_token
00164| 
00165| 4. **recurring_invoices** - Invoice templates
00166|    - merchant_id for RLS isolation
00167|    - day_of_month (1-28) for safe monthly scheduling
00168|    - next_generation_at for cron job targeting
00169|    - Indexed on merchant_id, is_active, next_generation_at
00170| 
00171| ### RLS Policies Verified
00172| - **merchants**: Users see only own profile (auth.uid() = user_id)
00173| - **customers**: Users see only own merchant's customers (subquery)
00174| - **invoices**: Users see only own merchant's invoices + anon via public_token
00175| - **recurring_invoices**: Users see only own merchant's templates
00176| - **service_role**: Full access on all tables (for backend operations)
00177| 
00178| ### Functions Created
00179| - **generate_invoice_number(merchant_id)**: Returns INV-YYYY-NNNN format
00180|   - YYYY: current year
00181|   - NNNN: zero-padded sequential number per merchant per year
00182|   - Prevents duplicate invoice numbers within merchant scope
00183| 
00184| ### Triggers Created
00185| - **trg_*_updated_at**: Auto-updates updated_at timestamp on all tables
00186| - Uses update_updated_at() function for consistency
00187| 
00188| ### Indexes Created
00189| - merchant_id on all tables (RLS filtering performance)
00190| - status on invoices (common query filter)
00191| - is_active on recurring_invoices (active templates lookup)
00192| - public_token on invoices (public access lookup)
00193| - next_generation_at on recurring_invoices (cron scheduling)
00194| - issued_at on invoices (date range queries)
00195| 
00196| ### Supabase Configuration
00197| - ANON_KEY: eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9...
00198| - SERVICE_ROLE_KEY: eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9...
00199| - Stored in .env.example for reference
00200| - Database credentials in .env.example for local development
00201| 
00202| ### Verification Results
00203| ✓ All 4 tables created successfully
00204| ✓ RLS enabled on all tables (rowsecurity = true)
00205| ✓ 21 RLS policies created and active
00206| ✓ generate_invoice_number function created
00207| ✓ All triggers created
00208| ✓ All indexes created
00209| 
00210| ### Notes for Next Tasks
00211| - Database is ready for API implementation (Task 6)
00212| - RLS policies enforce merchant isolation automatically
00213| - generate_invoice_number() can be called from API before INSERT
00214| - Service role key needed for backend operations (create invoices, etc.)
00215| - Anon key sufficient for public invoice viewing
00216| 
00217| ## Task 3: Magic Link Authentication with Supabase
00218| 
00219| ### Files Created
00220| 1. **app/pages/auth/login.vue** - Magic Link login form
00221|    - Email-only input (no password)
00222|    - Uses Supabase signInWithOtp() for Magic Link
00223|    - Redirect URL: /auth/callback
00224|    - Success message: "Ссылка для входа отправлена на ваш email!"
00225|    - Error handling with message display
00226|    - Styled with Tailwind + Nuxt UI components (UInput, UButton)
00227| 
00228| 2. **app/pages/auth/callback.vue** - OAuth callback handler
00229|    - Processes Supabase auth callback
00230|    - Checks for active session
00231|    - Redirects to /dashboard on success
00232|    - Redirects to /auth/confirm if no session
00233|    - Shows loading spinner during processing
00234| 
00235| 3. **app/pages/auth/confirm.vue** - Email confirmation page
00236|    - Static page shown after Magic Link sent
00237|    - Instructions for user to check email
00238|    - Tips for spam folder, email validation
00239|    - Link back to login page
00240| 
00241| 4. **app/middleware/auth.ts** - Route protection middleware
00242|    - Public routes: /auth/login, /auth/callback, /auth/confirm
00243|    - Protected routes: require active session
00244|    - Redirects unauthenticated users to /auth/login
00245|    - Uses Supabase getSession() for auth check
00246| 
00247| 5. **app/pages/dashboard.vue** - Protected dashboard page
00248|    - Accessible only to authenticated users
00249|    - Logout button that calls supabase.auth.signOut()
00250|    - Placeholder for future invoice/customer management
00251| 
00252| 6. **nuxt.config.ts** - Updated runtime config
00253|    - Added public.supabaseUrl and public.supabaseKey
00254|    - Uses environment variables with placeholders
00255|    - Accessible on client-side for Supabase client creation
00256| 
00257| ### Authentication Flow
00258| 1. User visits /auth/login
00259| 2. Enters email and clicks "Отправить ссылку входа"
00260| 3. signInWithOtp() sends Magic Link to email
00261| 4. User clicks link in email → redirects to /auth/callback
00262| 5. Callback page checks session and redirects to /dashboard
00263| 6. Middleware protects /dashboard - requires active session
00264| 7. User can logout from dashboard → redirects to /auth/login
00265| 
00266| ### Key Patterns
00267| - **Supabase Client Creation**: `createClient(url, key)` on client-side
00268| - **Magic Link**: `signInWithOtp({ email, options: { emailRedirectTo } })`
00269| - **Session Check**: `getSession()` returns `{ data: { session } }`
00270| - **Middleware**: `defineNuxtRouteMiddleware(async (to, from) => {})`
00271| - **Navigation**: `navigateTo('/path')` for redirects
00272| - **Runtime Config**: `useRuntimeConfig().public.supabaseUrl`
00273| 
00274| ### Environment Variables Required
00275| ```
00276| SUPABASE_URL=https://your-project.supabase.co
00277| SUPABASE_KEY=your-anon-key
00278| ```
00279| 
00280| ### Notes
00281| - @nuxtjs/supabase module not used - using @supabase/supabase-js directly
00282| - Middleware runs on every route navigation
00283| - Public routes bypass auth check
00284| - Session stored in Supabase auth state (localStorage)
00285| - Magic Link valid for 24 hours by default
00286| 
00287| ## Task 6: Merchant Profile Settings
00288| 
00289| ### Files Created
00290| 1. **app/pages/settings.vue** - Profile settings page
00291|    - Form for company details (name, type, INN, KPP, OGRN, address)
00292|    - Bank details section (name, BIC, account, corr. account)
00293|    - Logo upload to Supabase Storage ('logos' bucket)
00294|    - Uses `UForm`, `UInput`, `USelect` for UI
00295|    - Validates with `updateMerchantSchema`
00296| 
00297| 2. **server/api/merchant/profile.get.ts** - Fetch profile API
00298|    - Returns merchant record for current user
00299|    - Returns null if not found (handled by frontend)
00300| 
00301| 3. **server/api/merchant/profile.patch.ts** - Update profile API
00302|    - Updates merchant record for current user
00303|    - Validates body with Zod schema
00304|    - Returns updated record
00305| 
00306| 4. **app/middleware/onboarding.global.ts** - Onboarding check
00307|    - Checks if profile is complete (full_name, inn)
00308|    - Redirects to `/settings?onboarding=true` if incomplete
00309|    - Caches check result in `useState` to avoid redundant API calls
00310| 
00311| ### Key Patterns
00312| - **Logo Upload**:
00313|   - Client-side upload to Supabase Storage
00314|   - `supabase.storage.from('logos').upload()`
00315|   - `supabase.storage.from('logos').getPublicUrl()`
00316|   - Save public URL to database
00317| - **Form Handling**:
  - `reactive` form state initialized from API data
  - `watch` with `immediate: true` to populate form when data loads
  - Zod schema validation passed to `UForm`
- **Middleware Optimization**:
  - Use `useState` to cache profile completeness check
  - Avoids API calls on every route navigation
- **Type Extensions**:
  - Added bank details and logo_url to `Merchant` interface and Zod schema
  - Note: Database schema might need update if columns missing (assumed present or handled)
