#!/usr/bin/env python3
"""Prepare the static template for public indexing when you know its final HTTPS URL.

Example: python tools/prepare_launch.py --url https://yourdomain.co.za/
For a GitHub project Pages URL include the project path:
    python tools/prepare_launch.py --url https://janusoosthuizen2-work.github.io/swaymark-website/

Can be rerun when the canonical URL changes. Does not submit the site to search engines.
"""
import argparse
from datetime import datetime, timezone
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlparse

SITE = Path(__file__).resolve().parent.parent
PAGES = ['index.html', 'services.html', 'work.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html']

def main():
    ap = argparse.ArgumentParser(description='Prepare Swaymark site for public SEO indexing')
    ap.add_argument('--url', required=True, help='Final website address including https:// and path if any')
    args = ap.parse_args()
    base = args.url.strip().rstrip('/') + '/'
    parts = urlparse(base)
    if (parts.scheme != 'https' or not parts.netloc or parts.query or parts.fragment or '..' in parts.path):
        ap.error('Provide an HTTPS website URL such as https://yourdomain.co.za/')
    if parts.hostname in {'example.com', 'yourdomain.co.za', 'your-domain.com'} or 'YOUR-' in base:
        ap.error('Replace example domains with the actual public website URL before launching.')
    config = (SITE / 'assets/config.js').read_text(encoding='utf-8')
    if re.search(r"businessEmail:\s*''", config):
        ap.error('First set the approved public businessEmail in assets/config.js (required for client enquiries).')
    if re.search(r"instagramUrl:\s*''", config):
        print('NOTE: Instagram profile not set. The social link will fall back to the contact page.')
    for p in PAGES:
        path = SITE/p
        html = path.read_text(encoding='utf-8')
        url = base + ('' if p == 'index.html' else p)
        html = re.sub(r'<link rel="canonical"[^>]*>', '', html)
        html = re.sub(r'<meta property="og:url"[^>]*>', '', html)
        html = re.sub(r'<script type="application/ld\+json" data-launch-schema>.*?</script>', '', html, flags=re.S)
        html = re.sub(r'<meta name="robots" content="[^"]+" data-launch-robots>', '<meta name="robots" content="index,follow" data-launch-robots>', html)
        html = re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")[^"]+(" data-launch-image>)', r'\g<1>'+escape(base+'assets/og-cover.png',quote=True)+r'\2', html)
        schema = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': re.search(r'<title>(.*?)</title>', html).group(1),
            'url': url,
            'isPartOf': {'@type': 'WebSite', 'name': 'Swaymark', 'url': base},
        }
        if p == 'index.html':
            schema = {'@context': 'https://schema.org', '@graph': [
                {'@type': 'WebSite', 'name': 'Swaymark', 'url': base, 'description':'Website development, SEO, marketing and ongoing support by Janus.'},
                {'@type': 'Person', 'name':'Janus Oosthuizen', 'url': base, 'jobTitle':'Website and Digital Marketing Specialist', 'knowsAbout':['Website design', 'Website maintenance', 'Search engine optimization', 'Digital marketing']},
                schema,
            ]}
        social = f'<link rel="canonical" href="{escape(url,quote=True)}">\n<meta property="og:url" content="{escape(url,quote=True)}">\n<script type="application/ld+json" data-launch-schema>{json.dumps(schema,separators=(",", ":"),ensure_ascii=False)}</script>\n'
        html = html.replace('</head>', social+'</head>')
        path.write_text(html,encoding='utf-8')
    lastmod=datetime.now(timezone.utc).strftime('%Y-%m-%d')
    locs='\n'.join(f'  <url><loc>{escape(base + ("" if p=="index.html" else p))}</loc><lastmod>{lastmod}</lastmod></url>' for p in PAGES)
    (SITE/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+locs+'\n</urlset>\n',encoding='utf-8')
    (SITE/'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {base}sitemap.xml\n', encoding='utf-8')
    print(f'Prepared {len(PAGES)} pages for {base}. Canonicals, Open Graph URLs, JSON-LD, sitemap and robots.txt added.')
    print('Next: publish, verify live URLs, test PageSpeed & forms, and submit sitemap in Search Console.')

if __name__ == '__main__': main()