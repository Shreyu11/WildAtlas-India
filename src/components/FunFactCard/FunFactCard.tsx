"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FunFact, Species } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, SPECIES_ICON } from "@/lib/mockIcons";

import { X } from "lucide-react";

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
    <div className="absolute right-6 top-24 w-[26rem] max-w-[calc(100vw-3rem)] rounded-[22px] border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-2xl transition-all duration-200 ease-ios">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800">
          Did you know?
        </p>
        <button
          type="button"
          aria-label="Dismiss fun fact"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 transition-all duration-200 ease-ios active:scale-90"
          onClick={() => {
            localStorage.setItem(STORAGE_PREFIX + key, "true");
            setDismissed(true);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-zinc-100 text-xl shadow-2xs">
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
          <p className="text-sm font-bold text-zinc-900 leading-tight">{fact.animal}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">{fact.fact}</p>
          {linkedSpecies ? (
            <Link
              href={`/species/${linkedSpecies.slug}`}
              className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold text-white transition-all duration-200 ease-ios hover:bg-zinc-800 active:scale-95 shadow-2xs"
            >
              Learn species →
            </Link>
          ) : (
            <a
              href={fact.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700 underline underline-offset-2 hover:text-zinc-900 transition-colors"
            >
              Source: Wikipedia ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
