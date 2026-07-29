"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Slide-in/out duration — kept in sync with the transition-duration class
// below so the router.back() navigation (which unmounts this component) is
// deferred until the closing animation has actually finished playing.
const TRANSITION_MS = 300;

// Renders inside an intercepted route (src/app/@modal) so the map stays
// mounted and interactive behind it. Dismissal goes back in history rather
// than navigating to "/", since the drawer was opened via a pushed history
// entry (the Next.js-documented pattern for intercepting routes) — no
// backdrop, so the map underneath stays fully pannable/zoomable.
export default function Drawer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // Mount off-screen, then flip on the next frame so the transform
    // transition actually animates rather than starting already-open.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function close() {
    setEntered(false);
    setTimeout(() => router.back(), TRANSITION_MS);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-[24vw] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
        entered ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
      >
        ✕
      </button>
      <div className="p-8">{children}</div>
    </div>
  );
}
