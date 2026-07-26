"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPECIES_ICON } from "@/lib/mockIcons";

const STORAGE_KEY = "wildatlas-explore-dismissed";

// Curated quick-start species (PRD Section 4.0). Editorially curated, not
// data-driven. The wireframe's fourth entry was a cobra — reptiles are out
// of Phase 1 scope (project CLAUDE.md), so it's swapped for the Indian
// Peafowl (India's national bird) here instead.
//
// Floats over the map (like WelcomeCard) rather than a docked sidebar, so
// the map can use the full viewport width — dismissible the same way.
const CURATED_ENTRIES: Array<{ speciesSlug: string; label: string }> = [
  { speciesSlug: "royal-bengal-tiger", label: "Tigers" },
  { speciesSlug: "asian-elephant", label: "Elephants" },
  { speciesSlug: "indian-eagle-owl", label: "Owls" },
  { speciesSlug: "indian-peafowl", label: "Peafowl" },
];

export default function ExploreRail() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (dismissed) return null;

  return (
    <div className="absolute left-6 top-6 w-40 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-500">Explore →</p>
        <button
          type="button"
          aria-label="Dismiss explore menu"
          className="text-zinc-400 hover:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        >
          ✕
        </button>
      </div>
      <ul className="flex flex-col gap-4">
        {CURATED_ENTRIES.map((entry) => (
          <li key={entry.speciesSlug}>
            <Link
              href={`/species/${entry.speciesSlug}`}
              className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-lg">
                {SPECIES_ICON[entry.speciesSlug]}
              </span>
              <span className="text-sm">{entry.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
