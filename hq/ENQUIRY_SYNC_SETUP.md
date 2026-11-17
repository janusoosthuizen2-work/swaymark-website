# SWAYMARK HQ — automatic website enquiry syncing

Status: **prepared and deployed, but not activated** (17 November 2026). Do not claim that form enquiries reach HQ until the Turnstile credentials and a live end-to-end test have succeeded.

## How it works
- Public website contact form remains a normal FormSubmit.co email form targeting `swaymark.studio@gmail.com`. FormSubmit needs one-time activation for that new recipient.
- Once enabled, `assets/enquiry-sync.js` verifies visitors with Cloudflare Turnstile and posts the same enquiry to Supabase Edge Function `swaymark-public-enquiry`.
- The function checks origin, content, form fields, required acknowledgement and the single-use Turnstile token server-side before writing a record as kind `enquiries` in `public.swaymark_items`.
- It stores the message under `notes` so SWAYMARK HQ displays it, marks source `Website`, and sets status `New`.
- Even if the app sync fails, the browser submits the original form through FormSubmit.co for email delivery. If the email provider fails, a successful HQ record can still exist; the two channels should be tested.
- SWAYMARK HQ automatically checks for newly added enquiries roughly every 60 seconds while the workspace is visible and signed in.

## One-time activation — no service keys in GitHub

1. In Cloudflare dashboard, select **Turnstile**. Create a **Managed** Turnstile widget for hostname `swaymark.pages.dev`, matching the production website where the form is served. Note its **site key** (public) and **secret key** (private). If the website domain changes, update the allowed origin and hostname in the Edge Function and retest.
2. In the Supabase project **janus-personal-finance** (now used as SWAYMARK HQ backend), go to **Edge Functions > Secrets**. Add the secret named `SWAYMARK_TURNSTILE_SECRET` using the **private** Turnstile secret. The Edge Function reads Supabase's own server-side admin key automatically. NEVER commit either secret to GitHub or share it in chat.
3. In GitHub, edit `assets/config.js`:
   ```js
   hqSync: { enabled: true, siteKey: 'PASTE_PUBLIC_CLOUDFLARE_SITE_KEY_HERE' }
   ```
   Only the public Turnstile site key goes into that file. Commit to `main` and verify the Pages deployment. The contact form already loads `assets/enquiry-sync.js` when configured.
4. Visit the public contact page and complete one test enquiry with a safe test contact name/email (no genuine customer data yet). Verify the new Gmail recipient has accepted the FormSubmit activation email if prompted. Check:
   - FormSubmit emails the message to `swaymark.studio@gmail.com`;
   - the new enquiry appears in `https://swaymark.pages.dev/hq/` under Enquiries, source **Website**, status **New**, with the full message in Notes;
   - the same lead appears when the HQ page is refreshed on another signed-in device;
   - no duplicates, broken redirects, or browser console errors.
5. Test the fallback: disable the integration temporarily by changing `enabled` back to `false` and confirm email still works; then restore `true` after successful testing. Re-check website Privacy Notice / POPIA requirements before real client use.

## Security and troubleshooting
- This endpoint intentionally uses `verify_jwt = false` to accept public forms but **requires** a Turnstile token checked with the private server-side secret; it fails closed without a configured secret. Do not bypass these checks.
- The browser never receives Supabase service-role keys. The `swaymark_items` table continues to enforce owner-scoped RLS for signed-in users and denies anonymous direct table access.
- No password or API key should be saved in Enquiries, Websites or the public form.
- If no new enquiry arrives in HQ, inspect the browser network response from `/functions/v1/swaymark-public-enquiry`, the Supabase Edge Function logs and configured Turnstile hostname/action. Confirm `assets/config.js` is enabled and deployed.
- FormSubmit.co requires re-activating the receiving address when changing it; check inbox/spam for activation.
- The `functions/api/enquiry.js` Cloudflare Pages endpoint is an **older, unused** alternative and is not the active integration. Keep it disabled unless specifically reviewed and configured.
- The public-facing privacy notice discloses FormSubmit, secure Supabase storage when activated, retention and international processing.
- Real customer data requires review of POPIA-compliant data processing, retention, backups and access controls.

## Sources
- Supabase Edge Function: `supabase/functions/swaymark-public-enquiry/index.ts`
- Public form: `contact.html`; client mirroring: `assets/enquiry-sync.js`
- Public configuration: `assets/config.js`
- HQ: `hq/app.js`
- Supabase: `glopetsbjaoxutjghgdo`
