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
  const synthRef = useRef<{ stop: () => void } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }
  }, [audioUrl, speciesName]);

  const startSynthesizedAudio = () => {
    if (synthRef.current) synthRef.current.stop();

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const nameLower = speciesName.toLowerCase();
      const isBird = nameLower.includes("owl") || nameLower.includes("crane") || nameLower.includes("flamingo") || nameLower.includes("peafowl") || nameLower.includes("bird") || nameLower.includes("hornbill") || nameLower.includes("eagle") || nameLower.includes("bustard") || nameLower.includes("roller");

      const totalDuration = 4.0;
      setDuration(totalDuration);
      setIsPlaying(true);
      const startMs = Date.now();

      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startMs) / 1000;
        if (elapsed >= totalDuration) {
          clearInterval(progressInterval);
          setIsPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(elapsed);
        }
      }, 100);

      synthRef.current = {
        stop: () => {
          clearInterval(progressInterval);
          try {
            ctx.close();
          } catch (e) {}
        },
      };

      const now = ctx.currentTime;
      if (isBird) {
        // Melodic Bird Chirp / Call Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";

        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.35);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.frequency.setValueAtTime(1600, now + 1.2);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 1.35);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 1.6);

        gain.gain.setValueAtTime(0.01, now + 1.15);
        gain.gain.linearRampToValueAtTime(0.25, now + 1.25);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);

        osc.frequency.setValueAtTime(1500, now + 2.4);
        osc.frequency.exponentialRampToValueAtTime(2900, now + 2.55);
        osc.frequency.exponentialRampToValueAtTime(1700, now + 2.8);

        gain.gain.setValueAtTime(0.01, now + 2.35);
        gain.gain.linearRampToValueAtTime(0.25, now + 2.45);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2.85);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.2);
      } else {
        // Deep Mammal Roar / Vocal Growl Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";

        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(80, now + 1.8);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

        osc.frequency.setValueAtTime(130, now + 2.3);
        osc.frequency.linearRampToValueAtTime(240, now + 2.6);
        osc.frequency.exponentialRampToValueAtTime(90, now + 3.6);

        gain.gain.setValueAtTime(0.01, now + 2.25);
        gain.gain.linearRampToValueAtTime(0.25, now + 2.45);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 3.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.9);
      }
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioUrl) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Native HTML5 audio play failed or format unsupported -> trigger synthesizer
          startSynthesizedAudio();
        });
    } else {
      startSynthesizedAudio();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="my-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 shadow-2xs backdrop-blur-xl transition-all duration-200 ease-ios hover:border-zinc-300">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onError={() => {
            // HTML5 Audio load error -> handled gracefully by synth fallback on play
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

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
