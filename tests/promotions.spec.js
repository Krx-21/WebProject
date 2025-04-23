import { test, expect } from '@playwright/test';

test.describe('Promotions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/promotions');
  });

  test('should display promotions page with tabs', async ({ page }) => {
    await expect(page.getByText('Promotions')).toBeVisible();

    // Tabs are present
    await expect(page.getByRole('tab', { name: /All/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Active/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Upcoming/i })).toBeVisible();
  });

  test('should display promotions under "All" tab', async ({ page }) => {
    const cards = await page.locator('.promotion-card').all();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      await expect(card).toBeVisible();
      await expect(card.locator('.provider-name')).toBeVisible();
    }
  });

  test('should switch to Active promotions tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Active/i }).click();

    const cards = await page.locator('.promotion-card').all();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const startDate = new Date(await card.getAttribute('data-start-date'));
      const endDate = new Date(await card.getAttribute('data-end-date'));
      const now = new Date();
      expect(startDate <= now && endDate >= now).toBe(true);
    }
  });

  test('should switch to Upcoming promotions tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Upcoming/i }).click();

    const cards = await page.locator('.promotion-card').all();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const startDate = new Date(await card.getAttribute('data-start-date'));
      const now = new Date();
      expect(startDate > now).toBe(true);
    }
  });
});
