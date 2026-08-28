# Field Desk perfection loop 3 handoff

## Outcome

The released candidate `a5e4d6149ec534d5dd40004ea8f284ad467bc226` was repaired from review base `964dbd1edc48b13e4f015718bbdd5bf1ee88076b`.

Repair implementation: `c269e6bdeda5d305de5991e34be3ca5f1c7b75d4` (`fix: verify private offline cache claims`). It is pushed to `main` and deployed to https://local-pdf-forms-signer.sociobot.in.

The two review-3 findings are closed without weakening the product:

- The signature dialog now makes only the registered visual-signature claim.
- The offline-cache statement is now part of `offline-reload`, whose browser test opens a real PDF, compares Cache Storage exactly with the generated service-worker manifest, then reloads the sample offline.

The service worker no longer adds runtime responses to its shell cache. Cache Storage is therefore limited to the public, installation-time manifest and cannot retain an opened PDF.

## How to run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Run every manifest claim command independently:

```sh
node -e 'for (const c of require("./.factory/claims.json")) console.log(c.test)'
```

The one-click isolated sample is https://local-pdf-forms-signer.sociobot.in/demo (also `/?demo=1`). It shows the persistent demo banner, Reset demo, and Start for real controls.

## Exact verification evidence

- Implementation clean clone: `/tmp/field-desk-polish3-FLMG5l` at `c269e6bdeda5d305de5991e34be3ca5f1c7b75d4`; `npm ci`, `npm test`, `npm run build`, and `npm run test:e2e` passed (22 passed; 18 intentional desktop/mobile project skips). The route and mobile checks include Axe scans with no serious or critical findings.
- Final-claims clean clone: `/tmp/field-desk-polish3-final-MkJUeo` at `3ee4f96bf8f2d303391130fd0de4369ff883facf`; `npm ci`, `npm test` (9 passed), `npm run build`, and all 16 individual manifest claim commands passed. This includes the final browser-storage assertion in `@claim:demo-isolation` and the cache-manifest assertion in `@claim:offline-reload`.
- The production build writes `dist/index.html`. Initial entry JS is 44.18 KB raw / 13.82 KB gzip; CSS is 21.70 KB raw / 5.67 KB gzip. PDF engines remain lazy-loaded.
- `npm audit --omit=dev`: passed; zero vulnerabilities.
- Local factory URL verification: title, `lang`, one `h1`, `main`, image alt text, button names, and console errors all passed. Report: `.factory/evidence/polish-3/local/verify-url/verify.json`.
- Live `PLAYWRIGHT_BASE_URL=https://local-pdf-forms-signer.sociobot.in npm run test:e2e`: 22 passed; 18 intentional skips. This cold run exercises the deployed demo, cache, routing, metadata, focus, 404, mobile, keyboard, privacy, and Axe checks.
- Live factory URL verification: HTTPS 200, title/lang/main/alt/button checks, and no console errors. Report: `.factory/evidence/polish-3/live/verify-url/verify.json`.
- Live mobile Lighthouse 12.8.2: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.1 s, CLS 0, TBT 0 ms. Report: `.factory/evidence/polish-3/live/lighthouse.json`.
- Deployment: `/opt/fleet/lib/deploy-static.sh local-pdf-forms-signer dist`; Azure deployment ID `cc7d3c8f-4438-4390-9ba9-6af35fa48811`; custom-domain HTTPS check returned 200. A direct live `HEAD /not-a-real-route` returned 404.

## Evidence images

- Local first screen: `.factory/evidence/polish-3/local/first-screen-mobile.png`
- Local demo and offline demo: `.factory/evidence/polish-3/local/demo-mobile.png`, `.factory/evidence/polish-3/local/demo-offline-mobile.png`
- Live signature dialog and Privacy route: `.factory/evidence/polish-3/live/signature-dialog-mobile.png`, `.factory/evidence/polish-3/live/privacy-mobile.png`
- Live not-found view: `.factory/evidence/polish-3/live/not-found-mobile.png`

## Known gaps and next steps

None. Every finding in reviews 1–3 is resolved and rechecked on the deployed site. The pre-existing modified `graphify-out` files were not changed or committed by this repair.
