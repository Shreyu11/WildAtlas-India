// Shared data model, matching the pipeline's output JSON (public/data/*.json)
// and the PRD's data model (Section 4, 6). Phase 1 scope only: mammals + birds.

export type Taxon = "mammal" | "bird";

export type ConservationStatus =
  | "LC" // Least Concern
  | "NT" // Near Threatened
  | "VU" // Vulnerable
  | "EN" // Endangered
  | "CR" // Critically Endangered
  | "EW" // Extinct in the Wild
  | "EX"; // Extinct

export interface PhotoAttribution {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

export interface DataSourceRef {
  label: string;
  url: string;
  accessedDate: string;
}

export interface TaxonClassification {
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

export interface PopulationTrendPoint {
  year: number;
  estimate: number | null;
  source: string;
}

export interface SeasonalInfo {
  bestViewingMonths?: string[];
  breedingSeason?: string;
  migration?: string;
}

export interface VisitingHours {
  openMonths?: string;
  timings?: string;
  closedSeason?: string;
  // Whether the site is open to the general public: "open" (standard entry/
  // safari permit only), "permit-required" (a specific access permit beyond
  // standard entry, e.g. Inner Line Permit, seasonal wildlife permit), or
  // "restricted" (not routinely open to the general public even with effort).
  publicAccess?: "open" | "permit-required" | "restricted" | null;
  accessNotes?: string | null;
}

export interface Species {
  slug: string;
  commonName: string;
  scientificName: string;
  taxon: Taxon;
  conservationStatus: ConservationStatus;
  description: string;
  habitat: string;
  stateSlugs: string[];
  photoUrl: string | null; // null falls back to an illustrated icon (PRD 4.4)
  photoAttribution: PhotoAttribution | null; // required whenever photoUrl is set
  audioUrl?: string | null;
  audioAttribution?: PhotoAttribution | null;
  sourceCitations: string[];
  // Additive fields per DATASET_PLAN.md §2.1
  taxonClassification?: TaxonClassification | null;
  photos?: PhotoAttribution[];
  habitats?: string[] | null;
  populationTrend?: PopulationTrendPoint[] | null;
  keyFeaturesRole?: string | null;
  seasonalInfo?: SeasonalInfo | null;
  worldAnimalDaySlug?: string | null;
  conservationEfforts?: string[] | null;
  relatedSuggestions?: string[];
  needsResearch?: boolean;
}

export interface State {
  slug: string;
  name: string;
  dominantSpeciesSlug: string;
  stateAnimalSlug?: string | null;
  stateBirdSlug?: string | null;
  speciesSlugs: string[];
  lat: number;
  lng: number;
  photoUrl?: string | null;
  overview?: string | null;
}

export interface ProtectedArea {
  slug: string;
  name: string;
  type: "national-park" | "wildlife-sanctuary" | "bird-sanctuary";
  stateSlug: string;
  headlineSpeciesSlug: string;
  photoUrl?: string | null;
  lat: number;
  lng: number;
  // Additive fields per DATASET_PLAN.md §2.2
  areaSqKm?: number | null;
  visitingHours?: VisitingHours | null;
  websiteUrl?: string | null;
  latestUpdates?: Array<{ date: string; note: string; sourceUrl: string }>;
  uniqueFeatures?: string | null;
  additionalKeySpeciesSlugs?: string[];
  relatedSuggestions?: string[];
  sources?: DataSourceRef[];
  needsResearch?: boolean;
}

export type NationalPark = ProtectedArea & { type: "national-park" };
export type Sanctuary = ProtectedArea & { type: "wildlife-sanctuary" | "bird-sanctuary" };

// State-wise zoo directory. A distinct entity from ProtectedArea (a zoo is
// an ex-situ, captive-animal facility, not a wild habitat), but modeled the
// same way pending a real CZA (Central Zoo Authority) data source. Mock/
// hand-curated for now — wikipediaUrl is the citation per entry, matching
// the FunFact pattern below, since there's no pipeline source yet.
export interface Zoo {
  slug: string;
  name: string;
  stateSlug: string;
  city: string;
  establishedYear: number | null;
  headlineSpeciesSlug: string | null; // notable resident species, if in the mock dataset
  photoUrl?: string | null;
  lat: number;
  lng: number;
  wikipediaUrl: string;
  // Additive fields per DATASET_PLAN.md §2.2
  areaSqKm?: number | null;
  visitingHours?: VisitingHours | null;
  websiteUrl?: string | null;
  latestUpdates?: Array<{ date: string; note: string; sourceUrl: string }>;
  uniqueFeatures?: string | null;
  additionalKeySpeciesSlugs?: string[];
  relatedSuggestions?: string[];
  sources?: DataSourceRef[];
  needsResearch?: boolean;
}

// Internationally observed single-species awareness days with a fixed
// annual calendar date (date-varying observances like World Migratory Bird
// Day, whose date shifts year to year, are deliberately excluded — the
// fixed "MM-DD" format can't represent them). Intended for a future
// "Today is World Tiger Day"-style callout; database-only for now, not
// wired into any UI.
export interface WorldAnimalDay {
  slug: string;
  name: string;
  date: string; // "MM-DD", fixed annual date
  animal: string;
  taxon: Taxon;
  description: string;
  speciesSlug: string | null; // links to a Species record when one exists in the mock dataset
  wikipediaUrl: string;
}

// Curated trivia (PRD "transparent, cited data" — each entry carries its
// own Wikipedia citation). speciesSlug links to a Species record when one
// exists in the current mock dataset; several animals here (cheetah,
// flamingo, house crow, sloth bear, sarus crane) aren't in species.json yet,
// so it's null for those and the card falls back to the Wikipedia source.
export interface FunFact {
  animal: string;
  taxon: Taxon;
  fact: string;
  wikipediaUrl: string;
  speciesSlug: string | null;
}

export type MarkerZoomTier = "country" | "region" | "protected-area";

export interface MarkerTier {
  tier: MarkerZoomTier;
  speciesMarkers: Array<{
    speciesSlug: string;
    stateSlug: string;
    lat: number;
    lng: number;
  }>;
  protectedAreaMarkers: Array<{
    protectedAreaSlug: string;
    lat: number;
    lng: number;
  }>;
}

export interface SpeciesDensityCell {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  level: 1 | 2 | 3;
}

export type SpeciesDensityMap = Record<string, SpeciesDensityCell[]>;

