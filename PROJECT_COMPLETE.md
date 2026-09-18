# Verification report — 18 September 2026

This report replaces the previous unverified completion claims.

## Implemented

- Fixed the failing TypeScript/Vite build, missing type dependency and obsolete compiler options.
- Added service creation and editing, with English and Arabic names, descriptions and deliverables.
- Fixed client/project forms by mounting a fresh form for each create/edit action; added field labels, input validation, keyboard focus handling and Escape dismissal.
- Added project-specific service prices, currency and project status; retained existing project data.
- Added a client list with editable contact details and logos.
- Replaced the previous PDF drawing generators with shared HTML/CSS document generation. The original proposal stylesheet is in `src/documents/reference.css`; the actual `public/mfx-logo.png` is embedded into generated HTML.
- Invoice, contract and report share Cairo, MFx blue, gradient, borders, shadows and layout classes from the supplied reference. Arabic documents use RTL layout.
- Added standalone HTML download and browser Print / Save PDF. Contract wording is entered and saved separately for each language.
- Removed automatic client/project seed data and fixed duplicate insertion. Migration preserves an original recovery copy and removes only identical records.
- Removed fabricated growth metrics, guarded empty calculations, separated currencies and labeled report date semantics accurately.
- Fixed timer replacement and deletion cleanup.
- Replaced hardcoded Google credentials with a preview-first import form. Repeated references are skipped; partial payments require an actual amount. Service allocations preserve the exact total, including rounding cents.
- Improved spacing, responsive layouts, dark/light behavior, MFx logos, transitions and reduced-motion behavior.

## Verified by execution

- `npm run lint`: passed.
- `npm test`: 22 checks passed, including duplicate insertion, timers, actual partial payments, invalid dates, currency separation, HTML escaping and six document/language combinations.
- `npm run build`: passed. There is still a non-failing bundle-size advisory for the chart dependency chunk.
- Browser create flow: a bilingual service, client and project were created on an isolated test origin, with a fractional paid amount and correct remaining balance.
- Browser edit flow: the saved project's existing data loaded correctly; changing the service price updated the project and balance.
- Persistence: the client, project, service, amounts and contract wording survived reopening the application.
- Existing-use origin: duplicate clients/projects reduced from 4/4 to 2/2; duplicated totals corrected from EGP 145,000 to EGP 72,500.
- Invoice and report previews: English and Arabic displayed the proper content, totals, Cairo styling and MFx logo. Arabic preview was visually inspected.
- Contract preview: entered wording appeared correctly; English and Arabic terms were stored separately and reopened correctly.
- Desktop production preview: 1440px layout, correct 55×34px header logo, and no page-width overflow. Dark mode was visually inspected.
- Mobile report: tested at a 390px viewport; no page-width overflow was detected. Wider report tables scroll inside their container.
- Actual HTML download: `MFx-invoice-ar.html` was saved in Downloads; its language, embedded logo, Cairo font link and EGP 1,265.50 balance were checked. A copy is in `verification/downloaded-invoice-ar.html`.

## Not verified / limits

- Native system print-dialog output is not separately verified; direct PDF download is implemented and verified.
- The 35-service Arabic contract was exported to a five-page PDF and every page was visually inspected.
- No live Google Sheets account was queried/imported during testing. Configuration/access and live import require the intended sheet and key. Parsing and duplicate prevention were tested locally.
- Logo upload was exercised with a real PNG: the client form displayed the image preview and saved the client. The final client-logo placement in the document has not been separately verified.
- No claim of pixel-for-pixel PDF matching, universal device compatibility, or production readiness is made.

## Files

- `src/documents/generate.ts`: shared document generator.
- `src/documents/reference.css`: stylesheet extracted from the supplied proposal.
- `src/components/DocumentStudio.tsx`: language, terms, preview, HTML download and print actions.
- `scripts/verify.mjs`: executable regression checks and sample generation.
- `verification/invoice-en.html`, `invoice-ar.html`, `contract-en.html`, `contract-ar.html`, `report-en.html`, `report-ar.html`: synthetic sample documents.

The `127.0.0.1:5174` browser origin contains clearly labeled QA-only test records. The normal `localhost:5173` origin retains the user's data.


## Latest palette, references and direct PDF verification

- Applied the final copper/light and champagne/very-dark palettes independently of print CSS.
- Twelve standard bilingual services, sequential client/project references, and Add Client & Project implemented.
- Added reference previews and counters that retain consumed numbers after deletion. Moving a project to another client allocates that client's next project reference.
- Direct PDF route renders the shared HTML/CSS using system Edge with embedded local Cairo fonts. Requires the Node dev/preview server, not a static-only dist host.
- Download PDF clicked in the browser for an Arabic invoice: Downloads/INV-MFx-26001-1-ar.pdf saved, 77,676 bytes.
- API exported invoice-ar, contract-en, report-ar, report-en and the five-page long-contract-ar into output/pdf. Arabic report and all five long-contract pages visually inspected; earlier invoice and English contract renders inspected too.
- Live QA created MFx-26001-1 with Active/Pending statuses, and Add Client & Project created MFx-26002 and preselected project MFx-26002-1.
- Dark computed colors verified: canvas rgb(8,9,10), surface rgb(17,20,24), text rgb(237,237,237), accent rgb(212,175,55).
- QA records live only on 127.0.0.1:5175. Normal user origin remains localhost:5173.
- Light computed colors verified: canvas rgb(248,249,250), surface rgb(255,255,255), text rgb(26,29,32), accent rgb(194,103,59). Main localhost:5173 returned HTTP 200 and generated a 77,900-byte Arabic invoice PDF.
