# Perfection loop round 2

Source candidate: `a94221919e745af7b1cf5f5df490f2546f028a0d`  
Review base: `ed2db3536b3cc39fcf186d05ee0379453e14a14f`  
Repair implementation: `08998c92e3010dc310ff3b6732832c8256308e06`  
Live URL: https://local-pdf-forms-signer.sociobot.in

No earlier `.factory/polish-*.md` file existed in the repository or its reachable history. Finding IDs below identify every finding section and additional flagged copy item in `review-1.md` and `review-2.md`.

## Finding map

| Finding | Change made | Automated evidence | Screenshot | Cold live check |
| --- | --- | --- | --- | --- |
| R1-B1 — no one-click demo or sandbox | Added first-screen sample action, direct `/demo` and `?demo=1` entry, realistic completed two-page PDF, persistent banner, Reset demo, Start for real, and in-memory isolation. Crossing between real and demo modes now discards all document state. | `@claim:demo-isolation` | `evidence/polish-2/live/demo-mobile.png` | `/demo` and `/?demo=1` returned 200; reset, exit, history, and storage isolation passed live. |
| R1-B2 — no claim registry/tests | Expanded `.factory/claims.json` to 16 discrete reliance claims. Each ID has exactly one tagged behavioral test covering the observable result. | All 16 `npm run test:claims -- --grep @claim:<id>` commands passed independently from a clean clone and live. | `evidence/polish-2/live/demo-mobile.png` | Full live claim suite passed. |
| R1-B3 — first screen did not state job/audience | Replaced metaphor copy with “Fill and sign PDFs on your device,” named people and small offices handling sensitive forms, made the sample primary, stated its result, and added three tested facts. | `mobile first screen and demo remain usable without overflow` | `evidence/polish-2/live/first-screen-mobile.png` | Cold 390 × 844 load showed the headline, audience, both actions, outcome, and three facts without scrolling. |
| R1-B4 — unknown routes showed Home | Added explicit route rendering and a product-styled not-found screen. Azure `responseOverrides` now serves that UI with an actual 404 response. | `routes set metadata, restore focus, and show a designed 404` | `evidence/polish-2/live/not-found-mobile.png` | `/not-a-real-route` returned HTTP 404 with “Return to Field Desk.” |
| R1-M1 — titles, sharing metadata, canonical, focus | Added per-route titles/descriptions/canonicals, Open Graph and Twitter metadata, 1200 × 630 social art, Apple touch icon, heading focus, and polite route announcements. | `routes set metadata, restore focus, and show a designed 404` | `evidence/polish-2/live/verify-url/screenshot-desktop.png` | Home, Demo, Privacy, Terms, and 404 metadata/focus passed live. |
| R1-M2 — missing product preview and plain sequence | Demo opens directly into the real editor. Landing now uses “How to fill and export a PDF” with Open, Edit, and Download steps and concrete wording. | `@claim:demo-isolation`; `mobile first screen and demo remain usable without overflow` | `evidence/polish-2/live/demo-mobile.png` | Live sample opened into a completed, editable editor. |
| R1-m1 — routes absent from header | Added consistent Open sample PDF, Privacy, and Terms links to every route while retaining the home wordmark and skip link. | `public routes and legal links are accessible` | `evidence/polish-2/live/first-screen-mobile.png` | Every crawled header/footer link returned 200. |
| R2-B1 — offline sample failed | Build now generates an exact hashed precache manifest, installs it atomically, caches the lazy sample/PDF modules and worker, and matches cached Vite assets with `ignoreVary`. Readiness waits for a controlling service worker. | `@claim:offline-reload` passed independently in the clean clone and live; repeated local run passed three times | `evidence/polish-2/live/demo-offline-mobile.png` | Cold live context loaded `/demo`, went offline, reloaded, and restored the editable sample with the offline status visible. |
| R2-M1 — unlisted README limitations/privacy claims | Removed the architecture and signing-record assertions. Split and registered the remaining promises as `signature-mark`, `no-ocr`, `no-page-text-edit`, and `reject-xfa`; added generated-PDF behavioral checks and low-level XFA detection. | `@claim:signature-mark`; `@claim:no-ocr`; `@claim:no-page-text-edit`; `@claim:reject-xfa`; `PDF feature detection` unit tests | `evidence/polish-2/live/demo-mobile.png` | All four claim paths passed against production. |
| R2-m1 — inconsistent header sample wording | Standardized the header and instructions on “Open sample PDF” / “sample PDF”; kept the required primary invitation “Try it with sample data.” | `mobile first screen and demo remain usable without overflow` | `evidence/polish-2/live/first-screen-mobile.png` | Cold live header reads “Open sample PDF.” |
| R2-m2 — meaningless eyebrow | Replaced “Local tool 01” with “PDF editor that stays on your device.” | `mobile first screen and demo remain usable without overflow` | `evidence/polish-2/live/first-screen-mobile.png` | New explanatory eyebrow is visible on the live first screen. |
| R2-C1 — vague privacy heading | Replaced “Private document work” with “PDF privacy and storage.” | `routes set metadata, restore focus, and show a designed 404` | `evidence/polish-2/live/verify-url/screenshot-desktop.png` | Updated section is present on live Home. |
| R2-C2 — README heading jargon | Replaced “Verifiable behavior” with “Tested behavior” and mapped every statement to a claim ID. | Manifest/tag one-to-one audit; all 16 claim commands | `evidence/polish-2/live/demo-mobile.png` | Live behaviors match the documented tests. |
| R2-C3 — footer wording preference | Rewrote the footer to “PDF editing that stays on this device” and synchronized the displayed release to v1.0.2. | `@claim:local-only`; `public routes and legal links are accessible` | `evidence/polish-2/live/not-found-mobile.png` | Updated footer appears across every live route. |

## Additional acceptance repairs

- The file picker is activated by a real keyboard-operable button. The canvas accepts Enter or Space to place the selected field, and field/page controls retain 44 px targets on mobile.
- Close PDF and page-order controls remain available at 390 px instead of disappearing.
- Existing standard-field values survive page reordering in exports. Page order, dimensions, rotation, deletion, undo, editable export, and permanent export are inspected in downloaded PDFs.
- The demo is in-memory only: it reads no real document, writes no browser storage, and is discarded on reset, exit, route navigation, and history changes.
- The entry bundle fell from the reviewed 195.69 KB gzip to 13.84 KB gzip by loading the PDF engine and sample only when needed.

## Verification record

- Clean clone: `/tmp/field-desk-polish2-3Ipkhj`, commit `08998c92e3010dc310ff3b6732832c8256308e06`.
- `npm ci`: 70 packages installed, 0 vulnerabilities.
- `npm test`: 9 passed.
- `npm run build`: passed; `dist/index.html` present; initial JS 13.84 KB gzip; CSS 5.67 KB gzip.
- Every command in `.factory/claims.json`: 16 of 16 passed independently from the clean clone.
- `npm run test:e2e`: 22 passed; 18 intentional project/viewport skips.
- Live claim rerun: 16 of 16 passed.
- Live browser/accessibility rerun: 22 passed; 18 intentional project/viewport skips; Axe found no serious or critical violations.
- Factory URL verifier: 200, correct title/lang, one h1, main present, no missing alt text, no unlabeled buttons, no console errors.
- Live mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.1 s, CLS 0, total blocking time 100 ms.
- Live route status: `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, and `/social-card.svg` returned 200; unknown route returned 404.

Every review finding is resolved. No severity item is deferred.
