# WildAtlas India — Product Requirements Document

An interactive, state-first explorer for India's wildlife distribution

**Prepared for:** Shreyas
**Date:** July 25, 2026
**Status:** Draft v4

---

## 1. Problem & Vision

India is one of the most biodiverse countries on Earth — four biodiversity hotspots, over 90,000 recorded animal species, and wildlife distribution patterns that shift dramatically from state to state. Yet there is no single place where a curious person can ask "what lives in Kerala?" or "where in India can I find a Great Indian Bustard?" and get a fast, visual, trustworthy answer.

Existing resources (India Biodiversity Portal, IBIS, ZSI checklists, WII's National Wildlife Database) hold the underlying data but are built for researchers, not explorers — taxonomy-first navigation, dense forms, and dated interfaces. Global tools like NatureServe Explorer and eBird do the same for other geographies but don't cover India with the same depth or framing.

**Vision:** WildAtlas India becomes the default place people go to discover "what wildlife lives where" in India — a state-first, visually rich, endlessly explorable map that turns a static dataset into a living atlas.

---

## 2. Target Users

| Persona | Primary need | Priority |
|---|---|---|
| Curious explorer (general public) | "What lives near me / in this state?" — fast, visual, no jargon | P0 |
| Student / educator | Accurate, citable facts organized by state and species for projects and lessons | P0 |
| Birdwatcher / naturalist | Deep species detail, range maps, seasonal/migratory patterns | P1 |
| Traveler planning a wildlife trip | "What can I realistically see if I go to X in month Y?" | P1 |
| Researcher / conservationist | Already well-served by GBIF/IBP/WII — light-touch support only | P2 |

---

## 3. 11-Star Experience: Blue-Sky Ideation

Before narrowing scope, the goal is to imagine the version of this product that would make someone stop scrolling and say "wait, how does it know that?" Applying the 11-star framework (go past merely delightful into surprising, personal, even magical) surfaced the following ideas. Not all of these will ship — they exist to stretch the ceiling before we cut down to what's real.

- **Ask-anything AI layer** — natural-language Q&A over the dataset ("which Western Ghats states have the most endemic frogs?") with cited sources, not hallucinated answers.
- **Time-travel range view** — scrub a timeline to see how a species' range (e.g. tiger, vulture) has expanded or collapsed across decades.
- **Wildlife road-trip planner** — draw a route across states, get every species realistically encountered along it, ranked by best season to spot each.
- **Live sightings pulse** — recent verified eBird / iNaturalist observations animate on the map in near-real time as they're logged.
- **Sound library** — hear a species' call or roar while viewing its range, sourced from Xeno-canto / Macaulay Library.
- **Point-and-identify** — camera-based species ID that drops a marker on the map for what's near the user right now.
- **Gamified state collector** — badges and streaks for exploring every major species in a state, or completing a biome (Western Ghats, Himalaya, mangroves, deserts).
- **Conservation urgency overlay** — a heat layer showing not just presence but threat trajectory, so "what's here" also shows "what's vanishing."
- **Verified community contributions** — photo submissions reviewed by naturalist moderators, feeding back into the open dataset rather than just decorating the app.

These ideas are the north star, not the roadmap. Section 5 narrows this into what actually ships in each phase.

---

## 4. Core Interaction: The Living Map

The map is the product's front door, and its interaction model is the single most important design decision. Rather than generic map pins, markers should be photographic and hierarchical — the map should visually communicate "what this place is known for" at a glance, the way a nature documentary establishes a location.

### 4.0 Top nav, search, and the Explore menu

The map is not the only entry point — many users will arrive already knowing what they're looking for ("show me tigers" or "what's in Rajasthan"), and others will want a nudge before they know what to look for. Per the approved wireframe, this is split across the top nav bar and a floating Explore menu, keeping the map itself uncluttered.

- **Top nav bar** — wordmark/logo at far left, a centered search bar, and utility icons at far right: an info icon (about / how the data works), a bookmark icon (save a state or species for later), and an account icon. Search is map-native, not a jump-away action: typing matches against species (common + scientific name), state names, and protected-area names, and the map itself responds — matching markers/labels stay full opacity while non-matches dim, any state tied to a match has its polygon fill visually emphasized, and the camera fits bounds to the current matches. Clearing the search restores the default view.
- **Explore menu (floating, dismissible)** — a floating panel of quick-start entries (e.g. Tigers, Elephants, Owls, a fourth curated pick), each a circular photo icon plus a label, styled identically to the map's photo markers. Floats over the map top-left, dismissible in one tap like the welcome card (persisted via `localStorage`), rather than a permanently docked sidebar — this keeps the map able to use the full viewport width. Tapping an entry opens that species' detail panel (Section 4.3) and highlights its states on the map.
- **Bookmarking** — tapping the bookmark icon on a state, species, or protected area saves it to a personal list accessible from the top-nav bookmark icon. Phase 1 can implement this as local/browser-based (no account required); an account-backed synced version is a Phase 2+ enhancement if user accounts are introduced.
- **Lightweight onboarding** — first-time visitors see a small dismissible welcome card (bottom-left, per wireframe) with a short orientation and a personalized touch (e.g. greeting the user by name if known). Not a blocking tutorial — dismissible in one tap, never shown again after.
- **Curation of the Explore menu** — entries are editorially curated (not purely data-driven) to guarantee visual appeal and recognizability on first load; the menu may be filtered by the taxon toggle (Section 4.3).

### 4.1 Dominant-species markers

At the default (country-level) zoom, each state shows one marker: a circular photo bubble (in the visual language of a map pin, but filled with the species' photograph instead of a generic icon) of that state's single most dominant / iconic species — e.g. a Tiger bubble over West Bengal, an Asiatic Lion bubble over Gujarat, a One-Horned Rhino bubble over Assam.

- **"Dominant" is computed, not editorial** — ranked by a blended score of observation density (eBird/iNaturalist/GBIF records), conservation flagship status, and cultural/state-symbol significance (e.g. official state animal).
- **No manual overrides in Phase 1** — decision: ship with the computed ranking as-is, even where it may occasionally surface a less iconic species. Revisit with a manual-override mechanism post-launch only if the computed picks prove consistently misleading in practice.
- **One marker per state at country zoom** — to avoid clutter; tapping the marker or the state opens the full state species list (see 4.3).

### 4.2 Progressive disclosure on zoom

As the user zooms in, the map reveals more granularity rather than more of the same:

1. **Country level (zoomed out):** one dominant-species photo marker per state.
2. **Region / cluster level (mid zoom):** a state's single marker splits into 2–4 markers positioned over its highest-density sub-regions or biogeographic zones (e.g. Karnataka splits into a Western Ghats marker showing Lion-tailed Macaque, and a Deccan marker showing Blackbuck).
3. **Protected-area level (close zoom):** markers appear over individual national parks / sanctuaries / hotspots, each showing that specific area's dominant species (e.g. a Gharial marker over National Chambal Sanctuary).
4. **Marker clustering:** when multiple high-density areas sit close together at a given zoom, markers cluster into a numbered badge ("+6 species here") that expands on tap rather than overlapping photos.

### 4.3 From marker to detail

- **Tap a marker** — opens a lightweight preview card (photo, name, one-line fact, conservation status badge) without leaving the map.
- **Tap the preview card** — opens the full species, state, or protected-area detail in a right-side drawer (~24% viewport width) that slides in over the map; the map stays fully visible and interactive (pannable/zoomable) behind it, and the URL updates to that item's page so it's shareable — a direct visit to that same URL renders the equivalent full standalone page instead of the drawer (see Phase 1 scope in Section 5).
- **Filter control** — a taxon toggle (mammals / birds / reptiles / aquatic / all) re-ranks and re-renders dominant markers per state for that filter, so "show me bird-dominant states" is one tap.

### 4.4 Design & data implications

- **Photo pipeline** — every species surfaced as a marker needs at least one high-quality, rights-cleared photo (Wikimedia Commons, iNaturalist CC-licensed uploads, or licensed stock) at consistent circular-crop aspect ratio.
- **Performance** — marker sets must be pre-computed per zoom tier server-side (not recalculated live on every pan/zoom) to keep the map fluid.
- **Fallback** — if no rights-cleared photo exists for the computed dominant species, fall back to an illustrated icon rather than blocking the marker from rendering.

### 4.5 Protected-area markers (national parks, sanctuaries, bird parks)

In addition to species markers, the map shows India's major protected areas as their own marker layer, added to Phase 1 scope. Visually distinct from species markers so the two are never confused: a smaller pin (no photo) versus the larger photo-bubble used for dominant species, per the wireframe's mix of large photo pins and plain circular pins. Each protected-area type (national park / wildlife sanctuary / bird sanctuary) gets its own distinct icon (non-animal glyphs, so a pin never reads as a species marker). Both state and protected-area names are labeled directly on the map, in JetBrains Mono.

- **Coverage** — major national parks, wildlife sanctuaries, and bird sanctuaries, sourced from WII's National Wildlife Database / NWIS protected-area list (public data).
- **Interaction** — tapping a protected-area marker opens a lightweight preview (name, type, state, headline species found there) with a link through to a simple protected-area detail view.
- **Layer toggle** — protected areas render as a togglable layer on top of the species-marker view, so users can turn them off if they only want the species-distribution view, and vice versa.
- **Zoom behavior** — follows the same progressive-disclosure model as species markers (Section 4.2) — sparse at country zoom, denser as the user zooms into a state or region, clustering when markers would overlap.

### 4.6 Visual design direction

Reference: approved wireframe (Explore rail, top nav, map with photo-pin markers) plus a minimal data-map reference showing the target aesthetic — a clean, mostly monochrome base map (thin outlines, sparse dot texture for landmass, compact dark labels, subtle connecting lines) with color used sparingly and purposefully.

- **Color is reserved for wildlife** — the base map, UI chrome, text, and icons stay near-monochrome (white/light-gray canvas, thin dark outlines and labels). The only saturated color on screen is the photography inside the circular species markers — so a Tiger's orange or a Peacock's blue is the thing your eye is drawn to, not UI decoration.
- **Minimal base map** — state borders as thin line art, no heavy fills or gradients; label typography small, dark, and understated, in the spirit of the reference map's compact place labels.
- **Marker hierarchy by visual weight** — large circular photo pins for dominant species (the visual anchor of the map), smaller plain pins for protected areas, numbered cluster badges when zoomed out — weight and size communicate importance at a glance, not color.
- **Clean UI chrome** — top nav and Explore rail use simple line icons, generous white space, and restrained typography, matching the wireframe's uncluttered layout rather than a data-dashboard density.

---

## 5. Phased Scope

### Phase 1 — MVP: See and browse

**Goal:** prove the core loop — explore India visually, drill into a state or species, trust what you see. Scoped to mammals and birds only, built at full depth, on the web (not a native mobile app).

- Interactive India map with dominant-species photo markers per state (Section 4.1); tap-through to state detail.
- Major national parks, wildlife sanctuaries, and bird sanctuaries shown as a distinct, togglable marker layer (Section 4.5), sourced from WII's National Wildlife Database protected-area list.
- Top nav with search (state/species autocomplete) and a persistent left-hand Explore rail of curated quick-start species icons (Section 4.0).
- State detail page: species list (mammals and birds) with photo, common + scientific name, conservation status (IUCN), one-paragraph description, habitat type.
- Species detail page: which states it's found in, range summary, conservation status, key facts, photo gallery.
- Protected-area preview and simple detail view (name, type, state, headline species).
- Search and filter by taxon (mammal/bird), conservation status (e.g. Endangered/Vulnerable), and state.
- **Curated discovery filters** — beyond the basic taxonomic filters, a set of curiosity-driven filters designed to invite browsing rather than just lookup: Exotic & Rare, Endemic to India (found nowhere else on Earth), State Symbols (official state animal/bird), Newly Discovered (described in the last 5–10 years), Living Fossils (ancient lineages, e.g. gharial), Nocturnal, Apex Predators, Giants of India (largest by size), Tiny but Mighty, Camouflage Masters, Migratory Visitors, and Freshly Sighted (surfaced from recent citizen-science uploads).
- Zoom-based progressive marker disclosure down to protected-area level (Section 4.2).
- Clean, mostly monochrome visual design with color reserved for species photography, per Section 4.6.
- Data sourced from GBIF, IUCN Red List spatial data, eBird/State of India's Birds, ZSI state fauna checklists, and WII's protected-area list — all public/open-access sources, no formal data-sharing agreements required for this launch; refreshed on a batch/manual cadence (not real-time).
- Source attribution and licensing footer on every data point, per each source's citation terms.
- Responsive web design (works well on mobile browsers) but no native app in this phase.

### Phase 2 — Depth: Understand and compare

**Goal:** reward people who stick around — give the platform real substance beyond a pretty map.

- Expand taxa coverage to reptiles and aquatic species, at the same full depth as mammals/birds.
- Richer protected-area detail: biogeographic zone context per state (Western Ghats, Himalaya, Deccan Plateau, etc.), full species checklists per park/sanctuary, not just headline species.
- Seasonal / migratory pattern notes for relevant species (esp. birds), sourced from State of India's Birds range and trend data.
- Species comparison view (side-by-side range, status, habitat for 2–3 species).
- Near-real-time data refresh from eBird/iNaturalist observation feeds (not yet live-pulsing, but no longer static batch).
- Natural-language search prototype ("birds found only in the Himalayas") over the structured dataset.
- Revisit formal data-sharing agreements with WII/ZSI if bulk/API access or richer data is needed beyond what's publicly published.
- Revisit native mobile app if usage patterns (esp. travel planning) justify it.
- **"Surprise Me" button** — one tap teleports to a random species or state; removes the "what do I click next" decision and turns browsing into a low-friction loop. Highest-leverage single feature for increasing time-on-site.
- **Progress bar per state** — "You've explored 6 of 14 headline species in Karnataka" on the state detail page; visible incompleteness pulls users to keep going.
- **Rarity meter** — a visual dial per species (Common → Rare → Endangered → Critically Endangered) shown on species cards, satisfying to scan across a state's list.
- **"Who'd win" comparisons** — playful head-to-head stat cards (size, speed, bite force) between two species, shareable and a natural next-click from any species page.

### Phase 3 — Delight: Live, social, and playful

**Goal:** the 11-star layer — features that make the product feel alive and worth returning to.

- Live citizen-science sightings feed pulsing on the map in near-real time.
- Sound library integration (Xeno-canto / Macaulay Library) on species detail pages.
- Wildlife road-trip / travel planner across states and seasons.
- Gamified exploration: state and biome completion badges, streaks.
- Verified community photo contribution pipeline feeding back into the open dataset.
- Conservation urgency heat overlay layered on top of the presence map.
- **Quiz / guess mode** — blurred photo or silhouette, guess the species or the state; short, replayable, works as a between-tasks 60-second loop.
- **Unlock mechanic** — a few rare/elusive species markers render as silhouettes until the user has explored a bit (e.g. visited 3 states, or completed a quiz), gamifying the act of discovery itself.
- **Session recap card** — "You explored 3 states and discovered 12 species in 4 minutes" shown at natural pause points; reinforces accomplishment and is screenshot-shareable.
- **Daily "Species of the Day" spotlight** — a rotating featured species with a fun fact, giving a reason to return even without new data.
- **Visit streak counter** — a paw-print calendar tracking consecutive days visited.
- **Personal "field notebook"** — a passport-style page that stamps each state or species the user has explored, rewarding completionism across return visits.

### Phase comparison

| | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Core question answered | "What lives here?" | "Why, and how has it changed?" | "What's happening right now, and can I be part of it?" |
| Data freshness | Batch / manual refresh | Near-real-time pull | Live streaming feed |
| Primary user emotion | Curiosity satisfied | Understanding deepened | Delight & ownership |

---

## 6. Data Sources

| Source | Coverage | Access / license notes |
|---|---|---|
| GBIF | Aggregated occurrence records (backbone layer, includes iNaturalist + eBird) | Open, requires citation per dataset pulled |
| IUCN Red List spatial data | Conservation status + range polygons by taxon | Free registration; redistribution terms apply |
| eBird / State of India's Birds | 942 Indian bird species, range + abundance trends | Open data via eBird + SoIB GitHub, cite eBird Basic Dataset terms |
| iNaturalist | Community observations + open range map dataset | CC-licensed per observation; verify license per photo used |
| Zoological Survey of India (ZSI) | State Fauna Series, official state-wise checklists | Government publication; check reuse terms per document |
| WII National Wildlife Database (NWIS) | Protected areas, biogeographic zones, species conservation status | Government source; contact WII for bulk/API access terms |
| India Biodiversity Portal / IBIS | Crowdsourced India-specific observations | Open, community-contributed |
| FishBase | Aquatic / freshwater species | Open for non-commercial use, cite per record |

*Every third-party dataset used has its own citation and redistribution terms; Phase 1 build must include a documented licensing/attribution audit before public launch, not just at data-ingestion time.*

---

## 7. Design Principles

- **State-first, not taxonomy-first** — the default entry point is geography, because that's how people actually think ("what's in Kerala", not "show me order Carnivora").
- **Photo-led, not table-led** — every list, marker, and card leads with an image; data tables are a fallback view, not the default.
- **One tap from curious to answered** — no dead-end pages; every screen offers an obvious next exploration.
- **Transparent, cited data** — every fact traces back to a visible source; "why is this the dominant species" is always answerable.
- **Web-first** — Phase 1–2 ship as a responsive web app; native mobile is a deliberate later consideration, not a launch blocker.
- **Public good, not a paid product** — no monetization in scope; design and infra decisions should favor low ongoing cost over revenue-generating features.

---

## 8. Success Metrics (directional, to refine with stakeholders)

- Engagement: average states explored per session, species detail pages viewed per session.
- Depth: % of sessions that reach a species or protected-area detail page (not just the map).
- Return usage: 7-day and 30-day return rate.
- Trust: low bounce-from-detail-page rate, indicating facts feel credible and complete.
- Phase 3 only: citizen-science submissions accepted per month, badges earned.

---

## 9. Non-Goals (for now)

- Not a replacement for GBIF/IBP/WII as a research-grade data system — we consume and present their data, not compete on data infrastructure.
- Not covering reptiles or aquatic species in Phase 1 (added in Phase 2); not covering plants, fungi, or insects in Phase 1–2 at all — insects/flora considered post-Phase 3.
- Not building species identification ML models in-house for Phase 1–2 (point-and-identify is a Phase 3+ exploration, likely via third-party API).
- Not a native mobile app in Phase 1–2 — responsive web only.
- Not monetized — no ads, subscriptions, or paid tiers in scope.

---

## 10. Key Decisions

The following decisions were made with the product owner (Shreyas) on July 25, 2026, resolving the open questions from the initial draft.

| Question | Decision | Rationale / notes |
|---|---|---|
| Phase 1 taxa scope | Mammals + birds, full depth | Highest public interest; reptiles and aquatic species move to Phase 2 rather than launching all four taxa shallow. |
| Dominant-species override ownership | No manual overrides in Phase 1 | Ship with the computed ranking as-is; revisit only if it proves consistently misleading post-launch. |
| WII/ZSI data agreements | Public data only for launch | Build on openly published GBIF/IUCN/eBird/ZSI/WII data; pursue formal agreements later only if bulk/API access is needed. |
| Platform priority | Web-first | Faster to build and iterate for the map-and-browse core loop; responsive but not a native app. |
| Monetization | None — public good | No revenue plans; the product is treated as an open project. |

---

## 11. Related / Reference Platforms

Similar or adjacent platforms worth keeping an eye on for UX/feature ideas — not data sources for this project (see Section 6 for the approved data-source list).

| Platform | What it is |
|---|---|
| [Esri India — National Parks & Wildlife Sanctuaries (ArcGIS Living Atlas)](https://www.arcgis.com/apps/mapviewer/index.html?layers=49328345b051462db7fac2f52e903594) | A GIS map layer plotting India's national parks and wildlife sanctuaries, built by Esri India from MoEFCC/State Forest Department data. Login-gated, non-exportable — reference only. |
| [India Biodiversity Portal — species list](https://indiabiodiversity.org/species/list) | A citizen-science biodiversity documentation platform for India, with browsable species pages, observations, and maps. |
