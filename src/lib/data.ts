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

const STATE_OVERVIEWS: Record<string, { overview: string }> = {
  kerala: {
    overview: "Nestled between the Arabian Sea and the Western Ghats biodiversity hotspot, Kerala features tropical wet evergreen rainforests, shola-grassland alpine ecosystems, and coastal mangrove backwaters. Famous for Periyar and Silent Valley National Parks, it shelters critical populations of Asian elephants, Nilgiri tahrs, lion-tailed macaques, and over 500 bird species.",
  },
  gujarat: {
    overview: "Spanning from the arid salt marshes of the Great Rann of Kutch to the dry deciduous teak forests of Gir, Gujarat holds immense ecological significance as the world's sole natural sanctuary for the Asiatic lion and the Indian wild ass. Its diverse coastal wetlands accommodate vast migratory flocks of greater flamingos and endangered marine life.",
  },
  "arunachal-pradesh": {
    overview: "Positioned at the crest of the Eastern Himalayas, Arunachal Pradesh is a global biodiversity hotbed encompassing tropical evergreen jungle, temperate rhododendron woods, and alpine tundra. It stands out as one of the few places in Asia protecting four big cat species—tiger, leopard, snow leopard, and clouded leopard—alongside rare endemics like red pandas and hoolock gibbons.",
  },
  assam: {
    overview: "Dominated by the mighty Brahmaputra River basin, Assam's fertile alluvial grasslands and moist tropical forests harbor over two-thirds of the global population of the Great Indian One-Horned Rhinoceros. Iconic reserves such as Kaziranga and Manas protect crucial breeding populations of wild water buffaloes, Asian elephants, Bengal tigers, and Bengal floricans.",
  },
  "madhya-pradesh": {
    overview: "Referred to as the 'Heart of Wild India', Madhya Pradesh boasts expansive central Indian plateaus and dense sal and teak forests. With famous tiger reserves including Kanha, Bandhavgarh, and Pench, the state supports India's highest tiger population, the endemic Hard-ground Barasingha (swamp deer), and reintroduced African cheetahs in Kuno National Park.",
  },
  rajasthan: {
    overview: "Extending from the Thar Desert scrublands to the ancient Aravalli mountain range, Rajasthan protects fragile arid wildernesses and historic dry deciduous tiger habitats. Renowned sanctuaries like Ranthambore, Sariska, and Keoladeo Ghana National Park provide vital refuges for Bengal tigers, desert cats, blackbucks, and the critically endangered Great Indian Bustard.",
  },
  "west-bengal": {
    overview: "Ranging from snow-capped Himalayan ridges down to the UNESCO-listed Sundarbans mangrove delta, West Bengal encompasses extraordinary habitat diversity. The state is world-famous for its swimming royal Bengal tigers, fishing cats, river dolphins, and northern foothill reserves like Jaldapara and Gorumara that protect Indian rhinos and hornbills.",
  },
  uttarakhand: {
    overview: "Nestled in the Western Himalayas, Uttarakhand spans sub-tropical Terai riverine forests, temperate pine groves, and high-altitude alpine meadows. Home to Jim Corbett National Park—India's oldest national park established in 1936—the state shelters substantial populations of Royal Bengal tigers, Asian elephants, alpine musk deer, and the vibrant Himalayan monal.",
  },
  karnataka: {
    overview: "Covering the lush slopes of the Western Ghats and Deccan tablelands, Karnataka contains some of Southern India's densest contiguous tropical forests. Renowned tiger reserves such as Bandipur, Nagarhole, and Anshi-Dandeli form part of the Nilgiri Biosphere Reserve, sustaining India's largest wild Asian elephant herd alongside leopards, dholes, and king cobras.",
  },
  "himachal-pradesh": {
    overview: "Characterized by rugged Himalayan mountain terrain, subalpine deodar pine forests, and glacial river valleys, Himachal Pradesh is a vital refuge for high-altitude wildlife. Protected wildernesses like Great Himalayan National Park shelter vulnerable snow leopards, Himalayan brown bears, musk deer, western tragopans, and blue sheep in pristine alpine sanctuaries.",
  },
  "andhra-pradesh": {
    overview: "Spanning the Eastern Ghats and the Bay of Bengal coastline, Andhra Pradesh features dry evergreen forests, riverine mangroves, and expansive coastal wetlands. Sanctuaries like Nagarjunsagar-Srisailam—India's largest tiger reserve by area—and Pulicat Lake protect Bengal tigers, blackbucks, smooth-coated otters, rose-ringed parakeets, and large wintering colonies of migratory waterfowl.",
  },
  bihar: {
    overview: "Lying along the fertile Gangetic plains, Bihar features rich moist deciduous forests and riverine wetlands fed by the Ganges. Valmiki National Park in the Himalayan foothills protects tigers, Indian rhinos, and gaur, while Vikramshila Sanctuary serves as India's dedicated sanctuary for the endangered South Asian river dolphin.",
  },
  chhattisgarh: {
    overview: "Covered in vast tracts of dense tropical sal and bamboo forests, Chhattisgarh preserves the wild heartland of Central India. Famous for Indravati National Park and Kanger Valley, the state shelters the endangered Wild Water Buffalo, Hill Myna, sloth bears, leopards, and endemic forest owlets across its river corridors.",
  },
  goa: {
    overview: "Tucked into the Western Ghats biodiversity hotspot, Goa boasts lush moist tropical evergreen forests and coastal estuarine networks. Bhagwan Mahavir Wildlife Sanctuary and Mollem National Park host rich endemic species including gaur (Indian bison), leopards, Malabar pit vipers, and over 400 species of resident and migratory woodland birds.",
  },
  haryana: {
    overview: "Situated across the Gangetic plains and southern Aravalli scrub ridges, Haryana features dry deciduous forests, wetlands, and agricultural ecosystems. Sultanpur National Park and Kalesar Wildlife Sanctuary host vast wintering migratory bird species, blackbucks, nilgai, leopards, and Indian grey wolves across their protected habitats.",
  },
  "jammu-and-kashmir": {
    overview: "Encompassing the snow-covered Pir Panjal and Himalayan ranges, Jammu & Kashmir features temperate coniferous forests and subalpine valleys. Dachigam National Park near Srinagar forms the last refuge for the critically endangered Hangul (Kashmir stag), while surrounding reserves protect Himalayan black bears, musk deer, and Koklass pheasants.",
  },
  jharkhand: {
    overview: "Adorned with Chota Nagpur plateau forests and rolling hill ranges, Jharkhand is rich in moist deciduous vegetation and river valleys. Palamau Tiger Reserve and Dalma Wildlife Sanctuary serve as historic corridors for Asian elephants, Bengal tigers, leopards, sloth bears, and Asian koels.",
  },
  ladakh: {
    overview: "A high-altitude cold desert surrounded by the Karakoram and Trans-Himalayan ranges, Ladakh features vast windswept plateaus and brackish lakes. Hemis National Park—the largest national park in South Asia—is world-renowned for harboring high densities of snow leopards alongside Tibetan wolves, bharal (blue sheep), and black-necked cranes.",
  },
  maharashtra: {
    overview: "Stretching from the Western Ghats escarpment to the dry deciduous forests of the Deccan Plateau, Maharashtra hosts incredible biological richness. Famous reserves such as Tadoba-Andhari, Pench, and Melghat protect healthy populations of Bengal tigers, Indian giant squirrels, leopards, sloth bears, and yellow-footed green pigeons.",
  },
  manipur: {
    overview: "Nestled in Northeast India, Manipur features unique freshwater wetland ecosystems anchored by Loktak Lake—the largest freshwater lake in the region. Keibul Lamjao National Park, the world's only floating national park composed of phumdis (floating biomass), is the exclusive natural habitat of the endangered Sangai (brow-antlered deer).",
  },
  meghalaya: {
    overview: "Known as the 'Abode of Clouds', Meghalaya encompasses moist subtropical cloud forests, limestone caves, and ancient sacred groves. Protected areas like Nokrek Biosphere Reserve and Balpakram National Park preserve rare wildlife species including clouded leopards, red pandas, Asian elephants, hoolock gibbons, and vocal hill mynas.",
  },
  mizoram: {
    overview: "Characterized by steep parallel ridges, bamboo forests, and deep river valleys, Mizoram is part of the Indo-Burma biodiversity hotspot. Dampa Tiger Reserve and Phawngpui (Blue Mountain) National Park protect rare fauna such as Serow, hoolock gibbons, clouded leopards, Marbled Cats, and Mrs. Hume's pheasants.",
  },
  nagaland: {
    overview: "Featuring mountainous terrain, dense primary rainforests, and rhododendron ridges, Nagaland forms a vital eco-region in Northeast India. Intanki National Park and Pulie Badze Sanctuary protect rare montane wildlife species including Mithun (Gayal), hoolock gibbons, clouded leopards, marbled cats, and Blyth's tragopans.",
  },
  odisha: {
    overview: "Bordering the Bay of Bengal, Odisha encompasses tidal mangroves, dry deciduous woodlands, and coastal lagoons. Similipal Biosphere Reserve and Bhitarkanika National Park protect rare melanistic Bengal tigers, Asian elephants, saltwater crocodiles, olive ridley sea turtles, and Indian rollers across their pristine riverine wildernesses.",
  },
  punjab: {
    overview: "Situated across the fertile Indus basin tributaries, Punjab features alluvial riverine wetlands, canal networks, and remnant dry scrub habitats. Harike Wetland—a Ramsar site—serves as a vital wintering stopover for thousands of migratory birds, while dry reserves protect blackbucks, nilgai, and northern goshawks.",
  },
  sikkim: {
    overview: "Encapsulating extreme elevation gradients from tropical valleys up to Kangchenjunga's glacial peaks, Sikkim is a Himalayan biodiversity jewel. Khangchendzonga National Park—a UNESCO World Heritage site—shelters endangered snow leopards, red pandas, Himalayan musk deer, blood pheasants, and over 500 species of alpine orchids.",
  },
  "tamil-nadu": {
    overview: "Spanning the southern Western Ghats and Coromandel coastline, Tamil Nadu encompasses tropical rainforests, shola grasslands, and coastal biosphere reserves. Iconic sanctuaries like Mudumalai, Anamalai, and Gulf of Mannar protect Nilgiri tahrs, Asian elephants, Bengal tigers, dugongs, and emerald doves.",
  },
  telangana: {
    overview: "Situated on the semi-arid Deccan Plateau, Telangana features dry deciduous teak forests, rocky outcrops, and Godavari riverine basins. Amrabad and Kawal Tiger Reserves preserve Bengal tigers, spotted deer (chital), leopards, sloth bears, and Indian rollers across their protected wilderness corridors.",
  },
  tripura: {
    overview: "Surrounded by lush rolling hills and moist tropical forests, Tripura forms part of the Indo-Burma biodiversity hotspot. Sepahijala Wildlife Sanctuary and Clouded Leopard National Park protect rare primate and mammal species including Phayre's leaf monkeys, clouded leopards, Asian elephants, and green imperial pigeons.",
  },
  "uttar-pradesh": {
    overview: "Spanning the vast Gangetic plains and northern Terai forest arc, Uttar Pradesh features fertile floodplains, oxbow lakes, and moist deciduous woodlands. Dudhwa National Park and Katarniaghat Sanctuary preserve breeding populations of Bengal tigers, Indian one-horned rhinos, swamp deer (barasingha), and elegant sarus cranes.",
  },
  "andaman-and-nicobar-islands": {
    overview: "An isolated tropical archipelago in the Indian Ocean, Andaman and Nicobar Islands harbor pristine coastal mangroves, coral reefs, and dense evergreen rainforests. Campbell Bay and Mahatma Gandhi Marine National Parks protect rare endemic species including Dugongs (sea cows), Nicobar long-tailed macaques, and Narcondam hornbills.",
  },
  chandigarh: {
    overview: "Nestled at the foothills of the Shivalik range, Chandigarh features urban forest corridors, Sukhna Lake wetland, and dry deciduous parklands. Sukhna Wildlife Sanctuary provides a protected habitat for migratory waterbirds, Indian grey mongooses, nilgai, sambar deer, and house sparrows.",
  },
  "dadra-and-nagar-haveli-and-daman-and-diu": {
    overview: "Situated along the western Arabian Sea coast and Daman Ganga river basin, this territory features coastal mangrove estuaries and dry deciduous scrub forest reserves. Wildlife sanctuaries like Dadra & Nagar Haveli protect Indian leopards, flamingos, fruit bats, and migratory coastal seabirds.",
  },
  delhi: {
    overview: "Located along the Yamuna river floodplain and Shivalik Aravalli biodiversity ridge, Delhi preserves crucial urban wildlife sanctuaries including Asola Bhatti Wildlife Sanctuary and Yamuna Biodiversity Park. These green lung ecosystems shelter nilgai, golden jackals, Indian grey mongooses, and house sparrows.",
  },
  puducherry: {
    overview: "Comprising coastal enclaves along the Bay of Bengal and Arabian Sea, Puducherry features mangrove estuaries, coastal lagoons, and urban botanic sanctuaries. Ousteri and Bahour wetlands provide vital wintering habitats for migratory waterfowl, Asian koels, smooth-coated otters, and Indian palm squirrels.",
  },
};

const STATE_SYMBOLS: Record<string, { animalSlug: string; birdSlug: string }> = {
  "andhra-pradesh": { animalSlug: "blackbuck", birdSlug: "rose-ringed-parakeet" },
  "arunachal-pradesh": { animalSlug: "mithun", birdSlug: "great-hornbill" },
  assam: { animalSlug: "indian-rhinoceros", birdSlug: "great-hornbill" },
  bihar: { animalSlug: "gaur", birdSlug: "house-sparrow" },
  chhattisgarh: { animalSlug: "wild-water-buffalo", birdSlug: "hill-myna" },
  goa: { animalSlug: "gaur", birdSlug: "great-hornbill" },
  gujarat: { animalSlug: "asiatic-lion", birdSlug: "greater-flamingo" },
  haryana: { animalSlug: "blackbuck", birdSlug: "indian-peafowl" },
  "himachal-pradesh": { animalSlug: "snow-leopard", birdSlug: "himalayan-monal" },
  jharkhand: { animalSlug: "asian-elephant", birdSlug: "asian-koel" },
  karnataka: { animalSlug: "asian-elephant", birdSlug: "indian-roller" },
  kerala: { animalSlug: "asian-elephant", birdSlug: "great-hornbill" },
  "madhya-pradesh": { animalSlug: "barasingha", birdSlug: "sarus-crane" },
  maharashtra: { animalSlug: "indian-giant-squirrel", birdSlug: "yellow-footed-green-pigeon" },
  manipur: { animalSlug: "sangai", birdSlug: "indian-peafowl" },
  meghalaya: { animalSlug: "clouded-leopard", birdSlug: "hill-myna" },
  mizoram: { animalSlug: "hoolock-gibbon", birdSlug: "great-hornbill" },
  nagaland: { animalSlug: "mithun", birdSlug: "great-hornbill" },
  odisha: { animalSlug: "sambar-deer", birdSlug: "indian-roller" },
  punjab: { animalSlug: "blackbuck", birdSlug: "indian-peafowl" },
  rajasthan: { animalSlug: "chinkara", birdSlug: "great-indian-bustard" },
  sikkim: { animalSlug: "red-panda", birdSlug: "himalayan-monal" },
  "tamil-nadu": { animalSlug: "nilgiri-tahr", birdSlug: "emerald-dove" },
  telangana: { animalSlug: "chital", birdSlug: "indian-roller" },
  tripura: { animalSlug: "clouded-leopard", birdSlug: "great-hornbill" },
  "uttar-pradesh": { animalSlug: "barasingha", birdSlug: "sarus-crane" },
  uttarakhand: { animalSlug: "snow-leopard", birdSlug: "himalayan-monal" },
  "west-bengal": { animalSlug: "fishing-cat", birdSlug: "white-throated-kingfisher" },
  "andaman-and-nicobar-islands": { animalSlug: "dugong", birdSlug: "narcondam-hornbill" },
  chandigarh: { animalSlug: "blackbuck", birdSlug: "house-sparrow" },
  "dadra-and-nagar-haveli-and-daman-and-diu": { animalSlug: "gaur", birdSlug: "greater-flamingo" },
  delhi: { animalSlug: "nilgai", birdSlug: "house-sparrow" },
  "jammu-and-kashmir": { animalSlug: "hangul", birdSlug: "black-necked-crane" },
  ladakh: { animalSlug: "snow-leopard", birdSlug: "black-necked-crane" },
  lakshadweep: { animalSlug: "asiatic-lion", birdSlug: "greater-flamingo" },
  puducherry: { animalSlug: "indian-giant-squirrel", birdSlug: "asian-koel" },
};

export async function getStates(): Promise<State[]> {
  const states = await readJson<State[]>("states.json");
  return states.map((state) => {
    const custom = STATE_OVERVIEWS[state.slug];
    const symbols = STATE_SYMBOLS[state.slug];
    const photoUrl = `/images/states/satellite/${state.slug}.png`;
    const overview = state.overview || custom?.overview || `${state.name} features diverse natural ecosystems supporting native Indian wildlife, national parks, and protected natural habitats.`;
    return {
      ...state,
      stateAnimalSlug: symbols?.animalSlug || state.stateAnimalSlug || state.dominantSpeciesSlug,
      stateBirdSlug: symbols?.birdSlug || state.stateBirdSlug || "indian-peafowl",
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

