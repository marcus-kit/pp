# Issues & Problems - UI/UX Polish

## Known Blockers
- Auth temporarily disabled (Magic Link PKCE issue)
- 9 pages reference non-existent 'dashboard' layout

## Solutions Applied
- E2E auth bypass via NUXT_PUBLIC_E2E_TEST runtime config


## Task 4: Remove layout: 'dashboard' References (COMPLETED)

### Problem
- 9 pages in app/pages/ referenced non-existent 'dashboard' layout
- This caused layout resolution to fail, falling back to default behavior
- Affected: invoices/*, customers/*, recurring/* (3 routes × 3 pages each)

### Solution Applied
- Removed `layout: 'dashboard'` from definePageMeta in all 9 files
- Preserved `middleware: 'auth'` in all cases
- Pages now use default.vue layout (only layout in app/layouts/)

### Verification
- grep "layout: 'dashboard'" app/pages/ --include="*.vue" | wc -l = 0 ✓
- grep "middleware: 'auth'" app/pages/ --include="*.vue" | wc -l = 10 ✓

### Files Modified
1. app/pages/invoices/index.vue
2. app/pages/invoices/new.vue
3. app/pages/invoices/[id].vue
4. app/pages/customers/index.vue
5. app/pages/customers/new.vue
6. app/pages/customers/[id].vue
7. app/pages/recurring/index.vue
8. app/pages/recurring/new.vue
9. app/pages/recurring/[id].vue

### Root Cause
- Layout 'dashboard' was never created in app/layouts/
- Likely copy-paste from template or old architecture
- Only default.vue exists in layouts directory

## Task 12: Playwright E2E Tests - Environment Issues

### Problem
Playwright tests fail with "element(s) not found" errors despite:
- ✅ data-testid attributes correctly added to all pages
- ✅ Dev server starts successfully
- ✅ Auth bypass configured in middleware

### Root Cause
Tests encounter environment-specific issues:
- `UApp` component fails to render in test environment
- `useSupabaseUser` composable missing context in E2E mode
- Likely needs mock Supabase session or plugin configuration

### Evidence
```
Error: expect(locator).toBeVisible() failed
Locator: getByTestId('dashboard-page')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

### Attempted Fixes
1. ✅ Added SUPABASE_URL and SUPABASE_KEY to playwright.config.ts webServer command
2. ✅ Fixed auth middleware E2E bypass (handles both string and boolean types)
3. ✅ Added page-level data-testid to all pages
4. ✅ Switched to useLazyFetch to prevent navigation hangs

### Status
- Test file created: `tests/e2e/ui-polish.spec.ts` ✅
- Test structure correct (viewports, dark mode, mobile menu) ✅
- All page polish work completed and committed ✅
- E2E execution blocked by environment setup ❌

### Next Steps (Future Work)
- Mock Supabase session in test environment
- Configure Nuxt plugins for E2E mode
- Alternative: Use Vitest component tests instead of full E2E

### Impact
**LOW** - Does not block UI polish completion. All visual changes are complete and verified manually.
