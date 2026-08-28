# Copy audit — perfection loop 2

Counts treat hyphenated terms, numbers, and slash-joined terms as one word. No audited unit exceeds 22 words. No banned plain-words term appears.

## First screen and landing

| Copy unit | Words | Result |
| --- | ---: | --- |
| Field Desk | 2 | Pass |
| Open sample PDF | 3 | Pass; one header term for the sample destination |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Stays on this device | 4 | Pass; `local-only` claim |
| PDF editor that stays on your device | 7 | Pass; explains the product and maps to `local-only` |
| Fill and sign PDFs on your device. | 7 | Pass; job-first headline |
| For people and small offices handling sensitive forms, add fields, sign, and arrange pages without uploading a PDF. | 17 | Pass; audience and outcome |
| Try it with sample data | 5 | Pass; required no-setup invitation |
| Open your PDF | 3 | Pass; result-naming action |
| Opens a completed sample PDF you can edit. | 8 | Pass; adjacent action outcome |
| No PDF uploads | 3 | Pass; `local-only` claim |
| Works offline after first visit | 5 | Pass; `offline-reload` claim |
| Free · no account | 3 | Pass; `free-use` and `no-account` claims |
| PDF files only. | 3 | Pass; `pdf-files-only` claim |
| Files over 175 MB are rejected. | 6 | Pass; `max-file-size` claim |
| Fill, sign, and arrange one PDF here. | 8 | Pass |
| How to fill and export a PDF | 7 | Pass |
| Fill, sign, arrange, and export one PDF. | 7 | Pass |
| Open a sample PDF | 4 | Pass |
| Start with a completed two-page intake PDF, or open your own PDF. | 12 | Pass |
| Edit fields and pages | 4 | Pass |
| Fill standard fields, add new fields, sign, move, rotate, or remove pages. | 12 | Pass; capability claims are registered separately |
| Download the finished PDF | 4 | Pass |
| Keep fields editable or make them permanent before downloading. | 9 | Pass; `export-modes` claim |
| PDF privacy and storage | 4 | Pass |
| Your PDF work stays on this device. | 7 | Pass; `local-only` claim |
| After the first visit, Field Desk can reopen offline. | 9 | Pass; `offline-reload` claim |
| Opened PDFs are cleared when you reload or close the tab. | 11 | Pass; `no-document-persistence` claim |
| Field Desk · PDF editing that stays on this device | 9 | Pass; `local-only` claim |
| Built by Param Factory · v1.0.2 | 6 | Pass |

## Demo, Privacy, and Terms

| Copy unit | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | Pass; `demo-isolation` claim |
| Edit the completed two-page sample PDF. | 7 | Pass |
| Reset demo | 2 | Pass |
| Start for real | 3 | Pass |
| Field Desk keeps PDF work in your browser. | 8 | Pass; `local-only` claim |
| Field Desk keeps an open PDF in this tab’s memory. | 10 | Pass; `no-document-persistence` claim |
| The offline cache contains only public app files. | 8 | Pass; verified by `offline-reload` cache inspection |
| Field Desk is free to use. | 6 | Pass; `free-use` claim |
| No account is required. | 4 | Pass; `no-account` claim |
| A signature added here is a visual mark, not a verified digital signature. | 13 | Pass; `signature-mark` claim |
| Field Desk does not read scanned text. | 7 | Pass; `no-ocr` claim |
| It does not edit text already printed on a page. | 10 | Pass; `no-page-text-edit` claim |
| Field Desk rejects dynamic XFA forms because it cannot edit their fields. | 12 | Pass; `reject-xfa` claim |

## README

All product assertions in the “Tested behavior” and limitation sections map one-to-one to `.factory/claims.json`. The longest prose sentence is 20 words: “Open a PDF and fill its standard fields. Add text, checkboxes, dates, or signature marks. Arrange pages, then download the result.” These are three separate sentences of 9, 8, and 6 words.

Developer-only build and deployment instructions describe repository mechanics rather than visitor-facing product behavior. No sentence exceeds 22 words.

## Terminology

| Concept | One term used |
| --- | --- |
| Local processing | on this device |
| Demo asset | sample PDF |
| Signature limitation | visual mark, not a verified digital signature |
| Permanent export | make fields permanent |
| Target audience | people and small offices handling sensitive forms |
