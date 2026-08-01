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

const STATE_OVERVIEWS: Record<string, { photoUrl: string; overview: string }> = {
  kerala: {
    photoUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    overview: "Nestled along the Western Ghats biodiversity hotspot, Kerala features tropical wet evergreen forests, shola-grassland complexes, and coastal backwaters. Home to Asian elephants, Nilgiri tahrs, and lion-tailed macaques across 5 National Parks and 17 Wildlife Sanctuaries.",
  },
  gujarat: {
    photoUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    overview: "Gujarat encompasses diverse ecosystems from dry deciduous teak forests to the vast saline mudflats of the Rann of Kutch. It is famously the last wild sanctuary on Earth for the Asiatic lion and the Indian wild ass.",
  },
  "arunachal-pradesh": {
    photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    overview: "Positioned at the eastern Himalayan biodiversity hotspot, Arunachal Pradesh spans alpine slopes, dense subtropical forests, and deep river valleys. It harbors rare endemics such as the Red Panda, Snow Leopard, Hoolock Gibbon, and Great Hornbill.",
  },
  assam: {
    photoUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    overview: "Dominated by the fertile Brahmaputra river basin, Assam's alluvial floodplains and tropical forests shelter over two-thirds of the world's Great Indian One-Horned Rhinoceroses alongside Bengal tigers and wild water buffaloes.",
  },
  "madhya-pradesh": {
    photoUrl: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    overview: "Known as the 'Tiger State of India', Madhya Pradesh's central plateaus and dense sal forests host India's highest tiger population across iconic reserves like Kanha, Bandhavgarh, and Pench.",
  },
  rajasthan: {
    photoUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    overview: "From the arid Thar Desert to the ancient Aravalli hill range, Rajasthan features dry scrublands and seasonal wetlands. It hosts iconic species including the Great Indian Bustard, Blackbuck, and dry-forest Bengal Tigers in Ranthambore.",
  },
  "west-bengal": {
    photoUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    overview: "Spanning from eastern Himalayan peaks down to the world's largest mangrove delta in the Sundarbans, West Bengal features unique mangrove ecosystems home to the famous swimming Sundarbans tigers and river dolphins.",
  },
  uttarakhand: {
    photoUrl: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=1200&q=80",
    overview: "Situated in the Western Himalayas, Uttarakhand features temperate pine forests, subalpine meadows, and riverine valleys. Home to Jim Corbett National Park, India's oldest national park protecting tigers, elephants, and Himalayan monals.",
  },
  karnataka: {
    photoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    overview: "Spanning the Western Ghats and Deccan Plateau, Karnataka boasts tropical rainforests and moist deciduous reserves. It holds one of India's largest concentrations of wild Asian elephants and tigers in Bandipur and Nagarhole.",
  },
  "himachal-pradesh": {
    photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    overview: "Characterized by high-altitude alpine terrain, deodar pine forests, and glacial river valleys, Himachal Pradesh is a refuge for high-altitude wildlife including the Snow Leopard, Himalayan Monal, and Musk Deer.",
  },
};

const STATE_SYMBOLS: Record<string, { animalSlug: string; birdSlug: string }> = {
  kerala: { animalSlug: "asian-elephant", birdSlug: "great-hornbill" },
  gujarat: { animalSlug: "asiatic-lion", birdSlug: "greater-flamingo" },
  "arunachal-pradesh": { animalSlug: "gaur", birdSlug: "great-hornbill" },
  assam: { animalSlug: "indian-rhinoceros", birdSlug: "great-hornbill" },
  "madhya-pradesh": { animalSlug: "barasingha", birdSlug: "sarus-crane" },
  rajasthan: { animalSlug: "chinkara", birdSlug: "great-indian-bustard" },
  "west-bengal": { animalSlug: "royal-bengal-tiger", birdSlug: "indian-peafowl" },
  uttarakhand: { animalSlug: "snow-leopard", birdSlug: "himalayan-monal" },
  karnataka: { animalSlug: "asian-elephant", birdSlug: "indian-roller" },
  "himachal-pradesh": { animalSlug: "snow-leopard", birdSlug: "himalayan-monal" },
  "andhra-pradesh": { animalSlug: "blackbuck", birdSlug: "indian-roller" },
  bihar: { animalSlug: "gaur", birdSlug: "house-sparrow" },
  chhattisgarh: { animalSlug: "wild-water-buffalo", birdSlug: "sarus-crane" },
  delhi: { animalSlug: "nilgai", birdSlug: "house-sparrow" },
  goa: { animalSlug: "gaur", birdSlug: "great-hornbill" },
  haryana: { animalSlug: "blackbuck", birdSlug: "indian-peafowl" },
  "jammu-and-kashmir": { animalSlug: "hangul", birdSlug: "black-necked-crane" },
  jharkhand: { animalSlug: "asian-elephant", birdSlug: "sarus-crane" },
  ladakh: { animalSlug: "snow-leopard", birdSlug: "black-necked-crane" },
  maharashtra: { animalSlug: "indian-giant-squirrel", birdSlug: "indian-peafowl" },
  manipur: { animalSlug: "sangai", birdSlug: "indian-peafowl" },
  meghalaya: { animalSlug: "clouded-leopard", birdSlug: "great-hornbill" },
  mizoram: { animalSlug: "hoolock-gibbon", birdSlug: "great-hornbill" },
  nagaland: { animalSlug: "gaur", birdSlug: "great-hornbill" },
  odisha: { animalSlug: "sambar-deer", birdSlug: "indian-roller" },
  punjab: { animalSlug: "blackbuck", birdSlug: "indian-peafowl" },
  sikkim: { animalSlug: "red-panda", birdSlug: "himalayan-monal" },
  "tamil-nadu": { animalSlug: "nilgiri-tahr", birdSlug: "indian-peafowl" },
  telangana: { animalSlug: "chital", birdSlug: "indian-roller" },
  tripura: { animalSlug: "clouded-leopard", birdSlug: "great-hornbill" },
  "uttar-pradesh": { animalSlug: "barasingha", birdSlug: "sarus-crane" },
  "andaman-and-nicobar-islands": { animalSlug: "nicobar-long-tailed-macaque", birdSlug: "narcondam-hornbill" },
  chandigarh: { animalSlug: "blackbuck", birdSlug: "indian-peafowl" },
  "dadra-and-nagar-haveli-and-daman-and-diu": { animalSlug: "gaur", birdSlug: "greater-flamingo" },
  puducherry: { animalSlug: "indian-giant-squirrel", birdSlug: "indian-peafowl" },
};

export async function getStates(): Promise<State[]> {
  const states = await readJson<State[]>("states.json");
  return states.map((state) => {
    const custom = STATE_OVERVIEWS[state.slug];
    const symbols = STATE_SYMBOLS[state.slug];
    const photoUrl = state.photoUrl || custom?.photoUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
    const overview = state.overview || custom?.overview || `${state.name} features diverse natural ecosystems supporting native Indian wildlife, national parks, and protected natural habitats.`;
    return {
      ...state,
      stateAnimalSlug: state.stateAnimalSlug || symbols?.animalSlug || state.dominantSpeciesSlug,
      stateBirdSlug: state.stateBirdSlug || symbols?.birdSlug || "indian-peafowl",
      photoUrl,
      overview,
    };
  });
}

export function getSpecies(): Promise<Species[]> {
  return readJson<Species[]>("species.json");
}

export function getNationalParks(): Promise<ProtectedArea[]> {
  return readJson<ProtectedArea[]>("national-parks.json");
}

export function getSanctuaries(): Promise<ProtectedArea[]> {
  return readJson<ProtectedArea[]>("sanctuaries.json");
}

export async function getProtectedAreas(): Promise<ProtectedArea[]> {
  const [nps, sanctuaries] = await Promise.all([getNationalParks(), getSanctuaries()]);
  return [...nps, ...sanctuaries];
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

