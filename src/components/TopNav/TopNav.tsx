import Link from "next/link";
import SearchBar from "./SearchBar";

// Wordmark, centered search (filters the map — see SearchBar/Map.tsx), and
// info/bookmark/account icons (PRD Section 4.0). Simple line icons, no icon
// library dependency.

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M6 3.5h12v17l-6-4-6 4v-17z" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5" />
    </svg>
  );
}

export default function TopNav() {
  return (
    <nav className="flex h-16 w-full items-center gap-4 border-b border-zinc-200 px-4">
      <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
        🐾 WildAtlas India
      </Link>

      <div className="mx-auto w-full max-w-md">
        <SearchBar />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 text-zinc-600">
        <button type="button" aria-label="About WildAtlas India" className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400">
          <InfoIcon />
        </button>
        <button type="button" aria-label="Bookmarks" className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400">
          <BookmarkIcon />
        </button>
        <button type="button" aria-label="Account" className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400">
          <AccountIcon />
        </button>
      </div>
    </nav>
  );
}
