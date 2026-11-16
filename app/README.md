# SWAYMARK Business Hub | Secure Cloud App v0.2

STATUS: Secure app source and deployment files prepared. A new independent SWAYMARK Supabase project and Cloudflare secrets are NOT configured. Real client data must not be entered until full setup and testing.

LIVE ADDRESSES
- Secure app: https://swaymark.pages.dev/app/ (setup-required screen until activated)
- Device-only demo: https://swaymark.pages.dev/hub/
- Public website: https://swaymark.pages.dev/

The private app includes password sign-in, an authenticated database client, owner-scoped data access, dashboards, enquiries, clients, quotes, bookings, projects, tasks, finance entries, printable draft quotes and JSON export. It reuses the existing SWAYMARK visual design. It is a PWA, not a native Android APK or iOS App Store application.

CRITICAL: DO NOT USE CLEAN CARPETS & PEST CONTROL PERTH SUPABASE. The connected Supabase organization belongs to that company. SWAYMARK must have its own independent Supabase organization, project, user and keys.

STEP 1 — DEDICATED DATABASE AND ACCOUNT
1. In https://supabase.com/dashboard create a new SWAYMARK-owned organization and a project inside it. Review billing, region and South African data-protection obligations before using real client data.
2. In the new project SQL Editor, execute app/database.sql. It creates public.swaymark_items, grants access only to authenticated and backend roles, enables RLS, and restricts every operation to auth.uid() = owner_id.
3. In Integrations > Data API settings, confirm public.swaymark_items is exposed for authenticated users. In 2026, new tables may not be exposed automatically. Never grant the anon role read/write access.
4. In Authentication, DISABLE public signups and anonymous Auth. Manually create/confirm your private business owner user. Use a unique password; enable MFA on your Supabase administration account.
5. Take the new project's URL and publishable API key (starts with sb_publishable_) from the dashboard. Enter only those two values into app/config.js in GitHub. Never paste a secret, service_role key or password in the repository.
6. After GitHub/Cloudflare deploys, visit /app/, sign in, and test a client, task and quote. Refresh and test another browser. Test owner-based RLS with a second user before production use.

STEP 2 — WEBSITE CONTACT FORM (PREPARED, NOT ACTIVE)
The existing public FormSubmit contact form is deliberately unchanged, so real enquiries keep working by email. The prepared Cloudflare Pages Function lives in functions/api/enquiry.js and handles POST /api/enquiry when configured.

In Cloudflare Workers & Pages > Settings > Variables and Secrets, configure for production:
- SUPABASE_URL — dedicated SWAYMARK Supabase project URL (plain variable)
- SUPABASE_SECRET_KEY — SWAYMARK sb_secret_... (encrypted secret only)
- SWAYMARK_OWNER_UID — verified Auth user UUID of the SWAYMARK owner
- TURNSTILE_SECRET_KEY — Cloudflare Turnstile server secret (encrypted)
- SWAYMARK_SITE_ORIGIN — exactly https://swaymark.pages.dev (or your verified production domain)

Create a Turnstile widget for the website. Its PUBLIC site key goes into contact-form client markup. When ready, update the form to POST JSON containing name, email, phone, business, service, timeframe, message, consent:true, turnstileToken and an optional honeypot to /api/enquiry. It checks same-origin, input validity and the Turnstile token at Cloudflare before inserting a new enquiry for the owner. Use WAF rate limiting, end-to-end tests and monitoring. Never replace the working FormSubmit form until this new flow is verified. Email notifications are NOT implemented yet.

Update the website Privacy Notice, retention, processors, data locations, consent handling and applicable POPIA obligations before connecting real enquiries. Turnstile adds another processor. Arrange appropriate backups and restore tests.

STEP 3 — INSTALL AS AN APP
- Desktop Chrome/Edge: open /app/, click the install icon in the address bar or use browser menu > Install app.
- Android Chrome: browser menu > Install app / Add to Home screen.
- iPhone Safari: Share > Add to Home Screen.
- A source-code ZIP is available from the GitHub repository's Code > Download ZIP action.
- Offline support caches only app shell files. Client records require a signed-in internet connection and are not placed in localStorage or the service worker cache.

SECURITY AND FEATURES
- Client auth uses Supabase Auth password grants and short-lived JWTs with token refresh. The app stores session tokens in sessionStorage, not shared localStorage; its records stay in memory and are fetched from RLS-protected database tables.
- Public JS contains only browser-safe project URL and publishable key; the service key belongs solely in Cloudflare encrypted secrets.
- SQL ownership policies explicitly secure SELECT/INSERT/UPDATE/DELETE and do not allow anonymous records.
- Full customer details are protected by database RLS; Cloudflare endpoint is fail-closed until it has all secrets.
- Backup exports may contain sensitive data. Keep downloaded JSON files secure and protect or delete them in accordance with retention policy.
- Quote printouts are drafts, NOT tax invoices or binding contracts; finance is NOT accounting software. Bookings do not automatically sync to Google Calendar.
- No payment processing, client file uploads, calendars or automatic email notifications yet.

ACCEPTANCE TEST BEFORE REAL USE
1. Login fails without the correct password and shows setup-required screen without configuration.
2. Authenticated data persists across refresh and devices, with RLS verified against a second user.
3. Add, edit, remove, complete/reopen tasks and print a draft quote successfully.
4. Public/unauthenticated attempts to query the data table fail.
5. A real form integration test using valid Turnstile works; invalid and replayed tokens fail. Public site form remains functional in all failure cases.
6. Browser installation works on the target device, and app pages are noindex.
7. Review South African data privacy, written contracts, backup/retention and security obligations before storing client data.

Files: app/index.html, app/config.js, app/secure.js, app/secure.css, app/database.sql, app/manifest.webmanifest, app/icon.svg, app/sw.js; functions/api/enquiry.js.
