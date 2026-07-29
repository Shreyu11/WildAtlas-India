# india-terrain.jpg — source & provenance

**Source**: [Natural Earth](https://www.naturalearthdata.com/), 50m "Cross-blended Hypsometric
Tints with Shaded Relief and Water" raster (`HYP_50M_SR_W`). Public domain — Natural Earth data
is free for any use, no attribution legally required, though it's credited in the map's
attribution control anyway per this project's "transparent, cited data" principle.

Fetched 2026-07-30 from `naciscdn.org/naturalearth/50m/raster/HYP_50M_SR_W.zip` (full world,
10800x5400px, 1/30° per pixel, plain equirectangular WGS84 — confirmed via the accompanying
`.tfw`/`.prj`). Cropped with Pillow (pure pixel-offset math, no GDAL needed given the linear
projection) to a padded India bounding box —
`[[62.0166..., 41.9833...], [103.5166..., 41.9833...], [103.5166..., -0.0166...], [62.0166..., -0.0166...]]`
(top-left/top-right/bottom-right/bottom-left) — a few degrees wider than `INDIA_BOUNDS` in
`Map.tsx` so panning near the edges doesn't hit a hard raster cutoff. Native crop is
1245x1260px; not upscaled, since the source resolution (~3.7km/pixel) is already the ceiling —
upscaling would only blur, not add real detail. Saved as JPEG (quality 92) rather than PNG since
this is continuous-tone photographic-style content, not flat color — much smaller for the same
visual quality.

**Why 50m and not 10m**: Natural Earth's 10m raster is a ~400MB *world* download (no way to
range-request just the India crop without GDAL, which isn't available in this environment) —
disproportionate for a decorative backdrop layer that sits behind state fills/outlines/markers,
never at street-level zoom. The 50m raster's ~97MB source (this crop: 421KB committed) fits the
project's existing "small precomputed asset committed to git" budget (see `SOURCE.md` in this
same folder, which rejected a 164MB GeoJSON on the same grounds).

**Design-principle note**: this is the one deliberate exception to PRD Section 7 / CLAUDE.md's
"color is reserved for wildlife" rule — see the comment above `TERRAIN_BOUNDS` in `Map.tsx`. The
raster provides the map's terrain/vegetation backdrop; UI chrome, buttons, and icons remain
monochrome as before.
