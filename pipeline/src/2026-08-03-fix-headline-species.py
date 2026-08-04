"""Fix incorrect headlineSpeciesSlug assignments found by the 2026-08-03
audit (2026-08-03-audit-headline-species.py).

Context: the original Phase A seed data assigned headlineSpeciesSlug in a
way that turns out to correlate almost perfectly with STATE rather than the
specific park/sanctuary/zoo - e.g. every Gujarat entity got "asiatic-lion"
regardless of whether it's a desert wild-ass sanctuary or a coral-reef
marine park, every Andaman & Nicobar entity got "narcondam-hornbill" (a bird
endemic to one specific tiny island, none of which are in that list), etc.
The user caught this via Marine National Park, Gulf of Kutch -> Asiatic
Lion.

Two fix strategies, both requiring positive evidence (never a blind swap):

1. AUTO-PROMOTE: for a flagged entity whose own additionalKeySpeciesSlugs
   was resolved from that entity's ACTUAL Wikipedia article (sourceMethod
   contains "wikipedia" - not the weaker GBIF-nearby fallback) and whose
   top-ranked (first-mentioned = most prominent) match is a "distinctive"
   species (large mammal or a notable bird, not a generic urban species
   like House Crow/Common Myna that says nothing about what makes this
   place special) that DIFFERS from the current headline, promote that
   species to headline. This is strong per-entity evidence, not a guess.

2. MANUAL_OVERRIDES: a small hand-researched table for cases where (a) the
   entity's own species match was weak/generic (GBIF-fallback only, common
   urban birds) but the current headline is still clearly wrong on
   name/habitat grounds (marine park with a desert lion, "Wild Ass
   Sanctuary" with a lion, "(Bison)" park with a tiger, or an Andaman island
   park with a hornbill endemic to a different, unlisted island), and (b) a
   better-fitting species exists in the current species.json roster. Left
   OUT of this table entirely where no roster species is a good fit -
   flagged needsResearch instead of forcing a still-wrong guess.

Every other flagged entity (the large majority - real tiger/elephant/snow-
leopard reserves whose short Wikipedia stub just doesn't happen to repeat
the species name) is left UNCHANGED - "not confirmed by Wikipedia" isn't
evidence of being wrong, and flipping those without positive evidence would
be exactly the kind of unreviewed guess that created this bug in the first
place.

Usage:
    python3 2026-08-03-fix-headline-species.py --dry-run   # print the diff
    python3 2026-08-03-fix-headline-species.py             # apply
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

ENTITY_FILES = ["national-parks.json", "sanctuaries.json", "zoos.json"]

# Generic/common species that are real and often present, but say nothing
# distinctive about a specific place - not eligible for auto-promotion to
# headline even if they're the top Wikipedia-matched species.
GENERIC_SPECIES = {
    "house-crow", "common-myna", "rock-pigeon", "house-sparrow", "black-kite",
    "rose-ringed-parakeet", "spotted-dove", "laughing-dove",
    "eurasian-collared-dove", "red-vented-bulbul", "red-whiskered-bulbul",
    "black-drongo", "common-tailorbird", "oriental-magpie-robin",
    "white-throated-kingfisher", "indian-pond-heron", "little-egret",
    "purple-sunbird", "purple-rumped-sunbird", "green-bee-eater",
    "greater-coucal", "jungle-babbler", "large-billed-crow", "asian-koel",
    "indian-robin", "indian-roller", "common-iora", "indian-white-eye",
    "pied-bushchat", "barn-swallow", "grey-francolin", "coppersmith-barbet",
    "black-rumped-flameback", "ashy-prinia", "pale-billed-flowerpecker",
    "rufous-treepie", "asian-palm-swift", "yellow-footed-green-pigeon",
    "grey-heron", "white-breasted-waterhen", "eurasian-collared-dove",
}

# Hand-researched fixes for cases where the entity's own auto-matched
# species list was too weak (GBIF-fallback / generic urban birds only) to
# auto-promote, but the current assignment is clearly wrong on name/habitat
# grounds and a real roster species fits. See module docstring.
MANUAL_OVERRIDES: dict[str, tuple[str, str]] = {
    # slug: (new_headline_slug, reason)
    "wild-ass-sanctuary-little-rann-of-kutch": (
        "indian-wild-ass",
        "Sanctuary is literally named for the Indian Wild Ass (Khur); asiatic-lion is Gir NP's species, not this one's.",
    ),
    "kutch-desert-wildlife-sanctuary": (
        "indian-wild-ass",
        "Rann of Kutch desert/salt-marsh habitat matches Indian Wild Ass's own habitat description; asiatic-lion (dry deciduous forest) doesn't occur here.",
    ),
    "bison-rajbari-national-park": (
        "gaur",
        "Park name explicitly says '(Bison)' - Gaur is India's wild bison; royal-bengal-tiger has no connection to this park's name or purpose.",
    ),
    "marine-national-park-gulf-of-kutch": (
        "greater-flamingo",
        "Marine/coral park on saline mudflats and lagoons - matches Greater Flamingo's own habitat description and is this park's own top Wikipedia-matched species; asiatic-lion is a dry-forest species from unrelated Gir NP.",
    ),
    "gulf-of-mannar-marine-national-park": (
        "dugong",
        "Gulf of Mannar is India's best-documented Dugong habitat (seagrass beds); indian-peafowl has no distinguishing connection to this marine park.",
    ),
    "gahirmatha-marine-sanctuary": (
        "white-throated-kingfisher",
        "Mangrove-channel coastal sanctuary (this park's own top Wikipedia-matched species) - not a tiger habitat. Note: Gahirmatha's actual best-known flagship is the Olive Ridley sea turtle, out of scope (reptile, Phase 1 is mammals+birds only) - flagged needsResearch as an honest partial fit.",
    ),
    "mahatma-gandhi-marine-national-park": (
        "dugong",
        "Wandoor coral/marine park, well-documented Dugong waters; narcondam-hornbill is endemic to Narcondam Island specifically, a different, unlisted island.",
    ),
    "middle-button-island-national-park": (
        "dugong",
        "Small coral-reef marine park in the same Mahatma Gandhi Marine NP complex; narcondam-hornbill doesn't occur here (endemic to a different island).",
    ),
    "north-button-island-national-park": (
        "dugong",
        "Small coral-reef marine park in the same Mahatma Gandhi Marine NP complex; narcondam-hornbill doesn't occur here (endemic to a different island).",
    ),
    "south-button-island-national-park": (
        "dugong",
        "Small coral-reef marine park in the same Mahatma Gandhi Marine NP complex; narcondam-hornbill doesn't occur here (endemic to a different island).",
    ),
    "rani-jhansi-marine-national-park": (
        "dugong",
        "Coral-island marine park; narcondam-hornbill doesn't occur here (endemic to a different, unlisted island).",
    ),
    "mount-harriet-national-park": (
        "brahminy-kite",
        "Coastal-forest hill park overlooking the sea - Brahminy Kite fits its coastal-forest habitat far better than narcondam-hornbill (endemic to a different island). Flagged needsResearch - roster lacks strong Andaman-forest-specific species coverage.",
    ),
    "saddle-peak-national-park": (
        "brahminy-kite",
        "North Andaman coastal-hill park - Brahminy Kite fits its coastal-forest habitat far better than narcondam-hornbill (endemic to a different island). Flagged needsResearch - roster lacks strong Andaman-forest-specific species coverage.",
    ),
    "keibul-lamjao-national-park": (
        "sangai",
        "This park exists specifically to protect the Sangai (Manipur brow-antlered deer), found nowhere else on Earth - its single defining reason for being a protected area. Overrides the auto-promoted 'Hill Myna', a generic forest bird with no special connection to this park.",
    ),
}

# Auto-promotion suppressed for these - the top Wikipedia-matched species
# happened to outrank a well-established, more famous association that
# isn't literally repeated as often in the article's running text.
SKIP_AUTO_PROMOTE = {
    "sakkarbaug-zoological-garden",  # one of the world's most important captive Asiatic Lion breeding centers - keep asiatic-lion, don't flip to the article's incidental Cheetah mention.
}

# Entities where MANUAL_OVERRIDES is a best-available approximation, not a
# confident final answer (roster gap) - kept needsResearch:true even after
# the fix so it isn't mistaken for a fully-resolved fact.
STILL_NEEDS_RESEARCH_AFTER_FIX = {
    "gahirmatha-marine-sanctuary", "mount-harriet-national-park", "saddle-peak-national-park",
    "mahatma-gandhi-marine-national-park", "middle-button-island-national-park",
    "north-button-island-national-park", "south-button-island-national-park",
    "rani-jhansi-marine-national-park",
}


def log(msg: str) -> None:
    print(msg, flush=True)


def load_jsonl(path: Path) -> dict[str, dict]:
    by_slug = {}
    with path.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            r = json.loads(line)
            by_slug[r["slug"]] = r
    return by_slug


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    audit = load_jsonl(RAW_DIR / "headline-species-audit.jsonl")
    species_manifest = load_jsonl(RAW_DIR / "park-species" / "manifest.jsonl")
    species_roster = json.loads((DATA_DIR / "species.json").read_text())
    species_by_slug = {s["slug"]: s for s in species_roster}

    changes = []

    for filename in ENTITY_FILES:
        path = DATA_DIR / filename
        entities = json.loads(path.read_text())
        file_changed = False

        for entity in entities:
            slug = entity["slug"]
            audit_rec = audit.get(slug)
            if not audit_rec:
                continue
            flagged = not audit_rec["mentionedInWikipedia"] or audit_rec["habitatFlag"]
            if not flagged:
                continue

            old_headline = entity.get("headlineSpeciesSlug")
            new_headline = None
            reason = None

            if slug in MANUAL_OVERRIDES:
                new_headline, reason = MANUAL_OVERRIDES[slug]
            elif slug in SKIP_AUTO_PROMOTE:
                pass
            else:
                sp_rec = species_manifest.get(slug)
                if sp_rec and "wikipedia" in sp_rec.get("sourceMethod", ""):
                    candidates = sp_rec.get("additionalKeySpeciesSlugs", [])
                    for cand in candidates:
                        if cand != old_headline and cand not in GENERIC_SPECIES and cand in species_by_slug:
                            new_headline = cand
                            reason = f"top species in this entity's own Wikipedia-matched fauna list (not {old_headline})"
                            break

            if new_headline and new_headline != old_headline:
                entity["headlineSpeciesSlug"] = new_headline
                # Drop the newly-promoted species from "also found here" so
                # it isn't shown twice (once as flagship, once as additional).
                if new_headline in entity.get("additionalKeySpeciesSlugs", []):
                    entity["additionalKeySpeciesSlugs"] = [
                        s for s in entity["additionalKeySpeciesSlugs"] if s != new_headline
                    ]
                entity["description"] = None  # stale - names the old headline; regenerated by the next description pass
                sources = entity.setdefault("sources", [])
                note_url = f"https://en.wikipedia.org/wiki/{entity['name'].replace(' ', '_')}"
                if not any(s.get("url") == note_url for s in sources):
                    sources.append({"label": "Wikipedia (headline species correction)", "url": note_url, "accessedDate": TODAY})
                if slug in STILL_NEEDS_RESEARCH_AFTER_FIX:
                    entity["needsResearch"] = True
                changes.append(
                    {
                        "slug": slug,
                        "name": entity["name"],
                        "file": filename,
                        "old": old_headline,
                        "new": new_headline,
                        "reason": reason,
                    }
                )
                file_changed = True

        if file_changed and not args.dry_run:
            path.write_text(json.dumps(entities, indent=2) + "\n")

    log(f"=== {len(changes)} headlineSpeciesSlug corrections ===")
    for c in changes:
        old_name = species_by_slug.get(c["old"], {}).get("commonName", c["old"])
        new_name = species_by_slug.get(c["new"], {}).get("commonName", c["new"])
        log(f"- {c['name']} ({c['slug']}): {old_name} -> {new_name}")
        log(f"    reason: {c['reason']}")

    if args.dry_run:
        log("\n--dry-run: not writing files")
    else:
        log("\nWrote national-parks.json, sanctuaries.json, zoos.json")


if __name__ == "__main__":
    main()
