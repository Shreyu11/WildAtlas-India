"""Identity/status/photo resolver for new-species candidates.

Stage 1 of docs/DATASET_PLAN.md's 2026-08-04 "close the species-count gap"
plan. Reads pipeline/data/raw/new-species/candidates.jsonl (2,417 species
already photo-cleared by the 2026-07-29 image downloader, binomial-deduped
against the live public/data/species.json) and resolves, per candidate:

  - commonName: the matched Wikidata entity's English label (NOT GBIF's
    vernacularNames endpoint - spot-checked as unreliable, e.g. it tags
    "Bagh"/"Harimau" as English for tiger).
  - conservationStatus: Wikidata P141 (IUCN conservation status), mapped to
    our 7-code enum. No match / DD / unrecognized -> excluded from this
    pass (logged to _todo.md), never guessed.
  - photoUrl: reconstructed via Special:FilePath from the candidate's
    already-known commonsFileTitle (confirmed this redirects to a real
    image) - hotlinked, not self-hosted, matching existing convention.
  - taxonClassification: GBIF /species/{gbifKey} detail.
  - slug: kebab-case of commonName (matches the live convention, not the
    manifest's "group-scientificname" style) - collisions get a numeric
    suffix and a _todo.md flag.

Does NOT touch public/data/species.json - this is staging output for the
separate, reviewed merge step (2026-08-04-merge-new-species.py), which also
requires a real per-species description (Stage 2, batched, see the plan).

Usage:
    python3 2026-08-04-resolve-new-species-identity.py
    python3 2026-08-04-resolve-new-species-identity.py --limit 10   # test run
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from datetime import date
from urllib.parse import quote

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_CANDIDATES = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "candidates.jsonl"
DEFAULT_LIVE_SPECIES_JSON = REPO_ROOT / "public" / "data" / "species.json"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "new-species"

WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WIKIDATA_ENTITY_DATA = "https://www.wikidata.org/wiki/Special:EntityData/{id}.json"
GBIF_SPECIES = "https://api.gbif.org/v1/species/{key}"
COMMONS_FILEPATH = "https://commons.wikimedia.org/wiki/Special:FilePath/{title}?width=800"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-NewSpeciesIdentity/1.0 (contact: {CONTACT}) python-requests"

REQUEST_TIMEOUT = 20
RETRIES = 3

PROP_TAXON_NAME = "P225"
PROP_PARENT_TAXON = "P171"
PROP_IUCN_STATUS = "P141"
MAX_PARENT_TAXON_HOPS = 2

# Verified 2026-08-03/04 by resolving each QID's English label directly.
STATUS_QID_MAP = {
    "Q211005": "LC",
    "Q719675": "NT",
    "Q278113": "VU",
    "Q96377276": "EN",
    "Q219127": "CR",
    "Q239509": "EW",
    "Q237350": "EX",
}
# Recognized-but-excluded (not one of our 7 codes) - logged distinctly from
# a fully unrecognized QID so _todo.md is easy to triage.
STATUS_QID_EXCLUDED = {"Q3245245": "Data Deficient"}


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
        {"action": "wbsearchentities", "search": scientific_name, "language": "en", "type": "item", "limit": 8, "format": "json"},
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
    for qid in search_candidates(scientific_name, session):
        entity = fetch_entity(qid, session)
        time.sleep(0.1)
        if not entity:
            continue
        for c in entity.get("claims", {}).get(PROP_TAXON_NAME, []):
            value = c.get("mainsnak", {}).get("datavalue", {}).get("value")
            if isinstance(value, str) and value.strip() == scientific_name.strip():
                return entity
    return None


def build_taxon_chain(entity: dict, session: requests.Session) -> list[dict]:
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


def entity_label(entity: dict, lang: str = "en") -> str | None:
    return entity.get("labels", {}).get(lang, {}).get("value")


def extract_status(chain: list[dict]) -> tuple[str | None, str | None, str | None]:
    """Returns (code, qid_used, excluded_reason). code is None if nothing
    usable was found; excluded_reason is set when a status WAS found but
    doesn't map to our 7 codes (e.g. Data Deficient)."""
    for entity in chain:
        claims = entity.get("claims", {}).get(PROP_IUCN_STATUS, [])
        for c in claims:
            if c.get("rank") == "deprecated":
                continue
            status_qid = c.get("mainsnak", {}).get("datavalue", {}).get("value", {}).get("id")
            if not status_qid:
                continue
            if status_qid in STATUS_QID_MAP:
                return STATUS_QID_MAP[status_qid], entity["id"], None
            if status_qid in STATUS_QID_EXCLUDED:
                return None, entity["id"], STATUS_QID_EXCLUDED[status_qid]
            return None, entity["id"], f"unrecognized status QID {status_qid}"
    return None, None, None


def slugify(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def fetch_gbif_taxonomy(gbif_key: str, session: requests.Session) -> dict | None:
    data = request_json(GBIF_SPECIES.format(key=gbif_key), {}, session)
    if not data:
        return None
    fields = ["kingdom", "phylum", "class", "order", "family", "genus", "species"]
    result = {k: data[k] for k in fields if data.get(k)}
    return result or None


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
                processed.add(json.loads(line)["candidateSlug"])
            except (json.JSONDecodeError, KeyError):
                continue
    return processed


def process_candidates(
    candidates: list[dict], live_slugs: set[str], out_dir: Path, session: requests.Session, delay: float
) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "identity-manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    already_done = load_processed_slugs(manifest_path)
    used_slugs: set[str] = set(live_slugs)
    # Re-seed used_slugs with slugs already resolved in a prior (resumed) run.
    if manifest_path.exists():
        with manifest_path.open() as f:
            for line in f:
                try:
                    r = json.loads(line)
                    if r.get("status") == "resolved":
                        used_slugs.add(r["slug"])
                except (json.JSONDecodeError, KeyError):
                    continue

    stats = {"resolved": 0, "no_wikidata_match": 0, "no_status": 0}

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, cand in enumerate(candidates, 1):
            candidate_slug = cand["slug"]
            scientific_name = cand["scientificName"]

            if candidate_slug in already_done:
                continue

            record = {"candidateSlug": candidate_slug, "scientificName": scientific_name, "group": cand["group"]}
            try:
                entity = resolve_taxon_entity(scientific_name, session)
                if not entity:
                    record["status"] = "no_wikidata_match"
                    stats["no_wikidata_match"] += 1
                    todo_f.write(f"- [ ] {scientific_name} ({candidate_slug}): no Wikidata entity with exact P225 match\n")
                else:
                    chain = build_taxon_chain(entity, session)
                    status_code, status_qid, excluded_reason = extract_status(chain)

                    if not status_code:
                        record["status"] = "no_status"
                        stats["no_status"] += 1
                        reason = excluded_reason or "no P141 statement found in taxon chain"
                        todo_f.write(f"- [ ] {scientific_name} ({candidate_slug}): {reason}\n")
                    else:
                        common_name = entity_label(entity) or scientific_name
                        base_slug = slugify(common_name)
                        final_slug = base_slug
                        suffix = 2
                        collided = False
                        while final_slug in used_slugs:
                            collided = True
                            final_slug = f"{base_slug}-{suffix}"
                            suffix += 1
                        used_slugs.add(final_slug)
                        if collided:
                            todo_f.write(f"- [ ] {scientific_name}: slug collision, using {final_slug} - review\n")

                        taxonomy = fetch_gbif_taxonomy(cand["gbifKey"], session)

                        record["status"] = "resolved"
                        record["slug"] = final_slug
                        record["commonName"] = common_name
                        record["conservationStatus"] = status_code
                        record["conservationStatusSource"] = {
                            "label": "Wikidata",
                            "url": f"https://www.wikidata.org/wiki/{status_qid}",
                            "accessedDate": date.today().isoformat(),
                        }
                        record["wikidataId"] = entity["id"]
                        record["taxonClassification"] = taxonomy
                        clean_title = cand["commonsFileTitle"].removeprefix("File:")
                        record["photoUrl"] = COMMONS_FILEPATH.format(title=quote(clean_title, safe=""))
                        record["photoAttribution"] = {
                            "author": cand["author"],
                            "license": cand["license"],
                            "licenseUrl": cand["licenseUrl"],
                            "sourceUrl": cand["sourceUrl"],
                        }
                        record["taxon"] = "mammal" if cand["group"] == "mammals" else "bird"
                        record["occurrenceCount"] = cand.get("occurrenceCount", 0)
                        record["gbifKey"] = cand["gbifKey"]
                        stats["resolved"] += 1
            except Exception as exc:  # noqa: BLE001 - one bad species must not kill the batch
                record["status"] = "error"
                record["error"] = str(exc)
                todo_f.write(f"- [ ] {scientific_name} ({candidate_slug}): unexpected error: {exc}\n")

            manifest_f.write(json.dumps(record) + "\n")
            manifest_f.flush()
            todo_f.flush()

            if i % 50 == 0:
                log(f"{i}/{len(candidates)} processed ({stats})")

            time.sleep(delay)

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidates", type=Path, default=DEFAULT_CANDIDATES)
    parser.add_argument("--live-species-json", type=Path, default=DEFAULT_LIVE_SPECIES_JSON)
    parser.add_argument("--limit", type=int, default=None, help="Cap candidates processed (test run)")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--delay", type=float, default=0.25, help="Seconds between candidates")
    args = parser.parse_args()

    candidates = [json.loads(line) for line in args.candidates.read_text().splitlines() if line.strip()]
    if args.limit:
        candidates = candidates[: args.limit]

    live_species = json.loads(args.live_species_json.read_text())
    live_slugs = {s["slug"] for s in live_species}

    out_dir = args.out.expanduser().resolve()
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    log(f"Candidates: {len(candidates)} from {args.candidates}")
    log(f"Live species slugs (reserved): {len(live_slugs)}")
    log(f"Output directory: {out_dir}")

    stats = process_candidates(candidates, live_slugs, out_dir, session, args.delay)

    log("\n=== Summary ===")
    log(str(stats))
    log(f"Manifest: {out_dir / 'identity-manifest.jsonl'}")
    log(f"Skipped/failed log: {out_dir / '_todo.md'}")


if __name__ == "__main__":
    main()
