"""Best season/time-to-visit generator for national parks and sanctuaries
(zoos excluded - ex-situ facilities open year-round, season doesn't apply).

No new external source or network call: derives a seasonality bucket from
each entity's own (already-verified, per-species-cited) flagship species
habitat description in species.json, rather than a blunt per-state guess -
a park's actual terrain/elevation (readable from its flagship species'
habitat text: "alpine", "desert", "mangrove", "evergreen", etc.) is a much
more precise signal than its state, since e.g. Uttarakhand alone contains
both lowland Corbett (open most of the year) and alpine Valley of
Flowers/Nanda Devi (snowbound Nov-Apr).

Each bucket's date range and reasoning (winter dry season for wildlife
viewing at deciduous-forest waterholes, NTCA's mandated monsoon core-zone
closure, Himalayan snowmelt/road-closure pattern, monsoon-driven marine
visibility) reflects standard, well-established Indian park-tourism
seasonality - not a park-specific scraped fact, so no per-entity citation
is added; this is the same "synthesized from already-cited facts" pattern
already used for `description` (see 2026-08-03-generate-park-descriptions.py).

Classification signal priority matters: the entity's own name + uniqueFeatures
text is checked FIRST (park-specific facts), falling back to the flagship
species' habitat text only when neither matches. Species habitat strings
describe that species' full range across India, not this specific park - e.g.
Royal Bengal Tiger's shared habitat text lists "mangrove forests" (true for
Sundarbans) alongside "dry/moist deciduous forest" (true for landlocked
Ranthambore/Kanha/Bandhavgarh), so keying on habitat text alone falsely
tagged 25+ inland tiger reserves as coastal/marine in an earlier version of
this script - caught by inspecting the actual generated output before
merging, not by any automated check.

Usage:
    python3 2026-08-04-generate-best-time-to-visit.py
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "best-time-to-visit"

ENTITY_FILES = ["national-parks.json", "sanctuaries.json"]  # zoos excluded, see docstring

# Checked in order - first matching habitat-keyword bucket wins. Order
# matters: e.g. "high-altitude" alpine wetlands (black-necked crane) should
# win over the generic wetland/bird-sanctuary rule.
HABITAT_BUCKETS: list[tuple[str, re.Pattern, str]] = [
    (
        "alpine",
        re.compile(r"alpine|high[- ]altitude|high mountain|trans-himalayan|snow line|subalpine", re.IGNORECASE),
        "May to October is best - most high-altitude routes are snowbound and closed from November to April, and wildlife is far harder to spot in deep snow.",
    ),
    (
        "desert",
        re.compile(r"desert|arid|salt marsh|saline|mudflat", re.IGNORECASE),
        "October to March is best, avoiding the extreme summer heat (April-June); many desert species are also easiest to spot near winter waterholes.",
    ),
    (
        "marine",
        re.compile(r"marine|\bcoral\b|seagrass|lagoon|\bcoastline\b|\bgulf\b|\bisland(s)?\b|\bbay\b", re.IGNORECASE),
        "October to March is best, for calm seas and clear water visibility; the June-September monsoon brings rough seas and reduced access.",
    ),
    (
        "western-ghats",
        re.compile(r"evergreen|rainforest|western ghats|shola", re.IGNORECASE),
        "September to April is best; the June-August monsoon brings lush scenery but reduces trail access and wildlife visibility.",
    ),
]

BIRD_SANCTUARY_NOTE = "November to February is peak season - the winter migratory-bird window, when wintering waterfowl numbers are highest."

# "High-altitude"/"alpine" alone is ambiguous: it's true of both Himalayan
# peaks (genuinely snowbound Nov-Apr) and South Indian Western Ghats shola-
# grassland hills (Nilgiri Tahr territory - Kerala/Tamil Nadu/Karnataka -
# which never gets snowbound; monsoon is the actual access constraint
# there, same as the rest of the Western Ghats). Gate the alpine bucket to
# actual Himalayan states so Western Ghats parks fall through to the
# "shola" match in HABITAT_BUCKETS instead.
HIMALAYAN_STATES = {
    "jammu-and-kashmir", "ladakh", "himachal-pradesh", "uttarakhand",
    "sikkim", "arunachal-pradesh", "west-bengal",
}

# Entities not formally typed "bird-sanctuary" but functionally are one
# (e.g. Keoladeo National Park, a UNESCO World Heritage wetland famous for
# 370+ migratory species) - own-text signal, checked before habitat
# fallback so a migratory species' dual seasonal habitat range (e.g. Bar-
# headed Goose: high-altitude lakes in summer, lowland wetlands in winter)
# can't misclassify the park as alpine.
MIGRATORY_BIRD_PATTERN = re.compile(r"migratory (bird|species|waterfowl)|bird sanctuary|wetland bird", re.IGNORECASE)

DEFAULT_NOTE = (
    "November to April is best - dry-season foliage thins out and wildlife concentrates around waterholes, "
    "making sightings far easier. Core zones of many reserves are closed during the monsoon "
    "(1 July-30 September, per NTCA guidelines) regardless of season."
)


def log(msg: str) -> None:
    print(msg, flush=True)


def classify(
    name: str, unique_features: str | None, habitat: str | None, entity_type: str, state_slug: str
) -> tuple[str, str]:
    own_text = f"{name} {unique_features or ''}"

    if entity_type == "bird-sanctuary" or MIGRATORY_BIRD_PATTERN.search(own_text):
        return "bird-sanctuary", BIRD_SANCTUARY_NOTE

    is_himalayan = state_slug in HIMALAYAN_STATES

    # Park-specific text next (own name + hand-authored uniqueFeatures) -
    # far more reliable than a shared species-wide habitat description.
    for bucket, pattern, note in HABITAT_BUCKETS:
        if bucket == "alpine" and not is_himalayan:
            continue
        if pattern.search(own_text):
            return bucket, note

    if habitat:
        for bucket, pattern, note in HABITAT_BUCKETS:
            if bucket == "alpine" and not is_himalayan:
                continue
            if pattern.search(habitat):
                return bucket, note
    return "default", DEFAULT_NOTE


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    out_dir = args.out.expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"

    species = json.loads((DATA_DIR / "species.json").read_text())
    species_by_slug = {s["slug"]: s for s in species}

    stats = {"alpine": 0, "desert": 0, "marine": 0, "western-ghats": 0, "bird-sanctuary": 0, "default": 0}
    records = []

    for filename in ENTITY_FILES:
        entities = json.loads((DATA_DIR / filename).read_text())
        for entity in entities:
            headline = species_by_slug.get(entity.get("headlineSpeciesSlug"))
            habitat = headline.get("habitat") if headline else None
            bucket, note = classify(
                entity["name"], entity.get("uniqueFeatures"), habitat, entity.get("type"), entity.get("stateSlug", "")
            )
            stats[bucket] += 1
            records.append({"slug": entity["slug"], "bestTimeToVisit": note})

    manifest_path.write_text("\n".join(json.dumps(r) for r in records) + "\n")
    log(f"=== Summary === {stats}")
    log(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
