"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Species } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, SPECIES_ICON } from "@/lib/mockIcons";
import { useSearch } from "@/components/SearchProvider/SearchProvider";

const STORAGE_KEY = "wildatlas-explore-dismissed";

// Curated quick-start species (PRD Section 4.0). Editorially curated, not
// data-driven — just which species.json entries to feature, so the photo
// itself stays a single source of truth. The wireframe's fourth entry was
// a cobra — reptiles are out of Phase 1 scope (project CLAUDE.md), so it's
// swapped for the Indian Peafowl (India's national bird) here instead.
//
// Floats over the map (like WelcomeCard) rather than a docked sidebar, so
// the map can use the full viewport width — dismissible the same way.
const CURATED_SLUGS: Array<{ speciesSlug: string; label: string }> = [
  { speciesSlug: "royal-bengal-tiger", label: "Tigers" },
  { speciesSlug: "asian-elephant", label: "Elephants" },
  { speciesSlug: "indian-eagle-owl", label: "Owls" },
  { speciesSlug: "indian-peafowl", label: "Peafowl" },
];

export default function ExploreRail({ species }: { species: Species[] }) {
  const [dismissed, setDismissed] = useState(true);
  const { setQuery } = useSearch();

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (dismissed) return null;

  const speciesBySlug = new Map(species.map((s) => [s.slug, s]));

  return (
    // top-24, not top-6 — TopNav now floats fixed over the map (h-16) rather
    // than sitting in its own row above it, so this needs to clear it.
    <div className="absolute left-6 top-24 w-40 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
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
        {CURATED_SLUGS.map((entry) => {
          const item = speciesBySlug.get(entry.speciesSlug);
          return (
            <li key={entry.speciesSlug}>
              <Link
                href={`/species/${entry.speciesSlug}`}
                onClick={() => setQuery(item?.commonName ?? entry.label)}
                className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 text-lg">
                  {item?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photoUrl}
                      alt={item.commonName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    SPECIES_ICON[entry.speciesSlug] ?? DEFAULT_SPECIES_ICON
                  )}
                </span>
                <span className="text-sm text-zinc-900">{entry.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
