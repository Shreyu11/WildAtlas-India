import { Badge } from "@/design-system";
import Link from "next/link";
import { X } from "lucide-react";
import { getSpecies } from "@/lib/data";
import { CONSERVATION_LABEL } from "@/lib/conservation";
import { SPECIES_ICON, DEFAULT_SPECIES_ICON } from "@/lib/mockIcons";

export default async function SpeciesIndexPage() {
  const species = await getSpecies();
  const sorted = [...species].sort((a, b) => a.commonName.localeCompare(b.commonName));
  const mammalCount = species.filter((s) => s.taxon === "mammal").length;
  const birdCount = species.filter((s) => s.taxon === "bird").length;

  return (
    <div className="w-full px-6 pt-24 pb-12">
      <div className="mx-auto w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white px-6">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-700">
            All Species
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
            {species.length} species &middot; {mammalCount} mammals &middot; {birdCount} birds
          </p>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {sorted.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/species/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-2xs transition-colors hover:bg-zinc-50/80"
                >
                  <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                    {item.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photoUrl}
                        alt={item.commonName}
                        className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-3xl">
                        {SPECIES_ICON[item.slug] ?? DEFAULT_SPECIES_ICON}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <p className="truncate text-xs font-semibold text-zinc-900">{item.commonName}</p>
                    <p className="truncate text-[11px] italic text-zinc-500">{item.scientificName}</p>
                    <div className="mt-1">
                      <Badge variant={item.conservationStatus} size="sm">
                        {CONSERVATION_LABEL[item.conservationStatus]}
                      </Badge>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
