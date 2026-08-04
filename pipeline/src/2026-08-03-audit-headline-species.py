"""Audit existing headlineSpeciesSlug assignments for plausibility.

The original Phase A seed data (pre-dates this session's photo/species/
description/travel-link work) hand-assigned a headlineSpeciesSlug to every
national park / sanctuary / zoo. Spot-checking found at least one clear
error (Marine National Park, Gulf of Kutch -> asiatic-lion, which is
Gir National Park's flagship species, not a marine park's) - suggesting
some entries may have been assigned by state rather than by the specific
entity.

For every entity, fetches its Wikipedia extract and checks whether the
current headlineSpeciesSlug's commonName is even mentioned in the article.
Not being mentioned is strong evidence of a wrong assignment (a genuine
flagship species is almost always named in its park's own Wikipedia intro).
Flags every unmentioned case, and additionally flags any entity whose type/
name suggests a habitat mismatch (e.g. "Marine" in the name with a
non-aquatic-bird headline).

Output is a report only - does NOT modify public/data/*.json. Fixing is a
manual, reviewed step given how much this affects the public trust in the
data.

Usage:
    python3 2026-08-03-audit-headline-species.py
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
OUT_PATH = SCRIPT_DIR.parent / "data" / "raw" / "headline-species-audit.jsonl"
EXTRACT_CACHE_PATH = SCRIPT_DIR.parent / "data" / "raw" / "headline-audit-extract-cache.jsonl"

# Common words that appear in many unrelated species names ("Owl", "Crane")
# or, worse, as ordinary English words in park prose ("bustard" is safe, but
# generic nouns aren't) - excluded from the loose last-word match so they
# don't produce a flood of false "mentioned" matches. Long/distinctive nouns
# are kept.
GENERIC_LAST_WORDS = {"bird", "deer", "cat", "fox", "dove", "duck", "goose"}

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-HeadlineAudit/1.0 (contact: {CONTACT}) python-requests"
REQUEST_TIMEOUT = 20
RETRIES = 3

ENTITY_FILES = ["national-parks.json", "sanctuaries.json", "zoos.json"]

MARINE_KEYWORDS = re.compile(r"marine|coral|reef|gulf|island", re.IGNORECASE)
DESERT_KEYWORDS = re.compile(r"desert", re.IGNORECASE)


def log(msg: str) -> None:
    print(msg, flush=True)


def request_json(url: str, params: dict, session: requests.Session) -> dict | None:
    for attempt in range(1, RETRIES + 1):
        try:
            resp = session.get(url, params=params, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, dict) and "error" in data:
                    return None
                return data
            if resp.status_code in (429, 500, 502, 503, 504):
                time.sleep(1.5 * attempt)
                continue
            return None
        except requests.RequestException:
            time.sleep(1.5 * attempt)
    return None


def fetch_wikipedia_extract(title: str, session: requests.Session) -> str | None:
    data = request_json(
        WIKIPEDIA_API,
        {"action": "query", "prop": "extracts", "explaintext": 1, "redirects": 1, "titles": title, "format": "json"},
        session,
    )
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        if "missing" in page:
            continue
        extract = page.get("extract")
        if extract:
            return extract
    return None


def species_mentioned(extract: str, common_name: str) -> bool:
    """True if the full common name appears, OR its last (most distinctive)
    word does - Wikipedia prose usually drops the qualifier ("tiger" not
    "Royal Bengal Tiger", "elephant" not "Asian Elephant"), so requiring the
    exact full phrase produces a flood of false negatives."""
    lower_text = extract.lower()
    if re.search(r"\b" + re.escape(common_name.lower()) + r"\b", lower_text):
        return True
    last_word = common_name.split()[-1].lower().strip("()-")
    if last_word in GENERIC_LAST_WORDS or len(last_word) < 4:
        return False
    return bool(re.search(r"\b" + re.escape(last_word) + r"\b", lower_text))


def load_processed_slugs(path: Path) -> set[str]:
    if not path.exists():
        return set()
    processed = set()
    with path.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                processed.add(json.loads(line)["slug"])
            except (json.JSONDecodeError, KeyError):
                continue
    return processed


def load_extract_cache() -> dict[str, str | None]:
    if not EXTRACT_CACHE_PATH.exists():
        return {}
    cache = {}
    with EXTRACT_CACHE_PATH.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            cache[rec["name"]] = rec["extract"]
    return cache


def main() -> None:
    species = json.loads((DATA_DIR / "species.json").read_text())
    species_by_slug = {s["slug"]: s for s in species}

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    extract_cache = load_extract_cache()
    already_done = load_processed_slugs(OUT_PATH)
    flagged = []
    total = len(already_done)

    with OUT_PATH.open("a") as out_f, EXTRACT_CACHE_PATH.open("a") as cache_f:
        for filename in ENTITY_FILES:
            entities = json.loads((DATA_DIR / filename).read_text())
            for entity in entities:
                slug = entity["slug"]
                if slug in already_done:
                    continue
                total += 1
                name = entity["name"]
                headline_slug = entity.get("headlineSpeciesSlug")
                headline = species_by_slug.get(headline_slug) if headline_slug else None

                if name in extract_cache:
                    extract = extract_cache[name]
                else:
                    extract = fetch_wikipedia_extract(name, session)
                    extract_cache[name] = extract
                    cache_f.write(json.dumps({"name": name, "extract": extract}) + "\n")
                    cache_f.flush()

                mentioned = bool(extract and headline and species_mentioned(extract, headline["commonName"]))

                habitat_flag = None
                if MARINE_KEYWORDS.search(name) and headline and headline["slug"] not in {"indian-flamingo", "painted-stork"}:
                    habitat_flag = "name suggests marine/coastal, headline species may not fit"
                elif DESERT_KEYWORDS.search(name) and headline and headline.get("taxon") == "mammal" and "desert" not in (headline.get("habitat") or "").lower():
                    habitat_flag = "name suggests desert, headline species habitat doesn't mention desert"

                record = {
                    "slug": slug,
                    "name": name,
                    "file": filename,
                    "headlineSpeciesSlug": headline_slug,
                    "headlineCommonName": headline["commonName"] if headline else None,
                    "mentionedInWikipedia": mentioned,
                    "habitatFlag": habitat_flag,
                    "hasExtract": extract is not None,
                }
                out_f.write(json.dumps(record) + "\n")
                out_f.flush()

                if not mentioned or habitat_flag:
                    flagged.append(record)

                if total % 20 == 0:
                    log(f"{total} processed, {len(flagged)} flagged so far")

                time.sleep(0.25)

    all_records = [json.loads(line) for line in OUT_PATH.read_text().splitlines() if line.strip()]
    all_flagged = [r for r in all_records if not r["mentionedInWikipedia"] or r["habitatFlag"]]

    log(f"\n=== Done === {len(all_records)} entities checked total, {len(all_flagged)} flagged for review")
    log(f"Report: {OUT_PATH}")
    for r in all_flagged:
        reason = []
        if not r["mentionedInWikipedia"]:
            reason.append("not mentioned in Wikipedia" if r["hasExtract"] else "no Wikipedia article found")
        if r["habitatFlag"]:
            reason.append(r["habitatFlag"])
        log(f"- {r['name']} ({r['slug']}): headline={r['headlineCommonName']} -- {'; '.join(reason)}")


if __name__ == "__main__":
    main()
