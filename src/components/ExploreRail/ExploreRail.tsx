"use client";

import { IconButton } from "@/design-system";

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
    <div className="absolute left-6 top-24 w-48 rounded-[22px] border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-2xl transition-all duration-200 ease-ios">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800">Explore</p>
        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Dismiss explore menu"
          icon={<X className="h-3.5 w-3.5" />}
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        />
      </div>
      <ul className="flex flex-col gap-2.5">
        {CURATED_SLUGS.map((entry) => {
          const item = speciesBySlug.get(entry.speciesSlug);
          return (
            <li key={entry.speciesSlug}>
              <Link
                href={`/species/${entry.speciesSlug}`}
                replace
                onClick={() => setQuery(item?.commonName ?? entry.label)}
                className="group flex items-center gap-3 p-1.5 rounded-xl hover:bg-zinc-100/70 active:scale-95 transition-all duration-150 ease-ios"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-zinc-100 text-lg shadow-2xs group-hover:scale-105 transition-transform duration-200 ease-ios">
                  {item?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photoUrl}
                      alt={item.commonName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{SPECIES_ICON[entry.speciesSlug] ?? DEFAULT_SPECIES_ICON}</span>
                  )}
                </span>
                <span className="text-xs font-semibold text-zinc-900 leading-tight">
                  {entry.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/species"
        className="mt-3 block border-t border-zinc-200/60 pt-2.5 text-center text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors duration-150 ease-ios"
      >
        See all species &rarr;
      </Link>
    </div>
  );
}
