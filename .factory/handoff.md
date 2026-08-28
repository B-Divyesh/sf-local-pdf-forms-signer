# Review 2 handoff

## Delivered

- Performed the requested adversarial first-read review without changing product code.
- Wrote `.factory/review-2.md` with the cold-read result, full landing/README copy audit, demo and storage checks, claim-test outcomes, and route/accessibility checks.

## Verification

- Reviewed the live deployment at 390 × 844 and 1440 × 950 in fresh Chromium contexts.
- Used a clean clone of commit `4898c4241bd777fc8a4b94f1953aacdffbef3d3a` at `/tmp/local-pdf-review-54IlCO`.
- `npm ci`, `npm test`, and `npm run build` passed.
- Ran every command registered in `.factory/claims.json` independently. Ten passed; `@claim:offline-reload` failed twice.
- Reproduced the offline failure against the deployed `/demo`: after disabling network and reloading, the landing screen appeared and the sample editor did not reopen.
- Checked routes, metadata, browser console, link status, back-button focus, and Playwright Axe serious/critical violations on the deployed routes.

## Known gaps / next steps

The review verdict is **FAIL**. Repair the offline demo before publishing the offline claim, then register and test (or remove) the unlisted README capability/privacy claims described in `review-2.md`. Minor terminology and eyebrow-label rewrites are also listed there.

## How to inspect

Read `.factory/review-2.md`. To reproduce the blocking check from a clean clone:

```sh
npm ci
npm run test:claims -- --grep @claim:offline-reload
```
