# SWAYMARK Business inside Janus Personal Finance

Status on 16 November 2026: **preview deployed; NOT enabled in the stable finance app.**

The requested result is ONE finance app with a new **SWAYMARK Business** menu. Keep existing Personal Finance accounts, transactions, budgets, reports, and features unchanged.

## Prepared files

- swaymark-business.js: an enhancement that inserts a SWAYMARK Business navigation item into the existing app, reusing its authenticated Supabase API context and current page host. No second app login is needed.
- swaymark-business.css: namespaced styles for the business workspace and its editor, avoiding changes to the existing finance design.
- business-tables.sql: an additive table public.swaymark_items with strict per-user Row Level Security, no anonymous access and no changes to existing finance tables.
- A new Supabase Edge Function named personal-finance-swaymark-preview was deployed, cloned from finance release 1.3.0, with preview manifest version 1.3.1 and the new module appended to the preview app.js and style.css responses. The live personal-finance-release function was not changed.

## Business features

Dashboard, Enquiries, Clients, Quotes, Bookings, Projects, Tasks and Business finance. Add, edit and delete records, complete/reopen tasks, convert enquiries into clients, print draft quotes and search records. Business finance is a separate register and must not alter personal account balances.

## Database connectivity blocker

The finance project summary reports ACTIVE_HEALTHY, but SQL calls and table inspection repeatedly failed: Connection terminated due to connection timeout. Health and security advisors reported the project was hibernated. An attempted project restore reported that it was already active.

No database migrations were run. No finance records or tables have been changed.

## Checklist before activation

1. In the Janus Personal Finance Supabase project, confirm the Database and SQL Editor are working, including a harmless SELECT 1 query. Check Database Reports and Health if not. Do not restart or reset the finance project without understanding effects.
2. Verify public.swaymark_items does not already exist. Confirm the finance data has an available backup/recovery plan.
3. Apply business-tables.sql only in the Janus Personal Finance project. Never use Clean Carpets & Pest Control Perth's backend.
4. Confirm public.swaymark_items is exposed to the Data API for authenticated users; it must not be accessible to anonymous visitors. Validate four owner-based RLS policies and grants.
5. Test two distinct signed-in users: each can access their own business records and cannot see or edit the other's.
6. Test preview asset responses and load the new preview release in a safe test launcher. Check every new business view, login/logout and all existing personal finance features.
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
