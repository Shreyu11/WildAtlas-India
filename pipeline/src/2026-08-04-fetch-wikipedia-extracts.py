"""Stage 2 helper: fetch raw Wikipedia summary extracts for a batch.

This does NOT produce a description - it stages source material only. A
human (or Claude, reading this output) composes a fresh 1-2 sentence
description + habitat line per species from the extract, per
docs/DATASET_PLAN.md's "freshly written, never copy-pasted" convention -
same as the existing park/sanctuary/zoo description process.

Selects the next --batch-size candidates from identity-manifest.jsonl
(resolved only), ordered by occurrenceCount descending, that haven't
already been merged into public/data/species.json and aren't already in
a prior batch file, and fetches each one's Wikipedia REST summary extract
by commonName (falling back to scientificName on a 404).

Usage:
    python3 2026-08-04-fetch-wikipedia-extracts.py --batch-size 25 --batch-name batch-001
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_IDENTITY_MANIFEST = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "identity-manifest.jsonl"
DEFAULT_LIVE_SPECIES_JSON = REPO_ROOT / "public" / "data" / "species.json"
DEFAULT_OUT_DIR = SCRIPT_DIR.parent / "data" / "raw" / "new-species" / "batches"

WIKIPEDIA_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
CONTACT = "shreyas.rygbee@gmail.com"
USER_AGENT = f"WildAtlasIndia-WikipediaExtracts/1.0 (contact: {CONTACT}) python-requests"
REQUEST_TIMEOUT = 15


def log(msg: str) -> None:
    print(msg, flush=True)


def fetch_summary(title: str, session: requests.Session) -> dict | None:
    try:
        resp = session.get(WIKIPEDIA_SUMMARY.format(title=title.replace(" ", "_")), timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("type") == "disambiguation":
                return None
            return data
        return None
    except requests.RequestException:
        return None


def already_processed_slugs(out_dir: Path) -> set[str]:
    slugs: set[str] = set()
    if not out_dir.exists():
        return slugs
    for batch_file in out_dir.glob("*-extracts.jsonl"):
        for line in batch_file.read_text().splitlines():
            if line.strip():
                slugs.add(json.loads(line)["slug"])
    return slugs


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--identity-manifest", type=Path, default=DEFAULT_IDENTITY_MANIFEST)
    parser.add_argument("--live-species-json", type=Path, default=DEFAULT_LIVE_SPECIES_JSON)
    parser.add_argument("--batch-size", type=int, default=25)
    parser.add_argument("--batch-name", required=True, help="e.g. batch-001")
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--delay", type=float, default=0.2)
    args = parser.parse_args()

    live_slugs = {s["slug"] for s in json.loads(args.live_species_json.read_text())}
    already_batched = already_processed_slugs(args.out_dir)

    resolved = []
    for line in args.identity_manifest.read_text().splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        if r.get("status") == "resolved" and r["slug"] not in live_slugs and r["slug"] not in already_batched:
            resolved.append(r)

    resolved.sort(key=lambda r: r.get("occurrenceCount", 0), reverse=True)
    batch = resolved[: args.batch_size]

    if not batch:
        log("No unbatched resolved candidates remain.")
        return

    args.out_dir.mkdir(parents=True, exist_ok=True)
    out_path = args.out_dir / f"{args.batch_name}-extracts.jsonl"

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    log(f"Fetching extracts for {len(batch)} candidates -> {out_path}")

    with out_path.open("w") as f:
        for i, r in enumerate(batch, 1):
            summary = fetch_summary(r["commonName"], session)
            if not summary:
                time.sleep(args.delay)
                summary = fetch_summary(r["scientificName"], session)

            record = {
                "slug": r["slug"],
                "commonName": r["commonName"],
                "scientificName": r["scientificName"],
                "taxon": r["taxon"],
                "conservationStatus": r["conservationStatus"],
            }
            if summary:
                record["wikipediaExtract"] = summary.get("extract")
                record["wikipediaUrl"] = summary.get("content_urls", {}).get("desktop", {}).get("page")
            else:
                record["wikipediaExtract"] = None
                record["wikipediaUrl"] = None

            f.write(json.dumps(record) + "\n")
            f.flush()
            time.sleep(args.delay)

            if i % 10 == 0:
                log(f"{i}/{len(batch)} fetched")

    no_extract = sum(1 for line in out_path.read_text().splitlines() if json.loads(line)["wikipediaExtract"] is None)
    log(f"\nDone. {len(batch) - no_extract}/{len(batch)} have a Wikipedia extract. {no_extract} need manual sourcing.")
    log(f"Next: read {out_path}, compose real description/habitat per species, then run the merge script.")


if __name__ == "__main__":
    main()
