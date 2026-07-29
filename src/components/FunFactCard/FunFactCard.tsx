"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FunFact, Species } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, SPECIES_ICON } from "@/lib/mockIcons";

const STORAGE_PREFIX = "wildatlas-funfact-dismissed-";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// Deterministic "fact of the day" rather than random, so the pick is stable
// across a reload/re-render on the same day and only changes once per day
// (dismissal is keyed by date, so a new fact reappears tomorrow).
function pickFactOfTheDay(facts: FunFact[]): FunFact | undefined {
  if (facts.length === 0) return undefined;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return facts[dayOfYear % facts.length];
}

// Floating, dismissible card (top-right, below TopNav) — same style and
// localStorage-dismiss pattern as WelcomeCard, but keyed per-day since the
// content itself changes daily. Facts come from public/data/fun-facts.json,
// each carrying its own Wikipedia citation (PRD "transparent, cited data").
// When the animal also has a species.json entry, that entry supplies the
// photo and the "Learn more" link goes to its in-app page; otherwise the
// card falls back to the illustrated icon and links out to Wikipedia.
export default function FunFactCard({ facts, species }: { facts: FunFact[]; species: Species[] }) {
  const [dismissed, setDismissed] = useState(true);
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    const todaysKey = todayKey();
    setKey(todaysKey);
    setDismissed(localStorage.getItem(STORAGE_PREFIX + todaysKey) === "true");
  }, []);

  const fact = pickFactOfTheDay(facts);
  const linkedSpecies = fact?.speciesSlug
    ? species.find((s) => s.slug === fact.speciesSlug)
    : undefined;

  if (dismissed || !fact || !key) return null;

  return (
    // top-24, not top-6 — TopNav now floats fixed over the map (h-16) rather
    // than sitting in its own row above it, so this needs to clear it.
    <div className="absolute right-6 top-24 w-[26rem] max-w-[calc(100vw-3rem)] rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">
          Did you know?
        </p>
        <button
          type="button"
          aria-label="Dismiss fun fact"
          className="text-zinc-400 hover:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          onClick={() => {
            localStorage.setItem(STORAGE_PREFIX + key, "true");
            setDismissed(true);
          }}
        >
          ✕
        </button>
      </div>

      <div className="mt-2 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-xl">
          {linkedSpecies?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={linkedSpecies.photoUrl}
              alt={linkedSpecies.commonName}
              className="h-full w-full object-cover"
            />
          ) : (
            (linkedSpecies && SPECIES_ICON[linkedSpecies.slug]) ?? DEFAULT_SPECIES_ICON
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{fact.animal}</p>
          <p className="mt-1 text-sm text-zinc-600">{fact.fact}</p>
          {linkedSpecies ? (
            <Link
              href={`/species/${linkedSpecies.slug}`}
              className="mt-2 inline-block text-xs font-medium text-zinc-900 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
            >
              Learn more
            </Link>
          ) : (
            <a
              href={fact.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-zinc-900 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
            >
              Source: Wikipedia ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
