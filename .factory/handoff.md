# Field Desk repair handoff — 2026-08-27

## Delivered

This repair resolves both independent findings against candidate
`1309298ee135dfa710c2510b5107d289334615fd`.

- The editor now exposes `data-editor-ready="true"` only after its primary PDF
  page render settles. The desktop E2E workflow waits for that durable state,
  then reads the document name through the dedicated
  `data-document-filename` locator rather than ambiguous page text.
- Placed text, checkbox, date, and signature geometry no longer uses inline
  `style` attributes or `HTMLElement.style`. A deliberately empty,
  same-origin `/field-positions.css` stylesheet is loaded under the existing
  `style-src 'self'` policy; CSSOM rules scoped to generated field IDs carry
  the four numeric position/size values. Field IDs are generated UUIDs and
  escaped before use in selectors. This is narrowly scoped to field geometry;
  the CSP was not loosened and does not allow `unsafe-inline`, nonces, or
  external style origins.
- PDF canvases now rely on their intrinsic width/height attributes for aspect
  ratio, removing the remaining runtime inline-style write from the renderer.
- Added exact desktop regressions for the ready-state/filename sequence and
  for both text-field and typed-signature placement. The latter asserts no
  placed field has a `style` attribute and that no console error is emitted,
  including after keyboard movement.
- Removed the obsolete Dockerfile, NGINX configuration, and container README
  instructions. The supported deployment is the existing **Standard-tier Azure
  Static Web App** `sf-local-pdf-forms-signer` in resource group `sociobot`.
  No ACR or container build is part of this product.
- Added the CSS extension to the Static Web Apps navigation-fallback exclusion
  so `/field-positions.css` is always served as a stylesheet, not the SPA HTML.
- Bumped the service-worker shell cache revision so existing offline clients
  update away from the pre-repair editor bundle.

## Run and verify

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The production bundle is `dist/`; deploy it to the Standard-tier Azure Static
Web App. `public/staticwebapp.config.json` keeps the strict CSP, SPA fallback,
and cache directives.

## Verification completed

- Clean locked install: `npm ci` completed with 0 audited vulnerabilities.
- Unit/PDF integration: `npm test` passed, 6/6 tests.
- Build/typecheck: `npm run build` passed and produced `dist/`.
- E2E: `npm run test:e2e` passed: 5 passed, 3 intentional cross-project skips.
  It covers desktop form fill, text placement, deterministic editor readiness,
  page move/delete/undo, download, typed-signature placement, landing/legal
  Axe scans, and the 390px mobile accessibility/layout check.
- CSP regression exercise against the Azure Static Web Apps CLI emulator (which
  served the production `style-src 'self'` header): placed and keyboard-moved
  one text field and one typed signature. Both had non-zero rendered geometry,
  no inline styles, and zero console errors.
- PDF/export exercise: flattened a real two-page PDF after placement, parsed
  the downloaded result with `pdf-lib`, and verified
  `export-field-desk.pdf`, two pages, and zero remaining form fields.
- Offline exercise: the service worker took control, then an offline reload
  rendered the landing page with zero console errors.
- Axe: repository Playwright Axe checks found zero serious or critical issues
  at desktop and Pixel 5 viewports. The standalone `@axe-core/cli` command was
  also attempted but ChromeDriver exited before creating a session in this
  container; the Playwright integration is the authoritative completed scan.
- Lighthouse: the CLI was attempted against the production-style emulator with
  Playwright Chromium, but that Chromium tab crashed before scoring. Build
  budgets remain within limits: initial JS 39.09 KB raw / 12.74 KB gzip and CSS
  20.24 KB raw / 5.41 KB gzip; PDF.js and pdf-lib remain lazy chunks.

## Deployment and live verification

Deployed production build to
<https://local-pdf-forms-signer.sociobot.in> through Azure Static Web Apps
(`sf-local-pdf-forms-signer`, Standard tier). No container deployment or
`az acr build` was used.

Post-deploy checks passed at the custom domain:

- The factory URL verifier returned HTTPS 200 in 776 ms with one `h1`,
  `lang="en"`, a `main` landmark, no missing image alt text/unlabelled buttons,
  and zero console errors.
- Live headers retain the strict `style-src 'self'` CSP and the deployed HTML
  references `/field-positions.css` and the new application bundle.
- A live browser exercise opened a real PDF, waited for the ready state, placed
  and keyboard-moved both a text field and typed signature, and observed zero
  console errors, no inline geometry styles, and non-zero rendered field sizes.
- Live Axe scans at desktop and Pixel 5 viewports found zero serious or critical
  violations. The live service worker took control and rendered the landing
  page after an explicit offline reload with zero console errors.

## Known limits

- Dynamic XFA forms are detected but not editable; page content can still be
  marked and exported.
- Existing source form fields may become fixed appearances when pages are
  copied/reordered. Field Desk-created fields remain editable unless flattened.
- Signatures are visual marks without identity verification, certificates, or
  an audit trail.
- There is no OCR or editing of existing PDF text. Input is capped at 175 MB;
  large scanned PDFs can still exceed device memory.
