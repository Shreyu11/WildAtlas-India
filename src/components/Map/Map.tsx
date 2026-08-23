"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as MaplibreMap,
  Marker as MaplibreMarker,
  NavigationControl,
  AttributionControl,
  LngLatBounds,
  type GeoJSONSource,
  type StyleSpecification,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Supercluster from "supercluster";
import type { MarkerTier, ProtectedArea, Species, SpeciesDensityCell, SpeciesDensityMap, State, Zoo } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, PROTECTED_AREA_ICON, SPECIES_ICON, ZOO_ICON } from "@/lib/mockIcons";
import { CONSERVATION_LABEL, CONSERVATION_TONE } from "@/lib/conservation";
import { createRoot } from "react-dom/client";
import { MarkerTooltip, Marker } from "@/design-system";
import { useSearch } from "@/components/SearchProvider/SearchProvider";
import { useMapSettings } from "@/components/MapSettingsProvider/MapSettingsProvider";

interface MapProps {
  states: State[];
  species: Species[];
  protectedAreas: ProtectedArea[];
  zoos?: Zoo[];
  speciesDensity?: SpeciesDensityMap;
  markers: MarkerTier;
}

// Fallback center/zoom for the instant before the map's first layout pass —
// immediately replaced by fitIndiaBounds() below, which derives the actual
// zoom from the container's real size instead of a fixed guess.
const DEFAULT_CENTER: [number, number] = [82.8, 22.5];
const DEFAULT_ZOOM = 3.6;
// Rough India bounding box (mainland + Andaman & Nicobar). Fitting to this
// on load — rather than a fixed center/zoom — means the initial view
// adapts to the actual viewport/container size instead of over- or
// under-zooming on very wide or very narrow screens.
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [68.0, 6.0],
  [97.5, 36.0],
];
// Tailwind's gray-100 / gray-200 — used directly as hex since these feed
// MapLibre's `paint` config (plain JS values, not Tailwind classes).
const DEFAULT_STATE_FILL = "#F3F4F6";
const HOVER_STATE_FILL = "#E5E7EB";
const HIGHLIGHT_STATE_FILL = "#c9c9bd";
// Darkened version of HIGHLIGHT_STATE_FILL, used when hovering a state that's
// already highlighted by a search match — hover still gives feedback, but as
// a darker shade of that state's *current* color rather than overriding it
// with the plain (non-highlight) hover color.
const HIGHLIGHT_STATE_HOVER_FILL = "#b4b4a6";

// Hover always gives feedback over the search-match highlight — it's a
// direct, real-time cursor interaction — but on an already-highlighted state
// it darkens that highlight color instead of replacing it with the plain
// hover color, so the state reads as "this one, but hovered" rather than
// losing its highlight.
function buildFillColorExpression(matchedStateNames: string[]): unknown {
  return [
    "case",
    [
      "all",
      ["boolean", ["feature-state", "hover"], false],
      ["in", ["get", "NAME_1"], ["literal", matchedStateNames]],
    ],
    HIGHLIGHT_STATE_HOVER_FILL,
    ["boolean", ["feature-state", "hover"], false],
    HOVER_STATE_FILL,
    ["in", ["get", "NAME_1"], ["literal", matchedStateNames]],
    HIGHLIGHT_STATE_FILL,
    DEFAULT_STATE_FILL,
  ];
}

// Empty starting point for the "species-hotspot" source below — populated
// only once a species search actually has real anchor points to show.
const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection" as const, features: [] };

// Search-driven "hotspot" glow (see buildHotspotFeatures below) — soft,
// blurred circles anchored only on real data points (a species' own state
// marker, or a protected area that lists it as headline species), never a
// fabricated density surface. Two stacked circles per point (soft outer
// halo + slightly denser core) read as a glow rather than a hard-edged pin.
// Kept monochrome/gray, not a new saturated color, per "color is reserved
// for wildlife" (PRD Section 7) — this is a search-relevance indicator, not
// a wildlife photo.
const HOTSPOT_GLOW_COLOR = "#6b6b60";

// Monochrome basemap (PRD Section 4.6): plain fill/line layers over the
// bundled state-boundary GeoJSON, no external tile fetch, no road/POI/label
// clutter. See public/data/geo/SOURCE.md for provenance and known gaps.
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    "india-states": {
      type: "geojson" as const,
      data: "/data/geo/india-states.geojson",
      // Lets each feature be addressed by its state name via feature-state
      // (used for the hover highlight) instead of MapLibre's internal ids.
      promoteId: "NAME_1",
    },
    "species-hotspot": {
      type: "geojson" as const,
      data: EMPTY_FEATURE_COLLECTION as GeoJSON.FeatureCollection,
    },
    "species-density-grid": {
      type: "geojson" as const,
      data: EMPTY_FEATURE_COLLECTION as GeoJSON.FeatureCollection,
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
      paint: { "fill-color": buildFillColorExpression([]) as string, "fill-opacity": 1 },
    },
    {
      id: "species-density-fill",
      type: "fill" as const,
      source: "species-density-grid",
      paint: {
        "fill-color": [
          "match",
          ["get", "level"],
          1, "#fde047",
          2, "#f97316",
          3, "#dc2626",
          "#fde047"
        ],
        "fill-opacity": [
          "match",
          ["get", "level"],
          1, 0.45,
          2, 0.60,
          3, 0.75,
          0.5
        ]
      },
    },
    {
      id: "species-density-outline",
      type: "line" as const,
      source: "species-density-grid",
      paint: {
        "line-color": "#ffffff",
        "line-width": 1.2,
        "line-opacity": 0.8,
      },
    },
    {
      id: "states-outline",
      type: "line" as const,
      source: "india-states",
      paint: { "line-color": "#8a8a82", "line-width": 0.75 },
    },
    // Wide, heavily-blurred halo — the outer fade of the glow.
    {
      id: "species-hotspot-outer",
      type: "circle" as const,
      source: "species-hotspot",
      paint: {
        "circle-radius": 55,
        "circle-color": HOTSPOT_GLOW_COLOR,
        "circle-opacity": 0.18,
        "circle-blur": 1,
      },
    },
    // Smaller, denser core so the anchor point itself still reads clearly.
    {
      id: "species-hotspot-inner",
      type: "circle" as const,
      source: "species-hotspot",
      paint: {
        "circle-radius": 22,
        "circle-color": HOTSPOT_GLOW_COLOR,
        "circle-opacity": 0.3,
        "circle-blur": 0.6,
      },
    },
  ],
};

// Real anchor points only — a species' own state marker location, plus any
// protected area that lists it as headline species — never a fabricated
// range/density surface (PRD "transparent, cited data").
function buildHotspotFeatures(
  matchedSpeciesSlugs: Set<string>,
  speciesMarkerMeta: SpeciesMarkerMeta[],
  protectedAreas: ProtectedArea[],
): GeoJSON.FeatureCollection {
  const seen = new Set<string>();
  const features: GeoJSON.Feature[] = [];
  const addPoint = (lng: number, lat: number) => {
    const key = `${lng},${lat}`;
    if (seen.has(key)) return;
    seen.add(key);
    features.push({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [lng, lat] } });
  };

  for (const { speciesSlug, lng, lat } of speciesMarkerMeta) {
    if (matchedSpeciesSlugs.has(speciesSlug)) addPoint(lng, lat);
  }
  for (const pa of protectedAreas) {
    if (matchedSpeciesSlugs.has(pa.headlineSpeciesSlug)) addPoint(pa.lng, pa.lat);
  }

  return { type: "FeatureCollection", features };
}

function buildDensityGridFeatures(
  targetSpeciesSlugs: Set<string>,
  densityData?: SpeciesDensityMap,
): GeoJSON.FeatureCollection {
  if (!densityData || targetSpeciesSlugs.size === 0) {
    return EMPTY_FEATURE_COLLECTION as GeoJSON.FeatureCollection;
  }

  const features: GeoJSON.Feature[] = [];

  for (const slug of targetSpeciesSlugs) {
    const cells = densityData[slug];
    if (!cells) continue;

    for (const cell of cells) {
      features.push({
        type: "Feature",
        properties: { level: cell.level, speciesSlug: slug },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [cell.minLng, cell.minLat],
              [cell.maxLng, cell.minLat],
              [cell.maxLng, cell.maxLat],
              [cell.minLng, cell.maxLat],
              [cell.minLng, cell.minLat],
            ],
          ],
        },
      });
    }
  }

  return { type: "FeatureCollection", features };
}

// Default marker -> hover -> click reads as ONE element evolving, not a
// hover preview handing off to an unrelated popup. A `expanded` class, set
// by the click handler in the mount effect below, drives the exact same
// descendant-selector mechanism `group-hover:` already uses — just
// `[.expanded_&]:` instead — so the compact hover card and the full
// click-detail card are two states of the same DOM, not two DOM subtrees.
//
// The always-present 44px circle/icon never resizes itself (so the map's
// percentage-based anchor math, and the marker's actual geo-coordinate,
// never move), and this card's own bottom edge is pinned to `bottom-1/2` of
// that fixed-size wrapper, i.e. exactly the circle's center, in both the
// compact and expanded state. Its tail (last flex child, so it renders at
// that pinned bottom edge) always points back at that same center point
// regardless of how tall the card grows.
//
// Only opacity/transform/width/grid-template-rows animate — no
// height/border-radius/flex changes — which is what keeps every transition
// smooth; a discrete property like flex-direction can't be interpolated, so
// animating it (an earlier version of this did) snaps instead of easing.
// The detail block's reveal uses a `grid-rows-[0fr] -> [1fr]` transition
// rather than a `max-height` hack — grid-rows animates to the block's
// *actual* content height, so a long description doesn't get clipped or
// finish revealing early against an arbitrary cap.
//
// Shared by both marker types below. `photo` fills the card's full content
// width (not a narrower centered square), so the gap around it reads as the
// same `p-2` on every side — a fixed-width photo narrower than the card
function buildMarkerCard(opts: {
  photoUrl: string | null | undefined;
  fallbackIcon: string;
  altText: string;
  label: string;
  subtitle?: string;
  fact: string;
  status?: Species["conservationStatus"];
  href: string;
  onNavigate: (href: string) => void;
}): HTMLDivElement {
  const container = document.createElement("div");
  container.className =
    "absolute bottom-1/2 left-1/2 flex origin-bottom -translate-x-1/2 scale-50 flex-col items-center opacity-0 pointer-events-none drop-shadow-lg transition duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 [.expanded_&]:pointer-events-auto [.expanded_&]:scale-100 [.expanded_&]:opacity-100";

  const root = createRoot(container);
  root.render(
    <MarkerTooltip
      photoUrl={opts.photoUrl}
      fallbackIcon={opts.fallbackIcon}
      altText={opts.altText}
      label={opts.label}
      subtitle={opts.subtitle}
      fact={opts.fact}
      status={opts.status}
      href={opts.href}
      onNavigate={() => opts.onNavigate(opts.href)}
    />
  );

  return container;
}

function speciesMarkerEl(
  species: Species | undefined,
  detail: {
    subtitle?: string;
    fact: string;
    status?: Species["conservationStatus"];
    href: string;
    onNavigate: (href: string) => void;
  },
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "group cursor-pointer hover:z-50 [&.expanded]:z-50";

  const pinContainer = document.createElement("div");
  pinContainer.className = "transition-opacity duration-200 ease-out group-hover:opacity-0 [.expanded_&]:opacity-0";
  const fallbackIcon = species ? SPECIES_ICON[species.slug] ?? DEFAULT_SPECIES_ICON : DEFAULT_SPECIES_ICON;
  
  createRoot(pinContainer).render(
    <Marker type="species" photoUrl={species?.photoUrl} icon={fallbackIcon} />
  );
  wrapper.appendChild(pinContainer);

  wrapper.appendChild(
    buildMarkerCard({
      photoUrl: species?.photoUrl,
      fallbackIcon,
      altText: species?.commonName ?? "",
      label: species?.commonName ?? "",
      ...detail,
    }),
  );

  return wrapper;
}

function protectedAreaMarkerEl(
  pa: ProtectedArea,
  headline: Species | undefined,
  detail: { subtitle?: string; fact: string; href: string; onNavigate: (href: string) => void },
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "group cursor-pointer hover:z-50 [&.expanded]:z-50";

  const fallbackIcon = PROTECTED_AREA_ICON[pa.type] ?? "📍";

  const pinContainer = document.createElement("div");
  pinContainer.className = "transition-opacity duration-200 ease-out group-hover:opacity-0 [.expanded_&]:opacity-0";
  
  const markerType = pa.type === "national-park" ? "national-park" : "sanctuary";
  createRoot(pinContainer).render(
    <Marker type={markerType} icon={fallbackIcon} />
  );
  wrapper.appendChild(pinContainer);

  wrapper.appendChild(
    buildMarkerCard({
      photoUrl: pa.photoUrl,
      fallbackIcon,
      altText: pa.name,
      label: pa.name,
      ...detail,
    }),
  );

  return wrapper;
}

function zooMarkerEl(
  zoo: Zoo,
  headline: Species | undefined,
  detail: { subtitle?: string; fact: string; href: string; onNavigate: (href: string) => void },
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "group cursor-pointer hover:z-50 [&.expanded]:z-50";

  const pinContainer = document.createElement("div");
  pinContainer.className = "transition-opacity duration-200 ease-out group-hover:opacity-0 [.expanded_&]:opacity-0";
  
  createRoot(pinContainer).render(
    <Marker type="zoo" icon={ZOO_ICON} />
  );
  wrapper.appendChild(pinContainer);

  wrapper.appendChild(
    buildMarkerCard({
      photoUrl: zoo.photoUrl,
      fallbackIcon: ZOO_ICON,
      altText: zoo.name,
      label: zoo.name,
      ...detail,
    }),
  );

  return wrapper;
}

function clusterMarkerEl(count: number, onClick: () => void): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "cursor-pointer";
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  createRoot(el).render(<Marker type="cluster" count={count} />);
  return el;
}

// Geo point fed into the protected-area/zoo Supercluster index below. `kind`
// + `slug` are enough to look the full entity back up in `protectedAreas`/
// `zoos` when rendering a leaf marker.
interface ClusterPointProps {
  kind: "protected-area" | "zoo";
  slug: string;
}

// One below the map's own hard `maxZoom` (8, set on the MaplibreMap
// instance below) — not the same value. Supercluster only clusters points
// *up to and including* its own maxZoom; setting it strictly lower than the
// map's cap guarantees that by the time you reach the map's actual maximum
// zoom, every point renders as its own individual marker, never a residual
// cluster. Without this gap, a tight-radius cluster whose members are still
// within `CLUSTER_RADIUS_PX` of each other at zoom 8 would keep re-forming
// an equivalent cluster every time you clicked it — the map recenters (a
// visible "jump") but the same badge reappears in the rebuild that follows,
// reading as a flicker with no actual progress.
const CLUSTER_MAX_ZOOM = 7;
const CLUSTER_RADIUS_PX = 50;

// Bounding-box center of a GeoJSON Polygon/MultiPolygon geometry, used to
// place a label for states that have no species marker to anchor to.
function geometryBoundsCenter(geometry: { coordinates: unknown }): [number, number] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  const walk = (coords: unknown): void => {
    if (Array.isArray(coords) && typeof coords[0] === "number") {
      const [lng, lat] = coords as [number, number];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      return;
    }
    if (Array.isArray(coords)) coords.forEach(walk);
  };
  walk(geometry.coordinates);
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

// Plain DOM text labels, not MapLibre's native symbol/text layers — those
// render pre-baked glyph bitmaps from a "glyphs" PBF server and can't use an
// arbitrary web font at runtime. This lets labels use JetBrains Mono
// (font-mono) directly, no glyphs server needed.
//
// Protected-area (national park) names are the more specific, more useful
// label when you're zoomed in enough to read either one, so they're set
// bigger and darker than state names — state labels stay the quieter,
// background layer.
function labelEl(text: string, kind: "state" | "protected-area"): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    kind === "state"
      ? "font-mono text-[9px] uppercase tracking-wide text-zinc-400 pointer-events-none select-none whitespace-nowrap transition-opacity"
      : "font-mono text-[10px] font-semibold text-zinc-700 pointer-events-none select-none whitespace-nowrap transition-opacity";
  el.textContent = text;
  return el;
}

interface SpeciesMarkerMeta {
  marker: MaplibreMarker;
  speciesSlug: string;
  stateSlug: string;
  lng: number;
  lat: number;
}

interface StateLabelMeta {
  label: MaplibreMarker;
  stateSlug: string;
  stateName: string;
  lng: number;
  lat: number;
}

const GEO_NAME_ALIASES: Record<string, string[]> = {
  "odisha": ["Odisha", "Orissa"],
  "uttarakhand": ["Uttarakhand", "Uttaranchal"],
  "andaman-and-nicobar-islands": ["Andaman & Nicobar", "Andaman and Nicobar"],
  "jammu-and-kashmir": ["Jammu & Kashmir", "Jammu and Kashmir"],
  "dadra-and-nagar-haveli-and-daman-and-diu": [
    "Dadra & Nagar Haveli and Daman & Diu",
    "Dadra and Nagar Haveli",
    "Daman and Diu"
  ],
  "puducherry": ["Puducherry", "Pondicherry"],
};

function getGeoNamesForStateSlugs(stateSlugs: Iterable<string>, stateNameBySlug: Map<string, string>): string[] {
  const geoNames = new Set<string>();
  for (const slug of stateSlugs) {
    const name = stateNameBySlug.get(slug);
    if (name) geoNames.add(name);
    const aliases = GEO_NAME_ALIASES[slug];
    if (aliases) {
      aliases.forEach((a) => geoNames.add(a));
    }
  }
  return Array.from(geoNames);
}

export default function Map({ states, species, protectedAreas, zoos = [], speciesDensity, markers }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { query } = useSearch();
  const { settings } = useMapSettings();
  const [selectedSpeciesSlug, setSelectedSpeciesSlug] = useState<string | null>(null);
  const [viewTick, setViewTick] = useState(0);

  const mapInstanceRef = useRef<MaplibreMap | null>(null);
  const stateNameBySlugRef = useRef<Map<string, string>>(new globalThis.Map());
  const speciesMarkerMetaRef = useRef<SpeciesMarkerMeta[]>([]);
  const stateLabelMetaRef = useRef<StateLabelMeta[]>([]);
  const paZooMarkersRef = useRef<MaplibreMarker[]>([]);
  const lastClusterSignatureRef = useRef<string>("");
  const expandedMarkerRef = useRef<HTMLDivElement | null>(null);
  const prevQueryRef = useRef(query);
  const prevFitKeyRef = useRef<string>("");

  // Mount effect: creates the map, markers, and labels once (per data
  // change). Search-driven visual updates are handled by a separate, lighter
  // effect below so typing doesn't tear down/recreate every marker.
  useEffect(() => {
    if (!containerRef.current) return;

    const speciesBySlug = new globalThis.Map(species.map((s) => [s.slug, s]));
    const stateBySlug = new globalThis.Map(states.map((s) => [s.slug, s]));
    stateNameBySlugRef.current = new globalThis.Map(states.map((s) => [s.slug, s.name]));

    const map = new MaplibreMap({
      container: containerRef.current,
      style: MAP_STYLE as unknown as StyleSpecification,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 3,
      maxZoom: 8,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Replace the fixed fallback center/zoom with a fit derived from the
    // container's actual size, once the map has laid out and the style has
    // loaded — this is what makes the initial zoom adapt to viewport size
    // instead of over-zooming on a narrow window or under-zooming on a
    // wide one.
    map.on("load", () => {
      map.resize();
      map.fitBounds(INDIA_BOUNDS, { padding: 40, duration: 0 });
      const attribEl = containerRef.current?.querySelector(".maplibregl-ctrl-attrib");
      if (attribEl) {
        attribEl.classList.remove("maplibregl-compact-show");
      }
    });

    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution:
          "Map boundaries: geohacker/india (MIT) — mock species/protected-area data",
      }),
    );

    // Hover highlight for states — toggles a "hover" feature-state (paired
    // with promoteId: "NAME_1" on the source above) rather than rewriting
    // the whole fill-color paint property on every mousemove.
    let hoveredStateId: string | number | null = null;
    const handleStateMouseMove = (e: { features?: Array<{ id?: string | number }> }) => {
      const nextId = e.features?.[0]?.id;
      if (nextId === undefined || nextId === hoveredStateId) return;
      if (hoveredStateId !== null) {
        map.setFeatureState({ source: "india-states", id: hoveredStateId }, { hover: false });
      }
      map.setFeatureState({ source: "india-states", id: nextId }, { hover: true });
      hoveredStateId = nextId;
      map.getCanvas().style.cursor = "pointer";
    };
    const handleStateMouseLeave = () => {
      if (hoveredStateId !== null) {
        map.setFeatureState({ source: "india-states", id: hoveredStateId }, { hover: false });
        hoveredStateId = null;
      }
      map.getCanvas().style.cursor = "";
    };

const STATE_NAME_ALIASES: Record<string, string> = {
  uttaranchal: "uttarakhand",
  orissa: "odisha",
  "andaman and nicobar": "andaman-and-nicobar-islands",
  "andaman & nicobar": "andaman-and-nicobar-islands",
  "dadra and nagar haveli": "dadra-and-nagar-haveli-and-daman-and-diu",
  "daman and diu": "dadra-and-nagar-haveli-and-daman-and-diu",
};

function findStateByNameOrSlug(states: State[], nameOrSlug: string): State | undefined {
  const norm = nameOrSlug.toLowerCase().trim();
  const aliasSlug = STATE_NAME_ALIASES[norm];
  if (aliasSlug) {
    const match = states.find((s) => s.slug === aliasSlug);
    if (match) return match;
  }
  const slugified = norm.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return states.find(
    (s) =>
      s.name.toLowerCase() === norm ||
      s.slug === slugified ||
      s.slug === norm
  );
}

    const handleStateClick = (e: { originalEvent?: MouseEvent; features?: Array<{ id?: string | number; properties?: Record<string, any> }> }) => {
      const target = e.originalEvent?.target;
      if (target instanceof Element && target.closest(".maplibregl-marker")) {
        return;
      }
      const feature = e.features?.[0];
      if (!feature) return;
      const rawName = (feature.id || feature.properties?.NAME_1 || feature.properties?.name || "") as string;
      const foundState = findStateByNameOrSlug(states, rawName);
      if (foundState) {
        router.push(`/state/${foundState.slug}`);
      }
    };

    map.on("mousemove", "states-fill", handleStateMouseMove);
    map.on("mouseleave", "states-fill", handleStateMouseLeave);
    map.on("click", "states-fill", handleStateClick);

    // Only one marker's detail card is expanded (click-pinned) at a time —
    // clicking a different marker collapses whichever was open first, and
    // clicking empty map area or pressing Escape collapses the current one.
    const collapseExpandedMarker = () => {
      expandedMarkerRef.current?.classList.remove("expanded");
      expandedMarkerRef.current = null;
    };
    const toggleExpandedMarker = (wrapper: HTMLDivElement) => {
      if (expandedMarkerRef.current === wrapper) {
        collapseExpandedMarker();
        return;
      }
      collapseExpandedMarker();
      wrapper.classList.add("expanded");
      expandedMarkerRef.current = wrapper;
    };
    // Clicks on the "View details" link handle their own navigation+collapse
    // (see buildMarkerCard) — this only toggles for clicks elsewhere on the
    // marker (photo, name, description, or the base circle/icon itself).
    const handleMarkerClick =
      (wrapper: HTMLDivElement, speciesSlug?: string, lng?: number, lat?: number) => (e: MouseEvent) => {
        e.stopPropagation();
        if (e.target instanceof Element && e.target.closest("a")) return;
        const isOpening = expandedMarkerRef.current !== wrapper;
        toggleExpandedMarker(wrapper);
        if (speciesSlug) {
          setSelectedSpeciesSlug((prev) => (prev === speciesSlug ? null : speciesSlug));
        }

        if (isOpening && lng !== undefined && lat !== undefined && mapInstanceRef.current) {
          const currentZoom = mapInstanceRef.current.getZoom();
          const targetZoom = Math.max(currentZoom, 6.5);
          mapInstanceRef.current.easeTo({
            center: [lng, lat],
            zoom: targetZoom,
            offset: [0, 140],
            duration: 500,
          });
        }
      };
    // MapLibre's generic map "click" fires for clicks anywhere in the map's
    // interaction area, including on marker DOM elements sitting on top of
    // the canvas — not just genuine empty-map clicks. Without this guard it
    // immediately re-collapses the card a marker's own click just expanded
    // (same click, two handlers). Only collapse when the click didn't
    // originate from inside any marker.
    const handleMapBackgroundClick = (e: { originalEvent?: MouseEvent }) => {
      const target = e.originalEvent?.target;
      if (target instanceof Element && target.closest(".maplibregl-marker")) return;
      collapseExpandedMarker();
      setSelectedSpeciesSlug(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        collapseExpandedMarker();
        setSelectedSpeciesSlug(null);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0")) {
        e.preventDefault();
        map.resize();
        map.fitBounds(INDIA_BOUNDS, { padding: 40, duration: 600 });
      }
    };
    map.on("click", handleMapBackgroundClick);
    document.addEventListener("keydown", handleKeyDown);

    const createdMarkers: MaplibreMarker[] = [];
    const speciesMeta: SpeciesMarkerMeta[] = [];
    const stateMeta: StateLabelMeta[] = [];

    for (const marker of markers.speciesMarkers) {
      const sp = speciesBySlug.get(marker.speciesSlug);
      const st = stateBySlug.get(marker.stateSlug);
      if (!sp || !st) continue;

      const isDominant = st.dominantSpeciesSlug === sp.slug;
      const wrapper = speciesMarkerEl(sp, {
        subtitle: isDominant ? `Dominant species — ${st.name}` : `Also found in ${st.name}`,
        fact: sp.description,
        status: sp.conservationStatus,
        href: `/species/${sp.slug}`,
        onNavigate: (href) => {
          collapseExpandedMarker();
          router.push(href);
        },
      });
      wrapper.addEventListener("click", handleMarkerClick(wrapper, sp.slug, marker.lng, marker.lat));

      const m = new MaplibreMarker({ element: wrapper }).setLngLat([marker.lng, marker.lat]).addTo(map);
      createdMarkers.push(m);

      speciesMeta.push({
        marker: m,
        speciesSlug: sp.slug,
        stateSlug: st.slug,
        lng: marker.lng,
        lat: marker.lat,
      });
    }

    for (const st of states) {
      const el = labelEl(st.name, "state");
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        router.push(`/state/${st.slug}`);
      });
      const label = new MaplibreMarker({ element: el, anchor: "center" })
        .setLngLat([st.lng, st.lat])
        .addTo(map);
      createdMarkers.push(label);

      stateMeta.push({
        label,
        stateSlug: st.slug,
        stateName: st.name,
        lng: st.lng,
        lat: st.lat,
      });
    }

    speciesMarkerMetaRef.current = speciesMeta;
    stateLabelMetaRef.current = stateMeta;

    const handleMoveEnd = () => setViewTick((t) => t + 1);
    map.on("moveend", handleMoveEnd);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.off("mousemove", "states-fill", handleStateMouseMove);
      map.off("mouseleave", "states-fill", handleStateMouseLeave);
      map.off("click", handleMapBackgroundClick);
      map.off("moveend", handleMoveEnd);
      document.removeEventListener("keydown", handleKeyDown);
      expandedMarkerRef.current = null;
      paZooMarkersRef.current.forEach((m) => m.remove());
      paZooMarkersRef.current = [];
      lastClusterSignatureRef.current = "";
      createdMarkers.forEach((m) => m.remove());
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [states, species, markers, router]);

  // Search & Map Layer Settings & Density Grid filter effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (prevQueryRef.current !== query) {
      expandedMarkerRef.current?.classList.remove("expanded");
      expandedMarkerRef.current = null;
      prevQueryRef.current = query;
    }

    const q = query.trim().toLowerCase();
    const speciesBySlug = new globalThis.Map(species.map((s) => [s.slug, s]));

    const resetFill = () => {
      if (map.getLayer("states-fill")) {
        map.setPaintProperty("states-fill", "fill-color", buildFillColorExpression([]) as string);
      }
    };
    const hotspotSource = map.getSource("species-hotspot") as GeoJSONSource | undefined;
    const densitySource = map.getSource("species-density-grid") as GeoJSONSource | undefined;
    const speciesSlugFromPath = pathname?.startsWith("/species/")
      ? pathname.split("/species/")[1]?.split("/")[0]
      : null;
    const activeSpeciesSlug = selectedSpeciesSlug || speciesSlugFromPath;

    // Helper functions to check layer toggle settings
    const isSpeciesLayerVisible = (speciesSlug: string) => {
      const sp = speciesBySlug.get(speciesSlug);
      if (!sp) return true;
      if (sp.taxon === "mammal" && !settings.mammals) return false;
      if (sp.taxon === "bird" && !settings.birds) return false;
      return true;
    };

    const isPaLayerVisible = (paType: ProtectedArea["type"]) => {
      if (paType === "national-park" && !settings.nationalParks) return false;
      if (paType === "bird-sanctuary" && !settings.birdSanctuaries) return false;
      if ((paType === "wildlife-sanctuary" || (paType as string).includes("sanctuary")) && paType !== "bird-sanctuary" && !settings.wildlifeSanctuaries) return false;
      return true;
    };

    const isZooLayerVisible = () => settings.zoos;

    // Determine target species for density grid overlay
    const targetDensitySpecies = new Set<string>();

    if (activeSpeciesSlug) {
      targetDensitySpecies.add(activeSpeciesSlug);
    }

    if (q) {
      const directSpeciesMatches = species
        .filter(
          (s) => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q),
        )
        .map((s) => s.slug);
      directSpeciesMatches.forEach((slug) => targetDensitySpecies.add(slug));
    }

    // Render density grid features for target species
    densitySource?.setData(buildDensityGridFeatures(targetDensitySpecies, speciesDensity));

    // Search-match sets, hoisted above the branch below so the protected-
    // area/zoo clustering pass at the end of this effect can reuse them too
    // — empty sets (rather than skipping this block) when there's no query,
    // since the clustering visibility check below only consults them when
    // `q` is truthy anyway.
    const matchedSpeciesSlugs = new Set(
      q
        ? species
          .filter((s) => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q))
          .map((s) => s.slug)
        : [],
    );
    const directMatchedStateSlugs = new Set(
      q ? states.filter((s) => s.name.toLowerCase().includes(q)).map((s) => s.slug) : [],
    );
    const matchedStateSlugs = new Set(directMatchedStateSlugs);
    const matchedProtectedAreaSlugs = new Set(
      q ? protectedAreas.filter((p) => p.name.toLowerCase().includes(q)).map((p) => p.slug) : [],
    );
    const matchedZooSlugs = new Set(
      q ? zoos.filter((z) => z.name.toLowerCase().includes(q) || z.city.toLowerCase().includes(q)).map((z) => z.slug) : [],
    );

    if (q) {
      for (const sp of species) {
        if (matchedSpeciesSlugs.has(sp.slug)) sp.stateSlugs.forEach((slug) => matchedStateSlugs.add(slug));
      }
      for (const pa of protectedAreas) {
        if (matchedProtectedAreaSlugs.has(pa.slug)) matchedStateSlugs.add(pa.stateSlug);
      }
      for (const z of zoos) {
        if (matchedZooSlugs.has(z.slug)) matchedStateSlugs.add(z.stateSlug);
      }
      for (const pa of protectedAreas) {
        if (matchedStateSlugs.has(pa.stateSlug)) matchedProtectedAreaSlugs.add(pa.slug);
      }
    }

    const fitKey = `${speciesSlugFromPath || ""}:${q}`;
    const shouldFitBounds = fitKey !== prevFitKeyRef.current;
    if (shouldFitBounds) {
      prevFitKeyRef.current = fitKey;
    }

    if (!q) {
      const activeSpecies = activeSpeciesSlug ? speciesBySlug.get(activeSpeciesSlug) : null;
      const activeSpeciesStateSlugs = activeSpecies ? new Set(activeSpecies.stateSlugs) : null;

      speciesMarkerMetaRef.current.forEach(({ marker, speciesSlug }) => {
        const layerVisible = isSpeciesLayerVisible(speciesSlug);
        const speciesMatched = !activeSpeciesSlug || speciesSlug === activeSpeciesSlug;
        const visible = layerVisible && speciesMatched;
        marker.getElement().style.display = visible ? "" : "none";
      });

      stateLabelMetaRef.current.forEach(({ label }) => {
        label.getElement().style.display = "";
      });

      if (activeSpeciesSlug && activeSpeciesStateSlugs) {
        const matchedStateGeoNames = getGeoNamesForStateSlugs(activeSpeciesStateSlugs, stateNameBySlugRef.current);

        if (map.getLayer("states-fill")) {
          map.setPaintProperty(
            "states-fill",
            "fill-color",
            buildFillColorExpression(matchedStateGeoNames) as string,
          );
        }

        if (shouldFitBounds) {
          const bounds = new LngLatBounds();
          if (speciesDensity && speciesDensity[activeSpeciesSlug]) {
            for (const cell of speciesDensity[activeSpeciesSlug]) {
              bounds.extend([cell.minLng, cell.minLat]);
              bounds.extend([cell.maxLng, cell.maxLat]);
            }
          }
          speciesMarkerMetaRef.current.forEach(({ speciesSlug, lng, lat }) => {
            if (speciesSlug === activeSpeciesSlug) bounds.extend([lng, lat]);
          });
          for (const pa of protectedAreas) {
            if (pa.headlineSpeciesSlug === activeSpeciesSlug) bounds.extend([pa.lng, pa.lat]);
          }
          for (const z of zoos) {
            if (z.headlineSpeciesSlug === activeSpeciesSlug) bounds.extend([z.lng, z.lat]);
          }

          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: { top: 130, bottom: 80, left: 60, right: 60 }, maxZoom: 7, duration: 500 });
          }
        }
      } else {
        resetFill();
        hotspotSource?.setData(EMPTY_FEATURE_COLLECTION as GeoJSON.FeatureCollection);
      }
    } else {
      const bounds = new LngLatBounds();
      let hasMatch = false;

      speciesMarkerMetaRef.current.forEach(({ marker, speciesSlug, stateSlug, lng, lat }) => {
        const searchMatched = matchedSpeciesSlugs.has(speciesSlug) || directMatchedStateSlugs.has(stateSlug);
        const layerVisible = isSpeciesLayerVisible(speciesSlug);
        const speciesMatched = !activeSpeciesSlug || speciesSlug === activeSpeciesSlug;
        const visible = searchMatched && layerVisible && speciesMatched;

        marker.getElement().style.display = visible ? "" : "none";
        if (visible) {
          bounds.extend([lng, lat]);
          hasMatch = true;
        }
      });

      stateLabelMetaRef.current.forEach(({ label, stateSlug }) => {
        const visible = matchedStateSlugs.has(stateSlug);
        label.getElement().style.display = visible ? "" : "none";
      });

      for (const pa of protectedAreas) {
        const visible =
          matchedProtectedAreaSlugs.has(pa.slug) &&
          isPaLayerVisible(pa.type) &&
          (!activeSpeciesSlug || pa.headlineSpeciesSlug === activeSpeciesSlug);
        if (visible) {
          bounds.extend([pa.lng, pa.lat]);
          hasMatch = true;
        }
      }
      for (const z of zoos) {
        const visible =
          matchedZooSlugs.has(z.slug) &&
          isZooLayerVisible() &&
          (!activeSpeciesSlug || z.headlineSpeciesSlug === activeSpeciesSlug);
        if (visible) {
          bounds.extend([z.lng, z.lat]);
          hasMatch = true;
        }
      }

      const matchedStateGeoNames = getGeoNamesForStateSlugs(matchedStateSlugs, stateNameBySlugRef.current);

      if (map.getLayer("states-fill")) {
        map.setPaintProperty(
          "states-fill",
          "fill-color",
          buildFillColorExpression(matchedStateGeoNames) as string,
        );
      }

      hotspotSource?.setData(
        buildHotspotFeatures(matchedSpeciesSlugs, speciesMarkerMetaRef.current, protectedAreas) as GeoJSON.FeatureCollection,
      );

      if (shouldFitBounds && hasMatch) {
        map.fitBounds(bounds, { padding: { top: 130, bottom: 80, left: 60, right: 60 }, maxZoom: 7, duration: 500 });
      }
    }

    // ---- Protected-area / zoo clustering ----
    const collapseExpandedMarker = () => {
      expandedMarkerRef.current?.classList.remove("expanded");
      expandedMarkerRef.current = null;
    };
    const toggleExpandedMarker = (wrapper: HTMLDivElement) => {
      if (expandedMarkerRef.current === wrapper) {
        collapseExpandedMarker();
        return;
      }
      collapseExpandedMarker();
      wrapper.classList.add("expanded");
      expandedMarkerRef.current = wrapper;
    };
    const handleMarkerClick = (wrapper: HTMLDivElement, lng?: number, lat?: number) => (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("a")) return;
      const isOpening = expandedMarkerRef.current !== wrapper;
      toggleExpandedMarker(wrapper);

      if (isOpening && lng !== undefined && lat !== undefined && mapInstanceRef.current) {
        const currentZoom = mapInstanceRef.current.getZoom();
        const targetZoom = Math.max(currentZoom, 6.5);
        mapInstanceRef.current.easeTo({
          center: [lng, lat],
          zoom: targetZoom,
          offset: [0, 140],
          duration: 500,
        });
      }
    };

    const points: Array<Supercluster.PointFeature<ClusterPointProps>> = [];

    for (const pa of protectedAreas) {
      const visible =
        isPaLayerVisible(pa.type) &&
        (!activeSpeciesSlug || pa.headlineSpeciesSlug === activeSpeciesSlug) &&
        (!q || matchedProtectedAreaSlugs.has(pa.slug));
      if (visible) {
        points.push({
          type: "Feature",
          properties: { kind: "protected-area", slug: pa.slug },
          geometry: { type: "Point", coordinates: [pa.lng, pa.lat] },
        });
      }
    }
    for (const z of zoos) {
      const visible =
        isZooLayerVisible() &&
        (!activeSpeciesSlug || z.headlineSpeciesSlug === activeSpeciesSlug) &&
        (!q || matchedZooSlugs.has(z.slug));
      if (visible) {
        points.push({
          type: "Feature",
          properties: { kind: "zoo", slug: z.slug },
          geometry: { type: "Point", coordinates: [z.lng, z.lat] },
        });
      }
    }

    const clusterIndex = new Supercluster<ClusterPointProps>({
      radius: CLUSTER_RADIUS_PX,
      maxZoom: CLUSTER_MAX_ZOOM,
    }).load(points);
    const viewBounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      viewBounds.getWest(),
      viewBounds.getSouth(),
      viewBounds.getEast(),
      viewBounds.getNorth(),
    ];
    const clusterFeatures = clusterIndex.getClusters(bbox, Math.round(map.getZoom()));

    // Cheap fingerprint of what should be on screen — skip the actual
    // teardown/rebuild below entirely when it hasn't changed from last time
    // (e.g. a pan that doesn't cross a cluster boundary). Rebuilding
    // unconditionally on every "moveend" is what produced a visible flicker
    // on every pan/zoom in an earlier version of this.
    const signature = clusterFeatures
      .map((f) => {
        const p = f.properties as (Supercluster.ClusterProperties & Record<string, unknown>) | ClusterPointProps;
        return "cluster" in p && p.cluster ? `c:${p.cluster_id}` : `p:${(p as ClusterPointProps).kind}:${(p as ClusterPointProps).slug}`;
      })
      .sort()
      .join("|");

    if (signature !== lastClusterSignatureRef.current) {
      lastClusterSignatureRef.current = signature;

      paZooMarkersRef.current.forEach((m) => m.remove());
      paZooMarkersRef.current = [];

      for (const feature of clusterFeatures) {
        const [lng, lat] = feature.geometry.coordinates as [number, number];
        const properties = feature.properties as (Supercluster.ClusterProperties & Record<string, unknown>) | ClusterPointProps;

        if ("cluster" in properties && properties.cluster) {
          const clusterId = properties.cluster_id as number;
          const count = properties.point_count as number;
          const el = clusterMarkerEl(count, () => {
            const rawExpansionZoom = clusterIndex.getClusterExpansionZoom(clusterId);
            const currentZoom = map.getZoom();
            // Guard against a stalled click: if the raw expansion zoom
            // (clamped to the map's own hard cap) wouldn't actually move
            // past where we already are, force a couple of zoom levels of
            // real progress instead of a no-op re-center.
            const targetZoom =
              Math.min(rawExpansionZoom, 8) > currentZoom + 0.1
                ? Math.min(rawExpansionZoom, 8)
                : Math.min(currentZoom + 2, 8);
            map.easeTo({ center: [lng, lat], zoom: targetZoom, duration: 500 });
          });
          const m = new MaplibreMarker({ element: el }).setLngLat([lng, lat]).addTo(map);
          paZooMarkersRef.current.push(m);
          continue;
        }

        const { kind, slug } = properties as ClusterPointProps;

        if (kind === "protected-area") {
          const pa = protectedAreas.find((p) => p.slug === slug);
          if (!pa) continue;
          const headline = speciesBySlug.get(pa.headlineSpeciesSlug);

          const wrapper = protectedAreaMarkerEl(pa, headline, {
            subtitle: pa.type.replace(/-/g, " "),
            fact: headline ? `Headline species: ${headline.commonName}` : "",
            href: `/protected-area/${pa.slug}`,
            onNavigate: (href) => {
              collapseExpandedMarker();
              router.push(href);
            },
          });
          wrapper.addEventListener("click", handleMarkerClick(wrapper, pa.lng, pa.lat));

          const m = new MaplibreMarker({ element: wrapper }).setLngLat([pa.lng, pa.lat]).addTo(map);
          paZooMarkersRef.current.push(m);

          const label = new MaplibreMarker({ element: labelEl(pa.name, "protected-area"), anchor: "top", offset: [0, 14] })
            .setLngLat([pa.lng, pa.lat])
            .addTo(map);
          paZooMarkersRef.current.push(label);
        } else {
          const zoo = zoos.find((z) => z.slug === slug);
          if (!zoo) continue;
          const headline = zoo.headlineSpeciesSlug ? speciesBySlug.get(zoo.headlineSpeciesSlug) : undefined;

          const wrapper = zooMarkerEl(zoo, headline, {
            subtitle: `Zoo — ${zoo.city}`,
            fact: headline ? `Headline species: ${headline.commonName}` : `Est. ${zoo.establishedYear ?? "N/A"}`,
            href: `/zoo/${zoo.slug}`,
            onNavigate: (href) => {
              collapseExpandedMarker();
              router.push(href);
            },
          });
          wrapper.addEventListener("click", handleMarkerClick(wrapper, zoo.lng, zoo.lat));

          const m = new MaplibreMarker({ element: wrapper }).setLngLat([zoo.lng, zoo.lat]).addTo(map);
          paZooMarkersRef.current.push(m);

          const label = new MaplibreMarker({ element: labelEl(zoo.name, "protected-area"), anchor: "top", offset: [0, 14] })
            .setLngLat([zoo.lng, zoo.lat])
            .addTo(map);
          paZooMarkersRef.current.push(label);
        }
      }
    }
  }, [query, settings, selectedSpeciesSlug, pathname, speciesDensity, states, species, protectedAreas, zoos, markers, router, viewTick]);

  return <div ref={containerRef} className="h-full w-full" />;
}
