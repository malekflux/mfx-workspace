# MFx Workspace

Local client, service and project management, with bilingual HTML document generation.

## Run

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173/). Keep the same hostname and port: browser storage is separate for each origin.

Sign in with username `mfx-admin` and password `mfx2026`. Authentication lasts for the current browser session; use **Sign out** in the sidebar to lock the workspace again.

## Use

1. Workspace → New Client. Add contact details and an optional PNG/JPG/WebP logo, up to 2 MB.
2. Workspace → New Service. Enter the English wording and optional Arabic name, description and deliverables. Browse the catalog to edit or delete a saved service. Deleting from the catalog does not alter existing projects.
3. New Project → choose a client and services. Adjust each project's prices, currency, dates, paid amount and status. Changes to catalog prices do not rewrite existing projects.
4. Use a project's invoice or contract button. The preview toolbar contains only the language selector and **Download PDF**.
5. For contracts, enter the approved English and Arabic terms in the project form. No legal clauses, penalties or payment assumptions are generated automatically.
6. Download PDF generates an A4 PDF from the same HTML/CSS, with the MFx logo and Cairo font. PDF generation requires the Node server (`npm run dev` or `npm run preview`) and installed Edge/Chrome/Chromium; set PDF_BROWSER_PATH for a custom executable. Serving only `dist` as static files does not provide the PDF endpoint.
7. Reports → choose a client and project-start period → Generate Report → choose a language.
8. Settings → Download backup exports your workspace as JSON.

Arabic document labels and direction are translated. Service content uses the Arabic wording entered in the catalog; missing translations preserve the original text. Client names and project notes are preserved as entered.

## Data and calculations

- No client or project sample data is inserted automatically.
- Exact duplicate records from the old application are removed on migration. The original saved state is retained under `mfx-storage-before-v2` before cleanup. Conflicting records are preserved.
- Each currency is calculated independently. No exchange rate is assumed.
- Reports show project values and recorded paid amounts, grouped by project start date. They are not dated payment-transaction or accounting ledgers.
- This remains a local browser-storage application. It does not include shared accounts, a server database, automatic cloud backup or two-way synchronization.

## Google Sheets

Settings provides preview followed by one-way import. Supply the Sheet ID and a restricted read-only API key for an accessible sheet; the key is not saved. Existing project references are skipped to preserve local edits.

Sheet1 columns A–P retain the previous layout: reference, business name, contact, phone, services, billing model, amount, payment method, payment due day, payment schedule, start date, payment status, project status, Drive URL, account PIC, notes. Column Q is the actual paid amount, required for partial payments. Dates must be real YYYY-MM-DD dates. Imported amounts are EGP.

## Validation

```powershell
npm run lint
npm test
npm run build
npm run preview
```

`npm test` runs 28 focused regression checks and creates bilingual samples in `verification/`. The build output is `dist/`.

Read `PROJECT_COMPLETE.md` for verified results and remaining validation limits. Older milestone documents have been marked as historical.

## September 18 update

- Exact latest light and very-dark palettes; print styles remain independent.
- Twelve bilingual standard services with the requested four deliverables each. Existing standard prices and custom services are preserved; existing projects keep their service snapshots.
- Client references: MFx-26001; project references: MFx-26001-1. Number counters survive deletion. The year prefix follows the creation year.
- Add Client & Project saves the client and preselects it in the project form. Reference previews appear before saving.
- Contract and invoice document numbers use CON-MFx-26001 / INV-MFx-26001; the project reference appears separately inside the document. Download filenames include the project suffix to distinguish different projects.
- Legacy nonstandard references are normalized during version-2 migration, with a recovery copy in browser storage. Internal IDs and relationships are retained.
- PDF checks: start an isolated dev server on port 5175, run npm test then node scripts/verify-pdf.mjs. Samples are written to output/pdf.
- Google Sheets source references are retained only for idempotent imports. New imported clients and projects receive the same official sequential MFx references as records created in the interface.
- Cairo is bundled locally for the application. The interface does not depend on Google Fonts being available.
