import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const label = process.argv[3] || 'local';
const output = new URL(`../.factory/evidence/polish-2/${label}/`, import.meta.url);
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: new URL('first-screen-mobile.png', output).pathname, fullPage: false });
await page.getByRole('link', { name: 'Try it with sample data' }).click();
await page.locator('[data-editor-ready="true"]').waitFor();
await page.screenshot({ path: new URL('demo-mobile.png', output).pathname, fullPage: false });

await page.waitForFunction(() => document.documentElement.dataset.offlineReady === 'true');
await context.setOffline(true);
await page.reload();
await page.locator('[data-editor-ready="true"]').waitFor();
await page.screenshot({ path: new URL('demo-offline-mobile.png', output).pathname, fullPage: false });
await context.setOffline(false);

await page.goto(`${baseUrl}/not-a-real-route`, { waitUntil: 'networkidle' });
await page.screenshot({ path: new URL('not-found-mobile.png', output).pathname, fullPage: false });
await browser.close();

if (errors.length) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
