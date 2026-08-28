# Adversarial first-read review 4 — Field Desk

**URL checked:** https://local-pdf-forms-signer.sociobot.in  
**Date:** 2026-08-28  
**Verdict: PASS**

No findings remain. The review reran the cold-start, copy, demo, claim, history, routing, accessibility, and missed-leverage checks from scratch.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900, at scroll position zero. Neither context emitted a console error.

- **What it does:** Fill, sign, add fields to, rearrange, and download PDFs locally.
- **For whom:** “For people and small offices handling sensitive forms”.
- **What to click first:** “Try it with sample data”; the adjacent sentence says “Opens a completed sample PDF you can edit.”

The headline, “Fill and sign PDFs on your device.”, states the job in seven words. The 17-word audience sentence, visible action, outcome, and three plain facts are all present above the fold at 390 px. The mid-century document-console art direction is distinct and remains functional rather than decorative; it is not a generic SaaS layout.

## Copy audit

Counts treat hyphenated and slash-joined forms as one word. This includes visible headings, labels, actions, and sentences; README command blocks and link destinations are excluded. No unit exceeds 22 words, uses a banned marketing term, has inconsistent terminology, or uses a non-result-naming button.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Field Desk | 2 | Pass |
| Open sample PDF | 3 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Stays on this device | 4 | Pass; local-only claim |
| PDF editor that stays on your device | 7 | Pass |
| Fill and sign PDFs on your device. | 7 | Pass; job-first h1 |
| For people and small offices handling sensitive forms, add fields, sign, and arrange pages without uploading a PDF. | 17 | Pass; audience and outcome |
| Try it with sample data | 5 | Pass; primary action |
| Open your PDF | 3 | Pass; real-file action |
| Opens a completed sample PDF you can edit. | 8 | Pass; action outcome |
| No PDF uploads | 3 | Pass; local-only claim |
| Works offline after first visit | 5 | Pass; offline-reload claim |
| Free · no account | 3 | Pass; free-use and no-account claims |
| PDF files only. | 3 | Pass; pdf-files-only claim |
| Files over 175 MB are rejected. | 6 | Pass; max-file-size claim |
| Fill, sign, and arrange one PDF here. | 8 | Pass |
| How to fill and export a PDF | 7 | Pass |
| Fill, sign, arrange, and export one PDF. | 7 | Pass |
| Open a sample PDF | 4 | Pass |
| Start with a completed two-page intake PDF, or open your own PDF. | 12 | Pass |
| Edit fields and pages | 4 | Pass |
| Fill standard fields, add new fields, sign, move, rotate, or remove pages. | 12 | Pass; registered capability claims |
| Download the finished PDF | 4 | Pass |
| Keep fields editable or make them permanent before downloading. | 9 | Pass; export-modes claim |
| PDF privacy and storage | 4 | Pass |
| Your PDF work stays on this device. | 7 | Pass; local-only claim |
| After the first visit, Field Desk can reopen offline. | 9 | Pass; offline-reload claim |
| Opened PDFs are cleared when you reload or close the tab. | 11 | Pass; no-document-persistence claim |
| Field Desk · PDF editing that stays on this device | 9 | Pass; local-only claim |
| Built by Param Factory · v1.0.3 | 6 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Field Desk | 2 | Pass |
| Fill and sign PDFs on your device. | 7 | Pass |
| Field Desk is for people and small offices handling sensitive forms. | 10 | Pass |
| Open a PDF and fill its standard fields. | 9 | Pass; standard-form-export claim |
| Add text, checkboxes, dates, or signature marks. | 8 | Pass; add-fields and signature-mark claims |
| Arrange pages, then download the result. | 6 | Pass; page-actions and export claims |
| Open the isolated sample PDF at `/demo` or `/?demo=1`. | 9 | Pass; demo-isolation claim |
| Resetting or leaving the demo discards every sample edit. | 9 | Pass; demo-isolation claim |
| Tested behavior | 2 | Pass |
| The visitor-facing claims and their executable browser tests are listed in `.factory/claims.json`. | 10 | Pass |
| PDF work stays on this device, with no PDF upload. | 10 | Pass; local-only claim |
| The isolated sample saves nothing and resets on demand or exit. | 11 | Pass; demo-isolation claim |
| Field Desk and its sample PDF reopen offline after the first visit. | 12 | Pass; offline-reload claim |
| Files over 175 MB are rejected. | 6 | Pass; max-file-size claim |
| Standard text, choice, and checkbox fields keep their edited values. | 10 | Pass; standard-form-export claim |
| New text, checkbox, and date fields download as editable controls. | 10 | Pass; add-fields claim |
| Drawn and typed signatures export as visual marks, not verified digital signatures. | 12 | Pass; signature-mark claim |
| Pages can move, rotate, be removed, and be restored before download. | 11 | Pass; page-actions claim |
| Downloads can keep fields editable or make them permanent. | 9 | Pass; export-modes claim |
| Opened PDFs are cleared when the tab reloads or closes. | 10 | Pass; no-document-persistence claim |
| No account is required. | 4 | Pass; no-account claim |
| Field Desk is free to use. | 6 | Pass; free-use claim |
| Field Desk does not read scanned text. | 7 | Pass; no-ocr claim |
| It does not edit text already printed on a PDF page. | 11 | Pass; no-page-text-edit claim |
| Field Desk rejects dynamic XFA forms because it cannot edit their fields. | 12 | Pass; reject-xfa claim |
| Develop and verify | 3 | Pass |
| Requires Node.js 20+. | 3 | Pass |
| Run every registered claim test from a clean state: | 9 | Pass; developer instruction |
| The production build is `npm run build`. | 7 | Pass |
| It writes `dist/index.html` for Azure Static Web Apps. | 9 | Pass |
| Deploy | 1 | Pass |
| Deploy `dist/` to Azure Static Web Apps. | 7 | Pass |
| The included configuration supplies route rewrites, the designed 404, caching, and security headers. | 13 | Pass |
| Project notes | 2 | Pass |
| Licensed under the MIT License. | 5 | Pass |
| See LICENSE. | 2 | Pass |

## Demo and sandbox

The first-screen sample action enters `/demo` in one click. The first rendered screen is an active two-page `harbor-intake-sample.pdf` editor with completed fields, a checked approval box, a signature, page controls, and export controls—not a landing-page mock-up.

The persistent banner reads “Demo — sample data, nothing is saved”, identifies the completed two-page sample, and provides working **Reset demo** and **Start for real** controls. A fresh-context storage check while in demo mode found empty localStorage, sessionStorage, IndexedDB, and cookies. The `@claim:demo-isolation` test also verifies real sentinels survive, demo edits reset, and transitions discard the correct workspace.

The observed complete demo request list contained same-origin `GET` requests only: app files, artwork, the sample module, PDF modules, and worker. `@claim:local-only` exercises edit and download under interception. `@claim:offline-reload` verifies the exact public precache manifest, excludes a real opened PDF, then reloads the editable sample while offline.

## Claims and clean-clone evidence

Clean clone: `/tmp/local-pdf-forms-signer-review4-TslH5x` at `f6f9fe3096e4bfc473ac5cfe6029d77ffb09dffa`.

- `npm ci`: passed, 0 vulnerabilities reported.
- `npm test`: 9 passed.
- `npm run build`: passed; `dist/index.html` produced. Initial application JS is 13.82 KB gzip; PDF modules are lazy-loaded.
- `npm run test:e2e`: passed (22 passed; 18 expected project skips).
- Every manifest command passed individually: `demo-isolation`, `local-only`, `offline-reload`, `pdf-files-only`, `max-file-size`, `standard-form-export`, `add-fields`, `signature-mark`, `page-actions`, `export-modes`, `no-document-persistence`, `no-account`, `free-use`, `no-ocr`, `no-page-text-edit`, and `reject-xfa`.

The registry has exactly those 16 IDs and the test source has exactly one corresponding `@claim:<id>` tag per ID. The live landing page and README reliance statements are covered by those IDs; no unlisted claim was found.

## Earlier findings rechecked

| Earlier finding | Live and code confirmation |
| --- | --- |
| R1-B1 / R1-M2 | Direct demo, completed realistic sample, persistent isolation banner, reset, exit, and in-memory handling confirmed. |
| R1-B2 | 16-entry registry and one tagged behavioural test per entry confirmed; all commands passed. |
| R1-B3 | The mobile and desktop first screens state job, audience, sample action, outcome, and three facts before scrolling. |
| R1-B4 | A fresh direct `/not-a-real-route` request returns 404 and displays the styled recovery page. |
| R1-M1 | Per-route titles, descriptions, canonicals, OG/Twitter titles, favicon and Apple icon are present; route changes focus and announce the h1. |
| R1-m1 | Header and footer consistently expose Home, sample, Privacy, and Terms. |
| R1 copy | Current landing and README audit above confirms the wording repairs. |
| R2-B1 | Offline demo reload and public-cache-only invariant pass in the offline claim test. |
| R2-M1 / F-3-1 / F-3-2 | Signature wording now matches `signature-mark`; cache wording matches `offline-reload`; no unlisted limitation or cache claim remains. |
| R2-m1 / R2-m2 / R2-C1 / R2-C2 / R2-C3 | Sample wording, explanatory eyebrow, privacy heading, “Tested behavior”, and current v1.0.3 footer are confirmed. |

## Structure, accessibility, and routing

Direct live checks confirmed `/`, `/demo`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, social card, favicon, and Apple touch icon return 200. A fresh direct unknown route returns 404. The live route checks confirmed a single `main h1`, `lang="en"`, route-specific titles/descriptions/canonicals/OG/Twitter values, and the consistent header/footer. Crawled internal links—skip target, Home, Demo, Privacy, and Terms—returned 200. The test suite’s Axe checks report no serious or critical violations. The page has no load-console error, no third-party request, visible link and focus treatment, 44 px controls, and a reduced-motion rule.

## Missed leverage

No omission is indicated by the brief. Importing a PDF, editable/permanent export, existing-field filling, added fields, signing marks, and page operations are present. Cloud sync would contradict the stated local-only privacy model. OCR or AI extraction would contradict the explicitly honest OCR limitation and introduce document transmission; no decorative AI feature or embedded provider key is present.

## What would make this perfect

Nothing actionable remains under this review’s product contract. Preserve the exact claim-suite coverage and the no-third-party/local-only constraints when changing PDF capabilities or copy.
