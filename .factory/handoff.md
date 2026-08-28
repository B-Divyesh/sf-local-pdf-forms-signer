# Field Desk polish round 2 handoff

## Delivered

Polish round 2 resolves every blocking, major, and minor item from `.factory/review-1.md` and `.factory/review-2.md`. The detailed finding-to-fix evidence is in `.factory/polish-2.md`.

- Repaired the production offline demo with an atomic, build-generated precache that includes every lazy module and PDF worker.
- Made `/demo` and `?demo=1` a one-click, in-memory sandbox with a persistent notice, reset, exit, and strict real/demo state boundaries.
- Registered 16 visitor-facing claims and implemented exactly one observable browser test per claim.
- Rewrote the first screen, sample terminology, privacy wording, legal limits, README, and catalog description in plain language.
- Completed per-route titles, canonical and sharing metadata, navigation, focus/announcement behavior, and an HTTP 404 page.
- Kept the mid-century instrument-panel design while repairing the 390 px editor layout, touch targets, keyboard placement, and mobile page controls.
- Hardened PDF behavior for page-reordered form exports and dynamic XFA rejection.
- Preserved the static Vite artifact and Azure Static Web Apps deployment class.

Implementation commit: `08998c92e3010dc310ff3b6732832c8256308e06`.

## Verification

Verified from clean clone `/tmp/field-desk-polish2-3Ipkhj`:

```sh
npm ci                 # passed; 0 vulnerabilities
npm test               # 9 passed
npm run build          # passed; dist/index.html produced
npm run test:e2e       # 22 passed; 18 intentional viewport/project skips
```

Every `test` command in `.factory/claims.json` was also run separately: 16 of 16 passed. The previously failing `@claim:offline-reload` passed from a cold browser using the production build.

Production was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh local-pdf-forms-signer /work/repo/dist
```

Deployment ID: `6ded8680-5872-4a08-b156-7fcfdcc1c9e2`.

After deployment, every claim command and the full Playwright suite were rerun against `https://local-pdf-forms-signer.sociobot.in`: 16 of 16 claims and 22 browser tests passed. The live unknown route returned HTTP 404; all public routes/assets returned 200. The factory URL verifier found no console, semantic, image-alt, or button-label errors.

Live mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.1 s, CLS 0, total blocking time 100 ms. The production entry JS is 13.84 KB gzip and CSS is 5.67 KB gzip.

Evidence is under `.factory/evidence/polish-2/`, including cold mobile Home, Demo, offline Demo, 404, URL-verifier output, and Lighthouse JSON.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Run one claim using its manifest command, for example:

```sh
npm run test:claims -- --grep @claim:offline-reload
```

Run the suite against production:

```sh
PLAYWRIGHT_BASE_URL=https://local-pdf-forms-signer.sociobot.in npm run test:e2e
```

## Known gaps and next steps

None. All recorded review findings and acceptance checks are resolved.
