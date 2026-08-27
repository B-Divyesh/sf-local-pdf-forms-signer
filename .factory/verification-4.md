# Independent verification 4 — PASS

**Verified:** 2026-08-27 UTC<br>
**Candidate:** `e50fc66c89faa79ec21d8aacd65578742941f384` (`factory: repair local-pdf-forms-signer-repair-3`)<br>
**Live URL:** <https://local-pdf-forms-signer.sociobot.in>

## Verdict

**PASS — accept this candidate.** The prior deployment-only concern is not
reproduced. The live application serves byte-identical candidate files and
the strict deployed CSP permits the full PDF workflow without console errors.
No P0–P3 defects were found in the acceptance scope.

## Clean-checkout gates

Clean clone: `/tmp/field-desk-qa.arNStE`, checked out detached at the exact
candidate SHA.

| Check | Result | Fresh evidence |
| --- | --- | --- |
| Locked install | PASS | `npm ci`: 70 packages installed; audit reported 0 vulnerabilities. |
| Unit/PDF integration | PASS | `npm test`: 2 files, 8/8 tests passed. |
| Type check and exact production build | PASS | `npm run build` ran `tsc --noEmit && vite build` and produced `dist/`. No lint script exists. |
| Repository browser suite | PASS | `npm run test:e2e`: 6 passed, 4 intentional cross-project skips, exit 0 (30.1 s, configured two workers). |
| Dependency audit | PASS | `npm audit --omit=dev`: 0 vulnerabilities. |
| Live/candidate identity | PASS | SHA-256 matched for `index.html`, entry JS/CSS, lazy PDF chunks and worker, `sw.js`, and `field-positions.css`; live HTML references the candidate entry assets. |

The browser command was launched in a detached process because this executor
ends foreground commands at its 30-second collection boundary; the command
itself completed normally with status 0. This is not a product or test-suite
failure.

## Product exercise

Independent Chromium/PDF-lib checks against both the clean candidate build and
the live URL covered the smallest useful product:

1. Created real one- and two-page AcroForm PDFs, opened them from the local
   file picker, filled an existing text field, placed a text field, reordered
   a page, deleted it, used Undo, and downloaded both editable and flattened
   results.
2. The editable export was parsed with PDF-lib: it retained `full_name` with
   `Ada Lovelace` plus the created `field_desk_text_*` field. This directly
   verifies the repair for the earlier P1.
3. The live flattened export added checkbox, date, and typed-signature marks,
   rotated page 1 to 90 degrees, produced a valid two-page PDF, and contained
   zero AcroForm fields as expected after flattening.
4. Invalid `.txt` input showed “Choose a file ending in .pdf.”; corrupt
   `.pdf` input showed the damaged/unsupported message, with no page error.
   Source and UI review confirm the documented 175 MiB pre-parse boundary and
   one-page deletion guard.

The normal editable run had the expected filename `intake-field-desk.pdf`, no
console/page errors, no off-origin request, and only `GET` requests. The
checked source has no upload endpoint, analytics, storage API, beacon, XHR, or
third-party runtime URL. Live `POST /` and `POST /upload` both returned 405.

## Accessibility, privacy, PWA, security, and performance

| Area | Result | Evidence |
| --- | --- | --- |
| Desktop axe | PASS | `@axe-core/playwright` found zero serious/critical violations. |
| 390 × 844 mobile | PASS | Zero serious/critical axe violations; `scrollWidth === innerWidth === 390`; primary file action is reachable. |
| Keyboard/focus/motion | PASS | First Tab focuses the skip link with a solid visible focus outline. With reduced motion, `.file-loader` transition duration computed to `0.00001s`. |
| Semantic basics | PASS | Live page has `lang=en`, title, exactly one `h1`, a `main`, meaningful hero alt text, legal pages, README, MIT license, and image provenance/design record. |
| CSP and response policy | PASS | Live HTTPS sends HSTS, `nosniff`, `no-referrer`, restrictive permissions policy, and a same-origin CSP with no `unsafe-inline`. Normal edit/sign/export on that CSP produced zero console errors. |
| Caching | PASS | HTML `max-age=30`; immutable hashed assets one year; `sw.js` `no-cache`; worker `.mjs` returns `text/javascript`. |
| PWA/offline | PASS | The live service worker became controller; after `setOffline(true)`, reload returned 200 from the shell cache and rendered the landing `h1` without errors. Current SW revision is `field-desk-shell-v3`. |
| Bundle budget | PASS | First-load JS transfer was 13,414 B and CSS 5,940 B; local entry is 39,248 B raw / 12,779 B gzip and CSS is 20,235 B raw / 5,410 B gzip. Lazy PDF dependencies are not requested until a PDF is opened. Hero AVIF is 11,577 B. |
| Lighthouse, live mobile | PASS | Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 160 ms, CLS 0. |

## Defects by severity

| Severity | Defects |
| --- | --- |
| P0 | None found. |
| P1 | None found. |
| P2 | None found. |
| P3 | None found. |

## Reproduction commands

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
```

The repository has no lint command. The production URL and candidate commit
above are the exact objects verified; this report made no product-code change.
