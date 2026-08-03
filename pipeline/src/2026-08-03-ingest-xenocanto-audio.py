"""Bird-call audio ingester (Xeno-canto API v3).

For each bird in public/data/species.json, queries Xeno-canto for recordings
matching the genus+species, picks the best-quality usable recording, and
records its hotlinked file URL + attribution (recordist/license/source page)
in a manifest. Mammals are out of scope - no equivalent open, purpose-built
mammal-call archive exists (see docs/DATASET_PLAN.md Sec 0, 2026-08-03).

Xeno-canto's old key-less v2 API is retired. v3 requires a free personal API
key (sign up at https://xeno-canto.org/account) passed via the XC_API_KEY
env var or --api-key - never hardcode or commit a key.

Only produces a raw manifest under --out. Does NOT touch
public/data/species.json - merging is a separate, reviewed step
(2026-08-03-merge-species-updates.py), same pattern as the image downloader.

Usage:
    export XC_API_KEY=your-key-here
    python3 2026-08-03-ingest-xenocanto-audio.py
    python3 2026-08-03-ingest-xenocanto-audio.py --limit 5   # test run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from datetime import date

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_SPECIES_JSON = REPO_ROOT / "public" / "data" / "species.json"
DEFAULT_OUT = SCRIPT_DIR.parent / "data" / "raw" / "audio"

XC_API_BASE = "https://xeno-canto.org/api/3/recordings"

CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-AudioIngest/1.0 (contact: {CONTACT}) python-requests"

REQUEST_TIMEOUT = 20
RETRIES = 3

# Xeno-canto's quality rating, best to worst - used to pick the best
# available recording rather than just the first result.
QUALITY_ORDER = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "no score": 5}


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
            if resp.status_code == 401:
                sys.exit(
                    "Xeno-canto API rejected the key (401) - check XC_API_KEY / --api-key "
                    "is a valid key from https://xeno-canto.org/account"
                )
            if resp.status_code in (429, 500, 502, 503, 504):
                time.sleep(1.5 * attempt)
                continue
            return None
        except requests.RequestException:
            time.sleep(1.5 * attempt)
    return None


def binomial_name(scientific_name: str) -> str:
    """Xeno-canto's gen:/sp: tags expect genus+species, not a subspecies
    trinomial - e.g. 'Halcyon smyrnensis fusca' -> 'Halcyon smyrnensis'."""
    parts = scientific_name.strip().split()
    return " ".join(parts[:2]) if len(parts) >= 2 else scientific_name


def search_recordings(
    scientific_name: str, api_key: str, session: requests.Session
) -> list[dict]:
    genus, species = binomial_name(scientific_name).split(" ", 1)
    query = f"gen:{genus} sp:{species} grp:birds"
    data = request_json(XC_API_BASE, {"query": query, "key": api_key, "per_page": 20}, session)
    if not data:
        return []
    return data.get("recordings", [])


def pick_best_recording(recordings: list[dict]) -> dict | None:
    usable = [r for r in recordings if r.get("file")]
    if not usable:
        return None
    usable.sort(key=lambda r: QUALITY_ORDER.get(r.get("q", "no score"), 5))
    return usable[0]


def license_short_name(lic_url: str) -> str:
    """Xeno-canto's `lic` field is a protocol-relative creativecommons.org
    path, e.g. '//creativecommons.org/licenses/by-nc-sa/4.0/'. Derive a
    short display name from it rather than showing the raw URL."""
    parts = [p for p in lic_url.strip("/").split("/") if p]
    if "licenses" in parts:
        idx = parts.index("licenses")
        slug = parts[idx + 1] if idx + 1 < len(parts) else "unknown"
        version = parts[idx + 2] if idx + 2 < len(parts) else ""
        return f"CC {slug.upper()} {version}".strip()
    return lic_url


def build_attribution(recording: dict) -> dict:
    lic_raw = recording.get("lic", "")
    lic_url = ("https:" + lic_raw) if lic_raw.startswith("//") else lic_raw
    source_url = recording.get("url", "")
    if source_url.startswith("//"):
        source_url = "https:" + source_url
    elif source_url and not source_url.startswith("http"):
        source_url = f"https://xeno-canto.org/{recording.get('id', '')}"
    return {
        "author": recording.get("rec", "Unknown"),
        "license": license_short_name(lic_url) if lic_url else "Unknown",
        "licenseUrl": lic_url,
        "sourceUrl": source_url,
    }


def audio_file_url(recording: dict) -> str:
    file_url = recording.get("file", "")
    if file_url.startswith("//"):
        return "https:" + file_url
    return file_url


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


def process_birds(
    birds: list[dict], api_key: str, out_dir: Path, session: requests.Session, delay: float
) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"
    todo_path = out_dir / "_todo.md"

    already_done = load_processed_slugs(manifest_path)
    stats = {"resolved": 0, "no_recording_found": 0}

    with manifest_path.open("a") as manifest_f, todo_path.open("a") as todo_f:
        for i, sp in enumerate(birds, 1):
            slug = sp["slug"]
            scientific_name = sp["scientificName"]

            if slug in already_done:
                continue

            record = {"slug": slug, "scientificName": scientific_name}
            try:
                recordings = search_recordings(scientific_name, api_key, session)
                best = pick_best_recording(recordings)
                if not best:
                    record["status"] = "no_recording_found"
                    stats["no_recording_found"] += 1
                    todo_f.write(
                        f"- [ ] {scientific_name} ({slug}): no usable Xeno-canto recording found\n"
                    )
                else:
                    record["status"] = "resolved"
                    record["audioUrl"] = audio_file_url(best)
                    record["audioAttribution"] = build_attribution(best)
                    record["xenoCantoId"] = best.get("id")
                    record["quality"] = best.get("q")
                    stats["resolved"] += 1
            except Exception as exc:  # noqa: BLE001 - one bad species must not kill the batch
                record["status"] = "error"
                record["error"] = str(exc)
                todo_f.write(f"- [ ] {scientific_name} ({slug}): unexpected error: {exc}\n")

            manifest_f.write(json.dumps(record) + "\n")
            manifest_f.flush()
            todo_f.flush()

            if i % 10 == 0:
                log(f"{i}/{len(birds)} processed ({stats})")

            time.sleep(delay)

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--species-json", type=Path, default=DEFAULT_SPECIES_JSON)
    parser.add_argument("--api-key", default=os.environ.get("XC_API_KEY"))
    parser.add_argument("--limit", type=int, default=None, help="Cap birds processed (test run)")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--delay", type=float, default=0.5, help="Seconds between species")
    args = parser.parse_args()

    if not args.api_key:
        sys.exit(
            "Missing Xeno-canto API key. Sign up (free) at https://xeno-canto.org/account, "
            "then set XC_API_KEY=<key> or pass --api-key."
        )

    species_list = json.loads(args.species_json.read_text())
    birds = [s for s in species_list if s.get("taxon") == "bird"]
    if args.limit:
        birds = birds[: args.limit]

    out_dir = args.out.expanduser().resolve()
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    log(f"Species source: {args.species_json}")
    log(f"Output directory: {out_dir}")
    log(f"Processing {len(birds)} bird species")

    stats = process_birds(birds, args.api_key, out_dir, session, args.delay)

    log("\n=== Summary ===")
    log(str(stats))
    log(f"Manifest: {out_dir / 'manifest.jsonl'}")
    log(f"Skipped/failed log: {out_dir / '_todo.md'}")


if __name__ == "__main__":
    main()
