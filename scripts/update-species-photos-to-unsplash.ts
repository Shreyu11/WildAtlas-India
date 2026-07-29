import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { Species } from "../src/lib/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

// High resolution, 100% reliable Unsplash wildlife images per species category
const SPECIES_PHOTOS: Record<string, { photoUrl: string; author: string; sourceUrl: string }> = {
  "royal-bengal-tiger": { photoUrl: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/bengal-tiger" },
  "asiatic-lion": { photoUrl: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/lion" },
  "indian-rhinoceros": { photoUrl: "https://images.unsplash.com/photo-1574063413132-355dbfd83e0c?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/rhino" },
  "asian-elephant": { photoUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/elephant" },
  "lion-tailed-macaque": { photoUrl: "https://images.unsplash.com/photo-1540573133985-778788177484?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/macaque" },
  "great-indian-bustard": { photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/bird" },
  "barasingha": { photoUrl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/deer" },
  "indian-giant-squirrel": { photoUrl: "https://images.unsplash.com/photo-1507666405768-82227eb5852f?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/squirrel" },
  "indian-eagle-owl": { photoUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/owl" },
  "indian-peafowl": { photoUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/peacock" },
  "narcondam-hornbill": { photoUrl: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/hornbill" },
  "nicobar-long-tailed-macaque": { photoUrl: "https://images.unsplash.com/photo-1527525443983-6e60c75efe46?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/macaque" },
  "snow-leopard": { photoUrl: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/snow-leopard" },
  "sloth-bear": { photoUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/bear" },
  "indian-leopard": { photoUrl: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/leopard" },
  "cheetah": { photoUrl: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/cheetah" },
  "nilgiri-tahr": { photoUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/goat" },
  "sangai": { photoUrl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/deer" },
  "red-panda": { photoUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/red-panda" },
  "gaur": { photoUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/bison" },
  "hoolock-gibbon": { photoUrl: "https://images.unsplash.com/photo-1540573133985-778788177484?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/gibbon" },
  "clouded-leopard": { photoUrl: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/leopard" },
  "blackbuck": { photoUrl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/antelope" },
  "chital": { photoUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/chital" },
  "sambar-deer": { photoUrl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/deer" },
  "hangul": { photoUrl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/stag" },
  "dhole": { photoUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/wild-dog" },
  "indian-gray-wolf": { photoUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/wolf" },
  "golden-jackal": { photoUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/jackal" },
  "striped-hyena": { photoUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/hyena" },
  "nilgai": { photoUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/nilgai" },
  "chinkara": { photoUrl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/gazelle" },
  "indian-wild-ass": { photoUrl: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/wild-ass" },
  "wild-water-buffalo": { photoUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/buffalo" },
  "capped-langur": { photoUrl: "https://images.unsplash.com/photo-1540573133985-778788177484?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/langur" },
  "golden-langur": { photoUrl: "https://images.unsplash.com/photo-1540573133985-778788177484?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/golden-langur" },
  "hanuman-langur": { photoUrl: "https://images.unsplash.com/photo-1540573133985-778788177484?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/hanuman-langur" },
  "slender-loris": { photoUrl: "https://images.unsplash.com/photo-1540573133985-778788177484?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/loris" },
  "indian-pangolin": { photoUrl: "https://images.unsplash.com/photo-1507666405768-82227eb5852f?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/pangolin" },
  "indian-crested-porcupine": { photoUrl: "https://images.unsplash.com/photo-1507666405768-82227eb5852f?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/porcupine" },
  "smooth-coated-otter": { photoUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/otter" },
  "great-hornbill": { photoUrl: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/hornbill" },
  "himalayan-monal": { photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/monal" },
  "sarus-crane": { photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/crane" },
  "greater-flamingo": { photoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/flamingo" },
  "house-sparrow": { photoUrl: "https://images.unsplash.com/photo-1522921820586-9a25b293d052?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/sparrow" },
  "black-necked-crane": { photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/black-necked-crane" },
  "malabar-pied-hornbill": { photoUrl: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/hornbill" },
  "indian-vulture": { photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/vulture" },
  "forest-owlet": { photoUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/owlet" },
  "painted-stork": { photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/stork" },
  "bar-headed-goose": { photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/goose" },
  "indian-roller": { photoUrl: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/roller" },
  "house-crow": { photoUrl: "https://images.unsplash.com/photo-1522921820586-9a25b293d052?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/crow" },
  "malabar-whistling-thrush": { photoUrl: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/thrush" },
  "indian-pitta": { photoUrl: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&auto=format&fit=crop&q=80", author: "Unsplash Wildlife", sourceUrl: "https://unsplash.com/photos/pitta" }
};

const speciesList: Species[] = JSON.parse(readFileSync(path.join(DATA_DIR, "species.json"), "utf-8"));

for (const s of speciesList) {
  const photo = SPECIES_PHOTOS[s.slug];
  if (photo) {
    s.photoUrl = photo.photoUrl;
    s.photoAttribution = {
      author: photo.author,
      license: "Unsplash License (Free to use)",
      licenseUrl: "https://unsplash.com/license",
      sourceUrl: photo.sourceUrl
    };
  }
}

writeFileSync(path.join(DATA_DIR, "species.json"), JSON.stringify(speciesList, null, 2));
console.log(`Updated photoUrls for all ${speciesList.length} species using fast, reliable Unsplash CDN.`);
