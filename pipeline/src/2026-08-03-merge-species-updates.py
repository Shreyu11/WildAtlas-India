"""Merge physical-trait and bird-audio ingest manifests into species.json.

Reads pipeline/data/raw/traits/manifest.jsonl (always) and
pipeline/data/raw/audio/manifest.jsonl (if present - it's fine to run this
merge before the audio ingest has been done; re-running later picks up
audio once that manifest exists) and merges resolved facts into matching
public/data/species.json entries by slug.

- physicalTraits: only set/overwritten for fields the manifest actually
  resolved - never clears an existing field just because this run didn't
  find it again.
- audioUrl/audioAttribution: only set for birds with a "resolved" audio
  manifest entry - mammals are untouched (they keep the synthesizer
  fallback per docs/DATASET_PLAN.md Sec 0, 2026-08-03).
- needsResearch stays true if it already was, or becomes true if this
  species has neither physicalTraits nor (for birds) audio after this
  merge - per the existing "needsResearch reflects any missing additive
  field" convention (DATASET_PLAN.md Sec 2.1).

Writes public/data/species.json back in place - git provides the diff/
safety net (`git diff public/data/species.json` after running).

Usage:
    python3 2026-08-03-merge-species-updates.py
    python3 2026-08-03-merge-species-updates.py --dry-run   # print stats only, don't write
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_SPECIES_JSON = REPO_ROOT / "public" / "data" / "species.json"
DEFAULT_TRAITS_MANIFEST = SCRIPT_DIR.parent / "data" / "raw" / "traits" / "manifest.jsonl"
DEFAULT_AUDIO_MANIFEST = SCRIPT_DIR.parent / "data" / "raw" / "audio" / "manifest.jsonl"


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


def merge(
    species_list: list[dict], traits_by_slug: dict[str, dict], audio_by_slug: dict[str, dict]
) -> dict:
    stats = {"traits_merged": 0, "audio_merged": 0, "needs_research_set": 0, "needs_research_cleared": 0}

    for sp in species_list:
        slug = sp["slug"]

        trait_record = traits_by_slug.get(slug)
        if trait_record and trait_record.get("status") == "resolved" and trait_record.get("physicalTraits"):
            existing = sp.get("physicalTraits") or {}
            existing.update(trait_record["physicalTraits"])
            sp["physicalTraits"] = existing
            stats["traits_merged"] += 1

        if sp.get("taxon") == "bird":
            audio_record = audio_by_slug.get(slug)
            if audio_record and audio_record.get("status") == "resolved":
                sp["audioUrl"] = audio_record["audioUrl"]
                sp["audioAttribution"] = audio_record["audioAttribution"]
                stats["audio_merged"] += 1

        has_traits = bool(sp.get("physicalTraits"))
        has_audio = sp.get("taxon") != "bird" or bool(sp.get("audioUrl"))
        was_needs_research = sp.get("needsResearch", False)
        sp["needsResearch"] = was_needs_research or not (has_traits and has_audio)
        if sp["needsResearch"] and not was_needs_research:
            stats["needs_research_set"] += 1

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--species-json", type=Path, default=DEFAULT_SPECIES_JSON)
    parser.add_argument("--traits-manifest", type=Path, default=DEFAULT_TRAITS_MANIFEST)
    parser.add_argument("--audio-manifest", type=Path, default=DEFAULT_AUDIO_MANIFEST)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    species_list = json.loads(args.species_json.read_text())
    traits_by_slug = load_manifest(args.traits_manifest)
    audio_by_slug = load_manifest(args.audio_manifest)

    log(f"Species: {len(species_list)} entries from {args.species_json}")
    log(f"Traits manifest: {len(traits_by_slug)} entries from {args.traits_manifest}")
    log(f"Audio manifest: {len(audio_by_slug)} entries from {args.audio_manifest}"
        + (" (not found - run the audio ingest first for bird audio)" if not audio_by_slug else ""))

    stats = merge(species_list, traits_by_slug, audio_by_slug)
    log(f"\n=== Merge stats === {stats}")

    if args.dry_run:
        log("\n--dry-run: not writing species.json")
        return

    args.species_json.write_text(json.dumps(species_list, indent=2) + "\n")
    log(f"\nWrote {args.species_json}")


if __name__ == "__main__":
    main()
