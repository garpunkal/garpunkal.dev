import { test, expect } from '@playwright/test';

test.describe('Skills Section', () => {
  test('should render the skills section with grouped categories', async ({ page }) => {
    await page.goto('/');

    const skillsSection = page.locator('#skills');
    await expect(skillsSection).toBeVisible();

    // Verify all 7 active categories are present in the DOM
    const expectedGroups = [
      'Backend',
      'Frontend',
      'Cloud',
      'CMS',
      'AI',
      'Tools',
      'Patterns, Practices and Security',
    ];

    for (const group of expectedGroups) {
      const groupLabel = page.locator('.skill-group-label', { hasText: new RegExp(`^${group}$`, 'i') });
      await expect(groupLabel).toBeVisible();
    }
  });

  test('should render skill chips with labels and logos', async ({ page }) => {
    await page.goto('/');

    const skillChips = page.locator('#skills .skill-chip');
    const chipCount = await skillChips.count();

    // Verify we have a rich list of skills (should be > 100)
    expect(chipCount).toBeGreaterThan(100);

    // Sample the first 10 chips to verify they have text and logos
    for (let i = 0; i < Math.min(10, chipCount); i++) {
      const chip = skillChips.nth(i);
      const title = await chip.getAttribute('title');
      expect(title).toBeTruthy();

      const logo = chip.locator('.skill-chip-left img');
      if (await logo.count() > 0) {
        const src = await logo.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).toMatch(/^https?:\/\/|\/|data:/);
      }
    }
  });

  test('should have valid links for external skills', async ({ page }) => {
    await page.goto('/');

    const skillLinks = page.locator('#skills a.skill-chip[href]');
    const count = await skillLinks.count();
    expect(count).toBeGreaterThan(50);

    // Verify links open in new tab with secure rel
    const firstLink = skillLinks.first();
    await expect(firstLink).toHaveAttribute('target', '_blank');
    await expect(firstLink).toHaveAttribute('rel', /noopener/);
  });

  test('should decrease icon opacity in dark mode until hover', async ({ page }) => {
    await page.goto('/');

    // Ensure dark mode is active
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    const firstChip = page.locator('#skills .skill-chip').first();
    const iconLeft = firstChip.locator('.skill-chip-left');
    
    // Check computed opacity before hover in dark mode
    const opacityBefore = await iconLeft.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacityBefore)).toBeCloseTo(0.75, 1);

    // Hover over the chip and wait for transition to complete
    await firstChip.hover();
    await page.waitForTimeout(300);
    const opacityAfter = await iconLeft.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacityAfter)).toBeCloseTo(1, 1);
  });
});

