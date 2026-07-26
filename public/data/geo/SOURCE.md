# india-states.geojson — source & known limitations

**Source**: [geohacker/india](https://github.com/geohacker/india), `state/india_state.geojson`, MIT License.
Fetched 2026-07-25, simplified from ~23MB to ~400KB via `mapshaper -simplify 3% keep-shapes`
for client-side rendering. `keep-shapes` (no sliver-removal) used deliberately — an earlier
pass with sliver cleanup silently dropped Lakshadweep for being too small; this dataset keeps
all 35 original features.

## Known limitations (dataset predates some administrative changes)

- **Telangana is missing** — this dataset predates its 2014 formation from Andhra Pradesh, so
  the Andhra Pradesh polygon reflects the pre-2014 undivided state.
- **Old names in `NAME_1` property**: "Uttaranchal" (now Uttarakhand, renamed 2007), "Orissa"
  (now Odisha, renamed 2011).
- Not yet updated for the 2019 Jammu & Kashmir / Ladakh reorganization, or the 2020 merger of
  Dadra and Nagar Haveli with Daman and Diu.

None of these are currently rendered as on-map text labels (deferred in the first prototype —
see project CLAUDE.md), so they're a latent data-accuracy gap rather than a visibly wrong label
today. Worth re-sourcing or patching once a current, clearly-licensed alternative is found —
the other candidates checked at the time (`udit-001/india-maps-data`,
`Subhash9325/GeoJson-Data-of-Indian-States`) had no license file, and
`Tanmay53/india-state-boundries-geojson` (Apache-2.0) stores its data via Git LFS at 164MB,
impractical for this project's size/cost goals.
