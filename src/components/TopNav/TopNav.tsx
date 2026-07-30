"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useAmbientAudio } from "@/components/AmbientAudioProvider/AmbientAudioProvider";
import { Volume2, VolumeX, Info, Bookmark, User } from "lucide-react";

export default function TopNav() {
  const { muted, toggleMuted } = useAmbientAudio();

  return (
    <nav className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between gap-4 px-6 border-b border-white/40 bg-white/70 backdrop-blur-2xl shadow-sm">
      <Link href="/" className="shrink-0 flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 active:scale-95 transition-transform ease-ios">
        <span className="text-xl select-none">🐾</span>
        <span className="font-semibold tracking-tight">WildAtlas India</span>
      </Link>

      <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
        <SearchBar />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 text-zinc-700">
        <button
          type="button"
          aria-label={muted ? "Unmute jungle ambience" : "Mute jungle ambience"}
          onClick={toggleMuted}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200/50 hover:bg-zinc-200/80 text-zinc-700 transition-all duration-200 ease-ios active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          title={muted ? "Unmute sound (Shift+M)" : "Mute sound (Shift+M)"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          type="button"
          aria-label="About WildAtlas India"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200/50 hover:bg-zinc-200/80 text-zinc-700 transition-all duration-200 ease-ios active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <Info className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Bookmarks"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200/50 hover:bg-zinc-200/80 text-zinc-700 transition-all duration-200 ease-ios active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <Bookmark className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Account"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200/50 hover:bg-zinc-200/80 text-zinc-700 transition-all duration-200 ease-ios active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
