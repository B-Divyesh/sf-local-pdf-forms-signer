import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDict, PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib';

async function openDemo(page: import('@playwright/test').Page, path = '/demo') {
  await page.goto(path);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-document-filename]')).toHaveText('harbor-intake-sample.pdf');
}

function desktopOnly(testInfo: import('@playwright/test').TestInfo) {
  test.skip(testInfo.project.name === 'mobile', 'Claim workflow is covered on desktop; mobile has dedicated checks.');
}

async function makePdf(text = 'Static page text') {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 50, y: 700, size: 18, font });
  return Buffer.from(await pdf.save());
}

async function makeXfaPdf() {
  const pdf = await PDFDocument.create();
  pdf.addPage([612, 792]);
  pdf.getForm().createTextField('standard_field');
  const acroForm = pdf.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
  acroForm.set(PDFName.of('XFA'), PDFString.of('<xdp:xdp/>'));
  return Buffer.from(await pdf.save({ updateFieldAppearances: false }));
}

async function downloadPdf(page: import('@playwright/test').Page, flatten = false) {
  await page.getByRole('button', { name: 'Export PDF' }).click();
  if (flatten) await page.getByText('Make completed fields permanent').click();
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const path = await (await event).path();
  if (!path) throw new Error('PDF download did not produce a local file.');
  return PDFDocument.load(await readFile(path));
}

async function placeOnPage(page: import('@playwright/test').Page, xRatio = .55, yRatio = .45) {
  const stage = page.locator('[data-page-stage]');
  const box = await stage.boundingBox();
  if (!box) throw new Error('Sample page did not render.');
  await stage.click({ position: { x: box.width * xRatio, y: box.height * yRatio } });
}

test('routes set metadata, restore focus, and show a designed 404', async ({ page }) => {
  const routes = [
    ['/', 'Field Desk — fill and sign PDFs on your device', '/'],
    ['/demo', 'Demo — Field Desk', '/demo'],
    ['/?demo=1', 'Demo — Field Desk', '/demo'],
    ['/privacy', 'Privacy — Field Desk', '/privacy'],
    ['/terms', 'Terms — Field Desk', '/terms'],
    ['/not-a-real-route', 'Page not found — Field Desk', '/not-a-real-route'],
  ] as const;
  for (const [route, title, canonicalPath] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://local-pdf-forms-signer.sociobot.in${canonicalPath}`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Field Desk' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('.route-announcer')).toHaveText('Privacy, plainly.');
  await page.getByRole('link', { name: 'Terms' }).first().click();
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveTitle('Privacy — Field Desk');
  await expect(page.locator('h1')).toBeFocused();
  await page.getByRole('link', { name: 'Open sample PDF' }).click();
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('.route-announcer')).toContainText('Edit harbor-intake-sample.pdf');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveTitle('Field Desk — fill and sign PDFs on your device');
  await expect(page.locator('h1')).toBeFocused();
});

test('public routes and legal links are accessible', async ({ page }) => {
  for (const route of ['/', '/demo', '/?demo=1', '/privacy', '/terms', '/not-a-real-route']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Privacy' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms' }).first()).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  }
});

test('keyboard users can enter, place, move, and remove a field', async ({ page }, info) => {
  desktopOnly(info);
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await openDemo(page);
  const tool = page.getByRole('button', { name: 'Text field' });
  await tool.focus();
  await page.keyboard.press('Enter');
  const stage = page.locator('[data-page-stage]');
  await stage.focus();
  await page.keyboard.press('Enter');
  const field = page.getByLabel(/Text field. Select to edit/);
  await expect(field).toBeVisible();
  await field.focus();
  const before = await field.evaluate((element) => getComputedStyle(element).left);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => field.evaluate((element) => getComputedStyle(element).left)).not.toBe(before);
  await page.keyboard.press('Delete');
  await expect(field).toHaveCount(0);
});

test('@claim:demo-isolation sample reset and exit never reuse real or demo data', async ({ page }, info) => {
  desktopOnly(info);
  await page.addInitScript(() => {
    localStorage.setItem('real:sentinel', 'keep');
    sessionStorage.setItem('real:session-sentinel', 'keep');
  });
  await openDemo(page, '/?demo=1');
  await page.getByLabel('client_name').fill('Changed in demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('client_name')).toHaveValue('Maya Chen');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: /Fill and sign PDFs/ })).toBeVisible();
  await expect(page.locator('[data-document-filename]')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('real:sentinel'))).toBe('keep');
  expect(await page.evaluate(() => sessionStorage.getItem('real:session-sentinel'))).toBe('keep');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['real:sentinel']);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual(['real:session-sentinel']);

  await page.locator('#pdf-file').setInputFiles({ name: 'private.pdf', mimeType: 'application/pdf', buffer: await makePdf('Private source') });
  await expect(page.locator('[data-document-filename]')).toHaveText('private.pdf');
  await page.getByRole('link', { name: 'Open sample PDF' }).click();
  await expect(page.locator('[data-document-filename]')).toHaveText('harbor-intake-sample.pdf');
  await page.goBack();
  await expect(page.getByRole('heading', { name: /Fill and sign PDFs/ })).toBeVisible();
  await expect(page.locator('[data-document-filename]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Open sample PDF' }).click();
  await expect(page.locator('[data-document-filename]')).toHaveText('harbor-intake-sample.pdf');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.getByRole('link', { name: 'Field Desk home' }).click();
  await expect(page.locator('[data-document-filename]')).toHaveCount(0);
});

test('@claim:local-only editing and export send no PDF or off-site request', async ({ page }, info) => {
  desktopOnly(info);
  const requests: import('@playwright/test').Request[] = [];
  page.on('request', (request) => requests.push(request));
  await openDemo(page);
  const appOrigin = new URL(page.url()).origin;
  await page.getByLabel('client_name').fill('Maya Chen, revised');
  await downloadPdf(page);
  expect(requests.every((request) => new URL(request.url()).origin === appOrigin)).toBe(true);
  expect(requests.every((request) => request.method() === 'GET')).toBe(true);
  expect(requests.some((request) => /\/api\/|upload|analytics/i.test(new URL(request.url()).pathname))).toBe(false);
});

test('@claim:offline-reload sample PDF reopens offline after one visit', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await expect.poll(() => page.getAttribute('html', 'data-offline-ready'), { timeout: 15_000 }).toBe('true');
  const offlineState = await page.evaluate(async () => {
    const cacheName = (await caches.keys()).find((name) => name.startsWith('field-desk-shell-'));
    const script = document.querySelector<HTMLScriptElement>('script[src]')?.src || '';
    const cache = cacheName ? await caches.open(cacheName) : null;
    const response = cache ? await cache.match(script, { ignoreVary: true }) : undefined;
    return { cacheName, controlled: Boolean(navigator.serviceWorker.controller), script, cached: Boolean(response), type: response?.headers.get('content-type') };
  });
  expect(offlineState).toMatchObject({ controlled: true, cached: true, type: 'text/javascript' });
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('You are offline.')).toBeVisible();
  const cachedUrls = await page.evaluate(async () => {
    const names = (await caches.keys()).filter((name) => name.startsWith('field-desk-shell-'));
    const cache = await caches.open(names[0]);
    return (await cache.keys()).map((request) => request.url);
  });
  expect(cachedUrls.length).toBeGreaterThan(8);
  const appOrigin = new URL(page.url()).origin;
  expect(cachedUrls.every((url) => new URL(url).origin === appOrigin)).toBe(true);
  await page.context().setOffline(false);
});

test('@claim:pdf-files-only non-PDF files are rejected with recovery guidance', async ({ page }, info) => {
  desktopOnly(info);
  await page.goto('/');
  await page.locator('#pdf-file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('notes') });
  await expect(page.getByRole('alert')).toContainText('Choose a file ending in .pdf.');
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

test('@claim:standard-form-export standard fields retain edited values', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByLabel('client_name').fill('Ada Lovelace');
  await page.getByLabel('project_type').selectOption('Store signage');
  await page.getByLabel('approved_for_quote').uncheck();
  await page.getByRole('button', { name: 'Move page 2 earlier' }).click();
  const exported = await downloadPdf(page);
  expect(exported.getForm().getTextField('client_name').getText()).toBe('Ada Lovelace');
  expect(exported.getForm().getDropdown('project_type').getSelected()).toEqual(['Store signage']);
  expect(exported.getForm().getCheckBox('approved_for_quote').isChecked()).toBe(false);
});

test('@claim:add-fields text, checkbox, and date fields export as editable controls', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  const placements = [
    ['Text field', .2, .2],
    ['Checkbox', .5, .4],
    ['Date field', .7, .65],
  ] as const;
  for (const [tool, x, y] of placements) {
    await page.getByRole('button', { name: tool }).click();
    await placeOnPage(page, x, y);
  }
  const exported = await downloadPdf(page);
  const fieldNames = exported.getForm().getFields().map((field) => field.getName());
  expect(fieldNames.some((name) => name.startsWith('field_desk_text_'))).toBe(true);
  expect(fieldNames.some((name) => name.startsWith('field_desk_checkbox_'))).toBe(true);
  expect(fieldNames.some((name) => name.startsWith('field_desk_date_'))).toBe(true);
});

test('@claim:signature-mark typed and drawn signatures export as visual, non-digital marks', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('button', { name: 'Signature' }).click();
  await page.getByRole('tab', { name: 'Type' }).click();
  await page.getByLabel('Your name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Use signature' }).click();
  await placeOnPage(page, .42, .55);
  await expect(page.getByLabel(/Signature field. Select to edit/)).toContainText('Ada Lovelace');
  const typedExport = await downloadPdf(page);
  expect(typedExport.getPageCount()).toBe(2);
  expect(typedExport.getForm().getFields().some((field) => /signature|sig/i.test(field.constructor.name))).toBe(false);

  await page.getByRole('button', { name: /Change signature/ }).click();
  const pad = page.locator('#signature-pad');
  const box = await pad.boundingBox();
  if (!box) throw new Error('Signature pad did not render.');
  await page.mouse.move(box.x + 20, box.y + 70);
  await page.mouse.down();
  await page.mouse.move(box.x + 90, box.y + 30, { steps: 6 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Use signature' }).click();
  const exported = await downloadPdf(page);
  expect(exported.getPageCount()).toBe(2);
  expect(exported.getForm().getFields().some((field) => /signature|sig/i.test(field.constructor.name))).toBe(false);
});

test('@claim:page-actions page order, rotation, removal, and undo reach the PDF', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('button', { name: 'Move page 2 earlier' }).click();
  await page.getByRole('button', { name: 'Show page 1' }).click();
  await page.getByRole('button', { name: 'Rotate 90°' }).click();
  await page.getByRole('button', { name: 'Remove page' }).click();
  await expect(page.getByText('1 page · processing locally')).toBeVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  const exported = await downloadPdf(page);
  expect(exported.getPageCount()).toBe(2);
  expect(exported.getPage(0).getWidth()).toBeGreaterThan(exported.getPage(0).getHeight());
  expect(exported.getPage(0).getRotation().angle).toBe(90);
});

test('@claim:export-modes downloads keep editable fields or make them permanent', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  const editable = await downloadPdf(page);
  expect(editable.getForm().getFields().length).toBeGreaterThan(0);
  const permanent = await downloadPdf(page, true);
  expect(permanent.getForm().getFields()).toHaveLength(0);
});

test('@claim:no-document-persistence a real opened PDF clears on reload and tab close', async ({ page, context }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.locator('#pdf-file').setInputFiles({ name: 'temporary.pdf', mimeType: 'application/pdf', buffer: await makePdf() });
  await expect(page.locator('[data-document-filename]')).toHaveText('temporary.pdf');
  await page.reload();
  await expect(page.getByRole('heading', { name: /Fill and sign PDFs/ })).toBeVisible();
  await expect(page.locator('[data-document-filename]')).toHaveCount(0);
  await page.locator('#pdf-file').setInputFiles({ name: 'close-me.pdf', mimeType: 'application/pdf', buffer: await makePdf('Close this tab') });
  await expect(page.locator('[data-document-filename]')).toHaveText('close-me.pdf');
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('/');
  await expect(reopened.getByRole('heading', { name: /Fill and sign PDFs/ })).toBeVisible();
  await expect(reopened.locator('[data-document-filename]')).toHaveCount(0);
});

test('@claim:no-account complete sample export needs no account', async ({ page }, info) => {
  desktopOnly(info);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await downloadPdf(page);
  await expect(page.getByRole('button', { name: /sign in|log in|create account/i })).toHaveCount(0);
  expect(requests.some((url) => /auth|login|account/i.test(new URL(url).pathname))).toBe(false);
});

test('@claim:free-use complete sample export has no payment step', async ({ page }, info) => {
  desktopOnly(info);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await downloadPdf(page);
  await expect(page.getByText(/checkout|payment|subscribe|upgrade/i)).toHaveCount(0);
  expect(requests.some((url) => /checkout|billing|payment|stripe|dodo/i.test(url))).toBe(false);
});

test('@claim:no-ocr scanned page pixels do not become editable text', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  const pdf = await PDFDocument.create();
  const pageOne = pdf.addPage([612, 792]);
  const pixel = await pdf.embedPng(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
  pageOne.drawImage(pixel, { x: 40, y: 650, width: 300, height: 80 });
  await page.locator('#pdf-file').setInputFiles({ name: 'scan.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await pdf.save()) });
  await expect(page.getByText('No standard AcroForm fields found.')).toBeVisible();
  await expect(page.getByRole('button', { name: /OCR|read scanned text/i })).toHaveCount(0);
});

test('@claim:no-page-text-edit printed page text has no edit-text action', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.locator('#pdf-file').setInputFiles({ name: 'printed-text.pdf', mimeType: 'application/pdf', buffer: await makePdf('Existing printed text') });
  await expect(page.locator('[data-main-canvas]')).toBeVisible();
  await expect(page.getByRole('button', { name: /edit (existing|page|printed) text/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Text field' })).toBeVisible();
});

test('@claim:reject-xfa dynamic XFA forms show a specific rejection', async ({ page }, info) => {
  desktopOnly(info);
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.locator('#pdf-file').setInputFiles({ name: 'dynamic-xfa.pdf', mimeType: 'application/pdf', buffer: await makeXfaPdf() });
  await expect(page.getByRole('alert')).toContainText('uses XFA fields');
  await expect(page.locator('[data-editor-ready="true"]')).toHaveCount(0);
});

test('mobile first screen and demo remain usable without overflow', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile-only viewport check.');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.getByLabel('Main navigation')).toBeVisible();
  expect(await page.locator('body').evaluate((node) => node.scrollWidth <= window.innerWidth)).toBe(true);
  const primaryBox = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  expect(primaryBox && primaryBox.y + primaryBox.height).toBeLessThanOrEqual(844);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);

  await openDemo(page);
  expect(await page.locator('body').evaluate((node) => node.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Close PDF' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Move page 2 earlier' })).toBeVisible();
  const resetBox = await page.getByRole('button', { name: 'Reset demo' }).boundingBox();
  const startBox = await page.getByRole('link', { name: 'Start for real' }).boundingBox();
  expect(resetBox?.height).toBeGreaterThanOrEqual(44);
  expect(startBox?.height).toBeGreaterThanOrEqual(44);
});
