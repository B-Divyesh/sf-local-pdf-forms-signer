# Field Desk repair 4 handoff

## Outcome

Strict review repair 4 is complete. All four review-5 findings are fixed, all
16 claims pass, and the live deployment matches the clean implementation
build. No review finding remains.

## Release identity

- Implementation: `ef92586b63c8cf18d4ce58d86a044cb386db2470`
- Documentation and evidence: recorded in the final documentation commit
- Deployment: `7616f7fc-4e57-4f7e-be75-fc846302393e`
- Live URL: <https://local-pdf-forms-signer.sociobot.in>

## What changed

- Phone navigation, skip, and dialog controls now provide 44 × 44 px targets.
- The focus outline now reaches 3.25:1 against charcoal controls.
- Signature tabs now use roving focus and standard arrow, Home, and End keys.
- Decorative record, routing, instrument, and output labels were removed.
- Outcome-based browser regressions cover all four repairs.
- The visual-system and copy-audit records now match release 1.0.4.

## Verification

From a clean checkout:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
```

Results: 9 unit/PDF tests passed; 26 browser tests passed with 22 intentional
viewport skips; build and audit passed. Run the 16 claim commands printed by:

```sh
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
```

All 16 commands passed separately. The same browser suite passed against the
live domain. Mobile Lighthouse scored 100 in all four categories, with 1.1 s
LCP, 0 ms TBT, and 0 CLS. The factory URL verifier found no console errors.

See `.factory/repair-4.md` and `.factory/evidence/repair-4/live/` for the
finding map, cold-browser evidence, and performance report.

## Known limits

Field Desk does not read scanned text, edit printed page text, support dynamic
XFA fields, or provide verified digital signatures. Large scanned PDFs remain
limited by browser memory. These documented limits are unchanged. No repair
work is deferred.
