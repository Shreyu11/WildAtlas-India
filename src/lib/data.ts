import { readFile } from "fs/promises";
import path from "path";
import type { FunFact, MarkerTier, ProtectedArea, Species, SpeciesDensityMap, State, WorldAnimalDay, Zoo } from "./types";

// Reads mock JSON from public/data/. Swapping in real pipeline output later
// is a one-file change: point these at the same paths once the Python
// pipeline (see ../../pipeline/) writes real data there.

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readJson<T>(relativePath: string): Promise<T> {
  const contents = await readFile(path.join(DATA_DIR, relativePath), "utf-8");
  return JSON.parse(contents) as T;
}

export function getStates(): Promise<State[]> {
  return readJson<State[]>("states.json");
}

export function getSpecies(): Promise<Species[]> {
  return readJson<Species[]>("species.json");
}

export function getProtectedAreas(): Promise<ProtectedArea[]> {
  return readJson<ProtectedArea[]>("protected-areas.json");
}

export function getCountryMarkers(): Promise<MarkerTier> {
  return readJson<MarkerTier>("markers/country.json");
}

export function getFunFacts(): Promise<FunFact[]> {
  return readJson<FunFact[]>("fun-facts.json");
}

export function getZoos(): Promise<Zoo[]> {
  return readJson<Zoo[]>("zoos.json");
}

export function getWorldAnimalDays(): Promise<WorldAnimalDay[]> {
  return readJson<WorldAnimalDay[]>("world-animal-days.json");
}

export function getSpeciesDensity(): Promise<SpeciesDensityMap> {
  return readJson<SpeciesDensityMap>("species-density.json");
}

