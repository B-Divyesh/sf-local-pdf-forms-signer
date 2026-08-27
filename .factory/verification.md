# Independent verification — FAIL

- **Candidate:** `1309298ee135dfa710c2510b5107d289334615fd`
- **Live URL:** <https://local-pdf-forms-signer.sociobot.in>
- **Verified:** 2026-08-27 (UTC)
- **Verdict:** **FAIL — do not release this candidate as verified.**

The live HTML and every publicly served file from the candidate build matched byte-for-byte (HTML, all JS/CSS/PDF-worker chunks, images, favicon, robots, sitemap, and `sw.js`). `staticwebapp.config.json` is intentionally not a public URL and returned 404. The defects below are therefore present in the live artifact, not a deployment-only discrepancy.

## Blocking defects

### High — default export silently loses filled existing AcroForm fields

The primary brief explicitly requires filling existing AcroForm fields and exporting a PDF, optionally flattened. In a normal two-page PDF containing `full_name`, I entered `Ada Lovelace`, added a new text field, reordered pages, and exported with the default **Keep new fields editable** setting.

- The downloaded PDF had two reordered pages and the newly-created `field_desk_text_*` form field.
- It had **no `full_name` form field**.
- PDF.js text extraction from the output contained only `Input page two | Input page one`; it did not contain `Ada Lovelace`.

The same flow with **Flatten completed fields** selected did retain `Ada Lovelace` as page content. The default, apparently editable workflow therefore discards the user’s existing-form answer without warning. This is data loss in a central job-to-be-done. The UI/README do not make choosing flatten mandatory for retained existing answers.

### High — offline reload is broken after successful service-worker installation

The product promises that it works offline after first load. In a production preview of the exact build, I loaded the app, waited for service-worker installation/activation, and confirmed cache `field-desk-shell-v1` contained `/`, CSS, entry JS, lazy PDF.js/pdf-lib chunks, worker files, routes, and images. After one controlled reload to make the worker controller active, I blocked network requests and reloaded:

- cached HTML was returned, but `#app` remained empty;
- the console reported: `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`;
- the service worker falls back to cached `/` for a missed module request, returning HTML instead of JS.

This is an offline-reload failure, including the required PWA verification path. Calling `registration.update()` itself completed with an active controller, but it does not repair the offline shell.

## Other defects

### Medium — field placement is not keyboard-operable

Keyboard focus and visible skip-link/focus styling work, and already placed fields can be moved with arrow keys. However, after selecting Text/Checkbox/Date/Signature, the page placement target is a non-focusable `div[data-page-stage]` with no keyboard action or alternative placement controls. The signature drawing canvas likewise has no keyboard equivalent. A keyboard-only user cannot add a field, contrary to the stated keyboard baseline.

### Medium — declared full E2E suite fails under its normal parallel command

`npm run test:e2e` was run twice from the clean checkout; both runs finished **1 failed, 3 passed, 2 skipped**. The desktop export test times out after five seconds waiting for `intake.pdf` immediately after upload, even though its failure snapshot shows the editor appears shortly thereafter. Running that one test serially passed. This is a reproducible timing-sensitive CI quality-gate failure, not a passing browser suite.

### Low — candidate README references a Docker deployment that is absent

At this candidate SHA, `Dockerfile` and `nginx/` do not exist, but the README instructs users to build and run that Docker image. Static hosting via `public/staticwebapp.config.json` is present and is what the live deployment uses. The documentation is inaccurate for the verified tree.

## Evidence collected

### Clean checkout and quality gates

Detached clean worktree at the requested SHA; `npm ci` completed with 0 reported vulnerabilities.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 6/6 Vitest unit/PDF tests |
| `npm run test:e2e` | FAIL twice — 1 failed, 3 passed, 2 intentional skips; serial export test passes |
| `npm run build` | PASS — `tsc --noEmit && vite build`, `dist/` produced |
| Initial entry JS | PASS — 38,097 bytes raw / 12,429 bytes gzip |
| Initial CSS | PASS — 20,235 bytes raw / 5,411 bytes gzip |
| Hero AVIF | PASS — 11,577 bytes |

The larger PDF.js/pdf-lib chunks are lazy loaded only after choosing a document; they are not part of initial JS.

### Product exercise

- Desktop (1440×900): opened a valid two-page AcroForm; filled existing text; placed a text field; reordered, deleted, and restored a page; exported; inspected the actual downloaded PDFs as described above. No normal-flow page or console errors.
- Mobile (390×844): landing and editor loaded without horizontal overflow; valid PDF opened successfully.
- Malformed/recovery: `.txt` input showed the extension error; invalid bytes named `.pdf` showed the damaged/unsupported error; a valid PDF then opened in the same tab.
- Boundary: a 176 MiB `.pdf` was rejected with the documented 175 MB memory-limit message.
- Axe: local desktop landing/editor and local 390px landing, plus live desktop/390px landing, each had 0 serious/critical violations.
- Keyboard/reduced motion: skip link receives visible focus; CSS supplies `:focus-visible` and a reduced-motion media query. The keyboard placement gap above remains.

### Privacy, live deployment, and transport

- Browser request capture for the exercised live landing/editor observed only `https://local-pdf-forms-signer.sociobot.in`; source inspection found no analytics, upload endpoint, storage API, third-party script/font, or document-byte network transfer. Service-worker fetches are same-origin shell caching only.
- Live headers include CSP restricting sources to `self` (with `data:`/`blob:` images and blob workers), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, camera/microphone/geolocation-denying Permissions-Policy, and HSTS.
- Live caching: immutable one-year cache on hashed assets, `no-cache` on `sw.js`, and short revalidation on HTML. `/privacy` and `/terms` return the SPA shell successfully.

## Required remediation before a PASS

1. Preserve filled source AcroForm fields in the default editable export, or make a clearly labelled flatten-only export the safe default and prevent silent loss.
2. Fix service-worker matching/fallback so cached JS is served as JS and test a genuine offline reload plus opening a locally selected PDF offline.
3. Provide a keyboard-operable field-placement and signature alternative.
4. Make `npm run test:e2e` reliably pass in its normal configured parallel run.
5. Correct the Docker instructions or restore the described Docker files.
