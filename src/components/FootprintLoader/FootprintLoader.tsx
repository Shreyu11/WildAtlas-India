"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function FootprintLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [statusText, setStatusText] = useState("Initializing WildAtlas India...");

  useEffect(() => {
    if (pathname === "/design-system" || pathname?.startsWith("/design-system")) {
      return;
    }

    const startTime = Date.now();
    const duration = 2400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));

      if (pct < 35) {
        setStatusText("Fetching state biodiversity records...");
      } else if (pct < 70) {
        setStatusText("Streaming species telemetry & GIS coordinates...");
      } else {
        setStatusText("Synthesizing WildAtlas India...");
      }

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 40);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2400);

    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [pathname]);

  if (pathname === "/design-system" || pathname?.startsWith("/design-system") || !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-center bg-white/90 backdrop-blur-md transition-opacity duration-400 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading application data"
    >
      <div className="flex flex-col items-center justify-center">
        {/* Perfectly Centered Footprint Loader Container with Active Keyframe Animations */}
        <div className="footprint-loader" aria-hidden="true">
          {/* Left Paw */}
          <div className="paw" style={{ left: "10px", top: "36px", transform: "rotate(-20deg)" }}>
            <div className="paw-motion" style={{ animationDelay: "0s" }}>
              <svg viewBox="0 0 64 64" width="34" height="34" style={{ display: "block" }}>
                <ellipse className="pad" cx="32" cy="42" rx="16" ry="13" fill="#18181b" style={{ animationDelay: "0s" }} />
                <g className="toes" style={{ animationDelay: "0s" }}>
                  <ellipse cx="14" cy="20" rx="7" ry="9" fill="#18181b" />
                  <ellipse cx="30" cy="12" rx="7.5" ry="9.5" fill="#18181b" />
                  <ellipse cx="47" cy="14" rx="7" ry="9" fill="#18181b" />
                  <ellipse cx="58" cy="26" rx="6" ry="8" fill="#18181b" />
                </g>
              </svg>
            </div>
          </div>

          {/* Right Paw */}
          <div className="paw" style={{ left: "50px", top: "10px", transform: "rotate(12deg)" }}>
            <div className="paw-motion" style={{ animationDelay: "-1.2s" }}>
              <svg viewBox="0 0 64 64" width="34" height="34" style={{ display: "block" }}>
                <ellipse className="pad" cx="32" cy="42" rx="16" ry="13" fill="#18181b" style={{ animationDelay: "-1.2s" }} />
                <g className="toes" style={{ animationDelay: "-1.2s" }}>
                  <ellipse cx="14" cy="20" rx="7" ry="9" fill="#18181b" />
                  <ellipse cx="30" cy="12" rx="7.5" ry="9.5" fill="#18181b" />
                  <ellipse cx="47" cy="14" rx="7" ry="9" fill="#18181b" />
                  <ellipse cx="58" cy="26" rx="6" ry="8" fill="#18181b" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Clean Centered Status Text */}
        <p className="mt-5 font-mono text-xs font-semibold text-zinc-800 tracking-wide text-center">
          {statusText}
        </p>
      </div>
    </div>
  );
}
