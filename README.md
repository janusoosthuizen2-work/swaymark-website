# SWAYMARK | Website Development, SEO and Digital Marketing

Professional, fast, accessible seven-page static business website for SWAYMARK.

## Website
- Primary public URL: https://swaymark.pages.dev/
- Legacy site (remains online, now advertises Pages as canonical): https://janusoosthuizen2-work.github.io/swaymark-website/
- Separate temporary Worker alias: https://swaymark.janusoosthuizen2.workers.dev/
- Primary free hosting: Cloudflare Pages, built from GitHub main branch, repository root
- Legacy hosting: GitHub Pages remains active for existing visitors
- Business enquiries: janusoosthuizen2@gmail.com and 070 434 7735 (both public)
- Contact form: prepares an email draft; does not send data from the site or guarantee delivery.
- No third-party JavaScript, cookies, tracking pixels, paid fonts or advertising libraries.
- SEO: unique metadata, canonical URLs, JSON-LD, sitemap.xml, index/follow. Search Console verification and sitemap submission still require a verified site owner.

## Included pages
Home, Services, Selected Work, About, Contact, Privacy, Terms.

## Work safely
- Keep any client examples labelled honestly. Ask permission before displaying client work, logos, proprietary data or quantified results.
- SWAYMARK is not yet confirmed as a legally available mark. Check the relevant company-registration and trademark records wherever you intend to operate before registering or investing in the brand.
- Privacy and Terms pages are practical drafts; review for all applicable privacy, consumer and contractual obligations before relying on them as legal documents.
- No provider can guarantee 100/100 Lighthouse in every environment, or a particular Google ranking/indexing date.

## Preview/test
From this directory run `python -m http.server 8000` then browse http://127.0.0.1:8000.
For new domain hosting, update canonical references with `python tools/prepare_launch.py --url https://your-actual-domain.example/` after the new domain is working.

## SEO submission
In Google Search Console create and verify the URL-prefix property `https://swaymark.pages.dev/` and submit `sitemap.xml`. The sitemap lists the Cloudflare Pages clean URLs (`/services`, `/work`, `/about`, `/contact`, `/privacy`, `/terms`). The Pages root robots.txt advertises the sitemap. This is a migration from an already-indexed GitHub Pages site; verify indexing and canonical selection over time, and arrange server-side redirects from any old public address where feasible.