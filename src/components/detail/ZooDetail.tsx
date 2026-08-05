import { notFound } from "next/navigation";
import Link from "next/link";
import { getZoos, getSpecies, getStates } from "@/lib/data";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON, PUBLIC_ACCESS_LABEL } from "@/lib/mockIcons";
import DataAttributionFooter from "@/components/DataAttributionFooter";
import LinkPreviewCard from "@/components/LinkPreviewCard";

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
            <Link href={`/state/${state.slug}`} replace className="underline underline-offset-2">
              {state.name}
            </Link>
          </>
        )}
      </p>

      {zoo.description && (
        <p className="mt-3 text-sm text-zinc-700 leading-relaxed">{zoo.description}</p>
      )}

      {zoo.establishedYear && (
        <p className="mt-2 text-xs text-zinc-600">
          Established in <span className="font-semibold text-zinc-800">{zoo.establishedYear}</span>
        </p>
      )}

      {zoo.visitingHours?.publicAccess && (
        <div className="mt-3 flex items-start gap-2">
          <span className="inline-block shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-700 border border-zinc-200">
            {PUBLIC_ACCESS_LABEL[zoo.visitingHours.publicAccess]}
          </span>
          {zoo.visitingHours.accessNotes && (
            <p className="text-[11px] text-zinc-500 leading-relaxed">{zoo.visitingHours.accessNotes}</p>
          )}
        </div>
      )}

      {headline && (
        <div className="mt-6">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Notable Resident Species
          </span>
          <Link
            href={`/species/${headline.slug}`}
            replace
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

      {zoo.additionalKeySpeciesSlugs && zoo.additionalKeySpeciesSlugs.length > 0 && (
        <div className="mt-5">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Also Housed Here
          </span>
          <div className="grid grid-cols-2 gap-2">
            {zoo.additionalKeySpeciesSlugs.map((slug) => {
              const sp = species.find((s) => s.slug === slug);
              if (!sp) return null;
              return (
                <Link
                  key={slug}
                  href={`/species/${sp.slug}`}
                  replace
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50 transition"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-base">
                    {sp.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sp.photoUrl} alt={sp.commonName} className="h-full w-full object-cover" />
                    ) : (
                      SPECIES_ICON[sp.slug] ?? DEFAULT_SPECIES_ICON
                    )}
                  </span>
                  <p className="text-xs font-medium text-zinc-800 leading-tight">{sp.commonName}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {zoo.wikipediaUrl && (
        <div className="mt-6 pt-4 border-t border-zinc-100">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Reference &amp; Information
          </span>
          <LinkPreviewCard label={`${zoo.name} on Wikipedia`} url={zoo.wikipediaUrl} category="wiki" />
        </div>
      )}

      <DataAttributionFooter
        extra={
          zoo.photoAttribution
            ? "Cover photo sourced from Wikimedia Commons; resident species sourced from Wikipedia/GBIF, linked above."
            : undefined
        }
      />
    </>
  );
}
