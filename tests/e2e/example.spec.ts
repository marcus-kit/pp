import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/PP Invoicing/)
})

test('auth bypass works for e2e tests', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).not.toHaveURL(/\/auth\/login/)
})
