// Illustrated-icon fallback per species (PRD Section 4.4 — used when no
// rights-cleared photo exists, which is every mock species right now).
// Replace with real photoUrl-driven circular photo crops once the pipeline
// sources rights-cleared images.
export const SPECIES_ICON: Record<string, string> = {
  "royal-bengal-tiger": "🐅",
  "asiatic-lion": "🦁",
  "indian-rhinoceros": "🦏",
  "asian-elephant": "🐘",
  "lion-tailed-macaque": "🐒",
  "great-indian-bustard": "🦤",
  barasingha: "🦌",
  "indian-giant-squirrel": "🐿️",
  "indian-eagle-owl": "🦉",
  "indian-peafowl": "🦚",
};

export const DEFAULT_SPECIES_ICON = "🐾";

// Deliberately non-animal-specific glyphs so protected-area pins never read
// as a species marker (PRD 4.5 — the two marker types must never be
// visually conflated).
export const PROTECTED_AREA_ICON: Record<string, string> = {
  "national-park": "🌲",
  "wildlife-sanctuary": "🏕️",
  "bird-sanctuary": "🪶",
};
