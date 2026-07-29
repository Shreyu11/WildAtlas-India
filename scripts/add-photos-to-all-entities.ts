import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { NationalPark, ProtectedArea, Sanctuary, Species, Zoo } from "../src/lib/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

// High quality free-to-use landscape/nature/habitat imagery collections for national parks & sanctuaries
const PARK_PHOTOS = [
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511497584788-876761c119ef?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop&q=80",
];

// Read species
const speciesList: Species[] = JSON.parse(readFileSync(path.join(DATA_DIR, "species.json"), "utf-8"));
const speciesMap = new Map(speciesList.map((s) => [s.slug, s]));

// Verify species photos
let missingSpeciesPhotos = 0;
for (const s of speciesList) {
  if (!s.photoUrl) {
    missingSpeciesPhotos++;
    console.error(`Species missing photoUrl: ${s.commonName} (${s.slug})`);
  }
}
console.log(`Verified ${speciesList.length} species: ${missingSpeciesPhotos} missing photos.`);

// Update National Parks
const nationalParks: ProtectedArea[] = JSON.parse(readFileSync(path.join(DATA_DIR, "national-parks.json"), "utf-8"));
let npPhotosAdded = 0;
for (let i = 0; i < nationalParks.length; i++) {
  const np = nationalParks[i];
  if (!np.photoUrl) {
    // Check if headline species has a photo first
    const headline = np.headlineSpeciesSlug ? speciesMap.get(np.headlineSpeciesSlug) : undefined;
    if (headline && headline.photoUrl) {
      np.photoUrl = headline.photoUrl;
    } else {
      np.photoUrl = PARK_PHOTOS[i % PARK_PHOTOS.length];
    }
    npPhotosAdded++;
  }
}
writeFileSync(path.join(DATA_DIR, "national-parks.json"), JSON.stringify(nationalParks, null, 2));
console.log(`Updated ${nationalParks.length} national parks (added ${npPhotosAdded} photos).`);

// Update Sanctuaries
const sanctuaries: ProtectedArea[] = JSON.parse(readFileSync(path.join(DATA_DIR, "sanctuaries.json"), "utf-8"));
let sancPhotosAdded = 0;
for (let i = 0; i < sanctuaries.length; i++) {
  const sanc = sanctuaries[i];
  if (!sanc.photoUrl) {
    const headline = sanc.headlineSpeciesSlug ? speciesMap.get(sanc.headlineSpeciesSlug) : undefined;
    if (headline && headline.photoUrl) {
      sanc.photoUrl = headline.photoUrl;
    } else {
      sanc.photoUrl = PARK_PHOTOS[i % PARK_PHOTOS.length];
    }
    sancPhotosAdded++;
  }
}
writeFileSync(path.join(DATA_DIR, "sanctuaries.json"), JSON.stringify(sanctuaries, null, 2));
console.log(`Updated ${sanctuaries.length} sanctuaries (added ${sancPhotosAdded} photos).`);

// Update Zoos
const zoos: Zoo[] = JSON.parse(readFileSync(path.join(DATA_DIR, "zoos.json"), "utf-8"));
let zooPhotosAdded = 0;
for (let i = 0; i < zoos.length; i++) {
  const zoo = zoos[i];
  if (!zoo.photoUrl) {
    const headline = zoo.headlineSpeciesSlug ? speciesMap.get(zoo.headlineSpeciesSlug) : undefined;
    if (headline && headline.photoUrl) {
      zoo.photoUrl = headline.photoUrl;
    } else {
      zoo.photoUrl = PARK_PHOTOS[i % PARK_PHOTOS.length];
    }
    zooPhotosAdded++;
  }
}
writeFileSync(path.join(DATA_DIR, "zoos.json"), JSON.stringify(zoos, null, 2));
console.log(`Updated ${zoos.length} zoos (added ${zooPhotosAdded} photos).`);

// Update protected-areas.json
const allProtectedAreas = [...nationalParks, ...sanctuaries];
writeFileSync(path.join(DATA_DIR, "protected-areas.json"), JSON.stringify(allProtectedAreas, null, 2));
console.log(`Updated protected-areas.json with ${allProtectedAreas.length} total entries.`);
