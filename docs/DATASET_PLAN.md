# India Wildlife Dataset — Build Plan

Status: **planning, reconciled with current codebase** — see "Resolved decisions" below before reading further. This supersedes the original handoff draft; kept in sync with [CLAUDE.md](../CLAUDE.md) and [PRD.md](PRD.md) per this project's working process.

## 0. Resolved decisions (do not re-litigate without a fresh ask)

| Question | Decision | Why |
|---|---|---|
| Species taxa scope | **Mammals + birds only** | Matches CLAUDE.md Phase 1 boundary. Reptiles/aquatic/plants/fungi/insects stay out until a real Phase 2 call. |
| Storage layout | **Keep single-array-per-type files under `public/data/*.json`**, loaded via `src/lib/data.ts` | Matches the existing, documented convention (`species.json`, `protected-areas.json`, `zoos.json`, `world-animal-days.json`). No loader-layer rewrite. |
| Schema | **Extend current types incrementally**, don't replace | `SpeciesDetail`, `ProtectedAreaDetail`, `StateDetail`, `Map`, `ExploreRail` already read today's `Species`/`ProtectedArea`/`Zoo` shapes — a wholesale schema swap would break all of them for no immediate UI benefit. |
| Initial scale | **Full seed list** (all ~106 national parks, ~565 sanctuaries, CZA-recognized zoos, full mammal+bird IUCN/Project Tiger-Elephant species roster) | User's explicit call. Executed in two speed-separated phases — see §5. |
| Google ratings/reviews (parks/zoos/sanctuaries) | **Skipped for now** | Only available via the paid/gated Google Places API — not on the approved source list (§4) and needs "explicit approval" per CLAUDE.md. Also breaks the static-snapshot data model: Places API terms restrict caching duration and require "Powered by Google" attribution, so it'd need a live API route rather than a committed JSON field. Revisit later as its own deliberate decision. |
| "Have you visited?" flag | **Local-only, `localStorage`, no accounts** | Not a sourced fact about the place, so it doesn't belong in this dataset's schema/citation model at all — it's per-browser user state, same pattern as the existing `WelcomeCard`/`ExploreRail` dismiss flags. An account-backed, cross-device version would need real auth first (`TopNav`'s account icon is currently just a stub) — out of scope here. |

Two gaps in the original doc, fixed here regardless of the above:
- Every park/sanctuary/zoo record **must** carry `lat`/`lng` — this app is entirely map-marker-driven (see CLAUDE.md's map interaction model); the original doc's shared shape omitted coordinates.
- The original doc's per-species `national_day` field would duplicate the standalone `world-animal-days.json` already built this session. Resolution: keep `world-animal-days.json` as the single source of truth for fixed-date observances; a species record links to it by `slug` reference instead of embedding its own copy.

## 1. Scope

Four entity types, cross-referenced:

- `species` — mammals + birds found in India (Phase 1 boundary)
- `national_parks`
- `sanctuaries` — wildlife/bird sanctuaries; **separate file from national parks** since legal status and source data differ, even though the record shape is shared
- `zoos`

## 2. Schema (extends `src/lib/types.ts`, does not replace it)

### 2.1 Species — new optional fields on the existing `Species` interface

Existing required fields (`slug`, `commonName`, `scientificName`, `taxon`, `conservationStatus`, `description`, `habitat`, `stateSlugs`, `photoUrl`, `photoAttribution`, `sourceCitations`) stay as-is. Add:

| Field | Type | Notes |
|---|---|---|
| `taxonClassification` | `{ kingdom, phylum, class, order, family, genus, species } \| null` | |
| `photos` | `PhotoAttribution[]` (extends existing single `photoUrl`/`photoAttribution` pair) | 3-5 per species where available; `[]` if nothing cleared — never guess a URL |
| `habitats` | `string[] \| null` | supplements the existing singular `habitat` string; null until researched |
| `populationTrend` | `Array<{ year: number, estimate: number \| null, source: string }> \| null` | last 50-100 yrs where data exists |
| `keyFeaturesRole` | `string \| null` | physical traits + ecological role (e.g. keystone/apex predator) |
| `seasonalInfo` | `{ bestViewingMonths?: string[], breedingSeason?: string, migration?: string } \| null` | |
| `worldAnimalDaySlug` | `string \| null` | references `WorldAnimalDay.slug` in `world-animal-days.json` — no duplicated date/name here |
| `conservationEfforts` | `string[] \| null` | named programs, e.g. "Project Tiger" |
| `relatedSuggestions` | `string[]` | other species slugs, default `[]` |
| `needsResearch` | `boolean` | true whenever any field above is `null` because no source was found yet — see §6 guardrails |

### 2.2 National Parks / Sanctuaries / Zoos — shared new fields

Existing required fields on `ProtectedArea` (`slug`, `name`, `type`, `stateSlug`, `headlineSpeciesSlug`, `lat`, `lng`) and on `Zoo` (from this session) stay as-is. Add to both:

| Field | Type | Notes |
|---|---|---|
| `areaSqKm` | `number \| null` | |
| `visitingHours` | `{ openMonths?: string, timings?: string, closedSeason?: string } \| null` | |
| `websiteUrl` | `string \| null` | official site only |
| `latestUpdates` | `Array<{ date: string, note: string, sourceUrl: string }>` | default `[]` |
| `uniqueFeatures` | `string \| null` | |
| `relatedSuggestions` | `string[]` | default `[]` |
| `sources` | `Array<{ label: string, url: string, accessedDate: string }>` | required whenever any new field above is non-null |
| `needsResearch` | `boolean` | |

`keySpecies` (plural, join to `species`) already exists today as `headlineSpeciesSlug` (singular). Add `additionalKeySpeciesSlugs: string[]` (default `[]`) rather than widening the existing field, to avoid touching every current call site that expects a single slug.

### 2.3 Not part of this schema: ratings and "visited" state

Deliberately excluded from the JSON files above, per §0:

- **Google ratings/reviews** — skipped entirely for now (paid/gated source, live-fetch architecture mismatch — see §0/§7).
- **"Have you visited?"** — this is per-user, per-browser state, not a sourced fact, so it's implemented entirely client-side and never written to `public/data/*.json`: a `localStorage` key (e.g. `wildatlas-visited-<entityType>-<slug>`) toggled from a button on the relevant detail page/drawer, following the exact dismiss-flag pattern already used by `WelcomeCard`/`ExploreRail`. No new type in `types.ts`, no pipeline/source work.

## 3. Files

- `public/data/species.json` — extended in place
- `public/data/national-parks.json` — **new**, replaces the `national-park`-typed entries currently in `protected-areas.json`
- `public/data/sanctuaries.json` — **new**, replaces the `wildlife-sanctuary`/`bird-sanctuary`-typed entries currently in `protected-areas.json`
- `public/data/zoos.json` — extended in place (8 entries already seeded this session)
- `public/data/world-animal-days.json` — unchanged, species link by slug only
- `src/lib/data.ts` — `getProtectedAreas()` replaced by `getNationalParks()` + `getSanctuaries()`; every call site in `Map.tsx`, `StateDetail.tsx`, etc. updated accordingly
- `_todo.md` (repo root or `docs/`) — running log of skipped/incomplete entities per §6

## 4. Data sources (per field, priority order)

- Status/taxonomy: IUCN Red List, Wikipedia infobox, GBIF
- States/habitats: Wildlife Institute of India, ENVIS, state forest department sites
- National parks/sanctuaries directory: MoEFCC, state forest department portals; Wikipedia list pages as a **starting index only** — verify area/status against an official source before trusting numbers
- Population trends: IUCN assessments, WWF India, WII census reports, Project Tiger/Elephant status reports
- Photos: Wikimedia Commons / iNaturalist, CC-BY / CC-BY-SA / public-domain only, license + attribution stored alongside the URL
- News/latest updates: official park/zoo press pages, PIB releases

No field ships without a `sources` entry, except values explicitly marked `needsResearch: true`.

## 5. Pipeline / build order

Two speed-separated phases, because seed-index compilation and sourced detail-filling have very different cost:

**Phase A — seed index (fast, this pass)**
1. Extend `types.ts` per §2 (additive only, no breaking changes to existing components).
2. Split `protected-areas.json` into `national-parks.json` + `sanctuaries.json`; update `data.ts` and all call sites.
3. Compile master id/name/state lists for all 4 entity types (no detail fields filled yet) — full ~106 parks, ~565 sanctuaries, CZA zoo directory, mammal+bird species roster. Dedupe on official name + state.

**Phase B — sourced detail fill (slow, ongoing across many sessions)**
4. Species detail pass, batched (~20 at a time), each batch validated against schema before moving to the next.
5. Parks/sanctuaries/zoos detail pass, batched, resolving `headlineSpeciesSlug`/`additionalKeySpeciesSlugs` against the Phase A species id list.
6. Cross-link + `relatedSuggestions` pass once both datasets have real detail (same habitat, same state, same conservation status).
7. Validation pass: required-field/enum check, URL reachability spot-check, id-uniqueness check.
8. Spot-check pass: manually sample ~5% of entries against source docs.

Phase B entries not yet reached stay listed in `_todo.md` rather than silently omitted, and ship with `needsResearch: true` — never a guessed value.

## 6. Guardrails

- Never fabricate a statistic, date, or population number. Unsourced → `null` + `needsResearch: true`.
- Prefer primary/official sources over blogs or unattributed listicles.
- Record `accessedDate` for every source.
- Keep each entity's data self-contained enough that one bad fetch doesn't block the rest of a batch.
- Log skipped/incomplete entities in `_todo.md`.

## 7. Explicitly deferred (not part of this plan)

- Any taxon outside mammals + birds (Phase 2+).
- Wholesale schema replacement of `Species`/`ProtectedArea`/`Zoo` (revisit only if the additive fields above prove insufficient).
- Per-entity file layout (`data/<type>/<id>.json`) — revisit only if the single-array files become unwieldy to diff/review at full scale.
- Google Places ratings/reviews — see §0/§2.3. Would require an explicit approved-source exception plus a live API route, not a dataset field.
- Account-backed "visited" tracking that syncs across devices — needs real user auth (not built yet) rather than the local-only version in §2.3.
