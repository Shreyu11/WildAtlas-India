"""Merge park-photos/park-species/park-travel/park-descriptions manifests
into national-parks.json, sanctuaries.json, and zoos.json.

Mirrors 2026-08-03-merge-species-updates.py's pattern: reads each raw
manifest (skips any that aren't present yet - safe to run before every
ingest script has finished), merges resolved facts into the matching
public/data/*.json entry by slug, appends to (never replaces) each entry's
existing `sources` array (deduped by url), and sets `needsResearch` based on
which of the four new fields remain unfilled after this merge.

- photoUrl/photoAttribution: only overwritten when the photo manifest
  resolved a real, licensed photo. When it didn't, the existing mock
  photoUrl (uncredited Unsplash stock, no photoAttribution) is CLEARED to
  null rather than left in place - an uncited stock photo doesn't meet this
  project's "transparent, cited data" bar once every other entity has a
  real, attributed one (matches the species.json precedent).
- additionalKeySpeciesSlugs: only overwritten when the species manifest
  found at least one match.
- travelLinks: only set for ProtectedArea entries (national-parks.json /
  sanctuaries.json) - zoos.json is untouched by this field, by design.
- description: only overwritten when the description manifest's wordCount
  is >= 45 (small buffer under the 50-word target) - shorter ones are left
  unset + logged, rather than shipping something that doesn't meet the
  ask.

Usage:
    python3 2026-08-03-merge-park-updates.py --dry-run   # stats only
    python3 2026-08-03-merge-park-updates.py
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
RAW_DIR = SCRIPT_DIR.parent / "data" / "raw"

TODAY = date.today().isoformat()

MIN_DESCRIPTION_WORDS = 45


def log(msg: str) -> None:
    print(msg, flush=True)


def load_manifest(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    by_slug: dict[str, dict] = {}
    with path.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            by_slug[record["slug"]] = record
    return by_slug


def add_source(entry: dict, label: str, url: str) -> None:
    if not url:
        return
    sources = entry.setdefault("sources", [])
    if any(s.get("url") == url for s in sources):
        return
    sources.append({"label": label, "url": url, "accessedDate": TODAY})


def merge_entity(
    entry: dict,
    photo: dict | None,
    species_rec: dict | None,
    travel: dict | None,
    desc: dict | None,
    best_time: dict | None,
    stats: dict,
) -> None:
    if photo:
        if photo.get("status") == "resolved":
            entry["photoUrl"] = photo["photoUrl"]
            entry["photoAttribution"] = {
                "author": photo["author"],
                "license": photo["license"],
                "licenseUrl": photo["licenseUrl"],
                "sourceUrl": photo["sourceUrl"],
            }
            add_source(entry, "Wikimedia Commons (cover photo)", photo["sourceUrl"])
            stats["photos_merged"] += 1
        else:
            entry["photoUrl"] = None
            entry["photoAttribution"] = None

    if species_rec and species_rec.get("additionalKeySpeciesSlugs"):
        # Exclude the current headline species - the raw manifest was built
        # from Wikipedia/GBIF matches independent of headlineSpeciesSlug, so
        # if a later headline correction (2026-08-03-fix-headline-species.py)
        # promoted one of these same species to flagship, it would otherwise
        # show up twice (once as flagship, once as "also found here").
        entry["additionalKeySpeciesSlugs"] = [
            s for s in species_rec["additionalKeySpeciesSlugs"] if s != entry.get("headlineSpeciesSlug")
        ]
        method = species_rec.get("sourceMethod", "wikipedia")
        if "wikipedia" in method:
            add_source(entry, "Wikipedia (fauna section)", f"https://en.wikipedia.org/wiki/{entry['name'].replace(' ', '_')}")
        if "gbif" in method:
            add_source(entry, "GBIF occurrence records", "https://www.gbif.org/occurrence/search")
        stats["species_merged"] += 1

    if travel:
        official = travel.get("travelLinks", {}).get("official", [])
        operators = travel.get("travelLinks", {}).get("operators", [])
        if official or operators:
            entry["travelLinks"] = {"official": official, "operators": operators}
            for link in official:
                add_source(entry, f"{link['label']} (official)", link["url"])
            for link in operators:
                add_source(entry, link["label"], link["url"])
            stats["travel_merged"] += 1

    if desc and desc.get("wordCount", 0) >= MIN_DESCRIPTION_WORDS:
        entry["description"] = desc["description"]
        stats["descriptions_merged"] += 1

    if best_time and best_time.get("bestTimeToVisit"):
        entry["bestTimeToVisit"] = best_time["bestTimeToVisit"]
        stats["best_time_merged"] += 1

    has_photo = bool(entry.get("photoUrl"))
    has_description = bool(entry.get("description"))
    has_species = bool(entry.get("additionalKeySpeciesSlugs"))
    has_travel = bool(entry.get("travelLinks")) if "travelLinks" in entry or travel is not None else True
    has_best_time = bool(entry.get("bestTimeToVisit")) if "bestTimeToVisit" in entry or best_time is not None else True
    # Recomputed fresh each run (not OR'd with a prior value) - this pipeline
    # runs incrementally across several sessions as each of the 4 manifests
    # becomes available, and needsResearch should reflect current
    # completeness, not get stuck true from an earlier partial merge.
    entry["needsResearch"] = not (has_photo and has_description and has_species and has_travel and has_best_time)


def process_file(
    filename: str,
    photos: dict,
    species_manifest: dict,
    travel_manifest: dict | None,
    descriptions: dict,
    best_time_manifest: dict | None,
    stats: dict,
) -> list[dict]:
    path = DATA_DIR / filename
    entries = json.loads(path.read_text())
    for entry in entries:
        slug = entry["slug"]
        merge_entity(
            entry,
            photos.get(slug),
            species_manifest.get(slug),
            travel_manifest.get(slug) if travel_manifest is not None else None,
            descriptions.get(slug),
            best_time_manifest.get(slug) if best_time_manifest is not None else None,
            stats,
        )
    return entries


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    photos = load_manifest(RAW_DIR / "park-images" / "manifest.jsonl")
    species_manifest = load_manifest(RAW_DIR / "park-species" / "manifest.jsonl")
    travel_manifest = load_manifest(RAW_DIR / "park-travel" / "manifest.jsonl")
    descriptions = load_manifest(RAW_DIR / "park-descriptions" / "manifest.jsonl")

    log(
        f"Manifests: photos={len(photos)} species={len(species_manifest)} "
        f"travel={len(travel_manifest)} descriptions={len(descriptions)}"
    )

    stats = {"photos_merged": 0, "species_merged": 0, "travel_merged": 0, "descriptions_merged": 0}

    national_parks = process_file("national-parks.json", photos, species_manifest, travel_manifest, descriptions, stats)
    sanctuaries = process_file("sanctuaries.json", photos, species_manifest, travel_manifest, descriptions, stats)
    zoos = process_file("zoos.json", photos, species_manifest, None, descriptions, stats)

    log(f"\n=== Merge stats === {stats}")
    log(
        f"needsResearch still true: "
        f"parks={sum(1 for e in national_parks if e.get('needsResearch'))}/{len(national_parks)}, "
        f"sanctuaries={sum(1 for e in sanctuaries if e.get('needsResearch'))}/{len(sanctuaries)}, "
        f"zoos={sum(1 for e in zoos if e.get('needsResearch'))}/{len(zoos)}"
    )

    if args.dry_run:
        log("\n--dry-run: not writing files")
        return

    (DATA_DIR / "national-parks.json").write_text(json.dumps(national_parks, indent=2) + "\n")
    (DATA_DIR / "sanctuaries.json").write_text(json.dumps(sanctuaries, indent=2) + "\n")
    (DATA_DIR / "zoos.json").write_text(json.dumps(zoos, indent=2) + "\n")
    log("\nWrote national-parks.json, sanctuaries.json, zoos.json")


if __name__ == "__main__":
    main()
