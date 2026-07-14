# Soouls Email System — Build Brief for Claude Code

*Paste this directly into Claude Code to build the system it describes. A ready-to-use kickoff prompt is at the end.*

---

## 0. What this system is, in one paragraph

A reliable transactional email layer for Soouls, built on Resend, that sits behind a queue rather than calling Resend directly from request handlers. Every send is idempotent, rate-limit-aware, retried with backoff on transient failure, and tracked end-to-end via Resend's webhooks so bounces and complaints update user state automatically instead of silently piling up. The design goal is specific: **nothing should ever crash a user-facing request because an email failed to send**, and **nobody should ever get the same email twice** because of a retry.

---

## 1. Why the queue-first architecture, specifically

Resend's default rate limit is low — historically 2 requests/second per account, with newer accounts seeing up to 5/sec, and this can change without much warning. Calling Resend synchronously from an API route (e.g., inside your signup handler) means:
- A slow Resend response makes the user's signup request slow too
- Any burst of signups (or a digest send to thousands of users) will hit 429s immediately
- A failed send has nowhere to retry from — it's just gone

**The fix:** every email send is a background job, never a direct API call from a request handler. The request handler enqueues a job and returns immediately; a worker with a rate limiter drains the queue at a safe, sustained pace.

```
Request handler (e.g. POST /signup)
   │
   ▼
enqueue("send-email", { template, to, data, idempotencyKey })
   │  ← returns immediately, does not wait on Resend at all
   ▼
[Email Queue] — worker pulls jobs at a rate-limited pace
   │
   ▼
Resend API call (batched where possible, section 5)
   │
   ▼
EmailLog row updated with Resend message ID + status
   │
   ▼
(later, async) Resend webhook → delivered/bounced/complained → EmailLog + SuppressionList updated
```

---

## 2. Core reliability principles — non-negotiable

1. **Idempotency keys on every send.** Every enqueued email job carries a deterministic idempotency key (e.g. `welcome-email:{userId}`, `sunday-review:{userId}:{weekOf}`). Before sending, check `EmailLog` for an existing row with that key in a non-failed state — if found, skip. This is what prevents double-sends on retry or duplicate job enqueuing.

2. **Respect Resend's actual rate limit dynamically, don't hardcode a number.** Resend returns rate-limit headers on every response — read them and adjust the worker's concurrency/delay rather than trusting a number written into code that Resend can change.

3. **Exponential backoff on transient failures only.** A 429 or 5xx should retry (backoff: 1s, 5s, 30s, 5min, then dead-letter). A 4xx validation error (bad email format, missing required field) should NOT retry — it will never succeed, and retrying just wastes queue capacity and delays the dead-letter alert that would actually surface the bug.

4. **Dead-letter queue with alerting, not silent failure.** After the final retry attempt, move the job to a dead-letter queue and fire an internal alert (Slack webhook, PagerDuty, whatever the team already uses) — a failed password-reset email is a support ticket waiting to happen, not something to quietly drop.

5. **Batch wherever the send pattern allows it.** Resend's Batch API accepts up to 100 emails per request, and a batch call only counts as **one** request against the rate limit — this is the difference between "Sunday Review digest to 10,000 users" taking hours vs. minutes. Use it for anything sent to multiple users at once; never use it for anything that needs per-recipient error handling to be immediately actionable (see section 6 on why digests and password resets are architected differently).

6. **Treat bounce rate and spam-complaint rate as production SLOs, not afterthoughts.** Resend requires bounce rate under 4% and spam-complaint rate under 0.08% — exceeding either can pause your entire sending account, not just the offending email. Build the monitoring in section 9 before you need it, not after an incident.

---

## 3. Email inventory — every type Soouls actually needs

| Category | Email | Trigger | User can opt out? |
|---|---|---|---|
| **Auth** | Verify email | Signup | No |
| **Auth** | Welcome | Email verified | No (one-time) |
| **Auth** | Password reset code | User requests reset | No |
| **Auth** | Password changed confirmation | Password successfully changed | No |
| **Auth** | New device / new login alert | Login from unrecognized device | Yes, in Settings (not recommended to disable) |
| **Billing** | Subscription confirmed | Successful checkout | No |
| **Billing** | Payment failed | Failed renewal charge | No |
| **Billing** | Renewal reminder | 3 days before annual renewal | Yes |
| **Billing** | Cancellation confirmed | User cancels plan | No |
| **Billing** | Refund confirmed | Refund processed | No |
| **Product** | Sunday Review ready | Weekly, per section 8 of the Wiki Layer brief | Yes |
| **Product** | Re-engagement nudge | No entry in 14+ days | Yes, and off by default — see note below |
| **Account** | Data export ready | Export job completes | No (transactional, one-time per request) |
| **Account** | Account deletion confirmed | Deletion request processed | No |

**Note on re-engagement emails specifically:** given everything this product stands for — private, non-judgmental, no streak-shaming — a "we miss you" email is exactly the kind of thing that can undercut the brand if it reads as guilt-tripping. Ship it **off by default**, opt-in only, and have a human (not just an LLM) review the copy before it ships. This is the email-system equivalent of the lint pass caution from the Wiki Layer brief — same category of risk, same reason to be conservative.

---

## 4. Data schema

```prisma
model EmailLog {
  id              String   @id @default(cuid())
  userId          String
  idempotencyKey  String   @unique   // e.g. "welcome-email:{userId}"
  templateName    String              // "welcome" | "password-reset" | "sunday-review" | ...
  status          String              // queued | sent | delivered | bounced | complained | failed
  resendMessageId String?
  attempts        Int      @default(0)
  lastError       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model EmailPreference {
  id                    String  @id @default(cuid())
  userId                String  @unique
  productDigests        Boolean @default(true)   // Sunday Review, etc.
  billingReminders       Boolean @default(true)
  reEngagementNudges    Boolean @default(false)  // explicitly opt-in, off by default
  securityAlerts        Boolean @default(true)    // strongly discouraged from disabling; UI should say so
}

model EmailSuppression {
  id            String   @id @default(cuid())
  email         String   @unique
  reason        String       // "hard_bounce" | "complaint" | "manual_unsubscribe"
  suppressedAt  DateTime @default(now())
}
```

**Every send must check `EmailSuppression` before enqueueing, not just before calling Resend.** A suppressed address should never even generate a queue job — this keeps the suppression check as close to the trigger as possible and avoids wasted queue capacity.

---

## 5. Sending architecture — worker implementation

Use the same job queue already chosen for the Wiki Layer's enrichment pipeline (BullMQ + Redis, or `pgboss` — see that brief, section 10) rather than introducing a second queue technology for email specifically.

```ts
// Queue: "email"
// Concurrency: 1 worker process, internal rate limiter set below Resend's current
// advertised limit (read from response headers at runtime, start conservative at 2/sec)

async function processEmailJob(job: EmailJob) {
  const existing = await db.emailLog.findUnique({ where: { idempotencyKey: job.idempotencyKey } });
  if (existing && existing.status !== "failed") return; // already handled, skip silently

  const suppressed = await db.emailSuppression.findUnique({ where: { email: job.to } });
  if (suppressed) {
    await db.emailLog.upsert({
      where: { idempotencyKey: job.idempotencyKey },
      create: { ...job, status: "skipped_suppressed" },
      update: { status: "skipped_suppressed" },
    });
    return;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESSES[job.templateName],
      to: job.to,
      subject: job.subject,
      react: renderTemplate(job.templateName, job.data),
      headers: { "List-Unsubscribe": buildUnsubscribeHeader(job.userId, job.templateName) },
    });

    await db.emailLog.upsert({
      where: { idempotencyKey: job.idempotencyKey },
      create: { ...job, status: "sent", resendMessageId: result.data?.id },
      update: { status: "sent", resendMessageId: result.data?.id, attempts: { increment: 1 } },
    });
  } catch (err) {
    const isTransient = err.statusCode === 429 || err.statusCode >= 500;
    await db.emailLog.upsert({
      where: { idempotencyKey: job.idempotencyKey },
      create: { ...job, status: "failed", lastError: String(err), attempts: 1 },
      update: { status: "failed", lastError: String(err), attempts: { increment: 1 } },
    });
    if (isTransient) throw err; // let the queue's retry/backoff handle it
    // 4xx validation errors: do not rethrow — this will never succeed on retry
  }
}
```

**Batched sends (digests, e.g. Sunday Review to all users on a given day):** don't route these through the same per-user job pattern above — build a distinct batch job that chunks recipients into groups of 100, calls `resend.batch.send()` once per chunk, and writes 100 `EmailLog` rows per successful chunk response. This is the pattern from section 2, point 5 — one API call, 100 emails, one rate-limit hit.

---

## 6. Webhook handling — the other half of reliability

Resend delivers events (`email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.opened`, `email.clicked`) to a webhook endpoint you register. Two rules that matter more than they sound:

1. **Respond `200` immediately, then process asynchronously.** Never do a database write inside the webhook handler's synchronous response path — accept the payload, enqueue a job to process it, return 200. A slow webhook handler risks Resend's own retry/backoff logic kicking in and duplicating event delivery.
2. **Verify the webhook signature before trusting the payload.** Resend signs webhook payloads — validate this in the handler before enqueueing anything, or you've built an unauthenticated endpoint that can write arbitrary bounce/complaint records into your database.

```ts
// POST /webhooks/resend
async function handleResendWebhook(req, res) {
  if (!verifyResendSignature(req)) return res.status(401).send();
  await enqueue("process-email-event", req.body);   // hand off, don't process inline
  return res.status(200).send();                     // ack immediately
}

// Worker for "process-email-event"
async function processEmailEvent(event) {
  await db.emailLog.updateMany({
    where: { resendMessageId: event.data.email_id },
    data: { status: event.type.replace("email.", "") },
  });

  if (event.type === "email.bounced" && event.data.bounce_type === "hard") {
    await db.emailSuppression.upsert({
      where: { email: event.data.to },
      create: { email: event.data.to, reason: "hard_bounce" },
      update: {},
    });
  }
  if (event.type === "email.complained") {
    await db.emailSuppression.upsert({
      where: { email: event.data.to },
      create: { email: event.data.to, reason: "complaint" },
      update: {},
    });
  }
}
```

---

## 7. Template system

Use React Email for templates — it's the templating approach Resend is built around, gives you real component reuse (a shared header/footer, a shared button component) instead of copy-pasted HTML strings, and can be previewed locally without sending real emails.

**Recommended structure:**
```
/emails
  /components
    Layout.tsx           // shared header, footer, unsubscribe link slot
    Button.tsx
  /templates
    Welcome.tsx
    PasswordReset.tsx
    SundayReview.tsx
    PaymentFailed.tsx
    ...one file per row in section 3's table
```

Every template should render both an HTML and a plain-text version — Resend accepts both, and plain-text fallback matters more than it seems for deliverability and for the subset of users on clients that render it preferentially.

---

## 8. Domain & deliverability setup

- Verify a dedicated sending subdomain in Resend (e.g. `mail.soouls.in`), not the root domain — this isolates transactional sending reputation from anything else ever sent from `soouls.in` (marketing tools, personal email, etc.).
- Configure SPF, DKIM, and DMARC records exactly as Resend's domain verification flow specifies — don't skip DMARC even though it's the one most guides treat as optional; it materially affects inbox placement at Gmail/Yahoo post-2024 sender requirements.
- Keep transactional sends (this whole brief) on a separate Resend domain/API key from any future marketing broadcast sends, if Soouls ever adds a newsletter — mixing the two on one sending identity means a marketing campaign's complaint rate can degrade deliverability for password-reset emails, which is exactly the kind of failure mode section 2's reliability principles are meant to prevent.

---

## 9. Monitoring — treat Resend's hard limits as alertable SLOs

Set up alerting (a scheduled job checking Resend's metrics API, or processing webhook events into a rolling counter) for:
- Bounce rate approaching 4% (alert well before, e.g. at 2%, since account pausing is a hard stop, not a warning)
- Spam-complaint rate approaching 0.08% (alert at 0.04%)
- Dead-letter queue depth > 0 for any auth or billing email specifically (these are the categories where a silent failure becomes a support ticket fastest)
- Any sustained 429 rate suggesting the worker's internal rate limiter needs adjusting downward

---

## 10. Build phases

**Phase 1 — foundation, auth emails only**
`EmailLog`, `EmailSuppression`, the queue worker with idempotency + backoff, Resend domain setup, and just the auth email category (verify, welcome, password reset, password changed). No webhook handling yet, no digests. Prove the reliability primitives work before adding volume.

**Phase 2 — webhooks & suppression**
Build the webhook endpoint, signature verification, bounce/complaint → suppression pipeline. Backfill: re-check Phase 1's sent emails against the new suppression list.

**Phase 3 — billing emails**
Add the billing category, wired to your payment provider's webhooks (Razorpay/Stripe per the earlier pricing build-out) as the trigger source.

**Phase 4 — batched product digests**
Sunday Review email, using the Batch API and `EmailPreference` opt-outs. This is the first email type in the whole system sent to many users at once — don't build the batch-chunking logic (section 5) until this phase actually needs it.

**Phase 5 — re-engagement, off by default**
Ship last, ship disabled, get copy reviewed by a human before enabling for any real user.

---

## Kickoff prompt — paste this to Claude Code to start

```
Read the attached build brief in full (Soouls Email System — Build Brief).

We're building Phase 1 first: auth emails only (verify, welcome, password reset,
password changed), with the full reliability layer (idempotency, retries,
suppression checks) — no webhooks yet, no billing or digest emails yet.

Before writing code:
1. Confirm which job queue library is already in use elsewhere in this repo
   (check the Wiki Layer build if it's been implemented) and reuse it rather
   than introducing a new one.
2. Show me the exact Prisma migration for EmailLog, EmailPreference, and
   EmailSuppression based on section 4.
3. Show me the React Email template structure you'll set up per section 7,
   with just the Welcome template fully built as a worked example.

Then implement Phase 1 end to end: the migration, the queue worker with
idempotency-key checking and exponential backoff exactly as described in
section 5, and the four auth email templates. Include a small test script
that enqueues each of the four emails against a real (but test-only) address
so we can verify delivery and check the EmailLog rows before moving to
Phase 2.
```
