import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Fails on serious or critical axe violations, and prints them so they are easy to fix. */
async function expectAccessible(page: Page, name: string) {
  const results = await new AxeBuilder({ page }).analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const summary = bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(summary, `axe violations on ${name}`).toEqual([]);
}

function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  return problems;
}

test('sample trip → expenses → mark paid → share → open link as Migs', async ({
  page,
  context,
}) => {
  const problems = watchConsole(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'No splits yet' })).toBeVisible();
  await expectAccessible(page, 'home');

  await page.getByRole('button', { name: 'Try a sample trip' }).click();
  await expect(page.getByRole('heading', { name: 'Baguio Barkada Trip' })).toBeVisible();
  await expectAccessible(page, 'event');

  // Equal expense: ₱400 paid by Bea, split between everyone.
  await page.getByRole('button', { name: 'Add expense' }).click();
  const add = page.getByRole('dialog', { name: 'Add expense' });
  await add.getByLabel('Amount in PHP').fill('400');
  await add.getByPlaceholder('What was it for?').fill('Taho');
  await add.getByRole('button', { name: 'Bea', exact: true }).first().click();
  await expect(add.getByText('₱100.00 each')).toBeVisible();
  await add.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: /^Taho, ₱400\.00/ })).toBeVisible();

  // Itemized expense with a 10% service charge.
  await page.getByRole('button', { name: 'Add expense' }).click();
  const sheet = page.getByRole('dialog', { name: 'Add expense' });
  await sheet.getByRole('radio', { name: 'Itemized' }).click();
  await sheet.getByPlaceholder('What was it for?').fill('Merienda');
  await sheet.getByLabel('Item 1 name').fill('Ube halaya');
  await sheet.getByLabel('Item 1 price').fill('200');
  await sheet.getByText('Service charge, tip, discount').click();
  await sheet.getByRole('button', { name: '10%' }).click();
  await expect(sheet.getByText('₱220.00', { exact: true })).toBeVisible();
  await expectAccessible(page, 'itemized sheet');
  await sheet.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: /^Merienda, ₱220\.00/ })).toBeVisible();

  // Mark the first transfer as paid.
  await page.getByRole('tab', { name: 'Settle up' }).click();
  await expect(page.getByRole('button', { name: 'Mark as paid' })).toHaveCount(3);
  await page.getByRole('button', { name: 'Mark as paid' }).first().click();
  await page.getByRole('button', { name: 'Yes, paid' }).click();
  await expect(page.getByRole('button', { name: 'Mark as paid' })).toHaveCount(2);
  await expectAccessible(page, 'settle up');

  // Share, then open the link in a fresh page.
  await page.getByRole('button', { name: 'Share', exact: true }).first().click();
  await expect(page.getByTestId('share-qr')).toBeVisible();
  await page.getByRole('button', { name: 'Copy link' }).click();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain('/kkb/#/s/');

  const friend = await context.browser()!.newContext({ viewport: { width: 375, height: 812 } });
  const shared = await friend.newPage();
  const friendProblems = watchConsole(shared);
  await shared.goto(link);
  await expect(shared.getByRole('heading', { name: 'Hi! Which one is you?' })).toBeVisible();
  await shared.getByRole('button', { name: "I'm Migs" }).click();
  await expect(shared.getByRole('heading', { name: 'Hi, Migs!' })).toBeVisible();
  const hero = shared.getByRole('region', { name: 'What you owe' });
  await expect(hero).toContainText('to Bea');
  await expect(hero).toContainText('GCash · 0917 000 0001');
  await expectAccessible(shared, 'shared view');

  expect(problems).toEqual([]);
  expect(friendProblems).toEqual([]);
  await friend.close();
});

test('broken links show a friendly screen', async ({ page }) => {
  await page.goto('./#/s/not-a-real-link');
  await expect(page.getByRole('heading', { name: "Can't open this split" })).toBeVisible();
  await page.getByRole('button', { name: 'Go to KKB' }).click();
  await expect(page.getByRole('heading', { name: 'KKB', level: 1 })).toBeVisible();
});

test('a hard refresh on an event keeps the data', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Try a sample trip' }).click();
  await expect(page).toHaveURL(/#\/e\//);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Baguio Barkada Trip' })).toBeVisible();
});

test('the phone back button closes a sheet instead of leaving the page', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Try a sample trip' }).click();
  await page.getByRole('button', { name: 'Add expense' }).click();
  await expect(page.getByRole('dialog', { name: 'Add expense' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Baguio Barkada Trip' })).toBeVisible();
});

test('works offline after the first visit (PWA)', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload(); // now controlled by the service worker
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'No splits yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Try a sample trip' }).click();
  await expect(page.getByRole('heading', { name: 'Baguio Barkada Trip' })).toBeVisible();
  await context.setOffline(false);
});
