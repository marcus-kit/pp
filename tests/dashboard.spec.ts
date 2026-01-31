import { test, expect } from '@playwright/test';

test('dashboard verification', async ({ page }) => {
  await page.goto('/auth/login');
  
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/dashboard/);

  await expect(page.getByText('Ожидает оплаты')).toBeVisible();
  await expect(page.getByText('Оплачено (этот месяц)')).toBeVisible();
  await expect(page.getByText('Просрочено')).toBeVisible();

  await expect(page.getByText('Недавние счета')).toBeVisible();

  const createBtn = page.getByRole('link', { name: 'Создать счёт' });
  await expect(createBtn).toBeVisible();

  await createBtn.click();

  await expect(page).toHaveURL(/\/invoices\/new/);
  
  await page.screenshot({ path: '.sisyphus/evidence/task-11-dashboard.png' });
});
