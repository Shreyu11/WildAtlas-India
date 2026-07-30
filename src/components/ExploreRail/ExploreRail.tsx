"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Species } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, SPECIES_ICON } from "@/lib/mockIcons";
import { useSearch } from "@/components/SearchProvider/SearchProvider";

const STORAGE_KEY = "wildatlas-explore-dismissed";

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
    <div className="absolute left-6 top-24 w-44 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-700">Explore</p>
        <button
          type="button"
          aria-label="Dismiss explore menu"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
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
