import { test, expect } from '@playwright/test';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// WM-01: Add a new clothing item
test('User can add a new clothing item to the wardrobe', async ({ page }) => {
  await page.goto('/dashboard');

  await page.getByText('ADD ITEM', { exact: true }).click();

  await expect(page).toHaveURL(/\/wardrobe\/add/);
  await expect(page.getByText('Add to Wardrobe')).toBeVisible();

  const imagePath = path.join(__dirname, 'fixtures', 'kurti.webp');
  await page.locator('input[type="file"]').setInputFiles(imagePath);

  await page.locator('select').first().selectOption('top');

  await page.getByPlaceholder('e.g. Indigo').fill('light blue');
  await page.getByPlaceholder('e.g. Cotton').fill('cotton');
  await page.getByPlaceholder("e.g. Levi's").fill('-');
  await page.getByPlaceholder('e.g. Solid').fill('solid');
  await page.getByPlaceholder('e.g. Long').fill('full');
  await page.getByPlaceholder('e.g. 89').fill('500');

  await page.getByRole('button', {
    name: 'all-season',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: 'wedding',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: 'Save to Wardrobe',
  }).click();

  await expect(page).toHaveURL(/\/wardrobe/);
  await expect(page.getByText('My Wardrobe')).toBeVisible();

  await expect(
    page.locator('img[alt="light blue"]').first()
  ).toBeVisible();
});


// WM-02: Mark item as worn today
test('User can mark a wardrobe item as worn today', async ({ page }) => {
  await page.goto('/wardrobe');

  await page.locator('img[alt="light blue"]').first().click();

  await expect(page.getByText('Times Worn')).toBeVisible();

  const timesWornField = page.getByText('Times Worn').locator('..');

  const initialCount = Number(
    await timesWornField.locator('div').nth(1).innerText()
  );

  await page.getByRole('button', {
    name: 'Mark as Worn Today',
  }).click();

  await expect.poll(async () => {
    return Number(
      await timesWornField.locator('div').nth(1).innerText()
    );
  }).toBe(initialCount + 1);

  await page.reload();

  await expect.poll(async () => {
    return Number(
      await timesWornField.locator('div').nth(1).innerText()
    );
  }).toBe(initialCount + 1);
});


// WM-03: Change laundry status
test('User can change the laundry status of a wardrobe item', async ({ page }) => {
  await page.goto('/wardrobe');

  await page.locator('img[alt="light blue"]').first().click();

  await expect(page.getByText('Laundry Status')).toBeVisible();

  const laundryStatuses = [
    'Clean',
    'Worn Once',
    'Needs Washing',
    'Ironed',
  ];

  for (const status of laundryStatuses) {
    const button = page.locator('button').filter({
      hasText: status,
    });

    await expect(button).toBeVisible();

    await button.click();

    await expect(button).toHaveClass(
      /bg-primary-container\/20/
    );
  }
});


// WM-04: Filter wardrobe items by category
test('User can filter wardrobe items by category', async ({ page }) => {
  await page.goto('/wardrobe');

  await expect(page.getByText('My Wardrobe')).toBeVisible();

  // Test Tops category
  await page.getByRole('button', {
    name: 'Tops',
    exact: true,
  }).click();

  await expect(
    page.locator('img[alt="light blue"]').first()
  ).toBeVisible();

  // Test an empty category
  await page.getByRole('button', {
    name: 'Shoes',
    exact: true,
  }).click();

  await expect(
    page.getByText('No items found', { exact: true })
  ).toBeVisible();

  // Return to All
  await page.getByRole('button', {
    name: 'All',
    exact: true,
  }).click();

  await expect(
    page.locator('img[alt="light blue"]').first()
  ).toBeVisible();
});


// WM-05: Remove item from wardrobe
test('User can remove a clothing item from the wardrobe', async ({ page }) => {
  await page.goto('/wardrobe');

  // Open the first light-blue wardrobe item
  await page.locator('img[alt="light blue"]').first().click();

  // Verify that the item detail page has loaded
  await expect(page.getByText('Times Worn')).toBeVisible();

  // Handle the browser confirmation dialog
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe(
      'Remove this item from your wardrobe?'
    );

    await dialog.accept();
  });

  // Find the actual Remove button
  const removeButton = page.getByRole('button', {
    name: /Remove from wardrobe/i,
  });

  await expect(removeButton).toBeVisible();

  await removeButton.click();

  // Verify that the application returns to the wardrobe page
  await expect(page).toHaveURL(/\/wardrobe/);

  await expect(page.getByText('My Wardrobe')).toBeVisible();

  // Verify that the removed item is no longer displayed
  await expect(
    page.locator('img[alt="light blue"]')
  ).toHaveCount(0);
});