# Adversarial first-read review 1 — Field Desk

**URL checked:** https://local-pdf-forms-signer.sociobot.in  
**Date:** 2026-08-28  
**Verdict: FAIL**

The product has a distinctive, non-template visual identity and the basic editor works, but it fails the required cold-start demo, claims-verification, first-screen, and routing checks. There are more than three minor findings and four blocking findings.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900. The browser was at scroll position zero before this assessment.

- **What it does:** I could infer that it fills, signs, and rearranges PDFs from the body copy. The headline alone, **“Paperwork, under your control.”**, does not state the job.
- **For whom:** I could not identify a user group. Neither first screen names an individual, office worker, or anyone handling sensitive PDFs. This is a **BLOCKING** failure of the first-screen test.
- **What to click first:** **“Open a PDF”** is visible, but it requires my own document. There is no try-with-sample path.

The mobile screen is legible and uses a clearly product-specific mid-century document-console treatment. It is not a generic SaaS template. No console errors occurred during either cold load.

## Findings, ordered by severity

### BLOCKING — no one-click demo or demo sandbox

**Quote/evidence:** The only primary action is **“Open a PDF.”** Direct fresh visits to both `/demo` and `/?demo=1` returned the ordinary empty landing page. Neither contained **“Demo — sample data, nothing is saved”**, **“Reset demo”**, or **“Start for real.”** There is no `.factory/demo.md`.

**Why this loses or misleads a first-time visitor:** A visitor without a disposable PDF cannot see the product work in 30 seconds. The requested demo contract cannot be checked: there is no realistic sample document, no visible isolation notice, no reset, and no way to confirm real data is untouched.

**Concrete fix:** Put **“Try it with sample data”** beside **“Open your PDF.”** It must open `/demo` (or `?demo=1`) directly into an editable, realistic two-page form with completed fields, a signature, and reordered pages. Persist only under a `demo:` storage namespace. Keep a persistent banner reading **“Demo — sample data, nothing is saved”** with **“Reset demo”** and **“Start for real.”** Add `.factory/demo.md` documenting the URL, sample, reset behavior, and namespace; add a Playwright test proving demo actions do not touch real storage.

### BLOCKING — claims have no registry or executable claim tests

**Quote/evidence:** `.factory/claims.json` is absent. `rg '@claim:'` found no tagged claim tests. Consequently there were zero listed claim commands to run from the clean clone, rather than a test for each visitor-facing promise.

**Why this loses or misleads a first-time visitor:** The landing page and README ask visitors to rely on privacy, offline, capability, retention, and signature-limit statements, but none is tied to a repeatable observable test. A passing general unit suite cannot prove those promises in the required fresh demo sandbox.

**Unlisted claim-like copy (all require a `claims.json` entry and tagged test, or removal):**

| Location | Claim-like copy |
| --- | --- |
| Landing header | “Stays on this device” |
| Landing lead | “Your PDF never leaves this browser tab.” |
| Landing limit | “PDF files only · up to 175 MB · large scans depend on device memory” |
| Landing capabilities | “Complete existing form fields or place new text, checkbox, and date fields.” |
| Landing capabilities | “Draw with a pointer or type a signature. It is a mark, not a qualified e-signature.” |
| Landing capabilities | “Move, rotate, or remove pages. Undo a deletion before export.” |
| Landing capabilities | “Keep fields editable or flatten them into a clean, portable result.” |
| Landing privacy | “No upload can happen.” |
| Landing privacy | “There is no server endpoint, account, cloud bucket, analytics script, or hidden transfer. After first load, the app works offline.” |
| Landing facts/footer | “File bytes sent 0”; “Retention None”; “Account Never”; “no uploads, accounts, or tracking” |
| README opening/capabilities | “browser-local PDF form builder, filler, signer, and page editor”; all five listed PDF operations |
| README privacy | “PDF bytes never leave the browser tab.”; “There is no backend, upload endpoint, account, analytics script, cookie, or third-party runtime dependency.”; “it does not store opened documents.” |
| README limits | “Drawn and typed signatures are visual marks…”; “does not provide OCR…”; “Very large scanned PDFs are limited by browser memory.” |

**Concrete fix:** Create `.factory/claims.json` with one ID per reliance claim and exactly one `@claim:<id>` test per ID. At minimum cover: demo isolation/reset, local-only document flow (intercept every request during open/edit/export), offline reload after first visit, 175 MB rejection, AcroForm fill/export, new fields, signature wording/behavior, page operations/undo, editable and flattened exports, and no persistence after reload. Run every command from a clean clone in the handoff. Remove claims that cannot be exercised.

### BLOCKING — the first screen is not a plain job and does not name its user

**Quote:** **“Paperwork, under your control.”** The only explanation is **“Fill forms. Add fields. Sign. Reorder pages. Your PDF never leaves this browser tab.”**

**Why this loses a first-time visitor:** “Paperwork” and “under your control” describe a feeling, not the job. The screen never says who should use it. The product purpose is recoverable only by assembling five short phrases, and the first action demands a personal file before the visitor can verify it.

**Concrete fix:** Replace the headline with **“Fill and sign PDFs on your device.”** Replace the lead with **“For people and small offices handling sensitive forms, add fields, sign, and arrange pages without uploading a PDF.”** Keep the sample action first, with the adjacent outcome **“Opens a completed sample form you can edit.”**

### BLOCKING — unknown routes render the landing page instead of a designed 404

**Quote/evidence:** A direct visit to `/not-a-real-route` returned HTTP 200 and the landing `<h1>` **“Paperwork, under your control.”** It did not expose a 404 page. `/demo` similarly returned the landing page rather than a demo route.

**Why this loses or misleads a first-time visitor:** A mistaken or shared URL silently turns into a different page. The address bar says one place while the content says another, so users cannot recover confidently. This is broken routing under the site-structure requirement.

**Concrete fix:** Recognize `/demo`, `/privacy`, and `/terms` explicitly, and render a designed 404 for every other route with a clear **“Return to Field Desk”** link. Set the response/fallback policy so unknown routes retain the 404 UI. Add direct-load and back-button tests for each route and the 404.

### Major — route titles, sharing metadata, canonical URL, and route-change focus are incomplete

**Quote/evidence:** `/privacy` displays **“Privacy, plainly.”** and `/terms` displays **“Terms of use.”**, but both retain the landing title **“Field Desk — private PDF forms and signing.”** `link[rel=canonical]`, Open Graph metadata, Twitter metadata, and an Apple touch icon are absent on the live document. After in-app navigation to Privacy, `document.activeElement` was `<body>` and the polite live region was empty.

**Why this matters:** Browser history, bookmarks, assistive technology, and shared links all describe the wrong page. Keyboard and screen-reader users are left at an undefined focus position after a route transition.

**Concrete fix:** Use **“Privacy — Field Desk”**, **“Terms — Field Desk”**, **“Demo — Field Desk”**, and **“Page not found — Field Desk”**. Add canonical, OG, Twitter, and 1200 × 630 product-art metadata plus an Apple touch icon. On every in-app route change, move focus to the new `<h1>` and announce the page name through a polite live region.

### Major — the landing information structure omits the promised sample path and a plain “How it works” sequence

**Quote:** **“FOUR CONTROLS. ONE FILE.”** and **“The missing middle between Preview and Acrobat.”**

**Why this loses a first-time visitor:** The page jumps from an empty uploader to feature labels. It does not show the actual interface in use or give a three-step outcome sequence. “The missing middle” assumes a Mac PDF viewer and Adobe Acrobat context, and does not explain a user benefit.

**Concrete fix:** After the first screen, show the live sample editor and a section titled **“How to fill and export a PDF”** with: **“Open a sample form,” “Edit fields and pages,” “Download the finished PDF.”** Replace the quoted heading with **“Fill, sign, arrange, and export one PDF.”**

### Minor — header navigation does not expose the required routes

**Quote/evidence:** The header contains the wordmark and **“Stays on this device”** only. Privacy and Terms are reachable only after scrolling to the footer; Demo has no link.

**Why this matters:** Visitors cannot navigate to the privacy explanation or a demo from the persistent site control area.

**Concrete fix:** Add an accessible header nav with **“Try sample PDF”**, **“Privacy”**, and **“Terms”** (the wordmark remains Home). Keep it consistent on legal, demo, and 404 routes.

## Copy audit

Word counts treat hyphenated or slash-joined terms as one word. This inventory covers visible landing and README sentence-level copy, headings, labels, and buttons; URLs, code blocks, and simple nav labels are excluded. No audited sentence exceeds 22 words on the landing page. The README opening sentence exceeds the hard cap.

### Landing page

| Copy | Words | Result / proposed rewrite where flagged |
| --- | ---: | --- |
| Stays on this device | 4 | Unlisted privacy claim; test it. |
| Local instrument 01 | 3 | Flag: jargon/out of context. Use “Private PDF editor.” |
| PDF workshop | 2 | Flag: metaphor. Use “Edit a PDF on this device.” |
| Paperwork, under your control. | 4 | Flag: does not name job or user. Use “Fill and sign PDFs on your device.” |
| Fill forms. | 2 | Capability claim; list and test. |
| Add fields. | 2 | Capability claim; list and test. |
| Sign. | 1 | Capability claim; list and test. |
| Reorder pages. | 2 | Capability claim; list and test. |
| Your PDF never leaves this browser tab. | 7 | Unlisted privacy claim; list and intercept-test. |
| Open a PDF | 3 | Result-naming verb passes, but add “Try it with sample data.” |
| or drop it here | 4 | Clear secondary input instruction. |
| PDF files only · up to 175 MB · large scans depend on device memory | 13 | Limit claim; list and test rejection/behavior. |
| One private workbench for the whole document. | 7 | Flag: metaphor. Use “Fill, sign, and arrange one PDF here.” |
| Four controls. | 2 | Flag: vague heading fragment. Use the proposed how-it-works heading. |
| One file. | 2 | Flag: vague heading fragment. Use the proposed how-it-works heading. |
| The missing middle between Preview and Acrobat. | 7 | Flag: unexplained product references. Use “Fill, sign, and rearrange PDFs without uploading them.” |
| Prepare & fill | 2 | Clear enough; ampersand can become “Prepare and fill.” |
| Complete existing form fields or place new text, checkbox, and date fields. | 11 | Capability claim; list and test. |
| Mark & sign | 2 | Flag: “mark” is ambiguous. Use “Add a signature.” |
| Draw with a pointer or type a signature. | 8 | Capability claim; list and test. |
| It is a mark, not a qualified e-signature. | 8 | Flag: legal jargon. Use “This adds a visual signature mark, not a verified digital signature.” |
| Arrange pages | 2 | Clear heading. |
| Move, rotate, or remove pages. | 5 | Capability claim; list and test. |
| Undo a deletion before export. | 5 | Capability claim; list and test. |
| Export locally | 2 | Clear heading; “Download PDF” is more concrete. |
| Keep fields editable or flatten them into a clean, portable result. | 11 | Flag: “flatten” is jargon and a capability claim. Use “Keep fields editable or make them permanent before downloading.” |
| Privacy circuit | 2 | Flag: jargon. Use “How your PDF stays private.” |
| No upload can happen. | 4 | Absolute unlisted privacy claim; list and intercept-test. |
| There is no server endpoint, account, cloud bucket, analytics script, or hidden transfer. | 13 | Unlisted privacy claim; list and intercept-test. |
| After first load, the app works offline. | 7 | Unlisted offline claim; list and offline-reload-test. |
| File bytes sent | 3 | Unlisted privacy claim; pair with an observable test. |
| Retention | 1 | Unlisted retention claim; pair with an observable test. |
| None | 1 | Unlisted retention claim; pair with an observable test. |
| Account | 1 | Unlisted account claim; pair with an observable test. |
| Never | 1 | Unlisted account claim; pair with an observable test. |
| Field Desk · no uploads, accounts, or tracking | 7 | Unlisted privacy claim; list and test. |
| Original AI-assisted illustration | 3 | Provenance label; no visitor action needed. |

### README

| Copy | Words | Result / proposed rewrite where flagged |
| --- | ---: | --- |
| Field Desk is a browser-local PDF form builder, filler, signer, and page editor for individuals and small offices that cannot upload sensitive paperwork to a converter. | 26 | **Flag: over 22 words and overloaded.** Use “Field Desk lets people and small offices fill, sign, and arrange sensitive PDFs without uploading them.” |
| It combines the common jobs that usually require several tools: | 9 | Flag: vague comparative. Use “Use one local tool to fill, sign, add fields, and arrange PDF pages.” |
| fill existing AcroForm text, checkbox, dropdown, and radio fields; | 8 | Flag: “AcroForm” unexplained. Use “fill standard PDF form fields, including text, checkboxes, lists, and choices;” |
| place movable/resizable text, checkbox, date, and signature fields; | 8 | Flag: slash jargon. Use “add and resize text, checkbox, date, and signature fields;” |
| draw or type a signature; | 5 | Capability claim; list and test. |
| reorder, rotate, remove, and restore pages; and | 6 | Capability claim; list and test. |
| export new fields as editable controls or flatten them for portability. | 11 | Flag: “flatten” jargon. Use “download fields as editable controls or permanent page content.” |
| PDF bytes never leave the browser tab. | 7 | Unlisted privacy claim; list and test. |
| There is no backend, upload endpoint, account, analytics script, cookie, or third-party runtime dependency. | 13 | Unlisted privacy claim; list and test. |
| A small service worker caches only the public app and its PDF libraries for offline use; it does not store opened documents. | 20 | Flag: implementation jargon and privacy claim. Use “After the first visit, the app can open offline. It does not save opened PDFs.” |
| Drawn and typed signatures are visual marks, not certificate-backed or qualified electronic signatures. | 13 | Flag: legal jargon. Use the landing’s proposed visual-mark wording consistently. |
| Field Desk deliberately does not provide OCR, edit existing page text, support dynamic XFA fields, or create a legal signing audit trail. | 22 | Flag: “XFA” unexplained. Use “It cannot read scanned text, edit existing page text, handle dynamic XFA forms, or create a signing record.” |
| Very large scanned PDFs are limited by browser memory. | 9 | Limit claim; list and test the stated file-size behavior. |
| Requires Node.js 20+. | 3 | Clear developer requirement. |
| The production build command is exactly npm run build; output is written to dist/ with dist/index.html at its root. | 19 | Clear developer instruction. |
| Browser tests include desktop and 390px-class mobile accessibility scans plus an end-to-end PDF export: | 14 | Flag: “390px-class” is internal wording. Use “Browser tests cover desktop, a 390 px mobile screen, accessibility, and PDF export:” |
| Deploy the contents of dist/ to a Standard-tier Azure Static Web App. | 11 | Flag: deployment-platform jargon; keep only if this is the supported deployment target. |
| The included public/staticwebapp.config.json supplies the SPA fallback, strict security headers, and .mjs MIME type. | 14 | Clear for implementers. |
| This product is static and has no container or registry deployment path. | 12 | Clear for implementers. |
| The researched product scope is in .factory/brief.json. | 7 | Clear internal reference. |
| The mid-century instrument-panel visual system and asset provenance are in .factory/design.md. | 11 | Clear internal reference. |
| Release verification and known limitations are in .factory/handoff.md. | 8 | Clear internal reference. |
| Licensed under the MIT License. | 5 | Clear. |
| See LICENSE. | 2 | Clear. |

### Terminology consistency

| Concept | Observed terms | Recommended single term |
| --- | --- | --- |
| Local processing | “browser-local”, “locally”, “this browser tab”, “this device” | “on this device” |
| Signature limitation | “mark”, “visual marks”, “qualified e-signature”, “qualified electronic signature”, “certificate-backed” | “visual signature mark, not a verified digital signature” |
| Permanent export | “flatten”, “flatten them”, “portable result” | “make fields permanent” (show “flatten” once in parentheses only if needed) |
| Target audience | README: “individuals and small offices”; landing: omitted | “people and small offices handling sensitive PDFs” |

## Verification evidence

- Fresh clean clone: `npm ci`, `npm test` (8 passed), and `npm run build` (passed; `dist/` created).
- Fresh clean clone: `npm run test:e2e` completed with 6 passed and 4 intentional viewport skips. This suite does not contain any `@claim:` test or demo test.
- Live desktop and 390 px cold loads: one `<h1>`, `<main>`, `lang="en"`, no console errors, no horizontal overflow at 390 px, and live Axe had zero violations.
- Live opening of a locally generated one-page PDF reached the editor. Request interception observed only same-origin application/PDF-library assets; `localStorage` and IndexedDB were empty after opening. This is a useful observation, not a substitute for the missing registered demo privacy claim test.
- Live offline reload after a successful online load retained the landing shell with HTTP 200 and no console error. This is a useful observation, not a substitute for the missing registered demo offline claim test.
- `robots.txt` and `sitemap.xml` are present. Crawled footer/home links (`/`, `/privacy`, `/terms`) returned 200. The favicon is present. Canonical, OG/Twitter metadata, Apple touch icon, designed 404, demo route, per-route titles, route-focus management, and header navigation are absent or failing as described above.

## Acceptance condition

Re-review only after the demo and isolation are implemented, all reliance claims are registered and pass from a fresh demo context, the first screen names the job and audience, and unknown routes render a designed 404. Then address metadata, navigation, focus, and the flagged copy before seeking PASS.
