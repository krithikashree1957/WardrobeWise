import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ request, page }) => {
  const email = process.env.PLAYWRIGHT_EMAIL;
  const password = process.env.PLAYWRIGHT_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'PLAYWRIGHT_EMAIL and PLAYWRIGHT_PASSWORD environment variables are required.'
    );
  }

  const response = await request.post('http://localhost:5000/api/v1/auth/login', {
    data: {
      email,
      password,
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  const { user, accessToken, refreshToken } = body.data;

  await page.goto('/login');

  await page.evaluate(
    ({ user, accessToken, refreshToken }) => {
      localStorage.setItem('ww_access_token', accessToken);
      localStorage.setItem('ww_refresh_token', refreshToken);
      localStorage.setItem('ww_user', JSON.stringify(user));
    },
    { user, accessToken, refreshToken }
  );

  await page.context().storageState({ path: authFile });
});