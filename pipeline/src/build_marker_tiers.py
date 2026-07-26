"""Assemble the final per-zoom-tier marker JSON consumed by the frontend.

Zoom tiers: country -> region/biogeographic cluster -> protected area
(PRD Section 4.2). Marker sets are pre-computed here, not recalculated
client-side on every pan/zoom.

Reads dominant-species rankings from ../data/processed/dominant_species and
protected-area records from ../data/processed/wii.
Writes states.json, species.json, protected-areas.json, and
markers/{country,region,protected-area}.json to ../../public/data/.
"""


def main() -> None:
    raise NotImplementedError("TODO: build per-zoom-tier marker JSON")


if __name__ == "__main__":
    main()
