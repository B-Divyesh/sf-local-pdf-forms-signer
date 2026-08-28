# Field Desk

Fill and sign PDFs on your device. Field Desk is for people and small offices handling sensitive forms.

Open a PDF, fill standard form fields, add text, checkbox, date, and signature fields, arrange pages, then download the result. Start the resettable sample at `/demo` or `/?demo=1`.

## Verifiable behavior

The visitor-facing claims and their executable browser tests are listed in [`.factory/claims.json`](.factory/claims.json).

- PDF work stays on this device.
- The sample demo saves nothing and resets.
- Field Desk works offline after the first visit.
- Files over 175 MB are rejected.
- Standard PDF fields can be filled and downloaded.
- New fields and visual signature marks can be added.
- Pages can move, rotate, and be restored after removal.
- Downloads can keep fields editable or make them permanent.
- Opened documents do not remain after a reload.
- No account is required.

A visual signature mark is not a verified digital signature. Field Desk cannot read scanned text, edit existing page text, handle dynamic XFA forms, or create a signing record.

## Develop and verify

Requires Node.js 20+.

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
```

Run every registered claim test from a clean state:

```sh
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
```

The production build is `npm run build`. It writes `dist/index.html` for Azure Static Web Apps.

## Deploy

Deploy `dist/` to Azure Static Web Apps. The included `public/staticwebapp.config.json` supplies the SPA fallback and security headers. This static product has no backend.

## Project notes

- [Product scope](.factory/brief.json)
- [Visual system and asset provenance](.factory/design.md)
- [Demo details](.factory/demo.md)
- [Release handoff](.factory/handoff.md)

Licensed under the MIT License. See [LICENSE](LICENSE).
