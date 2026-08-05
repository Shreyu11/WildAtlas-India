"use client";

import { useState } from "react";
import Link from "next/link";
import { TreePine, Compass, Landmark, PawPrint } from "lucide-react";
import type { State, Species, ProtectedArea, Zoo } from "@/lib/types";
import { CONSERVATION_LABEL, CONSERVATION_TONE } from "@/lib/conservation";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON } from "@/lib/mockIcons";
import SpeciesAudioButton from "@/components/audio/SpeciesAudioButton";
import DataAttributionFooter from "@/components/DataAttributionFooter";

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
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200/60">
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
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {state.name}
          </h1>
        </div>
      </div>

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
      <div className="border-b border-zinc-200/80">
        <nav className="-mb-px flex space-x-1 overflow-x-auto pb-1" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("species")}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2 px-3 text-xs font-semibold transition-all ${
              activeTab === "species"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            }`}
          >
            <PawPrint className="h-3.5 w-3.5" />
            <span>Species</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeTab === "species" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {species.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("national-parks")}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2 px-3 text-xs font-semibold transition-all ${
              activeTab === "national-parks"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            }`}
          >
            <TreePine className="h-3.5 w-3.5" />
            <span>National Parks</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeTab === "national-parks" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {nationalParks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sanctuaries")}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2 px-3 text-xs font-semibold transition-all ${
              activeTab === "sanctuaries"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Sanctuaries</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeTab === "sanctuaries" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {sanctuaries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("zoos")}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2 px-3 text-xs font-semibold transition-all ${
              activeTab === "zoos"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            }`}
          >
            <Landmark className="h-3.5 w-3.5" />
            <span>Zoos</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeTab === "zoos" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {zoos.length}
            </span>
          </button>
        </nav>
      </div>

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
                  <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 hover:bg-zinc-50/80 transition-colors shadow-2xs">
                    <Link href={`/species/${item.slug}`} replace className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-lg border border-zinc-200">
                        {item.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.photoUrl} alt={item.commonName} className="h-full w-full object-cover" />
                        ) : (
                          SPECIES_ICON[item.slug] ?? DEFAULT_SPECIES_ICON
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-zinc-900 truncate">{item.commonName}</p>
                          {item.slug === state.dominantSpeciesSlug && (
                            <span className="font-mono text-[9px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded">
                              Dominant
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] italic text-zinc-500 truncate">{item.scientificName}</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <SpeciesAudioButton audioUrl={item.audioUrl} speciesName={item.commonName} size="sm" />
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 font-mono text-[9px] font-medium ${
                          CONSERVATION_TONE[item.conservationStatus]
                        }`}
                      >
                        {CONSERVATION_LABEL[item.conservationStatus]}
                      </span>
                    </div>
                  </div>
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
                  <Link
                    href={`/protected-area/${np.slug}`}
                    replace
                    className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 hover:bg-zinc-50/80 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-lg">
                        🏞️
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-zinc-900 truncate">{np.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          Headline species: <span className="text-zinc-700 font-medium">{np.headlineSpeciesSlug.replace(/-/g, " ")}</span>
                        </p>
                      </div>
                    </div>
                    {np.areaSqKm && (
                      <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-2 py-1 rounded shrink-0 ml-2">
                        {np.areaSqKm} km²
                      </span>
                    )}
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
                  <Link
                    href={`/protected-area/${sanc.slug}`}
                    replace
                    className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 hover:bg-zinc-50/80 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 text-lg">
                        {sanc.type === "bird-sanctuary" ? "🦅" : "🌿"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-zinc-900 truncate">{sanc.name}</p>
                          <span className="font-mono text-[9px] uppercase text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/60">
                            {sanc.type === "bird-sanctuary" ? "Bird" : "Wildlife"}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate">
                          Headline species: <span className="text-zinc-700 font-medium">{sanc.headlineSpeciesSlug.replace(/-/g, " ")}</span>
                        </p>
                      </div>
                    </div>
                    {sanc.areaSqKm && (
                      <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-2 py-1 rounded shrink-0 ml-2">
                        {sanc.areaSqKm} km²
                      </span>
                    )}
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
                  <Link
                    href={`/zoo/${zoo.slug}`}
                    replace
                    className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 hover:bg-zinc-50/80 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 text-lg">
                        🐘
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-zinc-900 truncate">{zoo.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {zoo.city} {zoo.establishedYear ? `· Est. ${zoo.establishedYear}` : ""}
                        </p>
                      </div>
                    </div>
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
