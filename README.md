# SWAYMARK | Website Development, SEO and Digital Marketing

Professional, fast, accessible seven-page static business website for SWAYMARK.

## Website
- Primary public URL: https://swaymark.pages.dev/
- Legacy site (remains online, now advertises Pages as canonical): https://janusoosthuizen2-work.github.io/swaymark-website/
- Primary free hosting: Cloudflare Pages, built from GitHub main branch, repository root
- Legacy hosting: GitHub Pages remains active for existing visitors
- Business enquiries: janusoosthuizen2@gmail.com and 070 434 7735 (both public)
- Contact form: native HTTPS POST to FormSubmit.co (free external service), with default reCAPTCHA and a hidden spam honeypot. Submission is emailed to janusoosthuizen2@gmail.com after completed one-time email activation (confirmed 15 November 2026). No custom server/API credentials are stored in client code. FormSubmit archives submissions for 30 days according to its documentation.
- Form handling: branded `thanks.html` after a completed submission and any spam challenge. A controlled FormSubmit test was received at the listed Gmail address on 15 November 2026; third-party delivery can still occasionally fail.
- No advertising trackers, analytics, paid fonts or third-party JavaScript on the SWAYMARK pages. Submitting the form transfers data to FormSubmit; its reCAPTCHA challenge may involve Google's cookies/technical processing.
- SEO: unique metadata, canonical URLs, JSON-LD, sitemap.xml, index/follow. Search Console verification and sitemap submission still require a verified site owner.

## Included pages
Seven indexable pages: Home, Services, Selected Work, About, Contact, Privacy, Terms. One non-indexable form confirmation page: Thanks. Selected Work leads with the actual live SWAYMARK site, then distinguishes anonymised operating experience from uncommissioned illustrative design concepts.

## Work safely
- Keep any client examples labelled honestly. Ask permission before displaying client work, logos, proprietary data or quantified results.
- SWAYMARK is not yet confirmed as a legally available mark. Check the relevant company-registration and trademark records wherever you intend to operate before registering or investing in the brand.
- The public Privacy and Terms pages describe the current operator and enquiry process. They are not a substitute for professional legal review before paid engagements.
- No provider can guarantee 100/100 Lighthouse in every environment, or a particular Google ranking/indexing date.

## Preview/test
From this directory run `python -m http.server 8000` then browse http://127.0.0.1:8000.
For new domain hosting, update canonical references with `python tools/prepare_launch.py --url https://your-actual-domain.example/` after the new domain is working.

## Business and legal status
- SWAYMARK is currently a trading name operated by Janus Oosthuizen as an individual in South Africa, not a registered company. Do not claim (Pty) Ltd or invent company/VAT numbers.
- Site only accepts enquiries, not paid online orders or binding contracts. Agree client scope and commercial terms in a separate signed or accepted written agreement.
- Before paid client projects or incorporation, confirm appropriate business contact details, regulatory obligations, name clearance and a separate written service agreement.

## SEO submission
In Google Search Console create and verify the URL-prefix property `https://swaymark.pages.dev/` and submit `sitemap.xml`. The sitemap lists the Cloudflare Pages clean URLs (`/services`, `/work`, `/about`, `/contact`, `/privacy`, `/terms`). The Pages root robots.txt advertises the sitemap. This is a migration from an already-indexed GitHub Pages site; verify indexing and canonical selection over time, and arrange server-side redirects from any old public address where feasible.

## SWAYMARK Business Hub
The working device-only prototype is at https://swaymark.pages.dev/hub/. The new independent cloud app is at https://swaymark.pages.dev/app/ and requires a separate SWAYMARK-owned Supabase project before real use. See app/README.md for setup and security requirements. No Clean Carpets & Pest Control Perth database is connected to the SWAYMARK app.
