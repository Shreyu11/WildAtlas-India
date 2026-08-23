"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMapSettings, type MapSettings } from "@/components/MapSettingsProvider/MapSettingsProvider";

import { IconButton, Toggle, Button, zIndex, glassmorphism } from "@/design-system";

export default function MapViewSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const { settings, toggleSetting } = useMapSettings();
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(selectedIndex);

  const toggleItems: Array<{
    key: keyof MapSettings;
    label: string;
    icon: string;
  }> = [
    {
      key: "mammals",
      label: "Mammals",
      icon: "🐾",
    },
    {
      key: "birds",
      label: "Birds",
      icon: "🦚",
    },
    {
      key: "zoos",
      label: "Zoos",
      icon: "🏛️",
    },
    {
      key: "nationalParks",
      label: "National Parks",
      icon: "🏞️",
    },
    {
      key: "wildlifeSanctuaries",
      label: "Wildlife Sanctuaries",
      icon: "🏕️",
    },
    {
      key: "birdSanctuaries",
      label: "Bird Sanctuaries",
      icon: "🪶",
    },
  ];

  // Sync ref with selectedIndex
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // Reset keyboard navigation index whenever panel opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

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

  // Panel-open Keyboard navigation (Up/Down arrows, Enter to toggle, Esc to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Esc to close menu
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      // 2. Arrow Down to navigate down
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % toggleItems.length);
        return;
      }

      // 3. Arrow Up to navigate up
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + toggleItems.length) % toggleItems.length);
        return;
      }

      // 4. Enter or Space to trigger toggle
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const targetKey = toggleItems[selectedIndexRef.current]?.key;
        if (targetKey) {
          toggleSetting(targetKey);
        }
        return;
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, toggleItems, toggleSetting]);

  return (
    <div ref={panelRef} className={`absolute bottom-6 left-6 ${zIndex.topNav} flex flex-col items-start`}>
      {/* Popover Settings Panel */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-[24px] border border-zinc-300/80 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-ios animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60">
            <div>
              <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800">
                Layer details
              </h2>
              <span className="font-mono text-[10px] text-zinc-400 block mt-0.5">
                ↑/↓ Navigate · Enter Toggle · Esc Close
              </span>
            </div>
            <IconButton
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
              title="Close settings (Esc)"
              aria-label="Close settings"
              icon={<X className="h-4 w-4" />}
            />
          </div>

          {/* Details Section */}
          <div className="mt-3">
            <div className="space-y-1.5">
              {toggleItems.map((item, index) => {
                const isActive = settings[item.key];
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      setSelectedIndex(index);
                      toggleSetting(item.key);
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-150 ease-ios ${
                      isSelected
                        ? "bg-zinc-200/80 text-zinc-900 shadow-2xs"
                        : "hover:bg-zinc-100 text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <span className="text-lg leading-none select-none p-1.5 rounded-xl bg-zinc-100 border border-black/5 shadow-2xs">
                        {item.icon}
                      </span>
                      <span className="text-sm font-semibold text-zinc-900 leading-tight">
                        {item.label}
                      </span>
                    </div>

                    <Toggle
                      checked={isActive}
                      aria-label={`Toggle ${item.label}`}
                      tabIndex={-1}
                      onChange={() => {
                        setSelectedIndex(index);
                        toggleSetting(item.key);
                      }}
                    />
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
        className={`group flex items-center gap-3 rounded-full ${glassmorphism.floatingCapsule} p-2 pr-4 transition-all duration-200 ease-ios hover:border-zinc-400 hover:bg-white active:scale-95 focus:outline-none`}
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
        <div className="flex flex-col items-start text-left gap-1">
          <span className="font-sans text-xs font-bold text-zinc-900 leading-tight">
            Layer details
          </span>
          <span className="font-mono text-[10px] font-medium text-zinc-500 leading-tight">
            Shift + V
          </span>
        </div>
      </button>
    </div>
  );
}
