import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function fixturePdf(): Promise<Buffer> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const first = document.addPage([612, 792]);
  first.drawText('Private intake form', { x: 55, y: 725, size: 22, font, color: rgb(.1, .15, .15) });
  first.drawText('Full name', { x: 55, y: 665, size: 12, font });
  const field = document.getForm().createTextField('full_name');
  field.addToPage(first, { x: 55, y: 625, width: 280, height: 28 });
  const second = document.addPage([612, 792]);
  second.drawText('Second page', { x: 55, y: 725, size: 22, font });
  return Buffer.from(await document.save());
}

test('landing and legal routes are accessible', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Paperwork/ })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('h1')).toHaveText('Privacy, plainly.');
  expect(consoleErrors).toEqual([]);
});

test('opens, fills, edits pages, places a field, and exports', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Full interaction is covered on desktop; mobile gets responsive and a11y checks.');
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await page.locator('#pdf-file').setInputFiles({ name: 'intake.pdf', mimeType: 'application/pdf', buffer: await fixturePdf() });
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-document-filename]')).toHaveText('intake.pdf');
  await expect(page.getByLabel('full_name')).toBeVisible();
  await page.getByLabel('full_name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Text field' }).click();
  const stage = page.locator('[data-page-stage]');
  const box = await stage.boundingBox();
  if (!box) throw new Error('Page stage did not render');
  await stage.click({ position: { x: box.width * .55, y: box.height * .45 } });
  await expect(page.getByLabel(/Text field. Select to edit/)).toBeVisible();
  await expect(page.locator('[data-field-id][style]')).toHaveCount(0);
  await page.getByLabel('Default value').fill('Local only');
  await page.getByRole('button', { name: 'Page controls' }).click();
  await page.getByRole('button', { name: /Move page 2 earlier/ }).click();
  await page.getByRole('button', { name: 'Remove page' }).click();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByRole('button', { name: 'Export PDF' }).click();
  await page.getByText('Flatten completed fields').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('intake-field-desk.pdf');
  expect(consoleErrors).toEqual([]);
});

test('typed signature placement keeps strict CSP geometry free of inline styles', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop exercises typed-signature placement; mobile covers responsive accessibility.');
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await page.locator('#pdf-file').setInputFiles({ name: 'signature.pdf', mimeType: 'application/pdf', buffer: await fixturePdf() });
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-document-filename]')).toHaveText('signature.pdf');
  await page.getByRole('button', { name: 'Signature' }).click();
  await page.getByRole('tab', { name: 'Type' }).click();
  await page.getByLabel('Your name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Use signature' }).click();
  const stage = page.locator('[data-page-stage]');
  const box = await stage.boundingBox();
  if (!box) throw new Error('Page stage did not render');
  await stage.click({ position: { x: box.width * .48, y: box.height * .52 } });
  await expect(page.getByLabel(/Signature field. Select to edit/)).toBeVisible();
  await expect(page.locator('[data-field-id][style]')).toHaveCount(0);
  await page.getByLabel(/Signature field. Select to edit/).press('ArrowRight');
  await expect(page.locator('[data-field-id][style]')).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test('mobile layout keeps primary workflow reachable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only viewport check.');
  await page.goto('/');
  await expect(page.getByText('Open a PDF')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  expect((await page.locator('body').evaluate((node) => node.scrollWidth <= window.innerWidth))).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
