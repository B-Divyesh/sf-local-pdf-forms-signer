# Perfection loop round 3

Source candidate: `a5e4d6149ec534d5dd40004ea8f284ad467bc226`
Review base: `964dbd1edc48b13e4f015718bbdd5bf1ee88076b`
Repair implementation: `c269e6bdeda5d305de5991e34be3ca5f1c7b75d4`
Live URL: https://local-pdf-forms-signer.sociobot.in

This map includes every finding in `review-1.md`, `review-2.md`, and `review-3.md`, including copy and minor findings. The supplied repository has no earlier `polish-1.md`; `polish-2.md` was read and independently rechecked.

| Finding ID | Change made or retained fix | Evidence |
| --- | --- | --- |
| R1-B1 — one-click demo/sandbox | Retained direct `/demo` and `?demo=1`, completed Harbor Street sample, banner, Reset demo, Start for real, and memory-only isolation. The claim now also asserts no local/session/IndexedDB/cookie writes. | `@claim:demo-isolation`; `.factory/evidence/polish-3/live/demo-mobile.png`; live full browser suite passed. |
| R1-B2 — claim registry/tests | Retained all 16 discrete claim IDs and one tagged behavioral test per ID. The cache-content promise is now registered and tested. | Clean clone ran all 16 manifest commands individually; registry one-to-one audit; live full browser suite passed. |
| R1-B3 — first-screen job/audience/sample path | Retained the plain job-first headline, named people and small offices, sample-first action, outcome sentence, and three facts. | `mobile first screen and demo remain usable without overflow`; `.factory/evidence/polish-3/live/first-screen-mobile.png`; live `/` check passed. |
| R1-B4 — unknown route rendered Home | Retained explicit routes and designed not-found screen with recovery link; Azure now returns the actual 404 status. | `routes set metadata, restore focus, and show a designed 404`; `.factory/evidence/polish-3/live/not-found-mobile.png`; live `HEAD /not-a-real-route` = 404. |
| R1-M1 — titles, metadata, canonical, route focus | Retained per-route titles/descriptions/canonicals/OG/Twitter image metadata and history focus/announcement. | `routes set metadata, restore focus, and show a designed 404`; live full browser suite and factory URL verifier passed. |
| R1-M2 — no live preview/plain sequence | Retained the completed sample editor as the product preview plus the concrete Open, Edit, Download sequence. | `@claim:demo-isolation`; `.factory/evidence/polish-3/live/demo-mobile.png`; live `/demo` passed. |
| R1-m1 — no header routes | Retained shared header with Home, Open sample PDF, Privacy, and Terms links on every route. | `public routes and legal links are accessible`; live full browser suite passed. |
| R1-copy — metaphor/jargon/copy-audit flags | Retained the plain wording revisions and re-audited landing, legal, README, dialog, demo guide, and catalog. | `.factory/copy-audit.md`; live first-screen screenshot; catalog is verb-first and 65 characters. |
| R2-B1 — offline sample did not reopen | Retained atomic precache and added an exact-manifest invariant: the service worker never runtime-caches a response. | `@claim:offline-reload`; `.factory/evidence/polish-3/live/demo-offline-mobile.png`; live offline reload passed. |
| R2-M1 — unlisted limitations/privacy claims | Retained registered tests for OCR, printed text, XFA, and visual signatures. Removed the remaining editor audit-trail wording instead of adding an unrelated promise. | `@claim:no-ocr`, `@claim:no-page-text-edit`, `@claim:reject-xfa`, `@claim:signature-mark`; live full browser suite passed. |
| R2-m1 — inconsistent sample wording | Retained “Open sample PDF” for navigation and the prescribed “Try it with sample data” primary invitation. | `mobile first screen and demo remain usable without overflow`; live screenshot. |
| R2-m2 — unexplained eyebrow | Retained “PDF editor that stays on your device.” | `mobile first screen and demo remain usable without overflow`; live first-screen screenshot. |
| R2-C1 — vague privacy heading | Retained “PDF privacy and storage.” | `routes set metadata, restore focus, and show a designed 404`; live `/privacy` screenshot. |
| R2-C2 — README technical jargon | Retained “Tested behavior” and the claim registry link. | `.factory/copy-audit.md`; clean-clone manifest run passed. |
| R2-C3 — footer wording/version | Updated the product version to v1.0.3 while retaining the plain device-local footer description. | Live `routes set metadata, restore focus, and show a designed 404`; factory URL verifier passed. |
| F-3-1 (R2-M1 regression) — unlisted no-audit-trail dialog claim | Replaced the dialog with “This adds a visual signature mark, not a verified digital signature.” It now exactly matches the registered signature claim. | `@claim:signature-mark` asserts the dialog copy and PDF behavior; `.factory/evidence/polish-3/live/signature-dialog-mobile.png`; live test passed. |
| F-3-2 — unlisted public-cache claim | Added the statement to `offline-reload`; its test opens a real PDF, exports it, compares every Cache Storage URL with the generated service-worker precache manifest, then reloads the sample offline. The worker no longer cache-writes runtime requests. | `@claim:offline-reload`; `.factory/evidence/polish-3/live/privacy-mobile.png`; live offline claim passed. |

## Delivery verification

- Implementation clean clone `/tmp/field-desk-polish3-FLMG5l` at `c269e6b`: `npm ci`, `npm test` (9 passed), `npm run build`, `npm run test:e2e` (22 passed, 18 intentional skips), and `npm audit --omit=dev` (0 vulnerabilities) passed. Final-claims clean clone `/tmp/field-desk-polish3-final-MkJUeo` at `3ee4f96`: `npm ci`, `npm test`, `npm run build`, and all 16 individual claim commands passed.
- Live: `PLAYWRIGHT_BASE_URL=https://local-pdf-forms-signer.sociobot.in npm run test:e2e` passed with 22 passed and 18 intentional skips. The run includes route metadata/focus/404, all claim flows, mobile layout, keyboard, and Axe serious/critical scans.
- Live URL verifier passed with no console errors. Live mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.1 s, CLS 0, TBT 0 ms.
- Azure Static Web Apps deployment `cc7d3c8f-4438-4390-9ba9-6af35fa48811` completed successfully. Cold custom-domain routes `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and static metadata assets returned 200; an unknown route returned 404.

No finding is deferred.
