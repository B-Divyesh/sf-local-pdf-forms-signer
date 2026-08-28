# Adversarial first-read review 3 — Field Desk

**URL checked:** https://local-pdf-forms-signer.sociobot.in

**Date:** 2026-08-28

**Candidate:** `a5e4d6149ec534d5dd40004ea8f284ad467bc226`

**Verdict: FAIL**

The live product is clear, usable, distinctive, and passes every registered
claim test. It still cannot pass the required zero-finding standard because
two visitor-facing claims are not represented by the claim registry. One is
the unresolved remainder of the earlier R2-M1 finding, so it is blocking.

## Cold first read, before scrolling

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 950 with no prior
site storage. Both started at scroll position zero.

- **What it does:** It fills and signs PDFs, adds fields, arranges pages, and
  keeps the work on the device.
- **For whom:** People and small offices handling sensitive forms.
- **What to click first:** **Try it with sample data**. The adjacent sentence
  says that it opens a completed sample PDF that can be edited.

This passes at both sizes. At 390 px, the headline, audience sentence, both
actions, action outcome, three facts, and file limit all end above pixel 785
of the 844 px viewport. The page has no horizontal overflow and logs no browser
errors.

## Findings, ordered by severity

### BLOCKING — F-3-1 (regression of R2-M1): the editor still makes an unlisted no-audit-trail claim

- **Exact quote/location:** Signature dialog in `/demo`: **“This adds a visual
  mark only. It is not a qualified electronic signature or an audit trail.”**
- **Why this fails:** `.factory/claims.json` registers `signature-mark`, whose
  claim is that signatures are visual marks rather than verified digital
  signatures. Its test confirms that exported PDFs contain no digital-signature
  field. Neither that entry nor another entry claims or tests that Field Desk
  creates no audit trail. Review 2 explicitly identified the equivalent
  signing-record statement under R2-M1. The polish report says it was removed,
  but the live editor still says it. This is half-fixed prior work and therefore
  blocking under the history rule.
- **Concrete fix:** Prefer the copy-only fix: replace the dialog sentence with
  **“This adds a visual signature mark, not a verified digital signature.”**
  If “no audit trail” must remain, add a separate `no-audit-trail` entry and one
  tagged test that inspects the complete UI and downloaded PDF for any signing
  record, certificate, identity proof, timestamp, or audit artifact.

### MAJOR — F-3-2: the Privacy page makes an unlisted cache-content claim

- **Exact quote/location:** `/privacy`, **Offline use**: **“The offline cache
  contains only public app files.”**
- **Why this fails:** `offline-reload` promises and tests that the app and sample
  reopen offline. The test confirms that cached request URLs are same-origin,
  but the registry does not state the separate promise that every cached item
  is a public app file. Same-origin is not equivalent to public-only. A visitor
  can rely on this sentence when deciding whether a confidential PDF may be
  retained. Manual inspection found only app assets today, but an unregistered
  manual observation is not the required repeatable claim contract.
- **Concrete fix:** Either remove that sentence or extend the registered claim
  to **“The offline cache stores only public app files, never opened PDFs.”**
  Then make its tagged test compare every cache entry with the generated
  precache manifest after both demo and real-file workflows and check that no
  opened-PDF bytes are present.

## Copy audit

Counts split on whitespace; hyphenated terms, paths, numbers, and version
strings count as one word. Repeated header/footer links are listed with their
locations. Code blocks are commands rather than sentences and are excluded.
No landing or README unit exceeds 22 words, contains a banned marketing word,
or needs a rewrite. The two claim-copy defects outside this requested pair of
surfaces are findings F-3-1 and F-3-2 above.

### Landing page

| Location | Copy | Words | Result |
| --- | --- | ---: | --- |
| Skip link | Skip to main content | 4 | Pass |
| Header wordmark | Field Desk | 2 | Pass |
| Header link | Open sample PDF | 3 | Pass; result-naming verb |
| Header link | Privacy | 1 | Pass |
| Header link | Terms | 1 | Pass |
| Header status | Stays on this device | 4 | Pass; `local-only` |
| Hero eyebrow | PDF editor that stays on your device | 7 | Pass; `local-only` |
| H1 | Fill and sign PDFs on your device. | 7 | Pass; job-first and under nine words |
| Hero audience | For people and small offices handling sensitive forms, add fields, sign, and arrange pages without uploading a PDF. | 18 | Pass; under 22 words |
| Primary action | Try it with sample data | 5 | Pass; prescribed sample action |
| Secondary action | Open your PDF | 3 | Pass; result-naming verb |
| Action outcome | Opens a completed sample PDF you can edit. | 8 | Pass |
| Fact | No PDF uploads | 3 | Pass; `local-only` |
| Fact | Works offline after first visit | 5 | Pass; `offline-reload` |
| Fact | Free · no account | 3 | Pass; `free-use`, `no-account` |
| File note | PDF files only. | 3 | Pass; `pdf-files-only` |
| File note | Files over 175 MB are rejected. | 6 | Pass; `max-file-size` |
| Image caption | Fill, sign, and arrange one PDF here. | 7 | Pass |
| Image alt | Illustration of a paper form passing through a compact charcoal document console with orange controls | 15 | Pass; describes purpose without embedded text |
| Section label | How to fill and export a PDF | 7 | Pass |
| H2 | Fill, sign, arrange, and export one PDF. | 7 | Pass |
| H3 | Open a sample PDF | 4 | Pass |
| Step copy | Start with a completed two-page intake PDF, or open your own PDF. | 12 | Pass |
| H3 | Edit fields and pages | 4 | Pass |
| Step copy | Fill standard fields, add new fields, sign, move, rotate, or remove pages. | 12 | Pass; registered capabilities |
| H3 | Download the finished PDF | 4 | Pass |
| Step copy | Keep fields editable or make them permanent before downloading. | 9 | Pass; `export-modes` |
| Section label | PDF privacy and storage | 4 | Pass |
| H2 | Your PDF work stays on this device. | 7 | Pass; `local-only` |
| Privacy copy | After the first visit, Field Desk can reopen offline. | 9 | Pass; `offline-reload` |
| Privacy copy | Opened PDFs are cleared when you reload or close the tab. | 11 | Pass; `no-document-persistence` |
| Fact label/value | PDF upload · None | 3 | Pass; `local-only` |
| Fact label/value | Saved document · None | 3 | Pass; `no-document-persistence` |
| Fact label/value | Account · None | 2 | Pass; `no-account` |
| Footer one-line description | Field Desk · PDF editing that stays on this device | 9 | Pass; `local-only` |
| Footer link | Privacy | 1 | Pass |
| Footer link | Terms | 1 | Pass |
| Footer provenance/version | Built by Param Factory · v1.0.2 | 5 | Pass |

### README

| Location | Copy | Words | Result |
| --- | --- | ---: | --- |
| H1 | Field Desk | 2 | Pass |
| Introduction | Fill and sign PDFs on your device. | 7 | Pass |
| Introduction | Field Desk is for people and small offices handling sensitive forms. | 11 | Pass |
| Introduction | Open a PDF and fill its standard fields. | 8 | Pass |
| Introduction | Add text, checkboxes, dates, or signature marks. | 7 | Pass |
| Introduction | Arrange pages, then download the result. | 6 | Pass |
| Demo | Open the isolated sample PDF at `/demo` or `/?demo=1`. | 9 | Pass |
| Demo | Resetting or leaving the demo discards every sample edit. | 9 | Pass; `demo-isolation` |
| H2 | Tested behavior | 2 | Pass |
| Claims note | The visitor-facing claims and their executable browser tests are listed in `.factory/claims.json`. | 12 | Pass; developer context |
| Tested behavior | PDF work stays on this device, with no PDF upload. | 10 | Pass; `local-only` |
| Tested behavior | The isolated sample saves nothing and resets on demand or exit. | 11 | Pass; `demo-isolation` |
| Tested behavior | Field Desk and its sample PDF reopen offline after the first visit. | 12 | Pass; `offline-reload` |
| Tested behavior | Files over 175 MB are rejected. | 6 | Pass; `max-file-size` |
| Tested behavior | Standard text, choice, and checkbox fields keep their edited values. | 10 | Pass; `standard-form-export` |
| Tested behavior | New text, checkbox, and date fields download as editable controls. | 10 | Pass; `add-fields` |
| Tested behavior | Drawn and typed signatures export as visual marks, not verified digital signatures. | 12 | Pass; `signature-mark` |
| Tested behavior | Pages can move, rotate, be removed, and be restored before download. | 11 | Pass; `page-actions` |
| Tested behavior | Downloads can keep fields editable or make them permanent. | 9 | Pass; `export-modes` |
| Tested behavior | Opened PDFs are cleared when the tab reloads or closes. | 10 | Pass; `no-document-persistence` |
| Tested behavior | No account is required. | 4 | Pass; `no-account` |
| Tested behavior | Field Desk is free to use. | 6 | Pass; `free-use` |
| Limit | Field Desk does not read scanned text. | 7 | Pass; `no-ocr` |
| Limit | It does not edit text already printed on a PDF page. | 11 | Pass; `no-page-text-edit` |
| Limit | Field Desk rejects dynamic XFA forms because it cannot edit their fields. | 12 | Pass; required format name and `reject-xfa` |
| H2 | Develop and verify | 3 | Pass |
| Requirement | Requires Node.js 20+. | 3 | Pass |
| Test instruction | Run every registered claim test from a clean state: | 9 | Pass |
| Build note | The production build is `npm run build`. | 7 | Pass |
| Build note | It writes `dist/index.html` for Azure Static Web Apps. | 8 | Pass; developer context |
| H2 | Deploy | 1 | Pass |
| Deploy note | Deploy `dist/` to Azure Static Web Apps. | 7 | Pass; developer context |
| Deploy note | The included configuration supplies route rewrites, the designed 404, caching, and security headers. | 13 | Pass; developer context |
| H2 | Project notes | 2 | Pass |
| Link label | Product scope | 2 | Pass |
| Link label | Visual system and asset provenance | 5 | Pass |
| Link label | Demo details | 2 | Pass |
| Link label | Release handoff | 2 | Pass |
| License | Licensed under the MIT License. | 5 | Pass |
| License | See LICENSE. | 2 | Pass |

### Terminology check

| Concept | Term used | Result |
| --- | --- | --- |
| Local processing | on this device | Consistent |
| Demo asset | sample PDF | Consistent; the prescribed primary action retains “sample data” |
| Signature limitation | visual signature mark; verified digital signature | Consistent except F-3-1 |
| Permanent export | make fields permanent | Consistent |
| Audience | people and small offices handling sensitive forms | Consistent |

## Demo and sandbox

The one-click demo passes its core behavior:

- **Try it with sample data** opens `/demo` directly into the editor.
- The first demo screen already shows a two-page Harbor Street Studio intake
  with `Maya Chen`, `Spring window display`, a realistic email address, a
  selected project type, approval checkbox, sample signature, and page tools.
- The banner remains visible and says **“Demo — sample data, nothing is
  saved”**, with **Reset demo** and **Start for real**.
- Reset restores `Maya Chen`. Leaving demo mode clears the sample.
- Real `localStorage`, `sessionStorage`, and IndexedDB sentinels survived demo
  entry, edit, reset, exit, and history navigation. No cookie was created.
- The cache contained only the shell and same-origin versioned app assets in
  this manual run. No sample or opened PDF was stored. This observation does
  not repair the registry gap in F-3-2.
- The intercepted edit/export flow made only same-origin GET requests. After
  the service worker readiness signal, an offline reload reopened the sample
  editor and showed **You are offline.**

## Claims

Each manifest command was run separately from the clean clone
`/tmp/local-pdf-review3-7I0HrX` at the exact candidate commit.

| Claim ID | Result | Observable check |
| --- | --- | --- |
| `demo-isolation` | PASS | reset/exit/history separation and real sentinels |
| `local-only` | PASS | edit/export allowed same-origin GETs only |
| `offline-reload` | PASS | controlled cache and offline sample reload |
| `pdf-files-only` | PASS | non-PDF rejection and recovery message |
| `max-file-size` | PASS | observed 176 MB file rejected before parsing |
| `standard-form-export` | PASS | text, dropdown, and checkbox values in export |
| `add-fields` | PASS | new text, checkbox, and date AcroForm controls |
| `signature-mark` | PASS | typed/drawn marks and no digital-signature field |
| `page-actions` | PASS | order, rotation, remove, undo, exported geometry |
| `export-modes` | PASS | editable fields retained; permanent fields removed |
| `no-document-persistence` | PASS | real PDF absent after reload and tab close |
| `no-account` | PASS | download without auth UI or auth request |
| `free-use` | PASS | download without payment UI or billing request |
| `no-ocr` | PASS | scanned pixels create no inferred text field |
| `no-page-text-edit` | PASS | printed text remains static; only add-field tool exists |
| `reject-xfa` | PASS | dynamic XFA produces the stated rejection |

There is no failing registered test and no untested registered claim. F-3-1
and F-3-2 concern claims missing from the registry.

## Earlier-finding verification

| Earlier finding | Live and code result |
| --- | --- |
| R1-B1 — no one-click demo/sandbox | Fixed: direct `/demo`, realistic sample, banner, reset, exit, and memory-only state verified. |
| R1-B2 — no claim registry/tests | Fixed for the 16 registered statements; F-3-1 and F-3-2 are remaining coverage gaps. |
| R1-B3 — unclear first screen/audience | Fixed on mobile and desktop before scrolling. |
| R1-B4 — unknown routes showed Home | Fixed: unknown route returns HTTP 404 and the designed recovery page. |
| R1-M1 — route metadata/focus incomplete | Fixed: unique titles, descriptions, canonicals, OG/Twitter tags, history focus, and live announcement verified. |
| R1-M2 — no preview/how-it-works sequence | Fixed: the demo is the live product and Home has a concrete three-step sequence. |
| R1-m1 — routes absent from header | Fixed: sample, Privacy, and Terms are consistent across routes. |
| R1 copy flags | Fixed on current Home/README; the complete current audit is above. |
| R2-B1 — offline sample failed | Fixed: clean local and live offline claim runs passed. |
| R2-M1 — unlisted limitations/privacy claims | **Half-fixed:** README items were repaired, but the no-audit-trail statement remains in the live editor; see F-3-1. |
| R2-m1 — inconsistent sample wording | Fixed: “Open sample PDF” is consistent outside the prescribed primary invitation. |
| R2-m2 — meaningless eyebrow | Fixed: the eyebrow now explains that the PDF editor stays on the device. |
| R2-C1 — vague privacy heading | Fixed: **PDF privacy and storage**. |
| R2-C2 — README heading jargon | Fixed: **Tested behavior**. |
| R2-C3 — footer wording/version | Fixed: plain one-line description and v1.0.2 appear on every route. |

## Structure, accessibility, and delivery

- `/`, `/demo`, `/?demo=1`, `/privacy`, and `/terms` return 200. An unknown
  route returns 404 with the Field Desk recovery design.
- Every route has one `h1`, one `main`, the common header/footer, Privacy and
  Terms links, and route-specific title, description, canonical, and OG/Twitter
  title. Home’s title is 51 characters and follows the required pattern.
- The 1200 × 630 social card, favicon, 180 × 180 Apple icon, `robots.txt`, and
  four-route sitemap all return 200.
- All discovered internal links resolve. Back navigation restores the prior
  route and focuses its `h1`; the polite live region announces the route.
- Axe reports zero violations, not only zero serious/critical violations, on
  Home at both target sizes. The configured route scans report no
  serious/critical violations. Focus, keyboard field placement, touch targets,
  reduced motion, labels, alt text, and 390 px overflow checks pass.
- The factory URL verifier reports HTTPS 200, title, `lang=en`, one `h1`, one
  `main`, no missing alt text, no unlabeled buttons, and no console errors.
- The visual identity is recognizably product-specific: paper/charcoal/orange/
  teal instrument controls, hard paper shadows, generated console art, and
  compact mechanical labels. It is not a generic centered-gradient SaaS page.
- Initial built JavaScript is 44.18 KB raw / 13.84 KB gzip. PDF engines are
  lazy-loaded. The production build emits `dist/index.html`.

## Missed leverage

No missing feature is filed. The brief’s obvious complete workflow—open,
fill existing fields, add fields, add a visual signature, arrange pages, and
download editable or permanent output—is present. OCR and existing-page-text
editing are explicit exclusions. Adding networked AI or sync would weaken the
local privacy job and is not implied by the brief.

## Verification record

- `npm ci`: passed; 70 packages installed; zero vulnerabilities.
- `npm test`: passed; 9 tests.
- `npm run build`: passed; `dist/index.html` produced.
- All 16 commands from `.factory/claims.json`: passed independently.
- Clean local `npm run test:e2e`: 22 passed, 18 intentional project skips.
- Live `PLAYWRIGHT_BASE_URL=... npm run test:e2e`: 22 passed, 18 intentional
  project skips.
- `npm audit --omit=dev`: passed; zero vulnerabilities.
- `/opt/fleet/lib/verify-url.sh`: passed after its output directory was created.

## What would make this perfect

Remove the two unregistered claim fragments or register and test them exactly.
Then rerun every manifest command and the live route/demo checks. With no other
finding observed, that would leave zero findings and permit a PASS.
