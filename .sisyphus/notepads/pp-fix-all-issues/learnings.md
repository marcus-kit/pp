# Recurring API Fix - Learnings

## Pattern Applied: serverSupabaseServiceRole

### Files Fixed (5 total)
1. `app/server/api/recurring/index.get.ts` - List recurring invoices
2. `app/server/api/recurring/index.post.ts` - Create recurring invoice
3. `app/server/api/recurring/[id].get.ts` - Get single recurring invoice
4. `app/server/api/recurring/[id].patch.ts` - Update recurring invoice
5. `app/server/api/recurring/[id].delete.ts` - Delete recurring invoice

### Changes Applied

#### Import Pattern
```typescript
// BEFORE
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// AFTER
import { serverSupabaseServiceRole } from '#supabase/server'
import { getOrCreateDefaultMerchant } from '~/server/utils/merchant'
```

#### Client Initialization
```typescript
// BEFORE
const user = await serverSupabaseUser(event)
if (!user) {
  throw createError({ statusCode: 401, message: 'Unauthorized' })
}
const client = await serverSupabaseClient<Database>(event)
const { data: merchant } = await client
  .from('merchants')
  .select('id')
  .eq('user_id', user.id)
  .single()

// AFTER
const client = await serverSupabaseServiceRole<Database>(event)
const merchant = await getOrCreateDefaultMerchant(client)
```

### Key Points
- Removed all `serverSupabaseUser` auth checks
- Removed manual merchant lookup (now handled by `getOrCreateDefaultMerchant`)
- All endpoints now use service role (bypasses RLS)
- Merchant filtering still applied via `merchant.id` from helper function
- No 401 errors thrown - service role handles auth

### Verification
- All 5 files pass LSP diagnostics (no errors)
- Pattern consistent across all files
- Ready for testing

## Merchant API Service Role Migration (2026-02-01)

### Pattern Applied
Both merchant profile endpoints migrated from `serverSupabaseClient` + user auth to `serverSupabaseServiceRole`:

**Files changed:**
- `app/server/api/merchant/profile.get.ts`
- `app/server/api/merchant/profile.patch.ts`

### Key Changes
1. Replaced `serverSupabaseClient` → `serverSupabaseServiceRole`
2. Removed `serverSupabaseUser` auth checks (no 401 errors)
3. Replaced `user.id` lookups with `getOrCreateDefaultMerchant(client)`
4. Changed filter from `.eq('user_id', user.id)` → `.eq('id', merchant.id)`

### Why This Works
- Service role bypasses RLS, allowing direct merchant access
- `getOrCreateDefaultMerchant` handles merchant creation on first call
- No auth required = simpler API, works for public/demo scenarios
- Merchant ID is deterministic (first merchant or newly created)

### Comments Added
- "Получаем или создаём мерчанта по умолчанию" — necessary because function has side effect (creation)
- "Получаем полный профиль мерчанта" — clarifies intent after merchant lookup

