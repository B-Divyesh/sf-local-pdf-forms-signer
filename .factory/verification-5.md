# Verification 5 — fill, sign, and arrange PDFs locally

**Verdict: PASS — 0 findings and 0 untested claims.**

- **Verified:** 2026-09-06 UTC
- **Implementation reviewed:** `ef92586b63c8cf18d4ce58d86a044cb386db2470`
- **Documentation reviewed:** `fbf6f053198e961dc005c40d969b1c975634a0d3`
- **Deployment:** `7616f7fc-4e57-4f7e-be75-fc846302393e`
- **Live URL:** <https://local-pdf-forms-signer.sociobot.in>

The later repository tip, `74c38c517e5f96e780aada68a34558c71a64a65c`,
changes only Graphify output after the documentation commit. It does not
require a different product image. All 19 public files from a clean build of
the implementation SHA are byte-identical to the live files.

## First screen before scrolling

Fresh browser contexts opened at 390 × 844 and 1440 × 900 with empty site
state and `scrollY = 0`.

- **Job:** Fill and sign PDFs, add fields, arrange pages, and download the
  result on the device.
- **Audience:** People and small offices handling sensitive forms.
- **First action:** **Try it with sample data**. The adjacent text says it
  opens a completed sample PDF that can be edited.

The exact headline is **“Fill and sign PDFs on your device.”** The audience,
sample action, action result, and the three facts **No PDF uploads**, **Works
offline after first visit**, and **Free · no account** are visible before
scrolling in both contexts. The phone facts end at 752 px in the 844 px
viewport. Neither context has horizontal overflow or a console error.

## Clean-checkout gates

Detached checkout:
`/tmp/local-pdf-forms-signer-verify5.errPUi` at the implementation SHA.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 70 packages installed and 0 vulnerabilities. |
| `npm test` | PASS; 9 tests in 2 files. |
| `npm run build` | PASS; typecheck and Vite build produced `dist/index.html`. |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities. |
| `npm run test:e2e` | PASS; 26 passed and 22 intentional cross-viewport skips. |
| Every command in `.factory/claims.json` | PASS separately; 16 of 16. |
| Claim registry/tag audit | PASS; each of 16 IDs appears in exactly one `@claim:<id>` test. |

Initial application JavaScript is 44.57 KB raw / 13.98 KB gzip. CSS is
21.92 KB raw / 5.70 KB gzip. The PDF engines and worker are lazy-loaded.

## Registered claims

Every command below was run separately from the clean checkout, exactly as
declared in `.factory/claims.json`.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolation` | PASS | Storage sentinels stayed unchanged; reset and demo/real transitions discarded the right document. |
| `local-only` | PASS | The complete sample edit and export made same-origin GET requests only. |
| `offline-reload` | PASS | The cache matched the generated public manifest, excluded an opened PDF, and reopened the editable sample offline. |
| `pdf-files-only` | PASS | A text file showed the PDF-only recovery message. |
| `max-file-size` | PASS | A reported 176 MiB PDF was rejected before parsing. |
| `standard-form-export` | PASS | Edited text, dropdown, and checkbox values remained in the editable PDF. |
| `add-fields` | PASS | Added text, checkbox, and date controls existed in the editable PDF. |
| `signature-mark` | PASS | Typed and drawn marks exported without a digital-signature field. |
| `page-actions` | PASS | Move, rotate, remove, undo, order, count, and rotation reached the download. |
| `export-modes` | PASS | Editable output retained fields; permanent output contained none. |
| `no-document-persistence` | PASS | Reload and tab close cleared a real opened PDF. |
| `no-account` | PASS | Download completed with no sign-in control or authentication request. |
| `free-use` | PASS | Download completed with no payment control or billing request. |
| `no-ocr` | PASS | An image-only PDF produced no inferred field or OCR action. |
| `no-page-text-edit` | PASS | Printed page text stayed static; only added text fields were offered. |
| `reject-xfa` | PASS | A dynamic XFA PDF showed the specific rejection and no editor. |

The live pages, dialogs, README, demo guide, catalog text, and metadata were
cross-checked against the registry and current copy audit. No missing,
untested, false, or incomplete public claim was found.

## Sample, reset, and realistic output

The first-screen action enters `/demo` in one click and immediately opens the
real editor with `harbor-intake-sample.pdf`. The two-page Harbor Street Studio
intake contains Maya Chen, an email address, a project choice, a checked
approval box, a signature mark, and a landscape notes page.

The banner **“Demo — sample data, nothing is saved”** remained visible after
editing and reset. An independent run changed the name to Ada Lovelace,
selected Store signage, cleared approval, and downloaded
`harbor-intake-sample-field-desk.pdf`. PDF inspection found two pages, five
editable fields, and all three changed values. **Reset demo** restored Maya
Chen. **Start for real** removed the editor.

Real localStorage, sessionStorage, cookie, and IndexedDB sentinels were
identical before and after the demo. The demo added no storage item. Its full
request log contained no off-origin request and no method other than GET.

## Normal, invalid, boundary, and recovery paths

- Normal demo and real-PDF editing, existing and added fields, typed and drawn
  signatures, page actions, editable output, and permanent output passed.
- `notes.txt` showed **“Choose a file ending in .pdf.”**
- A corrupt PDF showed the damaged-or-unsupported explanation. A valid
  uppercase `RECOVERED.PDF` opened immediately afterward.
- Exactly 175 MiB was accepted; 176 MiB was rejected before parsing with a
  smaller-or-compressed-copy recovery action.
- **Remove page** was disabled for a one-page PDF. Delete and Undo worked for
  a two-page PDF.
- XFA, image-only, and printed-text limits behaved as registered.
- A signature dialog kept keyboard focus inside, exposed the accessible name
  **Create your signature**, closed with Escape, and restored focus to the
  Signature tool.
- No checked path emitted a console or page error.

## Accessibility and review-5 repairs

Playwright Axe found zero violations of any impact on `/`, `/demo`,
`/privacy`, `/terms`, and the designed 404 UI at phone and desktop sizes. The
factory URL check also found `lang=en`, the correct title, one `h1`, one
`main`, complete image alternatives, labelled buttons, and zero browser
errors.

| Review-5 finding | Current live evidence | Disposition |
| --- | --- | --- |
| F5-1 phone targets | Skip, header, footer, and both dialog-close controls measured at least 44 × 44 CSS px. Privacy and Terms are exactly 44 × 44 px. | Fixed. |
| F5-2 focus contrast | The 3 px solid `rgb(201, 79, 45)` ring measures 3.254:1 against the charcoal toolbar/header surface. | Fixed. |
| F5-3 signature tab keys | Right and Left arrows wrap and select; End selects Type; Home selects Draw; only the active tab has `tabindex=0`. | Fixed. |
| F5-4 decorative labels | Privacy, Terms, 404, signature, and export screens lead with direct headings; the record, routing, instrument, and output labels are absent. | Fixed. |

Keyboard checks also covered the skip link, route-heading focus, field
placement and movement, field deletion, native dialog trapping, and focus
restoration. At the 720 px reflow proxy for 200% zoom, all five routes retain
their heading, main content, footer, and no horizontal overflow. Reduced
motion computes to `0.01ms` transitions and `scroll-behavior: auto`.

## Privacy, offline use, routes, and delivery

- The service worker controls the page, reports offline readiness, completes
  `registration.update()`, and uses one generated shell cache.
- The live claim suite reopened the editable demo offline and proved that the
  cache contains exactly the public manifest, not a visitor PDF.
- The response policy includes HSTS, `nosniff`, `no-referrer`, restrictive
  permissions, and a same-origin CSP with `frame-ancestors 'none'`.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, sitemap, icons, and social
  card return 200. Every crawled internal destination works.
- A direct request to an unknown route deliberately returns HTTP 404 and the
  browser shows the designed recovery page. That expected 404 is not a defect.
- Route titles, descriptions, canonicals, Open Graph/Twitter values, one `h1`,
  landmarks, route announcements, history focus, legal links, and the shared
  header/footer are present.
- `POST /upload` returns 405. This is a static product, so tenant isolation,
  restart persistence, health, and 429/Retry-After backend checks do not apply.

The first parallel live E2E run ended one browser process with Chromium
`SIGSEGV` after 25 tests had passed. Its reported error was
`browserContext.close: Test ended`, not a product assertion. The affected
`pdf-files-only` check then passed alone, and the complete live suite passed
serially with 26 passed and 22 intended skips. This is classified as runner
instability, not a product finding.

## Performance and candidate identity

Fresh mobile Lighthouse results:

| Category or metric | Result |
| --- | --- |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP / LCP | 1.0 s / 1.0 s |
| Total blocking time | 30 ms |
| CLS | 0 |

SHA-256/byte comparison matched all 19 deployable files: `index.html`,
service worker, manifest, field stylesheet, metadata files, three hero
formats, entry JavaScript/CSS, sample chunk, PDF chunks, and PDF workers.
The live runtime is the reviewed implementation candidate.

## Earlier findings

| Earlier item | Current disposition and proof |
| --- | --- |
| Review 1: no demo or sandbox | Fixed. Direct demo/query entry, realistic sample, persistent label, reset, exit, and memory-only isolation pass. |
| Review 1: no claim registry or tests | Fixed. Sixteen entries, one tag each, and all 16 commands pass separately. |
| Review 1: unclear job, audience, and first action | Fixed. Both fresh first screens state all three before scrolling. |
| Review 1: unknown routes showed Home | Fixed. Direct unknown request returns 404 with a designed recovery path. |
| Review 1: route metadata and route focus | Fixed. Titles, descriptions, canonicals, sharing metadata, focus, announcements, and back navigation pass. |
| Review 1: no preview or plain three-step sequence | Fixed. The sample is the real editor; Home uses Open, Edit, and Download steps. |
| Review 1 minor: header omitted required routes | Fixed. Home, sample, Privacy, and Terms are consistently available. |
| Review 1 copy and terminology flags | Fixed. The current audit has no over-22-word or banned-word flag and uses consistent sample, signature, local-processing, and export terms. |
| Review 2: offline demo failed | Fixed. Exact-cache and offline editable-demo reload pass. |
| Review 2: unlisted capability/privacy limits | Fixed. OCR, page text, XFA, signature, cache, and local-only statements are registered and tested. |
| Review 2 minor: inconsistent sample action | Fixed. Navigation says **Open sample PDF** and the prescribed primary invitation remains **Try it with sample data**. |
| Review 2 minor: unexplained landing label | Fixed. The landing label directly identifies a PDF editor that stays on the device. |
| Review 2 copy notes: privacy heading, README heading, footer | Fixed. Direct wording and release 1.0.4 are present. |
| Review 3: unlisted no-audit-trail statement | Fixed. The dialog now states only the registered visual-signature limit. |
| Review 3: unlisted cache-content statement | Fixed. `offline-reload` names and tests the exact public-only cache behavior. |
| Initial verification: red E2E gate | Fixed. The configured clean suite passes 26 tests. |
| Initial verification: CSP errors during placement | Fixed. Field and signature work emit no console errors under the deployed CSP. |
| Verification 3: editable export lost existing fields | Fixed. The live editable download retains names and values of standard fields. |
| Verification 3: parallel E2E timing | Fixed. The clean configured two-worker suite passes. |
| Verification 4 | Its zero-finding functional and CSP conclusions remain valid. |
| Review 4 | Its zero-finding claim, demo, copy, route, and accessibility conclusions remain valid. |
| Review 5: F5-1 through F5-4 | All four are fixed with the independent measurements above. |

## Scope and findings

The brief's useful scope is present: standard form filling, new text/checkbox/
date fields, drawn and typed signature marks, page move/rotate/remove/restore,
and editable or permanent download. OCR, editing printed page text, dynamic XFA
forms, and verified digital signatures remain clearly stated limits. Adding
cloud sync or document extraction would weaken the local-only job, so no AI or
sync omission is a finding.

| Severity | Finding count |
| --- | ---: |
| Blocking / P0 | 0 |
| Major / P1 | 0 |
| Moderate / P2 | 0 |
| Minor / P3 | 0 |
| Untested claims | 0 |

**Final verdict: PASS.**
