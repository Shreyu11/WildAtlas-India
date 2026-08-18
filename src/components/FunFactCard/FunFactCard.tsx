"use client";

import { IconButton } from "@/design-system";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FunFact, Species } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, SPECIES_ICON } from "@/lib/mockIcons";
import { Lightbulb, X } from "lucide-react";

const STORAGE_PREFIX = "wildatlas-funfact-dismissed-";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// Deterministic "fact of the day" stable per day
function pickFactOfTheDay(facts: FunFact[]): FunFact | undefined {
  if (facts.length === 0) return undefined;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return facts[dayOfYear % facts.length];
}

// Highlights/bolds the species animal name inside the fact text if present
function renderFormattedFact(factText: string, animalName: string) {
  if (!animalName) return factText;
  const lowerFact = factText.toLowerCase();
  const lowerAnimal = animalName.toLowerCase();
  const idx = lowerFact.indexOf(lowerAnimal);

  if (idx === -1) {
    return factText;
  }

  const before = factText.slice(0, idx);
  const match = factText.slice(idx, idx + animalName.length);
  const after = factText.slice(idx + animalName.length);

  return (
    <>
      {before}
      <span className="font-bold text-slate-800">{match}</span>
      {after}
    </>
  );
}

export default function FunFactCard({ facts, species }: { facts: FunFact[]; species: Species[] }) {
  const [dismissed, setDismissed] = useState(true);
  const [key, setKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const todaysKey = todayKey();
    setKey(todaysKey);
    // Clear previous dismissal state for local testing so the Fun Fact Card displays immediately
    localStorage.removeItem(STORAGE_PREFIX + todaysKey);
    setDismissed(false);
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
    <div
      onClick={handleCardClick}
      className="group absolute right-6 top-24 flex w-[430px] max-w-[calc(100vw-3rem)] cursor-pointer flex-col items-start gap-3 rounded-[24px] border border-slate-200/80 bg-white p-3 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-slate-300 hover:shadow-2xl active:scale-[0.99]"
      title={linkedSpecies ? `View ${linkedSpecies.commonName} details` : "View source on Wikipedia"}
    >
      {/* Header Row: Lightbulb + Did you know? + Close Button */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-slate-800 shrink-0 stroke-[2.25]" />
          <h2 className="font-mono text-[14px] font-bold tracking-tight text-slate-800">
            Did you know?
          </h2>
        </div>
        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Dismiss fun fact"
          icon={<X className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            localStorage.setItem(STORAGE_PREFIX + key, "true");
            setDismissed(true);
          }}
        />
      </div>

      {/* Main Content Row: Image + Text Description */}
      <div className="flex w-full items-center gap-3.5">
        <div className="h-[110px] w-[110px] shrink-0 overflow-hidden rounded-[16px] bg-slate-100 border border-slate-200/60 shadow-2xs">
          {linkedSpecies?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={linkedSpecies.photoUrl}
              alt={linkedSpecies.commonName}
              className="h-full w-full object-cover rounded-[16px] group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              {(linkedSpecies && SPECIES_ICON[linkedSpecies.slug]) ?? DEFAULT_SPECIES_ICON}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-snug text-slate-600 font-normal">
            {renderFormattedFact(fact.fact, fact.animal)}
          </p>
        </div>
      </div>
    </div>
  );
}
