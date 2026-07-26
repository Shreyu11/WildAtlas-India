# WildAtlas India

A state-first, photo-led interactive map for exploring India's wildlife distribution.

- Full product spec: [`docs/PRD.md`](docs/PRD.md)
- Condensed always-apply ruleset for building this project: [`CLAUDE.md`](CLAUDE.md)

Currently building **Phase 1** (mammals + birds, full depth, web-first, no monetization).

## Stack

- **Frontend**: Next.js (TypeScript, App Router, Tailwind CSS)
- **Map**: [MapLibre GL JS](https://maplibre.org/) with self-hosted [Protomaps](https://protomaps.com/) vector tiles (free, no usage-based billing)
- **Data pipeline**: Python (`pipeline/`) — ingests GBIF, IUCN Red List, eBird/State of India's Birds, ZSI State Fauna Series, and WII NWIS into precomputed marker JSON
- **Hosting**: Vercel

## Getting started

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

For the data pipeline, see [`pipeline/README.md`](pipeline/README.md).
