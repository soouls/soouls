# Real Home Data Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing home experience use real per-user database data, persistent settings, real analytics, and optional AI-generated narratives without changing the current UI structure.

**Architecture:** Add a shared backend “home analytics” layer that reads decrypted journal entries, computes real aggregates/clusters/insight cards, and optionally upgrades copy with OpenAI when configured. Persist user preferences in the database, expose the data via new protected tRPC routes, and wire the existing frontend pages to those routes while preserving the current layouts and interactions.

**Tech Stack:** Next.js 16, Clerk, tRPC, NestJS, Drizzle/Postgres, Redis cache, AI SDK (`ai`, `@ai-sdk/openai`), existing Soouls entry encryption/compression.

---

## File Map

**Backend / API**
- Modify: `packages/api/src/router.ts`
- Create: `packages/api/src/namespaces/private/home/getOverview/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getOverview/run.ts`
- Create: `packages/api/src/namespaces/private/home/getInsights/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getInsights/run.ts`
- Create: `packages/api/src/namespaces/private/home/getClusters/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getClusters/run.ts`
- Create: `packages/api/src/namespaces/private/home/getCanvas/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getCanvas/run.ts`
- Create: `packages/api/src/namespaces/private/home/getAccount/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getAccount/run.ts`
- Create: `packages/api/src/namespaces/private/home/getSettings/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getSettings/run.ts`
- Create: `packages/api/src/namespaces/private/home/updateSettings/constants.ts`
- Create: `packages/api/src/namespaces/private/home/updateSettings/run.ts`
- Create: `packages/api/src/namespaces/private/home/getClusterDetail/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getClusterDetail/run.ts`
- Modify: `apps/backend/src/trpc/trpc.router.ts`
- Modify: `apps/backend/src/services/services.module.ts`
- Create: `apps/backend/src/home/home.service.ts`
- Create: `apps/backend/src/home/home.service.spec.ts`
- Create: `apps/backend/src/home/home.analytics.ts`
- Create: `apps/backend/src/home/home.analytics.spec.ts`
- Modify: `apps/backend/src/entries/entries.service.ts`
- Modify: `apps/backend/src/users/users.service.ts`

**Database / AI**
- Modify: `packages/database/src/schema/index.ts`
- Create: `packages/ai-engine/src/home-insights/index.ts`
- Create: `packages/ai-engine/src/home-insights/index.test.ts` 

**Frontend**
- Create: `apps/frontend/src/providers/ui-theme-provider.tsx`
- Create: `apps/frontend/src/hooks/use-home-theme.ts`
- Modify: `apps/frontend/app/layout.tsx`
- Modify: `apps/frontend/app/globals.css`
- Modify: `apps/frontend/app/home/page.tsx`
- Modify: `apps/frontend/app/home/insights/page.tsx`
- Modify: `apps/frontend/app/home/clusters/page.tsx`
- Modify: `apps/frontend/app/home/canvas/page.tsx`
- Modify: `apps/frontend/app/home/account/page.tsx`
- Modify: `apps/frontend/app/home/settings/page.tsx`
- Modify: `apps/frontend/app/home/new-entry/page.tsx`
- Create: `apps/frontend/app/home/clusters/[clusterId]/page.tsx`

## Task 1: Persist user preferences

**Files:**
- Modify: `packages/database/src/schema/index.ts`
- Modify: `packages/api/src/router.ts`
- Modify: `apps/backend/src/users/users.service.ts`
- Create: `packages/api/src/namespaces/private/home/getSettings/constants.ts`
- Create: `packages/api/src/namespaces/private/home/getSettings/run.ts`
- Create: `packages/api/src/namespaces/private/home/updateSettings/constants.ts`
- Create: `packages/api/src/namespaces/private/home/updateSettings/run.ts`

- [ ] Add a DB-backed user preference shape for theme mode, accent theme, default view, writing mode, AI toggles, privacy settings, and reminder time.
- [ ] Expose read/update procedures for the authenticated user.
- [ ] Keep onboarding `themePreference` mapped into the new preference shape so existing users retain their chosen accent.
- [ ] Make the settings API return a normalized object even when older rows are missing some fields.

## Task 2: Build analytics engine with tests

**Files:**
- Create: `apps/backend/src/home/home.analytics.ts`
- Create: `apps/backend/src/home/home.analytics.spec.ts`
- Modify: `apps/backend/src/entries/entries.service.ts`

- [ ] Write failing unit tests for aggregate calculations from decrypted entry payloads.
- [ ] Implement real metrics: entry counts, streak, most active period, weekday activity, theme frequencies, task completion counts, recent entry list, and cluster candidates.
- [ ] Parse saved `textContent` + `blocks` so image/voice/task/goal blocks affect the aggregates.
- [ ] Add a stable fallback narrative generator so pages still work without an external AI key.

## Task 3: Add optional AI narrative enrichment

**Files:**
- Create: `packages/ai-engine/src/home-insights/index.ts`
- Modify: `apps/backend/src/home/home.service.ts`

- [ ] Add OpenAI-backed helpers for monthly narrative, final synthesis, reflection prompt, cluster naming/summary, and writing-pattern labels.
- [ ] Guard every AI call behind env detection and resilient fallback logic.
- [ ] Cache enriched responses per user/date window to avoid repeated cost and latency.

## Task 4: Expose real home data through tRPC

**Files:**
- Modify: `packages/api/src/router.ts`
- Modify: `apps/backend/src/trpc/trpc.router.ts`
- Modify: `apps/backend/src/services/services.module.ts`
- Create: `apps/backend/src/home/home.service.ts`
- Create: `apps/backend/src/home/home.service.spec.ts`
- Create: `packages/api/src/namespaces/private/home/*`

- [ ] Add protected home routes for overview, insights, account, settings, clusters, canvas, and cluster detail.
- [ ] Return data already shaped for the existing UI cards to minimize frontend churn.
- [ ] Keep routes scoped to the authenticated DB user and compatible with the current tRPC provider.

## Task 5: Enrich entries on save

**Files:**
- Modify: `apps/backend/src/entries/entries.service.ts`
- Modify: `apps/frontend/app/home/new-entry/page.tsx`

- [ ] On create/update, compute/save title, word count, sentiment label/color, tags, and cluster assignment from the real content.
- [ ] Preserve current autosave, local storage, upload, and hydration behavior.
- [ ] Ensure updates invalidate cached analytics so changes appear throughout the app quickly.

## Task 6: Apply real theme + accent to current UI

**Files:**
- Create: `apps/frontend/src/providers/ui-theme-provider.tsx`
- Create: `apps/frontend/src/hooks/use-home-theme.ts`
- Modify: `apps/frontend/app/layout.tsx`
- Modify: `apps/frontend/app/globals.css`
- Modify: `apps/frontend/app/home/page.tsx`
- Modify: `apps/frontend/app/home/insights/page.tsx`
- Modify: `apps/frontend/app/home/clusters/page.tsx`
- Modify: `apps/frontend/app/home/canvas/page.tsx`
- Modify: `apps/frontend/app/home/account/page.tsx`
- Modify: `apps/frontend/app/home/settings/page.tsx`

- [ ] Read the saved user theme once and project it into CSS custom properties.
- [ ] Support dark/light mode without changing layouts.
- [ ] Replace hard-coded home-page accent colors with shared CSS variables so onboarding question 3 affects the full home experience.

## Task 7: Wire each page to real data

**Files:**
- Modify: `apps/frontend/app/home/page.tsx`
- Modify: `apps/frontend/app/home/insights/page.tsx`
- Modify: `apps/frontend/app/home/clusters/page.tsx`
- Modify: `apps/frontend/app/home/canvas/page.tsx`
- Modify: `apps/frontend/app/home/account/page.tsx`
- Modify: `apps/frontend/app/home/settings/page.tsx`
- Create: `apps/frontend/app/home/clusters/[clusterId]/page.tsx`

- [ ] Replace mock arrays and placeholder copy with tRPC queries.
- [ ] Keep the existing card structure, sections, and interactions intact.
- [ ] Make cluster cards open real detail data.
- [ ] Make account actions use real profile/analytics data and hook export actions to real downloads where feasible.

## Task 8: Verify end-to-end behavior

**Files:**
- Modify as needed from earlier tasks only.

- [ ] Run focused backend tests for analytics and service routes.
- [ ] Run type-check/build for backend and frontend.
- [ ] Push the schema to the configured database if a new preference field/table is introduced.
- [ ] Manually verify the main home flows on a signed-in account: onboarding color, light/dark switch, autosave entry, insights refresh, clusters refresh, canvas search/drag, calendar modal.
