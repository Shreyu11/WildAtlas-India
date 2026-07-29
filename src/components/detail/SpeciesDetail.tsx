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
      {item.photoUrl && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.photoUrl} alt={item.commonName} className="h-full w-full object-cover" />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{item.commonName}</h1>
        <p className="text-sm italic text-zinc-500">{item.scientificName}</p>
      </div>

      {item.photoAttribution && (
        <p className="mt-1.5 text-[11px] text-zinc-400">
          Photo:{" "}
          <a href={item.photoAttribution.sourceUrl} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            {item.photoAttribution.author}
          </a>
          , licensed{" "}
          <a href={item.photoAttribution.licenseUrl} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            {item.photoAttribution.license}
          </a>{" "}
          via Wikimedia Commons.
        </p>
      )}

      <span
        className={`mt-4 inline-block rounded px-2 py-1 font-mono text-xs ${CONSERVATION_TONE[item.conservationStatus]}`}
      >
        {CONSERVATION_LABEL[item.conservationStatus]}
      </span>

      <p className="mt-4 text-zinc-700">{item.description}</p>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm text-zinc-900">
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
