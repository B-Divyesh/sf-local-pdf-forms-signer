# Repair handoff — perfection loop 1

## Delivered

Repaired every blocking item from `review-1.md` on the static Vite + TypeScript artifact.

- Rewrote the first screen around the plain job, audience, sample action, and three facts.
- Added `/demo` and `?demo=1`: a realistic two-page Harbor Street Studio intake PDF opens directly in the editor with completed fields, a checked item, a visual signature, and page controls.
- Added the persistent isolated-demo banner, **Reset demo**, and **Start for real**. Demo uses only `demo:field-desk-session`; documents and edits remain in memory and are discarded on reset, reload, and exit.
- Added `.factory/demo.md`, `.factory/claims.json`, and eleven tagged, observable Playwright claim tests.
- Added real SPA routes for demo, Privacy, Terms, and a designed unknown-route page; route-specific titles, descriptions, canonical/OG/Twitter metadata, focus restoration, live route announcement, header navigation, social card, and Apple touch icon.
- Fixed mobile navigation/wrapping, keyboard access to the mobile canvas scroller, and a toast animation contrast issue. The mid-century instrument-panel identity remains intact.
- Added copy audit, catalog description, and updated README and visual provenance.

## Verification evidence

Run in this workspace after `npm ci`:

```sh
npm test                 # 8 passed
npm run build            # passed; dist/index.html produced
npm run test:e2e         # 17 passed, 11 expected mobile claim skips
```

Every claim command in `.factory/claims.json` was executed independently with `npm run test:claims -- --grep @claim:<id>`; all eleven passed. This includes fresh demo isolation, request interception, offline service-worker reload, the 175 MB rejection, editable/permanent export inspection, and page/signature behavior.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ <temp-evidence-dir>` passed: HTTP 200, title, `lang="en"`, one h1, main landmark, image alt coverage, and no console errors. The full Playwright Axe scans passed on desktop and mobile routes. `@axe-core/cli` itself could not start its Selenium Chrome binary in this container; the installed `@axe-core/playwright` integration is the authoritative successful scan.

Build output: initial JavaScript is 195.69 KB gzip, CSS 5.66 KB gzip. This meets the static-product 200 KB JavaScript and 50 KB CSS budget.

## Deployment

No repository-local Azure deploy credential or work-order deployment command is present. The repair is committed and pushed to `main`; deploy the committed `dist/` through the factory's configured Azure Static Web Apps work order.

## Known gaps

None known. The product intentionally does not provide OCR, edits to existing page text, dynamic XFA support, verified digital signatures, or a signing record.
