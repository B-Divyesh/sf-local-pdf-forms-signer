# Independent verification 4 — PASS — 2026-08-27

**Candidate verified:** `e50fc66c89faa79ec21d8aacd65578742941f384`<br>
**Live URL:** <https://local-pdf-forms-signer.sociobot.in><br>
**Release decision:** **PASS — accept.** Fresh clean-checkout verification
passed `npm ci`, 8/8 unit/PDF tests, exact TypeScript/Vite production build,
the configured two-worker Playwright suite (6 passed; 4 intentional skips),
and dependency audit. The live deployment is byte-identical for the checked
entry/lazy assets and service-worker files. Live editable export preserves the
filled source AcroForm field; flattened export, typed signing, page operations,
invalid-file recovery, 390 px/mobile axe, strict-CSP console checks, and
offline reload all passed. No P0–P3 defects found. See
[`verification-4.md`](verification-4.md) for exact evidence, headers, budgets,
and reproduction commands.

---

# Field Desk repair handoff — PASS — 2026-08-27

**Work order:** `local-pdf-forms-signer-repair-3`
**Base verified:** `4537015a2fcd850693dfc1b8cd2c728d615157c8`
**Production URL:** <https://local-pdf-forms-signer.sociobot.in>
**Deployment:** Azure Static Web Apps, Standard tier, resource group `sociobot`,
app `sf-local-pdf-forms-signer`; static `dist/` output.

## Repairs

1. Editable PDF export now edits the loaded source document rather than copying
   pages into a new document. Its page tree is rebuilt with the same source
   page objects, preserving AcroForm annotations and the original form
   dictionary through reorder, deletion, and rotation. Filled standard source
   fields and Field Desk-created fields remain editable unless the user selects
   flattening.
2. Editor readiness is now set when the editor is interactive, instead of
   waiting for PDF.js canvas rendering. The main canvas separately exposes its
   completed render state, and browser workflow tests use a realistic 15-second
   render allowance. This removes the prior two-worker timing failure without
   treating a partially loaded canvas as ready for placement.
3. Export copy now accurately says “Keep fields editable,” including source and
   added controls. The service-worker shell cache revision is `v3` so existing
   clients update to this repair.

## Regression coverage

- `src/pdf.test.ts` proves an unchanged source PDF retains `full_name` with
  `Ada Lovelace` and proves this again after page reordering.
- `tests/app.spec.ts` creates a real AcroForm PDF, fills `full_name` through
  the UI, downloads the default editable export, reparses it with `pdf-lib`,
  and asserts both field name and value.
- Browser readiness and rendered-canvas waits are explicitly distinct. The
  configured two-worker suite was run repeatedly and is green.

## Verification performed

```sh
npm ci                         # 70 packages; 0 audit vulnerabilities
npm test                       # 2 files, 8 tests passed
npm run build                  # tsc --noEmit + Vite; dist/ produced
npm audit --omit=dev           # 0 vulnerabilities
npm run test:e2e               # 6 passed, 4 intentional cross-project skips
```

`npm run test:e2e` was run three times under its configured two-worker mode;
each completed successfully. It exercises desktop form fill, page movement,
deletion/undo, text and typed-signature placement, keyboard Arrow movement,
flattened export, the new editable-download parse regression, landing/legal
Axe scans, and the 390 px mobile layout scan. There is no lint script; the
TypeScript check is part of `npm run build`.

Production checks after deployment:

- Live editable export: a browser-created source PDF with `full_name` was
  filled with `Ada Lovelace`; the downloaded default export parsed with
  `outputFields: ["full_name"]` and value `Ada Lovelace`, with no console
  errors and no off-origin request.
- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, 662 ms load, expected
  title/language, one `h1`, `main`, all image alt text, labelled buttons, and
  zero browser errors.
- Live mobile (390 x 844): Axe found zero serious/critical violations, no
  horizontal overflow, the skip link received focus, reduced-motion transition
  duration was `0.00001s`, and there were zero console errors.
- Local SWA emulator: service worker gained control; an offline reload rendered
  the shell `h1`; zero errors and only same-origin requests were observed.
- Response policy remains strict: HSTS, `nosniff`, no-referrer, restrictive
  permissions policy, same-origin CSP without `unsafe-inline`; HTML has
  `max-age=30`, hashed JS is immutable for one year, and `sw.js` is no-cache.
  `POST /` and `POST /upload` return 405. Source scan found no analytics or
  document-network API.
- Live deployment identity: SHA-256 matched local `dist/` for
  `index-D_bsFyfD.js`, `index-BU_1p1yK.css`, `sw.js`, and
  `field-positions.css`.
- Lighthouse live mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0. Initial app JS is
  39.25 KB raw / 12.78 KB gzip and CSS is 20.24 KB raw / 5.41 KB gzip.

## Run locally

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Known limits

- Dynamic XFA forms are detected but not editable; their page content can still
  be marked and exported.
- Some legacy PDFs have reader-specific field appearances; standard AcroForm
  controls are preserved, but users should review any exported PDF before
  sending it.
- Signatures are visual marks only, with no identity verification, certificate,
  audit trail, or qualified e-signature status.
- There is no OCR or editing of existing page text. Input is capped at 175 MB;
  large scanned PDFs can still exceed device memory.
