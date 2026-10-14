import { test, expect } from '@playwright/test';

test.describe('Accessibility & Link Validation', () => {
  test('all links on the page should have descriptive accessible text', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');

      // Verify link has an href attribute
      expect(href, `Link index ${i} should have an href attribute`).toBeTruthy();

      // Verify link has an accessible name (text, aria-label, or title)
      const accessibleName = await link.evaluate((el: HTMLElement) => {
        return (
          el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          el.innerText.trim() ||
          el.querySelector('svg title')?.textContent?.trim() ||
          el.querySelector('img')?.getAttribute('alt')?.trim() ||
          ''
        );
      });

      expect(
        accessibleName.length,
        `Link with href "${href}" must have descriptive accessible text`
      ).toBeGreaterThan(0);
    }
  });

  test('all interactive buttons should have descriptive labels', async ({ page }) => {
    await page.goto('/');

    // Exclude Astro dev toolbar injected buttons in dev server
    const buttons = page.locator('button:not(astro-dev-toolbar *)');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const text = (await button.innerText()).trim();

      expect(
        Boolean(ariaLabel || title || text),
        `Button index ${i} must have an accessible label`
      ).toBe(true);
    }
  });

  test('theme toggle button toggles dark mode cleanly', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('#switchTheme');
    await expect(themeToggle).toBeVisible();

    const html = page.locator('html');
    const wasDarkInitially = await html.evaluate(el => el.classList.contains('dark'));

    await themeToggle.click();

    const isDarkAfter = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDarkAfter).toBe(!wasDarkInitially);
  });
});
