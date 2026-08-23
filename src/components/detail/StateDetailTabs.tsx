"use client";

import { useState } from "react";
import Link from "next/link";
import { TreePine, Compass, Landmark, PawPrint } from "lucide-react";
import type { State, Species, ProtectedArea, Zoo } from "@/lib/types";
import { CONSERVATION_LABEL, CONSERVATION_TONE } from "@/lib/conservation";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON } from "@/lib/mockIcons";
import SpeciesAudioButton from "@/components/audio/SpeciesAudioButton";
import DataAttributionFooter from "@/components/DataAttributionFooter";
import { Tabs, List } from "@/design-system";

interface StateDetailTabsProps {
  state: State;
  species: Species[];
  allSpecies?: Species[];
  nationalParks: ProtectedArea[];
  sanctuaries: ProtectedArea[];
  zoos: Zoo[];
}

export default function StateDetailTabs({
  state,
  species,
  allSpecies = [],
  nationalParks,
  sanctuaries,
  zoos,
}: StateDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"species" | "national-parks" | "sanctuaries" | "zoos">("species");

  const lookupPool = allSpecies && allSpecies.length > 0 ? allSpecies : species;

  let stateAnimal = lookupPool.find((s) => s.slug === state.stateAnimalSlug);
  if (!stateAnimal) {
    stateAnimal = lookupPool.find((s) => s.slug === state.dominantSpeciesSlug) || lookupPool.find((s) => s.taxon === "mammal");
  }

  let stateBird = lookupPool.find((s) => s.slug === state.stateBirdSlug);
  if (!stateBird) {
    stateBird = lookupPool.find((s) => s.taxon === "bird") || lookupPool.find((s) => s.slug !== stateAnimal?.slug);
  }

  return (
    <div className="space-y-5">
      {/* 1. State Topology Cover Photo */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200/60">
        {state.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.photoUrl}
            alt={`${state.name} satellite view`}
            className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-zinc-600 font-mono text-sm">
            Topology Photo
          </div>
        )}
      </div>

      <h1 className="text-2xl font-semibold text-zinc-900">{state.name}</h1>

      {/* 2. Official State Animal & State Bird */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {stateAnimal && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-3 text-xs text-emerald-950 shadow-2xs">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100/90 border border-emerald-200/80 text-lg">
              {stateAnimal.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stateAnimal.photoUrl} alt={stateAnimal.commonName} className="h-full w-full object-cover" />
              ) : (
                SPECIES_ICON[stateAnimal.slug] ?? "🐾"
              )}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-700 block">
                State Animal
              </span>
              <Link
                href={`/species/${stateAnimal.slug}`}
                replace
                className="font-semibold text-xs text-emerald-950 hover:underline truncate block"
              >
                {stateAnimal.commonName}
              </Link>
            </div>
            <SpeciesAudioButton audioUrl={stateAnimal.audioUrl} speciesName={stateAnimal.commonName} size="sm" />
          </div>
        )}

        {stateBird && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 p-3 text-xs text-sky-950 shadow-2xs">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100/90 border border-sky-200/80 text-lg">
              {stateBird.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stateBird.photoUrl} alt={stateBird.commonName} className="h-full w-full object-cover" />
              ) : (
                SPECIES_ICON[stateBird.slug] ?? "🦚"
              )}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-sky-700 block">
                State Bird
              </span>
              <Link
                href={`/species/${stateBird.slug}`}
                replace
                className="font-semibold text-xs text-sky-950 hover:underline truncate block"
              >
                {stateBird.commonName}
              </Link>
            </div>
            <SpeciesAudioButton audioUrl={stateBird.audioUrl} speciesName={stateBird.commonName} size="sm" />
          </div>
        )}
      </div>

      {/* 3. Overview in Context of Wildlife */}
      <div>
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
          Overview
        </h2>
        <p className="text-sm text-zinc-700 leading-relaxed font-sans">
          {state.overview || `${state.name} features rich habitats and biodiversity essential to India's wildlife.`}
        </p>
      </div>

      {/* 4. Tab Navigation (Species | National Parks | Sanctuaries | Zoos) */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "species", label: "Species", count: species.length, icon: <PawPrint className="h-3.5 w-3.5" /> },
          { id: "national-parks", label: "National Parks", count: nationalParks.length, icon: <TreePine className="h-3.5 w-3.5" /> },
          { id: "sanctuaries", label: "Sanctuaries", count: sanctuaries.length, icon: <Compass className="h-3.5 w-3.5" /> },
          { id: "zoos", label: "Zoos", count: zoos.length, icon: <Landmark className="h-3.5 w-3.5" /> },
        ]}
      />

      {/* Tab Panels */}
      <div className="min-h-[220px]">
        {/* Tab 1: Species */}
        {activeTab === "species" && (
          <ul className="flex flex-col gap-3">
            {species.length === 0 ? (
              <li className="py-8 text-center text-xs text-zinc-500 font-mono">No species mapped for this state yet.</li>
            ) : (
              species.map((item) => (
                <li key={item.slug}>
                  <Link href={`/species/${item.slug}`} replace className="block">
                    <List.SpeciesItem
                      commonName={item.commonName}
                      scientificName={item.scientificName}
                      photoUrl={item.photoUrl}
                      fallbackIcon={SPECIES_ICON[item.slug] ?? DEFAULT_SPECIES_ICON}
                      tag={item.slug === state.dominantSpeciesSlug ? "Dominant" : undefined}
                      status={item.conservationStatus}
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}

        {/* Tab 2: National Parks */}
        {activeTab === "national-parks" && (
          <ul className="flex flex-col gap-3">
            {nationalParks.length === 0 ? (
              <li className="py-8 text-center text-xs text-zinc-500 font-mono">No national parks listed for this state yet.</li>
            ) : (
              nationalParks.map((np) => (
                <li key={np.slug}>
                  <Link href={`/protected-area/${np.slug}`} replace className="block">
                    <List.ProtectedAreaItem
                      name={np.name}
                      iconEmoji="🏞️"
                      headlineSpeciesSlug={np.headlineSpeciesSlug}
                      areaSqKm={np.areaSqKm}
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}

        {/* Tab 3: Sanctuaries */}
        {activeTab === "sanctuaries" && (
          <ul className="flex flex-col gap-3">
            {sanctuaries.length === 0 ? (
              <li className="py-8 text-center text-xs text-zinc-500 font-mono">No sanctuaries listed for this state yet.</li>
            ) : (
              sanctuaries.map((sanc) => (
                <li key={sanc.slug}>
                  <Link href={`/protected-area/${sanc.slug}`} replace className="block">
                    <List.ProtectedAreaItem
                      name={sanc.name}
                      typeLabel={sanc.type === "bird-sanctuary" ? "Bird" : "Wildlife"}
                      iconEmoji={sanc.type === "bird-sanctuary" ? "🦅" : "🌿"}
                      headlineSpeciesSlug={sanc.headlineSpeciesSlug}
                      areaSqKm={sanc.areaSqKm}
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}

        {/* Tab 4: Zoos */}
        {activeTab === "zoos" && (
          <ul className="flex flex-col gap-3">
            {zoos.length === 0 ? (
              <li className="py-8 text-center text-xs text-zinc-500 font-mono">No zoos listed for this state yet.</li>
            ) : (
              zoos.map((zoo) => (
                <li key={zoo.slug}>
                  <Link href={`/zoo/${zoo.slug}`} replace className="block">
                    <List.ProtectedAreaItem
                      name={zoo.name}
                      iconEmoji="🏛️"
                      subtitle={`${zoo.city}${zoo.establishedYear ? ` · Est. ${zoo.establishedYear}` : ""}`}
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <DataAttributionFooter />
    </div>
  );
}
