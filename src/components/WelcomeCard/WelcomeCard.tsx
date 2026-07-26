"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wildatlas-welcome-dismissed";

// Dismissible onboarding card (PRD Section 4.0) — one-tap dismiss, never
// shown again after. No personalized greeting yet: there's no user-identity
// system in Phase 1 scope, so this stays generic rather than faking one.
export default function WelcomeCard() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (dismissed) return null;

  return (
    <div className="absolute bottom-6 left-6 w-72 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold">Hi there 👋</p>
        <button
          type="button"
          aria-label="Dismiss welcome card"
          className="text-zinc-400 hover:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        >
          ✕
        </button>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        Explore India&apos;s wildlife state by state — tap a marker on the
        map, or start from a species on the left.
      </p>
    </div>
  );
}
