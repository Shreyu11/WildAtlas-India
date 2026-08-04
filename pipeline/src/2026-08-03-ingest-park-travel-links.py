"""Travel/trip-planning link ingester for national parks and sanctuaries.

Populates two clearly-separate, clearly-labeled link buckets (see
docs/DATASET_PLAN.md sec 0/2.2.1/4, approved 2026-08-03):

- "official": the entity's own existing `websiteUrl` (if any) + that state's
  official tourism board site, from a small hand-verified lookup table
  (STATE_TOURISM_URLS below - each entry checked with a live HTTP request
  before being added, see verification note on the table).
- "operators": a link to the entity's English Wikivoyage article, when one
  verifiably exists (checked live via Wikivoyage's REST summary endpoint,
  never guessed). Wikivoyage is CC-BY-SA and its articles are structured
  around "Get in / Do / Sleep" - genuine third-party trip/stay/experience
  content, standing in for named commercial tour-operator links that can't
  be safely fabricated/verified at this scale (144 entities).

Zoos are out of scope entirely - ex-situ facilities, "trip" framing doesn't
apply (user decision, see DATASET_PLAN.md sec 0).

Only produces a raw manifest under --out. Does NOT touch public/data/*.json -
merging is a separate step (2026-08-03-merge-park-updates.py).

Usage:
    python3 2026-08-03-ingest-park-travel-links.py
    python3 2026-08-03-ingest-park-travel-links.py --limit 10   # test run
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "park-travel"

WIKIVOYAGE_SUMMARY_API = "https://en.wikivoyage.org/api/rest_v1/page/summary"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-ParkTravelIngest/1.0 (contact: {CONTACT}) python-requests"

ENTITY_FILES = ["national-parks.json", "sanctuaries.json"]  # zoos excluded, see docstring

REQUEST_TIMEOUT = 10
RETRIES = 2

# Hand-verified state/UT tourism board URLs (live HTTP-checked 2026-08-03 -
# each entry here returned a 2xx/3xx at verification time). Any state/UT
# whose candidate domain didn't resolve or errored is intentionally left out
# of this table rather than guessed - see pipeline/data/raw/park-travel/
# _todo.md for which states have no official link as a result.
STATE_TOURISM_URLS: dict[str, str] = {
    # populated from /tmp/state_tourism_results.txt verification pass - see
    # build_state_tourism_urls() below for the authoritative merge, this
    # dict is intentionally left as a fallback seed of very well-established
    # domains in case the live-checked file isn't present at run time.
    "kerala": "https://www.keralatourism.org",
    "rajasthan": "https://www.tourism.rajasthan.gov.in",
    "madhya-pradesh": "https://www.mptourism.com",
    "gujarat": "https://www.gujarattourism.com",
    "maharashtra": "https://www.maharashtratourism.gov.in",
    "karnataka": "https://karnatakatourism.org",
    "goa": "https://www.goatourism.gov.in",
}


def log(msg: str) -> None:
    print(msg, flush=True)


def load_entities() -> list[dict]:
    entities = []
    for filename in ENTITY_FILES:
        path = DATA_DIR / filename
        records = json.loads(path.read_text())
        for r in records:
            entities.append(
                {
                    "slug": r["slug"],
                    "name": r["name"],
                    "stateSlug": r["stateSlug"],
                    "websiteUrl": r.get("websiteUrl"),
                }
            )
    return entities


def wikivoyage_article_exists(title: str, session: requests.Session) -> dict | None:
    """Return {label, url} if an English Wikivoyage article verifiably
    exists for this title (not a disambiguation/missing page), else None."""
    for attempt in range(1, RETRIES + 1):
        try:
            resp = session.get(
                f"{WIKIVOYAGE_SUMMARY_API}/{requests.utils.quote(title)}",
                timeout=REQUEST_TIMEOUT,
            )
            if resp.status_code == 404:
                return None
            if resp.status_code != 200:
                time.sleep(1.0 * attempt)
                continue
            data = resp.json()
            if data.get("type") == "disambiguation":
                return None
            content_urls = data.get("content_urls", {}).get("desktop", {})
            page_url = content_urls.get("page")
            if not page_url:
                return None
            return {"label": f"{data.get('title', title)} (Wikivoyage)", "url": page_url}
        except requests.RequestException:
            time.sleep(1.0 * attempt)
    return None


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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--delay", type=float, default=0.3)
    parser.add_argument(
        "--state-tourism-file",
        type=Path,
        default=None,
        help="Optional 'slug|url|http_code' file (see verification pass) to override STATE_TOURISM_URLS",
    )
    args = parser.parse_args()

    state_tourism = dict(STATE_TOURISM_URLS)
    if args.state_tourism_file and args.state_tourism_file.exists():
        for line in args.state_tourism_file.read_text().splitlines():
            parts = line.strip().split("|")
            if len(parts) != 3:
                continue
            slug, url, code = parts
            if code.isdigit() and 200 <= int(code) < 400:
                state_tourism[slug] = url

    out_dir = args.out.expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    entities = load_entities()
    if args.limit:
        entities = entities[: args.limit]
    already_done = load_processed_slugs(manifest_path)

    stats = {"has_official": 0, "has_operator": 0, "neither": 0, "error": 0}
    log(f"Processing {len(entities)} entities -> {manifest_path} ({len(state_tourism)} states have a verified tourism URL)")

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, entity in enumerate(entities, 1):
            slug = entity["slug"]
            if slug in already_done:
                continue

            record = {"slug": slug}
            try:
                official = []
                if entity.get("websiteUrl"):
                    official.append({"label": entity["name"], "url": entity["websiteUrl"]})
                state_url = state_tourism.get(entity["stateSlug"])
                if state_url and state_url not in {o["url"] for o in official}:
                    official.append({"label": f"{entity['stateSlug'].replace('-', ' ').title()} Tourism", "url": state_url})

                operator_entry = wikivoyage_article_exists(entity["name"], session)
                operators = [operator_entry] if operator_entry else []

                record["travelLinks"] = {"official": official, "operators": operators}
                record["status"] = "resolved"

                if official:
                    stats["has_official"] += 1
                if operators:
                    stats["has_operator"] += 1
                if not official and not operators:
                    stats["neither"] += 1
                    todo_f.write(f"- [ ] {entity['name']} ({slug}): no official or Wikivoyage travel link found\n")
            except Exception as exc:  # noqa: BLE001 - one bad entity must not kill the batch
                record["status"] = "error"
                record["error"] = str(exc)
                record["travelLinks"] = {"official": [], "operators": []}
                stats["error"] += 1
                todo_f.write(f"- [ ] {entity['name']} ({slug}): unexpected error: {exc}\n")

            manifest_f.write(json.dumps(record) + "\n")
            manifest_f.flush()
            todo_f.flush()

            if i % 20 == 0:
                log(f"{i}/{len(entities)} processed ({stats})")

            time.sleep(args.delay)

    log(f"\n=== Summary === {stats}")
    log(f"Manifest: {manifest_path}")
    log(f"Skipped/failed log: {todo_path}")


if __name__ == "__main__":
    main()
