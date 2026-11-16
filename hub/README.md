# SWAYMARK Business Hub · Prototype 0.1

This folder is an **independent, local-only demonstration workspace** for SWAYMARK. It is not part of Clean Carpets & Pest Control Perth's Team Hub or Supabase project.

## Access
- After the Cloudflare Pages deployment completes: https://swaymark.pages.dev/hub/
- You can install it to your phone or desktop from a compatible browser as a PWA.
- The public business site is unaffected. The prototype has \`noindex,nofollow\`, and is not linked in public navigation.

## Features
- Dashboard overview of enquiries, outstanding quotes, bookings, tasks, projects and payments recorded.
- CRUD for enquiries, clients, quotes, bookings, projects, tasks and finance records.
- Convert an enquiry into a client.
- Print quote draft from the browser.
- Client/project associations.
- Search and filter records.
- Sample data loading, currency display, JSON backup/restore and local reset.
- Responsive SWAYMARK styling, accessible form labels and mobile navigation.
- No trackers, third-party scripts, external fonts or runtime API calls.

## IMPORTANT: No client data or passwords
There is **no authentication, server data storage or remote backup**. Records persist in browser \`localStorage\` on one device and can be read or lost by anyone with access to that browser profile. This must **not** be treated as a secure CRM. Use **sample or non-sensitive information only**. The public website FormSubmit contact form still emails enquiries to the existing inbox; enquiries do not automatically enter this prototype. Quotes are templates and not tax invoices; finance is not a financial accounting system.

## Next production phase
1. Set up a **separate SWAYMARK** database project in an SWAYMARK-controlled organization. Do not repurpose the CCPC Supabase system.
2. Implement private authentication, fine-grained row-level security, secure backups and server-side validation.
3. Create a server-side form submission pipeline with spam protection and consent/disclosure, then migrate the existing contact form after verified end-to-end testing.
4. Implement an audit trail, invoicing/quote reference numbering, data retention, robust access recovery and accounting/legal review.
5. Test mobile/desktop flows, accessibility, backup recovery, and data protection before real client use.

The service worker caches only static app shell assets for offline fallback, not submissions or user data.
