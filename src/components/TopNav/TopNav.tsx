"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import { useAmbientAudio } from "@/components/AmbientAudioProvider/AmbientAudioProvider";
import { Volume2, VolumeX, Info } from "lucide-react";

export default function TopNav() {
  const { muted, toggleMuted } = useAmbientAudio();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isListView =
    pathname === "/species" ||
    pathname === "/protected-area" ||
    pathname.startsWith("/species") ||
    pathname.startsWith("/protected-area");

  return (
    <nav className="fixed inset-x-0 top-0 z-30 pointer-events-none flex h-20 items-center justify-between gap-4 px-6 transition-all duration-300">
      {/* Progressive Background Blur Bar on-scroll for List View only */}
      <div
        className={`absolute inset-x-0 top-0 h-28 transition-all duration-300 pointer-events-none ${
          isListView && scrolled
            ? "bg-gradient-to-b from-white/75 via-white/45 to-transparent backdrop-blur-xl opacity-100"
            : "bg-transparent backdrop-blur-none opacity-0"
        }`}
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
        }}
      />

      {/* Floating Logo Capsule */}
      <Link
        href="/"
        className="pointer-events-auto relative z-10 shrink-0 flex items-center gap-2 rounded-full border border-zinc-300/80 bg-white/90 px-4 py-2 text-sm font-semibold tracking-tight text-zinc-900 shadow-md backdrop-blur-xl transition-all duration-200 ease-ios hover:border-zinc-400 hover:bg-white active:scale-95"
      >
        <span className="text-base select-none">🐾</span>
        <span className="font-semibold tracking-tight">WildAtlas India</span>
      </Link>

      {/* Floating Search Capsule */}
      <div className="pointer-events-auto absolute left-1/2 top-1/2 z-10 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
        <SearchBar />
      </div>

      {/* Floating Action Cluster Capsule */}
      <div className="pointer-events-auto relative z-10 ml-auto flex shrink-0 items-center gap-1 rounded-full border border-zinc-300/80 bg-white/90 p-1.5 px-2 shadow-md backdrop-blur-xl">
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
      </div>
    </nav>
  );
}
