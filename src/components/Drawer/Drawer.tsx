"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Renders inside an intercepted route (src/app/@modal) so the map stays
// mounted and interactive behind it. Dismissal goes back in history rather
// than navigating to "/", since the drawer was opened via a pushed history
// entry (the Next.js-documented pattern for intercepting routes) — no
// backdrop, so the map underneath stays fully pannable/zoomable.
export default function Drawer({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[24vw] overflow-y-auto bg-white shadow-2xl">
      <button
        type="button"
        aria-label="Close"
        onClick={() => router.back()}
        className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
      >
        ✕
      </button>
      <div className="p-8">{children}</div>
    </div>
  );
}
