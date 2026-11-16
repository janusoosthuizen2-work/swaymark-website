# SWAYMARK Business inside Janus Personal Finance

Status on 16 November 2026: **database created and RLS verified; preview deployed; NOT enabled in the stable finance app.**

The requested result is ONE finance app with a new **SWAYMARK Business** menu. Keep existing Personal Finance accounts, transactions, budgets, reports, and features unchanged.

## Prepared files

- swaymark-business.js: an enhancement that inserts a SWAYMARK Business navigation item into the existing app, reusing its authenticated Supabase API context and current page host. No second app login is needed.
- swaymark-business.css: namespaced styles for the business workspace and its editor, avoiding changes to the existing finance design.
- business-tables.sql: an additive table public.swaymark_items with strict per-user Row Level Security, no anonymous access and no changes to existing finance tables.
- A new Supabase Edge Function named personal-finance-swaymark-preview was deployed, cloned from finance release 1.3.0, with preview manifest version 1.3.1 and the new module appended to the preview app.js and style.css responses. The live personal-finance-release function was not changed.

## Business features

Dashboard, Enquiries, Clients, Quotes, Bookings, Projects, Tasks and Business finance. Add, edit and delete records, complete/reopen tasks, convert enquiries into clients, print draft quotes and search records. Business finance is a separate register and must not alter personal account balances.

## Database connection and migration verified

A manual SELECT 1 in Supabase SQL Editor succeeded. Subsequent connector calls confirmed the existing 19 personal finance tables and the absence of public.swaymark_items before migration.

Migration create_swaymark_business_items_separate succeeded, adding exactly one table public.swaymark_items to the same Janus Personal Finance Supabase project, with no modifications to existing finance tables.

Verification:
- All existing 19 public personal finance tables remain present with RLS enabled.
- New public.swaymark_items table has RLS enabled and exactly four access policies: SELECT, INSERT, UPDATE and DELETE, all scoped by authenticated user ID.
- Anonymous role has no SELECT or INSERT privileges. Authenticated role has the expected table permissions.
- Ownership isolation tested through a transaction: the owner could create/read a temporary business record, another identity could not see it, and the transaction was rolled back. Business records remain empty.
- Supabase Security Advisor reported only an unrelated leaked-password-protection warning for the shared Auth configuration. No new table warning was reported.

No finance records, projects, accounts, budgets or tax tables were modified, deleted or migrated.

## Checklist before activation

1. Business table migration and RLS checks are completed. Ensure the Data API can access this table as a logged-in user in the browser. Anonymous direct access must fail.
2. Transaction-level simulated-user SELECT/INSERT isolation tests passed; repeat with two real authenticated sessions before handling client data.
3. Test that the business module loads inside the preview finance launcher, using the current finance app's existing authenticated context.
4. Confirm that the stable finance release works exactly as before. The current stable function has not changed.
5. Check Supabase Auth leaked-password protection settings where available, and ensure the shared project's recovery/backup plan is documented.
6. Test preview asset responses and all seven SWAYMARK sections in a browser, including mobile.
7. Promote only after full QA, using a new stable version number and keeping the previous stable finance release available for rollback.
8. Update SWAYMARK's public privacy notice and test a protected website submission endpoint before linking the contact form. The current working FormSubmit email delivery must remain intact until that is done.

## Security model

- Business records are stored only in public.swaymark_items, with owner_id equal to authenticated auth.uid().
- Explicit SELECT, INSERT, UPDATE and DELETE row security. Anonymous role receives no table privileges.
- Client JS reuses existing finance sign-in token/publishable API headers. It contains no service-role or secret key.
- No finance accounts, transactions, budgets, tax or goals tables are queried or mutated.
- Text is HTML-escaped before rendering; records remain in memory rather than localStorage.
- Business finance records are separate from personal account balances.

## Finance release maintenance

The current personal-finance-release Edge Function is a versioned static release server. It serves JavaScript and CSS assets under releases/version paths using compressed base assets and dynamic patches. To promote this extension, append SWAYMARK JS to latest-release app.js and SWAYMARK CSS to latest-release style.css, bump the release manifest, and perform comprehensive browser QA before deploying to the stable function. Do not overwrite the currently working release without a tested rollback.

The preview is source-level integration, not proof of live end-to-end performance while the database is hibernated.
