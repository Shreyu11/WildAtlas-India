"""State-distribution resolver for new-species candidates.

Stage 1 of docs/DATASET_PLAN.md's 2026-08-04 "close the species-count gap"
plan. For each resolved candidate in identity-manifest.jsonl, fetches GBIF
occurrence records (country=IN) and derives real stateSlugs from them.

Primary signal: GBIF's own `stateProvince` free-text field, present on
~98% of occurrence records in spot checks and already correctly labeled
(e.g. "Telangana") independent of our own india-states.geojson, which is
known to predate Telangana's 2014 formation (public/data/geo/SOURCE.md).
Normalized against public/data/states.json's real names via a small alias
table (handles "Orissa"->Odisha, "Uttaranchal"->Uttarakhand, etc.) plus a
close-match fallback.

Fallback signal (for the occurrence records without stateProvince):
point-in-polygon against public/data/geo/india-states.geojson using
shapely, mapped via a hardcoded NAME_1 -> state-slug table. Inherits that
geojson's known gaps (no Telangana, no J&K/Ladakh split) for this fallback
path only - a pre-existing, already-documented limitation, not new.

A state is included in a candidate's stateSlugs if it has >=2 matched
occurrences or >=5% of that candidate's total matched occurrences,
capped at the top 10 states by count.

Does NOT touch public/data/species.json - staging output only, merged in
Stage 2 (2026-08-04-merge-new-species.py) alongside a real description.

Usage:
    python3 2026-08-04-derive-species-state-distribution.py
    python3 2026-08-04-derive-species-state-distribution.py --limit 10
"""

from __future__ import annotations

import argparse
import difflib
import json
import time
from pathlib import Path

import requests
from shapely.geometry import Point, shape

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_IDENTITY_MANIFEST = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "identity-manifest.jsonl"
DEFAULT_STATES_JSON = REPO_ROOT / "public" / "data" / "states.json"
DEFAULT_GEOJSON = REPO_ROOT / "public" / "data" / "geo" / "india-states.geojson"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "new-species"

GBIF_OCCURRENCE_SEARCH = "https://api.gbif.org/v1/occurrence/search"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-StateDistribution/1.0 (contact: {CONTACT}) python-requests"

REQUEST_TIMEOUT = 20
RETRIES = 3
OCCURRENCE_LIMIT = 300

# stateProvince values seen in GBIF data that don't exact-match a
# states.json name - extend as new mismatches turn up in _todo.md.
STATE_ALIASES = {
    "orissa": "odisha",
    "uttaranchal": "uttarakhand",
    "pondicherry": "puducherry",
    "nct of delhi": "delhi",
    "delhi nct": "delhi",
    "national capital territory of delhi": "delhi",
    "andaman and nicobar islands": "andaman & nicobar",
    "andaman & nicobar islands": "andaman & nicobar",
    "jammu and kashmir": "jammu & kashmir",
    "dadra and nagar haveli": "dadra & nagar haveli and daman & diu",
    "daman and diu": "dadra & nagar haveli and daman & diu",
}

# geojson NAME_1 -> states.json name, for the point-in-polygon fallback path.
GEOJSON_NAME_TO_STATE_NAME = {
    "Andaman and Nicobar": "Andaman & Nicobar",
    "Orissa": "Odisha",
    "Uttaranchal": "Uttarakhand",
    "Jammu and Kashmir": "Jammu & Kashmir",
    "Dadra and Nagar Haveli": "Dadra & Nagar Haveli and Daman & Diu",
    "Daman and Diu": "Dadra & Nagar Haveli and Daman & Diu",
    # Telangana has no geojson feature (pre-2014 dataset) - occurrences
    # there fall inside the old undivided Andhra Pradesh polygon and will
    # be geometrically mis-attributed via this fallback path only. Known,
    # documented limitation (public/data/geo/SOURCE.md); the stateProvince
    # primary path is unaffected since it doesn't use this geojson at all.
}


def log(msg: str) -> None:
    print(msg, flush=True)


def request_json(url: str, params: dict, session: requests.Session) -> dict | None:
    for attempt in range(1, RETRIES + 1):
        try:
            resp = session.get(url, params=params, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                try:
                    return resp.json()
                except ValueError:
                    return None
            if resp.status_code in (429, 500, 502, 503, 504):
                time.sleep(1.5 * attempt)
                continue
            return None
        except requests.RequestException:
            time.sleep(1.5 * attempt)
    return None


def build_state_name_index(states: list[dict]) -> dict[str, str]:
    """normalized name -> slug"""
    return {s["name"].strip().lower(): s["slug"] for s in states}


def match_state_province(raw: str, name_index: dict[str, str]) -> str | None:
    if not raw:
        return None
    key = raw.strip().lower()
    if key in name_index:
        return name_index[key]
    if key in STATE_ALIASES:
        return name_index.get(STATE_ALIASES[key])
    close = difflib.get_close_matches(key, name_index.keys(), n=1, cutoff=0.85)
    return name_index[close[0]] if close else None


def build_polygon_index(geojson_path: Path, name_index: dict[str, str]) -> list[tuple[object, str]]:
    """[(shapely_geometry, state_slug), ...] - skips features with no
    resolvable state (e.g. would-be Telangana, which has no feature at all
    so nothing to skip; this guards any other unresolvable NAME_1)."""
    data = json.loads(geojson_path.read_text())
    polygons = []
    for feature in data["features"]:
        name1 = feature["properties"]["NAME_1"]
        state_name = GEOJSON_NAME_TO_STATE_NAME.get(name1, name1)
        slug = name_index.get(state_name.strip().lower())
        if not slug:
            continue
        polygons.append((shape(feature["geometry"]), slug))
    return polygons


def match_point_in_polygon(lat: float, lng: float, polygon_index: list[tuple[object, str]]) -> str | None:
    point = Point(lng, lat)
    for geom, slug in polygon_index:
        if geom.contains(point):
            return slug
    return None


def fetch_occurrences(gbif_key: str, session: requests.Session) -> list[dict]:
    data = request_json(
        GBIF_OCCURRENCE_SEARCH,
        {"country": "IN", "taxonKey": gbif_key, "hasCoordinate": "true", "limit": OCCURRENCE_LIMIT},
        session,
    )
    if not data:
        return []
    return data.get("results", [])


def derive_state_slugs(
    occurrences: list[dict], name_index: dict[str, str], polygon_index: list[tuple[object, str]]
) -> tuple[list[str], dict]:
    counts: dict[str, int] = {}
    unmatched_state_provinces: set[str] = set()
    matched_via = {"stateProvince": 0, "point_in_polygon": 0, "unmatched": 0}

    for occ in occurrences:
        slug = match_state_province(occ.get("stateProvince", ""), name_index)
        if slug:
            matched_via["stateProvince"] += 1
        else:
            if occ.get("stateProvince"):
                unmatched_state_provinces.add(occ["stateProvince"])
            lat, lng = occ.get("decimalLatitude"), occ.get("decimalLongitude")
            if lat is not None and lng is not None:
                slug = match_point_in_polygon(lat, lng, polygon_index)
                if slug:
                    matched_via["point_in_polygon"] += 1
        if slug:
            counts[slug] = counts.get(slug, 0) + 1
        else:
            matched_via["unmatched"] += 1

    total = sum(counts.values())
    if total == 0:
        return [], {"matchedVia": matched_via, "unmatchedStateProvinces": sorted(unmatched_state_provinces)}

    threshold = max(2, total * 0.05)
    qualifying = [slug for slug, c in counts.items() if c >= threshold]
    qualifying.sort(key=lambda s: counts[s], reverse=True)
    qualifying = qualifying[:10]

    return qualifying, {
        "matchedVia": matched_via,
        "unmatchedStateProvinces": sorted(unmatched_state_provinces),
        "counts": counts,
    }


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


def process_species(
    resolved: list[dict], name_index: dict[str, str], polygon_index: list[tuple[object, str]],
    out_dir: Path, session: requests.Session, delay: float,
) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "state-manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    already_done = load_processed_slugs(manifest_path)
    stats = {"resolved_with_states": 0, "no_occurrences_with_state": 0}

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, sp in enumerate(resolved, 1):
            slug = sp["slug"]
            if slug in already_done:
                continue

            record = {"slug": slug, "scientificName": sp["scientificName"]}
            try:
                occurrences = fetch_occurrences(sp["gbifKey"], session)
                state_slugs, debug = derive_state_slugs(occurrences, name_index, polygon_index)
                record["stateSlugs"] = state_slugs
                record["debug"] = debug
                if state_slugs:
                    stats["resolved_with_states"] += 1
                else:
                    stats["no_occurrences_with_state"] += 1
                    todo_f.write(f"- [ ] {sp['scientificName']} ({slug}): no occurrences resolved to a known state\n")
            except Exception as exc:  # noqa: BLE001
                record["stateSlugs"] = []
                record["error"] = str(exc)
                todo_f.write(f"- [ ] {sp['scientificName']} ({slug}): unexpected error: {exc}\n")

            manifest_f.write(json.dumps(record) + "\n")
            manifest_f.flush()
            todo_f.flush()

            if i % 50 == 0:
                log(f"{i}/{len(resolved)} processed ({stats})")

            time.sleep(delay)

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--identity-manifest", type=Path, default=DEFAULT_IDENTITY_MANIFEST)
    parser.add_argument("--states-json", type=Path, default=DEFAULT_STATES_JSON)
    parser.add_argument("--geojson", type=Path, default=DEFAULT_GEOJSON)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--delay", type=float, default=0.3)
    args = parser.parse_args()

    resolved = []
    for line in args.identity_manifest.read_text().splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        if r.get("status") == "resolved":
            resolved.append({"slug": r["slug"], "scientificName": r["scientificName"], "gbifKey": r["gbifKey"]})

    if args.limit:
        resolved = resolved[: args.limit]

    states = json.loads(args.states_json.read_text())
    name_index = build_state_name_index(states)
    polygon_index = build_polygon_index(args.geojson, name_index)

    out_dir = args.out.expanduser().resolve()
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    log(f"Resolved species to process: {len(resolved)}")
    log(f"State name index: {len(name_index)} states, polygon index: {len(polygon_index)} features")
    log(f"Output directory: {out_dir}")

    stats = process_species(resolved, name_index, polygon_index, out_dir, session, args.delay)

    log("\n=== Summary ===")
    log(str(stats))
    log(f"Manifest: {out_dir / 'state-manifest.jsonl'}")


if __name__ == "__main__":
    main()
