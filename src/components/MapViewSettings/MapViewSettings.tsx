"use client";

import { useEffect, useRef, useState } from "react";
import { useMapSettings, type MapSettings } from "@/components/MapSettingsProvider/MapSettingsProvider";

export default function MapViewSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleSetting } = useMapSettings();
  const panelRef = useRef<HTMLDivElement>(null);

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
        <div className="mb-3 w-80 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-900 tracking-tight">
                Map view settings
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
                title="Close settings"
                aria-label="Close settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-3">
            <span className="block font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Details
            </span>

            <div className="space-y-2.5">
              {toggleItems.map((item) => {
                const isActive = settings[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleSetting(item.key)}
                    className="group flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-zinc-50 transition"
                  >
                    <div className="flex items-center gap-2.5 pr-2">
                      <span className="text-base leading-none select-none">{item.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-800 leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    {/* Custom Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSetting(item.key);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? "bg-zinc-800" : "bg-zinc-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isActive ? "translate-x-4" : "translate-x-0"
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
        className="group flex items-center gap-2.5 rounded-2xl border border-zinc-300 bg-white/95 p-1.5 pr-3.5 shadow-lg backdrop-blur-md transition hover:border-zinc-400 hover:shadow-xl focus:outline-none"
        title="Map view settings"
      >
        {/* Layer preview thumbnail */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-inner group-hover:scale-105 transition">
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
          <span className="font-mono text-[11px] font-bold text-zinc-800 leading-tight">
            Map view
          </span>
          <span className="text-[10px] text-zinc-500 leading-tight">
            Layers & details
          </span>
        </div>
      </button>
    </div>
  );
}
