# SWAYMARK — Digital Marketing & Website Development

A professional static website for SWAYMARK, founded by Janus Oosthuizen.

## Local preview

Open `index.html` directly in your browser, or run `python -m http.server 8000` and visit `http://localhost:8000`.

## Important before launch

1. Add an approved public business email to `assets/config.js`. The contact form uses the visitor's email application; it does **not** directly submit messages to a server.
2. Replace `noindex,nofollow` only after the website is final and launched, by running `python tools/prepare_launch.py --url https://YOUR-EXACT-WEBSITE-URL/`.
3. Confirm SWAYMARK brand and trademark/domain clearance, review the Privacy and Terms text, and obtain permissions for any client portfolio work.
4. Add an actual 1200×630 OG image and update its metadata; placeholder social image references have been removed.
5. Review each page's contact details, accessibility, SEO, device rendering and internal links.

## GitHub Pages

In GitHub, open **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. The site can be hosted at `https://janusoosthuizen2-work.github.io/swaymark-website/` once Pages deployment has finished. SEO indexing remains disabled until launch preparation is done.

## Services

Websites, maintenance, technical SEO, digital marketing, social media content and analytics. No guaranteed ranking claims. The business is independent of personal social profiles.
