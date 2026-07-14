# app-layouts — the standard Higgsfield app layouts (`type: "app"` builds ONLY)

A `type: "app"` product must look and feel like a Higgsfield product. Instead of
inventing app chrome from scratch, START from one of the five standard layouts
below — they mirror how Higgsfield's own products are laid out, and each
one ships as a READY SCAFFOLD in the template under **`app/src/layouts/`** (read
`app/src/layouts/AGENTS.md`). Copy the closest scaffold into your route and
adapt it: the scaffolds are prop-driven (data, handlers, and slot nodes all
arrive via props) and each file's header comment carries its exact fnf-react
wiring recipe. **If the user asks for a different layout, build what they ask
for** — the standard layouts are the default, not a cage (a custom layout is
still built with Quanta components + `q-` tokens).

**Apps render INSIDE Higgsfield, so an app NEVER renders its own header/top
bar** (no brand/logo row, no top nav bar) and never credits/balance or
sign-out controls — the host chrome provides all of that. In-app navigation
lives in a Quanta `Sidebar` (cinema studio) or inline controls (tabs, step
indicators); a page title is just a heading inside the content area.

Two more invariants: **apps are permanently DARK** (`data-theme="default-dark"`
is pinned on `<html>` in the template — no theme toggle, no light mode, no
`dark:` variants), and **every generate button shows its credit cost inside
the button** as `{label} {sparkles icon} {credits}` — the sparkle is the
branded asset `@/assets/icon-sparkles-soft.svg?react` at 14px, and the
credits number inherits the button label's font (never a smaller/other
style), like the scaffolds' submits. Variant colors do NOT follow
the names: `primary` = flat LIME, `secondary` = solid WHITE, `tertiary` = dark
white/10 glass. Non-generation buttons use the dark `tertiary`/`ghost`;
`secondary` (white) only where the real product shows a white button.

Every layout is composed from Quanta (`references/quanta-design.md`,
`app/packages/quanta/ai/AGENTS.md` for the canonical API) and must be a real
end-to-end app per `references/fnf-sdk.md`: Higgsfield auth
(`references/auth.md`), server-side generation submit + poll, results rendered
as cards composed from quanta `Media`/`Card` (helpers in
`app/src/lib/higgsfield-generation-results.ts` map a Generation to its
preview), and the app's own product state in D1
(saved/favorited, collections, presets, history).

## Choosing a layout

| Product shape | Layout | Scaffold file |
|---|---|---|
| Multi-asset creative workspace: prompt → many generations, browse/organize output | **Cinema studio** | `app/src/layouts/cinema-studio-layout.tsx` |
| Guided flow with a fixed sequence of choices ending in one result | **Stepper** | `app/src/layouts/stepper-layout.tsx` |
| One transform, minimal inputs (e.g. swap a face, restyle one photo) | **Simple app** | `app/src/layouts/app-form.tsx` |
| Enhance/convert ONE uploaded asset with a couple of options | **Upscaler** | `app/src/layouts/upscaler-layout.tsx` |
| Turn source media into short-form clips with presets + a session library | **Shorts studio** | `app/src/layouts/shorts-studio-layout.tsx` |
| Anything else the user describes | Custom — compose it from Quanta, keep the anatomy rules below | — |

## 1. Cinema studio — the workspace

The full creative-tool layout, modeled on Higgsfield's generate page
(higgsfield.ai/generate). Scaffold: `app/src/layouts/cinema-studio-layout.tsx`.

- **Left rail** — Quanta `Sidebar` (`@higgsfield/quanta/sidebar`): nav rows
  first (Home, My generations, My favorites), then a "Projects" section with
  the user's projects/collections and a "New project" row.
- **Feed** — the main area is a masonry-ish generation feed you BUILD from
  quanta pieces (CSS-columns masonry or `Grid`): image cards plus hover-play
  video cards (poster swaps to a muted looping video on hover), real empty
  state copy, in-flight status cards (Loader + "In queue" / "In progress"
  Badge) while polling, failure cards with retry.
- **Composer** — the signature region: floating, bottom-centered OVER the feed,
  a glass card you BUILD from Quanta primitives (the Apps Builder design;
  there is no prebuilt composer component): outer card `bg-q-background-glass`
  + `backdrop-blur-2xl` + `rounded-[1.25rem]` with an attachment-thumbnail
  strip on top (40px `rounded-lg` thumbs, quanta `CloseButton` to remove);
  inner surface `bg-q-transparent-dark-30 rounded-[1.125rem]` holding an
  auto-growing transparent textarea (Enter submits, never submits empty; real
  placeholders: image "Describe what you want to create...", video "Describe
  your scene - use @ to add characters & locations") over a settings-chips
  row (quanta `Chip` size="xs" color="neutral" — model / aspect / resolution /
  duration / batch, not full-width selects), and the tall GENERATE button
  filling the card's right edge — quanta Button `marketingPrimary` with the
  uppercase `text-q-accent-xs-bold` label stacked over the branded
  soft-sparkles icon (`@/assets/icon-sparkles-soft.svg?react`) + credit cost
  in the same font as the label. The Image/Video mode switcher is a separate small glass rail card
  (stacked icon-over-caption buttons, selected mode on a white/10 fill +
  subtle border), passed to `CinemaStudioLayout`'s `modeSwitcher` slot (docks
  left of the composer, bottom-aligned).
- No app header/top bar and no credits/balance or sign-out chrome anywhere —
  the Higgsfield host provides those.
- Product state in D1: every generation the user keeps, plus
  collections/projects.

## 2. Stepper — the staged flow

A staged pipeline for products where each step's ACTION produces the next
step's content, mirroring Higgsfield's Shots app (higgsfield.ai/apps/shots).
Scaffold: `app/src/layouts/stepper-layout.tsx`. This is NOT a Back/Continue
wizard:

- A step indicator across the top — numbered circles + labels (e.g. "Upload" →
  "Grid" → "Upscale"), thin dividers between them; the active step is full
  opacity, others dimmed. Steps already visited are clickable (back-jumping is
  allowed); unvisited forward steps are locked.
- A full-height STAGE renders the active step's content (upload card → result
  grid → final output).
- A step-scoped ACTIONS ROW under the stage carries that step's controls + its
  primary action (e.g. aspect-ratio `Select` + a `marketingPrimary` "Generate"
  button; the final step swaps to secondary "Start new" / "Go to library"
  actions). Completing the action is what advances the flow — there is no
  generic Continue button.
- Persist the flow state so a refresh doesn't lose progress (D1 or route state).

## 3. Simple app — the one-shot tool (faceswap-style)

A single screen, no navigation: two or three inputs and one primary action.
The scaffold here is **`AppForm`** (`app/src/layouts/app-form.tsx`) — the form
from Higgsfield's own face-swap app (higgsfield.ai/apps/face-swap). It is ONLY
the form; you compose the page around it.

- `AppForm` anatomy: input-fields slot → optional mode toggle + settings rows →
  submit row (optional accessory + one full-width `marketingPrimary` Button —
  the accent generate CTA, always showing `{label} {sparkles} {credits}`) →
  quiet helper line
  ("You have N free generations left").
- Inputs, face-swap style: two upload cards side by side on desktop
  (`flex flex-col gap-3 md:flex-row`, each `flex-1`), labelled like the real
  app — "Target Image" ("Upload the photo with face to replace") and
  "Your Photo" ("Upload the face you want to insert").
- Page composition is yours: the face-swap app pairs the form with a title block and a
  large preview panel (square on desktop) that shows demo media until the
  result replaces it — a good default; results carry download / try again /
  save actions.
- History strip (the user's previous runs, from D1) under the tool — optional
  but recommended.

## 4. Upscaler — the single-asset enhancer

One asset in, an enhanced asset out, mirroring Higgsfield's Upscale tool
(higgsfield.ai/upscale). Scaffold: `app/src/layouts/upscaler-layout.tsx`.

- **Media stage** (left, the wide column): empty = a dashed-border upload card
  with an optional before/after example, a bold uppercase title ("Upscale"), a
  muted line like "Upload your images or videos to enhance their resolution
  and quality.", and an upload Button; with media = the asset full-bleed, with
  overlay slots for progress/failure and a toolbar (compare toggle +
  download/save/delete actions) once done.
- **Settings panel** (right, ~21rem, appears once media is loaded): a header
  with the tool name + a ghost "Reset", scrollable settings (model `Select`,
  scale-factor toggle group, an "Advanced settings" collapsible), and a STICKY
  full-width `marketingPrimary` submit always showing the credit cost
  (`{label} {sparkles} {credits}`).
- Result: a before/after compare (slider where feasible), then download + save.
- Recent enhancements from D1 below.

## 5. Shorts studio — presets + session library

Source media in, short-form clips out, mirroring Higgsfield's Shorts Studio
(higgsfield.ai/shorts-studio). Scaffold: `app/src/layouts/shorts-studio-layout.tsx`
(two exports).

- **`ShortsStudioLayout`** — the tabbed studio shell: Quanta `Tabs` with e.g.
  "Presets" / "History" / "How it works", a per-tab controls slot on the right
  of the tab row (search on Presets; a "Liked" filter on History), and the
  active tab's content below: a preset-card grid (preview + name + a "Create
  custom preset" card), a sessions grid (cover + generating/failed status
  badge + like/download actions), or guide copy.
- **`ShortsStudioForm`** — the creation form card: fields slot (a preset
  picker card with a "Change" action, a media upload field with constraints
  copy like max duration/size, an "Output ratio:" Vertical/Landscape toggle),
  then a footer with an optional hint line and a tall full-width
  `marketingPrimary` "Generate" button carrying the credit cost.

## Anatomy rules (all layouts, incl. custom)

- Layouts are CONTAINER-WIDTH: `mx-auto w-full max-w-7xl` on the shell (the
  body background fills the viewport). The ONE exception is cinema studio —
  a full-bleed workspace (sidebar + edge-to-edge feed under the composer).
- The GENERATE action always uses Button `variant="marketingPrimary"` (the
  accent CTA every Higgsfield product uses). Quanta variant colors do NOT
  follow the names — `primary` = flat lime, `secondary` = solid white,
  `tertiary` = dark white/10 glass: ordinary actions and navigation use the
  dark `tertiary`/`ghost`; `secondary` only where the product shows a white
  button; flat lime `primary` is almost never right (the lime CTA is
  `marketingPrimary`, which is 3D).
- Quanta components before custom markup: `Button`, `Input`, `Textarea`,
  `Dropdown`, `Select`, `Modal`, `Tabs`, `Sidebar`, `Avatar`, `Badge`,
  `Tooltip`, `sonner` toasts, `loader`. Spacing = native Tailwind (`p-4`,
  `gap-3`); semantics = `q-` utilities (`bg-q-background-primary`,
  `text-q-body-md-regular`).
- The signed-out state, auth guards, `/api/user`, cost preview, submit/poll
  routes, and D1 persistence are MANDATORY — see the checklist in
  `references/fnf-sdk.md`.
- Generation results render as designed cards (quanta `Media` inside `Card`
  or your feed cell, with model/time meta), never a bare `<img>`.
- Polish per `references/quanta-design.md` Layer 1 (UX craft): real
  empty/loading/error states, keyboard focus states, responsive down to mobile.
