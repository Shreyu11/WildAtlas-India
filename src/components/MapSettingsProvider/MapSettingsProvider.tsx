"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface MapSettings {
  mammals: boolean;
  birds: boolean;
  zoos: boolean;
  nationalParks: boolean;
  birdSanctuaries: boolean;
  wildlifeSanctuaries: boolean;
}

interface MapSettingsContextValue {
  settings: MapSettings;
  toggleSetting: (key: keyof MapSettings) => void;
  setSetting: (key: keyof MapSettings, value: boolean) => void;
}

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

  const toggleSetting = (key: keyof MapSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setSetting = (key: keyof MapSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const value = useMemo(
    () => ({ settings, toggleSetting, setSetting }),
    [settings],
  );

  return (
    <MapSettingsContext.Provider value={value}>
      {children}
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
