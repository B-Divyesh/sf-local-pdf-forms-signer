# Review 6 — fill, sign, and arrange PDFs locally

**Verdict: PASS — 0 findings and 0 untested claims.**

- Reviewed: 2026-09-06 UTC
- Implementation candidate: `ef92586b63c8cf18d4ce58d86a044cb386db2470`
- Documentation revision: `aa4a838` (later `9e93893` is Graphify-only)
- Live URL: <https://local-pdf-forms-signer.sociobot.in>

The requested external `factory-evidence/local-pdf-forms-signer-verify-5/qa-report.md`
was not mounted in this worker. I read the complete committed
`.factory/verification-5.md` and reproduced the checks below from a fresh
candidate checkout. This is an evidence-location note, not a product finding.

## First screen before scrolling

Fresh empty desktop (1440 × 900) and phone (390 × 844) contexts opened at
`scrollY = 0`, without horizontal overflow or page/console error.

- Job: Fill and sign PDFs, add fields, arrange pages, and download the result on the device.
- Audience: People and small offices handling sensitive forms.
- First action: **Try it with sample data**. The adjacent text says it opens a completed sample PDF that can be edited.

The headline is **“Fill and sign PDFs on your device.”** Both sizes show the
audience line and these facts: **No PDF uploads**, **Works offline after first
visit**, and **Free · no account**.

## Demo and product exercise

The one-click action opens `/demo` into `harbor-intake-sample.pdf`, a completed
two-page Harbor Street Studio intake. At phone size it showed Maya Chen,
`maya@harborstreet.example`, Window display, and a checked approval field. The
persistent banner says **“Demo — sample data, nothing is saved”** and exposes
**Reset demo** and **Start for real**.

Changing `client_name` to “Changed in demo,” resetting, and waiting for the
sample to reopen restored “Maya Chen.” Starting for real removed the editor.
Real `localStorage` and `sessionStorage` sentinels stayed unchanged. The claim
suite also exercises editable and permanent downloads, typed/drawn marks,
field creation, page move/rotate/remove/undo, invalid files, XFA rejection,
and damaged-PDF recovery.

## Clean-checkout commands

Detached clean worktree: `/tmp/local-pdf-forms-signer-review-6` at the
implementation candidate.

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 70 packages, 0 vulnerabilities. |
| `npm test` | PASS; 9 tests in 2 files. |
| `npm run build` | PASS; `dist/index.html` produced. |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities. |
| `npm run test:e2e` | PASS; Playwright result status `passed`. |
| Every claim command | PASS separately; 16 of 16. |

Initial application JavaScript is 44.57 KB raw / 13.98 KB gzip. CSS is
21.92 KB raw / 5.70 KB gzip. PDF libraries and the worker are lazy-loaded.
Nineteen deployable files from the clean candidate build matched live bytes.
`staticwebapp.config.json` is a deployment configuration file and correctly is
not a public URL.

## Registered claims

Each command in `.factory/claims.json` ran separately and passed.

| Claim IDs | Result |
| --- | --- |
| `demo-isolation`, `local-only`, `offline-reload`, `pdf-files-only` | PASS |
| `max-file-size`, `standard-form-export`, `add-fields`, `signature-mark` | PASS |
| `page-actions`, `export-modes`, `no-document-persistence`, `no-account` | PASS |
| `free-use`, `no-ocr`, `no-page-text-edit`, `reject-xfa` | PASS |

The registry/tag audit is complete: public reliance statements in landing,
legal copy, README, demo guide, and copy audit map to observable tests. No
missing, false, incomplete, or untested claim was found.

## Accessibility, routes, privacy, and offline use

`/opt/fleet/lib/verify-url.sh` passed on live home: HTTP 200, 752 ms load,
correct title/language, one h1, main landmark, complete image alternatives,
labelled buttons, and no error.

The standalone Axe CLI could not start because this container has no system
Chrome. The installed Playwright browser and `@axe-core/playwright` found zero
violations on `/`, `/demo`, `/privacy`, `/terms`, and the designed unknown-route
page at desktop and phone sizes. Reduced motion computed `scroll-behavior: auto`;
no checked route overflowed.

`/`, `/demo`, `/privacy`, and `/terms` returned HTTP 200 with route-specific
titles. `/not-a-real-route` deliberately returned HTTP 404 and rendered the
designed **Page not found** recovery screen. Chromium records the expected
failed-resource 404 for that direct request; it is not a page defect. All live
internal links returned 200. Live headers retain same-origin CSP, HSTS,
`nosniff`, no-referrer, and restrictive permissions policy.

The local-only/offline tests observe same-origin GET requests only,
service-worker cache contents limited to generated public files, and an
editable sample reopening offline. This is static web software; backend tenant,
restart, health, and 429 checks do not apply.

## Earlier findings and current disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1: demo, claims, first screen, 404, metadata/focus, sample path, header routes, copy | Fixed. Fresh screen, demo, route, link, copy-audit, and claim checks pass. |
| Review 2: offline demo, unlisted limits, sample wording, landing label | Fixed. Exact-cache offline reload and the complete claim suite pass. |
| Initial verification: E2E gate and CSP placement errors | Fixed. Configured E2E passes and checked workflows have no error. |
| Review 3: unlisted signature and cache statements | Fixed. Both statements are registered and tested. |
| Verification 3: editable export and parallel E2E | Fixed. `standard-form-export` and configured E2E pass. |
| Verification 4 and Review 4 zero-finding conclusions | Sustained by fresh checks. |
| Review 5 F5-1–F5-4: targets, focus contrast, tab keys, decorative labels | Fixed. Current suite and live phone/Axe checks pass. |

## Findings

| Severity | Count |
| --- | ---: |
| Blocking / P0 | 0 |
| Major / P1 | 0 |
| Moderate / P2 | 0 |
| Minor / P3 | 0 |
| Untested claims | 0 |

**Final verdict: PASS.**
