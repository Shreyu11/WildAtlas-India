import { notFound } from "next/navigation";
import Link from "next/link";
import { getProtectedAreas, getSpecies, getStates } from "@/lib/data";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON, PUBLIC_ACCESS_LABEL } from "@/lib/mockIcons";
import DataAttributionFooter from "@/components/DataAttributionFooter";
import LinkPreviewCard from "@/components/LinkPreviewCard";

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
            <Link href={`/state/${state.slug}`} replace className="underline underline-offset-2">
              {state.name}
            </Link>
          </>
        )}
      </p>

      {area.description && (
        <p className="mt-3 text-sm text-zinc-700 leading-relaxed">{area.description}</p>
      )}

      {area.areaSqKm && (
        <p className="mt-2 text-xs text-zinc-600">
          Total Area: <span className="font-semibold text-zinc-800">{area.areaSqKm.toLocaleString()} sq km</span>
        </p>
      )}

      {area.visitingHours?.publicAccess && (
        <div className="mt-3 flex items-start gap-2">
          <span className="inline-block shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-700 border border-zinc-200">
            {PUBLIC_ACCESS_LABEL[area.visitingHours.publicAccess]}
          </span>
          {area.visitingHours.accessNotes && (
            <p className="text-[11px] text-zinc-500 leading-relaxed">{area.visitingHours.accessNotes}</p>
          )}
        </div>
      )}

      {area.bestTimeToVisit && (
        <div className="mt-4 rounded-xl bg-zinc-50 p-3.5 border border-zinc-100">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Best Time to Visit
          </span>
          <p className="text-xs text-zinc-700 leading-relaxed">{area.bestTimeToVisit}</p>
        </div>
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
              <p className="font-mono text-[10px] uppercase text-zinc-400">Headline species</p>
            </div>
          </Link>
        </div>
      )}

      {area.additionalKeySpeciesSlugs && area.additionalKeySpeciesSlugs.length > 0 && (
        <div className="mt-5">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Also Found Here
          </span>
          <div className="grid grid-cols-2 gap-2">
            {area.additionalKeySpeciesSlugs.map((slug) => {
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

      {area.websiteUrl && (
        <div className="mt-5 pt-4 border-t border-zinc-100">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Official Portal
          </span>
          <LinkPreviewCard label={`${area.name} Official Website`} url={area.websiteUrl} category="official" />
        </div>
      )}

      {area.travelLinks && (area.travelLinks.official.length > 0 || area.travelLinks.operators.length > 0) && (
        <div className="mt-5 pt-4 border-t border-zinc-100">
          <span className="block font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Plan A Trip
          </span>
          {area.travelLinks.official.length > 0 && (
            <div className="mb-3.5">
              <p className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">Official</p>
              <div className="space-y-2">
                {area.travelLinks.official.map((link) => (
                  <LinkPreviewCard key={link.url} label={link.label} url={link.url} category="official" />
                ))}
              </div>
            </div>
          )}
          {area.travelLinks.operators.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
                Travel &amp; Trip Planning (third-party, informational only — not sponsored)
              </p>
              <div className="space-y-2">
                {area.travelLinks.operators.map((link) => (
                  <LinkPreviewCard key={link.url} label={link.label} url={link.url} category="travel" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {area.sources && area.sources.length > 0 && (
        <div className="mt-4 text-[11px] text-zinc-400">
          Source: {area.sources.map((s) => s.label).join(", ")}
        </div>
      )}

      <DataAttributionFooter
        extra={
          area.photoAttribution
            ? "Cover photo sourced from Wikimedia Commons; nearby species and travel links sourced from Wikipedia/GBIF and Wikivoyage/state tourism sites, each linked above."
            : undefined
        }
      />
    </>
  );
}
