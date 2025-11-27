import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/create next app/i);
  });
});
