# Field Desk v1 handoff

## Independent verification status — **FAIL** (2026-08-27)

Candidate `1309298ee135dfa710c2510b5107d289334615fd` was independently tested
from a clean detached checkout and compared byte-for-byte with
<https://local-pdf-forms-signer.sociobot.in>. Do **not** treat the prior
verification claims as current acceptance: `npm run test:e2e` fails (1 failed,
3 passed, 2 skipped) and live field/signature placement logs CSP errors.
See [`.factory/verification.md`](verification.md) for the exact evidence,
normal/boundary/recovery product exercise, headers, privacy/outbound-request
checks, accessibility/offline results, and required fixes.

## Delivered

- A complete Vite + vanilla TypeScript static application in `dist/`.
- Browser-local PDF loading and rendering with lazy-loaded PDF.js.
- Existing AcroForm field discovery and editing for text, checkbox, dropdown, and radio controls.
- New text, checkbox, date, and signature fields with pointer placement, drag/resize, keyboard movement, and property editing.
- Drawn and typed signature creation with an explicit non-qualified-signature notice.
- Page thumbnails with selection, keyboard-accessible reordering, 90° rotation, deletion, and one-step undo.
- Local export through pdf-lib with editable new fields or flattened output.
- Friendly empty, loading, invalid/encrypted PDF, XFA, offline, and export error states.
- Responsive editor and landing experience down to a tested 390px-class viewport.
- Privacy and terms routes, offline shell service worker, Azure Static Web Apps fallback/security/cache configuration, favicon, robots file, and sitemap.
- Original product illustration in AVIF (12 KB), WebP (22 KB), and JPEG (38 KB); source and prompt provenance are under `assets/src/`.

## Deployment repair — 2026-08-27

The original Azure Static Web Apps deployment was blocked by the subscription's
Free SKU site quota (ARM error 51021), not by an application failure. The
accepted static product has been preserved and is now deployed through the
factory Container Apps path at <https://local-pdf-forms-signer.sociobot.in>.

- Added a minimal multi-stage `Dockerfile`: Node 22 builds the existing Vite
  application and `nginxinc/nginx-unprivileged` serves `dist/` as UID/GID 101 on
  port 8080.
- Added NGINX SPA fallback for client routes, `no-store` HTML, `no-cache` for
  `sw.js`, and one-year immutable cache controls only for fingerprinted Vite
  assets. Public unfingerprinted assets use a short cache lifetime.
- Applied the existing CSP plus `nosniff`, frame, referrer, permissions,
  cross-origin, and HSTS headers in the container runtime. The service worker
  continues to register from `/sw.js` and retains its existing offline shell.
- Added `.dockerignore` and documented local container build/run instructions
  in `README.md`.
- The factory ACR image build succeeded for commit `e700deb93d29`; a remote
  `nginx -t` check passed. The ready Container Apps revision is serving that
  image, and the public hostname has a valid managed HTTPS certificate.

## Run and verify

```sh
npm install
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Build output lands at `dist/`, with `dist/index.html` at its root.

To exercise the production container locally when Docker is available:

```sh
docker build -t field-desk .
docker run --rm -p 8080:8080 field-desk
```

Then visit <http://localhost:8080>, including `/privacy` and `/terms` to check
the SPA fallback. This repair worker did not have a Docker-compatible runtime,
so the image was instead built and syntax-checked through the factory ACR path
before deployment.

Verification on 2026-08-27:

- `npm test`: 6/6 unit and PDF integration tests passed.
- `npm run test:e2e`: 4 relevant project tests passed, 2 intentionally skipped matrix duplicates. The suite covers desktop and mobile accessibility, no console errors, existing-field input, field placement, page reorder/delete/undo, and a real PDF download.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Lighthouse 11.7.1, mobile preset against the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.2 s, CLS 0, total blocking time 0 ms.
- Initial application JavaScript: 38.10 KB raw / 12.45 KB gzip. CSS: 20.24 KB raw / 5.41 KB gzip. PDF.js and pdf-lib are split into lazy chunks and load only after a document is chosen.
- Hero image budget: AVIF 12 KB, WebP 22 KB, JPEG 38 KB.
- Deployment-repair checks: ACR container build succeeded; remote `nginx -t`
  passed; the ready Container Apps replica has zero restarts; public HTTPS
  returns 200 with the intended HTML, service-worker, hashed-asset cache, and
  security headers.
- Factory URL verifier against the public hostname: 200 in 626 ms, one `h1`,
  `lang="en"`, a `main` landmark, no images missing alt text, no unlabeled
  buttons, and zero console errors.
- Public desktop and Pixel 5 browser checks: no console/page errors, no
  serious or critical Axe violations, mobile content fits the viewport, and
  `/sw.js` registered successfully in both contexts.

## Known limits

- Dynamic XFA forms are detected but not editable; the page content can still be marked and exported.
- Existing source form fields may become fixed appearances when pages are copied/reordered. Fields created in Field Desk stay editable unless “Flatten completed fields” is selected.
- Signatures are visual marks without identity verification, certificates, or an audit trail.
- There is no OCR and no editing of existing PDF text.
- Input is capped at 175 MB to reduce catastrophic browser-memory failures; large scanned PDFs can still exceed device memory.
- Rotation is stored as PDF page rotation. Users should review fields placed on rotated pages in the exported file because PDF viewers vary in annotation handling.

## Next useful work

- Add an optional page-insertion/import workflow.
- Preserve editable source AcroForm catalogs across arbitrary page reordering.
- Add Safari/iOS export coverage and password-entry support for encrypted PDFs whose permissions allow editing.
