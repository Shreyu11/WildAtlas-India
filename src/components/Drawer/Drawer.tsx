"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
    setTimeout(() => {
      router.push("/");
    }, TRANSITION_MS);
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
      className={`fixed inset-y-0 right-0 z-50 flex w-[30vw] min-w-[360px] flex-col rounded-l-[32px] border-l border-white/60 bg-white/90 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-ios ${
        entered ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* iOS Sheet Grab Bar Handle */}
      <div className="flex w-full justify-center pt-3 pb-1">
        <div className="h-1.2 w-10 rounded-full bg-zinc-300/80" />
      </div>

      {/* Top Header Bar */}
      <div className="sticky top-0 z-10 flex h-13 shrink-0 items-center justify-between border-b border-zinc-200/60 bg-white/70 px-6 backdrop-blur-xl">
        <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close panel"
          onClick={close}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 transition-all duration-200 ease-ios active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
