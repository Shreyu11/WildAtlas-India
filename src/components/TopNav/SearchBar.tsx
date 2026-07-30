"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/components/SearchProvider/SearchProvider";
import { Search, X } from "lucide-react";
import type { Species, State, ProtectedArea } from "@/lib/types";
import { DEFAULT_SPECIES_ICON, SPECIES_ICON } from "@/lib/mockIcons";

interface SuggestionItem {
  id: string;
  category: "species" | "states" | "parks";
  title: string;
  subtitle?: string;
  slug: string;
  href: string;
  photoUrl?: string | null;
  icon?: string;
  badge?: string;
  globalIndex: number;
}

export default function SearchBar() {
  const { query, setQuery } = useSearch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [data, setData] = useState<{
    species: Species[];
    states: State[];
    protectedAreas: ProtectedArea[];
  }>({ species: [], states: [], protectedAreas: [] });

  // Load dataset asynchronously on mount for instant client-side searching
  useEffect(() => {
    Promise.all([
      fetch("/data/species.json").then((r) => (r.ok ? r.json() : [])),
      fetch("/data/states.json").then((r) => (r.ok ? r.json() : [])),
      fetch("/data/national-parks.json").then((r) => (r.ok ? r.json() : [])),
      fetch("/data/sanctuaries.json").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([species, states, nps, sanctuaries]) => {
        setData({
          species: Array.isArray(species) ? species : [],
          states: Array.isArray(states) ? states : [],
          protectedAreas: [...(Array.isArray(nps) ? nps : []), ...(Array.isArray(sanctuaries) ? sanctuaries : [])],
        });
      })
      .catch(() => {});
  }, []);

  // Compute matching suggestions grouped by category
  const { suggestions, flatSuggestions } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { suggestions: [], flatSuggestions: [] };

    let counter = 0;

    // 1. Species matches
    const matchedSpecies: SuggestionItem[] = data.species
      .filter(
        (s) =>
          s.commonName.toLowerCase().includes(q) ||
          s.scientificName.toLowerCase().includes(q) ||
          s.taxon.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((s) => ({
        id: `species-${s.slug}`,
        category: "species",
        title: s.commonName,
        subtitle: s.scientificName,
        slug: s.slug,
        href: `/species/${s.slug}`,
        photoUrl: s.photoUrl,
        icon: SPECIES_ICON[s.slug] ?? DEFAULT_SPECIES_ICON,
        badge: s.taxon === "mammal" ? "Mammal" : "Bird",
        globalIndex: counter++,
      }));

    // 2. State & UT matches
    const matchedStates: SuggestionItem[] = data.states
      .filter((st) => st.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((st) => ({
        id: `state-${st.slug}`,
        category: "states",
        title: st.name,
        subtitle: `State / UT • ${st.speciesSlugs.length} species`,
        slug: st.slug,
        href: `/state/${st.slug}`,
        icon: "🗺️",
        badge: "State",
        globalIndex: counter++,
      }));

    // 3. Protected Area & Sanctuary matches
    const matchedParks: SuggestionItem[] = data.protectedAreas
      .filter(
        (pa) =>
          pa.name.toLowerCase().includes(q) ||
          pa.stateSlug.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((pa) => ({
        id: `pa-${pa.slug}`,
        category: "parks",
        title: pa.name,
        subtitle: pa.stateSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        slug: pa.slug,
        href: `/protected-area/${pa.slug}`,
        icon: pa.type === "national-park" ? "🏞️" : pa.type === "bird-sanctuary" ? "🪶" : "🏕️",
        badge: pa.type === "national-park" ? "National Park" : pa.type === "bird-sanctuary" ? "Bird Sanctuary" : "Wildlife Sanctuary",
        globalIndex: counter++,
      }));

    const flat = [...matchedSpecies, ...matchedStates, ...matchedParks];

    const grouped = [
      { category: "species", label: "Species 🐾", items: matchedSpecies },
      { category: "states", label: "States & UTs 🗺️", items: matchedStates },
      { category: "parks", label: "Parks & Sanctuaries 🏞️", items: matchedParks },
    ].filter((g) => g.items.length > 0);

    return { suggestions: grouped, flatSuggestions: flat };
  }, [query, data]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
    setIsOpen(query.trim().length > 0);
  }, [query]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Selection action
  const handleSelect = (item: SuggestionItem) => {
    setQuery(item.title);
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(item.href);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatSuggestions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flatSuggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatSuggestions.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flatSuggestions.length) % flatSuggestions.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && flatSuggestions[selectedIndex]) {
        handleSelect(flatSuggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Global Cmd+K trigger shortcut
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center w-full group">
      <Search className="absolute left-4 z-10 h-4 w-4 text-zinc-800 pointer-events-none transition-colors" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onFocus={() => setIsOpen(query.trim().length > 0)}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
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
          onClick={() => {
            setQuery("");
            setIsOpen(false);
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-300/60 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 transition-colors active:scale-90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* iOS Glassmorphic Autosuggest Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-[380px] overflow-y-auto rounded-[24px] border border-white/80 bg-white/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 ease-ios z-50 divide-y divide-zinc-100">
          {flatSuggestions.length === 0 ? (
            <div className="p-4 text-center text-xs font-medium text-zinc-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            suggestions.map((group) => (
              <div key={group.category} className="py-1.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <span>{group.label}</span>
                  <span className="font-mono text-[9px] text-zinc-400">{group.items.length}</span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {group.items.map((item) => {
                    const isSelected = selectedIndex === item.globalIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                        className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-150 ease-ios ${
                          isSelected
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "hover:bg-zinc-100/80 text-zinc-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {item.photoUrl ? (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-zinc-100 shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.photoUrl} alt={item.title} className="h-full w-full object-cover" />
                            </span>
                          ) : (
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base border select-none ${isSelected ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-zinc-100"}`}>
                              {item.icon || "🐾"}
                            </span>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold leading-tight truncate">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className={`text-[11px] leading-tight truncate mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        {item.badge && (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${
                            isSelected
                              ? "bg-zinc-800 text-zinc-200"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200/80"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
