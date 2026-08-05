"""Stage 2 merge: append a completed batch of new species into species.json.

Reads a batch's hand/Claude-composed descriptions
(pipeline/data/raw/new-species/batches/<batch>-descriptions.json, a
{slug: {description, habitat}} map written after reading that batch's
Wikipedia extracts), joins it against identity-manifest.jsonl and
state-manifest.jsonl, assembles full Species records, and APPENDS them to
public/data/species.json.

Strictly additive: never rewrites or removes an existing entry (checked via
a before/after diff of every pre-existing slug's JSON). Skips (with a
reason logged) any candidate whose Species record would be incomplete
(required field missing) rather than shipping a broken entry.

Usage:
    python3 2026-08-04-merge-new-species.py --batch-name batch-001
    python3 2026-08-04-merge-new-species.py --batch-name batch-001 --dry-run
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_LIVE_SPECIES_JSON = REPO_ROOT / "public" / "data" / "species.json"
DEFAULT_IDENTITY_MANIFEST = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "identity-manifest.jsonl"
DEFAULT_STATE_MANIFEST = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "state-manifest.jsonl"
DEFAULT_BATCHES_DIR = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "batches"
DEFAULT_PROGRESS = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "_progress.md"

REQUIRED_FIELDS = [
    "slug", "commonName", "scientificName", "taxon", "conservationStatus",
    "description", "habitat", "stateSlugs", "photoUrl", "photoAttribution", "sourceCitations",
]


def log(msg: str) -> None:
    print(msg, flush=True)


def load_jsonl_by_slug(path: Path) -> dict[str, dict]:
    """Keys only by `slug` - unresolved manifest rows (no_wikidata_match,
    no_status, error) have no `slug` field and are intentionally skipped;
    build_species_record already treats a missing identity as unmergeable."""
    by_slug = {}
    if not path.exists():
        return by_slug
    for line in path.read_text().splitlines():
        if line.strip():
            r = json.loads(line)
            if "slug" in r:
                by_slug[r["slug"]] = r
    return by_slug


def build_species_record(identity: dict, state: dict, descriptions: dict) -> tuple[dict | None, str | None]:
    slug = identity["slug"]
    desc_entry = descriptions.get(slug)
    if not desc_entry or not desc_entry.get("description") or not desc_entry.get("habitat"):
        return None, "missing composed description/habitat"

    record = {
        "slug": slug,
        "commonName": identity["commonName"],
        "scientificName": identity["scientificName"],
        "taxon": identity["taxon"],
        "conservationStatus": identity["conservationStatus"],
        "description": desc_entry["description"],
        "habitat": desc_entry["habitat"],
        "stateSlugs": state.get("stateSlugs", []) if state else [],
        "photoUrl": identity["photoUrl"],
        "photoAttribution": identity["photoAttribution"],
        "sourceCitations": [
            "GBIF Occurrence Records",
            "Wikidata",
            "Wikipedia",
        ],
        "taxonClassification": identity.get("taxonClassification"),
        "needsResearch": True,
    }

    missing = [f for f in REQUIRED_FIELDS if record.get(f) in (None, "")]
    if missing:
        return None, f"missing required field(s): {missing}"

    return record, None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch-name", required=True)
    parser.add_argument("--live-species-json", type=Path, default=DEFAULT_LIVE_SPECIES_JSON)
    parser.add_argument("--identity-manifest", type=Path, default=DEFAULT_IDENTITY_MANIFEST)
    parser.add_argument("--state-manifest", type=Path, default=DEFAULT_STATE_MANIFEST)
    parser.add_argument("--batches-dir", type=Path, default=DEFAULT_BATCHES_DIR)
    parser.add_argument("--progress", type=Path, default=DEFAULT_PROGRESS)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    descriptions_path = args.batches_dir / f"{args.batch_name}-descriptions.json"
    if not descriptions_path.exists():
        raise SystemExit(f"Not found: {descriptions_path} - compose descriptions for this batch first")

    descriptions = json.loads(descriptions_path.read_text())
    identity_by_slug = load_jsonl_by_slug(args.identity_manifest)
    state_by_slug = load_jsonl_by_slug(args.state_manifest)

    live_species = json.loads(args.live_species_json.read_text())
    live_slugs_before = {s["slug"] for s in live_species}
    live_snapshot = {s["slug"]: json.dumps(s, sort_keys=True) for s in live_species}

    added, skipped = [], []
    for slug in descriptions:
        identity = identity_by_slug.get(slug)
        if not identity or identity.get("status") != "resolved":
            skipped.append((slug, "no resolved identity-manifest entry"))
            continue
        if slug in live_slugs_before:
            skipped.append((slug, "slug already live - not touching"))
            continue
        state = state_by_slug.get(slug)
        record, reason = build_species_record(identity, state, descriptions)
        if record is None:
            skipped.append((slug, reason))
            continue
        added.append(record)

    log(f"Batch: {args.batch_name}")
    log(f"Composed descriptions: {len(descriptions)}")
    log(f"Ready to add: {len(added)}")
    log(f"Skipped: {len(skipped)}")
    for slug, reason in skipped:
        log(f"  - {slug}: {reason}")

    if args.dry_run:
        log("\n--dry-run: not writing species.json")
        return

    if not added:
        log("\nNothing to merge.")
        return

    live_species.extend(added)
    args.live_species_json.write_text(json.dumps(live_species, indent=2) + "\n")

    # Verify additive-only: every pre-existing slug's JSON is byte-identical.
    reloaded = {s["slug"]: json.dumps(s, sort_keys=True) for s in json.loads(args.live_species_json.read_text())}
    mutated = [slug for slug, snap in live_snapshot.items() if reloaded.get(slug) != snap]
    if mutated:
        raise SystemExit(f"REFUSING silently: {len(mutated)} pre-existing entries changed: {mutated[:10]}")

    log(f"\nWrote {args.live_species_json} (+{len(added)} species, {len(live_species)} total)")

    with args.progress.open("a") as f:
        f.write(f"- {args.batch_name}: +{len(added)} merged, {len(skipped)} skipped\n")


if __name__ == "__main__":
    main()
