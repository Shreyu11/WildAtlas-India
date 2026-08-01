import { notFound } from "next/navigation";
import { getStates, getSpecies, getProtectedAreas, getZoos } from "@/lib/data";
import StateDetailTabs from "./StateDetailTabs";

export default async function StateDetail({ slug }: { slug: string }) {
  const [states, species, protectedAreas, zoos] = await Promise.all([
    getStates(),
    getSpecies(),
    getProtectedAreas(),
    getZoos(),
  ]);

  const state = states.find((s) => s.slug === slug);
  if (!state) notFound();

  const stateSpecies = species.filter((s) => state.speciesSlugs.includes(s.slug));
  const nationalParks = protectedAreas.filter((pa) => pa.stateSlug === state.slug && pa.type === "national-park");
  const sanctuaries = protectedAreas.filter((pa) => pa.stateSlug === state.slug && pa.type !== "national-park");
  const stateZoos = zoos.filter((z) => z.stateSlug === state.slug);

  return (
    <StateDetailTabs
      state={state}
      species={stateSpecies}
      allSpecies={species}
      nationalParks={nationalParks}
      sanctuaries={sanctuaries}
      zoos={stateZoos}
    />
  );
}
