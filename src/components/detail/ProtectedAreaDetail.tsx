import { notFound } from "next/navigation";
import Link from "next/link";
import { getProtectedAreas, getSpecies, getStates } from "@/lib/data";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON } from "@/lib/mockIcons";
import DataAttributionFooter from "@/components/DataAttributionFooter";

export default async function ProtectedAreaDetail({ slug }: { slug: string }) {
  const [protectedAreas, species, states] = await Promise.all([
    getProtectedAreas(),
    getSpecies(),
    getStates(),
  ]);
  const area = protectedAreas.find((p) => p.slug === slug);

  if (!area) notFound();

  const headline = species.find((s) => s.slug === area.headlineSpeciesSlug);
  const state = states.find((s) => s.slug === area.stateSlug);

  return (
    <>
      {area.photoUrl && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={area.photoUrl}
            alt={area.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h1 className="text-2xl font-semibold text-zinc-900">{area.name}</h1>
      <p className="mt-1 font-mono text-xs uppercase text-zinc-500">
        {area.type.replace(/-/g, " ")}
        {state && (
          <>
            {" · "}
            <Link href={`/state/${state.slug}`} className="underline underline-offset-2">
              {state.name}
            </Link>
          </>
        )}
      </p>

      {headline && (
        <Link
          href={`/species/${headline.slug}`}
          className="mt-6 flex items-center gap-3 rounded border border-zinc-200 p-3 hover:bg-zinc-50"
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
            <p className="font-medium text-zinc-900">{headline.commonName}</p>
            <p className="font-mono text-[10px] uppercase text-zinc-400">Headline species</p>
          </div>
        </Link>
      )}

      <DataAttributionFooter />
    </>
  );
}
