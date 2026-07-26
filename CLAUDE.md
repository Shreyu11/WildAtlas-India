# WildAtlas India — Project Instructions

Full spec: `docs/PRD.md`. Read it before starting any new feature area; this file is the condensed, always-apply ruleset.

## What this is
A state-first, photo-led interactive map for exploring India's wildlife distribution. Currently building **Phase 1** only (see PRD Section 5): mammals and birds, full depth. Reptiles and aquatic species are Phase 2 — do not build for them yet unless asked.

## Non-negotiable design principles (PRD Section 7)
- **State-first, not taxonomy-first.** Geography is the primary navigation axis. Users think "what's in Kerala," not "show me order Carnivora."
- **Photo-led, not table-led.** Every list, marker, and card leads with an image. Data tables are a fallback view, never the default.
- **One tap from curious to answered.** No dead-end screens — every page offers an obvious next click.
- **Transparent, cited data.** Every fact traces back to a visible source. Never fabricate or infer data not present in the ingested datasets.
- **Color is reserved for wildlife.** UI chrome, base map, and text stay near-monochrome (white/light-gray, thin dark outlines and labels). The only saturated color on screen is inside the circular species-photo markers. Do not add decorative color to buttons, backgrounds, or icons.
- **Web-first.** Build a responsive web app. Do not scaffold a native mobile app.
- **Public good, not a paid product.** No ads, subscriptions, paywalls, or monetization hooks.

## Map interaction model (PRD Section 4 — read in full before building the map)
- Circular photo-bubble markers, not generic pins, for dominant species per state.
- Two distinct marker types: large photo-bubble for dominant species, smaller pin for protected areas (national parks / sanctuaries / bird parks) — each protected-area type gets its own distinct (non-animal) icon via `PROTECTED_AREA_ICON` in `src/lib/mockIcons.ts`. Never visually conflate species and protected-area markers.
- State and protected-area names render on the map as plain DOM label markers in JetBrains Mono (`labelEl()` in `src/components/Map/Map.tsx`) — deliberately not MapLibre's native symbol/text layers, which need a glyphs/font PBF server and can't use an arbitrary web font.
- Progressive disclosure by zoom level: country → region/biogeographic cluster → protected area. Marker sets should be pre-computed per zoom tier, not recalculated on every pan/zoom.
- No manual override system for "dominant species" ranking in Phase 1 — ship the computed ranking as-is.
- Top nav (logo, search with autocomplete, info/bookmark/account icons) + a floating, dismissible "Explore" menu of curated quick-start species icons (top-left over the map, same dismiss pattern as the welcome card — `localStorage`-persisted, not a permanently docked sidebar). This supersedes an earlier decision to use a docked left sidebar; a horizontal row below search was also rejected. Don't reintroduce either of those without a fresh decision from the user.
- Tapping a marker's preview card, an Explore menu entry, or a species/state cross-link opens the detail in a **right-side drawer** (~24vw wide) via Next.js Intercepting Routes (`src/app/@modal/`) — the map stays mounted and fully interactive behind it, no dismiss-on-click-outside backdrop (only the drawer's close button or Escape). A direct visit/refresh to the same URL renders the full standalone page instead. See `src/components/Drawer/Drawer.tsx` and the shared `src/components/detail/*Detail.tsx` components (used by both the drawer and the full pages, so content never diverges).

## Data sources (Phase 1 — PRD Section 6)
Use only these, all public/open-access — no paid or gated data sources without explicit approval:
- GBIF (occurrence records)
- IUCN Red List spatial data (conservation status, range)
- eBird / State of India's Birds (bird range + trends)
- ZSI State Fauna Series (state-wise checklists)
- WII National Wildlife Database / NWIS (protected-area list)

Every dataset has its own citation/redistribution terms. Any new data source integration must include a source-attribution footer on the data it powers, matching that source's citation requirements. Do not strip or omit attribution to simplify UI.

## Explicit non-goals for now (PRD Section 9)
- No reptiles, aquatic species, plants, fungi, or insects yet.
- No in-house species-ID ML models (point-and-identify is Phase 3+, third-party API when it happens).
- No native mobile app.
- No monetization of any kind.

## Working process
- This is a phased build. Confirm which phase a request belongs to before implementing — if a request looks like Phase 2/3 scope (reptiles/aquatic, live sightings feed, sound library, gamification, quizzes, road-trip planner), flag that it's out of current phase scope rather than building it silently.
- For anything architecturally significant (data pipeline design, map rendering approach, marker clustering strategy), propose a plan first and wait for approval before writing implementation code.
- Keep the PRD (`docs/PRD.md`) and this file in sync — if a decision here changes, update both.

## Stack (decided at project setup)
- **Frontend**: Next.js (TypeScript, App Router, `src/` dir, Tailwind CSS), scaffolded at the project root.
- **Map**: MapLibre GL JS, used directly (not via `react-map-gl`) to support the bespoke circular photo-bubble markers and clustering badges. Basemap: a custom India state-boundary GeoJSON (`public/data/geo/india-states.geojson`, sourced from `geohacker/india`, MIT — see `public/data/geo/SOURCE.md` for provenance and known data gaps) rendered as plain monochrome fill/line layers — no external tile provider, no roads/POIs/city labels, zero ongoing cost or external runtime dependency. (Protomaps was considered at project setup but a fully custom GeoJSON basemap turned out to be a better fit once the wireframe showed a minimal state-outline-only map.)
- **Data pipeline**: Python, in `pipeline/`, ingesting GBIF/IUCN/eBird/ZSI/WII into precomputed per-zoom-tier marker JSON under `public/data/`, committed to git (batch/manual refresh model — no live pipeline run needed to build/deploy). **Not implemented yet** — the first prototype (map, nav, Explore rail, detail pages) runs on a small hand-curated mock dataset in `public/data/{states,species,protected-areas}.json` and `public/data/markers/country.json` instead, clearly labeled via `DataAttributionFooter` on every page. Swapping in real pipeline output later is meant to be a one-file change in `src/lib/data.ts`.
- **Hosting**: Vercel (free Hobby tier).
- **Fonts**: Manrope (body/default), JetBrains Mono (the `font-mono` Tailwind utility — used for labels and numeric/status values, e.g. conservation-status badges).

## Current prototype scope (first pass, see plan history)
- Country-level markers only — one dominant-species marker per state, always visible, plus protected-area pins. The region-split/clustering zoom-tier behavior (PRD Section 4.2, levels 2–4) is not built yet.
- No real species photos — every marker/card uses the PRD's own explicit no-photo fallback (Section 4.4, illustrated icon) rather than guessed/unverified image URLs, to avoid a licensing risk.
- Search is functional and map-native (see `SearchProvider`/`SearchBar`/`Map.tsx` — matches spotlight/dim markers, highlight matched states, fit bounds to matches) — it does not navigate anywhere, a deliberate departure from the PRD's original "jump to detail page" wording for search specifically (superseded in PRD Section 4.0).
- Bookmarking, account, and info icons in `TopNav` are unimplemented stubs.

Note: this repo also has an `AGENTS.md` generated by the Next.js scaffold tool, with framework-specific breaking-change warnings for the installed Next.js version — check it before making Next.js API/convention assumptions from older training data.

## Bundler: webpack, not Turbopack
`dev` and `build` scripts explicitly pass `--webpack` (Next.js 16 defaults to Turbopack otherwise). This is deliberate: there's a documented open issue where Turbopack drops MapLibre GL JS's inline worker, breaking GeoJSON source loading (empty map, no error thrown). Don't remove `--webpack` from these scripts without confirming that upstream issue is resolved and re-testing the map renders correctly.

## maplibre-gl pinned to v5.x
`maplibre-gl` is pinned to `^5.24.0`, not the newest v6. GeoJSON sources silently failed to load under v6.0.0 (style never finished loading, no error thrown) in testing — downgrading to v5 fixed it. Don't upgrade to v6+ without re-testing that the India boundary layer actually renders (state outlines visible, not just markers on a flat background).

## Background grid
`src/components/GridBackground/GridBackground.tsx` renders a site-wide dot-grid background (fixed, behind everything, `-z-10`) with a cursor-following spotlight reveal (CSS `mask-image` + `requestAnimationFrame` easing — no canvas/WebGL). The map's own "bg" style layer is deliberately transparent (`background-opacity: 0`) so this grid shows through the ocean/non-India area of the map; the India landmass fill layer stays opaque on top of it.
