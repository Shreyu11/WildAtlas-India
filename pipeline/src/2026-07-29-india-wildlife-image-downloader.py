"""India wildlife (mammals + birds) checklist + openly-licensed image downloader.

Compiles a species checklist from the GBIF occurrence record facet for India
(country=IN), then finds an openly-licensed photo per species on Wikimedia
Commons (CC-BY / CC-BY-SA / public domain / CC0 only) and downloads it.

This script only produces raw images + an attribution manifest under --out.
It does NOT touch public/data/species.json — merging results into the live
dataset is a separate, reviewed step (see docs/DATASET_PLAN.md Phase A/B).

Usage:
    # Full run: all mammals + birds (~1700 species). Takes ~20-60 min.
    python3 2026-07-29-india-wildlife-image-downloader.py

    # Test run first, recommended: 20 species per group
    python3 2026-07-29-india-wildlife-image-downloader.py --limit 20

    # Mammals only
    python3 2026-07-29-india-wildlife-image-downloader.py --groups mammals

    # Custom output location
    python3 2026-07-29-india-wildlife-image-downloader.py --out ~/Desktop/india_wildlife
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
from pathlib import Path

import requests
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "species-images"

GBIF_BASE = "https://api.gbif.org/v1"
COMMONS_BASE = "https://commons.wikimedia.org/w/api.php"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = (
    f"WildAtlasIndia-ImageDownloader/1.0 (contact: {CONTACT}) python-requests"
)

GROUP_CLASS_NAMES = {
    "mammals": "Mammalia",
    "birds": "Aves",
}

# Only these license families are acceptable per docs/DATASET_PLAN.md sec 4.
OPEN_LICENSE_PATTERN = re.compile(
    r"cc[-\s]?by(-sa)?[-\s]?[\d.]*|public\s*domain|pdm|cc0",
    re.IGNORECASE,
)

ACCEPTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Commons frequently surfaces photos tagged with a species' scientific name
# where the animal itself isn't actually in frame: museum skeleton/specimen
# shots (MHNT in particular systematically photographs and uploads these),
# tracks/pugmarks/scat/nests left by the animal, distribution maps, etc.
# Checked post-fetch against the file title + its Commons categories (NOT
# as search-time "-word" exclusions: CirrusSearch caps queries at 300 chars
# and this list alone pushes past that — see cirrussearch-query-too-long-
# with-exemptions). Matched with \b word boundaries (see
# BANNED_KEYWORD_PATTERN below) so short words like "bone", "den", "egg"
# don't false-positive on real species names, e.g. "Bonelli's eagle",
# "Golden jackal", "Long-legged buzzard".
BANNED_KEYWORDS = [
    "skeleton", "skull", "osteology", "bone", "specimen", "taxidermy",
    "mounted", "stuffed", "fossil", "mhnt", "museum", "herbarium",
    "illustration", "drawing", "painting", "engraving", "clipart", "cartoon",
    "diagram", "distribution map", "range map", "postage stamp", "stamp",
    "coin", "skin (zoology)", "dead", "carcass", "roadkill", "necropsy",
    "track", "tracks", "footprint", "footprints", "pugmark", "pug mark",
    "spoor", "scat", "dung", "droppings", "burrow", "den", "nest", "egg",
    "eggs", "feather", "shed skin", "molt", "moult",
]
BANNED_KEYWORD_PATTERN = re.compile(
    r"\b(?:" + "|".join(re.escape(k) for k in BANNED_KEYWORDS) + r")\b",
    re.IGNORECASE,
)

# Fetch slightly larger than the final target so the downscale-to-800 step
# in compress_to_jpeg has real resolution to work with, not just a re-encode.
THUMB_WIDTH = 900

# Final on-disk compression target, applied after download regardless of the
# source format/quality — Commons thumbnails can still be large PNGs or
# high-quality JPEGs at the requested width, so re-encoding is needed to
# actually keep per-image size small across ~1700 species. Matches the
# w=800&q=80 convention already used by species.json's existing photoUrl
# entries (see CLAUDE.md).
JPEG_QUALITY = 78
JPEG_MAX_WIDTH = 800

REQUEST_TIMEOUT = 20
RETRIES = 3


def log(msg: str) -> None:
    print(msg, flush=True)


def slugify(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def strip_html(raw: str) -> str:
    text = re.sub(r"<[^>]+>", "", raw or "")
    return html.unescape(text).strip()


def request_json(url: str, params: dict, session: requests.Session) -> dict | None:
    for attempt in range(1, RETRIES + 1):
        try:
            resp = session.get(url, params=params, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                # MediaWiki/GBIF can return HTTP 200 with an API-level error
                # payload (e.g. cirrussearch-query-too-long-with-exemptions)
                # instead of an HTTP error — treat that as a failure too,
                # rather than silently returning it as if it were real data.
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


def resolve_class_key(class_name: str, session: requests.Session) -> int | None:
    """Look up the GBIF Backbone Taxonomy key for a class (e.g. 'Aves') by
    name via the /species/match endpoint, which resolves specifically
    against the backbone checklist (unlike /species/search, which can match
    unrelated checklists and return a non-backbone key)."""
    data = request_json(
        f"{GBIF_BASE}/species/match",
        {"name": class_name, "rank": "CLASS", "strict": "true"},
        session,
    )
    if not data or data.get("matchType") == "NONE":
        return None
    if data.get("class") != class_name or data.get("kingdom") != "Animalia":
        return None
    return data.get("classKey")


def fetch_checklist(group: str, session: requests.Session, cache_dir: Path) -> list[dict]:
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file = cache_dir / f"gbif-checklist-{group}.json"
    if cache_file.exists():
        log(f"[{group}] using cached checklist: {cache_file}")
        return json.loads(cache_file.read_text())

    class_name = GROUP_CLASS_NAMES[group]
    class_key = resolve_class_key(class_name, session)
    if class_key is None:
        log(f"[{group}] could not resolve GBIF taxonKey for class {class_name!r}, skipping group")
        return []

    log(f"[{group}] resolved {class_name} -> GBIF taxonKey {class_key}")
    data = request_json(
        f"{GBIF_BASE}/occurrence/search",
        {
            "country": "IN",
            "taxonKey": class_key,
            "facet": "speciesKey",
            "facetLimit": 5000,
            "limit": 0,
        },
        session,
    )
    if not data:
        log(f"[{group}] GBIF facet request failed")
        return []

    facets = data.get("facets", [])
    counts = facets[0]["counts"] if facets else []
    log(f"[{group}] {len(counts)} candidate species keys from GBIF occurrence facet")

    checklist = []
    for i, entry in enumerate(counts, 1):
        species_key = entry["name"]
        detail = request_json(f"{GBIF_BASE}/species/{species_key}", {}, session)
        time.sleep(0.15)
        if not detail or detail.get("rank") != "SPECIES":
            continue
        canonical = detail.get("canonicalName")
        if not canonical:
            continue
        checklist.append(
            {
                "gbifKey": species_key,
                "scientificName": canonical,
                "occurrenceCount": entry.get("count", 0),
            }
        )
        if i % 100 == 0:
            log(f"[{group}] resolved {i}/{len(counts)} species keys...")

    checklist.sort(key=lambda s: s["occurrenceCount"], reverse=True)
    cache_file.write_text(json.dumps(checklist, indent=2))
    log(f"[{group}] checklist compiled: {len(checklist)} species (cached to {cache_file})")
    return checklist


def fetch_vernacular_name(gbif_key: str, session: requests.Session) -> str | None:
    data = request_json(f"{GBIF_BASE}/species/{gbif_key}/vernacularNames", {}, session)
    if not data:
        return None
    for entry in data.get("results", []):
        if entry.get("language") == "eng":
            return entry.get("vernacularName")
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
    return bool(
        OPEN_LICENSE_PATTERN.search(license_slug)
        or OPEN_LICENSE_PATTERN.search(license_name)
    )


def find_open_image(names: list[str], session: requests.Session) -> dict | None:
    """Try each candidate query name in order, return the first acceptable
    openly-licensed image's metadata, or None if nothing usable was found."""
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
                "imageUrl": info.get("thumburl") or info["url"],
                "sourceUrl": info.get("descriptionurl", ""),
                "license": meta.get("LicenseShortName", {}).get("value", "Unknown"),
                "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""),
                "author": strip_html(meta.get("Artist", {}).get("value", "Unknown")),
            }
    return None


def download_image(url: str, dest: Path, session: requests.Session) -> bool:
    for attempt in range(1, RETRIES + 1):
        try:
            resp = session.get(url, timeout=REQUEST_TIMEOUT, stream=True)
            if resp.status_code == 200:
                dest.write_bytes(resp.content)
                return True
            if resp.status_code in (429, 500, 502, 503, 504):
                time.sleep(1.5 * attempt)
                continue
            return False
        except requests.RequestException:
            time.sleep(1.5 * attempt)
    return False


def compress_to_jpeg(src_path: Path, dest_path: Path) -> bool:
    """Re-encode any downloaded image (PNG, high-quality JPEG, etc.) as a
    capped-width, quality-82 JPEG so per-image size stays small at ~1700-
    species scale, regardless of what Commons actually served."""
    try:
        with Image.open(src_path) as im:
            if im.mode in ("RGBA", "LA", "P"):
                im = im.convert("RGBA")
                background = Image.new("RGB", im.size, (255, 255, 255))
                background.paste(im, mask=im.split()[-1])
                im = background
            else:
                im = im.convert("RGB")
            if im.width > JPEG_MAX_WIDTH:
                ratio = JPEG_MAX_WIDTH / im.width
                im = im.resize(
                    (JPEG_MAX_WIDTH, max(1, round(im.height * ratio))),
                    Image.Resampling.LANCZOS,
                )
            im.save(dest_path, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        return True
    except Exception:
        return False


def download_and_compress(
    url: str, temp_path: Path, final_path: Path, session: requests.Session
) -> bool:
    if not download_image(url, temp_path, session):
        return False
    ok = compress_to_jpeg(temp_path, final_path)
    if temp_path != final_path:
        temp_path.unlink(missing_ok=True)
    return ok


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


def process_group(
    group: str,
    checklist: list[dict],
    out_dir: Path,
    session: requests.Session,
    delay: float,
) -> dict:
    group_dir = out_dir / group
    group_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    already_done = load_processed_slugs(manifest_path)
    stats = {"downloaded": 0, "no_image": 0, "error": 0, "skipped_existing": 0}

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, entry in enumerate(checklist, 1):
            scientific_name = entry["scientificName"]
            slug = f"{group}-{slugify(scientific_name)}"

            if slug in already_done:
                stats["skipped_existing"] += 1
                continue

            record = {
                "slug": slug,
                "group": group,
                "gbifKey": entry["gbifKey"],
                "scientificName": scientific_name,
                "occurrenceCount": entry.get("occurrenceCount", 0),
            }

            try:
                image = find_open_image([scientific_name], session)
                if image is None:
                    vernacular = fetch_vernacular_name(entry["gbifKey"], session)
                    time.sleep(delay)
                    if vernacular:
                        record["vernacularName"] = vernacular
                        image = find_open_image([vernacular], session)

                if image is None:
                    record["status"] = "no_open_image_found"
                    stats["no_image"] += 1
                    todo_f.write(
                        f"- [ ] {scientific_name} ({group}): no CC-BY/CC-BY-SA/public-domain image found on Commons\n"
                    )
                else:
                    ext = Path(image["commonsFileTitle"]).suffix.lower()
                    temp_path = group_dir / f"{slug}.download{ext}"
                    final_path = group_dir / f"{slug}.jpg"
                    ok = download_and_compress(image["imageUrl"], temp_path, final_path, session)
                    if ok:
                        record["status"] = "downloaded"
                        record["imagePath"] = str(final_path.relative_to(out_dir))
                        record["fileSizeBytes"] = final_path.stat().st_size
                        record.update(
                            {
                                k: image[k]
                                for k in (
                                    "commonsFileTitle",
                                    "sourceUrl",
                                    "license",
                                    "licenseUrl",
                                    "author",
                                )
                            }
                        )
                        stats["downloaded"] += 1
                    else:
                        record["status"] = "download_failed"
                        stats["error"] += 1
                        todo_f.write(
                            f"- [ ] {scientific_name} ({group}): image download or compression failed after retries\n"
                        )
            except Exception as exc:  # noqa: BLE001 - one bad species must not kill the batch
                record["status"] = "error"
                record["error"] = str(exc)
                stats["error"] += 1
                todo_f.write(f"- [ ] {scientific_name} ({group}): unexpected error: {exc}\n")

            manifest_f.write(json.dumps(record) + "\n")
            manifest_f.flush()
            todo_f.flush()

            if i % 25 == 0:
                log(
                    f"[{group}] {i}/{len(checklist)} processed "
                    f"(downloaded={stats['downloaded']}, no_image={stats['no_image']}, error={stats['error']})"
                )

            time.sleep(delay)

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--groups",
        default="mammals,birds",
        help="Comma-separated subset of: mammals,birds (default: both)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Cap the number of species processed per group (for a test run)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=DEFAULT_OUT,
        help=f"Output directory (default: {DEFAULT_OUT})",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.4,
        help="Seconds to sleep between species (politeness delay, default 0.4)",
    )
    args = parser.parse_args()

    groups = [g.strip() for g in args.groups.split(",") if g.strip()]
    for g in groups:
        if g not in GROUP_CLASS_NAMES:
            sys.exit(f"Unknown group {g!r}, expected one of {list(GROUP_CLASS_NAMES)}")

    out_dir = args.out.expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    cache_dir = SCRIPT_DIR.parent / "data" / "raw"

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    log(f"Output directory: {out_dir}")
    log(f"Groups: {groups}" + (f" (limit {args.limit}/group)" if args.limit else ""))

    overall = {}
    for group in groups:
        checklist = fetch_checklist(group, session, cache_dir)
        if args.limit:
            checklist = checklist[: args.limit]
        log(f"[{group}] processing {len(checklist)} species")
        overall[group] = process_group(group, checklist, out_dir, session, args.delay)

    log("\n=== Summary ===")
    for group, stats in overall.items():
        log(f"{group}: {stats}")
    log(f"\nManifest: {out_dir / 'manifest.jsonl'}")
    log(f"Skipped/failed log: {out_dir / '_todo.md'}")


if __name__ == "__main__":
    main()
