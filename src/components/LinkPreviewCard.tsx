import { ExternalLink, Globe, Compass, Landmark } from "lucide-react";

interface LinkPreviewCardProps {
  label: string;
  url: string;
  category?: "official" | "travel" | "wiki" | "general";
}

function formatDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

function getCategoryBadge(category?: string, domain?: string) {
  if (category === "official" || domain?.includes("gov.in") || domain?.includes("nic.in")) {
    return {
      icon: Landmark,
      bg: "bg-emerald-50 border-emerald-200/80 text-emerald-700",
    };
  }
  if (category === "travel" || domain?.includes("wikivoyage") || domain?.includes("tourism")) {
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

export default function LinkPreviewCard({ label, url, category }: LinkPreviewCardProps) {
  const domain = formatDomain(url);
  const badge = getCategoryBadge(category, domain);
  const Icon = badge.icon;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3 shadow-2xs hover:border-emerald-500/50 hover:bg-white hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${badge.bg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs text-zinc-900 truncate group-hover:text-emerald-800 transition-colors">
            {label}
          </p>
          <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">
            {domain}
          </p>
        </div>
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </a>
  );
}
