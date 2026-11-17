# SWAYMARK Business inside Janus Personal Finance Hub

## Release status — 17 November 2026

**Stable server release 1.3.1 is published.** The original Windows FinanceHub launcher automatically checks the existing \`personal-finance-release\` update feed when opened. The stable release adds a **SWAYMARK Business** section without replacing the desktop executable.

The previous stable 1.3.0 release has been cloned to \`personal-finance-rollback-v130\`, with a separate route, as a rollback source. The separate preview feed \`personal-finance-preview\` also remains available.

**Not yet completed:** The Windows UI has not been exercised interactively in the user's own desktop environment. The public SWAYMARK website's contact form still emails enquiries; automatic form-to-app delivery remains inactive. Use a sample business record to verify the menu and sync before entering real client data.

## Existing features preserved

This integration does not touch the existing personal finance tables or change their policies. The 19 original public finance tables were verified present after adding the SWAYMARK table. Finance functions, accounts, transactions, budgets, recurring entries, taxes and reports keep their existing server code.

The Janus Personal Finance database is a shared Supabase **project**, but SWAYMARK uses only a separate \`public.swaymark_items\` table with owner-based row-level security. This project is not connected to Clean Carpets & Pest Control Perth.

## What the business section includes

Dashboard, Enquiries, Clients, Quotes, Bookings, Projects, Tasks and Business finance. Includes create/edit/delete, complete/reopen tasks, convert enquiry into client, search and draft quote printing. The Business finance register **does not change personal account balances**.

## Source files

- \`swaymark-business.js\`: app extension, inserted into the latest stable Finance Hub app.js response, reusing the existing signed-in context \`window.__financeHub\`
- \`swaymark-business.css\`: isolated business styling appended to stable style.css
- \`business-tables.sql\`: migration that was applied to the existing Janus Personal Finance Supabase project

The desktop launcher binary is unchanged and retains the normal stable release feed.

## Verified on release 1.3.1

- Database migration succeeded: only \`public.swaymark_items\` was added; 19 other public finance tables remain
- RLS enabled, four owner-scoped policies for SELECT/INSERT/UPDATE/DELETE
- No direct anonymous SELECT or INSERT table privileges
- Simulated session isolation: owner access succeeded, a different identity could not see the owner's record; test transaction rolled back
- Finance base JavaScript and business extension passed static syntax checks (module \`import.meta\` normalized for parser check)
- Stable version manifest serves **1.3.1 / stable**, preview serves 1.3.1 / preview
- Stable CSS serves the appended SWAYMARK styles
- 1.3.0 rollback feed serves the previous version manifest
- New table contains zero customer records immediately after migration
- Release was deployed with the same JWT-verification configuration as the existing public asset-serving function; the function does not accept data writes

## Rollback (maintainer)

If a Finance Hub regression is reported, retrieve the known-good version from \`personal-finance-rollback-v130\` (Supabase Edge Function) and redeploy its source to the \`personal-finance-release\` slug, changing the path marker back from \`/personal-finance-rollback-v130/\` to \`/personal-finance-release/\`. Confirm \`version.json\` reads 1.3.0 and the app works. Do not run SQL migrations or delete the business table during code rollback. The rollback function was copied before the stable promotion.

## Before production CRM use

1. Sign into the Windows Finance Hub and open SWAYMARK Business, confirm left navigation and section tabs.
2. Create, edit, delete and reload sample data in each business section. Verify completed tasks and printed quotes. Verify normal finance features still function.
3. Verify cross-user access denial with two real authenticated sessions and check the database Security Advisor. The simulated-user RLS transaction test already passed.
4. Ensure a backup and retention plan for the shared Supabase project; ensure appropriate privacy disclosures and consent before storing real customer data.
5. Test a protected website-to-app submission flow with spam protection before changing the public FormSubmit contact form. The current website form must remain operational until then.
6. Do not use draft quote printouts as tax invoices or Business finance as tax/accounting software.

## Release endpoints

- Current stable manifest: https://glopetsbjaoxutjghgdo.supabase.co/functions/v1/personal-finance-release/version.json
- Previous version (rollback): https://glopetsbjaoxutjghgdo.supabase.co/functions/v1/personal-finance-rollback-v130/version.json
