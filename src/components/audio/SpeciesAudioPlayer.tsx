"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink } from "lucide-react";
import type { PhotoAttribution } from "@/lib/types";

interface SpeciesAudioPlayerProps {
  audioUrl?: string | null;
  audioAttribution?: PhotoAttribution | null;
  speciesName: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function SpeciesAudioPlayer({
  audioUrl,
  audioAttribution,
  speciesName,
}: SpeciesAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioUrl]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="my-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 shadow-2xs backdrop-blur-xl transition-all duration-200 ease-ios hover:border-zinc-300">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <div className="flex items-center justify-between gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition-all duration-200 ease-ios hover:bg-zinc-800 active:scale-90 focus:outline-none"
          aria-label={isPlaying ? `Pause ${speciesName} call` : `Play ${speciesName} call`}
          title={isPlaying ? "Pause vocalization" : "Listen to vocalization"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Info & Animated Waveform */}
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-xs font-bold text-zinc-900 truncate">
              Vocalization / Call
            </span>
            <span className="font-mono text-[10px] font-medium text-zinc-500 shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Waveform Visualizer Bars */}
          <div className="mt-1.5 flex h-4 items-center gap-1 overflow-hidden px-0.5">
            {[40, 75, 55, 90, 60, 80, 45, 70, 85, 50, 65, 35].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-zinc-300"
                }`}
                style={{
                  height: isPlaying ? `${Math.max(25, (height * (i % 3 === 0 ? 0.9 : 1.1))) % 100}%` : "30%",
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `${0.6 + (i % 4) * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Mute Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200/60 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-all duration-150 ease-ios active:scale-90"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Audio Citation & Attribution */}
      {audioAttribution && (
        <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200/60 pt-2 text-[10px] text-zinc-500">
          <span>
            Recording:{" "}
            <a
              href={audioAttribution.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
            >
              {audioAttribution.author}
            </a>
          </span>
          <a
            href={audioAttribution.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[9px] text-zinc-400 hover:text-zinc-600"
          >
            {audioAttribution.license} <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}
