# Re-review 5 — fill, sign, and arrange PDFs locally

**Live URL:** https://local-pdf-forms-signer.sociobot.in

**Reviewed:** 2026-09-06 UTC

**Implementation candidate:** `c269e6bdeda5d305de5991e34be3ca5f1c7b75d4`

**Documentation baseline:** `7ec1a6f55125916e3337e78e9bb778186b24b032`

**Verdict: FAIL — 4 minor findings, 0 untested claims.**

The core PDF job works, every registered claim passes, and the live files match
the implementation candidate. PASS still requires zero findings of every
severity. Four small accessibility and wording defects remain.

## First screen before scrolling

Fresh Chromium contexts opened at 390 × 844 and 1440 × 900 with empty site
state and scroll position zero.

- **Job:** Fill and sign PDFs, add fields, arrange pages, and download the result on the device.
- **Audience:** People and small offices handling sensitive forms.
- **First action:** **Try it with sample data**. The adjacent text says it opens a completed sample PDF that can be edited.

The headline is “Fill and sign PDFs on your device.” The audience sentence,
sample action, result sentence, and three facts are visible before scrolling at
both sizes. There is no horizontal overflow or load error. Evidence:
[`first-screen-phone.png`](evidence/review-5/first-screen-phone.png) and
[`first-screen-desktop.png`](evidence/review-5/first-screen-desktop.png).

## Findings

### MINOR — F5-1: several phone touch targets are smaller than 44 × 44 px

At 390 px, the header **Privacy** link measures 42.23 × 44 px and **Terms**
measures 34 × 44 px. The footer versions measure 39 × 17 px and 33 × 17 px.
They are spaced and still usable, but they do not meet the attached 44 × 44 px
touch-target rule.

Add padding or a 44 px minimum width and height to header and footer links.
The hidden file input and the 22 px checkbox are not included in this finding;
their larger labels provide the operative targets.

### MINOR — F5-2: the focus ring misses 3:1 contrast on dark controls

Focused header links and dark-toolbar controls use a 3 px `#b84427` outline on
`#202a2a`. The measured contrast is 2.73:1, below the required 3:1. The ring is
present and other backgrounds pass, so keyboard use is not blocked. Evidence:
[`focus-phone.png`](evidence/review-5/focus-phone.png).

Use a separate focus color that reaches 3:1 on both the paper and charcoal
surfaces, or use a two-color focus indicator.

### MINOR — F5-3: signature tabs do not support arrow-key navigation

The signature dialog exposes **Draw** and **Type** as `role="tab"` inside a
`tablist`. Both remain in the Tab order. With focus on **Draw**, pressing
ArrowRight leaves focus and `aria-selected` on **Draw**. Enter and Tab still
work, and the dialog otherwise traps and restores focus correctly.

Implement roving `tabindex` and Left/Right, Home, and End behavior for the
tablist, while keeping Enter and Space activation.

### MINOR — F5-4: decorative labels remain in task and legal screens

The live interface still shows **“Field Desk record 02”**, **“Field Desk record
03”**, **“Field Desk routing record”**, **“Signature instrument”**, and
**“Output control”**. These labels add internal theme language rather than
helping someone complete the PDF job. They also escaped the current copy audit.

Remove the labels or use direct names such as **Privacy**, **Terms**,
**Signature**, and **PDF download**. The main titles themselves are clear.

## Demo and PDF output

The first-screen action opens `/demo` in one click. Both viewports immediately
show the active two-page `harbor-intake-sample.pdf`, not a mock-up. It contains
Maya Chen, a project, email, selected project type, checked approval, sample
signature, and a landscape notes page. Evidence:
[`demo-phone.png`](evidence/review-5/demo-phone.png) and
[`demo-desktop.png`](evidence/review-5/demo-desktop.png).

The banner **“Demo — sample data, nothing is saved”** remains present after
edits and reset. Changing the client name and selecting **Reset demo** restores
“Maya Chen”. **Start for real** removes the editor. Real localStorage and
sessionStorage sentinels stayed unchanged; the demo created no localStorage,
sessionStorage, IndexedDB, or cookie entry.

The live browser suite edited text, choice, and checkbox controls; created
text, checkbox, and date fields; placed typed and drawn signatures; moved,
rotated, removed, and restored pages; and downloaded both editable and
permanent PDFs. `pdf-lib` checks confirmed retained values and field types,
page order/count/rotation, no digital-signature field, and no form fields in
the permanent download.

## Registered claims

A clean checkout of the documentation baseline ran every command exactly as
listed in `.factory/claims.json`. The registry contains 16 IDs and the test
source contains one matching tag for each ID.

| Claim | Result | Observable check |
| --- | --- | --- |
| `demo-isolation` | PASS | Storage sentinels preserved; reset and real/demo exits discard the right document. |
| `local-only` | PASS | Full edit/export flow made same-origin GET requests only. |
| `offline-reload` | PASS | Exact public cache manifest matched; opened PDF absent; editable demo reopened offline. |
| `pdf-files-only` | PASS | Text file produced the PDF-only recovery message. |
| `max-file-size` | PASS | Simulated 176 MiB file was rejected before parsing. |
| `standard-form-export` | PASS | Edited text, dropdown, and checkbox values remained in the PDF. |
| `add-fields` | PASS | Text, checkbox, and date AcroForm controls existed in the download. |
| `signature-mark` | PASS | Typed and drawn marks exported without a digital-signature field. |
| `page-actions` | PASS | Order, rotation, removal, undo, and downloaded page state matched. |
| `export-modes` | PASS | Editable download retained fields; permanent download had none. |
| `no-document-persistence` | PASS | Reload and tab close cleared real opened PDFs. |
| `no-account` | PASS | Export completed without sign-in UI or authentication request. |
| `free-use` | PASS | Export completed without payment UI or billing request. |
| `no-ocr` | PASS | Image-only PDF produced no inferred text or OCR action. |
| `no-page-text-edit` | PASS | Printed page text stayed static; only added text fields were available. |
| `reject-xfa` | PASS | Dynamic XFA input showed the specific error and no editor. |

No claim-like sentence on the live pages or README lacks a registry entry.
There are **0 untested claims**.

## Normal, invalid, boundary, and recovery checks

- Normal sample and generated real-PDF workflows completed without console or page errors.
- A corrupt `.pdf` showed the damaged/unsupported message. Opening a valid uppercase `.PDF` immediately afterward recovered and opened the editor.
- Exactly 175 MiB was accepted; 176 MiB was rejected.
- A one-page PDF disabled **Remove page**.
- XFA, image-only, and printed-text limits behaved as registered.
- Export names, both export modes, and the instruction to review the output were present.

## Accessibility, privacy, offline use, and routes

- Axe found zero violations of any impact on `/`, `/demo`, `/privacy`, `/terms`, and the 404 screen at phone and desktop sizes.
- Keyboard checks reached the skip link, opened and closed the signature dialog, kept focus inside it, restored focus to **Signature**, placed/moved/deleted a field, and used page actions. F5-2 and F5-3 remain.
- Reduced motion changed transitions to `0.01ms` and disabled smooth scrolling. A 720 px reflow check, used as the 200% desktop-width proxy, retained `h1`, `main`, footer, and no horizontal overflow on every route.
- The full demo/edit/export request log had no off-origin request. The source has no analytics, upload, account, payment, beacon, XHR, or document-storage path.
- The service worker became active, `registration.update()` completed, and `/demo` reopened with its editable sample after the context went offline. Its only cache was the generated public shell cache.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, sitemap, icons, and social card return 200. A direct unknown route deliberately returns HTTP 404 and shows the designed recovery page; this is expected, not a defect.
- Route titles, descriptions, canonicals, Open Graph/Twitter values, single `h1`, landmarks, route announcements, history focus, legal links, and shared header/footer are present.
- The product is static. Backend tenant isolation, restart persistence, health, and 429/Retry-After checks do not apply. `POST /upload` returns 405.

The URL verifier returned 200 with title, `lang=en`, one `h1`, `main`, no missing
alt text, no unlabelled button, and no browser error. Evidence:
[`verify-url.json`](evidence/review-5/verify-url.json).

## Build, delivery, and performance

Clean checkout: `/tmp/local-pdf-forms-signer-review5.vhrN9d`.

| Command/check | Result |
| --- | --- |
| `npm ci` | PASS; 70 packages, 0 audit vulnerabilities. |
| `npm test` | PASS; 9 tests. |
| `npm run build` | PASS; `dist/index.html` produced. |
| `npm run test:e2e` | PASS; 22 passed, 18 intentional cross-project skips. |
| Every registered claim command | PASS individually; 16 of 16. |
| Live `npm run test:e2e` | PASS; 22 passed, 18 intentional skips. |
| `/opt/fleet/lib/verify-url.sh` | PASS; no console errors. |

Initial application JavaScript is 44,176 bytes raw / 13,820 bytes gzip. CSS is
21,703 bytes raw / 5,671 bytes gzip. No fonts ship. The mobile hero AVIF is
11,577 bytes. PDF libraries and the PDF worker load only after a PDF opens.

Fresh mobile Lighthouse scored 100 performance, 100 accessibility, 100 best
practices, and 100 SEO; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0. Evidence:
[`lighthouse-mobile.json`](evidence/review-5/lighthouse-mobile.json).

SHA-256 matched for live `index.html`, `sw.js`, field CSS, icons, metadata
files, all three hero formats, entry JS/CSS, sample chunk, PDF chunks, and PDF
worker files. The live deployment is the `c269e6b` implementation. Later
commits through `7ec1a6f` changed tests, review material, or Graphify output,
not the shipped product files.

## Earlier findings

| Earlier item | Current disposition |
| --- | --- |
| R1 demo and sandbox | Fixed. Direct demo, completed sample, banner, reset, exit, and memory-only isolation pass. |
| R1 claim registry | Fixed. Sixteen one-to-one claim tests pass individually. |
| R1 first screen | Fixed. Job, audience, first action, outcome, and three facts are visible before scrolling. |
| R1 404 | Fixed. Direct unknown route returns 404 with a designed way home. |
| R1 metadata and route focus | Fixed. Route metadata, announcements, history, and heading focus pass. F5-2 concerns focus-ring contrast, not route focus movement. |
| R1 product preview and three steps | Fixed. Live sample editor and Open/Edit/Download sequence are present. |
| R1 header routes | Fixed. Sample, Privacy, and Terms are present on every route. F5-1 concerns their target size. |
| R1 copy and terminology | Fixed for every cited phrase and README sentence. F5-4 covers different labels missed by that audit. |
| R2 offline demo | Fixed. Exact-cache and offline reload checks pass. |
| R2 unlisted limits/privacy claims | Fixed. OCR, printed text, XFA, signature, cache, and local-only statements are registered and pass. The old no-backend and signing-record copy was removed. |
| R2 sample wording and landing eyebrow | Fixed. The header says “Open sample PDF”; the landing eyebrow names the local PDF editor. |
| R2 privacy heading, README heading, footer | Fixed with direct wording and current v1.0.3. |
| R3 no-audit-trail claim | Fixed. The dialog now uses only the registered visual-signature statement. |
| R3 public-cache claim | Fixed. It is registered and the exact cache contents are tested. |
| R4 zero-finding conclusion | Not sustained. Its functional checks still pass, but F5-1 through F5-4 were missed. |

## Scope and missed leverage

The implemented scope matches the brief: existing forms, new fields,
signatures, page work, and editable/permanent output are present. OCR and page
text editing are stated limits. Cloud sync or document extraction would weaken
the local-only promise, so no AI or sync omission is a finding.

No product code was changed during this review.
