import { Badge } from "@/design-system";

export default function VibeBadge() {
  return (
    <div className="absolute bottom-5 right-16 z-20">
      <Badge variant="neutral" size="md">
        <span>Vibe coded with</span>
        <span className="inline-flex items-center justify-center text-xs animate-pulse">💚</span>
        <span>by</span>
        <a
          href="https://shreyaschaudhary.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-zinc-800 hover:text-zinc-950 border-b border-dashed border-zinc-400 pb-0.5 transition-colors ml-0.5"
        >
          Shreyas Chaudhary
        </a>
      </Badge>
    </div>
  );
}
