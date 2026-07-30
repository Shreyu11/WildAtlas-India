"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/components/SearchProvider/SearchProvider";

// Filters/spotlights the map itself (see Map.tsx) rather than navigating —
// a deliberate departure from the earlier "jump to detail page" idea.
export default function SearchBar() {
  const { query, setQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full">
      {/* type="text", not "search" — type="search" adds the browser's own
          native clear-icon in Chrome/Edge/Safari, which stacked with our
          custom clear button below and showed two "x" icons at once. */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search species, states, or parks…"
        className="h-12 w-full rounded-full border border-zinc-200 bg-zinc-50 px-5 pr-12 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400 shadow-sm"
      />
      {!query ? (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden select-none rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400 sm:inline-block">
          ⌘K
        </kbd>
      ) : (
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
