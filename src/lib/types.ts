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
  sourceCitations: string[];
}

export interface State {
  slug: string;
  name: string;
  dominantSpeciesSlug: string;
  speciesSlugs: string[];
  lat: number;
  lng: number;
}

export interface ProtectedArea {
  slug: string;
  name: string;
  type: "national-park" | "wildlife-sanctuary" | "bird-sanctuary";
  stateSlug: string;
  headlineSpeciesSlug: string;
  lat: number;
  lng: number;
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
