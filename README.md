# Field Desk

Field Desk is a browser-local PDF form builder, filler, signer, and page editor for individuals and small offices that cannot upload sensitive paperwork to a converter. It combines the common jobs that usually require several tools:

- fill existing AcroForm text, checkbox, dropdown, and radio fields;
- place movable/resizable text, checkbox, date, and signature fields;
- draw or type a signature;
- reorder, rotate, remove, and restore pages; and
- export new fields as editable controls or flatten them for portability.

Live: <https://local-pdf-forms-signer.sociobot.in>

## Privacy model

PDF bytes never leave the browser tab. There is no backend, upload endpoint, account, analytics script, cookie, or third-party runtime dependency. A small service worker caches only the public app and its PDF libraries for offline use; it does not store opened documents.

Drawn and typed signatures are visual marks, not certificate-backed or qualified electronic signatures. Field Desk deliberately does not provide OCR, edit existing page text, support dynamic XFA fields, or create a legal signing audit trail. Very large scanned PDFs are limited by browser memory.

## Develop and verify

Requires Node.js 20+.

```sh
npm install
npm run dev
npm test
npm run build
```

The production build command is exactly `npm run build`; output is written to `dist/` with `dist/index.html` at its root.

Browser tests include desktop and 390px-class mobile accessibility scans plus an end-to-end PDF export:

```sh
npx playwright install chromium
npm run test:e2e
```

## Deploy

The factory deployment target is a container. The included multi-stage `Dockerfile`
builds `dist/` and serves it on port 8080 as an unprivileged user. It preserves
the client-side routes and service worker, uses immutable caching for
fingerprinted Vite assets, keeps HTML out of browser caches, and sends security
headers.

```sh
docker build -t field-desk .
docker run --rm -p 8080:8080 field-desk
```

Open <http://localhost:8080>; `/privacy` and `/terms` should resolve through the
SPA fallback. The existing `public/staticwebapp.config.json` remains for static
hosting compatibility.

## Project notes

- The researched product scope is in [`.factory/brief.json`](.factory/brief.json).
- The mid-century instrument-panel visual system and asset provenance are in [`.factory/design.md`](.factory/design.md).
- Release verification and known limitations are in [`.factory/handoff.md`](.factory/handoff.md).

Licensed under the MIT License. See [`LICENSE`](LICENSE).
