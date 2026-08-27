# Independent verification 3 — FAIL

**Verified:** 2026-08-27 UTC  
**Candidate:** `4537015a2fcd850693dfc1b8cd2c728d615157c8` (`factory: repair local-pdf-forms-signer-repair-2`)  
**Live URL:** <https://local-pdf-forms-signer.sociobot.in>

## Verdict

**FAIL — do not accept or promote this candidate.** Two acceptance gates are
red: a core promised workflow does not preserve filled existing AcroForm
fields in an editable export, and the repository's required parallel E2E
command is flaky/failing from a clean checkout.

The deployed application is the candidate: local and live SHA-256 values
match for the HTML-referenced JS/CSS chunks, PDF chunks, all three hero image
formats, favicon, `field-positions.css`, and `sw.js`.

## Clean-checkout release gates

Detached clean worktree: `/tmp/local-pdf-forms-signer-verify-3` at the stated
commit.

| Check | Result | Evidence |
| --- | --- | --- |
| Locked install | PASS | `npm ci`: 70 packages installed, 0 audit vulnerabilities. |
| Unit/PDF integration | PASS | `npm test`: 6/6 tests passed. |
| Type check / production build | PASS | `npm run build` (`tsc --noEmit && vite build`) completed and produced `dist/`. No lint script exists. |
| Repository E2E | **FAIL** | `npm run test:e2e`: 1 failed, 4 passed, 3 intentional skips. Desktop `opens, fills, edits pages, places a field, and exports` timed out at `tests/app.spec.ts:38` waiting for `[data-editor-ready="true"]`. The final trace snapshot shows the editor and `intake.pdf` already loaded, but it never became ready within the five-second assertion. The same test passes when run serially (`npx playwright test --project=desktop`), establishing a parallel/timing defect rather than a clean pass. |
| Dependency audit | PASS | `npm audit --omit=dev`: 0 vulnerabilities. |
| Live/candidate identity | PASS | Byte-identical current deployment assets as above; live HTML references `index-z8rim23e.js` and `index-BU_1p1yK.css`, matching the candidate build. |

## Independent product exercise

Completed against both the candidate's production build and the live URL:

1. Generated a real two-page PDF with text, checkbox, and select AcroForm
   controls; opened it locally; filled `full_name` with `Ada Lovelace`; added
   a text field; downloaded editable and flattened exports.
2. The downloads are valid PDFs with two pages, expected filename
   `intake-field-desk.pdf`, no browser console/page errors, no inline field
   geometry styles, and no off-origin runtime request. The editable output
   retains a newly-created `field_desk_text_*` control; flatten output has no
   form fields.
3. Exercised invalid/recovery cases at 390 px: `.txt` is rejected; corrupt
   `.pdf` shows the damaged/unsupported message; a subsequent valid PDF opens;
   one-page deletion is disabled; 176 MiB input is rejected before parsing.
4. Desktop's focused repository workflow also exercised text placement,
   typed signature placement, keyboard Arrow movement, page reorder,
   delete/Undo, and flattened download successfully.

### P1 — existing AcroForm fields are lost from an editable export

This violates the brief's “fill existing AcroForm fields” and “export editable
or flattened” job. On the live deployment, a one-page source PDF whose only
AcroForm field is `full_name` was filled with `Ada Lovelace` and exported using
the default **Keep new fields editable** choice. `pdf-lib` parsing showed:

```json
{"sourceFields":["full_name"],"outputFields":[]}
```

When a newly created field is also present, the same editable export contains
only `field_desk_text_*`; the filled source `full_name` is absent. This is
reproduced by the candidate because the served JS bytes are identical. The
implementation updates the source form then copies pages into a new document,
which does not retain the source AcroForm structure. A user requesting an
editable export cannot continue to edit their original field.

**Required fix:** preserve/import original AcroForm fields and values for the
non-flattened path (including a no-reorder document), or accurately limit the
product and its export option. Add a regression that creates a source field,
fills it through the UI, exports non-flattened, and asserts the output still
has that field and value.

### P1 — committed E2E suite is nondeterministic and exits non-zero

The exact required command fails in the clean checkout under its configured
two-worker run. `renderCanvases()` marks `data-editor-ready` only after PDF.js
rendering; the test only grants five seconds. Under concurrent execution the
editor appears but misses that ready-state deadline. This fails the mandatory
quality gate even though a serial run succeeds.

**Required fix:** make readiness independent of slow thumbnail rendering and
give the test a durable, realistic wait budget; rerun the complete configured
suite repeatedly until it exits 0.

## Accessibility, privacy, PWA, delivery, and performance

| Area | Result | Evidence |
| --- | --- | --- |
| Axe serious/critical | PASS | `@axe-core/playwright`: zero serious/critical findings on candidate and live at desktop and 390×844. |
| Keyboard/focus/reduced motion | PASS | Tab lands on the skip link with a visible `rgb(184,68,39)` 3 px outline / 3 px offset. One `h1`, a `main`, no 390 px horizontal overflow. Under reduced motion, animation duration becomes `.01ms` and smooth scrolling becomes `auto`. |
| Browser errors | PASS except E2E timing gate | Candidate/live normal, invalid, export, offline, and verifier flows recorded zero console/page errors. `/opt/fleet/lib/verify-url.sh` recorded HTTPS 200, 650 ms load, title/lang/main, image alt, labelled buttons, and no errors. |
| Privacy/outbound requests | PASS | Normal local file open/fill/place/export generated no off-origin request; source scan found no analytics, storage, beacon, XHR, or fetch API use in app code. `POST /` and `POST /upload` each return 405. |
| Response policy/cache | PASS | HTTPS sends HSTS, `nosniff`, no-referrer, restrictive permissions policy, and strict same-origin CSP (`connect-src 'self'`, no `unsafe-inline`). HTML is max-age=30, `sw.js` no-cache, and hashed assets immutable for one year. |
| PWA/offline/update | PASS | Candidate and live registered/took control with `sw.js`; `registration.update()` completed, and after the shell cache was populated an offline reload rendered `main` and `h1` with zero errors. A changed server version cannot be simulated without changing deployment. |
| Budget/build artefacts | PASS | Initial JS `39,094 B` raw / `12.74 KB` gzip and CSS `20,235 B` raw / `5.41 KB` gzip; both are below 200/50 KB. PDF.js/pdf-lib load lazily. Hero AVIF is `11,577 B`. |
| Lighthouse live mobile | PASS | Lighthouse 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1.0 s, LCP 1.1 s, TBT 30 ms, CLS 0. |

## Commands used

```sh
git worktree add --detach /tmp/local-pdf-forms-signer-verify-3 4537015a2fcd850693dfc1b8cd2c728d615157c8
cd /tmp/local-pdf-forms-signer-verify-3
npm ci
npm test
npm run build
npm run test:e2e
npx playwright test --project=desktop --reporter=line
npm audit --omit=dev
npm run preview -- --port 4174
/opt/fleet/lib/verify-url.sh https://local-pdf-forms-signer.sociobot.in /tmp/field-desk-verify-url-3
```

Independent Playwright scripts constructed and parsed real PDFs with `pdf-lib`,
ran axe at both target viewport sizes, tested invalid/recovery and 176 MiB
input, inspected browser request/error streams, exercised the service worker
offline/update path, compared SHA-256 deployment bytes, and ran Lighthouse
against the live URL.
