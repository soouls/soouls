# Email Setup & Deliverability Guide

This guide contains the core principles and infrastructure setup for the Soouls email and messaging system.

## Resend Infrastructure
The system uses [Resend](https://resend.com) as its core email and automation provider. We follow specific architectural guidelines derived from Resend's best practices.

### 1. SDK Usage & API Keys
Always use the `ResendProvider` (`apps/backend/src/notifications/resend.provider.ts`) instead of instantiating `new Resend(key)` directly.
- **`resend.sending`**: Used exclusively for sending emails via `resend.emails.send()`. This relies on `RESEND_API_KEY` which should be scoped as "Sending Only" in production.
- **`resend.contacts`**: Used for all management tasks (Contacts, Events, Webhooks verification). This relies on `RESEND_AUTOMATION_API_KEY` which MUST be scoped as "Full Access".

### 2. Error Handling
The Resend Node.js SDK **does not throw exceptions**. It returns a `{ data, error }` tuple. Always explicitly check the `error` property.
```typescript
const { data, error } = await resend.emails.send({ ... });
if (error) {
  // handle error without try/catch
}
```

### 3. Idempotency & Retries
All programmatic emails MUST include an `idempotencyKey` to prevent duplicate emails during network retries.
```typescript
{ idempotencyKey: `campaign:email:${userId}:${campaignId}` }
```

## Deliverability Settings

### DNS Records (SPF, DKIM, DMARC)
A script is provided to streamline Resend domain verification:
```bash
npx tsx apps/backend/scripts/resend/setup-resend.ts
```
**CRITICAL**: You must manually configure a DMARC policy on your root domain to satisfy Google/Yahoo requirements:
```text
Name: _dmarc
Type: TXT
Content: v=DMARC1; p=none; rua=mailto:admin@yourdomain.com;
```

### List-Unsubscribe Header
All marketing and non-transactional emails automatically include a `List-Unsubscribe` header to enable "One-Click Unsubscribe" in modern email clients. This dramatically reduces spam complaints.

## Webhooks

We track engagement and delivery lifecycle events via Resend Webhooks. 
Endpoint: `POST /notifications/webhooks/resend`

The system automatically manages:
- **Bounces (`email.bounced`)**: Permanently marks the recipient as `failed` and opts them out of all emails.
- **Complaints (`email.complained`)**: Opts the recipient out of marketing emails.
- **Delivery (`email.delivered`)**: Confirms receipt.
- **Engagement (`email.opened`, `email.clicked`)**: Logs interactions.

*Note: Webhook verification relies on the `RESEND_WEBHOOK_SECRET` environment variable and requires the "Full Access" API key for signature validation.*

## Automations

Instead of hardcoding complex drip campaigns in the backend, we leverage **Resend Automations**.
1. When a user signs up, the backend triggers the `user.signed_up` event via `resend.events.send()`.
2. The event payload contains all necessary variables (e.g., `{{firstName}}`, `{{dashboardUrl}}`).
3. Drip sequences and onboarding emails are configured visually in the Resend Dashboard.

*This decouples our codebase from marketing logic.*
