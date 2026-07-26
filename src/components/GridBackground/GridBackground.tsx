"use client";

import { useEffect, useRef } from "react";

const CELL = 8;
const BASE_LINE = "rgba(10, 24, 51, 0.12)";
const SPOTLIGHT_LINE = "rgba(10, 24, 51, 0.35)";
const SPOTLIGHT_RADIUS = 220;
const EASE = 0.12;

const gridImage = (dotColor: string) => `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`;

// Site-wide background grid (ref: 21st.dev "The Infinite Grid"): a faint
// base grid everywhere, plus a cursor-following radial spotlight that
// reveals the grid more clearly nearby. Pure CSS (background-image +
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
        style={{ backgroundImage: gridImage(BASE_LINE), backgroundSize: `${CELL}px ${CELL}px` }}
      />
      <div
        ref={spotlightRef}
        className="absolute inset-0"
        style={{
          backgroundImage: gridImage(SPOTLIGHT_LINE),
          backgroundSize: `${CELL}px ${CELL}px`,
          maskImage: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at var(--mx) var(--my), black, transparent)`,
          WebkitMaskImage: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at var(--mx) var(--my), black, transparent)`,
        }}
      />
    </div>
  );
}
