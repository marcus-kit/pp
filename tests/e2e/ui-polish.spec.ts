import { test, expect } from '@playwright/test'
import { exec } from 'child_process'

test.describe('UI Polish - Visual Regression & Responsiveness', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 }
  ]

  const pages = [
    { path: '/dashboard', testId: 'dashboard-page', name: 'Dashboard' },
    { path: '/invoices', testId: 'invoices-page', name: 'Invoices' },
    { path: '/customers', testId: 'customers-page', name: 'Customers' },
    { path: '/recurring', testId: 'recurring-page', name: 'Recurring' },
    { path: '/settings', testId: 'settings-page', name: 'Settings' },
    { path: '/auth/login', testId: 'login-page', name: 'Login' }
  ]

  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } })

      for (const pageInfo of pages) {
        test(`${pageInfo.name} renders correctly`, async ({ page }) => {
          await page.goto(pageInfo.path)
          await expect(page.getByTestId(pageInfo.testId)).toBeVisible()
          
          await page.waitForTimeout(500) 
          
          await page.screenshot({ 
            path: `.sisyphus/evidence/task-12-${pageInfo.name.toLowerCase()}-${viewport.name}.png`,
            fullPage: true 
          })
        })
      }

      test('Public Invoice (Error/Loading state)', async ({ page }) => {
        await page.goto('/i/test-token-invalid')
        await expect(page.getByTestId('public-invoice-page')).toBeVisible()
        await page.screenshot({ 
          path: `.sisyphus/evidence/task-12-public-invoice-${viewport.name}.png`,
          fullPage: true
        })
      })
    })
  }
})

test.describe('UI Polish - Dark Mode', () => {
  test.use({ colorScheme: 'dark' })

  test('Dashboard renders in dark mode', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await page.waitForTimeout(500)
    await page.screenshot({ path: '.sisyphus/evidence/task-12-dashboard-dark.png' })
  })
})

test.describe('UI Polish - Mobile Menu', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('Mobile menu opens and navigates', async ({ page }) => {
    await page.goto('/dashboard')
    
    const menuButton = page.getByTestId('mobile-menu-button')
    await expect(menuButton).toBeVisible()
    
    await menuButton.click()
    
    await page.waitForTimeout(500)
    
    await page.screenshot({ path: '.sisyphus/evidence/task-12-mobile-menu-open.png' })
    
    const navLink = page.locator('a[href="/invoices"]').first()
    await expect(navLink).toBeVisible()
  })
})

test.describe('UI Polish - Icon Audit', () => {
  test('No heroicons should be present in the codebase', async () => {
    const result = await new Promise<string>((resolve) => {
      exec('grep -r "i-heroicons" app/ --include="*.vue"', (error, stdout) => {
        resolve(stdout)
      })
    })
    expect(result.trim()).toBe('')
  })
})
