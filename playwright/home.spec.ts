import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page with correct metadata and title', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Gareth Wright/i);

    // Verify key meta tags
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveCount(1);
    const metaViewport = page.locator('meta[name="viewport"]');
    await expect(metaViewport).toHaveCount(1);
  });

  test('should display hero section and navigation links', async ({ page }) => {
    await page.goto('/');

    // Check main navigation links exist
    const navSkills = page.locator('header a[href*="#skills"], nav a[href*="#skills"]');
    if (await navSkills.count() > 0) {
      await expect(navSkills.first()).toBeVisible();
    }

    // Check headings exist on page
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
  });

  test('should render 404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/unknown-page-route-404');
    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText(/404/i);
  });
});
