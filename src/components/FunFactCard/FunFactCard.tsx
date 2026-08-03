"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
// Clicking anywhere on the card (except close button) opens the details drawer.
export default function FunFactCard({ facts, species }: { facts: FunFact[]; species: Species[] }) {
  const [dismissed, setDismissed] = useState(true);
  const [key, setKey] = useState<string | null>(null);
  const router = useRouter();

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

  const handleCardClick = () => {
    if (linkedSpecies) {
      router.push(`/species/${linkedSpecies.slug}`);
    } else if (fact.wikipediaUrl) {
      window.open(fact.wikipediaUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    // top-24, not top-6 — TopNav now floats fixed over the map (h-16) rather
    // than sitting in its own row above it, so this needs to clear it.
    <div
      onClick={handleCardClick}
      className="group absolute right-6 top-24 w-[26rem] max-w-[calc(100vw-3rem)] cursor-pointer rounded-[22px] border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-2xl transition-all duration-200 ease-ios hover:border-zinc-300 hover:shadow-2xl active:scale-[0.99]"
      title={linkedSpecies ? `View ${linkedSpecies.commonName} details` : "View source on Wikipedia"}
    >
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800">
          Did you know?
        </p>
        <button
          type="button"
          aria-label="Dismiss fun fact"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 transition-all duration-200 ease-ios active:scale-90"
          onClick={(e) => {
            e.stopPropagation();
            localStorage.setItem(STORAGE_PREFIX + key, "true");
            setDismissed(true);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-zinc-100 text-xl shadow-2xs group-hover:scale-105 transition-transform duration-200">
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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-900 leading-tight group-hover:text-emerald-700 transition-colors">
            {fact.animal}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">{fact.fact}</p>
        </div>
      </div>
    </div>
  );
}
