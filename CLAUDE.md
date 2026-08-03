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
- Circular photo-bubble markers, not generic pins, for dominant species per state. On hover, a tooltip card opens upward above the marker (full species name + a bigger photo) — see `speciesMarkerEl()` in `Map.tsx` for the anchoring approach: the 44px circle itself never resizes on hover (only `scale-105`s in place), so MapLibre's percentage-based anchor math never moves the marker's actual geo-position; the tooltip is a separate absolutely-positioned element pinned to `bottom-1/2` of that fixed-size circle (i.e. the circle's exact center), with its diamond "tail" as the tooltip's last flex child so it always renders at that pinned point regardless of how tall the card grows for a longer name. Only `opacity`/`transform` are transitioned — animating a discrete property like `flex-direction` (an earlier version did) can't be interpolated and snaps instead of easing.
- Two distinct marker types: large photo-bubble for dominant species, smaller pin for protected areas (national parks / sanctuaries / bird parks) — each protected-area type gets its own distinct (non-animal) icon via `PROTECTED_AREA_ICON` in `src/lib/mockIcons.ts`. Never visually conflate species and protected-area markers.
- State and protected-area names render on the map as plain DOM label markers in JetBrains Mono (`labelEl()` in `src/components/Map/Map.tsx`) — deliberately not MapLibre's native symbol/text layers, which need a glyphs/font PBF server and can't use an arbitrary web font. Protected-area (national park) labels are set bigger/darker (`text-zinc-700`, semibold, 10px) than state labels (`text-zinc-400`, 9px) — the park name is the more specific, more useful label at a readable zoom, so it's the more prominent of the two.
- Every state/UT in the boundary geojson gets a name label, not just the ones with a mock species marker — the mount effect in `Map.tsx` fetches `india-states.geojson` client-side (served from the browser cache MapLibre already populated for the source) and labels any state not already covered by a species-marker label, placed at its polygon's bounding-box center.
- Initial camera fit is `map.fitBounds(INDIA_BOUNDS, ...)` on the `load` event, not a fixed center/zoom — this derives the default zoom from the actual container/viewport size instead of a guessed constant, so it doesn't over-zoom on a narrow window or under-zoom on a wide one. The same fit is reused when search is cleared.
- State polygons highlight on hover via MapLibre `feature-state` (source has `promoteId: "NAME_1"`), combined with the search-match highlight in one `fill-color` expression (`buildFillColorExpression()` in `src/components/Map/Map.tsx`) — hover always wins over the search-dim state, since it's a direct real-time cursor interaction. Fill colors are Tailwind's gray-100 (`#F3F4F6`, default) and gray-200 (`#E5E7EB`, hover), used as plain hex constants since they feed MapLibre's `paint` config rather than a Tailwind class.
- Progressive disclosure by zoom level: country → region/biogeographic cluster → protected area. Marker sets should be pre-computed per zoom tier, not recalculated on every pan/zoom.
- No manual override system for "dominant species" ranking in Phase 1 — ship the computed ranking as-is.
- Top nav (logo, search with autocomplete, info/bookmark/account icons) + a floating, dismissible "Explore" menu of curated quick-start species icons (top-left over the map, same dismiss pattern as the welcome card — `localStorage`-persisted, not a permanently docked sidebar). This supersedes an earlier decision to use a docked left sidebar; a horizontal row below search was also rejected. Don't reintroduce either of those without a fresh decision from the user. Clicking an Explore entry both navigates to that species (as before) *and* sets the shared search query to its `commonName` (`useSearch().setQuery` in `ExploreRail.tsx`), so the map spotlights/filters to that species the same way typing its name in the search bar would.
- Search (`SearchProvider`/`SearchBar`/`Map.tsx`) filters the map by fully hiding (`display: none`) every non-matching species/protected-area marker and its label, not by dimming them — "search for a species, only that species' markers stay on the map." Clearing search restores all markers and re-fits to `INDIA_BOUNDS`. The search `<input>` is `type="text"`, not `type="search"` — the latter adds a native browser clear-icon in Chrome/Edge/Safari that doubled up with the app's own custom clear button.
- Tapping a marker's preview card, an Explore menu entry, or a species/state cross-link opens the detail in a **right-side drawer** (~24vw wide) via Next.js Intercepting Routes (`src/app/@modal/`) — the map stays mounted and fully interactive behind it, no dismiss-on-click-outside backdrop (only the drawer's close button or Escape). The drawer slides in/out (`translate-x` + `transition-transform duration-300 ease-in-out` in `Drawer.tsx`); closing defers the `router.back()` navigation by that same 300ms so the close animation actually plays before the route (and drawer) unmounts. A direct visit/refresh to the same URL renders the full standalone page instead. See `src/components/Drawer/Drawer.tsx` and the shared `src/components/detail/*Detail.tsx` components (used by both the drawer and the full pages, so content never diverges).
- A dismissible "Did you know?" card floats top-right, just below TopNav (`src/components/FunFactCard/FunFactCard.tsx`) — same floating-card/localStorage-dismiss pattern as `WelcomeCard`, except the dismiss key is scoped per calendar day so a new fact reappears tomorrow. Deliberately wide/rectangular rather than square (`w-[26rem]`). Facts come from `public/data/fun-facts.json` (curated, each entry carrying its own Wikipedia citation — PRD "transparent, cited data"), not from `species.json`; when a fact's `speciesSlug` matches a mock species, the card shows that species' photo and links in-app to its page, otherwise it falls back to the illustrated icon and links out to the fact's `wikipediaUrl`.
- `WelcomeCard` sits bottom-right, beside the map's zoom controls (`bottom-6 right-20`) rather than bottom-left. It needs `z-20` — MapLibre's own controls (including the attribution strip that runs along the bottom of the map) carry `z-index: 2`, and without a higher z-index here that attribution text shows through the card instead of being covered by its opaque background.

## Data sources (Phase 1 — PRD Section 6)
See `docs/DATASET_PLAN.md` for the full species/national-parks/sanctuaries/zoos dataset build plan (schema, sourcing priority per field, batching guardrails). Keep it in sync with any decision here, same as `docs/PRD.md`.

Use only these, all public/open-access — no paid or gated data sources without explicit approval:
- GBIF (occurrence records)
- IUCN Red List spatial data (conservation status, range)
- eBird / State of India's Birds (bird range + trends)
- ZSI State Fauna Series (state-wise checklists)
- WII National Wildlife Database / NWIS (protected-area list)
- Protected Planet / WDPA (protected-area coordinates, approved 2026-07-31 — see `docs/DATASET_PLAN.md` §0)
- Wikidata (per-species physical traits — mass/height/length/etc. — approved 2026-08-03; each fact cites its own Wikidata statement, see `docs/DATASET_PLAN.md` §0/§4). EOL TraitBank was also approved but turned out not viable — its API is effectively unreachable (broken legacy endpoints, Cloudflare-gated `api.eol.org`) — so it's not part of the live pipeline.
- Xeno-canto (bird-call audio, approved 2026-08-03 — requires a free personal API key, supplied via env var, never committed; birds only, no equivalent open mammal-call archive exists)
- Wikipedia (approved 2026-08-03 — article extracts as source facts for national-park/sanctuary/zoo `description` and as the primary source for each entity's non-flagship `additionalKeySpeciesSlugs`, cross-matched against the existing species roster; GBIF occurrence radius-query is the fallback when a fauna section doesn't surface enough matches — see `docs/DATASET_PLAN.md` §0/§4. Descriptions are freshly written from these facts, never copy-pasted Wikipedia prose.)
- Wikivoyage (approved 2026-08-03 — `en.wikivoyage.org` REST summary endpoint, linked as the third-party "trip/stay/experience" entry in a park/sanctuary's `travelLinks.operators` when a matching article verifiably exists; never a guessed URL. Not used for zoos. See `docs/DATASET_PLAN.md` §0/§4.)
- State tourism board official sites (approved 2026-08-03 — a small hand-verified state→URL lookup table, populates `travelLinks.official` alongside each entity's own `websiteUrl`; parks/sanctuaries only, see `docs/DATASET_PLAN.md` §0/§4)

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
- All 10 mock species now carry a real, rights-cleared photo: openly-licensed (CC0/CC-BY/CC-BY-SA) images hotlinked from Wikimedia Commons, with per-species author/license/source recorded in `photoAttribution` (`public/data/species.json`, `src/lib/types.ts`) and displayed as a photo-credit line on each species page. `SPECIES_ICON` in `src/lib/mockIcons.ts` remains as the illustrated-icon fallback (PRD 4.4) for any species added later without a cleared photo — every marker/card checks `photoUrl` first and falls back to the icon.
- Search is functional and map-native (see the search bullet under Map interaction model above) — it does not navigate anywhere, a deliberate departure from the PRD's original "jump to detail page" wording for search specifically (superseded in PRD Section 4.0).
- Bookmarking, account, and info icons in `TopNav` are unimplemented stubs.

Note: this repo also has an `AGENTS.md` generated by the Next.js scaffold tool, with framework-specific breaking-change warnings for the installed Next.js version — check it before making Next.js API/convention assumptions from older training data.

## Bundler: webpack, not Turbopack
`dev` and `build` scripts explicitly pass `--webpack` (Next.js 16 defaults to Turbopack otherwise). This is deliberate: there's a documented open issue where Turbopack drops MapLibre GL JS's inline worker, breaking GeoJSON source loading (empty map, no error thrown). Don't remove `--webpack` from these scripts without confirming that upstream issue is resolved and re-testing the map renders correctly.

## maplibre-gl pinned to v5.x
`maplibre-gl` is pinned to `^5.24.0`, not the newest v6. GeoJSON sources silently failed to load under v6.0.0 (style never finished loading, no error thrown) in testing — downgrading to v5 fixed it. Don't upgrade to v6+ without re-testing that the India boundary layer actually renders (state outlines visible, not just markers on a flat background).

## Background grid
`src/components/GridBackground/GridBackground.tsx` renders a site-wide dot-grid background (fixed, behind everything, `-z-10`) with a cursor-following spotlight reveal (CSS `mask-image` + `requestAnimationFrame` easing — no canvas/WebGL). The map's own "bg" style layer is deliberately transparent (`background-opacity: 0`) so this grid shows through the ocean/non-India area of the map; the India landmass fill layer stays opaque on top of it.

## Light-only color scheme (no `prefers-color-scheme: dark`)
`src/app/globals.css` sets `color-scheme: light` and does not branch on `prefers-color-scheme: dark`. This app never had a real dark mode — every surface (Drawer, ExploreRail, WelcomeCard, FunFactCard, map popups) hard-codes a white background, per the "near-monochrome, white/light-gray" design principle above. An earlier version of this file *did* flip `--foreground` to near-white under OS dark mode without flipping any of those hard-coded white backgrounds, which made body text and several unstyled headings/paragraphs invisible (white-on-white) for anyone with OS dark mode on. Don't reintroduce a `prefers-color-scheme` branch without also auditing every hard-coded `bg-white` surface to match.
