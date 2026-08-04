"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "wildatlas-ambient-audio-muted";
// Subtle background presence, not a distracting soundtrack.
const VOLUME = 0.4;

interface AmbientAudioContextValue {
  muted: boolean;
  toggleMuted: () => void;
}

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null);

// Loops a quiet jungle ambience track site-wide, muted by default (browsers
// block audible autoplay before a user gesture anyway, and starting silent
// is the least intrusive default). The header mute toggle is the only way
// to turn it on; that click is itself the gesture that satisfies autoplay
// policies, so play() succeeds there.
export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setMuted(stored === null ? true : stored === "true");
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    // Set `.muted` synchronously rather than relying on pause()/play() alone —
    // play() is async, so a quick mute click right after a play() call could
    // otherwise race and leave sound audible until that promise settles.
    audio.muted = muted;
    if (muted) {
      audio.pause();
    } else {
      audio.play().catch(() => setMuted(true));
    }
  }, [muted]);

  // Guard against a stray audio element left playing behind (e.g. a remount
  // during dev Fast Refresh) — always silence on unmount.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (!audio) return;
      audio.pause();
      audio.muted = true;
    };
  }, []);

  // Pause audio automatically when tab or browser window is hidden/out of view, and resume when refocused
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function handleVisibilityOrFocus() {
      if (document.hidden || !document.hasFocus()) {
        audio?.pause();
      } else if (!muted) {
        audio?.play().catch(() => {});
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("blur", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("blur", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [muted]);

  const toggleMuted = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMuted();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(() => ({ muted, toggleMuted }), [muted]);

  return (
    <AmbientAudioContext.Provider value={value}>
      <audio ref={audioRef} src="/audio/jungle-ambience.mp3" loop preload="none" />
      {children}
    </AmbientAudioContext.Provider>
  );
}

export function useAmbientAudio(): AmbientAudioContextValue {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx) {
    throw new Error("useAmbientAudio must be used within an AmbientAudioProvider");
  }
  return ctx;
}
