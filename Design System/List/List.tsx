import React from "react";
import { ExternalLink, Globe, Compass, Landmark } from "lucide-react";

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
      className={`group flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-2xs hover:border-emerald-500/50 hover:bg-zinc-50/50 hover:shadow-xs transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${badge.bg}`}>
          {customIcon || <IconComponent className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs text-zinc-900 truncate group-hover:text-emerald-800 transition-colors">
            {label}
          </p>
          <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">
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

export const List: React.FC<ListProps> & {
  LinkItem: typeof NavigationLinkItem;
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

List.displayName = "List";

export default List;
