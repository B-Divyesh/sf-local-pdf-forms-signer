# Field Desk

Fill and sign PDFs on your device. Field Desk is for people and small offices handling sensitive forms.

Open a PDF and fill its standard fields. Add text, checkboxes, dates, or signature marks. Arrange pages, then download the result.

Open the isolated sample PDF at `/demo` or `/?demo=1`. Resetting or leaving the demo discards every sample edit.

## Tested behavior

The visitor-facing claims and their executable browser tests are listed in [`.factory/claims.json`](.factory/claims.json).

- PDF work stays on this device, with no PDF upload.
- The isolated sample saves nothing and resets on demand or exit.
- Field Desk and its sample PDF reopen offline after the first visit.
- Files over 175 MB are rejected.
- Standard text, choice, and checkbox fields keep their edited values.
- New text, checkbox, and date fields download as editable controls.
- Drawn and typed signatures export as visual marks, not verified digital signatures.
- Pages can move, rotate, be removed, and be restored before download.
- Downloads can keep fields editable or make them permanent.
- Opened PDFs are cleared when the tab reloads or closes.
- No account is required.
- Field Desk is free to use.

Field Desk does not read scanned text. It does not edit text already printed on a PDF page.

Field Desk rejects dynamic XFA forms because it cannot edit their fields.

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

Deploy `dist/` to Azure Static Web Apps. The included configuration supplies route rewrites, the designed 404, caching, and security headers.

## Project notes

- [Product scope](.factory/brief.json)
- [Visual system and asset provenance](.factory/design.md)
- [Demo details](.factory/demo.md)
- [Release handoff](.factory/handoff.md)

Licensed under the MIT License. See [LICENSE](LICENSE).
