import { notFound } from "next/navigation";
import Link from "next/link";
import { getZoos, getSpecies, getStates } from "@/lib/data";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON, ZOO_ICON } from "@/lib/mockIcons";
import DataAttributionFooter from "@/components/DataAttributionFooter";

export default async function ZooDetail({ slug }: { slug: string }) {
  const [zoos, species, states] = await Promise.all([
    getZoos(),
    getSpecies(),
    getStates(),
  ]);
  const zoo = zoos.find((z) => z.slug === slug);

  if (!zoo) notFound();

  const headline = zoo.headlineSpeciesSlug
    ? species.find((s) => s.slug === zoo.headlineSpeciesSlug)
    : undefined;
  const state = states.find((s) => s.slug === zoo.stateSlug);

  return (
    <>
      {/* Place Photo Header */}
      {zoo.photoUrl && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoo.photoUrl}
            alt={zoo.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h1 className="text-2xl font-semibold text-zinc-900">{zoo.name}</h1>
      <p className="mt-1 font-mono text-xs uppercase text-zinc-500">
        Zoological Garden · {zoo.city}
        {state && (
          <>
            {" · "}
            <Link href={`/state/${state.slug}`} className="underline underline-offset-2">
              {state.name}
            </Link>
          </>
        )}
      </p>

      {zoo.establishedYear && (
        <p className="mt-2 text-xs text-zinc-600">
          Established in <span className="font-semibold text-zinc-800">{zoo.establishedYear}</span>
        </p>
      )}

      {headline && (
        <div className="mt-6">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Notable Resident Species
          </span>
          <Link
            href={`/species/${headline.slug}`}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50 transition"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-xl">
              {headline.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={headline.photoUrl}
                  alt={headline.commonName}
                  className="h-full w-full object-cover"
                />
              ) : (
                SPECIES_ICON[headline.slug] ?? DEFAULT_SPECIES_ICON
              )}
            </span>
            <div>
              <p className="font-medium text-zinc-900 text-sm">{headline.commonName}</p>
              <p className="font-mono text-[10px] uppercase text-zinc-400">Resident Flagship</p>
            </div>
          </Link>
        </div>
      )}

      {zoo.wikipediaUrl && (
        <div className="mt-6 pt-4 border-t border-zinc-100">
          <a
            href={zoo.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
          >
            Read more on Wikipedia ↗
          </a>
        </div>
      )}

      <DataAttributionFooter />
    </>
  );
}
