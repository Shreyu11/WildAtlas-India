"""Merge international conservation designations (UNESCO World Heritage
Site, Ramsar Wetland, UNESCO-MAB Biosphere Reserve) into national-parks.json
and sanctuaries.json, sourced from a user-supplied WDPA/Protected Planet
bulk CSV export for India.

Context: India restricts most of its protected-area data on Protected
Planet's live web/API (per protectedplanet.net/country/IND, ~900 of ~990
entries are not publicly viewable) - but the public bulk CSV download still
includes the ~90 entries that carry an INTERNATIONAL designation (these are
reported to the UN/UNESCO/Ramsar Secretariat directly, not just MoEFCC), so
this bulk file is a legitimate, already-approved (CLAUDE.md: Protected
Planet/WDPA) way to confirm which of our existing parks/sanctuaries hold
real international status. It is NOT a comprehensive national-parks/
wildlife-sanctuaries registry (India's domestic-only designations aren't in
this feed) - see docs/DATASET_PLAN.md sec 2.2.3 for the full context.

Matches by name (case-insensitive substring, both directions) against our
existing entities, with one manual override: WDPA's row for Assam's park is
still filed under "Manas Wildlife Sanctuary" (its pre-1990 name, before
IUCN redesignated it a National Park) - our entity is "Manas National
Park", which wouldn't substring-match automatically.

Usage:
    python3 2026-08-04-merge-international-designations.py --csv /path/to/wdpa.csv --dry-run
    python3 2026-08-04-merge-international-designations.py --csv /path/to/wdpa.csv
"""

from __future__ import annotations

import argparse
import csv
import json
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"

TODAY = date.today().isoformat()

ENTITY_FILES = ["national-parks.json", "sanctuaries.json"]

DESIGNATION_LABELS = {
    "World Heritage Site (natural or mixed)": "UNESCO World Heritage Site",
    "Wetland of International Importance (Ramsar Site)": "Ramsar Wetland of International Importance",
    "UNESCO-MAB Biosphere Reserve": "UNESCO-MAB Biosphere Reserve",
}

# slug -> WDPA NAME_ENG, for entities whose name doesn't substring-match
# WDPA's record (see docstring).
NAME_OVERRIDES = {
    "manas-national-park": "manas wildlife sanctuary",
}


def log(msg: str) -> None:
    print(msg, flush=True)


def load_wdpa(csv_path: Path) -> dict[str, list[tuple[str, str]]]:
    by_name: dict[str, list[tuple[str, str]]] = {}
    with csv_path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["NAME_ENG"].strip().lower()
            by_name.setdefault(name, []).append((row["DESIG_ENG"], row["STATUS_YR"]))
    return by_name


def find_designations(entity_name: str, entity_slug: str, wdpa_by_name: dict) -> list[tuple[str, str]] | None:
    if entity_slug in NAME_OVERRIDES:
        return wdpa_by_name.get(NAME_OVERRIDES[entity_slug])
    name_lower = entity_name.lower()
    for wdpa_name, designations in wdpa_by_name.items():
        if wdpa_name in name_lower or name_lower in wdpa_name:
            return designations
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", type=Path, required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    wdpa_by_name = load_wdpa(args.csv)
    log(f"Loaded {len(wdpa_by_name)} unique WDPA entity names from {args.csv}")

    matches = []
    for filename in ENTITY_FILES:
        path = DATA_DIR / filename
        entities = json.loads(path.read_text())
        changed = False

        for entity in entities:
            found = find_designations(entity["name"], entity["slug"], wdpa_by_name)
            if not found:
                continue

            designations = []
            for desig_eng, status_yr in found:
                label = DESIGNATION_LABELS.get(desig_eng, desig_eng)
                try:
                    since = int(status_yr)
                except (TypeError, ValueError):
                    continue
                entry_dup = any(d["designation"] == label and d["since"] == since for d in designations)
                if not entry_dup:
                    designations.append({"designation": label, "since": since})

            if not designations:
                continue

            entity["internationalDesignations"] = designations
            sources = entity.setdefault("sources", [])
            source_url = "https://www.protectedplanet.net/country/IND"
            if not any(s.get("url") == source_url for s in sources):
                sources.append({"label": "Protected Planet / WDPA (international designations)", "url": source_url, "accessedDate": TODAY})

            matches.append((entity["slug"], entity["name"], designations))
            changed = True

        if changed and not args.dry_run:
            path.write_text(json.dumps(entities, indent=2) + "\n")

    log(f"\n=== {len(matches)} entities matched ===")
    for slug, name, designations in matches:
        log(f"- {name} ({slug}): {designations}")

    if args.dry_run:
        log("\n--dry-run: not writing files")
    else:
        log("\nWrote national-parks.json, sanctuaries.json")


if __name__ == "__main__":
    main()
