import { expect, test } from '@playwright/test';

/** Not part of the smoke run: `npm run screenshots` records docs/screenshots/demo.webm. */

const DIR = 'docs/screenshots';

test.use({ video: { mode: 'on', size: { width: 375, height: 812 } }, deviceScaleFactor: 1 });

test('record the main flow', async ({ page }) => {
  const pause = (ms = 700) => page.waitForTimeout(ms);
  await page.goto('./');
  await pause(1200);
  await page.getByRole('button', { name: 'Try a sample trip' }).click();
  await pause(1200);

  await page.getByRole('button', { name: 'Add expense' }).click();
  const add = page.getByRole('dialog', { name: 'Add expense' });
  await pause();
  await add.getByLabel('Amount in PHP').pressSequentially('1200', { delay: 120 });
  await add.getByPlaceholder('What was it for?').pressSequentially('Samgyup', { delay: 80 });
  await pause();
  await add.getByRole('button', { name: 'Save' }).click();
  await pause(1200);

  await page.getByRole('tab', { name: 'Settle up' }).click();
  await pause(1500);
  for (let left = 3; left > 0; left--) {
    await expect(page.getByRole('button', { name: 'Mark as paid' })).toHaveCount(left);
    await page.getByRole('button', { name: 'Mark as paid' }).first().click();
    await pause(500);
    await page.getByRole('button', { name: 'Yes, paid' }).click();
    await pause(900);
  }
  await expect(page.getByText(/All settled! Bayad na lahat/)).toBeVisible();
  await pause(2500);

  const video = page.video();
  await page.close();
  await video?.saveAs(`${DIR}/demo.webm`);
});
