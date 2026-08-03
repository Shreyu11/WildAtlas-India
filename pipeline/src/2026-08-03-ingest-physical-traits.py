"""Physical-trait (mass/height/length/gestation/collective noun) ingester.

Sources each species' `scientificName` (from public/data/species.json) against
Wikidata: resolves the taxon entity via wbsearchentities, verifies the match
by comparing the entity's P225 (taxon name) claim against the expected
scientific name (guards against homonym mismatches), then reads structured
quantity claims. See docs/DATASET_PLAN.md Sec 2.1/4/0 (2026-08-03 decision)
for why EOL TraitBank was tried and dropped (API unreachable) and why
trophicLevel/termForYoung stay unpopulated (no corresponding Wikidata
property exists).

Only produces a raw manifest under --out. Does NOT touch
public/data/species.json — merging is a separate, reviewed step
(2026-08-03-merge-species-updates.py), same pattern as the image downloader.

Usage:
    python3 2026-08-03-ingest-physical-traits.py
    python3 2026-08-03-ingest-physical-traits.py --limit 5   # test run
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from datetime import date

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_SPECIES_JSON = REPO_ROOT / "public" / "data" / "species.json"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "traits"

WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WIKIDATA_ENTITY_DATA = "https://www.wikidata.org/wiki/Special:EntityData/{id}.json"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-TraitIngest/1.0 (contact: {CONTACT}) python-requests"

REQUEST_TIMEOUT = 20
RETRIES = 3

# Property IDs used, and the Wikidata unit QIDs we know how to convert.
# A statement whose unit isn't in these maps is skipped (logged), never
# guess-converted.
MASS_KG_UNITS = {"Q11570": 1.0}  # kilogram
LENGTH_CM_UNITS = {"Q174728": 1.0, "Q11573": 100.0}  # centimetre, metre->cm
DAYS_UNITS = {"Q573": 1.0, "Q5151": 30.44, "Q577": 365.25}  # day, month, year

PROP_MASS = "P2067"
PROP_HEIGHT = "P2048"
PROP_LENGTH = "P2043"
PROP_GESTATION = "P3063"
PROP_COLLECTIVE_NOUN = "P6571"  # lexeme-valued
PROP_TAXON_NAME = "P225"
PROP_ROLE_QUALIFIER = "P3831"  # "object has role" / "applies to part"
PROP_PARENT_TAXON = "P171"

# Many India-specific entries in species.json are subspecies (e.g. "Panthera
# tigris tigris"), but Wikidata frequently only tags mass/height/gestation
# statements on the parent species entity ("tiger"), not every subspecies
# item. Walk up P171 this many hops looking for usable statements before
# giving up, rather than reporting "no traits found" when the species-level
# figure is right there one hop up.
MAX_PARENT_TAXON_HOPS = 2

# Role-qualifier labels that mean "this isn't the adult/typical figure" -
# reject statements qualified with one of these rather than mixing e.g.
# tiger cub birth-weight (~1kg) into the adult mass range.
NON_ADULT_ROLE_KEYWORDS = (
    "birth", "juvenile", "neonate", "hatchling", "chick", "infant",
    "newborn", "young", "larva", "larval", "nestling", "fledgling",
)


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


def search_candidates(scientific_name: str, session: requests.Session) -> list[str]:
    data = request_json(
        WIKIDATA_API,
        {
            "action": "wbsearchentities",
            "search": scientific_name,
            "language": "en",
            "type": "item",
            "limit": 8,
            "format": "json",
        },
        session,
    )
    if not data:
        return []
    return [r["id"] for r in data.get("search", [])]


def fetch_entity(qid: str, session: requests.Session) -> dict | None:
    data = request_json(WIKIDATA_ENTITY_DATA.format(id=qid), {}, session)
    if not data:
        return None
    return data.get("entities", {}).get(qid)


def resolve_taxon_entity(scientific_name: str, session: requests.Session) -> dict | None:
    """Find the Wikidata entity whose P225 (taxon name) exactly matches
    scientific_name. Returns None (never a best-effort guess) if no
    candidate matches."""
    for qid in search_candidates(scientific_name, session):
        entity = fetch_entity(qid, session)
        time.sleep(0.1)
        if not entity:
            continue
        taxon_name_claims = entity.get("claims", {}).get(PROP_TAXON_NAME, [])
        for c in taxon_name_claims:
            value = c.get("mainsnak", {}).get("datavalue", {}).get("value")
            if isinstance(value, str) and value.strip() == scientific_name.strip():
                return entity
    return None


_label_cache: dict[str, str | None] = {}


def resolve_label(qid: str, session: requests.Session) -> str | None:
    if qid in _label_cache:
        return _label_cache[qid]
    data = request_json(
        WIKIDATA_API,
        {"action": "wbgetentities", "ids": qid, "props": "labels", "languages": "en", "format": "json"},
        session,
    )
    label = None
    if data:
        label = data.get("entities", {}).get(qid, {}).get("labels", {}).get("en", {}).get("value")
    _label_cache[qid] = label
    return label


def is_non_adult_statement(claim: dict, session: requests.Session) -> bool:
    roles = claim.get("qualifiers", {}).get(PROP_ROLE_QUALIFIER, [])
    for role in roles:
        role_qid = role.get("datavalue", {}).get("value", {}).get("id")
        if not role_qid:
            continue
        label = (resolve_label(role_qid, session) or "").lower()
        if any(kw in label for kw in NON_ADULT_ROLE_KEYWORDS):
            return True
    return False


def extract_range_fact(
    entity: dict, prop: str, unit_conversions: dict[str, float], session: requests.Session, decimals: int = 1
) -> tuple[dict, bool] | None:
    """Returns ({min, max}, had_unresolvable_unit) by taking the union of all
    usable (adult, non-deprecated, convertible-unit) statements for `prop`,
    or None if nothing usable was found."""
    claims = entity.get("claims", {}).get(prop, [])
    lows: list[float] = []
    highs: list[float] = []
    had_unresolvable_unit = False
    for c in claims:
        if c.get("rank") == "deprecated":
            continue
        if is_non_adult_statement(c, session):
            continue
        snak = c.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        value = snak.get("datavalue", {}).get("value", {})
        unit_url = value.get("unit", "")
        unit_qid = unit_url.rsplit("/", 1)[-1] if unit_url else ""
        factor = unit_conversions.get(unit_qid)
        if factor is None:
            had_unresolvable_unit = True
            continue
        try:
            amount = float(value["amount"])
            low = float(value.get("lowerBound", value["amount"]))
            high = float(value.get("upperBound", value["amount"]))
        except (KeyError, TypeError, ValueError):
            continue
        lows.append(low * factor)
        highs.append(high * factor)
        _ = amount  # not used directly; bounds cover the point-estimate case too
    if not lows:
        return None, had_unresolvable_unit
    round_fn = (lambda x: int(round(x, 0))) if decimals == 0 else (lambda x: round(x, decimals))
    return {"min": round_fn(min(lows)), "max": round_fn(max(highs))}, had_unresolvable_unit


def build_taxon_chain(entity: dict, session: requests.Session) -> list[dict]:
    """[entity, parent, grandparent, ...] via P171, up to MAX_PARENT_TAXON_HOPS."""
    chain = [entity]
    current = entity
    for _ in range(MAX_PARENT_TAXON_HOPS):
        parent_claims = current.get("claims", {}).get(PROP_PARENT_TAXON, [])
        if not parent_claims:
            break
        parent_qid = parent_claims[0].get("mainsnak", {}).get("datavalue", {}).get("value", {}).get("id")
        if not parent_qid:
            break
        parent_entity = fetch_entity(parent_qid, session)
        time.sleep(0.1)
        if not parent_entity:
            break
        chain.append(parent_entity)
        current = parent_entity
    return chain


def entity_label(entity: dict) -> str:
    return entity.get("labels", {}).get("en", {}).get("value") or entity.get("id", "?")


def extract_range_fact_chain(
    chain: list[dict], prop: str, unit_conversions: dict[str, float], session: requests.Session, decimals: int = 1
) -> tuple[dict | None, bool]:
    """Try extract_range_fact on each entity in the chain in order (self
    first, then parent taxa), returning the first hit. A hit found on an
    ancestor gets a `note` on the value naming that ancestor, since the
    figure is species-level, not necessarily specific to this subspecies."""
    any_unresolvable = False
    for hops, entity in enumerate(chain):
        result, unresolvable = extract_range_fact(entity, prop, unit_conversions, session, decimals)
        any_unresolvable = any_unresolvable or unresolvable
        if result:
            if hops > 0:
                result = {**result, "note": f"from parent taxon {entity_label(entity)} ({entity['id']}), not subspecies-specific"}
            return {"value": result, "qid": entity["id"]}, any_unresolvable
    return None, any_unresolvable


def extract_collective_noun(entity: dict, session: requests.Session) -> str | None:
    claims = entity.get("claims", {}).get(PROP_COLLECTIVE_NOUN, [])
    for c in claims:
        if c.get("rank") == "deprecated":
            continue
        snak = c.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        lexeme_id = snak.get("datavalue", {}).get("value", {}).get("id")
        if not lexeme_id:
            continue
        lex_data = request_json(WIKIDATA_ENTITY_DATA.format(id=lexeme_id), {}, session)
        if not lex_data:
            continue
        lexeme = lex_data.get("entities", {}).get(lexeme_id, {})
        lemma = lexeme.get("lemmas", {}).get("en", {}).get("value")
        if lemma:
            return lemma
    return None


def build_cited_fact(value, qid: str) -> dict:
    return {
        "value": value,
        "source": {
            "label": "Wikidata",
            "url": f"https://www.wikidata.org/wiki/{qid}",
            "accessedDate": date.today().isoformat(),
        },
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
    species_list: list[dict], out_dir: Path, session: requests.Session, delay: float
) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    already_done = load_processed_slugs(manifest_path)
    stats = {"resolved": 0, "no_wikidata_match": 0, "no_traits_found": 0}

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, sp in enumerate(species_list, 1):
            slug = sp["slug"]
            scientific_name = sp["scientificName"]

            if slug in already_done:
                continue

            record = {"slug": slug, "scientificName": scientific_name}
            try:
                entity = resolve_taxon_entity(scientific_name, session)
                if not entity:
                    record["status"] = "no_wikidata_match"
                    stats["no_wikidata_match"] += 1
                    todo_f.write(
                        f"- [ ] {scientific_name} ({slug}): no Wikidata entity with an exact "
                        f"P225 taxon-name match found\n"
                    )
                else:
                    qid = entity["id"]
                    chain = build_taxon_chain(entity, session)
                    traits: dict = {}
                    unresolvable_unit_props: list[str] = []

                    for field, prop, units, decimals in (
                        ("massKg", PROP_MASS, MASS_KG_UNITS, 1),
                        ("heightCm", PROP_HEIGHT, LENGTH_CM_UNITS, 0),
                        ("lengthCm", PROP_LENGTH, LENGTH_CM_UNITS, 0),
                        ("gestationDays", PROP_GESTATION, DAYS_UNITS, 0),
                    ):
                        hit, unresolved = extract_range_fact_chain(chain, prop, units, session, decimals)
                        if hit:
                            traits[field] = build_cited_fact(hit["value"], hit["qid"])
                        if unresolved:
                            unresolvable_unit_props.append(field)

                    # Collective noun (lexeme-valued) doesn't need the
                    # min/max union logic above; try self then parent taxa.
                    for ancestor in chain:
                        collective_noun = extract_collective_noun(ancestor, session)
                        if collective_noun:
                            traits["collectiveNoun"] = build_cited_fact(collective_noun, ancestor["id"])
                            break

                    # No Wikidata property exists for trophicLevel or
                    # termForYoung (checked 2026-08-03) - left unpopulated.

                    if traits:
                        record["status"] = "resolved"
                        record["wikidataId"] = qid
                        record["physicalTraits"] = traits
                        stats["resolved"] += 1
                    else:
                        record["status"] = "no_traits_found"
                        record["wikidataId"] = qid
                        stats["no_traits_found"] += 1
                        todo_f.write(
                            f"- [ ] {scientific_name} ({slug}): matched Wikidata {qid} but no "
                            f"usable mass/height/length/gestation/collective-noun statements\n"
                        )

                    if unresolvable_unit_props:
                        todo_f.write(
                            f"- [ ] {scientific_name} ({slug}): skipped statements with an "
                            f"unrecognized unit for: {', '.join(unresolvable_unit_props)}\n"
                        )
            except Exception as exc:  # noqa: BLE001 - one bad species must not kill the batch
                record["status"] = "error"
                record["error"] = str(exc)
                todo_f.write(f"- [ ] {scientific_name} ({slug}): unexpected error: {exc}\n")

            manifest_f.write(json.dumps(record) + "\n")
            manifest_f.flush()
            todo_f.flush()

            if i % 10 == 0:
                log(f"{i}/{len(species_list)} processed ({stats})")

            time.sleep(delay)

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--species-json", type=Path, default=DEFAULT_SPECIES_JSON)
    parser.add_argument("--limit", type=int, default=None, help="Cap species processed (test run)")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--delay", type=float, default=0.3, help="Seconds between species")
    args = parser.parse_args()

    species_list = json.loads(args.species_json.read_text())
    if args.limit:
        species_list = species_list[: args.limit]

    out_dir = args.out.expanduser().resolve()
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    log(f"Species source: {args.species_json}")
    log(f"Output directory: {out_dir}")
    log(f"Processing {len(species_list)} species")

    stats = process_species(species_list, out_dir, session, args.delay)

    log("\n=== Summary ===")
    log(str(stats))
    log(f"Manifest: {out_dir / 'manifest.jsonl'}")
    log(f"Skipped/failed log: {out_dir / '_todo.md'}")


if __name__ == "__main__":
    main()
