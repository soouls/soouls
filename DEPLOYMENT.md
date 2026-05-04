# 🚀 Soouls Deployment Guide

This guide covers everything you need to deploy the **Soouls** full-stack application to **Vercel** (or any other cloud provider).

## 🛠 Prerequisites

Before starting, ensure you have the following accounts ready:
- **Vercel**: For hosting the Frontend and Backend.
- **Neon**: For the PostgreSQL database.
- **Upstash**: For Redis (notifications/tasks).
- **Clerk**: For Authentication.
- **Cloudflare**: For R2 Object Storage (media).
- **Sentry**: For error tracking.
- **Resend**: For transactional emails.

---

## 📦 1. Backend Deployment

### Vercel Configuration
- **Build Command**: `turbo run build --filter=@soouls/backend`
- **Install Command**: `bun install`
- **Output Directory**: `dist`

### 🔑 Backend Environment Variables

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Postgres Connection String | `postgresql://...` |
| `CLERK_SECRET_KEY` | Clerk Private Key | `sk_test_...` |
| `FRONTEND_URL` | **Production Frontend URL** | `https://soouls.vercel.app` |
| `BACKEND_URL` | **Production Backend URL** | `https://soouls-backend.vercel.app` |
| `REDIS_URL` | Upstash Redis URL | `rediss://...` |
| `ENCRYPTION_SECRET` | Secret for data encryption | `your-long-random-string` |
| `OPENAI_API_KEY` | OpenAI Key for AI features | `sk-...` |
| `GEMINI_API_KEY` | Google Gemini Key | `AIza...` |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | `...` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key | `...` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key | `...` |
| `R2_BUCKET_NAME` | Cloudflare Bucket Name | `soouls-media` |
| `R2_PUBLIC_URL` | Public URL for R2 assets | `https://pub-....r2.dev` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `...` |
| `GOOGLE_CALENDAR_REDIRECT_URI` | **Backend Callback URL** | `https://api.soouls.com/google-calendar/callback` |

---

## 🎨 2. Frontend Deployment

### Vercel Configuration
- **Build Command**: `turbo run build --filter=@soouls/frontend`
- **Install Command**: `bun install`
- **Framework Preset**: `Next.js`

### 🔑 Frontend Environment Variables

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Public Key | `pk_test_...` |
| `NEXT_PUBLIC_BACKEND_URL` | **Production Backend URL** | `https://soouls-backend.vercel.app` |
| `NEXT_PUBLIC_FRONTEND_URL` | **Production Frontend URL** | `https://soouls.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same as Frontend URL | `https://soouls.vercel.app` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API Key | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog Host | `https://us.posthog.com` |

> [!IMPORTANT]
> **Link Synchronization**: Ensure the `NEXT_PUBLIC_BACKEND_URL` in the frontend matches the `BACKEND_URL` in the backend. If they don't match, tRPC requests and rewrites will fail.

---

## 🔗 3. Critical Links to Update

When moving from Local to Production, you **MUST** update these URLs in your provider dashboards:

### Clerk Dashboard
1.  **Allowed Redirect Origins**: Add your production frontend URL.
2.  **Social Login Callbacks**: Ensure they point to your production frontend.

### Google Cloud Console
1.  **Authorized Redirect URIs**: 
    - `https://your-backend-url.vercel.app/google-calendar/callback`
2.  **Authorized JavaScript Origins**: 
    - `https://your-frontend-url.vercel.app`

### Cloudflare R2
1.  **CORS Policy**: Allow your production frontend and backend domains.

---

## 🛠 Fixed Build Errors

We have resolved the following issues in the latest commit:
1.  **TypeScript Error**: Fixed a crash in `app/home/dashboard/page.tsx` where the `pos` variable was possibly undefined during the cluster node mapping.
2.  **Sentry Warnings**: Added `SENTRY_AUTH_TOKEN` to `turbo.json`'s `globalPassThroughEnv` to allow Sentry source map uploads during Turborepo builds.

## 🚀 How to Re-Deploy

1.  **Push the latest changes** to your `dev` or `main` branch.
2.  Go to **Vercel Dashboard**.
3.  Ensure all Environment Variables listed above are added to the respective projects.
4.  Trigger a **New Deployment**.

If you see any more build errors, check the logs for "Type error" or "Module not found". The latest fix ensures the dashboard compiles correctly.
