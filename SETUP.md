# 🚀 Soouls Setup Guide

Complete setup reference for the Soouls monorepo.

## Prerequisites

- **Bun** v1.3+ ([bun.sh](https://bun.sh))
- **Node.js** v20+ (for NestJS CLI build steps)
- **PostgreSQL** (Neon serverless recommended)
- **Clerk** account (authentication)
- **Redis** (optional, for BullMQ notification queue)

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your actual values (see Environment Variables below)

# 3. Push database schema
cd packages/database
bun run db:push

# 4. Start all apps
cd ../..
bun run dev
```

This launches 3 apps simultaneously via Turborepo:
| App | URL | Description |
|-----|-----|-------------|
| **Frontend** | `http://localhost:3001` | Next.js user-facing app |
| **Backend** | `http://localhost:3000` | NestJS API server |
| **Admin Dashboard** | `http://localhost:3002` | SoulLabs Command Center |

## Monorepo Structure

```
soouls/
├── apps/
│   ├── frontend/          # Next.js 16 (user-facing)
│   ├── backend/           # NestJS + tRPC + BullMQ
│   └── admin-dashboard/   # SoulLabs Command Center (Next.js)
├── packages/
│   ├── database/          # Drizzle ORM schemas & client
│   ├── api/               # Shared tRPC router + rate-limiting
│   ├── ai-engine/         # AI prompts, embeddings, LLM
│   ├── logic/             # Pure functions (canvas calculations)
│   ├── ui-kit/            # Design system components
│   └── typescript-config/ # Shared TS configs
├── .env                   # Root env (shared by all apps)
├── turbo.json             # Turborepo pipeline
└── biome.json             # Linting & formatting
```

## Environment Variables

All apps read from the root `.env` file via `bun run --env-file=../../.env`.

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend publishable key |

### App URLs (Development defaults)

| Variable | Default |
|----------|---------|
| `BACKEND_URL` | `http://localhost:3000` |
| `FRONTEND_URL` | `http://localhost:3001` |
| `COMMAND_CENTER_URL` | `http://localhost:4000` |

### Observability (Optional but recommended)

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog product analytics |
| `LOG_LEVEL` | Pino log level (`info`, `debug`, `warn`) |

### Messaging & Notifications (Optional)

| Variable | Description |
|----------|-------------|
| `QSTASH_TOKEN` | Upstash QStash token for production notification jobs on Vercel |
| `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` | QStash webhook verification keys |
| `BACKEND_PUBLIC_URL` | Public backend URL that QStash, Resend, and Twilio can call |
| `REDIS_URL` | Local/worker BullMQ fallback queue |
| `RESEND_API_KEY` / `RESEND_WEBHOOK_SECRET` | Resend sending, contact sync, and webhook verification |
| `MESSAGING_FROM_EMAIL` / `MESSAGING_FROM_NAME` / `MESSAGING_REPLY_TO_EMAIL` | Verified sender and reply routing for Resend |
| `RESEND_ALL_USERS_SEGMENT_ID` / `RESEND_SIGNUPS_SEGMENT_ID` | Resend Segments for external broadcasts and automations |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Twilio messaging credentials |
| `TWILIO_MESSAGING_SERVICE_SID` / `TWILIO_WHATSAPP_FROM` | Preferred Messaging Service SID and fallback WhatsApp sender |
| `TWILIO_WELCOME_TEMPLATE_SID` | Approved Twilio Content Template SID for WhatsApp welcome messages |
| `TWILIO_VALIDATE_WEBHOOK_SIGNATURE` | Set to `true` to enforce Twilio status webhook signatures |

### Media & Billing (Optional)

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Cloudflare R2 storage |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe billing |

### Admin Bootstrap

| Variable | Description |
|----------|-------------|
| `COMMAND_CENTER_BOOTSTRAP_SUPER_ADMINS` | Comma-separated emails that auto-become Super Admins |

## Tech Stack

### Frontend
- **Next.js 16** (App Router + Turbopack)
- **React Three Fiber** — 3D galaxy visualization
- **TanStack Query v5** — data fetching & caching
- **tRPC v11** — end-to-end type safety
- **Tailwind CSS** + **Framer Motion** — styling & animations
- **Clerk** — authentication
- **Sentry** + **PostHog** — observability

### Backend
- **NestJS** on **Bun** runtime
- **tRPC v11** — type-safe API contract
- **Drizzle ORM** — PostgreSQL (Neon)
- **BullMQ** — background job processing (email, GDPR exports)
- **Pino** — structured logging
- **Sentry** — error monitoring
- **Helmet** — HTTP security headers

### Admin Dashboard (Command Center)
- **Next.js 16** — internal operations UI
- **Clerk RBAC** — role-based access (Super Admin, Engineer, Support)
- **Real-time WebSocket** — live telemetry via Socket.io
- **Recharts** — data visualization
- **cmdk** — global command palette (CMD+K)

### Shared Packages
- **@soouls/database** — Drizzle schema + client
- **@soouls/api** — tRPC router, rate-limiting, masquerade middleware
- **@soouls/ai-engine** — AI integration layer
- **@soouls/logic** — pure canvas calculation functions
- **@soouls/ui-kit** — design system

## Common Commands

```bash
bun run dev          # Start all apps (Turborepo)
bun run lint         # Biome lint & format check
bun run check-types  # TypeScript type checking

# Database
cd packages/database
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio
```

## Troubleshooting

**Backend exits with code 127:** Ensure Node.js is in your PATH — NestJS CLI requires `node`.

**Frontend `@sentry/nextjs` not found:** Run `bun install` from the repo root.

**Admin Dashboard `@sentry/profiling-node` error:** This package is only needed in the frontend app, not admin-dashboard.

**Database connection issues:** Verify `DATABASE_URL` in `.env`, ensure SSL mode is enabled for Neon.

---

## 🔑 External Services Guide

Follow these steps to acquire every API key needed for the `.env` file.

### 1. Database (Neon PostgreSQL)
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new project (PostgreSQL 16+).
3. On the dashboard dashboard, click **"Connection Details"**.
4. Copy the "Connection string".
5. Paste it as `DATABASE_URL` in `.env`.

### 2. Authentication (Clerk)
1. Go to [clerk.com](https://clerk.com) and create an application.
2. Enable "Email/Password" and "Google" social login.
3. Go to **API Keys** in the Clerk dashboard.
4. Copy `Publishable Key` to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
5. Copy `Secret Key` to `CLERK_SECRET_KEY`.
6. Copy the Frontend API URL (usually `clerk-xxx.accounts.dev`) to `NEXT_PUBLIC_CLERK_FRONTEND_API`.

### 3. Background Queues (Upstash QStash)
Required in production for sending emails, syncing Resend contacts, WhatsApp messages, and GDPR exports without blocking signup.
1. Go to [upstash.com](https://upstash.com) and create a QStash project.
2. Copy the token to `QSTASH_TOKEN`.
3. Copy the signing keys to `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY`.
4. Set `BACKEND_PUBLIC_URL` to the public backend URL QStash can call.
5. For local non-serverless workers, `REDIS_URL` can still be used as the BullMQ fallback.

### 4. Emails & Broadcasts (Resend)
1. Go to [resend.com](https://resend.com) and create an account.
2. Go to **API Keys** and click "Create API Key". Give it "Full Access".
3. Paste it as `RESEND_API_KEY`.
4. Verify your sending domain in Resend, then set `MESSAGING_FROM_EMAIL`, `MESSAGING_FROM_NAME`, and `MESSAGING_REPLY_TO_EMAIL`.
5. Create Segments for signups/all users, then set `RESEND_ALL_USERS_SEGMENT_ID` and `RESEND_SIGNUPS_SEGMENT_ID`.
6. Add a Resend webhook pointing to `/notifications/webhooks/resend`, then set `RESEND_WEBHOOK_SECRET`.

### 5. WhatsApp Integration (Twilio)
1. Go to [twilio.com](https://twilio.com) and create an account.
2. Use the WhatsApp Sandbox for local testing, but use an approved WhatsApp Business sender for production.
3. On the Twilio Console homepage, copy your `Account SID` and `Auth Token`.
4. Paste them into `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
5. Configure a Messaging Service and paste it into `TWILIO_MESSAGING_SERVICE_SID`; keep `TWILIO_WHATSAPP_FROM` as fallback.
6. Create and approve a WhatsApp Content Template for welcome messages, then set `TWILIO_WELCOME_TEMPLATE_SID`.
7. Set the Twilio status callback URL to `/notifications/webhooks/twilio/status`.

### 6. Observability (Sentry & PostHog)
**Sentry (Error Tracking):**
1. Go to [sentry.io](https://sentry.io) and create a Next.js project.
2. Under Settings > Projects > Client Keys (DSN), copy the DSN.
3. Paste into both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`.

**PostHog (Product Analytics & Replays):**
1. Go to [posthog.com](https://posthog.com) and create a workspace.
2. Copy the "Project API Key" from your project settings.
3. Paste it as `NEXT_PUBLIC_POSTHOG_KEY`.

### 7. Media Storage (Cloudflare R2)
We use R2 instead of Amazon S3 because it has $0 egress fees.
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com) > **R2 Object Storage**.
2. Click **Create Bucket**, name it `soouls-media`.
3. Go to R2 Settings, find your **Account ID** and paste it to `R2_ACCOUNT_ID`.
4. Click **Manage R2 API Tokens** > **Create Token** (Edit access).
5. Copy the `Access Key ID` and `Secret Access Key` into the `.env`.
6. Enable a **Custom Domain** or **Public R2.dev URL** on the bucket and put it in `R2_PUBLIC_URL`.

### 8. Billing (Stripe)
1. Go to [stripe.com](https://stripe.com) and activate a test mode account.
2. Go to **Developers > API Keys**.
3. Copy the "Publishable key" to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Copy the "Secret key" to `STRIPE_SECRET_KEY`.
5. Under **Developers > Webhooks**, create an endpoint pointing to your backend (or use Stripe CLI locally) and put the signing secret in `STRIPE_WEBHOOK_SECRET`.

