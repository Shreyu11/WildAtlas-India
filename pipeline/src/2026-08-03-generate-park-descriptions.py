"""Description generator for national parks, sanctuaries, and zoos.

Synthesizes a fresh, >=50-word description per entity entirely from facts
already present in this project's own sourced data - state name,
areaSqKm, uniqueFeatures (parks/sanctuaries), establishedYear/city (zoos),
headline + additional key species names, and visitingHours.publicAccess -
rather than fetching and paraphrasing Wikipedia prose. This sidesteps any
copyright concern (nothing here is copied from an external source) and
needs no new network calls: every clause traces back to a field that
already has its own citation in the entity's existing `sources` array, so
no new source entry is added for `description` itself.

Depends on 2026-08-03-ingest-park-species.py's manifest for the
"other notable wildlife" clause - run that first (or this script degrades
gracefully to a shorter description without that clause, still >=50 words
if uniqueFeatures/area are present; entities where that's not enough are
logged to _todo.md rather than padded with filler).

Only produces a raw manifest under --out. Does NOT touch public/data/*.json
- merging is a separate step (2026-08-03-merge-park-updates.py).

Usage:
    python3 2026-08-03-generate-park-descriptions.py
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "park-descriptions"
DEFAULT_SPECIES_MANIFEST = SCRIPT_DIR.parent / "data" / "raw" / "park-species" / "manifest.jsonl"

ENTITY_FILES = {
    "national-parks.json": None,
    "sanctuaries.json": None,
    "zoos.json": "zoo",
}

TYPE_LABEL = {
    "national-park": "national park",
    "wildlife-sanctuary": "wildlife sanctuary",
    "bird-sanctuary": "bird sanctuary",
    "zoo": "zoo",
}

ACCESS_CLAUSE = {
    "open": "It is open to visitors with a standard entry or safari permit.",
    "permit-required": "Visiting requires a specific access permit beyond standard entry.",
    "restricted": "It is not routinely open to the general public.",
}


def log(msg: str) -> None:
    print(msg, flush=True)


def load_json(name: str) -> list[dict]:
    return json.loads((DATA_DIR / name).read_text())


def load_species_manifest(path: Path) -> dict[str, list[str]]:
    if not path.exists():
        return {}
    by_slug = {}
    with path.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            by_slug[record["slug"]] = record.get("additionalKeySpeciesSlugs", [])
    return by_slug


def word_count(text: str) -> int:
    return len(text.split())


def build_description(
    entity: dict,
    entity_type: str,
    state_name: str | None,
    headline_name: str | None,
    additional_names: list[str],
) -> str:
    name = entity["name"]
    type_label = TYPE_LABEL.get(entity_type, "protected area")
    sentences = []

    opener = f"{name} is a {type_label}"
    if state_name:
        opener += f" in {state_name}"
    if entity.get("areaSqKm"):
        opener += f", spanning {entity['areaSqKm']:,} sq km"
    elif entity_type == "zoo" and entity.get("city"):
        opener += f", located in {entity['city']}"
    opener += "."
    sentences.append(opener)

    if entity_type == "zoo" and entity.get("establishedYear"):
        sentences.append(f"It was established in {entity['establishedYear']} as a captive-wildlife and conservation-education facility.")

    unique_features = entity.get("uniqueFeatures")
    if unique_features:
        sentences.append(unique_features)

    if headline_name:
        verb = "is home to" if entity_type == "zoo" else "flagship species is the"
        if entity_type == "zoo":
            sentences.append(f"The zoo {verb} the {headline_name} among its resident wildlife.")
        else:
            sentences.append(f"Its {verb} {headline_name}.")

    if additional_names:
        if len(additional_names) == 1:
            species_clause = additional_names[0]
        else:
            species_clause = ", ".join(additional_names[:-1]) + f", and {additional_names[-1]}"
        seen_verb = "seen here" if entity_type != "zoo" else "also housed here"
        sentences.append(f"Other notable species {seen_verb} include {species_clause}.")

    access = (entity.get("visitingHours") or {}).get("publicAccess")
    if access and entity_type != "zoo" and access in ACCESS_CLAUSE:
        sentences.append(ACCESS_CLAUSE[access])

    return " ".join(sentences)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--species-manifest", type=Path, default=DEFAULT_SPECIES_MANIFEST)
    args = parser.parse_args()

    out_dir = args.out.expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    species = load_json("species.json")
    species_by_slug = {s["slug"]: s["commonName"] for s in species}
    states = load_json("states.json")
    state_name_by_slug = {s["slug"]: s["name"] for s in states}
    additional_species_by_slug = load_species_manifest(args.species_manifest)

    stats = {"generated": 0, "too_short": 0}
    records = []

    for filename, forced_type in ENTITY_FILES.items():
        entities = load_json(filename)
        for entity in entities:
            entity_type = forced_type or entity.get("type")
            state_name = state_name_by_slug.get(entity.get("stateSlug"))
            headline_slug = entity.get("headlineSpeciesSlug")
            headline_name = species_by_slug.get(headline_slug) if headline_slug else None
            additional_slugs = additional_species_by_slug.get(entity["slug"], [])
            additional_names = [
                species_by_slug[s] for s in additional_slugs if s in species_by_slug and s != headline_slug
            ]

            description = build_description(entity, entity_type, state_name, headline_name, additional_names)
            wc = word_count(description)
            records.append({"slug": entity["slug"], "description": description, "wordCount": wc})
            stats["generated"] += 1
            if wc < 50:
                stats["too_short"] += 1

    with manifest_path.open("w") as manifest_f, todo_path.open("w") as todo_f:
        for r in records:
            manifest_f.write(json.dumps(r) + "\n")
            if r["wordCount"] < 50:
                todo_f.write(f"- [ ] {r['slug']}: description only {r['wordCount']} words (needs more sourced facts)\n")

    log(f"=== Summary === {stats}")
    log(f"Manifest: {manifest_path}")
    log(f"Skipped/short log: {todo_path}")


if __name__ == "__main__":
    main()
