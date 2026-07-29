"use client";

import { useSearch } from "@/components/SearchProvider/SearchProvider";

// Filters/spotlights the map itself (see Map.tsx) rather than navigating —
// a deliberate departure from the earlier "jump to detail page" idea.
export default function SearchBar() {
  const { query, setQuery } = useSearch();

  return (
    <div className="relative w-full">
      {/* type="text", not "search" — type="search" adds the browser's own
          native clear-icon in Chrome/Edge/Safari, which stacked with our
          custom clear button below and showed two "x" icons at once. */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search species, states, or parks…"
        className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          ✕
        </button>
      )}
    </div>
  );
}
