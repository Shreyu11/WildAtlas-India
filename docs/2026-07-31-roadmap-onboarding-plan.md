# Implementation Plan — Public Roadmap (with voting) + First-Visit Onboarding Tooltips

**Prepared for:** Shreyas
**Date:** July 31, 2026
**Status:** Draft — for review before build

---

## 0. Context this plan is built against

- The app is a static-leaning Next.js 16 App Router site (`src/app`), no `src/app/api` routes exist today, no database, no auth. Everything currently runs client-side against precomputed JSON in `public/data`.
- Hosting is Vercel. PRD explicitly rules out monetization and favors low ongoing infra cost (Section 7).
- There's already a working precedent for "first-time visitor" UI: `WelcomeCard.tsx` — a dismissible card gated by a `localStorage` flag (`wildatlas-welcome-dismissed`). Both features below build on that same pattern rather than introducing a new one.
- `TopNav.tsx` already has placeholder icon buttons (`Info`, `Bookmark`, `User`) with no handlers wired up — the Info icon is the natural home for both a "General info" onboarding step and a roadmap entry point.
- `MapSettingsProvider.tsx` is a client-only React context (layer toggles: mammals, birds, zoos, parks, sanctuaries) — this is the exact target for the "Map Settings" onboarding tooltip.

---

## 1. Feature: Public Roadmap with Voting + Suggestions

### 1.1 Voting model — decided: anonymous, one vote per user/session

**Confirmed:** anonymous voting, no login required. One upvote per item per visitor, enforced by a combination of a long-lived anonymous session cookie (`wildatlas-voter-id`, set on first vote) plus a hashed IP as a secondary signal, rate-limited via Upstash (Section 1.2). This matches the "public good, low-friction" framing from the PRD and avoids standing up auth (NextAuth / Clerk / Supabase Auth) just for this feature.

The schema (1.3) already keys `roadmap_votes` on `voter_key` rather than a hard-coded user id, so if login accounts are introduced later for some other reason, votes could be migrated to `user_id`-keyed dedup without a rewrite — but that's not part of this build.

### 1.2 New infrastructure required

This is the one part of the whole plan that isn't just "add a component" — voting/suggestions need persistent, mutable server-side state, which the app doesn't have anywhere yet.

- **Database:** Vercel Postgres (Neon-backed) or Supabase, both have free tiers sufficient for this volume. Recommend **Neon via Vercel Postgres** since it's a one-click add-on in the existing Vercel project and needs no new third-party account.
- **API layer:** Next.js Route Handlers under `src/app/api/roadmap/*` (App Router convention — this introduces the app's first server-side API surface).
- **Rate limiting / abuse prevention:** Upstash Redis (free tier) for a sliding-window rate limit on votes/suggestions per IP+cookie, since Vercel functions are stateless and can't rate-limit in-memory.

### 1.3 Data model

```
roadmap_items
  id            uuid pk
  title         text
  description   text
  status        enum('under_review','planned','in_progress','shipped','declined')
  is_official   boolean       -- true = added by you; false = promoted from a suggestion
  created_at    timestamptz
  updated_at    timestamptz

roadmap_votes
  id            uuid pk
  item_id       uuid fk -> roadmap_items
  voter_key     text     -- hash of (cookie_id + ip) for anon; user_id later for auth
  created_at    timestamptz
  unique(item_id, voter_key)   -- enforces one vote per item per visitor

roadmap_suggestions
  id            uuid pk
  title         text
  description   text
  suggester_key text          -- same hashing approach as voter_key
  status        enum('new','under_review','promoted','rejected')
  promoted_item_id  uuid fk -> roadmap_items, nullable
  created_at    timestamptz
```

Keeping `roadmap_suggestions` separate from `roadmap_items` means raw suggestions don't clutter the public roadmap until you (or a lightweight moderation step) promote one — important since open text fields are the main spam/abuse surface.

### 1.4 API surface (`src/app/api/roadmap/*`)

- `GET /api/roadmap/items` — list items with vote counts, filterable by status. Cached at the edge for a short TTL (e.g. 60s) since vote counts don't need to be real-time.
- `POST /api/roadmap/items/:id/vote` — casts/removes a vote from the current visitor (toggle). Rate-limited, dedup-enforced by the unique constraint.
- `POST /api/roadmap/suggestions` — submits a new suggestion. Requires: title (required, length-capped), description (optional, length-capped), honeypot field + Upstash rate limit to blunt bot spam. No CAPTCHA in v1; add one only if abuse actually shows up.
- `GET /api/roadmap/suggestions` (admin-only, simple shared-secret header or your existing session) — for your own moderation view, or just query the DB directly via a Vercel Postgres dashboard for v1 rather than building an admin UI at all.

### 1.5 Frontend

- New route: `src/app/roadmap/page.tsx` — public page, linked from the "Platform Roadmap" entry in `TopNav`'s Info dropdown (Section 2.3).
- Sections: "Planned / In Progress / Shipped" columns or filterable list (status enum drives grouping), each item showing title, description, vote count, and a vote button that reflects the visitor's own vote state (fetched via their `voter_key` cookie).
- "Suggest a feature" — a simple form (title + description) at the bottom of the page or in a modal, posting to `/api/roadmap/suggestions`. Show a confirmation state ("Thanks — under review") rather than instantly listing it, since it isn't public until promoted.
- Voter identity: on first visit to `/roadmap` (or first vote attempt), set a long-lived anonymous `wildatlas-voter-id` cookie (crypto-random UUID) if not already present — this is the anon identity used for the `voter_key` hash, separate from any onboarding-related storage keys.

### 1.6 Seeding

Populate `roadmap_items` at launch with the Phase 2/3 ideas already written in `docs/PRD.md` (Surprise Me, Progress bar per state, Rarity meter, Sound library, Gamified exploration, etc.) so the roadmap isn't empty on day one and doubles as a public-facing version of the phased scope already in the PRD.

### 1.7 Build sequence

1. Provision Postgres + Upstash, write schema/migration.
2. Build and test API routes in isolation (curl/Postman) before touching UI.
3. Build `/roadmap` read-only view (list + vote counts, no voting yet) — validates data flow end to end.
4. Add voting (cookie identity + toggle + rate limit).
5. Add suggestion form + confirmation state.
6. Seed initial roadmap items from the PRD.
7. Wire `TopNav` entry point.

---

## 2. Feature: First-Visit Onboarding Tooltips (Search / Map Settings / General Info)

### 2.1 Approach

Extend the existing dismiss-once-and-remember pattern (`WelcomeCard` + `localStorage`) into a **sequential 3-step spotlight tour** rather than introducing a heavier tutorial library, since this app already leans toward minimal, non-blocking UI per the PRD ("Lightweight onboarding... not a blocking tutorial").

**Confirmed:** build a small custom `OnboardingTour` component rather than pulling in `react-joyride` or `driver.js` — those libraries fight with MapLibre's own canvas layering and add a dependency for something that's ~150 lines of positioned tooltips, and stays consistent with the rest of the app's hand-rolled UI.

### 2.2 New component: `src/components/OnboardingTour/OnboardingTour.tsx`

- New context/provider (`OnboardingProvider`, mirrors `MapSettingsProvider`'s structure) tracking: `currentStep`, `isActive`, `dismiss()`, `next()`.
- Gated by a single `localStorage` key, e.g. `wildatlas-onboarding-complete`, checked once on mount (same `useEffect` + `useState(true)` pattern already used in `WelcomeCard` to avoid SSR/hydration mismatch).
- Three steps, each anchored to an existing DOM element via a ref or `data-onboarding-target` attribute:
  1. **Search** → anchors to `SearchBar` inside `TopNav.tsx`. Copy: "Search any species or state — the map highlights matches as you type."
  2. **Map Settings** → anchors to the layer-toggle control that reads from `MapSettingsProvider` (`MapViewSettings.tsx`). Copy: "Toggle mammals, birds, parks, and sanctuaries on or off here."
  3. **General info** → anchors to the `Info` icon in `TopNav.tsx` (currently a dead button — this plan wires it to open an About panel, which the tour then points at). Copy: "Tap here anytime for how the data works and what's cited."
- Each step: a small arrow-pointing tooltip (positioned via `getBoundingClientRect` on the target ref, recalculated on resize) with "Next" / "Skip" controls. Skipping or finishing either way sets the localStorage flag — every exit path is a one-way dismissal, matching the "never shown again after" requirement in the PRD.
- Should not fire simultaneously with `WelcomeCard` — sequence them (e.g. welcome card dismiss triggers tour start, or tour runs first and welcome card is folded into step 0) rather than showing two dismissible overlays at once. Recommend **folding `WelcomeCard` into the tour as its intro step**, replacing rather than duplicating it.

### 2.3 Wiring the Info icon — decided: dropdown menu

**Confirmed:** `TopNav.tsx`'s `Info` button (currently a dead button) becomes a dropdown menu with three entries, and doubles as the entry point for both onboarding and the roadmap — no separate roadmap icon needed:

1. **"What is WildAtlas.India?"** — opens the About panel (lightweight modal, reusing the existing `Drawer` component in `src/components/Drawer`) covering what the site is, data sources, and citations. This is also the anchor target for onboarding step 3.
2. **"Walk me through platform"** — manually restarts the onboarding tour on demand, for visitors who dismissed it and want it back, or return visitors who forgot. Requires `OnboardingProvider` (2.2) to expose a `restart()` action (not just the one-time auto-trigger), which resets `currentStep` to 0 and re-activates the tour without touching the `wildatlas-onboarding-complete` flag until the visitor exits again.
3. **"Platform Roadmap"** — links to `/roadmap` (Section 1).

This resolves the "where does the roadmap link live" open question from the earlier draft — it lives in the Info dropdown alongside About and the tour restart, rather than getting its own icon.

### 2.4 Accessibility

- Tooltips need `role="dialog"` / `aria-live` announcements so screen reader users get the same sequence; "Skip tour" must be keyboard-reachable and focus-trapped per step.
- Respect `prefers-reduced-motion` for the spotlight/arrow animations (existing components already use `ease-ios` transition classes — keep consistent, but guard with the media query).

### 2.5 Build sequence

1. Wire the `Info` icon to a real About panel (prerequisite, independently useful).
2. Build `OnboardingProvider` + step data structure.
3. Build the tooltip/spotlight component, anchor to the three targets.
4. Fold `WelcomeCard`'s content into step 0, remove the now-redundant standalone component.
5. Add accessibility pass (focus trap, aria roles, reduced-motion).
6. Manual QA across the three anchor points at different viewport sizes (mobile especially, since Map Settings and Search may reflow).

---

## 3. Sequencing across both features

These two features are independent and can be built in parallel or either order — no shared code. Suggested order if done serially: **onboarding first** (no new infra, ships fast, immediately visible improvement), **roadmap second** (needs infra provisioning, which has lead time — get that started early if doing both, since Postgres/Upstash setup can happen while onboarding is in review).

## 4. Rough effort estimate

| Work item | Estimate |
|---|---|
| Onboarding tour (incl. Info panel + WelcomeCard fold-in) | 1–2 days |
| Roadmap: infra provisioning + schema + API routes | 1–2 days |
| Roadmap: frontend (list, voting, suggestion form) | 1–2 days |
| Roadmap: seeding + abuse-prevention tuning | 0.5 day |
| QA pass on both (incl. mobile, a11y) | 0.5–1 day |

## 5. Decisions log

- **Moderation UI for suggestions — decided: no admin screen this phase.** Review suggestions directly via the Postgres dashboard; revisit only if suggestion volume grows enough to make that impractical.

No open decisions remain — this plan is ready to build against.
