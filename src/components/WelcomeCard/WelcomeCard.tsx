"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "wildatlas-welcome-dismissed";

export default function WelcomeCard() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (dismissed) return null;

  return (
    <div className="absolute bottom-6 right-20 z-20 w-80 rounded-[22px] border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-2xl transition-all duration-200 ease-ios">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
        <p className="font-sans text-sm font-bold text-zinc-900">Hi there 👋</p>
        <button
          type="button"
          aria-label="Dismiss welcome card"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 transition-all duration-200 ease-ios active:scale-90"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2.5 text-xs font-normal leading-relaxed text-zinc-600">
        Explore India&apos;s wildlife state by state — tap a photo bubble on the
        map, or spotlight a species from search above.
      </p>
    </div>
  );
}
