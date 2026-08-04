"""Cover-photo ingester for national parks, sanctuaries, and zoos.

For every entity in public/data/national-parks.json, sanctuaries.json, and
zoos.json, finds an openly-licensed (CC0/CC-BY/CC-BY-SA/public-domain) cover
photo on Wikimedia Commons and records it + its attribution in a manifest.
Same license-filter and hotlink-not-download approach as the existing
species-photo pipeline (2026-07-29-india-wildlife-image-downloader.py), but
searches by entity name instead of scientific name, and filters out
landscape-irrelevant results (logos, maps, seals, stamps) instead of
specimen/skeleton shots.

Only produces a raw manifest under --out. Does NOT touch public/data/*.json
- merging is a separate step (2026-08-03-merge-park-updates.py).

Usage:
    python3 2026-08-03-ingest-park-photos.py
    python3 2026-08-03-ingest-park-photos.py --limit 10   # test run
"""

from __future__ import annotations

import argparse
import html
import json
import re
import time
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "park-images"

COMMONS_BASE = "https://commons.wikimedia.org/w/api.php"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-ParkPhotoIngest/1.0 (contact: {CONTACT}) python-requests"

ENTITY_FILES = {
    "national-park": "national-parks.json",
    "wildlife-sanctuary": "sanctuaries.json",
    "bird-sanctuary": "sanctuaries.json",
    "zoo": "zoos.json",
}

OPEN_LICENSE_PATTERN = re.compile(
    r"cc[-\s]?by(-sa)?[-\s]?[\d.]*|public\s*domain|pdm|cc0",
    re.IGNORECASE,
)

ACCEPTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Landscape/place photos on Commons frequently surface irrelevant matches:
# logos/seals, maps, postage stamps, tickets/brochures, VIP-visit photo-ops
# (parks/reserves are common backdrops for political visits, which are
# poor "cover photos" and often carry an unreviewed GODL-India license
# claim - see "unreviewed" below), unrelated portraits. Filtered post-fetch
# against title + categories, same pattern as the species pipeline's
# BANNED_KEYWORDS but for places rather than specimens.
BANNED_KEYWORDS = [
    "logo", "seal", "coat of arms", "emblem", "flag", "map", "diagram",
    "postage stamp", "stamp", "coin", "banknote", "ticket", "brochure",
    "pamphlet", "poster", "screenshot", "icon", "clipart", "cartoon",
    "illustration", "drawing", "painting", "route map", "location map",
    "unreviewed", "modi", "minister", "inaugurat", "president", "governor",
    "politician", "vip visit", "flag hoisting", "foundation stone", "rally",
    "resort", "hotel", "lodge", "guest house", "guesthouse", "homestay",
]
BANNED_KEYWORD_PATTERN = re.compile(
    r"\b(?:" + "|".join(re.escape(k) for k in BANNED_KEYWORDS) + r")\b",
    re.IGNORECASE,
)

THUMB_WIDTH = 900
REQUEST_TIMEOUT = 20
RETRIES = 3


def log(msg: str) -> None:
    print(msg, flush=True)


def strip_html(raw: str) -> str:
    text = re.sub(r"<[^>]+>", "", raw or "")
    return html.unescape(text).strip()


def request_json(url: str, params: dict, session: requests.Session) -> dict | None:
    for attempt in range(1, RETRIES + 1):
        try:
            resp = session.get(url, params=params, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, dict) and "error" in data:
                    log(f"API error from {url}: {data['error']}")
                    return None
                return data
            if resp.status_code in (429, 500, 502, 503, 504):
                time.sleep(1.5 * attempt)
                continue
            return None
        except requests.RequestException:
            time.sleep(1.5 * attempt)
    return None


def search_commons_candidates(query: str, session: requests.Session, count: int = 15) -> list[str]:
    data = request_json(
        COMMONS_BASE,
        {
            "action": "query",
            "list": "search",
            "srsearch": f'"{query}" filetype:bitmap',
            "srnamespace": 6,
            "srlimit": count,
            "format": "json",
        },
        session,
    )
    if not data:
        return []
    return [r["title"] for r in data.get("query", {}).get("search", [])]


def get_commons_imageinfo(title: str, session: requests.Session) -> dict | None:
    data = request_json(
        COMMONS_BASE,
        {
            "action": "query",
            "titles": title,
            "prop": "imageinfo|categories",
            "iiprop": "url|extmetadata|mime",
            "iiurlwidth": THUMB_WIDTH,
            "cllimit": 50,
            "format": "json",
        },
        session,
    )
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        infos = page.get("imageinfo")
        if not infos:
            continue
        info = infos[0]
        info["_categories"] = [c.get("title", "") for c in page.get("categories", [])]
        return info
    return None


def is_banned_content(title: str, imageinfo: dict) -> bool:
    categories_text = " ".join(imageinfo.get("_categories", []))
    haystack = f"{title} {categories_text}"
    return bool(BANNED_KEYWORD_PATTERN.search(haystack))


def license_is_open(imageinfo: dict) -> bool:
    meta = imageinfo.get("extmetadata", {})
    license_slug = meta.get("License", {}).get("value", "")
    license_name = meta.get("LicenseShortName", {}).get("value", "")
    return bool(OPEN_LICENSE_PATTERN.search(license_slug) or OPEN_LICENSE_PATTERN.search(license_name))


def find_open_image(names: list[str], session: requests.Session) -> dict | None:
    seen_titles = set()
    for query in names:
        if not query:
            continue
        for title in search_commons_candidates(query, session):
            if title in seen_titles:
                continue
            seen_titles.add(title)
            ext = Path(title).suffix.lower()
            if ext not in ACCEPTED_EXTENSIONS:
                continue
            if BANNED_KEYWORD_PATTERN.search(title):
                continue
            time.sleep(0.2)
            info = get_commons_imageinfo(title, session)
            if not info or not license_is_open(info):
                continue
            if is_banned_content(title, info):
                continue
            meta = info.get("extmetadata", {})
            return {
                "commonsFileTitle": title,
                "photoUrl": info.get("thumburl") or info["url"],
                "sourceUrl": info.get("descriptionurl", ""),
                "license": meta.get("LicenseShortName", {}).get("value", "Unknown"),
                "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""),
                "author": strip_html(meta.get("Artist", {}).get("value", "Unknown")),
            }
    return None


def load_entities() -> list[dict]:
    entities = []
    seen_files = set()
    for entity_type, filename in ENTITY_FILES.items():
        path = DATA_DIR / filename
        if filename in seen_files:
            continue
        seen_files.add(filename)
        records = json.loads(path.read_text())
        for r in records:
            entities.append(
                {
                    "slug": r["slug"],
                    "name": r["name"],
                    "entityType": r.get("type", "zoo"),
                }
            )
    return entities


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
    parser.add_argument("--limit", type=int, default=None, help="Cap total entities processed (test run)")
    parser.add_argument("--delay", type=float, default=0.4)
    args = parser.parse_args()

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

    stats = {"found": 0, "no_image": 0, "error": 0, "skipped_existing": 0}
    log(f"Processing {len(entities)} entities -> {manifest_path}")

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, entity in enumerate(entities, 1):
            slug = entity["slug"]
            name = entity["name"]

            if slug in already_done:
                stats["skipped_existing"] += 1
                continue

            record = {"slug": slug, "entityType": entity["entityType"], "name": name}
            try:
                image = find_open_image([name], session)
                if image is None:
                    record["status"] = "no_open_image_found"
                    stats["no_image"] += 1
                    todo_f.write(f"- [ ] {name} ({slug}): no CC-BY/CC-BY-SA/public-domain photo found on Commons\n")
                else:
                    record["status"] = "resolved"
                    record.update(image)
                    stats["found"] += 1
            except Exception as exc:  # noqa: BLE001 - one bad entity must not kill the batch
                record["status"] = "error"
                record["error"] = str(exc)
                stats["error"] += 1
                todo_f.write(f"- [ ] {name} ({slug}): unexpected error: {exc}\n")

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
