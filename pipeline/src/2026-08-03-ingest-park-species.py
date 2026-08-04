"""Non-flagship species-list ingester for national parks, sanctuaries, zoos.

For every entity in public/data/national-parks.json, sanctuaries.json, and
zoos.json, finds 4-5 notable species (beyond the existing headlineSpeciesSlug)
to show on its detail page, resolved against the existing public/data/
species.json roster (never introduces a species outside that roster - Phase 1
is mammals+birds only, and this app only shows species it actually has detail
pages for).

Primary source: the entity's English Wikipedia article text, matched against
species.json commonName/scientificName. Fallback (when Wikipedia yields fewer
than 4 matches): a GBIF occurrence geoDistance query around the entity's
lat/lng, filtered to Mammalia/Aves, ranked by occurrence count, cross-matched
by scientificName. See docs/DATASET_PLAN.md sec 0/4 (approved 2026-08-03).

Only produces a raw manifest under --out. Does NOT touch public/data/*.json -
merging is a separate step (2026-08-03-merge-park-updates.py).

Usage:
    python3 2026-08-03-ingest-park-species.py
    python3 2026-08-03-ingest-park-species.py --limit 10   # test run
"""

from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "park-species"

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
GBIF_BASE = "https://api.gbif.org/v1"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-ParkSpeciesIngest/1.0 (contact: {CONTACT}) python-requests"

ENTITY_FILES = ["national-parks.json", "sanctuaries.json", "zoos.json"]

TARGET_COUNT = 5
MIN_BEFORE_FALLBACK = 4
REQUEST_TIMEOUT = 20
RETRIES = 3

GROUP_CLASS_NAMES = {"mammal": "Mammalia", "bird": "Aves"}


def log(msg: str) -> None:
    print(msg, flush=True)


def request_json(url: str, params: dict, session: requests.Session) -> dict | None:
    for attempt in range(1, RETRIES + 1):
        try:
            resp = session.get(url, params=params, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, dict) and "error" in data:
                    return None
                return data
            if resp.status_code in (429, 500, 502, 503, 504):
                time.sleep(1.5 * attempt)
                continue
            return None
        except requests.RequestException:
            time.sleep(1.5 * attempt)
    return None


def fetch_wikipedia_extract(title: str, session: requests.Session) -> str | None:
    data = request_json(
        WIKIPEDIA_API,
        {
            "action": "query",
            "prop": "extracts",
            "explaintext": 1,
            "redirects": 1,
            "titles": title,
            "format": "json",
        },
        session,
    )
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        if "missing" in page:
            continue
        extract = page.get("extract")
        if extract:
            return extract
    return None


def load_entities() -> list[dict]:
    entities = []
    for filename in ENTITY_FILES:
        path = DATA_DIR / filename
        records = json.loads(path.read_text())
        for r in records:
            entities.append(
                {
                    "slug": r["slug"],
                    "name": r["name"],
                    "entityType": r.get("type", "zoo"),
                    "headlineSpeciesSlug": r.get("headlineSpeciesSlug"),
                    "lat": r["lat"],
                    "lng": r["lng"],
                }
            )
    return entities


def load_species_roster() -> list[dict]:
    return json.loads((DATA_DIR / "species.json").read_text())


def match_species_in_text(text: str, roster: list[dict], exclude_slug: str | None) -> list[str]:
    """Return roster slugs whose commonName or scientificName appears in
    text, in order of first appearance (earlier mention = more prominent)."""
    matches: list[tuple[int, str]] = []
    lower_text = text.lower()
    for sp in roster:
        if sp["slug"] == exclude_slug:
            continue
        common_pattern = re.compile(r"\b" + re.escape(sp["commonName"].lower()) + r"\b")
        sci_pattern = re.compile(r"\b" + re.escape(sp["scientificName"].lower()) + r"\b")
        pos = None
        m = common_pattern.search(lower_text)
        if m:
            pos = m.start()
        else:
            m = sci_pattern.search(lower_text)
            if m:
                pos = m.start()
        if pos is not None:
            matches.append((pos, sp["slug"]))
    matches.sort(key=lambda t: t[0])
    return [slug for _, slug in matches]


def resolve_class_key(class_name: str, session: requests.Session) -> int | None:
    data = request_json(
        f"{GBIF_BASE}/species/match",
        {"name": class_name, "rank": "CLASS", "strict": "true"},
        session,
    )
    if not data or data.get("matchType") == "NONE":
        return None
    if data.get("class") != class_name or data.get("kingdom") != "Animalia":
        return None
    return data.get("classKey")


def gbif_nearby_species(
    lat: float, lng: float, class_keys: dict[str, int], session: requests.Session, radius_km: int = 25
) -> list[str]:
    """Query GBIF occurrences within radius_km of (lat, lng), filtered to
    Mammalia/Aves, faceted by species, ranked by occurrence count. Returns
    scientific names (canonical) in ranked order."""
    results: list[tuple[int, str]] = []
    for _taxon, class_key in class_keys.items():
        data = request_json(
            f"{GBIF_BASE}/occurrence/search",
            {
                "country": "IN",
                "taxonKey": class_key,
                "geoDistance": f"{lat},{lng},{radius_km}km",
                "facet": "speciesKey",
                "facetLimit": 30,
                "limit": 0,
            },
            session,
        )
        if not data:
            continue
        facets = data.get("facets", [])
        counts = facets[0]["counts"] if facets else []
        for entry in counts:
            species_key = entry["name"]
            detail = request_json(f"{GBIF_BASE}/species/{species_key}", {}, session)
            time.sleep(0.1)
            if not detail or detail.get("rank") != "SPECIES":
                continue
            canonical = detail.get("canonicalName")
            if canonical:
                results.append((entry.get("count", 0), canonical))
    results.sort(key=lambda t: t[0], reverse=True)
    return [name for _, name in results]


def load_processed_slugs(manifest_path: Path) -> set[str]:
    if not manifest_path.exists():
        return set()
    processed = set()
    with manifest_path.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                processed.add(json.loads(line)["slug"])
            except (json.JSONDecodeError, KeyError):
                continue
    return processed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--delay", type=float, default=0.3)
    parser.add_argument("--no-gbif-fallback", action="store_true")
    args = parser.parse_args()

    out_dir = args.out.expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    entities = load_entities()
    if args.limit:
        entities = entities[: args.limit]
    roster = load_species_roster()
    already_done = load_processed_slugs(manifest_path)

    class_keys: dict[str, int] = {}
    if not args.no_gbif_fallback:
        for taxon, class_name in GROUP_CLASS_NAMES.items():
            key = resolve_class_key(class_name, session)
            if key:
                class_keys[taxon] = key

    scientific_to_slug = {sp["scientificName"].lower(): sp["slug"] for sp in roster}

    stats = {"wikipedia_sufficient": 0, "gbif_supplemented": 0, "few_matches": 0, "error": 0}
    log(f"Processing {len(entities)} entities -> {manifest_path}")

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, entity in enumerate(entities, 1):
            slug = entity["slug"]
            if slug in already_done:
                continue

            record = {"slug": slug, "entityType": entity["entityType"]}
            try:
                extract = fetch_wikipedia_extract(entity["name"], session)
                wiki_matches = match_species_in_text(extract, roster, entity["headlineSpeciesSlug"]) if extract else []

                source_method = "wikipedia"
                final_matches = list(wiki_matches[:TARGET_COUNT])

                if len(final_matches) < MIN_BEFORE_FALLBACK and class_keys:
                    nearby_names = gbif_nearby_species(entity["lat"], entity["lng"], class_keys, session)
                    for name in nearby_names:
                        gbif_slug = scientific_to_slug.get(name.lower())
                        if (
                            gbif_slug
                            and gbif_slug != entity["headlineSpeciesSlug"]
                            and gbif_slug not in final_matches
                        ):
                            final_matches.append(gbif_slug)
                        if len(final_matches) >= TARGET_COUNT:
                            break
                    if len(final_matches) > len(wiki_matches[:TARGET_COUNT]):
                        source_method = "wikipedia+gbif" if wiki_matches else "gbif"
                        stats["gbif_supplemented"] += 1
                    else:
                        stats["wikipedia_sufficient"] += 1
                else:
                    stats["wikipedia_sufficient"] += 1

                record["additionalKeySpeciesSlugs"] = final_matches[:TARGET_COUNT]
                record["sourceMethod"] = source_method
                record["status"] = "resolved" if final_matches else "no_matches"

                if len(final_matches) < MIN_BEFORE_FALLBACK:
                    stats["few_matches"] += 1
                    todo_f.write(
                        f"- [ ] {entity['name']} ({slug}): only {len(final_matches)} species matched "
                        f"(roster has {len(roster)} species; consider a manual look)\n"
                    )
            except Exception as exc:  # noqa: BLE001 - one bad entity must not kill the batch
                record["status"] = "error"
                record["error"] = str(exc)
                record["additionalKeySpeciesSlugs"] = []
                stats["error"] += 1
                todo_f.write(f"- [ ] {entity['name']} ({slug}): unexpected error: {exc}\n")

            manifest_f.write(json.dumps(record) + "\n")
            manifest_f.flush()
            todo_f.flush()

            if i % 20 == 0:
                log(f"{i}/{len(entities)} processed ({stats})")

            time.sleep(args.delay)

    log(f"\n=== Summary === {stats}")
    log(f"Manifest: {manifest_path}")
    log(f"Skipped/failed log: {todo_path}")


if __name__ == "__main__":
    main()
