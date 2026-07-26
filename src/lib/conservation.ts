import type { ConservationStatus } from "./types";

export const CONSERVATION_LABEL: Record<ConservationStatus, string> = {
  LC: "Least Concern",
  NT: "Near Threatened",
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
  EW: "Extinct in the Wild",
  EX: "Extinct",
};

// Near-monochrome by design (PRD Section 4.6 — "color is reserved for
// wildlife"): status badges differ by weight/tone, not hue.
export const CONSERVATION_TONE: Record<ConservationStatus, string> = {
  LC: "bg-zinc-100 text-zinc-600",
  NT: "bg-zinc-200 text-zinc-700",
  VU: "bg-zinc-300 text-zinc-800",
  EN: "bg-zinc-700 text-white",
  CR: "bg-zinc-900 text-white",
  EW: "bg-black text-white",
  EX: "bg-black text-white",
};
