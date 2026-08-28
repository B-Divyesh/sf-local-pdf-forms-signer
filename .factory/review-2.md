# Adversarial first-read review 2 — Field Desk

**Verdict: FAIL**

This review used a fresh Chromium context against `https://local-pdf-forms-signer.sociobot.in` at 390 × 844 and 1440 × 950 on 2026-08-28, then a clean clone of `4898c4241bd777fc8a4b94f1953aacdffbef3d3a` in `/tmp/local-pdf-review-54IlCO`. The product is clear and tryable; it fails because the published offline promise cannot be completed from a clean browser and its registered claim test fails.

## First screen, before scrolling

**What it does:** I read this as a browser-local PDF editor that lets people fill, sign, add fields to, reorder, and download PDFs without uploading them.

**Who it is for:** I read “For people and small offices handling sensitive forms” as the intended audience.

**What to click first:** Click **“Try it with sample data”** to open a completed sample form, or **“Open your PDF”** to work on a real file.

This passed the cold-read check on both viewports. The headline, audience sentence, primary action, action outcome, and three facts are all visible at 390 px without scrolling. No blocking first-screen finding.

## Findings, in severity order

### BLOCKING — the advertised offline demo does not reopen offline

- **Quote:** “After the first visit, Field Desk can reopen offline.” The README repeats: “Field Desk works offline after the first visit.”
- **Why this misleads:** A visitor can reasonably rely on this when handling a sensitive form without a connection. In a fresh live browser context, I opened `/demo`, waited for the editor and service worker, disabled networking, then reloaded. The page returned to the landing view with the offline bar; `[data-editor-ready="true"]` never appeared. The visitor cannot reopen or edit the advertised sample offline.
- **Clean-clone evidence:** `npm run test:claims -- --grep @claim:offline-reload` failed twice. The asserted editor was absent after offline reload at `tests/app.spec.ts:87` (15-second timeout). Ten other registered claim commands passed.
- **Concrete fix:** Make `/demo` and every module, worker, and asset required to build the sample available from the service-worker cache before the offline test sets the context offline. Keep the existing `@claim:offline-reload` test, but do not publish this sentence until it passes from a fresh browser context. Re-run the test against the production build, not just a warm development session.

### MAJOR — README contains unlisted, user-relevant capability and privacy claims

- **Quote:** “A visual signature mark is not a verified digital signature. Field Desk cannot read scanned text, edit existing page text, handle dynamic XFA forms, or create a signing record.”
- **Quote:** “This static product has no backend.”
- **Why this misleads:** These are product and privacy boundaries that a visitor may use to decide whether to handle a document here. None has an ID in `.factory/claims.json`; the existing entries do not test OCR/text editing/XFA rejection/signing-record behavior, verified-signature behavior, or the asserted absence of a backend. The claims contract requires a registry entry and an observable sandbox test for each claim-like sentence.
- **Concrete fix:** Add separate entries and tests such as `no-ocr`, `no-page-text-edit`, `reject-xfa`, `visual-not-digital-signature`, `no-signing-record`, and (if retained) `no-backend`, or remove the unsupported sentences. For example, test that an XFA sample reports the stated unsupported-form error and that the UI exposes no signing-record output. Do not bundle several independent limitations into one untested sentence.

### MINOR — the header sample action uses an inconsistent, non-result verb

- **Quote:** “Try sample PDF” in the header; “Try it with sample data” in the primary action; “Open a sample form” later on the landing page.
- **Why a first-time visitor is slowed:** All three mean the same destination, but the product calls it a PDF, sample data, and a form. “Try” describes an attempt rather than the result of activating the control.
- **Concrete fix:** Change the header action to **“Open sample PDF”** and use “sample PDF” or “sample form” consistently wherever the destination is named. The primary first-screen action may remain **“Try it with sample data”** because it also states the no-setup invitation.

### MINOR — the eyebrow label does not explain the product

- **Quote:** “PRIVATE PDF EDITOR” and “LOCAL TOOL 01”.
- **Why a first-time visitor is slowed:** “Local tool 01” has no meaning out of context and adds a second, unexplained name immediately above the useful headline. It reads as internal instrument-panel decoration rather than product information.
- **Concrete fix:** Remove “LOCAL TOOL 01”; if an eyebrow is retained, use **“PDF editor that stays on your device”** or omit it entirely.

## Copy audit

Word counts below treat headings, buttons, labels, and sentence fragments as copy units so every visitor-visible landing string is accounted for. Commands and link destinations in code fences are excluded because they are not prose sentences. No landing or README prose unit exceeds 22 words.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Field Desk | 2 | pass |
| Try sample PDF | 3 | flag: inconsistent/non-result action; see finding |
| Privacy | 1 | pass |
| Terms | 1 | pass |
| Private PDF editor | 3 | flag: vague privacy label; see finding below |
| Local tool 01 | 3 | flag: context-free label; see finding |
| Fill and sign PDFs on your device. | 7 | pass |
| For people and small offices handling sensitive forms, add fields, sign, and arrange pages without uploading a PDF. | 17 | pass |
| Try it with sample data | 5 | pass: visible primary invitation |
| Open your PDF | 3 | pass: result-naming verb |
| Sample opens a completed form you can edit. | 8 | pass |
| No PDF uploads | 3 | registered by `local-only` |
| Sample edits reset | 3 | registered by `demo-isolation` |
| No account | 2 | registered by `no-account` |
| PDF files only. | 3 | pass: input limitation |
| Files over 175 MB are rejected. | 7 | registered by `max-file-size` |
| How to fill and export a PDF | 7 | pass |
| Fill, sign, arrange, and export one PDF. | 7 | pass |
| Open a sample form | 4 | terminology flag: use one sample name |
| Start with a completed two-page intake form, or open your own PDF. | 13 | pass |
| Edit fields and pages | 4 | pass |
| Fill standard fields, add new fields, sign, move, rotate, or remove pages. | 12 | registered by `add-fields`, `signature-mark`, and `page-actions` |
| Download the finished PDF | 4 | pass |
| Keep fields editable or make them permanent before downloading. | 9 | registered by `export-modes` |
| Private document work | 3 | flag: vague heading; rewrite as **“PDF privacy and storage”** |
| Your PDF work stays on this device. | 7 | registered by `local-only` |
| After the first visit, Field Desk can reopen offline. | 9 | registered but failing `offline-reload`; BLOCKING |
| Opened PDFs are cleared when you reload or close the tab. | 11 | registered by `no-document-persistence` |
| PDF upload / None | 3 | registered by `local-only` |
| Saved document / None | 3 | registered by `no-document-persistence` |
| Account / None | 2 | registered by `no-account` |
| Field Desk · private PDF editing on this device | 8 | pass; prefer “PDF editing that stays on this device” for plain wording |
| Privacy / Terms | 2 | pass |
| Built by Param Factory · v1.0.1 | 5 | pass |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Field Desk | 2 | pass |
| Fill and sign PDFs on your device. | 7 | registered by `local-only` |
| Field Desk is for people and small offices handling sensitive forms. | 11 | pass |
| Open a PDF, fill standard form fields, add text, checkbox, date, and signature fields, arrange pages, then download the result. | 19 | pass; capability clauses map to registered tests |
| Start the resettable sample at `/demo` or `/?demo=1`. | 8 | registered by `demo-isolation` |
| Verifiable behavior | 2 | flag: technical jargon; rewrite **“Tested behavior”** |
| The visitor-facing claims and their executable browser tests are listed in `.factory/claims.json`. | 10 | pass for developer documentation |
| PDF work stays on this device. | 7 | registered by `local-only` |
| The sample demo saves nothing and resets. | 7 | registered by `demo-isolation` |
| Field Desk works offline after the first visit. | 8 | registered but failing `offline-reload`; BLOCKING |
| Files over 175 MB are rejected. | 7 | registered by `max-file-size` |
| Standard PDF fields can be filled and downloaded. | 8 | registered by `standard-form-export` |
| New fields and visual signature marks can be added. | 9 | registered by `add-fields` and `signature-mark` |
| Pages can move, rotate, and be restored after removal. | 9 | registered by `page-actions` |
| Downloads can keep fields editable or make them permanent. | 9 | registered by `export-modes` |
| Opened documents do not remain after a reload. | 8 | registered by `no-document-persistence` |
| No account is required. | 4 | registered by `no-account` |
| A visual signature mark is not a verified digital signature. | 9 | unlisted claim; see MAJOR finding |
| Field Desk cannot read scanned text, edit existing page text, handle dynamic XFA forms, or create a signing record. | 18 | unlisted claims; see MAJOR finding |
| Develop and verify | 3 | pass |
| Requires Node.js 20+. | 3 | pass |
| Run every registered claim test from a clean state: | 9 | pass |
| The production build is `npm run build`. | 7 | pass |
| It writes `dist/index.html` for Azure Static Web Apps. | 9 | pass |
| Deploy | 1 | pass |
| Deploy `dist/` to Azure Static Web Apps. | 7 | pass |
| The included `public/staticwebapp.config.json` supplies the SPA fallback and security headers. | 8 | pass |
| This static product has no backend. | 6 | unlisted privacy/architecture claim; see MAJOR finding |
| Project notes | 2 | pass |
| Product scope | 2 | pass |
| Visual system and asset provenance | 5 | pass |
| Demo details | 2 | pass |
| Release handoff | 2 | pass |
| Licensed under the MIT License. | 5 | pass |
| See LICENSE. | 2 | pass |

No banned marketing adjectives (for example “seamless”, “powerful”, or “intuitive”) were found. The visual identity is clearly product-specific: the charcoal, paper, safety-orange, and teal instrument-panel treatment does not read as a generic SaaS template.

## Demo and sandbox check

The landing action opens `/demo` in one click. On first display at 390 px it shows a realistic, already-completed two-page Harbor Street Studio intake PDF with text fields, an approval check box, page thumbnails, edit tools, and export. The persistent banner says **“Demo — sample data, nothing is saved”** and exposes **Reset demo** and **Start for real**.

`/demo` and `/?demo=1` both entered demo mode. In the fresh context the only local-storage key was `demo:field-desk-session`; the `@claim:demo-isolation` test confirmed an independent `real:sentinel` key is unchanged, edits reset on reload, and Reset returns `Maya Chen`. `@claim:local-only` passed and observed only same-origin static requests during edit and export. The live offline exercise failed as documented above.

## Claim-test evidence from the clean clone

| Claim ID | Command result |
| --- | --- |
| `demo-isolation` | pass |
| `local-only` | pass |
| `offline-reload` | **FAIL** — sample editor absent after offline reload |
| `max-file-size` | pass |
| `standard-form-export` | pass |
| `add-fields` | pass |
| `signature-mark` | pass |
| `page-actions` | pass |
| `export-modes` | pass |
| `no-document-persistence` | pass |
| `no-account` | pass |

`npm test` passed (8 tests) and `npm run build` passed in the same clean clone. The build reported 195.69 KB gzip for the entry JavaScript and 5.66 KB gzip for CSS.

## Structure and accessibility checks

The following checks passed on the deployed site: one `h1` and one `main` on `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and an unknown route; route titles and descriptions; canonical URLs; `lang="en"`; OG/Twitter metadata; SVG favicon and Apple touch icon; `robots.txt`; sitemap routes; designed 404; skip link; shared header/footer; visible Privacy and Terms links; deep-link and back-button focus transfer to the new `h1`; and no browser console errors.

Playwright Axe scans found no serious or critical issues on those routes. All landing links and checked site assets returned HTTP 200 (`/`, `/demo`, `/privacy`, `/terms`, unknown route, robots, sitemap, favicon, Apple touch icon, and social card). The mobile screenshot showed no horizontal overflow and controls were reachable. These passes do not offset the offline claim failure.

## Required resolution for a PASS

1. Repair the offline sample workflow and obtain a passing clean-browser `@claim:offline-reload` result.
2. Register and test, or remove, every unlisted README limitation/privacy claim noted above.
3. Apply the two small terminology/label rewrites, then re-run the complete claim suite and the live offline exercise.

With one BLOCKING finding, the verdict remains **FAIL**.
