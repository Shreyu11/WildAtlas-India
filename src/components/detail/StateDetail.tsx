import { notFound } from "next/navigation";
import Link from "next/link";
import { getSpecies, getStates } from "@/lib/data";
import { CONSERVATION_LABEL, CONSERVATION_TONE } from "@/lib/conservation";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON } from "@/lib/mockIcons";
import DataAttributionFooter from "@/components/DataAttributionFooter";

export default async function StateDetail({ slug }: { slug: string }) {
  const [states, species] = await Promise.all([getStates(), getSpecies()]);
  const state = states.find((s) => s.slug === slug);

  if (!state) notFound();

  const stateSpecies = species.filter((s) => state.speciesSlugs.includes(s.slug));

  return (
    <>
      <h1 className="text-2xl font-semibold">{state.name}</h1>

      <ul className="mt-6 flex flex-col gap-4">
        {stateSpecies.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/species/${item.slug}`}
              className="flex items-start gap-3 rounded border border-zinc-200 p-3 hover:bg-zinc-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl">
                {SPECIES_ICON[item.slug] ?? DEFAULT_SPECIES_ICON}
              </span>
              <div>
                <p className="font-medium">
                  {item.commonName}
                  {item.slug === state.dominantSpeciesSlug && (
                    <span className="ml-2 font-mono text-[10px] uppercase text-zinc-400">
                      Dominant species
                    </span>
                  )}
                </p>
                <p className="text-xs italic text-zinc-500">{item.scientificName}</p>
                <span
                  className={`mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] ${CONSERVATION_TONE[item.conservationStatus]}`}
                >
                  {CONSERVATION_LABEL[item.conservationStatus]}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <DataAttributionFooter />
    </>
  );
}
