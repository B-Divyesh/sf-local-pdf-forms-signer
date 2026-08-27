# Independent verification — FAIL

**Verified 2026-08-27 UTC**

- Candidate: `1309298ee135dfa710c2510b5107d289334615fd`
- Live URL: <https://local-pdf-forms-signer.sociobot.in>
- Method: detached clean worktree at the candidate, `npm ci`, exact production
  build, automated repository checks, and independent Playwright/PDF checks.
- Verdict: **FAIL — do not promote as verified.** The repository's required
  end-to-end command fails reproducibly. The deployed product also logs CSP
  errors during a core placement workflow.

## Release gate results

| Check | Result | Evidence |
| --- | --- | --- |
| Locked install | PASS | `npm ci`: 70 packages installed; audit reported 0 vulnerabilities. |
| Unit/PDF integration | PASS | `npm test`: 6/6 tests passed. |
| Typecheck and exact production build | PASS | `npm run build` runs `tsc --noEmit && vite build` and completed successfully. No separate lint script exists. |
| Repository E2E suite | **FAIL** | `npm run test:e2e`: 1 failed, 3 passed, 2 skipped. Desktop test `opens, fills, edits pages, places a field, and exports` timed out at `tests/app.spec.ts:38` waiting for exact text `intake.pdf`. Repeated once with the same failure. |
| Live/candidate equivalence | PASS | All nine built files under `dist/assets/` (entry JS/CSS, lazy PDF.js/pdf-lib chunks, worker, and three hero formats) had byte-identical SHA-256 values at the live URL. `/`, `/privacy`, and `/terms` returned 200. |
| Accessibility smoke | PASS | Axe found 0 serious/critical violations on candidate preview and live site at desktop and 390 px. One `h1`, `main`, no horizontal overflow at 390 px; Tab reaches the skip link with a visible `3px` orange focus outline. |
| Offline/PWA | PASS (offline); smoke checked | Candidate preview and live site registered `/sw.js`, obtained a controller, and rendered the landing page after an offline reload. `registration.update()` completed against the current live script; an actual changed-server-version transition cannot be exercised without changing the deployed service worker. |
| Privacy/outbound requests | PASS | During live local-file open/fill/place/export, no XHR/fetch document request occurred. Runtime source scan found no analytics, storage API, beacon, or external runtime URL; all initial assets are same-origin. `POST /` returns 405, consistent with no upload endpoint. |
| Performance budgets | PASS by build artefacts | Initial entry JS is 38,097 B raw / 12,450 B gzip and CSS 20,235 B raw / 5,410 B gzip, under 200 KB/50 KB. Hero AVIF is 11,577 B. PDF.js/pdf-lib are lazy chunks. Lighthouse CLI could not yield a score because its Chromium tab crashed in this container; no score is claimed. |
| Live headers/cache | PASS with defect below | HTTPS has CSP, HSTS, `nosniff`, referrer and permissions policies. HTML: `public, max-age=30`; `sw.js`: `no-cache`; hashed assets: `public, max-age=31536000, immutable`. |

## Independent product exercise

Normal desktop exercise was completed both from the production candidate build
and against live:

1. Created a two-page AcroForm PDF with `full_name`, selected it locally,
   filled it with `Ada Lovelace`, added a text field, and changed its default
   value to `Local only`.
2. Used keyboard ArrowRight on the selected placed field; moved page 2 earlier,
   removed a page, then used Undo.
3. Exported flattened `intake-field-desk.pdf`; parsed the download with
   `pdf-lib` and confirmed two pages and zero remaining fields. A live editable
   export retained the new text field.
4. At 390 px live mobile, created a typed `Ada Lovelace` signature, placed it,
   and exported `mobile-field-desk.pdf` (1,211 bytes) without horizontal
   overflow.

Boundary, malformed, and recovery checks:

- `wrong.txt` is rejected with “Choose a file ending in .pdf.”
- corrupt `broken.pdf` is rejected with the damaged/unsupported-PDF message;
  a subsequent valid `recovered.pdf` opens successfully.
- an actual 176 MiB local `.pdf` is rejected before parsing with the stated
  over-175-MB memory warning.

The brief's supported scope (browser-local fill, new fields, visual signatures,
page operations, flatten/editable export) is substantively exercised. XFA and
password-protected PDFs remain declared product limitations; no false support
claim was found. Privacy/legal routes, MIT license, README, and original-image
provenance/design record are present.

## Defects

### P1 — committed end-to-end release gate is red

`npm run test:e2e` exits non-zero in a clean candidate checkout. The desktop
workflow's locator at `tests/app.spec.ts:38` cannot see exact `intake.pdf`
within its 5-second expectation, even though the failure trace's final
accessibility snapshot shows the document editor and filename. Independent
Playwright interaction succeeds, so this appears timing/locator-sensitive, but
it is still an unacceptable failing required test and contradicts the prior
handoff's “4 passed” claim.

**Required resolution:** make the E2E test deterministic (wait for a durable
editor-ready element/state, then use an unambiguous locator) and rerun the
whole suite cleanly until it exits 0.

### P2 — live CSP console errors during field/signature placement

The live CSP uses `style-src 'self'`, while the app emits inline `style`
attributes for placed field coordinates/sizes. Chrome logs “Applying inline
style violates … `style-src 'self'`” for text-field placement and typed
signature placement (one or two errors per workflow). The computed geometry
was still present in this browser and exports completed, so no visual failure
was observed; nevertheless this violates the no-console-errors quality gate
on a primary task and leaves policy/implementation inconsistent.

**Required resolution:** replace runtime inline styles with CSP-compatible
positioning (for example CSS custom properties set through an allowed strategy
or generated stylesheet), or deliberately revise the CSP only after a security
review. Verify zero console errors through field and signature workflows.

## Exact commands

```sh
git worktree add --detach /tmp/local-pdf-verify <candidate>
cd /tmp/local-pdf-verify
npm ci
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
npm run preview -- --port 4180
```

The independent browser checks used Playwright Chromium plus `pdf-lib` to
construct and parse real PDFs, `@axe-core/playwright` for the four viewport/
origin combinations, direct HTTPS header/cache checks, and SHA-256 comparisons
between candidate `dist/assets/*` and the production assets.
