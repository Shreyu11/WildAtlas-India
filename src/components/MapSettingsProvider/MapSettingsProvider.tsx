"use client";

import { createContext, useContext, useMemo, useState, useRef } from "react";

export interface MapSettings {
  mammals: boolean;
  birds: boolean;
  zoos: boolean;
  nationalParks: boolean;
  birdSanctuaries: boolean;
  wildlifeSanctuaries: boolean;
}

interface Toast {
  id: number;
  message: string;
  enabled: boolean;
  iconName?: string;
}

interface MapSettingsContextValue {
  settings: MapSettings;
  toggleSetting: (key: keyof MapSettings) => void;
  setSetting: (key: keyof MapSettings, value: boolean) => void;
  toast: Toast | null;
  clearToast: () => void;
}

const SETTING_LABELS: Record<keyof MapSettings, { name: string; icon: string }> = {
  mammals: { name: "Mammal Species", icon: "🐅" },
  birds: { name: "Bird Species", icon: "🦅" },
  zoos: { name: "Zoos & Wildlife Parks", icon: "🐘" },
  nationalParks: { name: "National Parks", icon: "🏞️" },
  birdSanctuaries: { name: "Bird Sanctuaries", icon: "🪶" },
  wildlifeSanctuaries: { name: "Wildlife Sanctuaries", icon: "🏕️" },
};

const DEFAULT_SETTINGS: MapSettings = {
  mammals: true,
  birds: true,
  zoos: true,
  nationalParks: true,
  birdSanctuaries: true,
  wildlifeSanctuaries: true,
};

const MapSettingsContext = createContext<MapSettingsContextValue | null>(null);

export function MapSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<MapSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (key: keyof MapSettings, newStatus: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const meta = SETTING_LABELS[key];
    const message = `${meta.name} layer ${newStatus ? "enabled" : "disabled"}`;
    setToast({
      id: Date.now(),
      message,
      enabled: newStatus,
      iconName: meta.icon,
    });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  const toggleSetting = (key: keyof MapSettings) => {
    setSettings((prev) => {
      const nextVal = !prev[key];
      showToast(key, nextVal);
      return { ...prev, [key]: nextVal };
    });
  };

  const setSetting = (key: keyof MapSettings, value: boolean) => {
    setSettings((prev) => {
      if (prev[key] !== value) {
        showToast(key, value);
      }
      return { ...prev, [key]: value };
    });
  };

  const clearToast = () => setToast(null);

  const value = useMemo(
    () => ({ settings, toggleSetting, setSetting, toast, clearToast }),
    [settings, toast],
  );

  return (
    <MapSettingsContext.Provider value={value}>
      {children}
      {/* iOS Glassmorphic Floating Snackbar Toast */}
      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-zinc-900/90 px-4 py-2.5 text-xs font-medium text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-ios animate-in fade-in slide-in-from-bottom-3"
        >
          <span className="text-sm select-none">{toast.iconName || "🗺️"}</span>
          <span className="font-sans text-xs font-medium tracking-tight text-zinc-100">
            {toast.message}
          </span>
          <span
            className={`h-2 w-2 rounded-full transition-colors ${
              toast.enabled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-500"
            }`}
          />
        </div>
      )}
    </MapSettingsContext.Provider>
  );
}

export function useMapSettings(): MapSettingsContextValue {
  const ctx = useContext(MapSettingsContext);
  if (!ctx) {
    throw new Error("useMapSettings must be used within a MapSettingsProvider");
  }
  return ctx;
}
