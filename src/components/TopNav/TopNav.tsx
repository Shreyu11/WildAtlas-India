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
    <nav className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-4 bg-white/5 px-4 backdrop-blur-[1px]">
      <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
        🐾 WildAtlas India
      </Link>

      {/* Absolutely centered on the full nav width — a flex mx-auto here
          would center within the leftover space between the logo and the
          icon row instead, which skews off true page-center since those
          two aren't the same width. */}
      <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
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
