"use client";

import { Card } from "@/design-system";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FunFact, Species } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, SPECIES_ICON } from "@/lib/mockIcons";
import { WELCOME_DISMISSED_KEY } from "@/components/WelcomeCard/WelcomeCard";

const STORAGE_PREFIX = "wildatlas-funfact-dismissed-";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Deterministic "fact of the day" stable per day
function pickFactOfTheDay(facts: FunFact[]): FunFact | undefined {
  if (facts.length === 0) return undefined;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return facts[dayOfYear % facts.length];
}

function isWelcomeDismissed24hAgo(): boolean {
  if (typeof window === "undefined") return false;
  const welcomeVal = localStorage.getItem(WELCOME_DISMISSED_KEY);
  if (!welcomeVal) return false;

  if (welcomeVal === "true") return true;

  const timestamp = Number(welcomeVal);
  if (isNaN(timestamp)) return true;

  return Date.now() - timestamp >= TWENTY_FOUR_HOURS_MS;
}

export default function FunFactCard({ facts, species }: { facts: FunFact[]; species: Species[] }) {
  const [dismissed, setDismissed] = useState(true);
  const [key, setKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const todaysKey = todayKey();
    setKey(todaysKey);

    const checkVisibility = () => {
      const todayDismissed = localStorage.getItem(STORAGE_PREFIX + todaysKey) === "true";
      const is24hPassed = isWelcomeDismissed24hAgo();
      setDismissed(todayDismissed || !is24hPassed);
    };

    checkVisibility();

    window.addEventListener("wildatlas-welcome-dismissed", checkVisibility);
    return () => {
      window.removeEventListener("wildatlas-welcome-dismissed", checkVisibility);
    };
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

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_PREFIX + key, "true");
    setDismissed(true);
  };

  return (
    <div className="absolute right-6 top-24 max-w-[calc(100vw-3rem)] z-30">
      <Card.FunFact
        imageSrc={linkedSpecies?.photoUrl}
        imageAlt={linkedSpecies?.commonName}
        fallbackIcon={(linkedSpecies && SPECIES_ICON[linkedSpecies.slug]) ?? DEFAULT_SPECIES_ICON}
        factText={fact.fact}
        highlightText={fact.animal}
        onClick={handleCardClick}
        onDismiss={handleDismiss}
      />
    </div>
  );
}
