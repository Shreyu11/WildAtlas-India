"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Slide-in/out duration — kept in sync with the transition-duration class
// below so the router.back() navigation (which unmounts this component) is
// deferred until the closing animation has actually finished playing.
const TRANSITION_MS = 300;

interface DrawerProps {
  children: React.ReactNode;
  title?: string;
}

export default function Drawer({ children, title = "Species Info" }: DrawerProps) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
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
  }, [router]);

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 flex w-[28vw] min-w-[340px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
        entered ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Top Header Bar */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur-md">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-700">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close panel"
          onClick={close}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
