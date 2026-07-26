"""Compute the dominant species per state and per sub-region.

Blended score: observation density (GBIF/eBird/iNaturalist records) +
conservation flagship status + cultural/state-symbol significance
(PRD Section 4.1). No manual overrides in Phase 1 — ship the computed
ranking as-is.

Reads normalized records from ../data/processed/{gbif,iucn,ebird,zsi,wii}.
Writes per-state/per-region dominant-species rankings to
../data/processed/dominant_species.
"""


def main() -> None:
    raise NotImplementedError("TODO: compute dominant-species rankings")


if __name__ == "__main__":
    main()
