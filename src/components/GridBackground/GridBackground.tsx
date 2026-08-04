"use client";

import { useEffect, useRef } from "react";

const CELL = 8;
const BASE_LINE = "rgba(15, 23, 42, 0.12)";
const SPOTLIGHT_LINE = "rgba(15, 23, 42, 0.80)";
const SPOTLIGHT_RADIUS = 260;
const EASE = 0.15;

const gridImage = (dotColor: string, size: number = 1) =>
  `radial-gradient(circle, ${dotColor} ${size}px, transparent ${size}px)`;

// Site-wide background grid (ref: 21st.dev "The Infinite Grid"): a faint
// base grid everywhere, plus a cursor-following radial spotlight that
// reveals the grid with crisp contrast nearby. Pure CSS (background-image +
// mask-image), no canvas/WebGL — cheap and works behind the MapLibre
// canvas since the map's own background layer is made transparent.
export default function GridBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    current.current = { ...target.current };

    function handlePointerMove(e: PointerEvent) {
      target.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("pointermove", handlePointerMove);

    let frame: number;
    function tick() {
      current.current.x += (target.current.x - current.current.x) * EASE;
      current.current.y += (target.current.y - current.current.y) * EASE;
      spotlightRef.current?.style.setProperty("--mx", `${current.current.x}px`);
      spotlightRef.current?.style.setProperty("--my", `${current.current.y}px`);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: gridImage(BASE_LINE, 1), backgroundSize: `${CELL}px ${CELL}px` }}
      />
      <div
        ref={spotlightRef}
        className="absolute inset-0"
        style={{
          backgroundImage: gridImage(SPOTLIGHT_LINE, 1.25),
          backgroundSize: `${CELL}px ${CELL}px`,
          maskImage: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at var(--mx) var(--my), black 0%, black 40%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at var(--mx) var(--my), black 0%, black 40%, transparent 100%)`,
        }}
      />
    </div>
  );
}
