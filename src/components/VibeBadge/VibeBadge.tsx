"use client";

export default function VibeBadge() {
  return (
    <div className="absolute bottom-5 right-16 z-20 flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-xs text-zinc-500 backdrop-blur-xl shadow-2xs select-none transition-all duration-200 hover:bg-white hover:border-zinc-300 hover:text-zinc-600">
      <span>Vibe coded with</span>
      <span className="inline-flex items-center justify-center text-xs animate-pulse">💚</span>
      <span>by</span>
      <a
        href="https://shreyaschaudhary.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-zinc-800 hover:text-zinc-950 border-b border-dashed border-zinc-400 pb-0.5 transition-colors"
      >
        Shreyas Chaudhary
      </a>
    </div>
  );
}
