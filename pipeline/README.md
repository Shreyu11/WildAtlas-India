# WildAtlas India — Data Pipeline

Ingests the Phase 1 data sources (PRD Section 6 — GBIF, IUCN Red List, eBird/State
of India's Birds, ZSI State Fauna Series, WII NWIS) and precomputes the
per-zoom-tier marker JSON consumed by the Next.js app at `../public/data/`.

Batch/manual refresh model — there's no scheduled job. Re-run the pipeline and
commit the updated `public/data/*.json` output whenever source data changes.

## Setup

```bash
cd pipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Note: `geopandas` depends on GDAL/GEOS/PROJ being available on the system
(e.g. via `brew install gdal`) — confirm this works before relying on it,
particularly since the system Python here is 3.9.

## Scripts (`src/`)

Run in order — each stage consumes the previous stage's output from
`data/processed/`:

1. `ingest_gbif.py`, `ingest_iucn.py`, `ingest_ebird.py`, `ingest_zsi.py`,
   `ingest_wii.py` — pull raw records from each source into `data/raw/`,
   normalize into a common schema in `data/processed/`.
2. `compute_dominant_species.py` — blended-score ranking (observation
   density + conservation flagship status + cultural/state-symbol
   significance) per state and per sub-region, per PRD Section 4.1.
3. `build_marker_tiers.py` — assembles the country/region/protected-area
   zoom-tier marker sets (PRD Section 4.2) and writes the final JSON to
   `../public/data/`.

None of these are implemented yet — this is scaffolding only.
