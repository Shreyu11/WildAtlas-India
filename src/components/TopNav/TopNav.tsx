"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useAmbientAudio } from "@/components/AmbientAudioProvider/AmbientAudioProvider";
import { Volume2, VolumeX, Info, Bookmark, User } from "lucide-react";

export default function TopNav() {
  const { muted, toggleMuted } = useAmbientAudio();

  return (
    <nav className="fixed inset-x-0 top-0 z-30 pointer-events-none flex h-20 items-center justify-between gap-4 px-6">
      {/* Floating Logo Capsule */}
      <Link
        href="/"
        className="pointer-events-auto shrink-0 flex items-center gap-2 rounded-full border border-zinc-300/80 bg-white/90 px-4 py-2 text-sm font-semibold tracking-tight text-zinc-900 shadow-md backdrop-blur-xl transition-all duration-200 ease-ios hover:border-zinc-400 hover:bg-white active:scale-95"
      >
        <span className="text-base select-none">🐾</span>
        <span className="font-semibold tracking-tight">WildAtlas India</span>
      </Link>

      {/* Floating Search Capsule */}
      <div className="pointer-events-auto absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
        <SearchBar />
      </div>

      {/* Floating Action Cluster Capsule */}
      <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-1 rounded-full border border-zinc-300/80 bg-white/90 p-1.5 px-2 shadow-md backdrop-blur-xl">
        <button
          type="button"
          aria-label={muted ? "Unmute jungle ambience" : "Mute jungle ambience"}
          onClick={toggleMuted}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 transition-all duration-150 ease-ios active:scale-90"
          title={muted ? "Unmute sound (Shift+M)" : "Mute sound (Shift+M)"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          type="button"
          aria-label="About WildAtlas India"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 transition-all duration-150 ease-ios active:scale-90"
        >
          <Info className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Bookmarks"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 transition-all duration-150 ease-ios active:scale-90"
        >
          <Bookmark className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Account"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 transition-all duration-150 ease-ios active:scale-90"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
