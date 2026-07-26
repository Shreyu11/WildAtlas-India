import { notFound } from "next/navigation";
import Link from "next/link";
import { getSpecies, getStates } from "@/lib/data";
import { CONSERVATION_LABEL, CONSERVATION_TONE } from "@/lib/conservation";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON } from "@/lib/mockIcons";
import DataAttributionFooter from "@/components/DataAttributionFooter";

export default async function SpeciesDetail({ slug }: { slug: string }) {
  const [species, states] = await Promise.all([getSpecies(), getStates()]);
  const item = species.find((s) => s.slug === slug);

  if (!item) notFound();

  const foundIn = states.filter((s) => item.stateSlugs.includes(s.slug));

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-3xl">
          {SPECIES_ICON[item.slug] ?? DEFAULT_SPECIES_ICON}
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{item.commonName}</h1>
          <p className="text-sm italic text-zinc-500">{item.scientificName}</p>
        </div>
      </div>

      <span
        className={`mt-4 inline-block rounded px-2 py-1 font-mono text-xs ${CONSERVATION_TONE[item.conservationStatus]}`}
      >
        {CONSERVATION_LABEL[item.conservationStatus]}
      </span>

      <p className="mt-4 text-zinc-700">{item.description}</p>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="font-mono uppercase text-zinc-500">Habitat</dt>
        <dd>{item.habitat}</dd>
        <dt className="font-mono uppercase text-zinc-500">Found in</dt>
        <dd className="flex flex-wrap gap-2">
          {foundIn.map((s) => (
            <Link
              key={s.slug}
              href={`/state/${s.slug}`}
              className="underline underline-offset-2"
            >
              {s.name}
            </Link>
          ))}
        </dd>
      </dl>

      <DataAttributionFooter />
    </>
  );
}
