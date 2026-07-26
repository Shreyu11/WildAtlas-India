// PRD Section 6/7: every data point needs a visible source. This prototype
// runs on hand-curated mock data, not the real pipeline yet — so the honest
// citation here is that fact itself, not a fabricated source.
export default function DataAttributionFooter() {
  return (
    <p className="mt-8 border-t border-zinc-200 pt-3 font-mono text-xs text-zinc-400">
      Mock/placeholder data for this prototype — not yet sourced from GBIF, IUCN Red List,
      eBird/State of India&apos;s Birds, ZSI, or WII.
    </p>
  );
}
