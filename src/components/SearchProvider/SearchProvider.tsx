"use client";

import { createContext, useContext, useMemo, useState } from "react";

// Pure in-memory client state — no URL params, no network cost — shared
// between TopNav (writer, layout.tsx) and Map (reader, page.tsx), which
// are siblings in different subtrees and can't pass props directly.
// Search operates on the map itself (spotlight/highlight), not navigation.
interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}
