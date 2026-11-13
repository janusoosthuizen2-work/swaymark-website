#!/usr/bin/env python3
"""Update absolute URL references after purchasing a custom domain.
Usage: python tools/prepare_launch.py --url https://www.yourdomain.co.za/
Run this only when the destination URL is already configured to serve the website.
"""
import argparse, json, re
from pathlib import Path
from urllib.parse import urlsplit
from html import escape
ROOT=Path(__file__).resolve().parent.parent
OLD="https://janusoosthuizen2-work.github.io/swaymark-website/"
PAGES=["index.html","services.html","work.html","about.html","contact.html","privacy.html","terms.html"]
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--url",required=True)
    args=parser.parse_args()
    base=args.url.strip().rstrip("/")+"/"
    parsed=urlsplit(base)
    if parsed.scheme!="https" or not parsed.netloc or parsed.query or parsed.fragment or ".." in parsed.path:
        parser.error("A valid published HTTPS website URL is required.")
    if "yourdomain" in base or "example.com" in base: parser.error("Use your actual published URL.")
    urls=[base+("" if p=="index.html" else p) for p in PAGES]
    for p in PAGES:
        path=ROOT/p
        html=path.read_text(encoding="utf-8").replace(OLD,base)
        path.write_text(html,encoding="utf-8")
    date=__import__("datetime").date.today().isoformat()
    xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml+=''.join(f'<url><loc>{escape(url)}</loc><lastmod>{date}</lastmod></url>\n' for url in urls)
    (ROOT/"sitemap.xml").write_text(xml+'</urlset>\n',encoding="utf-8")
    (ROOT/"robots.txt").write_text('User-agent: *\nAllow: /\nSitemap: '+base+'sitemap.xml\n',encoding="utf-8")
    print("Updated all page URL references, sitemap and robots for:",base)
if __name__=="__main__": main()