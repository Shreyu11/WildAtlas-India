import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { State } from "../src/lib/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

const GEO_NAME_MAPPING: Record<string, string> = {
  "Andaman and Nicobar": "andaman-and-nicobar-islands",
  "Andhra Pradesh": "andhra-pradesh",
  "Arunachal Pradesh": "arunachal-pradesh",
  "Assam": "assam",
  "Bihar": "bihar",
  "Chandigarh": "chandigarh",
  "Chhattisgarh": "chhattisgarh",
  "Dadra and Nagar Haveli": "dadra-and-nagar-haveli-and-daman-and-diu",
  "Daman and Diu": "dadra-and-nagar-haveli-and-daman-and-diu",
  "Delhi": "delhi",
  "Goa": "goa",
  "Gujarat": "gujarat",
  "Haryana": "haryana",
  "Himachal Pradesh": "himachal-pradesh",
  "Jammu and Kashmir": "jammu-and-kashmir",
  "Jharkhand": "jharkhand",
  "Karnataka": "karnataka",
  "Kerala": "kerala",
  "Lakshadweep": "lakshadweep",
  "Madhya Pradesh": "madhya-pradesh",
  "Maharashtra": "maharashtra",
  "Manipur": "manipur",
  "Meghalaya": "meghalaya",
  "Mizoram": "mizoram",
  "Nagaland": "nagaland",
  "Orissa": "odisha",
  "Puducherry": "puducherry",
  "Punjab": "punjab",
  "Rajasthan": "rajasthan",
  "Sikkim": "sikkim",
  "Tamil Nadu": "tamil-nadu",
  "Tripura": "tripura",
  "Uttar Pradesh": "uttar-pradesh",
  "Uttaranchal": "uttarakhand",
  "West Bengal": "west-bengal"
};

function geometryBoundsCenter(geometry: { coordinates: unknown }): [number, number] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
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

const geojson = JSON.parse(readFileSync(path.join(DATA_DIR, "geo", "india-states.geojson"), "utf-8"));
const states: State[] = JSON.parse(readFileSync(path.join(DATA_DIR, "states.json"), "utf-8"));

const centroidsBySlug = new Map<string, { lat: number; lng: number }>();
for (const feature of geojson.features) {
  const geoName = feature.properties?.NAME_1;
  const slug = GEO_NAME_MAPPING[geoName];
  if (slug) {
    const [lng, lat] = geometryBoundsCenter(feature.geometry);
    centroidsBySlug.set(slug, { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) });
  }
}

for (const s of states) {
  const centroid = centroidsBySlug.get(s.slug);
  if (centroid) {
    s.lat = centroid.lat;
    s.lng = centroid.lng;
  }
}

writeFileSync(path.join(DATA_DIR, "states.json"), JSON.stringify(states, null, 2));
console.log(`Updated state centroids for all ${states.length} states in states.json.`);
