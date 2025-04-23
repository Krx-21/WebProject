# Test info

- Name: Promotions Page >> should display promotions page with tabs
- Location: C:\SW_Practice\SE_project\WebProject\tests\promotions.spec.js:8:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/promotions
Call log:
  - navigating to "http://localhost:3000/promotions", waiting until "load"

    at C:\SW_Practice\SE_project\WebProject\tests\promotions.spec.js:5:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Promotions Page', () => {
   4 |   test.beforeEach(async ({ page }) => {
>  5 |     await page.goto('http://localhost:3000/promotions');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/promotions
   6 |   });
   7 |
   8 |   test('should display promotions page with tabs', async ({ page }) => {
   9 |     await expect(page.getByText('Promotions')).toBeVisible();
  10 |
  11 |     // Tabs are present
  12 |     await expect(page.getByRole('tab', { name: /All/i })).toBeVisible();
  13 |     await expect(page.getByRole('tab', { name: /Active/i })).toBeVisible();
  14 |     await expect(page.getByRole('tab', { name: /Upcoming/i })).toBeVisible();
  15 |   });
  16 |
  17 |   test('should display promotions under "All" tab', async ({ page }) => {
  18 |     const cards = await page.locator('.promotion-card').all();
  19 |     expect(cards.length).toBeGreaterThan(0);
  20 |
  21 |     for (const card of cards) {
  22 |       await expect(card).toBeVisible();
  23 |       await expect(card.locator('.provider-name')).toBeVisible();
  24 |     }
  25 |   });
  26 |
  27 |   test('should switch to Active promotions tab', async ({ page }) => {
  28 |     await page.getByRole('tab', { name: /Active/i }).click();
  29 |
  30 |     const cards = await page.locator('.promotion-card').all();
  31 |     expect(cards.length).toBeGreaterThan(0);
  32 |
  33 |     for (const card of cards) {
  34 |       const startDate = new Date(await card.getAttribute('data-start-date'));
  35 |       const endDate = new Date(await card.getAttribute('data-end-date'));
  36 |       const now = new Date();
  37 |       expect(startDate <= now && endDate >= now).toBe(true);
  38 |     }
  39 |   });
  40 |
  41 |   test('should switch to Upcoming promotions tab', async ({ page }) => {
  42 |     await page.getByRole('tab', { name: /Upcoming/i }).click();
  43 |
  44 |     const cards = await page.locator('.promotion-card').all();
  45 |     expect(cards.length).toBeGreaterThan(0);
  46 |
  47 |     for (const card of cards) {
  48 |       const startDate = new Date(await card.getAttribute('data-start-date'));
  49 |       const now = new Date();
  50 |       expect(startDate > now).toBe(true);
  51 |     }
  52 |   });
  53 | });
  54 |
```