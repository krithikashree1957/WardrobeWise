import { test, expect } from '@playwright/test';

test('Dashboard loads successfully', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByText('WardrobeWise').first()).toBeVisible();
  await expect(page.getByText('Ready for a productive day?')).toBeVisible();
});

test('User can select different moods on Dashboard', async ({ page }) => {
  await page.goto('/dashboard');

  const bold = page.getByText('BOLD', { exact: true });
  const chill = page.getByText('CHILL', { exact: true });
  const minimal = page.getByText('MINIMAL', { exact: true });

  await expect(bold).toBeVisible();
  await expect(chill).toBeVisible();
  await expect(minimal).toBeVisible();

  await bold.click();
  await chill.click();
  await minimal.click();

  await expect(minimal).toBeVisible();
});