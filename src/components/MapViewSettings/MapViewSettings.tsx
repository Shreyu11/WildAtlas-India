"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMapSettings, type MapSettings } from "@/components/MapSettingsProvider/MapSettingsProvider";

export default function MapViewSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleSetting } = useMapSettings();
  const panelRef = useRef<HTMLDivElement>(null);

  // Global Shift+V keyboard shortcut to toggle settings panel open/close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close panel on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleItems: Array<{
    key: keyof MapSettings;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      key: "mammals",
      label: "Mammals",
      description: "Tigers, elephants, lions & terrestrial mammals",
      icon: "🐾",
    },
    {
      key: "birds",
      label: "Birds",
      description: "Resident & migratory bird species",
      icon: "🦚",
    },
    {
      key: "zoos",
      label: "Zoo",
      description: "Ex-situ zoological gardens & parks",
      icon: "🏛️",
    },
    {
      key: "nationalParks",
      label: "National Park",
      description: "Protected national parks & reserves",
      icon: "🏞️",
    },
    {
      key: "wildlifeSanctuaries",
      label: "Wildlife Sanctuaries",
      description: "Protected wildlife habitats & reserves",
      icon: "🏕️",
    },
    {
      key: "birdSanctuaries",
      label: "Bird Sanctuaries",
      description: "Avian sanctuaries & wetlands",
      icon: "🪶",
    },
  ];

  return (
    <div ref={panelRef} className="absolute bottom-6 left-6 z-30 flex flex-col items-start">
      {/* Popover Settings Panel */}
      {isOpen && (
        <div className="mb-3 w-84 rounded-[24px] border border-zinc-300/80 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-ios animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60">
            <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800">
              Map View Settings
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 transition-all duration-200 ease-ios active:scale-90"
              title="Close settings"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Details Section */}
          <div className="mt-3">
            <div className="space-y-1.5">
              {toggleItems.map((item) => {
                const isActive = settings[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleSetting(item.key)}
                    className="group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer hover:bg-zinc-100/60 active:bg-zinc-200/50 transition-colors duration-150 ease-ios"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <span className="text-lg leading-none select-none p-1.5 rounded-xl bg-zinc-100 border border-black/5 shadow-2xs">{item.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-900 leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    {/* Authentic iOS Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSetting(item.key);
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-ios focus:outline-none ${
                        isActive ? "bg-emerald-500" : "bg-zinc-300/80"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-ios ${
                          isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom-left Trigger Button / Thumbnail */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-3 rounded-full border border-zinc-300/80 bg-white/90 p-2 pr-4 shadow-md backdrop-blur-xl transition-all duration-200 ease-ios hover:border-zinc-400 hover:bg-white active:scale-95 focus:outline-none"
        title="Map view settings (Shift+V)"
      >
        {/* Layer preview thumbnail */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 shadow-inner group-hover:scale-105 transition-transform duration-200 ease-ios">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-700"
          >
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
            <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 12.5" />
            <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 17.5" />
          </svg>
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="font-sans text-xs font-bold text-zinc-900 leading-tight">
            Map view
          </span>
          <span className="text-[10px] font-medium text-zinc-500 leading-tight">
            Layers & details
          </span>
        </div>
      </button>
    </div>
  );
}
