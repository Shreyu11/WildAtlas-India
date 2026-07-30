"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/components/SearchProvider/SearchProvider";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const { query, setQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        e.preventDefault();
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex items-center w-full group">
      <Search className="absolute left-4 z-10 h-4 w-4 text-zinc-800 pointer-events-none transition-colors" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Spotlight species, states, or parks…"
        className="h-11 w-full rounded-full border border-zinc-300/80 hover:border-zinc-400 focus:border-zinc-500 bg-white/90 hover:bg-white focus:bg-white pl-11 pr-12 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-black/5 shadow-md backdrop-blur-xl transition-all duration-200 ease-ios"
      />
      {!query ? (
        <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 hidden select-none rounded-md border border-black/10 bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 shadow-2xs sm:inline-block">
          ⌘K
        </kbd>
      ) : (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-300/60 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 transition-colors active:scale-90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
