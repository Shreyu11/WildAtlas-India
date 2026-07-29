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

      {item.conservationEfforts && item.conservationEfforts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.conservationEfforts.map((effort) => (
            <span
              key={effort}
              className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-700 border border-zinc-200"
            >
              🛡️ {effort}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 text-zinc-700 text-sm leading-relaxed">{item.description}</p>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-xs text-zinc-900">
        <dt className="font-mono uppercase text-zinc-400">Habitat</dt>
        <dd className="text-zinc-800">{item.habitat}</dd>
        <dt className="font-mono uppercase text-zinc-400">Found in</dt>
        <dd className="flex flex-wrap gap-1.5">
          {foundIn.map((s) => (
            <Link
              key={s.slug}
              href={`/state/${s.slug}`}
              className="rounded bg-zinc-50 border border-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              {s.name}
            </Link>
          ))}
        </dd>
        {item.taxonClassification && (
          <>
            <dt className="font-mono uppercase text-zinc-400">Taxonomy</dt>
            <dd className="font-mono text-[11px] text-zinc-600">
              {[
                item.taxonClassification.order && `Order: ${item.taxonClassification.order}`,
                item.taxonClassification.family && `Family: ${item.taxonClassification.family}`,
                item.taxonClassification.genus && `Genus: ${item.taxonClassification.genus}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </>
        )}
      </dl>

      {item.sourceCitations && item.sourceCitations.length > 0 && (
        <div className="mt-6 pt-3 border-t border-zinc-100 text-[11px] text-zinc-400">
          <span className="font-mono uppercase text-[10px] text-zinc-400 block mb-1">Citations & Data Sources</span>
          {item.sourceCitations.join(" · ")}
        </div>
      )}

      <DataAttributionFooter />
    </>
  );
}
