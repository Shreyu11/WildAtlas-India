import { writeFileSync, readFileSync } from "fs";
import path from "path";
import type { Species, State, MarkerTier, FunFact, WorldAnimalDay, SpeciesDensityMap } from "../src/lib/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

// Comprehensive collection of iconic Indian Mammals & Birds (37 species)
const SPECIES: Species[] = [
  // --- EXISTING 12 SPECIES ---
  {
    slug: "royal-bengal-tiger",
    commonName: "Royal Bengal Tiger",
    scientificName: "Panthera tigris tigris",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "India's national animal and iconic apex predator of mangroves, grasslands, and deciduous forests.",
    habitat: "Mangrove forests, tropical dry/moist deciduous forests, riverine tall grasslands",
    stateSlugs: ["west-bengal", "madhya-pradesh", "rajasthan", "uttarakhand", "karnataka", "maharashtra", "assam"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3.jpg/960px-Bengal_tiger_%28Panthera_tigris_tigris%29_female_3.jpg",
    photoAttribution: {
      author: "Charles J. Sharp",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Bengal_tiger_(Panthera_tigris_tigris)_female_3.jpg"
    },
    sourceCitations: ["IUCN Red List of Threatened Species", "Status of Tigers in India 2022 (NTCA/WII)"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Panthera", species: "Panthera tigris" },
    populationTrend: [
      { year: 2006, estimate: 1411, source: "All India Tiger Estimation (NTCA/WII)" },
      { year: 2010, estimate: 1706, source: "All India Tiger Estimation (NTCA/WII)" },
      { year: 2014, estimate: 2226, source: "All India Tiger Estimation (NTCA/WII)" },
      { year: 2018, estimate: 2967, source: "All India Tiger Estimation (NTCA/WII)" },
      { year: 2022, estimate: 3682, source: "Status of Tigers in India 2022 (NTCA)" }
    ],
    worldAnimalDaySlug: "international-tiger-day",
    conservationEfforts: ["Project Tiger", "NTCA Tiger Census"],
    needsResearch: false
  },
  {
    slug: "asiatic-lion",
    commonName: "Asiatic Lion",
    scientificName: "Panthera leo leo",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "The world's last wild population of Asiatic lions survives exclusively in and around Gir Forest, Gujarat.",
    habitat: "Dry deciduous forest, teak woodlands, and thorn scrubland",
    stateSlugs: ["gujarat"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Asiatic_Lion_Royal_Walk_at_Gir_National_Park%2C_Gujrat%2C_India.jpg/960px-Asiatic_Lion_Royal_Walk_at_Gir_National_Park%2C_Gujrat%2C_India.jpg",
    photoAttribution: {
      author: "Rohit Sharma",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Asiatic_Lion_Royal_Walk_at_Gir_National_Park,_Gujrat,_India.jpg"
    },
    sourceCitations: ["IUCN Red List of Threatened Species", "Gujarat Forest Department Census"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Panthera", species: "Panthera leo" },
    populationTrend: [
      { year: 2005, estimate: 359, source: "Gujarat Forest Department Census" },
      { year: 2010, estimate: 411, source: "Gujarat Forest Department Census" },
      { year: 2015, estimate: 523, source: "Gujarat Forest Department Census" },
      { year: 2020, estimate: 674, source: "Poonam Avlokan Lion Census" }
    ],
    worldAnimalDaySlug: "world-lion-day",
    conservationEfforts: ["Asiatic Lion Conservation Project"],
    needsResearch: false
  },
  {
    slug: "indian-rhinoceros",
    commonName: "Indian Rhinoceros",
    scientificName: "Rhinoceros unicornis",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "Also called the Greater One-Horned Rhinoceros, an armored-looking megaherbivore native to Brahmaputra floodplains.",
    habitat: "Riverine tall grasslands, alluvial floodplains, swampy meadows",
    stateSlugs: ["assam", "west-bengal", "uttar-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Indian_rhinoceros_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_01.jpg/960px-Indian_rhinoceros_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_01.jpg",
    photoAttribution: {
      author: "Tisha Mukherjee",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_rhinoceros_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_01.jpg"
    },
    sourceCitations: ["IUCN Red List", "Assam Forest Department Rhinoceros Census"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Perissodactyla", family: "Rhinocerotidae", genus: "Rhinoceros", species: "Rhinoceros unicornis" },
    populationTrend: [
      { year: 1966, estimate: 366, source: "Assam Forest Department Historical Census" },
      { year: 1999, estimate: 1552, source: "Kaziranga Rhino Census" },
      { year: 2018, estimate: 2413, source: "Kaziranga Rhino Census" },
      { year: 2022, estimate: 2613, source: "14th Kaziranga Rhino Census" }
    ],
    worldAnimalDaySlug: "world-rhino-day",
    conservationEfforts: ["Indian Rhino Vision 2020"],
    needsResearch: false
  },
  {
    slug: "asian-elephant",
    commonName: "Asian Elephant",
    scientificName: "Elephas maximus indicus",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "India holds over 60% of the wild Asian elephant population, roaming Western Ghats forests and Eastern corridors.",
    habitat: "Tropical evergreen and moist deciduous forest, bamboo brake, riverine forest",
    stateSlugs: ["kerala", "karnataka", "tamil-nadu", "assam", "odisha", "uttarakhand"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_01.jpg/960px-Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_01.jpg",
    photoAttribution: {
      author: "Tisha Mukherjee",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_01.jpg"
    },
    sourceCitations: ["IUCN Red List", "Project Elephant Status Report"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Proboscidea", family: "Elephantidae", genus: "Elephas", species: "Elephas maximus" },
    populationTrend: [
      { year: 2007, estimate: 27694, source: "Project Elephant Census" },
      { year: 2012, estimate: 29576, source: "Project Elephant Census" },
      { year: 2017, estimate: 27312, source: "Synchronized Elephant Census" }
    ],
    worldAnimalDaySlug: "world-elephant-day",
    conservationEfforts: ["Project Elephant", "Elephant Corridors Initiative"],
    needsResearch: false
  },
  {
    slug: "lion-tailed-macaque",
    commonName: "Lion-tailed Macaque",
    scientificName: "Macaca silenus",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "An endemic Western Ghats primate recognized by its silver-white mane and black body, dwelling high in rainforest canopies.",
    habitat: "Tropical rainforest canopy of Western Ghats",
    stateSlugs: ["karnataka", "kerala", "tamil-nadu"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/LTM_profile.JPG/960px-LTM_profile.JPG",
    photoAttribution: {
      author: "T. R. Shankar Raman",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:LTM_profile.JPG"
    },
    sourceCitations: ["IUCN Red List", "Western Ghats Biodiversity Monitoring"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Primates", family: "Cercopithecidae", genus: "Macaca", species: "Macaca silenus" },
    populationTrend: [
      { year: 2003, estimate: 3000, source: "IUCN Species Assessment" },
      { year: 2015, estimate: 4000, source: "Western Ghats Primate Survey" }
    ],
    needsResearch: false
  },
  {
    slug: "great-indian-bustard",
    commonName: "Great Indian Bustard",
    scientificName: "Ardeotis nigriceps",
    taxon: "bird",
    conservationStatus: "CR",
    description: "One of the world's heaviest flying birds, critically endangered and holding out in Rajasthan's Thar Desert grasslands.",
    habitat: "Arid and semi-arid shortgrass plains, dry agricultural land",
    stateSlugs: ["rajasthan", "gujarat", "maharashtra"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Great_Indian_Bustard_Ardeotis_nigriceps_by_Raju_Kasambe_DSCN9716_01.jpg/960px-Great_Indian_Bustard_Ardeotis_nigriceps_by_Raju_Kasambe_DSCN9716_01.jpg",
    photoAttribution: {
      author: "Dr. Raju Kasambe",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Great_Indian_Bustard_Ardeotis_nigriceps_by_Raju_Kasambe_DSCN9716_01.jpg"
    },
    sourceCitations: ["IUCN Red List", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Otidiformes", family: "Otididae", genus: "Ardeotis", species: "Ardeotis nigriceps" },
    populationTrend: [
      { year: 1969, estimate: 1260, source: "WII Historical Census" },
      { year: 2011, estimate: 250, source: "IUCN Red List Assessment" },
      { year: 2018, estimate: 150, source: "WII Status Report" }
    ],
    conservationEfforts: ["Project Great Indian Bustard", "Captive Breeding Program (Sam)"],
    needsResearch: false
  },
  {
    slug: "barasingha",
    commonName: "Barasingha",
    scientificName: "Rucervus duvaucelii",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "Also known as the Swamp Deer, famous for the adult male's magnificent multi-tined antlers; Madhya Pradesh's state animal.",
    habitat: "Swampy grasslands, marshlands, and moist deciduous forest glades",
    stateSlugs: ["madhya-pradesh", "uttar-pradesh", "assam"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Barasingha_in_Kanha_National_Park_01.jpg/960px-Barasingha_in_Kanha_National_Park_01.jpg",
    photoAttribution: {
      author: "Bernard Gagnon",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Barasingha_in_Kanha_National_Park_01.jpg"
    },
    sourceCitations: ["IUCN Red List", "WII Species Recovery Plan"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Cervidae", genus: "Rucervus", species: "Rucervus duvaucelii" },
    populationTrend: [
      { year: 1970, estimate: 66, source: "Kanha Barasingha Conservation Recovery" },
      { year: 2000, estimate: 350, source: "Kanha National Park Census" },
      { year: 2020, estimate: 800, source: "MP Forest Department Census" }
    ],
    needsResearch: false
  },
  {
    slug: "indian-giant-squirrel",
    commonName: "Indian Giant Squirrel",
    scientificName: "Ratufa indica",
    taxon: "mammal",
    conservationStatus: "LC",
    description: "Maharashtra's state animal (Shekru), a strikingly colorful tree squirrel leaping between canopy branches of moist forests.",
    habitat: "Tropical moist deciduous and evergreen forest canopy",
    stateSlugs: ["maharashtra", "karnataka", "kerala", "tamil-nadu", "madhya-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Indian_giant_squirrel_by_Tisha_Mukherjee_09.jpg/960px-Indian_giant_squirrel_by_Tisha_Mukherjee_09.jpg",
    photoAttribution: {
      author: "Tisha Mukherjee",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_giant_squirrel_by_Tisha_Mukherjee_09.jpg"
    },
    sourceCitations: ["IUCN Red List", "ZSI State Fauna Series"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Rodentia", family: "Sciuridae", genus: "Ratufa", species: "Ratufa indica" },
    needsResearch: false
  },
  {
    slug: "indian-eagle-owl",
    commonName: "Indian Eagle-Owl",
    scientificName: "Bubo bengalensis",
    taxon: "bird",
    conservationStatus: "LC",
    description: "A large, tufted nocturnal raptor inhabiting rocky cliffs, ravines, and dry hill scrub, known for its deep resonant call.",
    habitat: "Rocky outcrops, river ravines, dry scrub forest, old ruins",
    stateSlugs: ["rajasthan", "madhya-pradesh", "maharashtra", "karnataka"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Indian_eagle-owl%2C_Bhigwan_4.jpg/960px-Indian_eagle-owl%2C_Bhigwan_4.jpg",
    photoAttribution: {
      author: "Drsssuresh1961",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_eagle-owl,_Bhigwan_4.jpg"
    },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Strigiformes", family: "Strigidae", genus: "Bubo", species: "Bubo bengalensis" },
    needsResearch: false
  },
  {
    slug: "indian-peafowl",
    commonName: "Indian Peafowl",
    scientificName: "Pavo cristatus",
    taxon: "bird",
    conservationStatus: "LC",
    description: "India's national bird, famed worldwide for the male's iridescent blue crest and train of eye-spotted feathers.",
    habitat: "Open dry forest, thorn scrub, agricultural mosaic, riverbanks",
    stateSlugs: ["rajasthan", "madhya-pradesh", "gujarat", "punjab", "haryana", "uttar-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Portrait_of_an_Indian_peafowl.jpg/960px-Portrait_of_an_Indian_peafowl.jpg",
    photoAttribution: {
      author: "Clément Bardot",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Portrait_of_an_Indian_peafowl.jpg"
    },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Galliformes", family: "Phasianidae", genus: "Pavo", species: "Pavo cristatus" },
    needsResearch: false
  },
  {
    slug: "narcondam-hornbill",
    commonName: "Narcondam Hornbill",
    scientificName: "Rhyticeros narcondami",
    taxon: "bird",
    conservationStatus: "VU",
    description: "An endemic hornbill restricted entirely to tiny Narcondam Island (6.8 sq km) in the Andaman Sea.",
    habitat: "Tropical evergreen island forest",
    stateSlugs: ["andaman-and-nicobar-islands"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Narcondam_Hornbill_DSCN1242_15.jpg/960px-Narcondam_Hornbill_DSCN1242_15.jpg",
    photoAttribution: {
      author: "Rohitjahnavi",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Narcondam_Hornbill_DSCN1242_15.jpg"
    },
    sourceCitations: ["IUCN Red List", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Bucerotiformes", family: "Bucerotidae", genus: "Rhyticeros", species: "Rhyticeros narcondami" },
    populationTrend: [
      { year: 1998, estimate: 300, source: "SACON Narcondam Survey" },
      { year: 2020, estimate: 1000, source: "WII Andaman Island Census" }
    ],
    needsResearch: false
  },
  {
    slug: "nicobar-long-tailed-macaque",
    commonName: "Nicobar Long-tailed Macaque",
    scientificName: "Macaca fascicularis umbrosus",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "A dark-coated, island-endemic macaque subspecies living along the coastal rainforests of Great and Little Nicobar.",
    habitat: "Coastal mangroves and tropical evergreen island forest",
    stateSlugs: ["andaman-and-nicobar-islands"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Nicobar_Long-tailed_or_Crab-eating_Macaque_%28Macaca_fascicularis_umbrosa%29.jpg/960px-Nicobar_Long-tailed_or_Crab-eating_Macaque_%28Macaca_fascicularis_umbrosa%29.jpg",
    photoAttribution: {
      author: "Arijit Pal",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Nicobar_Long-tailed_or_Crab-eating_Macaque_(Macaca_fascicularis_umbrosa).jpg"
    },
    sourceCitations: ["IUCN Red List", "ZSI Andaman & Nicobar Survey"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Primates", family: "Cercopithecidae", genus: "Macaca", species: "Macaca fascicularis" },
    needsResearch: false
  },

  // --- NEW EXPANDED MAMMAL SPECIES ---
  {
    slug: "snow-leopard",
    commonName: "Snow Leopard",
    scientificName: "Panthera uncia",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "The elusive 'ghost of the mountains' living in the high-altitude rugged terrain of the Indian Himalayas.",
    habitat: "Alpine meadows, high mountain scree slopes, steep rocky cliffs above tree line",
    stateSlugs: ["ladakh", "jammu-and-kashmir", "himachal-pradesh", "uttarakhand", "sikkim", "arunachal-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Snow_leopard_portrait.jpg/960px-Snow_leopard_portrait.jpg",
    photoAttribution: { author: "Bernard Gagnon", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Snow_leopard_portrait.jpg" },
    sourceCitations: ["IUCN Red List", "Project Snow Leopard Assessment (MoEFCC)"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Panthera", species: "Panthera uncia" },
    populationTrend: [{ year: 2024, estimate: 718, source: "Snow Leopard Population Assessment in India (SPAI)" }],
    conservationEfforts: ["Project Snow Leopard", "SECURE Himalaya"],
    needsResearch: false
  },
  {
    slug: "sloth-bear",
    commonName: "Sloth Bear",
    scientificName: "Melursus ursinus",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "A shaggy, long-clawed bear specialized in feeding on termites and ants using its vacuum-like suction lips.",
    habitat: "Dry deciduous forest, scrub forest, rocky hills",
    stateSlugs: ["karnataka", "madhya-pradesh", "gujarat", "rajasthan", "maharashtra", "chhattisgarh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Sloth_Bear_in_Bandipur_National_Park.jpg/960px-Sloth_Bear_in_Bandipur_National_Park.jpg",
    photoAttribution: { author: "Yashpal Rathore", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sloth_Bear_in_Bandipur_National_Park.jpg" },
    sourceCitations: ["IUCN Red List", "WII Bear Study"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Ursidae", genus: "Melursus", species: "Melursus ursinus" },
    needsResearch: false
  },
  {
    slug: "indian-leopard",
    commonName: "Indian Leopard",
    scientificName: "Panthera pardus fusca",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "The most adaptable big cat in India, highly skilled in tree climbing and patrolling scrubland and forest edges.",
    habitat: "Tropical rainforest, deciduous woodland, dry scrubland, mountain slopes",
    stateSlugs: ["uttarakhand", "karnataka", "maharashtra", "madhya-pradesh", "rajasthan", "himachal-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Indian_leopard_in_Kabini.jpg/960px-Indian_leopard_in_Kabini.jpg",
    photoAttribution: { author: "Srikanth Parthasarathy", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_leopard_in_Kabini.jpg" },
    sourceCitations: ["IUCN Red List", "Status of Leopards in India 2022"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Panthera", species: "Panthera pardus" },
    populationTrend: [{ year: 2022, estimate: 13874, source: "Status of Leopards in India 2022" }],
    needsResearch: false
  },
  {
    slug: "cheetah",
    commonName: "Cheetah",
    scientificName: "Acinonyx jubatus",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "Reintroduced to India in 2022 at Kuno National Park, marking the world's first intercontinental wild carnivore translocation.",
    habitat: "Open savanna grasslands, dry scrub forest",
    stateSlugs: ["madhya-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Cheetah_running_edit2.jpg/960px-Cheetah_running_edit2.jpg",
    photoAttribution: { author: "Arturo de Frias Marques", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cheetah_running_edit2.jpg" },
    sourceCitations: ["Project Cheetah Action Plan (MoEFCC/WII)", "IUCN Red List"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Acinonyx", species: "Acinonyx jubatus" },
    conservationEfforts: ["Project Cheetah"],
    needsResearch: false
  },
  {
    slug: "nilgiri-tahr",
    commonName: "Nilgiri Tahr",
    scientificName: "Nilgiritragus hylocrius",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "Tamil Nadu's state animal, an endemic wild mountain goat adapted to steep cliff faces and shola grasslands.",
    habitat: "High-altitude montane shola-grasslands and precipitous cliffs",
    stateSlugs: ["tamil-nadu", "kerala"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Nilgiri_Tahr_Eravikulam_National_Park.jpg/960px-Nilgiri_Tahr_Eravikulam_National_Park.jpg",
    photoAttribution: { author: "Kalyan Varma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Nilgiri_Tahr_Eravikulam_National_Park.jpg" },
    sourceCitations: ["IUCN Red List", "Project Nilgiri Tahr (Tamil Nadu Forest Dept)"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Bovidae", genus: "Nilgiritragus", species: "Nilgiritragus hylocrius" },
    needsResearch: false
  },
  {
    slug: "sangai",
    commonName: "Sangai (Brow-antlered Deer)",
    scientificName: "Rucervus eldii eldii",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "The 'dancing deer' of Manipur, living exclusively on the floating phumdis (peat vegetation) of Loktak Lake.",
    habitat: "Floating peat biomass (phumdis) on Loktak freshwater lake",
    stateSlugs: ["manipur"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Sangai_at_Keibul_Lamjao.jpg/960px-Sangai_at_Keibul_Lamjao.jpg",
    photoAttribution: { author: "Rizal", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sangai_at_Keibul_Lamjao.jpg" },
    sourceCitations: ["IUCN Red List", "Manipur Forest Department Census"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Cervidae", genus: "Rucervus", species: "Rucervus eldii" },
    needsResearch: false
  },
  {
    slug: "red-panda",
    commonName: "Red Panda",
    scientificName: "Ailurus fulgens",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "Sikkim's state animal, an arboreal mammal with dense rusty red fur and ringed tail, feeding on mountain bamboo.",
    habitat: "Temperate broadleaf and conifer forests with dense bamboo understory",
    stateSlugs: ["sikkim", "west-bengal", "arunachal-pradesh", "meghalaya"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/RedPandaFullBody.JPG/960px-RedPandaFullBody.JPG",
    photoAttribution: { author: "A.J. Haverkamp", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:RedPandaFullBody.JPG" },
    sourceCitations: ["IUCN Red List", "WWF-India Red Panda Conservation"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Ailuridae", genus: "Ailurus", species: "Ailurus fulgens" },
    needsResearch: false
  },
  {
    slug: "gaur",
    commonName: "Gaur (Indian Bison)",
    scientificName: "Bos gaurus",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "The world's largest wild bovine, a massive dark-coated wild cow with white stockings patrolling Western Ghats forests.",
    habitat: "Evergreen, semi-evergreen, and moist deciduous hill forests",
    stateSlugs: ["kerala", "karnataka", "goa", "tamil-nadu", "maharashtra", "madhya-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Gaur_in_Bandipur.jpg/960px-Gaur_in_Bandipur.jpg",
    photoAttribution: { author: "Yashpal Rathore", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Gaur_in_Bandipur.jpg" },
    sourceCitations: ["IUCN Red List", "ZSI Fauna of Western Ghats"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Bovidae", genus: "Bos", species: "Bos gaurus" },
    needsResearch: false
  },
  {
    slug: "hoolock-gibbon",
    commonName: "Hoolock Gibbon",
    scientificName: "Hoolock hoolock",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "India's only ape species, famed for its loud rhythmic morning calls across Northeast Indian rainforest canopies.",
    habitat: "Dense tropical evergreen and semi-evergreen forest canopy",
    stateSlugs: ["assam", "meghalaya", "arunachal-pradesh", "nagaland", "mizoram"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Western_Hoolock_Gibbon_male.jpg/960px-Western_Hoolock_Gibbon_male.jpg",
    photoAttribution: { author: "Dr. Raju Kasambe", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Western_Hoolock_Gibbon_male.jpg" },
    sourceCitations: ["IUCN Red List", "Aaranyak Primate Census"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Primates", family: "Hylobatidae", genus: "Hoolock", species: "Hoolock hoolock" },
    needsResearch: false
  },
  {
    slug: "clouded-leopard",
    commonName: "Clouded Leopard",
    scientificName: "Neofelis nebulosa",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "Meghalaya's state animal, an arboreal wild cat with beautiful cloud-like coat blotches and extremely long canine teeth.",
    habitat: "Dense primary evergreen tropical rainforests",
    stateSlugs: ["meghalaya", "tripura", "assam", "arunachal-pradesh", "mizoram"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Neofelis_nebulosa.jpg/960px-Neofelis_nebulosa.jpg",
    photoAttribution: { author: "Ltshears", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Neofelis_nebulosa.jpg" },
    sourceCitations: ["IUCN Red List", "MoEFCC Northeast Wildlife Survey"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Neofelis", species: "Neofelis nebulosa" },
    needsResearch: false
  },
  {
    slug: "blackbuck",
    commonName: "Blackbuck",
    scientificName: "Antilope cervicapra",
    taxon: "mammal",
    conservationStatus: "LC",
    description: "Punjab and Andhra Pradesh's state animal, a striking spiral-horned antelope famous for high bounding leaps across open plains.",
    habitat: "Open grassland, dry scrub forest, agricultural plains",
    stateSlugs: ["gujarat", "punjab", "rajasthan", "andhra-pradesh", "haryana", "karnataka", "telangana"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Blackbuck_male_in_Velavadar.jpg/960px-Blackbuck_male_in_Velavadar.jpg",
    photoAttribution: { author: "Dhaval Patel", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Blackbuck_male_in_Velavadar.jpg" },
    sourceCitations: ["IUCN Red List", "Velavadar Blackbuck Census"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Bovidae", genus: "Antilope", species: "Antilope cervicapra" },
    needsResearch: false
  },
  {
    slug: "chital",
    commonName: "Chital (Spotted Deer)",
    scientificName: "Axis axis",
    taxon: "mammal",
    conservationStatus: "LC",
    description: "India's most common and picturesque deer, covered in permanent white spots, a key prey species for tigers and leopards.",
    habitat: "Moist and dry deciduous forests, grasslands, river banks",
    stateSlugs: ["madhya-pradesh", "karnataka", "rajasthan", "uttarakhand", "west-bengal", "maharashtra", "tamil-nadu"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Chital_Nagarhole.jpg/960px-Chital_Nagarhole.jpg",
    photoAttribution: { author: "Yashpal Rathore", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Chital_Nagarhole.jpg" },
    sourceCitations: ["IUCN Red List", "NTCA Herbivore Monitoring"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Cervidae", genus: "Axis", species: "Axis axis" },
    needsResearch: false
  },
  {
    slug: "sambar-deer",
    commonName: "Sambar Deer",
    scientificName: "Rusa unicolor",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "Odisha's state animal, the largest deer species in the Indian subcontinent, with dark brown coat and rugged antlers.",
    habitat: "Dense hill forests, evergreen forest, open woodland, swamps",
    stateSlugs: ["odisha", "madhya-pradesh", "karnataka", "rajasthan", "uttarakhand", "kerala"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Sambar_male_in_Ranthambore.jpg/960px-Sambar_male_in_Ranthambore.jpg",
    photoAttribution: { author: "Bernard Gagnon", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sambar_male_in_Ranthambore.jpg" },
    sourceCitations: ["IUCN Red List", "ZSI Indian Wildlife Studies"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Cervidae", genus: "Rusa", species: "Rusa unicolor" },
    needsResearch: false
  },
  {
    slug: "hangul",
    commonName: "Hangul (Kashmir Stag)",
    scientificName: "Cervus hanglu hanglu",
    taxon: "mammal",
    conservationStatus: "CR",
    description: "Jammu & Kashmir's state animal, a critically endangered red deer subspecies holding on in Dachigam National Park.",
    habitat: "Riverine pine and oak forests, high mountain slopes of Kashmir valley",
    stateSlugs: ["jammu-and-kashmir"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Kashmir_Stag_in_Dachigam.jpg/960px-Kashmir_Stag_in_Dachigam.jpg",
    photoAttribution: { author: "Wildlife Conservation Fund J&K", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Kashmir_Stag_in_Dachigam.jpg" },
    sourceCitations: ["IUCN Red List", "J&K Wildlife Department Census"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Cervidae", genus: "Cervus", species: "Cervus hanglu" },
    needsResearch: false
  },
  {
    slug: "dhole",
    commonName: "Dhole (Indian Wild Dog)",
    scientificName: "Cuon alpinus",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "An endangered social pack hunter with a rufous coat, whistling calls, and incredible pack coordination.",
    habitat: "Tropical evergreen, moist deciduous forest, dry scrub",
    stateSlugs: ["karnataka", "kerala", "madhya-pradesh", "maharashtra", "assam", "tamil-nadu"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Dhole_in_Bandipur_National_Park.jpg/960px-Dhole_in_Bandipur_National_Park.jpg",
    photoAttribution: { author: "Srikanth Parthasarathy", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dhole_in_Bandipur_National_Park.jpg" },
    sourceCitations: ["IUCN Red List", "WII Canid Specialist Group"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Canidae", genus: "Cuon", species: "Cuon alpinus" },
    needsResearch: false
  },
  {
    slug: "indian-gray-wolf",
    commonName: "Indian Gray Wolf",
    scientificName: "Canis lupus pallipes",
    taxon: "mammal",
    conservationStatus: "VU",
    description: "An ancient, desert and grassland adapted wolf subspecies roaming non-protected semi-arid plains of India.",
    habitat: "Grasslands, semi-arid scrub, agricultural matrix",
    stateSlugs: ["gujarat", "rajasthan", "maharashtra", "karnataka", "madhya-pradesh", "andhra-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Indian_Wolf_in_Velavadar.jpg/960px-Indian_Wolf_in_Velavadar.jpg",
    photoAttribution: { author: "Kalyan Varma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_Wolf_in_Velavadar.jpg" },
    sourceCitations: ["IUCN Red List", "WII Wolf Conservation Project"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Canidae", genus: "Canis", species: "Canis lupus" },
    needsResearch: false
  },
  {
    slug: "golden-jackal",
    commonName: "Golden Jackal",
    scientificName: "Canis aureus",
    taxon: "mammal",
    conservationStatus: "LC",
    description: "A highly adaptable medium-sized wild canid widespread across Indian countryside, forests, and suburban edges.",
    habitat: "Dry deciduous forest, agricultural farmland, scrublands, village outskirts",
    stateSlugs: ["punjab", "haryana", "uttar-pradesh", "rajasthan", "gujarat", "west-bengal"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Golden_Jackal_in_Keoladeo.jpg/960px-Golden_Jackal_in_Keoladeo.jpg",
    photoAttribution: { author: "Bernard Gagnon", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Golden_Jackal_in_Keoladeo.jpg" },
    sourceCitations: ["IUCN Red List", "ZSI Fauna Series"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Canidae", genus: "Canis", species: "Canis aureus" },
    needsResearch: false
  },
  {
    slug: "striped-hyena",
    commonName: "Striped Hyena",
    scientificName: "Hyaena hyaena",
    taxon: "mammal",
    conservationStatus: "NT",
    description: "A nocturnal scavenger with vertical black stripes and a tall mane, inhabiting arid rocky ravines and thorn forests.",
    habitat: "Arid and semi-arid scrub, rocky ravines, dry deciduous woodlands",
    stateSlugs: ["rajasthan", "gujarat", "madhya-pradesh", "maharashtra", "karnataka", "telangana"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Striped_hyena_portrait.jpg/960px-Striped_hyena_portrait.jpg",
    photoAttribution: { author: "Gideon Pisanty", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Striped_hyena_portrait.jpg" },
    sourceCitations: ["IUCN Red List", "WII Small Carnivore Survey"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Carnivora", family: "Hyaenidae", genus: "Hyaena", species: "Hyaena hyaena" },
    needsResearch: false
  },
  {
    slug: "nilgai",
    commonName: "Nilgai (Blue Bull)",
    scientificName: "Boselaphus tragocamelus",
    taxon: "mammal",
    conservationStatus: "LC",
    description: "Asia's largest antelope, adult males having a blue-gray coat and white neck patches, thriving across northern plains.",
    habitat: "Arid plains, open scrubland, agricultural farmland, dry deciduous woodland",
    stateSlugs: ["rajasthan", "uttar-pradesh", "gujarat", "madhya-pradesh", "haryana", "punjab", "delhi"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nilgai_male_in_Ranthambore.jpg/960px-Nilgai_male_in_Ranthambore.jpg",
    photoAttribution: { author: "J.M.Garg", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Nilgai_male_in_Ranthambore.jpg" },
    sourceCitations: ["IUCN Red List", "ZSI Mammalia Checklist"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Bovidae", genus: "Boselaphus", species: "Boselaphus tragocamelus" },
    needsResearch: false
  },
  {
    slug: "chinkara",
    commonName: "Chinkara (Indian Gazelle)",
    scientificName: "Gazella bennettii",
    taxon: "mammal",
    conservationStatus: "LC",
    description: "A graceful, reddish-buff desert gazelle capable of surviving without drinking water by obtaining moisture from plants.",
    habitat: "Arid desert sand dunes, dry scrub, open plains, stony hills",
    stateSlugs: ["rajasthan", "gujarat", "madhya-pradesh", "punjab", "haryana"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Indian_Gazelle_Chinkara.jpg/960px-Indian_Gazelle_Chinkara.jpg",
    photoAttribution: { author: "Dr. Raju Kasambe", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_Gazelle_Chinkara.jpg" },
    sourceCitations: ["IUCN Red List", "Arid Zone Research Institute Studies"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Bovidae", genus: "Gazella", species: "Gazella bennettii" },
    needsResearch: false
  },
  {
    slug: "indian-wild-ass",
    commonName: "Indian Wild Ass (Khur)",
    scientificName: "Equus hemionus khur",
    taxon: "mammal",
    conservationStatus: "NT",
    description: "Endemic to the Little Rann of Kutch salt flats, one of the fastest running wild mammals in Asia.",
    habitat: "Saline desert mudflats, arid salt marshes, scrub islands (bets)",
    stateSlugs: ["gujarat"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Indian_Wild_Ass_in_Little_Rann_of_Kutch.jpg/960px-Indian_Wild_Ass_in_Little_Rann_of_Kutch.jpg",
    photoAttribution: { author: "Kalyan Varma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_Wild_Ass_in_Little_Rann_of_Kutch.jpg" },
    sourceCitations: ["IUCN Red List", "Gujarat Forest Department Wild Ass Census"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Perissodactyla", family: "Equidae", genus: "Equus", species: "Equus hemionus" },
    needsResearch: false
  },
  {
    slug: "wild-water-buffalo",
    commonName: "Wild Water Buffalo",
    scientificName: "Bubalus arnee",
    taxon: "mammal",
    conservationStatus: "EN",
    description: "Chhattisgarh's state animal, an endangered wild ancestor of domestic water buffalo with massive crescent horns.",
    habitat: "Riverine tall grasslands, river marshes, swamp forests",
    stateSlugs: ["assam", "chhattisgarh", "arunachal-pradesh", "meghalaya"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Wild_water_buffalo_Kaziranga.jpg/960px-Wild_water_buffalo_Kaziranga.jpg",
    photoAttribution: { author: "Lip Kee", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Wild_water_buffalo_Kaziranga.jpg" },
    sourceCitations: ["IUCN Red List", "WII Wild Buffalo Conservation Plan"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Mammalia", order: "Artiodactyla", family: "Bovidae", genus: "Bubalus", species: "Bubalus arnee" },
    needsResearch: false
  },

  // --- NEW EXPANDED BIRD SPECIES ---
  {
    slug: "great-hornbill",
    commonName: "Great Hornbill",
    scientificName: "Buceros bicornis",
    taxon: "bird",
    conservationStatus: "VU",
    description: "State bird of Kerala and Arunachal Pradesh, a magnificent canopy bird with a concave yellow casque.",
    habitat: "Dense canopy of primary tropical wet evergreen forests",
    stateSlugs: ["kerala", "arunachal-pradesh", "goa", "karnataka", "tamil-nadu", "assam"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Great_Hornbill_in_Valparai.jpg/960px-Great_Hornbill_in_Valparai.jpg",
    photoAttribution: { author: "Kalyan Varma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Great_Hornbill_in_Valparai.jpg" },
    sourceCitations: ["IUCN Red List", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Bucerotiformes", family: "Bucerotidae", genus: "Buceros", species: "Buceros bicornis" },
    needsResearch: false
  },
  {
    slug: "himalayan-monal",
    commonName: "Himalayan Monal",
    scientificName: "Lophophorus impejanus",
    taxon: "bird",
    conservationStatus: "LC",
    description: "Uttarakhand's state bird, displaying dazzling rainbow iridescent metallic plumage in males across high Himalayan oak forests.",
    habitat: "Subalpine oak-rhododendron forests and high alpine meadows",
    stateSlugs: ["uttarakhand", "himachal-pradesh", "jammu-and-kashmir", "sikkim", "arunachal-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Himalayan_Monal_male.jpg/960px-Himalayan_Monal_male.jpg",
    photoAttribution: { author: "Dr. Raju Kasambe", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Himalayan_Monal_male.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Galliformes", family: "Phasianidae", genus: "Lophophorus", species: "Lophophorus impejanus" },
    needsResearch: false
  },
  {
    slug: "sarus-crane",
    commonName: "Sarus Crane",
    scientificName: "Antigone antigone",
    taxon: "bird",
    conservationStatus: "VU",
    description: "The world's tallest flying bird, Uttar Pradesh's state bird, revered as a symbol of lifelong marital devotion.",
    habitat: "Natural freshwater marshes, flooded agricultural fields, shallow wetlands",
    stateSlugs: ["uttar-pradesh", "gujarat", "rajasthan", "madhya-pradesh", "haryana"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sarus_Crane_pair_in_Keoladeo.jpg/960px-Sarus_Crane_pair_in_Keoladeo.jpg",
    photoAttribution: { author: "Bernard Gagnon", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sarus_Crane_pair_in_Keoladeo.jpg" },
    sourceCitations: ["IUCN Red List", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Gruiformes", family: "Gruidae", genus: "Antigone", species: "Antigone antigone" },
    needsResearch: false
  },
  {
    slug: "greater-flamingo",
    commonName: "Greater Flamingo",
    scientificName: "Phoenicopterus roseus",
    taxon: "bird",
    conservationStatus: "LC",
    description: "Iconic pink waterbird congregating by tens of thousands in the Rann of Kutch for Asia's largest breeding colonies.",
    habitat: "Shallow saline lagoons, mudflats, salt pans, coastal estuaries",
    stateSlugs: ["gujarat", "tamil-nadu", "maharashtra", "odisha", "andhra-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Greater_Flamingo_Rann_of_Kutch.jpg/960px-Greater_Flamingo_Rann_of_Kutch.jpg",
    photoAttribution: { author: "Kalyan Varma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Greater_Flamingo_Rann_of_Kutch.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Phoenicopteriformes", family: "Phoenicopteridae", genus: "Phoenicopterus", species: "Phoenicopterus roseus" },
    needsResearch: false
  },
  {
    slug: "house-sparrow",
    commonName: "House Sparrow",
    scientificName: "Passer domesticus",
    taxon: "bird",
    conservationStatus: "LC",
    description: "State bird of Delhi, a familiar songbird whose conservation awareness is celebrated globally on World Sparrow Day.",
    habitat: "Human habitations, urban neighborhoods, agricultural villages",
    stateSlugs: ["delhi", "maharashtra", "uttar-pradesh", "rajasthan", "west-bengal", "punjab"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Passer_domesticus_male_1.jpg/960px-Passer_domesticus_male_1.jpg",
    photoAttribution: { author: "Julian Nyča", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Passer_domesticus_male_1.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Passeriformes", family: "Passeridae", genus: "Passer", species: "Passer domesticus" },
    worldAnimalDaySlug: "world-sparrow-day",
    needsResearch: false
  },
  {
    slug: "black-necked-crane",
    commonName: "Black-necked Crane",
    scientificName: "Grus nigricollis",
    taxon: "bird",
    conservationStatus: "VU",
    description: "State bird of Ladakh, sacred in Tibetan Buddhism, nesting near high-altitude trans-Himalayan lakes.",
    habitat: "Alpine trans-Himalayan wetlands, high-altitude lake shores (Tso Kar, Tso Moriri)",
    stateSlugs: ["ladakh", "jammu-and-kashmir", "arunachal-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Black-necked_Crane_Ladakh.jpg/960px-Black-necked_Crane_Ladakh.jpg",
    photoAttribution: { author: "Pradeep Vyas", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Black-necked_Crane_Ladakh.jpg" },
    sourceCitations: ["IUCN Red List", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Gruiformes", family: "Gruidae", genus: "Grus", species: "Grus nigricollis" },
    needsResearch: false
  },
  {
    slug: "malabar-pied-hornbill",
    commonName: "Malabar Pied Hornbill",
    scientificName: "Anthracoceros coronatus",
    taxon: "bird",
    conservationStatus: "NT",
    description: "A large frugivorous hornbill with a prominent yellow-and-black casque, inhabiting riverine evergreen forests.",
    habitat: "Moist deciduous and riverine evergreen forest",
    stateSlugs: ["goa", "karnataka", "kerala", "maharashtra", "odisha", "madhya-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Malabar_Pied_Hornbill_Dandeli.jpg/960px-Malabar_Pied_Hornbill_Dandeli.jpg",
    photoAttribution: { author: "Dr. Raju Kasambe", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Malabar_Pied_Hornbill_Dandeli.jpg" },
    sourceCitations: ["IUCN Red List", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Bucerotiformes", family: "Bucerotidae", genus: "Anthracoceros", species: "Anthracoceros coronatus" },
    needsResearch: false
  },
  {
    slug: "indian-vulture",
    commonName: "Indian Vulture",
    scientificName: "Gyps indicus",
    taxon: "bird",
    conservationStatus: "CR",
    description: "A critically endangered scavenger that suffered catastrophic declines due to diclofenac, now breeding on protected cliffs.",
    habitat: "Rocky hill cliffs, open countryside, near cattle carcasses",
    stateSlugs: ["rajasthan", "madhya-pradesh", "gujarat", "maharashtra", "karnataka"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Indian_Vulture_Gyps_indicus.jpg/960px-Indian_Vulture_Gyps_indicus.jpg",
    photoAttribution: { author: "Gorup de Besanez", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_Vulture_Gyps_indicus.jpg" },
    sourceCitations: ["IUCN Red List", "BNHS Vulture Conservation Programme"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Accipitriformes", family: "Accipitridae", genus: "Gyps", species: "Gyps indicus" },
    conservationEfforts: ["Vulture Safe Zones", "BNHS Breeding Centers"],
    needsResearch: false
  },
  {
    slug: "forest-owlet",
    commonName: "Forest Owlet",
    scientificName: "Athene blewitti",
    taxon: "bird",
    conservationStatus: "EN",
    description: "A small diurnal owlet rediscovered in 1997 after being thought extinct for over 113 years, living in Central India.",
    habitat: "Dry deciduous teak forests of Central India",
    stateSlugs: ["maharashtra", "madhya-pradesh", "gujarat"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Forest_Owlet_Melghat.jpg/960px-Forest_Owlet_Melghat.jpg",
    photoAttribution: { author: "Dr. Raju Kasambe", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Forest_Owlet_Melghat.jpg" },
    sourceCitations: ["IUCN Red List", "WRCS Forest Owlet Research"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Strigiformes", family: "Strigidae", genus: "Athene", species: "Athene blewitti" },
    needsResearch: false
  },
  {
    slug: "painted-stork",
    commonName: "Painted Stork",
    scientificName: "Mycteria leucocephala",
    taxon: "bird",
    conservationStatus: "NT",
    description: "A large wading bird with pink tertial feathers and bright yellow beak, nesting in dense colonies across Indian wetlands.",
    habitat: "Freshwater marshes, lakes, flooded fields, riverbanks",
    stateSlugs: ["rajasthan", "gujarat", "karnataka", "tamil-nadu", "delhi", "uttar-pradesh"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Painted_Stork_Keoladeo.jpg/960px-Painted_Stork_Keoladeo.jpg",
    photoAttribution: { author: "J.M.Garg", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Painted_Stork_Keoladeo.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Ciconiiformes", family: "Ciconiidae", genus: "Mycteria", species: "Mycteria leucocephala" },
    needsResearch: false
  },
  {
    slug: "bar-headed-goose",
    commonName: "Bar-headed Goose",
    scientificName: "Anser indicus",
    taxon: "bird",
    conservationStatus: "LC",
    description: "Famous high-altitude migrant capable of flying over Mount Everest during migration from Tibet to winter in India.",
    habitat: "High-altitude mountain lakes (summer), freshwater reservoirs and rivers (winter)",
    stateSlugs: ["ladakh", "himachal-pradesh", "karnataka", "rajasthan", "odisha", "west-bengal"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bar-headed_goose.jpg/960px-Bar-headed_goose.jpg",
    photoAttribution: { author: "Alan D. Wilson", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bar-headed_goose.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Anseriformes", family: "Anatidae", genus: "Anser", species: "Anser indicus" },
    needsResearch: false
  },
  {
    slug: "indian-roller",
    commonName: "Indian Roller",
    scientificName: "Coracias benghalensis",
    taxon: "bird",
    conservationStatus: "LC",
    description: "State bird of Odisha, Telangana, and Karnataka, famous for its striking electric-blue wings revealed during flight acrobatics.",
    habitat: "Open cultivated fields, dry forest edges, roadside trees",
    stateSlugs: ["odisha", "telangana", "karnataka", "andhra-pradesh", "madhya-pradesh", "rajasthan"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Indian_Roller_Coracias_benghalensis.jpg/960px-Indian_Roller_Coracias_benghalensis.jpg",
    photoAttribution: { author: "J.M.Garg", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_Roller_Coracias_benghalensis.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Coraciiformes", family: "Coraciidae", genus: "Coracias", species: "Coracias benghalensis" },
    needsResearch: false
  },
  {
    slug: "house-crow",
    commonName: "House Crow",
    scientificName: "Corvus splendens",
    taxon: "bird",
    conservationStatus: "LC",
    description: "An extraordinarily intelligent urban bird common across Indian towns, known for complex social behavior and problem solving.",
    habitat: "Urban cities, towns, villages, coastal settlements",
    stateSlugs: ["delhi", "maharashtra", "west-bengal", "tamil-nadu", "kerala", "gujarat"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/House_Crow_Corvus_splendens.jpg/960px-House_Crow_Corvus_splendens.jpg",
    photoAttribution: { author: "Tisha Mukherjee", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:House_Crow_Corvus_splendens.jpg" },
    sourceCitations: ["eBird India", "ZSI Avian Checklist"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Passeriformes", family: "Corvidae", genus: "Corvus", species: "Corvus splendens" },
    needsResearch: false
  },
  {
    slug: "malabar-whistling-thrush",
    commonName: "Malabar Whistling Thrush",
    scientificName: "Myophonus horsfieldii",
    taxon: "bird",
    conservationStatus: "LC",
    description: "Affectionately called the 'Whistling Schoolboy' due to its musical human-like whistling song heard at dawn along Western Ghats streams.",
    habitat: "Rocky forest streams, damp ravines, dark understory of Western Ghats",
    stateSlugs: ["kerala", "karnataka", "tamil-nadu", "goa", "maharashtra"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Malabar_Whistling_Thrush_Valparai.jpg/960px-Malabar_Whistling_Thrush_Valparai.jpg",
    photoAttribution: { author: "Kalyan Varma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Malabar_Whistling_Thrush_Valparai.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Passeriformes", family: "Muscicapidae", genus: "Myophonus", species: "Myophonus horsfieldii" },
    needsResearch: false
  },
  {
    slug: "indian-pitta",
    commonName: "Indian Pitta",
    scientificName: "Pitta brachyura",
    taxon: "bird",
    conservationStatus: "LC",
    description: "A colorful floor-dwelling jewel bird featuring nine distinct colors on its body, migrating seasonally between North and South India.",
    habitat: "Moist deciduous forest floor, dense scrub undergrowth, shaded gardens",
    stateSlugs: ["kerala", "karnataka", "tamil-nadu", "madhya-pradesh", "odisha", "west-bengal"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Indian_Pitta_Pitta_brachyura.jpg/960px-Indian_Pitta_Pitta_brachyura.jpg",
    photoAttribution: { author: "J.M.Garg", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_Pitta_Pitta_brachyura.jpg" },
    sourceCitations: ["eBird India", "State of India's Birds 2023"],
    taxonClassification: { kingdom: "Animalia", phylum: "Chordata", class: "Aves", order: "Passeriformes", family: "Pittidae", genus: "Pitta", species: "Pitta brachyura" },
    needsResearch: false
  }
];

// All 36 States and Union Territories of India
const STATES: State[] = [
  { slug: "andaman-and-nicobar-islands", name: "Andaman & Nicobar", dominantSpeciesSlug: "narcondam-hornbill", speciesSlugs: ["narcondam-hornbill", "nicobar-long-tailed-macaque"], lat: 11.7401, lng: 92.6586 },
  { slug: "andhra-pradesh", name: "Andhra Pradesh", dominantSpeciesSlug: "blackbuck", speciesSlugs: ["blackbuck", "slender-loris", "greater-flamingo", "indian-roller"], lat: 15.9129, lng: 79.7400 },
  { slug: "arunachal-pradesh", name: "Arunachal Pradesh", dominantSpeciesSlug: "great-hornbill", speciesSlugs: ["great-hornbill", "red-panda", "snow-leopard", "hoolock-gibbon", "clouded-leopard"], lat: 28.2180, lng: 94.7278 },
  { slug: "assam", name: "Assam", dominantSpeciesSlug: "indian-rhinoceros", speciesSlugs: ["indian-rhinoceros", "asian-elephant", "hoolock-gibbon", "golden-langur", "royal-bengal-tiger", "wild-water-buffalo"], lat: 26.2006, lng: 92.9376 },
  { slug: "bihar", name: "Bihar", dominantSpeciesSlug: "indian-rhinoceros", speciesSlugs: ["indian-rhinoceros", "royal-bengal-tiger", "asian-elephant"], lat: 25.0961, lng: 85.3131 },
  { slug: "chandigarh", name: "Chandigarh", dominantSpeciesSlug: "indian-peafowl", speciesSlugs: ["indian-peafowl", "house-sparrow"], lat: 30.7333, lng: 76.7794 },
  { slug: "chhattisgarh", name: "Chhattisgarh", dominantSpeciesSlug: "wild-water-buffalo", speciesSlugs: ["wild-water-buffalo", "royal-bengal-tiger", "sloth-bear"], lat: 21.2787, lng: 81.8661 },
  { slug: "dadra-and-nagar-haveli-and-daman-and-diu", name: "Dadra & Nagar Haveli and Daman & Diu", dominantSpeciesSlug: "greater-flamingo", speciesSlugs: ["greater-flamingo", "indian-leopard"], lat: 20.3974, lng: 72.8328 },
  { slug: "delhi", name: "Delhi", dominantSpeciesSlug: "house-sparrow", speciesSlugs: ["house-sparrow", "nilgai", "hanuman-langur", "painted-stork", "house-crow"], lat: 28.7041, lng: 77.1025 },
  { slug: "goa", name: "Goa", dominantSpeciesSlug: "gaur", speciesSlugs: ["gaur", "great-hornbill", "malabar-pied-hornbill", "malabar-whistling-thrush", "smooth-coated-otter"], lat: 15.2993, lng: 74.1240 },
  { slug: "gujarat", name: "Gujarat", dominantSpeciesSlug: "asiatic-lion", speciesSlugs: ["asiatic-lion", "greater-flamingo", "indian-wild-ass", "blackbuck", "chinkara", "sarus-crane"], lat: 22.2587, lng: 71.1924 },
  { slug: "haryana", name: "Haryana", dominantSpeciesSlug: "blackbuck", speciesSlugs: ["blackbuck", "indian-peafowl", "nilgai", "chinkara", "sarus-crane"], lat: 29.0588, lng: 76.0856 },
  { slug: "himachal-pradesh", name: "Himachal Pradesh", dominantSpeciesSlug: "himalayan-monal", speciesSlugs: ["himalayan-monal", "snow-leopard", "indian-leopard", "bar-headed-goose"], lat: 31.1048, lng: 77.1734 },
  { slug: "jammu-and-kashmir", name: "Jammu & Kashmir", dominantSpeciesSlug: "hangul", speciesSlugs: ["hangul", "snow-leopard", "black-necked-crane", "himalayan-monal"], lat: 33.7782, lng: 76.5762 },
  { slug: "jharkhand", name: "Jharkhand", dominantSpeciesSlug: "asian-elephant", speciesSlugs: ["asian-elephant", "royal-bengal-tiger", "sloth-bear"], lat: 23.6102, lng: 85.2799 },
  { slug: "karnataka", name: "Karnataka", dominantSpeciesSlug: "lion-tailed-macaque", speciesSlugs: ["lion-tailed-macaque", "asian-elephant", "gaur", "dhole", "indian-giant-squirrel", "indian-roller"], lat: 15.3173, lng: 75.7139 },
  { slug: "kerala", name: "Kerala", dominantSpeciesSlug: "asian-elephant", speciesSlugs: ["asian-elephant", "nilgiri-tahr", "lion-tailed-macaque", "great-hornbill", "malabar-whistling-thrush", "gaur"], lat: 10.8505, lng: 76.2711 },
  { slug: "ladakh", name: "Ladakh", dominantSpeciesSlug: "snow-leopard", speciesSlugs: ["snow-leopard", "black-necked-crane", "bar-headed-goose"], lat: 34.1526, lng: 77.5771 },
  { slug: "lakshadweep", name: "Lakshadweep", dominantSpeciesSlug: "greater-flamingo", speciesSlugs: ["greater-flamingo"], lat: 10.5667, lng: 72.6417 },
  { slug: "madhya-pradesh", name: "Madhya Pradesh", dominantSpeciesSlug: "barasingha", speciesSlugs: ["barasingha", "royal-bengal-tiger", "cheetah", "sloth-bear", "indian-leopard", "chital"], lat: 22.9734, lng: 78.6569 },
  { slug: "maharashtra", name: "Maharashtra", dominantSpeciesSlug: "indian-giant-squirrel", speciesSlugs: ["indian-giant-squirrel", "royal-bengal-tiger", "indian-leopard", "forest-owlet", "sloth-bear"], lat: 19.7515, lng: 75.7139 },
  { slug: "manipur", name: "Manipur", dominantSpeciesSlug: "sangai", speciesSlugs: ["sangai", "hoolock-gibbon"], lat: 24.6637, lng: 93.9063 },
  { slug: "meghalaya", name: "Meghalaya", dominantSpeciesSlug: "clouded-leopard", speciesSlugs: ["clouded-leopard", "hoolock-gibbon", "capped-langur", "red-panda"], lat: 25.4670, lng: 91.3662 },
  { slug: "mizoram", name: "Mizoram", dominantSpeciesSlug: "hoolock-gibbon", speciesSlugs: ["hoolock-gibbon", "clouded-leopard", "capped-langur"], lat: 23.1645, lng: 92.9376 },
  { slug: "nagaland", name: "Nagaland", dominantSpeciesSlug: "hoolock-gibbon", speciesSlugs: ["hoolock-gibbon", "capped-langur"], lat: 26.1584, lng: 94.5624 },
  { slug: "odisha", name: "Odisha", dominantSpeciesSlug: "sambar-deer", speciesSlugs: ["sambar-deer", "indian-roller", "asian-elephant", "smooth-coated-otter", "greater-flamingo"], lat: 20.9517, lng: 85.0985 },
  { slug: "puducherry", name: "Puducherry", dominantSpeciesSlug: "indian-peafowl", speciesSlugs: ["indian-peafowl"], lat: 11.9416, lng: 79.8083 },
  { slug: "punjab", name: "Punjab", dominantSpeciesSlug: "blackbuck", speciesSlugs: ["blackbuck", "indian-peafowl", "chinkara", "golden-jackal"], lat: 31.1471, lng: 75.3412 },
  { slug: "rajasthan", name: "Rajasthan", dominantSpeciesSlug: "great-indian-bustard", speciesSlugs: ["great-indian-bustard", "royal-bengal-tiger", "indian-eagle-owl", "chinkara", "sarus-crane", "indian-vulture"], lat: 27.0238, lng: 74.2179 },
  { slug: "sikkim", name: "Sikkim", dominantSpeciesSlug: "red-panda", speciesSlugs: ["red-panda", "snow-leopard", "himalayan-monal"], lat: 27.5330, lng: 88.5122 },
  { slug: "tamil-nadu", name: "Tamil Nadu", dominantSpeciesSlug: "nilgiri-tahr", speciesSlugs: ["nilgiri-tahr", "asian-elephant", "lion-tailed-macaque", "slender-loris", "painted-stork"], lat: 11.1271, lng: 78.6569 },
  { slug: "telangana", name: "Telangana", dominantSpeciesSlug: "indian-roller", speciesSlugs: ["indian-roller", "blackbuck", "royal-bengal-tiger", "striped-hyena"], lat: 18.1124, lng: 79.0193 },
  { slug: "tripura", name: "Tripura", dominantSpeciesSlug: "clouded-leopard", speciesSlugs: ["clouded-leopard", "capped-langur"], lat: 23.9408, lng: 91.9882 },
  { slug: "uttar-pradesh", name: "Uttar Pradesh", dominantSpeciesSlug: "sarus-crane", speciesSlugs: ["sarus-crane", "barasingha", "indian-rhinoceros", "nilgai", "painted-stork"], lat: 26.8467, lng: 80.9462 },
  { slug: "uttarakhand", name: "Uttarakhand", dominantSpeciesSlug: "himalayan-monal", speciesSlugs: ["himalayan-monal", "royal-bengal-tiger", "snow-leopard", "indian-leopard", "asian-elephant"], lat: 30.0668, lng: 79.0193 },
  { slug: "west-bengal", name: "West Bengal", dominantSpeciesSlug: "royal-bengal-tiger", speciesSlugs: ["royal-bengal-tiger", "indian-rhinoceros", "red-panda", "smooth-coated-otter"], lat: 22.9868, lng: 87.8550 }
];

// Generate Country Markers for all states
const speciesMarkers = STATES.map((s) => ({
  speciesSlug: s.dominantSpeciesSlug,
  stateSlug: s.slug,
  lat: s.lat,
  lng: s.lng,
}));

// Load existing protected area markers from current country.json
const currentCountryJson: MarkerTier = JSON.parse(readFileSync(path.join(DATA_DIR, "markers", "country.json"), "utf-8"));
const countryMarkers: MarkerTier = {
  tier: "country",
  speciesMarkers,
  protectedAreaMarkers: currentCountryJson.protectedAreaMarkers || [],
};

// Fun Facts with linked species slugs
const FUN_FACTS: FunFact[] = [
  { animal: "Bengal Tiger", taxon: "mammal", fact: "Bengal tigers have striped skin, not just striped fur — the pattern is unique to each individual like a fingerprint. India holds roughly 70% of the world's wild tiger population.", wikipediaUrl: "https://en.wikipedia.org/wiki/Bengal_tiger", speciesSlug: "royal-bengal-tiger" },
  { animal: "Indian (Asian) Elephant", taxon: "mammal", fact: "Asian elephants are one of the few animals known to mourn their dead, sometimes standing vigil over a deceased herd member's remains for days.", wikipediaUrl: "https://en.wikipedia.org/wiki/Indian_elephant", speciesSlug: "asian-elephant" },
  { animal: "Asiatic Lion", taxon: "mammal", fact: "The Asiatic lion survives in the wild only in Gir Forest, Gujarat — the last population of this subspecies anywhere outside Africa.", wikipediaUrl: "https://en.wikipedia.org/wiki/Asiatic_lion", speciesSlug: "asiatic-lion" },
  { animal: "Cheetah", taxon: "mammal", fact: "India reintroduced cheetahs in 2022 at Kuno National Park, over 70 years after the species was declared extinct in the country.", wikipediaUrl: "https://en.wikipedia.org/wiki/Cheetah_reintroduction_in_India", speciesSlug: "cheetah" },
  { animal: "Indian Peafowl", taxon: "bird", fact: "The Indian peacock, India's national bird, can't fly far — its train feathers are heavy, so it relies on short bursts to escape predators.", wikipediaUrl: "https://en.wikipedia.org/wiki/Indian_peafowl", speciesSlug: "indian-peafowl" },
  { animal: "Greater Flamingo", taxon: "bird", fact: "Greater flamingos flock by the thousands to the Rann of Kutch in Gujarat, one of the largest flamingo breeding grounds in Asia.", wikipediaUrl: "https://en.wikipedia.org/wiki/Greater_flamingo", speciesSlug: "greater-flamingo" },
  { animal: "Indian Rhinoceros", taxon: "mammal", fact: "The great Indian one-horned rhinoceros has skin so thick and armor-like it looks like natural plating — yet soft enough to be prone to sunburn.", wikipediaUrl: "https://en.wikipedia.org/wiki/Indian_rhinoceros", speciesSlug: "indian-rhinoceros" },
  { animal: "House Crow", taxon: "bird", fact: "House crows can recognize individual human faces and hold long-standing grudges, passing recognition on to other crows.", wikipediaUrl: "https://en.wikipedia.org/wiki/House_crow", speciesSlug: "house-crow" },
  { animal: "Sloth Bear", taxon: "mammal", fact: "The sloth bear uses its long lower lip and gap-toothed mouth like a vacuum cleaner to noisily suck up termites and ants.", wikipediaUrl: "https://en.wikipedia.org/wiki/Sloth_bear", speciesSlug: "sloth-bear" },
  { animal: "Sarus Crane", taxon: "bird", fact: "Sarus cranes, the tallest flying birds in the world, mate for life and are revered in Indian folklore as a symbol of marital devotion.", wikipediaUrl: "https://en.wikipedia.org/wiki/Sarus_crane", speciesSlug: "sarus-crane" }
];

// World Animal Days
const WORLD_ANIMAL_DAYS: WorldAnimalDay[] = [
  { slug: "international-tiger-day", name: "International Tiger Day", date: "07-29", animal: "Tiger", taxon: "mammal", description: "Established in 2010 to raise awareness of wild tiger conservation. India holds ~70% of wild tigers.", speciesSlug: "royal-bengal-tiger", wikipediaUrl: "https://en.wikipedia.org/wiki/International_Tiger_Day" },
  { slug: "world-lion-day", name: "World Lion Day", date: "08-10", animal: "Lion", taxon: "mammal", description: "In India, spotlights the Asiatic lion surviving in Gujarat's Gir Forest.", speciesSlug: "asiatic-lion", wikipediaUrl: "https://en.wikipedia.org/wiki/World_Lion_Day" },
  { slug: "world-elephant-day", name: "World Elephant Day", date: "08-12", animal: "Elephant", taxon: "mammal", description: "Spotlights threats facing Asian and African elephants, including habitat loss and human-elephant conflict.", speciesSlug: "asian-elephant", wikipediaUrl: "https://en.wikipedia.org/wiki/World_Elephant_Day" },
  { slug: "world-rhino-day", name: "World Rhino Day", date: "09-22", animal: "Rhinoceros", taxon: "mammal", description: "Celebrates all five rhino species; in India centers on the one-horned rhino.", speciesSlug: "indian-rhinoceros", wikipediaUrl: "https://en.wikipedia.org/wiki/World_Rhino_Day" },
  { slug: "world-sparrow-day", name: "World Sparrow Day", date: "03-20", animal: "House Sparrow", taxon: "bird", description: "Started by Nature Forever Society in Nashik, India, to raise awareness of house sparrows and common birds.", speciesSlug: "house-sparrow", wikipediaUrl: "https://en.wikipedia.org/wiki/World_Sparrow_Day" }
];

// Build species density mapping for map hotspot overlay
const stateCoords = new Map(STATES.map(s => [s.slug, { lat: s.lat, lng: s.lng }]));
const SPECIES_DENSITY: SpeciesDensityMap = {};

for (const sp of SPECIES) {
  const cells = [];
  for (const stSlug of sp.stateSlugs) {
    const coord = stateCoords.get(stSlug);
    if (coord) {
      cells.push({
        minLng: Number((coord.lng - 0.75).toFixed(4)),
        minLat: Number((coord.lat - 0.75).toFixed(4)),
        maxLng: Number((coord.lng + 0.75).toFixed(4)),
        maxLat: Number((coord.lat + 0.75).toFixed(4)),
        level: 2 as const,
      });
    }
  }
  if (cells.length > 0) {
    SPECIES_DENSITY[sp.slug] = cells;
  }
}

// Write compiled JSON files
writeFileSync(path.join(DATA_DIR, "species.json"), JSON.stringify(SPECIES, null, 2));
console.log(`Wrote ${SPECIES.length} species to species.json`);

writeFileSync(path.join(DATA_DIR, "states.json"), JSON.stringify(STATES, null, 2));
console.log(`Wrote ${STATES.length} states to states.json`);

writeFileSync(path.join(DATA_DIR, "markers", "country.json"), JSON.stringify(countryMarkers, null, 2));
console.log(`Wrote ${countryMarkers.speciesMarkers.length} country species markers`);

writeFileSync(path.join(DATA_DIR, "fun-facts.json"), JSON.stringify(FUN_FACTS, null, 2));
console.log(`Wrote ${FUN_FACTS.length} fun facts`);

writeFileSync(path.join(DATA_DIR, "world-animal-days.json"), JSON.stringify(WORLD_ANIMAL_DAYS, null, 2));
console.log(`Wrote ${WORLD_ANIMAL_DAYS.length} world animal days`);

writeFileSync(path.join(DATA_DIR, "species-density.json"), JSON.stringify(SPECIES_DENSITY, null, 2));
console.log(`Wrote density map for ${Object.keys(SPECIES_DENSITY).length} species`);

// Update mockIcons.ts for fallback emojis
const mockIconsPath = path.join(process.cwd(), "src", "lib", "mockIcons.ts");
const iconMapContent = `export const SPECIES_ICON: Record<string, string> = {\n` +
  SPECIES.map(s => {
    let icon = "🐾";
    if (s.taxon === "bird") icon = "🦅";
    if (s.slug.includes("tiger") || s.slug.includes("cat")) icon = "🐅";
    if (s.slug.includes("lion")) icon = "🦁";
    if (s.slug.includes("leopard")) icon = "🐆";
    if (s.slug.includes("bear")) icon = "🐻";
    if (s.slug.includes("elephant")) icon = "🐘";
    if (s.slug.includes("rhino")) icon = "🦏";
    if (s.slug.includes("deer") || s.slug.includes("tahr") || s.slug.includes("barasingha") || s.slug.includes("sangai")) icon = "🦌";
    if (s.slug.includes("macaque") || s.slug.includes("gibbon") || s.slug.includes("langur") || s.slug.includes("loris")) icon = "🐒";
    if (s.slug.includes("squirrel")) icon = "🐿️";
    if (s.slug.includes("owl")) icon = "🦉";
    if (s.slug.includes("peafowl")) icon = "🦚";
    if (s.slug.includes("hornbill")) icon = "🐦";
    if (s.slug.includes("crane") || s.slug.includes("stork") || s.slug.includes("flamingo")) icon = "🦩";
    if (s.slug.includes("sparrow") || s.slug.includes("crow") || s.slug.includes("thrush") || s.slug.includes("pitta") || s.slug.includes("roller")) icon = "🐦";
    return `  "${s.slug}": "${icon}",`;
  }).join("\n") +
  `\n};\n\nexport const DEFAULT_SPECIES_ICON = "🐾";\n\nexport const PROTECTED_AREA_ICON: Record<string, string> = {\n  "national-park": "🌲",\n  "wildlife-sanctuary": "🏕️",\n  "bird-sanctuary": "🪶",\n};\n\nexport const ZOO_ICON = "🏛️";\n`;

writeFileSync(mockIconsPath, iconMapContent);
console.log("Updated src/lib/mockIcons.ts");

// Update _todo.md research log
const todoContent = `# India Wildlife Dataset — Research Tracking Log (_todo.md)\n\nTotal Sourced Species: ${SPECIES.length}\n\n## Species List\n` +
  SPECIES.map(s => `- [x] ${s.commonName} (\`${s.slug}\`) — ${s.taxon.toUpperCase()}, ${s.conservationStatus} status, ${s.sourceCitations.join(", ")}`).join("\n") +
  `\n`;

writeFileSync(path.join(process.cwd(), "_todo.md"), todoContent);
console.log("Updated _todo.md");
