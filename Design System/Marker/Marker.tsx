import React from "react";

export interface MarkerProps {
  /** Marker type variant */
  type?: "species" | "national-park" | "sanctuary" | "zoo" | "cluster";
  /** Photo URL for species/location marker */
  photoUrl?: string | null;
  /** Emoji or icon symbol */
  icon?: string;
  /** Integer count for numbered cluster markers */
  count?: number;
  /** Optional label tag */
  label?: string;
  /** Click callback */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Custom additional styling */
  className?: string;
}

export const Marker: React.FC<MarkerProps> = ({
  type = "species",
  photoUrl,
  icon,
  count = 1,
  label,
  onClick,
  className = "",
}) => {
  // 1. Species Marker (44px circular photo / emoji)
  if (type === "species") {
    const defaultSpeciesIcon = icon || "🦚";
    return (
      <div
        onClick={onClick}
        className={`group relative inline-flex flex-col items-center gap-1 cursor-pointer select-none ${className}`}
      >
        <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-zinc-200 shadow-md transition-transform duration-200 ease-ios hover:scale-110 active:scale-95 flex items-center justify-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={label || "Species marker"} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl">{defaultSpeciesIcon}</span>
          )}
        </div>
        {label && (
          <span className="rounded-full bg-zinc-900/90 text-white px-2 py-0.5 font-mono text-[10px] font-semibold tracking-tight shadow-xs backdrop-blur-md">
            {label}
          </span>
        )}
      </div>
    );
  }

  // 2. Numbered Cluster Marker
  if (type === "cluster") {
    const size = count < 10 ? 32 : count < 25 ? 40 : 48;
    const textSizeClass = count < 10 ? "text-xs" : count < 25 ? "text-sm" : "text-base";

    return (
      <div
        onClick={onClick}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`flex items-center justify-center rounded-full border-2 border-zinc-700 bg-white font-mono font-bold text-zinc-800 shadow-md transition-transform duration-200 ease-ios hover:scale-110 active:scale-95 cursor-pointer select-none ${textSizeClass} ${className}`}
      >
        {count}
      </div>
    );
  }

  // 3. National Parks, Sanctuaries, and Zoos Pin Markers
  const iconMap: Record<"national-park" | "sanctuary" | "zoo", string> = {
    "national-park": "🏞️",
    sanctuary: "🪶",
    zoo: "🦁",
  };

  const defaultIcon = icon || iconMap[type as keyof typeof iconMap] || "📍";

  return (
    <div
      onClick={onClick}
      className={`group relative inline-flex flex-col items-center gap-1 cursor-pointer select-none ${className}`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-700 bg-white text-xs shadow-md shadow-black/10 transition-transform duration-200 ease-ios hover:scale-110 active:scale-95">
        <span>{defaultIcon}</span>
      </div>
      {label && (
        <span className="rounded-full bg-white/90 text-zinc-900 border border-zinc-200/80 px-2 py-0.5 font-sans text-[11px] font-semibold shadow-xs backdrop-blur-md">
          {label}
        </span>
      )}
    </div>
  );
};

Marker.displayName = "Marker";

export default Marker;
