import React from "react";
import { ExternalLink, Globe, Compass, Landmark } from "lucide-react";
import { Badge } from "../Badge/Badge";

export interface NavigationLinkItemProps {
  /** Primary link title label */
  label: string;
  /** Destination URL */
  url: string;
  /** Explicit domain text (auto-formatted from URL if omitted) */
  domain?: string;
  /** Category tier affecting icon and accent color */
  category?: "official" | "travel" | "wiki" | "general";
  /** Custom icon override */
  icon?: React.ReactNode;
  /** Custom additional styling */
  className?: string;
}

export interface SpeciesListItemProps {
  /** Species common name */
  commonName: string;
  /** Scientific name text (rendered in italics) */
  scientificName?: string;
  /** Photo URL for thumbnail circle */
  photoUrl?: string | null;
  /** Fallback icon emoji */
  fallbackIcon?: string;
  /** Optional badge tag (e.g. "DOMINANT" or "STATE ANIMAL") */
  tag?: string;
  /** Conservation status code (CR, EN, VU, NT, LC) or custom status text */
  status?: "CR" | "EN" | "VU" | "NT" | "LC" | string;
  /** Explicit status badge color variant override */
  statusVariant?: "red" | "amber" | "orange" | "yellow" | "emerald" | "neutral";
  /** Optional click or link handler */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Custom additional styling */
  className?: string;
}

export interface ListProps {
  /** Optional section header title (e.g. "OFFICIAL") */
  header?: string;
  /** Child list items */
  children: React.ReactNode;
  /** Custom additional styling */
  className?: string;
}

function formatDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

function getCategoryBadge(category?: string, domainStr?: string) {
  if (category === "official" || domainStr?.includes("gov.in") || domainStr?.includes("nic.in")) {
    return {
      icon: Landmark,
      bg: "bg-emerald-50 border-emerald-200/80 text-emerald-700",
    };
  }
  if (category === "travel" || domainStr?.includes("wikivoyage") || domainStr?.includes("tourism")) {
    return {
      icon: Compass,
      bg: "bg-sky-50 border-sky-200/80 text-sky-700",
    };
  }
  return {
    icon: Globe,
    bg: "bg-zinc-100 border-zinc-200/80 text-zinc-700",
  };
}

export const NavigationLinkItem: React.FC<NavigationLinkItemProps> = ({
  label,
  url,
  domain: customDomain,
  category = "official",
  icon: customIcon,
  className = "",
}) => {
  const domainText = customDomain || formatDomain(url);
  const badge = getCategoryBadge(category, domainText);
  const IconComponent = badge.icon;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-2xs hover:border-emerald-500/50 hover:bg-zinc-50/50 hover:shadow-xs cursor-pointer transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 font-sans">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${badge.bg}`}>
          {customIcon || <IconComponent className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-zinc-900 truncate group-hover:text-emerald-800 transition-colors">
            {label}
          </p>
          <p className="font-mono text-xs text-zinc-400 truncate mt-0.5">
            {domainText}
          </p>
        </div>
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </a>
  );
};

const statusVariantMap: Record<string, "red" | "amber" | "orange" | "yellow" | "emerald" | "neutral"> = {
  CR: "red",
  EN: "red",
  VU: "orange",
  NT: "yellow",
  LC: "emerald",
};

const statusLabelMap: Record<string, string> = {
  CR: "Critically Endangered",
  EN: "Endangered",
  VU: "Vulnerable",
  NT: "Near Threatened",
  LC: "Least Concern",
};

export const SpeciesListItem: React.FC<SpeciesListItemProps> = ({
  commonName,
  scientificName,
  photoUrl,
  fallbackIcon = "🐾",
  tag,
  status,
  statusVariant,
  onClick,
  className = "",
}) => {
  const badgeVariant = statusVariant || (status ? statusVariantMap[status] || "neutral" : undefined);
  const statusDisplayLabel = status ? statusLabelMap[status] || status : undefined;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50/50 cursor-pointer transition-all duration-200 ${
        onClick ? "active:scale-[0.99]" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Photo Thumbnail */}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-200/80 bg-zinc-100 flex items-center justify-center text-lg">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={commonName} className="h-full w-full object-cover" />
          ) : (
            <span>{fallbackIcon}</span>
          )}
        </div>

        {/* Title, Tag & Scientific Name */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-zinc-900 truncate font-sans">
              {commonName}
            </p>
            {tag && (
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded">
                {tag}
              </span>
            )}
          </div>
          {scientificName && (
            <p className="text-xs italic text-zinc-400 truncate mt-0.5 font-sans">
              {scientificName}
            </p>
          )}
        </div>
      </div>

      {/* Right Conservation Status Badge */}
      {statusDisplayLabel && badgeVariant && (
        <div className="shrink-0">
          <Badge variant={badgeVariant}>{statusDisplayLabel}</Badge>
        </div>
      )}
    </div>
  );
};

export const List: React.FC<ListProps> & {
  LinkItem: typeof NavigationLinkItem;
  SpeciesItem: typeof SpeciesListItem;
} = ({ header, children, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {header && (
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1 mb-1.5">
          {header}
        </span>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
};

List.LinkItem = NavigationLinkItem;
List.SpeciesItem = SpeciesListItem;

List.displayName = "List";

export default List;
