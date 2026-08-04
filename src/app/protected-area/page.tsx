import Link from "next/link";
import { X } from "lucide-react";
import { getNationalParks, getSanctuaries, getZoos, getSpecies } from "@/lib/data";
import { PROTECTED_AREA_ICON, ZOO_ICON } from "@/lib/mockIcons";
import type { ProtectedArea, Zoo } from "@/lib/types";

type Row =
  | { kind: "protected-area"; href: string; data: ProtectedArea }
  | { kind: "zoo"; href: string; data: Zoo };

function missingFields(row: Row): string[] {
  const missing: string[] = [];
  if (!row.data.photoUrl) missing.push("photo");
  if (!row.data.description) missing.push("description");
  if (!row.data.additionalKeySpeciesSlugs || row.data.additionalKeySpeciesSlugs.length === 0) missing.push("species");
  if (row.kind === "protected-area") {
    const travel = row.data.travelLinks;
    if (!travel || (travel.official.length === 0 && travel.operators.length === 0)) missing.push("travel links");
  }
  return missing;
}

export default async function ProtectedAreaIndexPage() {
  const [nationalParks, sanctuaries, zoos, species] = await Promise.all([
    getNationalParks(),
    getSanctuaries(),
    getZoos(),
    getSpecies(),
  ]);
  const speciesBySlug = new Map(species.map((s) => [s.slug, s]));

  const rows: Row[] = [
    ...nationalParks.map((data) => ({ kind: "protected-area" as const, href: `/protected-area/${data.slug}`, data })),
    ...sanctuaries.map((data) => ({ kind: "protected-area" as const, href: `/protected-area/${data.slug}`, data })),
    ...zoos.map((data) => ({ kind: "zoo" as const, href: `/zoo/${data.slug}`, data })),
  ].sort((a, b) => a.data.name.localeCompare(b.data.name));

  const withPhoto = rows.filter((r) => r.data.photoUrl).length;
  const withDescription = rows.filter((r) => r.data.description).length;
  const withSpecies = rows.filter((r) => (r.data.additionalKeySpeciesSlugs?.length ?? 0) > 0).length;
  const withTravel = rows.filter(
    (r) => r.kind === "protected-area" && ((r.data.travelLinks?.official.length ?? 0) > 0 || (r.data.travelLinks?.operators.length ?? 0) > 0)
  ).length;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-700">
            All Parks, Sanctuaries &amp; Zoos
          </h2>
          <Link
            href="/"
            aria-label="Close panel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="p-6">
          <p className="mb-6 font-mono text-[11px] text-zinc-500">
            {rows.length} entities &middot; {nationalParks.length} national parks &middot; {sanctuaries.length} sanctuaries &middot;{" "}
            {zoos.length} zoos
            <br />
            {withPhoto}/{rows.length} have a photo &middot; {withDescription}/{rows.length} have a description &middot;{" "}
            {withSpecies}/{rows.length} have additional species &middot; {withTravel}/{nationalParks.length + sanctuaries.length} parks/sanctuaries have travel links
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {rows.map((row) => {
              const missing = missingFields(row);
              const typeIcon = row.kind === "zoo" ? ZOO_ICON : PROTECTED_AREA_ICON[(row.data as ProtectedArea).type] ?? "🌲";
              const typeLabel =
                row.kind === "zoo" ? "zoo" : (row.data as ProtectedArea).type.replace(/-/g, " ");
              const additionalNames = (row.data.additionalKeySpeciesSlugs ?? [])
                .map((slug) => speciesBySlug.get(slug)?.commonName)
                .filter((name): name is string => Boolean(name));

              return (
                <li key={row.href}>
                  <Link
                    href={row.href}
                    className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-2xs transition-colors hover:bg-zinc-50/80"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-zinc-100">
                      {row.data.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.data.photoUrl}
                          alt={row.data.name}
                          className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-3xl">{typeIcon}</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{typeIcon}</span>
                        <p className="truncate text-xs font-semibold text-zinc-900">{row.data.name}</p>
                      </div>
                      <p className="truncate font-mono text-[10px] uppercase text-zinc-400">{typeLabel}</p>

                      {row.data.description ? (
                        <p className="mt-1 line-clamp-2 text-[11px] text-zinc-600 leading-snug">{row.data.description}</p>
                      ) : (
                        <p className="mt-1 text-[11px] italic text-zinc-400">No description yet</p>
                      )}

                      {additionalNames.length > 0 && (
                        <p className="mt-1 truncate text-[10px] text-zinc-500">
                          Also: {additionalNames.join(", ")}
                        </p>
                      )}

                      {missing.length > 0 && (
                        <p className="mt-auto pt-1.5 text-[10px] text-zinc-500">
                          ⚠ Missing: {missing.join(", ")}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
