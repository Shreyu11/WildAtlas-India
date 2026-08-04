"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";

interface SpeciesAudioButtonProps {
  audioUrl?: string | null;
  speciesName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SpeciesAudioButton({
  audioUrl,
  speciesName,
  className = "",
  size = "md",
}: SpeciesAudioButtonProps) {
  // Audio buttons hidden globally until verified sound recordings are added
  return null;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ stop: () => void } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const effectiveAudioUrl = audioUrl || "/audio/dummy.mp3";

  useEffect(() => {
    setIsPlaying(false);
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [effectiveAudioUrl, speciesName]);

  const startSynthesizedAudio = () => {
    if (synthRef.current) synthRef.current.stop();

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const nameLower = speciesName.toLowerCase();
      const isBird =
        nameLower.includes("owl") ||
        nameLower.includes("crane") ||
        nameLower.includes("flamingo") ||
        nameLower.includes("peafowl") ||
        nameLower.includes("bird") ||
        nameLower.includes("hornbill") ||
        nameLower.includes("eagle") ||
        nameLower.includes("bustard") ||
        nameLower.includes("roller") ||
        nameLower.includes("sparrow") ||
        nameLower.includes("crow") ||
        nameLower.includes("monal");

      const totalDuration = 3.0;
      setIsPlaying(true);
      const startMs = Date.now();

      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startMs) / 1000;
        if (elapsed >= totalDuration) {
          clearInterval(progressInterval);
          setIsPlaying(false);
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

        osc.frequency.setValueAtTime(1600, now + 0.8);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 0.95);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 1.2);

        gain.gain.setValueAtTime(0.01, now + 0.75);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.85);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      } else {
        // Deep Mammal Vocalization / Growl Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";

        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(90, now + 1.5);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      }
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          startSynthesizedAudio();
        });
    } else {
      startSynthesizedAudio();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-7 w-7 text-sm",
    lg: "h-9 w-9 text-base",
  }[size];

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={effectiveAudioUrl}
        preload="auto"
        onEnded={handleEnded}
        onError={() => {
          // Handled via synth fallback
        }}
      />

      {/* Pulsating Ripple Animation Rings (Google Search Style) */}
      {isPlaying && (
        <>
          <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping pointer-events-none" />
          <span
            className="absolute -inset-1 rounded-full border-2 border-blue-500/60 animate-pulse pointer-events-none"
            style={{ animationDuration: "0.8s" }}
          />
          <span
            className="absolute -inset-2.5 rounded-full border border-blue-400/40 animate-pulse pointer-events-none"
            style={{ animationDuration: "1.3s" }}
          />
        </>
      )}

      {/* Google Search Style Circular Blue Speaker Button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        className={`relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-white shadow-xs transition-all duration-200 hover:bg-[#1557b0] hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${sizeClasses}`}
        title={isPlaying ? `Stop ${speciesName} call` : `Listen to ${speciesName} call`}
        aria-label={isPlaying ? `Stop ${speciesName} call` : `Listen to ${speciesName} call`}
      >
        <Volume2 className={`${iconSizes} stroke-[2.2]`} />
      </button>
    </div>
  );
}
