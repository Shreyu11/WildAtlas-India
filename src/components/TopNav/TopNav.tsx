"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useAmbientAudio } from "@/components/AmbientAudioProvider/AmbientAudioProvider";
import { Volume2, VolumeX, Info, Bookmark, User } from "lucide-react";

export default function TopNav() {
  const { muted, toggleMuted } = useAmbientAudio();

  return (
    <nav className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-4 bg-white/5 px-4 backdrop-blur-[1px]">
      <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-zinc-900">
        🐾 WildAtlas India
      </Link>

      <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
        <SearchBar />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 text-zinc-600">
        <button
          type="button"
          aria-label={muted ? "Unmute jungle ambience" : "Mute jungle ambience"}
          onClick={toggleMuted}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          {muted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
        </button>
        <button
          type="button"
          aria-label="About WildAtlas India"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <Info className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          aria-label="Bookmarks"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <Bookmark className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          aria-label="Account"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <User className="h-4.5 w-4.5" />
        </button>
      </div>
    </nav>
  );
}
