# 🎨 @soulcanvas/frontend

Welcome to the SoulCanvas frontend application! This is a **Next.js 14+** application using the **App Router**, **React Three Fiber** for immersive 3D experiences, and **Tailwind CSS** + **Framer Motion** for styling and animations.

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have run `bun install` at the root of the Turborepo monorepo.

### 2. Environment Setup
The frontend requires integration with Clerk (Authentication) and the Backend API. Ensure your `.env` file at the repository root contains the necessary keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### 3. Run the Development Server
```bash
# Preferably from the root of the project:
bun run dev

# Or directly in this directory:
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 🏗 Architecture & Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **3D Canvas:** React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Data Fetching:** TanStack Query + tRPC (`@trpc/client`, `@trpc/react-query`)
- **UI Components:** We pull shared components from the `@soulcanvas/ui-kit` workspace package.
- **Authentication:** Clerk

## 📂 Key Directories

- `app/` - The Next.js App Router (Pages, Layouts, API routes).
  - `app/dashboard/` - The core application interface after logging in.
  - `app/sign-in/` & `app/sign-up/` - Clerk authentication pages.
- `src/` - Core logic, utilities, and providers.
  - `src/utils/trpc.ts` - The configured tRPC client.
  - `src/components/` - App-specific UI components (shared components go to `ui-kit`).

## ⚡ Performance

This application is highly optimized:
- **LZ-String Compression:** We decompress large JSON payloads (containing images/voice notes) locally to keep the network requests blazing fast.
- **`useMemo` Optimizations:** Heavy data processing is always memoized to prevent React re-rendering bottlenecks.
- **Next.js Config:** `swcMinify` and compression are explicitly enabled in `next.config.js`.

---
*For Git workflow and branching guidelines, please refer to the `DEVELOPER_WORKFLOW.md` at the root of the repo.*
