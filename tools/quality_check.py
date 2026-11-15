#!/usr/bin/env python3
"""Zero-dependency checks for our static SWAYMARK website. Run from repo root."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent.parent
PAGES=['index.html','services.html','work.html','about.html','contact.html','privacy.html','terms.html']

class Page(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.tags=[]
  self.links=[]
  self.images=[]
  self.ids=set()
  self.heading=0
  self.scripts=[]
  self._in_ld=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  self.tags.append((tag,a))
  if 'id' in a:self.ids.add(a['id'])
  if tag=='h1':self.heading+=1
  if tag=='a' and 'href' in a:self.links.append(a['href'])
  if tag=='img':self.images.append(a)
  if tag=='script' and a.get('type')=='application/ld+json': self._in_ld=True
 def handle_data(self,data):
  if self._in_ld:self.scripts.append(data)
 def handle_endtag(self,tag):
  if tag=='script':self._in_ld=False

def tags(page,name,value):
 return [a for t,a in page.tags if t==name and (value is None or all(a.get(k)==v for k,v in value.items()))]

def main():
 errors=[]
 def req(condition,message):
  if not condition:errors.append(message)
 pages={}
 titles=set()
 descriptions=set()
 for path in PAGES:
  s=(ROOT/path).read_text(encoding='utf-8')
  parser=Page();parser.feed(s);pages[path]=parser
  req(parser.heading==1,path+': needs exactly 1 H1')
  req(len(tags(parser,'main',None))==1,path+': main landmark')
  req(len(tags(parser,'title',None))==1,path+': title')
  desc_tags=tags(parser,'meta',{'name':'description'})
  req(len(desc_tags)==1,path+': description')
  if desc_tags:
   desc=desc_tags[0].get('content','').strip()
   req(70<=len(desc)<=170,path+': SEO description should be concise (70-170 chars)')
   req(desc not in descriptions,path+': duplicate SEO description')
   descriptions.add(desc)
  title_match=re.search(r'<title>(.*?)</title>',s,re.DOTALL|re.IGNORECASE)
  if title_match:
   title=title_match.group(1).strip()
   req(title not in titles,path+': duplicate SEO title')
   titles.add(title)
  req(len(tags(parser,'meta',{'name':'robots'}))==1,path+': robots')
  req('noindex' not in s.lower(),path+': indexing disabled')
  req('tel:0704347735' in s,path+': public phone link missing')
  req('south africa' not in s.lower() and 'en-za' not in s.lower() and 'en_za' not in s.lower(),path+': location-specific marketing content found')
  req(len(tags(parser,'link',{'rel':'canonical'}))==1,path+': canonical')
  req(len(tags(parser,'meta',{'property':'og:image'}))==1,path+': OG image')
  req(len(tags(parser,'meta',{'property':'og:url'}))==1,path+': OG url')
  req(len(parser.scripts)==1,path+': one JSON-LD block')
  try:json.loads(parser.scripts[0])
  except (IndexError,ValueError):errors.append(path+': bad structured data')
  for im in parser.images:
   req(all(k in im for k in ('src','alt','width','height')),path+': image needs alt/dimensions')
   req((ROOT/im.get('src','')).is_file(),path+': missing image '+im.get('src',''))
 for path,parser in pages.items():
  for link in parser.links:
   if link.startswith(('https://','http://','mailto:','tel:')):continue
   part,_,fragment=link.partition('#')
   target=part.split('?')[0] or path
   req((ROOT/target).is_file(),path+': broken link '+link)
   if fragment and target in pages:req(fragment in pages[target].ids,path+': bad anchor '+link)
 base=tags(pages['index.html'],'link',{'rel':'canonical'})[0]['href']
 expected=[base if p=='index.html' else base+p.removesuffix('.html') for p in PAGES]
 for path,correct in zip(PAGES,expected):
  req(tags(pages[path],'link',{'rel':'canonical'})[0].get('href')==correct,path+': wrong canonical URL')
 xml=ET.parse(ROOT/'sitemap.xml').getroot()
 locs=[n.text for n in xml.iter() if n.tag.endswith('loc')]
 req(set(locs)==set(expected),'sitemap must list all seven canonical URLs')
 req((ROOT/'robots.txt').read_text().count('Sitemap: '+base+'sitemap.xml')==1,'robots.txt must advertise primary sitemap')
 req(all('janusoosthuizen2-work.github.io/swaymark-website/' not in (ROOT/p).read_text() for p in PAGES),'old GitHub URL remains in page metadata')
 req('janusoosthuizen2@gmail.com' in (ROOT/'assets/config.js').read_text(), 'business email missing')
 contact=(ROOT/'contact.html').read_text()
 req('action="https://formsubmit.co/janusoosthuizen2@gmail.com"' in contact,'form must use verified FormSubmit endpoint')
 req('method="POST"' in contact,'form must use native POST for reCAPTCHA fallback')
 req('name="_honey"' in contact,'form honeypot missing')
 req('name="_next" value="https://swaymark.pages.dev/thanks"' in contact,'form branded confirmation redirect missing')
 req('Send enquiry' in contact,'form button copy incorrect')
 req('Prepare my enquiry' not in contact,'old draft form messaging remains')
 req("data-enquiry-form" not in (ROOT/'assets/script.js').read_text(),'outdated JS form interception remains')
 req((ROOT/'thanks.html').is_file(),'thanks page missing')
 if (ROOT/'thanks.html').is_file():
  thanks=(ROOT/'thanks.html').read_text()
  req('<meta name="robots" content="noindex,follow">' in thanks,'thanks page must not be indexed')
  req('Thank you' in thanks,'thanks page needs a clear confirmation')
 privacy=(ROOT/'privacy.html').read_text()
 req('FormSubmit' in privacy and 'Cloudflare Pages' in privacy,'privacy notice must describe form processor and correct host')
 if errors:
  print('FAIL:')
  for e in errors:print('  -',e)
  raise SystemExit(1)
 print('PASS: seven pages, metadata, JSON-LD, canonicals, sitemap, linked assets, anchors and contact email.')
if __name__=='__main__':main()