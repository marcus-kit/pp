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

## Future Phases
- Phase 2: Payments table (separate from invoices)
- Phase 3: Statement imports and transaction matching
- Phase 4: Automated invoice generation from recurring templates
