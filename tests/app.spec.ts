import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';

async function openDemo(page: import('@playwright/test').Page) {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-document-filename]')).toHaveText('harbor-intake-sample.pdf');
}

function desktopOnly(testInfo: import('@playwright/test').TestInfo) {
  test.skip(testInfo.project.name === 'mobile', 'Claim workflow is covered on desktop; mobile has a dedicated layout test.');
}

test('routes set titles, move focus, and show a designed not-found page', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Field Desk');
  await page.getByRole('link', { name: 'Terms' }).first().click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page).toHaveTitle('Terms — Field Desk');
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.goto('/not-a-real-route');
  await expect(page).toHaveTitle('Page not found — Field Desk');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Field Desk' })).toBeVisible();
});

test('public routes are accessible', async ({ page }) => {
  for (const route of ['/', '/demo', '/?demo=1', '/privacy', '/terms', '/not-a-real-route']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  }
});

test('@claim:demo-isolation demo edits reset without touching real storage', async ({ page }, info) => {
  desktopOnly(info);
  await page.addInitScript(() => localStorage.setItem('real:sentinel', 'keep'));
  await openDemo(page);
  await page.getByLabel('client_name').fill('Changed in demo');
  await page.reload();
  await expect(page.getByLabel('client_name')).toHaveValue('Maya Chen');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('client_name')).toHaveValue('Maya Chen');
  expect(await page.evaluate(() => localStorage.getItem('real:sentinel'))).toBe('keep');
  expect(await page.evaluate(() => Object.keys(localStorage).every((key) => key === 'real:sentinel' || key.startsWith('demo:')))).toBe(true);
});

test('@claim:local-only demo editing makes no external or API request', async ({ page }, info) => {
  desktopOnly(info);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await page.getByLabel('client_name').fill('Maya Chen, revised');
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  await download;
  const urls = requests.map((url) => new URL(url));
  expect(urls.every((url) => url.origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(urls.some((url) => /\/api\/|upload|analytics/i.test(url.pathname))).toBe(false);
});

test('@claim:offline-reload demo reopens offline after the first visit', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(async () => {
    const cacheName = (await caches.keys()).find((key) => key.startsWith('field-desk-shell-'));
    if (!cacheName) return false;
    const cache = await caches.open(cacheName);
    const assets = [...document.querySelectorAll('script[src], link[rel="stylesheet"][href]')]
      .map((element) => new URL(element.getAttribute('src') || element.getAttribute('href') || '', location.href).href);
    return (await Promise.all(assets.map((asset) => cache.match(asset).then(Boolean)))).every(Boolean);
  })).toBe(true);
  await page.reload();
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible({ timeout: 15_000 });
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible({ timeout: 15_000 });
  await page.context().setOffline(false);
});

test('@claim:max-file-size files over 175 MB are rejected', async ({ page }, info) => {
  desktopOnly(info);
  await page.goto('/');
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(Blob.prototype, 'size');
    Object.defineProperty(File.prototype, 'size', { configurable: true, get() { return this.name === 'too-big.pdf' ? 176 * 1024 * 1024 : descriptor?.get?.call(this) || 0; } });
  });
  await page.locator('#pdf-file').setInputFiles({ name: 'too-big.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await expect(page.getByRole('alert')).toContainText('over 175 MB');
});

test('@claim:standard-form-export standard form values download in editable PDFs', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByLabel('client_name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const exported = await PDFDocument.load(await readFile((await (await event).path()) as string));
  expect(exported.getForm().getTextField('client_name').getText()).toBe('Ada Lovelace');
});

test('@claim:add-fields new text fields can be placed and edited', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('button', { name: 'Text field' }).click();
  const stage = page.locator('[data-page-stage]');
  const box = await stage.boundingBox();
  if (!box) throw new Error('Sample stage did not render.');
  await stage.click({ position: { x: box.width * .55, y: box.height * .45 } });
  await expect(page.getByLabel(/Text field. Select to edit/)).toBeVisible();
  await page.getByLabel('Default value').fill('Local note');
  await expect(page.getByLabel(/Text field. Select to edit/)).toContainText('Local note');
});

test('@claim:signature-mark typed signatures appear as visual marks', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('button', { name: 'Signature' }).click();
  await page.getByRole('tab', { name: 'Type' }).click();
  await page.getByLabel('Your name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Use signature' }).click();
  const stage = page.locator('[data-page-stage]');
  const box = await stage.boundingBox();
  if (!box) throw new Error('Sample stage did not render.');
  await stage.click({ position: { x: box.width * .48, y: box.height * .52 } });
  await expect(page.getByLabel(/Signature field. Select to edit/)).toContainText('Ada Lovelace');
});

test('@claim:page-actions pages move, rotate, remove, and restore', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('button', { name: 'Move page 2 earlier' }).click();
  await expect(page.getByText('Page moved to position 1.')).toBeVisible();
  await page.getByRole('button', { name: 'Rotate 90°' }).click();
  await expect(page.getByText(/rotated 90 degrees/)).toBeVisible();
  await page.getByRole('button', { name: 'Remove page' }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText('Page restored.')).toBeVisible();
});

test('@claim:export-modes downloads support editable and permanent fields', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('button', { name: 'Export PDF' }).click();
  let event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const editable = await PDFDocument.load(await readFile((await (await event).path()) as string));
  expect(editable.getForm().getFields().length).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Export PDF' }).click();
  await page.getByText('Flatten completed fields').click();
  event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const permanent = await PDFDocument.load(await readFile((await (await event).path()) as string));
  expect(permanent.getForm().getFields().length).toBe(0);
});

test('@claim:no-document-persistence demo values do not survive a reload', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByLabel('client_name').fill('Temporary name');
  await page.reload();
  await expect(page.getByLabel('client_name')).toHaveValue('Maya Chen');
});

test('@claim:no-account sample editing and export need no account', async ({ page }, info) => {
  desktopOnly(info);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  await download;
  await expect(page.getByRole('button', { name: /sign in|log in|create account/i })).toHaveCount(0);
  expect(requests.some((url) => /auth|login|account/i.test(new URL(url).pathname))).toBe(false);
});

test('mobile layout keeps first actions reachable and has no serious axe findings', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile-only viewport check.');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.getByLabel('Main navigation')).toBeVisible();
  expect(await page.locator('body').evaluate((node) => node.scrollWidth <= window.innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || '')).length).toBe(0);
});
