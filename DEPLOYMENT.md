# 🚀 Soouls Deployment Guide

This guide provides a **step-by-step** walkthrough to deploy the **Soouls** full-stack application to production.

## 📋 Prerequisites

Before you begin, ensure you have accounts for the following:
- **Vercel**: Hosting (Frontend, Backend, Admin).
- **Neon**: PostgreSQL Database.
- **Clerk**: User Authentication.
- **Upstash**: Redis for background tasks.
- **Cloudflare**: R2 Object Storage for media.
- **Sentry**: Error monitoring.
- **Resend**: Transactional emails.
- **Google Cloud**: Google Calendar OAuth (optional).

---

## 🛠️ Step 1: Database Setup (Neon)

1.  Create a new project on [Neon.tech](https://neon.tech).
2.  In the **Dashboard**, copy your **Connection String**.
3.  Ensure it looks like: `postgresql://user:password@host/neondb?sslmode=require`.
4.  Keep this ready as your `DATABASE_URL`.

## 🛠️ Step 2: Authentication (Clerk)

1.  Create a new application in the [Clerk Dashboard](https://dashboard.clerk.com).
2.  Go to **API Keys** and copy:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
3.  Go to **Paths**:
    - Set Sign-in URL to `/sign-in`
    - Set Sign-up URL to `/sign-up`
4.  **Important**: In production, add your Vercel domains to **Allowed Redirect Origins**.

## 🛠️ Step 3: Storage (Cloudflare R2)

1.  Go to **R2** in your [Cloudflare Dashboard](https://dash.cloudflare.com).
2.  Create a bucket named `soouls-media`.
3.  Go to **Settings** and enable a **Public Domain** or use the `.r2.dev` URL.
4.  Create an **API Token** with `Object Read & Write` permissions.
5.  Copy the `Access Key ID`, `Secret Access Key`, and `Account ID`.

---

## 📦 Step 4: Vercel Deployment

<<<<<<< Updated upstream
We recommend deploying the **Backend** first, then the **Frontend**.

### 1. Backend (@soouls/backend)
- **Framework Preset**: `Other`
- **Build Command**: `turbo run build --filter=@soouls/backend`
- **Output Directory**: `dist`
- **Root Directory**: `./` (Root of monorepo)
- **Environment Variables**:
  - `DATABASE_URL`
  - `CLERK_SECRET_KEY`
  - `REDIS_URL` (From Upstash)
  - `ENCRYPTION_SECRET` (A long random string)
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
  - `BACKEND_URL` (Your backend's Vercel URL)
  - `FRONTEND_URL` (Your frontend's Vercel URL)

### 2. Frontend (@soouls/frontend)
- **Framework Preset**: `Next.js`
- **Build Command**: `turbo run build --filter=@soouls/frontend`
- **Output Directory**: `.next`
- **Root Directory**: `./`
- **Environment Variables**:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_BACKEND_URL` (Must match Backend URL above)
  - `NEXT_PUBLIC_FRONTEND_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SENTRY_DSN`
=======
### Option A: Multi-App Single Project (Modern)
Use this if you want to manage all services in one Vercel project and use a single domain with path-based routing.

1.  **Configure `vercel.json`**: Ensure the `vercel.json` file in the root matches your desired routing:
    ```json
    {
      "version": 2,
      "experimentalServices": {
        "frontend": { "entrypoint": "apps/frontend", "routePrefix": "/", "framework": "nextjs" },
        "backend": { "entrypoint": "apps/backend", "routePrefix": "/_/backend" },
        "admin": { "entrypoint": "apps/admin-dashboard", "routePrefix": "/_/admin" }
      }
    }
    ```
2.  **Deploy**: Import the repository root as a single Vercel project. Vercel will automatically detect the services.

---

### Option B: Separate Vercel Projects (Industry Standard)
Recommended for scaling and independent deployment pipelines.

#### 1. Backend (@soouls/backend)
- **Root Directory**: `apps/backend`
- **Build Command**: `cd ../.. && turbo run build --filter=@soouls/backend`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `DATABASE_URL`, `REDIS_URL`, `CLERK_SECRET_KEY`, `ENCRYPTION_SECRET`
  - `OPENAI_API_KEY`, `GEMINI_API_KEY`, `R2_ACCOUNT_ID`, etc.

#### 2. Frontend (@soouls/frontend)
- **Root Directory**: `apps/frontend`
- **Build Command**: `cd ../.. && turbo run build --filter=@soouls/frontend`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_BACKEND_URL` (Points to Backend URL)
  - `NEXT_PUBLIC_FRONTEND_URL`
>>>>>>> Stashed changes

---

## 🔗 Step 5: Final Synchronization

Once both are deployed, you **MUST** ensure the URLs match:
1.  **CORS**: Your Backend must allow requests from your Frontend URL.
2.  **Clerk**: Your Production URL must be authorized in Clerk settings.
3.  **Google OAuth**: If using Calendar, add `https://your-backend.vercel.app/google-calendar/callback` to Authorized Redirect URIs in Google Cloud Console.

## 🛡️ Security Checklist
- [ ] Change `ENCRYPTION_SECRET` to a unique production value.
- [ ] Set `NODE_ENV=production`.
- [ ] Ensure `DATABASE_URL` uses the `pooler` endpoint for serverless efficiency.
- [ ] Verify Sentry is receiving errors from both apps.

## 🚀 Troubleshooting
- **CORS Errors**: Check `NEXT_PUBLIC_BACKEND_URL` in Frontend. It must match the domain of your Backend.
- **Auth Redirects**: Ensure Clerk paths are correctly set in both the dashboard and `.env`.
- **Media Uploads Fail**: Verify Cloudflare R2 CORS policy allows your frontend domain.

---

> [!TIP]
> Use the provided `.env.example` file in the root directory as a template for your Vercel Environment Variables.
