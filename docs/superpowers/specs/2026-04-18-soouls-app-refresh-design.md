# Soouls App Refresh Design

Date: 2026-04-18
Status: Draft for review
Scope: Frontend redesign and UX/system improvements across authentication, transitions, dashboard shell, modular entry creation, media handling, and profile surfaces.

## Goal

Upgrade the current Soouls experience into a more polished, faster-feeling, more modular product that matches the provided visual direction while preserving the existing Next.js, Clerk, tRPC, and entry APIs already present in the codebase.

The redesign should:

- Add branded social authentication actions for Google, Facebook, and Apple on the custom sign-in and sign-up flows.
- Replace the current simple loader treatment with a rose-inspired animated loader and reuse the same motion language across route and section transitions.
- Rebuild the dashboard shell so the home screen, profile rail, sidebar navigation, and logout confirmation align more closely with the provided mockups.
- Refactor the large `new-entry` experience into modular, reusable entry blocks that can be rearranged and extended.
- Strengthen media, doodle, and attachment flows so they work with R2-backed uploads and fit the same visual system.
- Improve perceived performance, responsiveness, accessibility, and overall product finish.

## Non-Goals

- Rewriting the backend domain model from scratch.
- Replacing Clerk, tRPC, or the existing upload URL approach.
- Shipping a fully bespoke collaborative canvas or live multi-user editing system in this pass.
- Rebuilding unrelated marketing/info pages unless small theme consistency changes are needed.

## Existing Constraints

- The repo already contains active custom auth pages, a dashboard shell, a `CurveLoader`, and a large `dashboard/new-entry` page with mixed responsibilities.
- The current branch already has uncommitted work. The implementation must build on those changes rather than reset or discard them.
- The frontend is built on Next.js App Router with Clerk auth, framer-motion, tRPC, Tailwind, and a shared `ui-kit`.
- Entry flows already connect to backend procedures for create/update/get/upload URL/media migration and should continue to do so.

## Product Direction

The application should feel intimate, premium, and atmospheric rather than generic productivity SaaS. The design language will stay dark and cinematic with warm ember accents, soft edge glow, and elegant typography, but become more structured and modular so each major surface feels intentional instead of improvised.

Three principles guide the refresh:

1. Fast-feeling over merely fast. Motion should communicate continuity and reduce blank states.
2. Modular over monolithic. New entry capabilities must be reusable blocks instead of one giant page file.
3. Human over dashboard-like. The home page, auth flow, and profile shell should feel personal and reflective.

## Workstream 1: Authentication Refresh

### User Experience

- Keep the existing custom Clerk-authored sign-in and sign-up screens.
- Add first-class buttons for Google, Facebook, and Apple under the primary credential form.
- Preserve email/password flows as the primary fallback.
- Keep sign-up verification and onboarding routing behavior intact.
- Use copy and styling consistent with the product voice rather than default OAuth widget language.

### Technical Design

- Add a reusable auth social-actions component inside `apps/frontend/app/components/auth/`.
- Use Clerk OAuth flows from the custom pages instead of Clerk hosted widgets.
- Make social buttons available on both sign-in and sign-up pages with shared loading/error behavior.
- Keep existing error normalization helpers and route users to `/dashboard` or `/onboarding` using current completion rules.

### Accessibility

- Buttons must be keyboard reachable and have clear accessible names.
- Error states must be announced with semantic markup.
- Loading states must not trap focus or hide the form without explanation.

## Workstream 2: Loader and Transition System

### User Experience

- Replace the current simple curve loader with a rose-based animated loader derived from the supplied rose formula and tuned to the Soouls palette.
- Use this loader on auth-to-app handoff, dashboard route gating, and any major full-page loading state.
- Introduce a shared transition layer so route changes feel like a slide/lift/fade system instead of abrupt page swaps.
- New entry page entry should feel like a surface rising into place from the bottom, matching the requested "slider up" motion.

### Technical Design

- Create a reusable loader component that encapsulates the rose animation logic in React/SVG.
- Add a transition wrapper component for route sections and dashboard surfaces.
- Use reduced-motion safeguards so users with motion preferences receive a lighter transition path.
- Avoid heavy layout-thrashing animations; prefer transform and opacity.

## Workstream 3: Dashboard Shell, Sidebar, and Logout Flow

### User Experience

- Refresh the dashboard home page to align more closely with the provided mockup:
  - prominent reflective headline
  - stronger featured insight card
  - cleaner supporting widgets
  - clearer "Make Entry" action that remains stable
- Refresh the sidebar/profile rail to match the visual direction:
  - avatar/profile cluster
  - greeting/streak language
  - stronger nav hierarchy
  - distinct active states
- Add a designed logout confirmation modal with "Stay" and "Logout" actions, matching the provided popup.

### Technical Design

- Move sidebar structure into a more flexible navigation configuration.
- Keep current route structure but make the shell reusable across dashboard pages.
- Use Clerk sign-out inside the confirmation modal.
- Ensure the modal supports ESC, focus return, and overlay click dismissal where appropriate.

## Workstream 4: Home Page Dynamic Entry Prompt

### User Experience

- Preserve the "Make Entry" action.
- Add a changing preface line or featured statement above it that can rotate on refresh and optionally over time.
- The changing message should feel editorial and reflective, not random or gimmicky.

### Technical Design

- Start with a curated local set of prompt lines or highlight messages.
- Rotate on page refresh immediately.
- Optionally rotate on a timer client-side with a long interval, but only if it does not create hydration or distraction issues.
- Keep the implementation deterministic enough to avoid SSR/client mismatch problems.

## Workstream 5: Modular New Entry Composer

### User Experience

- Redesign `dashboard/new-entry` so it matches the provided modular layout:
  - text/reflection space
  - image panel
  - voice note panel
  - doodle/sticker panel
  - tasklist panel
  - timer/goal panel
- Each module should read as part of one coherent composition system.
- Users should be able to add blocks, rearrange them, and remove them without losing the core text entry.
- The bottom action rail should become a cleaner modular control bar that matches the mockups.

### Technical Design

- Break the current oversized page into focused components:
  - composer shell
  - toolbar/action rail
  - block registry
  - individual block cards
  - modal/dialog primitives
- Introduce a block data model that supports reordering and future extension.
- Preserve autosave behavior but reduce coupling between all block types and page-local state.
- Use shared card styles, spacing rules, and action patterns across modules.

## Workstream 6: Media, R2 Uploads, and Entry Persistence

### User Experience

- Media uploads should feel immediate and stable, even when local drafts exist.
- Images, voice notes, and doodles should appear as durable entry assets rather than temporary page state.
- Existing migration and upload capabilities should remain available when legacy assets need conversion.

### Technical Design

- Reuse the current upload URL/media update procedures for R2-backed persistence.
- Continue local draft persistence for resilience, but move saved media references into durable backend-linked URLs when upload completes.
- Represent entry content in a structured block format so storage aligns with the modular composer.
- Maintain compatibility with existing entry retrieval APIs, either by encoding block metadata into the current content format or by introducing a safe transitional format the current endpoints can accept.

### Error Handling

- Failed uploads should surface clear retry affordances.
- Local draft data must not be wiped on upload failure.
- Save state should distinguish between local draft saved and remote asset synced.

## Workstream 7: Doodles, Stickers, Emoji-Like Media, and Avatars

### User Experience

- Expand the current doodle capability beyond a raw drawing canvas.
- Add a sticker/doodle picker experience inspired by lightweight messaging app media tools.
- Support quick expressive add-ons that complement journaling rather than turning the page into a chat UI.
- Add `react-nice-avatar` for generated avatars or fallback profile visuals when no uploaded profile image exists.

### Technical Design

- Keep the hand-drawn doodle modal but refactor it into a reusable entry block creator.
- Add a lightweight library-backed sticker or doodle asset picker if integration cost stays reasonable within the current frontend stack.
- Keep the first implementation scoped to curated or library-backed visuals rather than a massive external media marketplace.
- Use `react-nice-avatar` in profile surfaces and any avatar fallback views.

## Workstream 8: Quality, Performance, and Bug Fixing

### Performance

- Reduce oversized client-only logic where possible.
- Prefer reusable components and smaller files over giant page modules.
- Avoid expensive animation properties and unnecessary rerenders.
- Keep loader and transitions GPU-friendly.

### Accessibility

- Ensure keyboard navigation for auth, sidebar, modal, entry toolbar, and block actions.
- Respect reduced motion.
- Maintain readable contrast and semantic labels.

### Bug Fixing

- Resolve obvious type, state, and UI correctness issues discovered while refactoring.
- Verify current flows do not regress:
  - sign in
  - sign up
  - onboarding redirect
  - dashboard access gating
  - create/update entry
  - media upload
  - logout

## File-Level Design Direction

Expected primary touchpoints:

- `apps/frontend/app/components/CurveLoader.tsx` or replacement loader module
- `apps/frontend/app/components/auth/*`
- `apps/frontend/app/sign-in/[[...sign-in]]/page.tsx`
- `apps/frontend/app/sign-up/[[...sign-up]]/page.tsx`
- `apps/frontend/app/dashboard/layout.tsx`
- `apps/frontend/app/dashboard/page.tsx`
- `apps/frontend/app/dashboard/new-entry/page.tsx` with modular extraction into nearby components
- `apps/frontend/app/globals.css`
- `packages/ui-kit/src/dashboard/*`

Possible secondary touchpoints:

- `packages/api/src/namespaces/private/entries/*`
- `packages/database/src/schema/index.ts` only if the modular entry structure requires a narrowly scoped schema adjustment
- backend/media helpers only if existing upload/update flows need small compatibility fixes

## Rollout Strategy

Implement in this order:

1. Shared visual foundation: loader, transitions, modal primitives, shared dashboard styles.
2. Auth refresh with social actions.
3. Sidebar/home shell refresh.
4. New entry modular composer extraction and redesign.
5. Media persistence improvements and block syncing.
6. Doodles/stickers/avatar integration.
7. Final bug pass, accessibility pass, and verification.

This sequencing allows the app to look closer to the target early while preserving a stable path for deeper composer/storage changes.

## Verification Plan

- Run frontend typecheck and repository-wide checks relevant to changed packages.
- Validate Clerk auth flows manually in the browser-equivalent runtime where possible.
- Verify dashboard gating and onboarding redirect logic.
- Verify entry creation and editing for text, tasklist, timer, doodle, image, and voice note scenarios.
- Verify logout modal behavior and sign-out flow.
- Confirm the loader and route transitions degrade gracefully with reduced motion.

## Risks and Mitigations

### Risk: Existing branch changes conflict with refactor work

Mitigation:
- Work incrementally on top of the current branch state.
- Read surrounding files carefully before patching.
- Avoid reverting unrelated edits.

### Risk: The current `new-entry` page is too large to safely patch in place

Mitigation:
- Extract modules in small steps while keeping the route stable.
- Create reusable local components before changing behavior.

### Risk: Social auth provider setup may depend on Clerk dashboard configuration

Mitigation:
- Implement the UI and Clerk flow integration in code.
- If a provider is not enabled in Clerk environment settings, surface a clear runtime error rather than breaking the page.

### Risk: Sticker/doodle libraries may add too much bundle weight

Mitigation:
- Prefer dynamic import or lazy-loaded picker surfaces.
- Start with a curated/smaller integration instead of a huge always-loaded package.

## Open Decisions Resolved for This Pass

- The work will be executed as one coordinated refresh, but internally staged by subsystem.
- The implementation will favor structured frontend refactoring over a reckless rewrite.
- Existing backend and auth foundations remain in place unless a small compatibility fix is required.
- The app should prioritize the provided designs as the target direction for dashboard, sidebar, logout modal, and entry composer.
