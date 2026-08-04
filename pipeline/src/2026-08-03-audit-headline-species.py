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


def main() -> None:
    species = json.loads((DATA_DIR / "species.json").read_text())
    species_by_slug = {s["slug"]: s for s in species}

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    flagged = []
    total = 0

    with OUT_PATH.open("w") as out_f:
        for filename in ENTITY_FILES:
            entities = json.loads((DATA_DIR / filename).read_text())
            for entity in entities:
                total += 1
                slug = entity["slug"]
                name = entity["name"]
                headline_slug = entity.get("headlineSpeciesSlug")
                headline = species_by_slug.get(headline_slug) if headline_slug else None

                extract = fetch_wikipedia_extract(name, session)
                mentioned = False
                if extract and headline:
                    pattern = re.compile(r"\b" + re.escape(headline["commonName"].lower()) + r"\b")
                    mentioned = bool(pattern.search(extract.lower()))

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

    log(f"\n=== Done === {total} entities checked, {len(flagged)} flagged for review")
    log(f"Report: {OUT_PATH}")
    for r in flagged:
        reason = []
        if not r["mentionedInWikipedia"]:
            reason.append("not mentioned in Wikipedia" if r["hasExtract"] else "no Wikipedia article found")
        if r["habitatFlag"]:
            reason.append(r["habitatFlag"])
        log(f"- {r['name']} ({r['slug']}): headline={r['headlineCommonName']} -- {'; '.join(reason)}")


if __name__ == "__main__":
    main()
