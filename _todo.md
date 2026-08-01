# India Wildlife Dataset — Research Tracking Log (_todo.md)

Total Sourced Species: 49

## Public-access pass (`visitingHours.publicAccess`) — 2026-07-31

Filled `publicAccess`/`accessNotes` for all 144 park/sanctuary/zoo entries (105 national parks + 31 sanctuaries + 8 zoos).

- **Individually researched exceptions** (10 entries, each with its own dedicated source in `sources`): `nanda-devi-national-park`, `campbell-bay-national-park`, `galathea-bay-national-park` (all `"restricted"`); `namdapha-national-park`, `mouling-national-park`, `ntangki-national-park`, `murlen-national-park`, `phawngpui-blue-mountain-national-park`, `keibul-lamjao-national-park`, `gahirmatha-marine-sanctuary` (all `"permit-required"`, mostly state Inner Line Permit regimes).
- **Remaining 134 entries** default to `"open"`, reusing each entry's existing `sources` entry (state forest department / WII / official portal already on record) as the citation. This default was **not individually re-verified per park** against a source that explicitly states "open to the public" — it reflects the general, well-documented policy that Indian national parks/sanctuaries operate on a standard public safari/eco-tourism entry model, and the fact that most entries already link to a live state forest department visitor/booking portal. Flagging here per the dataset guardrails so this is legible as a reasoned default, not an independently sourced fact for all 134.
- **Not covered by this pass**: seasonal monsoon closures (many parks, e.g. Kaziranga/Ranthambore/Gir, close ~Jul–Oct) — that's a separate `closedSeason` field, still empty for all entries and out of scope for this pass.
- If a specific park's public-access status is challenged or turns out wrong, re-verify against that state's forest department site directly rather than trusting the "open" default.

## Species List
- [x] Royal Bengal Tiger (`royal-bengal-tiger`) — MAMMAL, EN status, IUCN Red List of Threatened Species, Status of Tigers in India 2022 (NTCA/WII)
- [x] Asiatic Lion (`asiatic-lion`) — MAMMAL, EN status, IUCN Red List of Threatened Species, Gujarat Forest Department Census
- [x] Indian Rhinoceros (`indian-rhinoceros`) — MAMMAL, VU status, IUCN Red List, Assam Forest Department Rhinoceros Census
- [x] Asian Elephant (`asian-elephant`) — MAMMAL, EN status, IUCN Red List, Project Elephant Status Report
- [x] Lion-tailed Macaque (`lion-tailed-macaque`) — MAMMAL, EN status, IUCN Red List, Western Ghats Biodiversity Monitoring
- [x] Great Indian Bustard (`great-indian-bustard`) — BIRD, CR status, IUCN Red List, State of India's Birds 2023
- [x] Barasingha (`barasingha`) — MAMMAL, VU status, IUCN Red List, WII Species Recovery Plan
- [x] Indian Giant Squirrel (`indian-giant-squirrel`) — MAMMAL, LC status, IUCN Red List, ZSI State Fauna Series
- [x] Indian Eagle-Owl (`indian-eagle-owl`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] Indian Peafowl (`indian-peafowl`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] Narcondam Hornbill (`narcondam-hornbill`) — BIRD, VU status, IUCN Red List, State of India's Birds 2023
- [x] Nicobar Long-tailed Macaque (`nicobar-long-tailed-macaque`) — MAMMAL, VU status, IUCN Red List, ZSI Andaman & Nicobar Survey
- [x] Snow Leopard (`snow-leopard`) — MAMMAL, VU status, IUCN Red List, Project Snow Leopard Assessment (MoEFCC)
- [x] Sloth Bear (`sloth-bear`) — MAMMAL, VU status, IUCN Red List, WII Bear Study
- [x] Indian Leopard (`indian-leopard`) — MAMMAL, VU status, IUCN Red List, Status of Leopards in India 2022
- [x] Cheetah (`cheetah`) — MAMMAL, VU status, Project Cheetah Action Plan (MoEFCC/WII), IUCN Red List
- [x] Nilgiri Tahr (`nilgiri-tahr`) — MAMMAL, EN status, IUCN Red List, Project Nilgiri Tahr (Tamil Nadu Forest Dept)
- [x] Sangai (Brow-antlered Deer) (`sangai`) — MAMMAL, EN status, IUCN Red List, Manipur Forest Department Census
- [x] Red Panda (`red-panda`) — MAMMAL, EN status, IUCN Red List, WWF-India Red Panda Conservation
- [x] Gaur (Indian Bison) (`gaur`) — MAMMAL, VU status, IUCN Red List, ZSI Fauna of Western Ghats
- [x] Hoolock Gibbon (`hoolock-gibbon`) — MAMMAL, EN status, IUCN Red List, Aaranyak Primate Census
- [x] Clouded Leopard (`clouded-leopard`) — MAMMAL, VU status, IUCN Red List, MoEFCC Northeast Wildlife Survey
- [x] Blackbuck (`blackbuck`) — MAMMAL, LC status, IUCN Red List, Velavadar Blackbuck Census
- [x] Chital (Spotted Deer) (`chital`) — MAMMAL, LC status, IUCN Red List, NTCA Herbivore Monitoring
- [x] Sambar Deer (`sambar-deer`) — MAMMAL, VU status, IUCN Red List, ZSI Indian Wildlife Studies
- [x] Hangul (Kashmir Stag) (`hangul`) — MAMMAL, CR status, IUCN Red List, J&K Wildlife Department Census
- [x] Dhole (Indian Wild Dog) (`dhole`) — MAMMAL, EN status, IUCN Red List, WII Canid Specialist Group
- [x] Indian Gray Wolf (`indian-gray-wolf`) — MAMMAL, VU status, IUCN Red List, WII Wolf Conservation Project
- [x] Golden Jackal (`golden-jackal`) — MAMMAL, LC status, IUCN Red List, ZSI Fauna Series
- [x] Striped Hyena (`striped-hyena`) — MAMMAL, NT status, IUCN Red List, WII Small Carnivore Survey
- [x] Nilgai (Blue Bull) (`nilgai`) — MAMMAL, LC status, IUCN Red List, ZSI Mammalia Checklist
- [x] Chinkara (Indian Gazelle) (`chinkara`) — MAMMAL, LC status, IUCN Red List, Arid Zone Research Institute Studies
- [x] Indian Wild Ass (Khur) (`indian-wild-ass`) — MAMMAL, NT status, IUCN Red List, Gujarat Forest Department Wild Ass Census
- [x] Wild Water Buffalo (`wild-water-buffalo`) — MAMMAL, EN status, IUCN Red List, WII Wild Buffalo Conservation Plan
- [x] Great Hornbill (`great-hornbill`) — BIRD, VU status, IUCN Red List, State of India's Birds 2023
- [x] Himalayan Monal (`himalayan-monal`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] Sarus Crane (`sarus-crane`) — BIRD, VU status, IUCN Red List, State of India's Birds 2023
- [x] Greater Flamingo (`greater-flamingo`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] House Sparrow (`house-sparrow`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] Black-necked Crane (`black-necked-crane`) — BIRD, VU status, IUCN Red List, State of India's Birds 2023
- [x] Malabar Pied Hornbill (`malabar-pied-hornbill`) — BIRD, NT status, IUCN Red List, State of India's Birds 2023
- [x] Indian Vulture (`indian-vulture`) — BIRD, CR status, IUCN Red List, BNHS Vulture Conservation Programme
- [x] Forest Owlet (`forest-owlet`) — BIRD, EN status, IUCN Red List, WRCS Forest Owlet Research
- [x] Painted Stork (`painted-stork`) — BIRD, NT status, eBird India, State of India's Birds 2023
- [x] Bar-headed Goose (`bar-headed-goose`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] Indian Roller (`indian-roller`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] House Crow (`house-crow`) — BIRD, LC status, eBird India, ZSI Avian Checklist
- [x] Malabar Whistling Thrush (`malabar-whistling-thrush`) — BIRD, LC status, eBird India, State of India's Birds 2023
- [x] Indian Pitta (`indian-pitta`) — BIRD, LC status, eBird India, State of India's Birds 2023
