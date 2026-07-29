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

      {area.areaSqKm && (
        <p className="mt-2 text-xs text-zinc-600">
          Total Area: <span className="font-semibold text-zinc-800">{area.areaSqKm.toLocaleString()} sq km</span>
        </p>
      )}

      {area.uniqueFeatures && (
        <div className="mt-4 rounded-xl bg-zinc-50 p-3.5 border border-zinc-100">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Unique Characteristics
          </span>
          <p className="text-xs text-zinc-700 leading-relaxed">{area.uniqueFeatures}</p>
        </div>
      )}

      {headline && (
        <div className="mt-5">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Flagship Wildlife Species
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
              <p className="font-mono text-[10px] uppercase text-zinc-400">Headline species</p>
            </div>
          </Link>
        </div>
      )}

      {area.websiteUrl && (
        <div className="mt-5 pt-3 border-t border-zinc-100">
          <a
            href={area.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
          >
            Visit Official Portal ↗
          </a>
        </div>
      )}

      {area.sources && area.sources.length > 0 && (
        <div className="mt-4 text-[11px] text-zinc-400">
          Source: {area.sources.map((s) => s.label).join(", ")}
        </div>
      )}

      <DataAttributionFooter />
    </>
  );
}
