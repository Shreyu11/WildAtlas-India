import React from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "../Badge/Badge";
import { CONSERVATION_LABEL } from "../../src/lib/conservation";
import type { Species } from "../../src/lib/types";

export interface MarkerTooltipProps {
  /** Species or place photo image URL */
  photoUrl?: string | null;
  /** Fallback icon/emoji if photo is unavailable */
  fallbackIcon?: string;
  /** Alt text for photo */
  altText?: string;
  /** Primary name label */
  label: string;
  /** Scientific name or subtitle */
  subtitle?: string;
  /** Quick description or fact text */
  fact?: string;
  /** Conservation status code */
  status?: Species["conservationStatus"];
  /** Controls compact (default width 112px) vs expanded state (width 224px) */
  expanded?: boolean;
  /** Shows speech-bubble tail pointing down */
  showTail?: boolean;
  /** Navigation link target */
  href?: string;
  /** Click handler for card */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Navigation handler */
  onNavigate?: () => void;
  /** Custom additional styling */
  className?: string;
}

const statusBadgeVariantMap: Record<NonNullable<Species["conservationStatus"]>, "red" | "amber" | "orange" | "yellow" | "emerald"> = {
  EX: "red",
  EW: "red",
  CR: "red",
  EN: "amber",
  VU: "orange",
  NT: "yellow",
  LC: "emerald",
};

export const MarkerTooltip: React.FC<MarkerTooltipProps> = ({
  photoUrl,
  fallbackIcon = "🐾",
  altText = "",
  label,
  subtitle,
  fact = "Iconic wildlife species native to India's diverse habitats.",
  status,
  expanded = false,
  showTail = true,
  href = "#",
  onClick,
  onNavigate,
  className = "",
}) => {
  return (
    <div
      className={`relative inline-flex flex-col items-center drop-shadow-lg select-none transition-all duration-300 ease-ios ${className}`}
    >
      {/* Tooltip Card Body */}
      <div
        onClick={(e) => {
          onClick?.(e);
          if (expanded) {
            onNavigate?.();
          }
        }}
        className={`flex flex-col items-center gap-1.5 rounded-2xl border border-white bg-white p-2 transition-[width] duration-300 ease-ios shadow-xs cursor-pointer ${
          expanded ? "w-56" : "w-28"
        }`}
      >
        {/* Photo Container */}
        <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-zinc-200 flex items-center justify-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={altText || label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">{fallbackIcon}</span>
          )}
        </div>

        {/* Primary Name Label */}
        <span
          className={`w-full font-mono font-semibold leading-tight text-zinc-800 transition-all ${
            expanded ? "text-left text-sm" : "text-center text-[10px]"
          }`}
        >
          {label}
        </span>

        {/* Expanded Details Section */}
        {expanded && (
          <div className="flex w-full flex-col items-start gap-1 text-left animate-in fade-in duration-200">
            {subtitle && (
              <p className="pt-0.5 text-[10px] italic text-zinc-500 font-mono">
                {subtitle}
              </p>
            )}

            <p className="text-xs leading-snug text-zinc-600 font-sans mt-1 line-clamp-3">
              {fact}
            </p>

            {/* Footer Row: Status Badge & Action Button */}
            <div className="mt-2 flex w-full items-center justify-between pt-0.5">
              <div className="flex items-center gap-1.5">
                {status && (
                  <Badge variant={statusBadgeVariantMap[status]} size="sm">
                    {CONSERVATION_LABEL[status]}
                  </Badge>
                )}
              </div>

              <a
                href={href}
                aria-label={`View ${label} details`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate?.();
                }}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white overflow-hidden transition-all duration-200 hover:bg-zinc-800 active:scale-90 shadow-2xs"
              >
                <ArrowRight className="h-3.5 w-3.5 animate-arrow-pass" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Pointer Speech Bubble Tail */}
      {showTail && (
        <div className="h-0 w-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-white shrink-0" />
      )}
    </div>
  );
};

MarkerTooltip.displayName = "MarkerTooltip";

export default MarkerTooltip;
