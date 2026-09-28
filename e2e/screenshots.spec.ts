import { expect, test, type Page } from '@playwright/test';

/** Not part of the smoke run: `npm run screenshots` writes the README images. */

const DIR = 'docs/screenshots';
const shot = (page: Page, name: string) =>
  page.screenshot({ path: `${DIR}/${name}.png`, animations: 'disabled' });

test.describe('README screenshots', () => {
  test.use({ reducedMotion: 'reduce' });

  test('capture every screen', async ({ page, context }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'No splits yet' })).toBeVisible();
    await shot(page, 'home-empty');

    await page.getByRole('button', { name: 'Try a sample trip' }).click();
    await expect(page.getByRole('heading', { name: 'Baguio Barkada Trip' })).toBeVisible();
    await shot(page, 'expenses');

    await page.getByRole('button', { name: /^Dinner on Session Road/ }).click();
    const sheet = page.getByRole('dialog', { name: 'Edit expense' });
    await sheet.getByLabel('Item 1 name').scrollIntoViewIfNeeded();
    await sheet.locator('.overflow-y-auto').evaluate((el) => (el.scrollTop = 560));
    await shot(page, 'itemized');
    await page.keyboard.press('Escape');

    await page.getByRole('tab', { name: 'Settle up' }).click();
    await expect(page.getByText('gets back ₱3,718.91')).toBeVisible();
    await shot(page, 'settle-up');

    await page.getByRole('button', { name: 'Share', exact: true }).first().click();
    await expect(page.getByTestId('share-qr')).toBeVisible();
    await shot(page, 'share-qr');
    await page.getByRole('button', { name: 'Copy link' }).click();
    const link = await page.evaluate(() => navigator.clipboard.readText());
    await page.keyboard.press('Escape');

    await page.goto('./');
    await expect(page.getByRole('link', { name: /Baguio Barkada Trip/ })).toBeVisible();
    await shot(page, 'home');

    const friend = await context.browser()!.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const shared = await friend.newPage();
    await shared.goto(link);
    await expect(shared.getByRole('heading', { name: 'Hi! Which one is you?' })).toBeVisible();
    await shared.screenshot({ path: `${DIR}/who-are-you.png`, animations: 'disabled' });
    await shared.getByRole('button', { name: "I'm Migs" }).click();
    await expect(shared.getByRole('region', { name: 'What you owe' })).toBeVisible();
    await shared.screenshot({ path: `${DIR}/personal-view.png`, animations: 'disabled' });
    await friend.close();
  });
});
