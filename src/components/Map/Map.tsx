"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as MaplibreMap,
  Marker,
  Popup,
  NavigationControl,
  AttributionControl,
  LngLatBounds,
} from "maplibre-gl";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MarkerTier, ProtectedArea, Species, State } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, PROTECTED_AREA_ICON, SPECIES_ICON } from "@/lib/mockIcons";
import { CONSERVATION_LABEL, CONSERVATION_TONE } from "@/lib/conservation";
import { useSearch } from "@/components/SearchProvider/SearchProvider";

interface MapProps {
  states: State[];
  species: Species[];
  protectedAreas: ProtectedArea[];
  markers: MarkerTier;
}

const DEFAULT_CENTER: [number, number] = [82.8, 22.5];
const DEFAULT_ZOOM = 3.6;
const DEFAULT_STATE_FILL = "#eaeae6";
const HIGHLIGHT_STATE_FILL = "#c9c9bd";
const DIM_OPACITY = "0.25";
const FULL_OPACITY = "1";

// Monochrome basemap (PRD Section 4.6): plain fill/line layers over the
// bundled state-boundary GeoJSON, no external tile fetch, no road/POI/label
// clutter. See public/data/geo/SOURCE.md for provenance and known gaps.
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    "india-states": {
      type: "geojson" as const,
      data: "/data/geo/india-states.geojson",
    },
  },
  layers: [
    // Transparent so the page's GridBackground shows through the map's
    // ocean/non-India area — the India landmass fill below stays opaque.
    { id: "bg", type: "background" as const, paint: { "background-opacity": 0 } },
    {
      id: "states-fill",
      type: "fill" as const,
      source: "india-states",
      paint: { "fill-color": DEFAULT_STATE_FILL, "fill-opacity": 1 },
    },
    {
      id: "states-outline",
      type: "line" as const,
      source: "india-states",
      paint: { "line-color": "#8a8a82", "line-width": 0.75 },
    },
  ],
};

function speciesMarkerEl(species: Species | undefined): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    "flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-xl shadow-md cursor-pointer transition-opacity";
  el.textContent = species
    ? SPECIES_ICON[species.slug] ?? DEFAULT_SPECIES_ICON
    : DEFAULT_SPECIES_ICON;
  return el;
}

function protectedAreaMarkerEl(type: ProtectedArea["type"]): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    "flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-600 bg-white text-xs shadow cursor-pointer transition-opacity";
  el.textContent = PROTECTED_AREA_ICON[type] ?? "📍";
  return el;
}

// Plain DOM text labels, not MapLibre's native symbol/text layers — those
// render pre-baked glyph bitmaps from a "glyphs" PBF server and can't use an
// arbitrary web font at runtime. This lets labels use JetBrains Mono
// (font-mono) directly, no glyphs server needed.
function labelEl(text: string, kind: "state" | "protected-area"): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    kind === "state"
      ? "font-mono text-[9px] uppercase tracking-wide text-zinc-500 pointer-events-none select-none whitespace-nowrap transition-opacity"
      : "font-mono text-[8px] text-zinc-400 pointer-events-none select-none whitespace-nowrap transition-opacity";
  el.textContent = text;
  return el;
}

// Built as real DOM nodes (not an HTML string via .setHTML()) so the "View
// details" link can trigger a real Next.js soft navigation via router.push
// — a plain <a href> would do a hard browser navigation instead, which
// bypasses Next.js's intercepting routes (the drawer would never open).
function buildPopupContent(
  opts: {
    title: string;
    subtitle?: string;
    fact: string;
    status?: Species["conservationStatus"];
    href: string;
  },
  onNavigate: (href: string) => void,
): HTMLElement {
  const container = document.createElement("div");
  container.className = "p-1 max-w-[220px]";

  const title = document.createElement("p");
  title.className = "font-semibold text-sm";
  title.textContent = opts.title;
  container.appendChild(title);

  if (opts.subtitle) {
    const subtitle = document.createElement("p");
    subtitle.className = "text-xs text-zinc-500";
    subtitle.textContent = opts.subtitle;
    container.appendChild(subtitle);
  }

  const fact = document.createElement("p");
  fact.className = "text-xs text-zinc-600 mt-1";
  fact.textContent = opts.fact;
  container.appendChild(fact);

  if (opts.status) {
    const badge = document.createElement("span");
    badge.className = `inline-block mt-1 rounded px-1.5 py-0.5 text-[10px] font-mono ${CONSERVATION_TONE[opts.status]}`;
    badge.textContent = CONSERVATION_LABEL[opts.status];
    container.appendChild(badge);
  }

  const link = document.createElement("a");
  link.href = opts.href;
  link.className = "block mt-2 text-xs font-medium underline underline-offset-2";
  link.textContent = "View details";
  link.addEventListener("click", (e) => {
    e.preventDefault();
    onNavigate(opts.href);
  });
  container.appendChild(link);

  return container;
}

interface SpeciesMarkerMeta {
  marker: Marker;
  label: Marker;
  speciesSlug: string;
  stateSlug: string;
  lng: number;
  lat: number;
}

interface ProtectedAreaMarkerMeta {
  marker: Marker;
  label: Marker;
  paSlug: string;
  stateSlug: string;
  lng: number;
  lat: number;
}

export default function Map({ states, species, protectedAreas, markers }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { query } = useSearch();

  const mapInstanceRef = useRef<MaplibreMap | null>(null);
  const stateNameBySlugRef = useRef<Map<string, string>>(new globalThis.Map());
  const speciesMarkerMetaRef = useRef<SpeciesMarkerMeta[]>([]);
  const protectedAreaMarkerMetaRef = useRef<ProtectedAreaMarkerMeta[]>([]);

  // Mount effect: creates the map, markers, and labels once (per data
  // change). Search-driven visual updates are handled by a separate, lighter
  // effect below so typing doesn't tear down/recreate every marker.
  useEffect(() => {
    if (!containerRef.current) return;

    const speciesBySlug = new globalThis.Map(species.map((s) => [s.slug, s]));
    const stateBySlug = new globalThis.Map(states.map((s) => [s.slug, s]));
    const protectedAreaBySlug = new globalThis.Map(protectedAreas.map((p) => [p.slug, p]));
    stateNameBySlugRef.current = new globalThis.Map(states.map((s) => [s.slug, s.name]));

    const map = new MaplibreMap({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 3,
      maxZoom: 8,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution:
          "Map boundaries: geohacker/india (MIT) — mock species/protected-area data",
      }),
    );

    const createdMarkers: Marker[] = [];
    const speciesMeta: SpeciesMarkerMeta[] = [];
    const paMeta: ProtectedAreaMarkerMeta[] = [];

    for (const marker of markers.speciesMarkers) {
      const sp = speciesBySlug.get(marker.speciesSlug);
      const st = stateBySlug.get(marker.stateSlug);
      if (!sp || !st) continue;

      const popup = new Popup({ offset: 24, closeButton: false }).setDOMContent(
        buildPopupContent(
          {
            title: sp.commonName,
            subtitle: `Dominant species — ${st.name}`,
            fact: sp.description,
            status: sp.conservationStatus,
            href: `/state/${st.slug}`,
          },
          (href) => router.push(href),
        ),
      );

      const m = new Marker({ element: speciesMarkerEl(sp) })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map);
      createdMarkers.push(m);

      const label = new Marker({ element: labelEl(st.name, "state"), anchor: "top", offset: [0, 24] })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);
      createdMarkers.push(label);

      speciesMeta.push({
        marker: m,
        label,
        speciesSlug: sp.slug,
        stateSlug: st.slug,
        lng: marker.lng,
        lat: marker.lat,
      });
    }

    for (const marker of markers.protectedAreaMarkers) {
      const pa = protectedAreaBySlug.get(marker.protectedAreaSlug);
      if (!pa) continue;
      const headline = speciesBySlug.get(pa.headlineSpeciesSlug);

      const popup = new Popup({ offset: 12, closeButton: false }).setDOMContent(
        buildPopupContent(
          {
            title: pa.name,
            subtitle: pa.type.replace(/-/g, " "),
            fact: headline ? `Headline species: ${headline.commonName}` : "",
            href: `/protected-area/${pa.slug}`,
          },
          (href) => router.push(href),
        ),
      );

      const m = new Marker({ element: protectedAreaMarkerEl(pa.type) })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map);
      createdMarkers.push(m);

      const label = new Marker({ element: labelEl(pa.name, "protected-area"), anchor: "top", offset: [0, 14] })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);
      createdMarkers.push(label);

      paMeta.push({
        marker: m,
        label,
        paSlug: pa.slug,
        stateSlug: pa.stateSlug,
        lng: marker.lng,
        lat: marker.lat,
      });
    }

    speciesMarkerMetaRef.current = speciesMeta;
    protectedAreaMarkerMetaRef.current = paMeta;

    // MapLibre measures its container once at construction time; in a flex
    // layout that measurement can land before Tailwind/layout has settled to
    // its final size, leaving the canvas stuck small. Keep it in sync.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      createdMarkers.forEach((m) => m.remove());
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [states, species, protectedAreas, markers, router]);

  // Search-driven spotlight/highlight (map-native filter, not navigation —
  // matching pins/labels stay full opacity, others dim; matched states'
  // fill is emphasized; camera fits bounds to the current matches).
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const q = query.trim().toLowerCase();

    const resetFill = () => {
      if (map.getLayer("states-fill")) {
        map.setPaintProperty("states-fill", "fill-color", DEFAULT_STATE_FILL);
      }
    };

    if (!q) {
      speciesMarkerMetaRef.current.forEach(({ marker, label }) => {
        marker.getElement().style.opacity = FULL_OPACITY;
        label.getElement().style.opacity = FULL_OPACITY;
      });
      protectedAreaMarkerMetaRef.current.forEach(({ marker, label }) => {
        marker.getElement().style.opacity = FULL_OPACITY;
        label.getElement().style.opacity = FULL_OPACITY;
      });
      resetFill();
      map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 500 });
      return;
    }

    const matchedSpeciesSlugs = new Set(
      species
        .filter(
          (s) => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q),
        )
        .map((s) => s.slug),
    );
    const matchedProtectedAreaSlugs = new Set(
      protectedAreas.filter((p) => p.name.toLowerCase().includes(q)).map((p) => p.slug),
    );
    const matchedStateSlugs = new Set(
      states.filter((s) => s.name.toLowerCase().includes(q)).map((s) => s.slug),
    );

    // Cascade: a matched species/protected-area highlights its state(s); a
    // directly-matched state highlights the protected areas within it.
    for (const sp of species) {
      if (matchedSpeciesSlugs.has(sp.slug)) sp.stateSlugs.forEach((slug) => matchedStateSlugs.add(slug));
    }
    for (const pa of protectedAreas) {
      if (matchedProtectedAreaSlugs.has(pa.slug)) matchedStateSlugs.add(pa.stateSlug);
    }
    for (const pa of protectedAreas) {
      if (matchedStateSlugs.has(pa.stateSlug)) matchedProtectedAreaSlugs.add(pa.slug);
    }

    const bounds = new LngLatBounds();
    let hasMatch = false;

    speciesMarkerMetaRef.current.forEach(({ marker, label, speciesSlug, stateSlug, lng, lat }) => {
      const matched = matchedSpeciesSlugs.has(speciesSlug) || matchedStateSlugs.has(stateSlug);
      marker.getElement().style.opacity = matched ? FULL_OPACITY : DIM_OPACITY;
      label.getElement().style.opacity = matched ? FULL_OPACITY : DIM_OPACITY;
      if (matched) {
        bounds.extend([lng, lat]);
        hasMatch = true;
      }
    });

    protectedAreaMarkerMetaRef.current.forEach(({ marker, label, paSlug, lng, lat }) => {
      const matched = matchedProtectedAreaSlugs.has(paSlug);
      marker.getElement().style.opacity = matched ? FULL_OPACITY : DIM_OPACITY;
      label.getElement().style.opacity = matched ? FULL_OPACITY : DIM_OPACITY;
      if (matched) {
        bounds.extend([lng, lat]);
        hasMatch = true;
      }
    });

    const matchedStateNames = Array.from(matchedStateSlugs)
      .map((slug) => stateNameBySlugRef.current.get(slug))
      .filter((name): name is string => Boolean(name));

    if (map.getLayer("states-fill")) {
      map.setPaintProperty(
        "states-fill",
        "fill-color",
        matchedStateNames.length > 0
          ? ([
              "case",
              ["in", ["get", "NAME_1"], ["literal", matchedStateNames]],
              HIGHLIGHT_STATE_FILL,
              DEFAULT_STATE_FILL,
            ] as unknown as string)
          : DEFAULT_STATE_FILL,
      );
    }

    if (hasMatch) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 7, duration: 500 });
    }
  }, [query, states, species, protectedAreas]);

  return <div ref={containerRef} className="h-full w-full" />;
}
