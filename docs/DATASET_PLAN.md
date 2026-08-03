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
| Sanctuary/park/zoo coordinates source | **Protected Planet / WDPA approved as a source (2026-07-31)**, added to §4 | `ProtectedArea.lat`/`lng` are non-nullable required fields, but Wikipedia's sanctuary list (used as the §4 starting-index source) has no coordinates column. Protected Planet (UNEP-WCMC + IUCN's World Database on Protected Areas) is free for non-commercial use, monthly-updated, and a natural complement to the already-approved "IUCN Red List spatial data" line — explicit user approval given rather than silently expanding the source list. |
| Species physical traits (mass/height/length/etc.) | **Wikidata approved as a source (2026-08-03)**, added to §4. EOL TraitBank was also approved but turned out **not viable**: its legacy REST endpoints (`eol.org/api/traits/*`, `eol.org/api/pages/*`) return 500s or unparseable HTML, and `api.eol.org` sits behind a Cloudflare bot-check — scripting past that isn't something this project does. Dropped from live ingestion; not removed from history in case EOL restores API access later. | User wanted the per-fact "mass/height, each cited" quality Google's knowledge panel shows. Testing found Wikidata gives good coverage for well-documented mammals (e.g. tiger: adult mass 100–260kg via P2067) but is sparse for many birds (e.g. Indian Peafowl has zero mass/height/length statements) — ships as an honest partial rollout (`null` + `needsResearch: true` where absent), not full parity with every field Google shows. |
| Bird-call audio source | **Xeno-canto approved as a source (2026-08-03)**, populates the existing `audioUrl`/`audioAttribution` fields for birds only (mammals keep the Web Audio synthesizer fallback in `SpeciesAudioButton.tsx` — no open, purpose-built mammal-call archive equivalent exists). | Xeno-canto's old key-less v2 API is retired; v3 requires a free personal account + API key (`https://xeno-canto.org/account`) supplied via env var at ingest time, never committed. License varies per recording (CC0/CC-BY/CC-BY-NC/etc.) so it's stored per-species in `audioAttribution`, same shape as `photoAttribution`. |
| Park/sanctuary/zoo cover photos, descriptions, per-entity species lists, and travel links | **Approved 2026-08-03**: Wikimedia Commons for photos (same license filter as species photos); Wikipedia article extracts for `description` source facts and the primary `additionalKeySpeciesSlugs` source (GBIF radius-query as fallback); Wikivoyage (`en.wikivoyage.org`) for the third-party trip/stay/experience link; a hand-verified state-tourism-board URL table for the official link. See §2.2/§4. | User asked for cover photos, ≥50-word descriptions, 4-5 non-flagship species, and travel/tour-operator links across all national parks, sanctuaries, and zoos. Travel-operator links are new territory outside the prior approved-source list and adjacent to the project's no-monetization rule — user confirmed both an official and a third-party bucket, clearly labeled and separate. Named commercial tour-operator URLs (MakeMyTrip/TripAdvisor-style) were deliberately **not** fabricated per-entity (144 entities, no way to verify each at this scale without human review) — Wikivoyage substitutes as a verifiable, openly-licensed "third-party trip content" source instead. Zoos get photo/description/species but not `travelLinks` (ex-situ facilities, "trip" framing doesn't apply). |

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
| `physicalTraits` | `PhysicalTraits \| null` — see `types.ts` | Each sub-field (`massKg`, `heightCm`, `lengthCm`, `trophicLevel`, `collectiveNoun`, `termForYoung`, `gestationDays`) is a `CitedFact<T> = { value: T, source: DataSourceRef }`, not a bare value — every fact carries its own inline citation (mirrors the `populationTrend[].source` per-item precedent), rather than relying on the species-level flat `sourceCitations` array. Sourced from Wikidata (see §0/§4); absent sub-fields stay `null`. |
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
| `visitingHours` | `{ openMonths?: string, timings?: string, closedSeason?: string, publicAccess?: "open" \| "permit-required" \| "restricted" \| null, accessNotes?: string \| null } \| null` | `publicAccess`/`accessNotes` filled for all 105 parks + 31 sanctuaries + 8 zoos (2026-07-31 pass) — `"open"` default (standard entry/safari permit only), `"permit-required"` for sites needing a specific access permit beyond standard entry (e.g. state Inner Line Permit, seasonal wildlife-viewing permit), `"restricted"` for sites not routinely open even with effort (e.g. Nanda Devi core zone, Nicobar-group parks). See `PUBLIC_ACCESS_LABEL` in `src/lib/mockIcons.ts` for the UI label mapping. |
| `websiteUrl` | `string \| null` | official site only |
| `latestUpdates` | `Array<{ date: string, note: string, sourceUrl: string }>` | default `[]` |
| `uniqueFeatures` | `string \| null` | |
| `relatedSuggestions` | `string[]` | default `[]` |
| `sources` | `Array<{ label: string, url: string, accessedDate: string }>` | required whenever any new field above is non-null |
| `needsResearch` | `boolean` | |

`keySpecies` (plural, join to `species`) already exists today as `headlineSpeciesSlug` (singular). Add `additionalKeySpeciesSlugs: string[]` (default `[]`) rather than widening the existing field, to avoid touching every current call site that expects a single slug.

### 2.2.1 Further additive fields — cover photo/description/travel links (both, 2026-08-03)

| Field | Type | Notes |
|---|---|---|
| `description` | `string \| null` | Freshly written (not copy-pasted Wikipedia prose), ≥50 words, grounded in facts already on the record (`areaSqKm`, `uniqueFeatures`, state, headline species) plus a Wikipedia lead-paragraph check for founding year/terrain. Cited via `sources`. |
| `photoAttribution` | `PhotoAttribution \| null` | Required whenever `photoUrl` is a real (non-mock) photo — same shape already used for `Species.photoAttribution`. Source: Wikimedia Commons, same CC0/CC-BY/CC-BY-SA filter as the species-photo pipeline. |
| `travelLinks` (ProtectedArea only, not Zoo) | `{ official: Array<{label,url}>, operators: Array<{label,url}> } \| null` | `official` = the entity's own `websiteUrl` + its state's official tourism board site. `operators` = a link to the entity's English Wikivoyage article, when verifiably present. Both buckets rendered separately and labeled in the UI so neither reads as sponsored/paid placement. |

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
- Park/sanctuary/zoo coordinates: **Protected Planet / WDPA** (api.protectedplanet.net), approved 2026-07-31 — see §0. Free for non-commercial use; cite as "Protected Planet / WDPA" per its terms of use.
- Population trends: IUCN assessments, WWF India, WII census reports, Project Tiger/Elephant status reports
- Photos: Wikimedia Commons / iNaturalist, CC-BY / CC-BY-SA / public-domain only, license + attribution stored alongside the URL
- News/latest updates: official park/zoo press pages, PIB releases
- Physical traits (mass/height/length/trophic level/collective noun/etc.): **Wikidata** (`www.wikidata.org/w/api.php` search + `Special:EntityData/*.json` claims), approved 2026-08-03 — see §0. Free, open, SPARQL/REST-queryable, each statement cites its own reference where present. Resolve the entity by `scientificName` via `wbsearchentities`, then verify the matched entity's `P225` (taxon name) equals the expected scientific name before trusting its claims (guards against homonym/mismatch, e.g. a bare genus search can return an unrelated species). Filter statements by qualifier before use — e.g. tiger's `P2067` (mass) includes a juvenile/birth-weight statement alongside the adult range; take the statement without a restrictive life-stage/sex qualifier, or the union of male+female if both are qualifier-split.
- Bird-call audio: **Xeno-canto** (`xeno-canto.org/api/3/recordings`), approved 2026-08-03 — see §0. Requires a personal API key (free signup), supplied via env var, never committed to the repo. Birds only.
- Park/sanctuary/zoo cover photos: **Wikimedia Commons**, approved 2026-08-03 — see §0. Same CC0/CC-BY/CC-BY-SA filter and hotlink-not-download approach as the species-photo pipeline.
- Park/sanctuary/zoo descriptions + non-flagship species list: **Wikipedia** article extracts (primary), approved 2026-08-03 — see §0. Fauna/wildlife section text is cross-matched against existing `species.json` slugs, never used to introduce new species outside the Phase 1 roster. **GBIF** occurrence radius-query (lat/lng + Mammalia/Aves filter, ranked by record count) is the fallback when Wikipedia doesn't surface enough matches.
- Park/sanctuary travel links: **Wikivoyage** (`en.wikivoyage.org/api/rest_v1/page/summary/*`) for the third-party trip/stay/experience link, approved 2026-08-03 — see §0. Existence verified per-entity at ingest time, never guessed. Plus a hand-verified **state tourism board** URL lookup table for the official-bucket link. Not applied to zoos.

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
