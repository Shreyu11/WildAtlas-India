import { notFound } from "next/navigation";
import Link from "next/link";
import { getSpecies, getStates, getFunFacts } from "@/lib/data";
import { CONSERVATION_LABEL, CONSERVATION_TONE } from "@/lib/conservation";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON } from "@/lib/mockIcons";
import DataAttributionFooter from "@/components/DataAttributionFooter";
import type { CitedFact } from "@/lib/types";

import SpeciesAudioButton from "@/components/audio/SpeciesAudioButton";

function formatRange(v: { min: number; max: number }, unit: string): string {
  return v.min === v.max ? `${v.min} ${unit}` : `${v.min}–${v.max} ${unit}`;
}

function CitedFactRow({
  label,
  text,
  fact,
}: {
  label: string;
  text: string;
  fact: CitedFact<unknown>;
}) {
  const note: string | undefined =
    fact.value && typeof fact.value === "object" && "note" in fact.value
      ? (fact.value as { note?: string }).note
      : undefined;
  return (
    <>
      <dt className="font-mono uppercase text-zinc-400">{label}</dt>
      <dd className="text-zinc-800">
        {text}
        {note && <span className="ml-1.5 text-[10px] italic text-zinc-400">({note})</span>}{" "}
        <a
          href={fact.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
        >
          {fact.source.label}
        </a>
      </dd>
    </>
  );
}

export default async function SpeciesDetail({ slug }: { slug: string }) {
  const [species, states, funFacts] = await Promise.all([getSpecies(), getStates(), getFunFacts()]);
  const item = species.find((s) => s.slug === slug);

  if (!item) notFound();

  const foundIn = states.filter((s) => item.stateSlugs.includes(s.slug));
  const funFact = funFacts.find((f) => f.speciesSlug === item.slug);

  return (
    <>
      {item.photoUrl && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.photoUrl} alt={item.commonName} className="h-full w-full object-cover" />
        </div>
      )}

      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-zinc-900">{item.commonName}</h1>
          <SpeciesAudioButton audioUrl={item.audioUrl} speciesName={item.commonName} size="md" />
        </div>
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

      {item.audioAttribution && (
        <p className="mt-1 text-[11px] text-zinc-400">
          Call:{" "}
          <a href={item.audioAttribution.sourceUrl} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            {item.audioAttribution.author}
          </a>
          , licensed{" "}
          <a href={item.audioAttribution.licenseUrl} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            {item.audioAttribution.license}
          </a>{" "}
          via Xeno-canto.
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
        <dt className="font-mono uppercase text-zinc-400">IUCN Status</dt>
        <dd>
          <span
            className={`inline-block rounded px-2 py-0.5 font-mono text-xs font-semibold ${CONSERVATION_TONE[item.conservationStatus]}`}
          >
            {CONSERVATION_LABEL[item.conservationStatus]}
          </span>
        </dd>
        <dt className="font-mono uppercase text-zinc-400">Habitat</dt>
        <dd className="text-zinc-800">{item.habitat}</dd>
        <dt className="font-mono uppercase text-zinc-400">Found in</dt>
        <dd className="flex flex-wrap gap-1.5">
          {foundIn.map((s) => (
            <Link
              key={s.slug}
              href={`/state/${s.slug}`}
              replace
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
        {item.physicalTraits?.massKg && (
          <CitedFactRow label="Mass" text={formatRange(item.physicalTraits.massKg.value, "kg")} fact={item.physicalTraits.massKg} />
        )}
        {item.physicalTraits?.heightCm && (
          <CitedFactRow label="Height" text={formatRange(item.physicalTraits.heightCm.value, "cm")} fact={item.physicalTraits.heightCm} />
        )}
        {item.physicalTraits?.lengthCm && (
          <CitedFactRow label="Length" text={formatRange(item.physicalTraits.lengthCm.value, "cm")} fact={item.physicalTraits.lengthCm} />
        )}
        {item.physicalTraits?.gestationDays && (
          <CitedFactRow label="Gestation" text={formatRange(item.physicalTraits.gestationDays.value, "days")} fact={item.physicalTraits.gestationDays} />
        )}
        {item.physicalTraits?.lifespanYears && (
          <CitedFactRow
            label="Lifespan"
            text={`Up to ${item.physicalTraits.lifespanYears.value.max} years${
              item.physicalTraits.lifespanYears.value.context === "wild"
                ? " in the wild"
                : item.physicalTraits.lifespanYears.value.context === "captivity"
                  ? " in captivity"
                  : ""
            }`}
            fact={item.physicalTraits.lifespanYears}
          />
        )}
        {item.physicalTraits?.diet && (
          <CitedFactRow label="Food" text={item.physicalTraits.diet.value.join(", ")} fact={item.physicalTraits.diet} />
        )}
        {item.physicalTraits?.collectiveNoun && (
          <CitedFactRow label="Collective noun" text={item.physicalTraits.collectiveNoun.value} fact={item.physicalTraits.collectiveNoun} />
        )}
      </dl>

      {funFact && (
        <div className="mt-5 rounded-xl bg-zinc-50 p-3.5 border border-zinc-200/60">
          <span className="block font-mono text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Did you know
          </span>
          <p className="text-sm text-zinc-700 leading-relaxed">{funFact.fact}</p>
          <a
            href={funFact.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 underline underline-offset-2 hover:text-zinc-900 transition-colors"
          >
            Source: Wikipedia ↗
          </a>
        </div>
      )}

      {item.populationTrend && item.populationTrend.length > 0 && (
        <div className="mt-5 rounded-xl bg-zinc-50 p-3.5 border border-zinc-200/60">
          <span className="block font-mono text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Official Population Census Trend
          </span>
          <div className="flex items-end justify-between gap-3 pt-1 pb-1">
            {item.populationTrend.map((pt) => {
              const maxEst = Math.max(...item.populationTrend!.map((p) => p.estimate || 1));
              const heightPct = Math.min(100, Math.max(18, ((pt.estimate ?? 0) / maxEst) * 100));
              return (
                <div key={pt.year} className="flex flex-col items-center flex-1">
                  <span className="font-mono text-[11px] font-semibold text-zinc-800 mb-1">
                    {pt.estimate ? pt.estimate.toLocaleString() : "N/A"}
                  </span>
                  <div className="w-full bg-zinc-200/80 rounded-t-md h-16 flex items-end p-0.5">
                    <div
                      className="bg-emerald-600 w-full rounded-t transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 mt-1.5 font-medium">{pt.year}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 pt-2 border-t border-zinc-200/40 text-[10px] text-zinc-400 font-mono">
            Census Source: {item.populationTrend[item.populationTrend.length - 1].source}
          </p>
        </div>
      )}

      {item.sourceCitations && item.sourceCitations.length > 0 && (
        <div className="mt-6 pt-3 border-t border-zinc-100 text-[11px] text-zinc-400">
          <span className="font-mono uppercase text-[10px] text-zinc-400 block mb-1">Citations & Data Sources</span>
          {item.sourceCitations.join(" · ")}
        </div>
      )}

      <DataAttributionFooter
        extra={
          item.physicalTraits || item.audioAttribution
            ? "Physical traits shown above (where present) are real, individually cited facts (Wikidata/Wikipedia), and bird calls (where present) are real recordings from Xeno-canto, credited on this page — the rest of this species' data is still mock/placeholder."
            : undefined
        }
      />
    </>
  );
}
