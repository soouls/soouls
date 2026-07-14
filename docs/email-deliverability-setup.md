# Email Deliverability & Resend Setup Guide

This document outlines how to ensure maximum deliverability for emails sent from this application. We use **Resend** as our email API platform. The system is designed to adhere strictly to modern email security best practices.

## 1. Domain Authentication (SPF, DKIM, DMARC)

To prevent emails from landing in spam folders, your domain **must** be verified with the following DNS records.

### Resend Domain Verification
Run the setup script locally to register your domain with Resend:
```bash
npx tsx apps/backend/scripts/resend/setup-resend.ts
```
Then, go to the [Resend Dashboard](https://resend.com/domains) and copy the TXT/MX records into your DNS provider (Cloudflare, Route53, Vercel, etc.).

### DMARC Policy (Required by Google/Yahoo)
Even after verifying the domain in Resend, you must explicitly set a DMARC policy on your domain's root. Add the following TXT record to your DNS:

- **Type**: `TXT`
- **Name**: `_dmarc` (or `_dmarc.yourdomain.com`)
- **Content**: `v=DMARC1; p=none; rua=mailto:admin@yourdomain.com;`

*(Note: `p=none` is a safe starting point. Once you confirm emails are delivering correctly, you can upgrade to `p=quarantine` or `p=reject` for better security).*

## 2. API Key Scoping

Resend requires different API key permissions depending on the operation:

- **Sending Emails**: Can use a "Sending Only" key (`RESEND_API_KEY`).
- **Contacts, Segments, Events, Webhooks**: Require a **"Full Access"** key.

In our codebase, `ResendProvider` manages this automatically. For production, set:
- `RESEND_API_KEY`: A key restricted to "Sending emails" (for better security).
- `RESEND_AUTOMATION_API_KEY`: A key with "Full access" (used by the backend to sync contacts and trigger automation events).

## 3. Webhooks & Engagement Tracking

The backend listens to Resend Webhooks to sync bounce, complaint, and engagement data back to the database.

1. Go to **Resend Dashboard -> Webhooks**.
2. Add a new webhook pointing to your production URL: `https://api.yourdomain.com/notifications/webhooks/resend`.
3. Select **all** events (`email.sent`, `email.delivered`, `email.bounced`, `email.complained`, `email.opened`, etc.).
4. Copy the **Signing Secret**.
5. Set `RESEND_WEBHOOK_SECRET` in your production environment variables.

Our webhook handler automatically:
- Marks users as unsubscribed if they report spam (`email.complained`).
- Marks hard bounces (`email.bounced`) as failed.
- Records opens and clicks to measure campaign effectiveness.

## 4. Automations & Onboarding Sequence

We use Resend's native Automations feature rather than building complex cron jobs in the backend.

1. Run the setup script to register the `user.signed_up` event schema:
   ```bash
   npx tsx apps/backend/scripts/resend/setup-resend.ts
   ```
2. Go to **Resend Dashboard -> Automations**.
3. Create a new automation triggered by `user.signed_up`.
4. You can build your onboarding sequence directly in the Resend dashboard.
5. In your templates, you can use the event payload variables we send (e.g., `{{firstName}}`, `{{dashboardUrl}}`, `{{calendlyLink}}`).

## 5. Marketing vs. Transactional Channels

Our system separates marketing and transactional emails based on user opt-in preferences.
- **Transactional**: Password resets, secure access links, receipts. These bypass marketing opt-outs.
- **Marketing**: Campaigns, newsletters, onboarding automations.

Marketing emails automatically include a **List-Unsubscribe** header (One-Click Unsubscribe) which is mandatory for bulk senders according to Gmail/Yahoo guidelines.
