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

// Red-to-Green color range representing threat levels:
// Red (Extinct/CR/EN) -> Orange (VU) -> Yellow (NT) -> Green (LC)
export const CONSERVATION_TONE: Record<ConservationStatus, string> = {
  EX: "bg-rose-950 text-rose-100 border border-rose-900",
  EW: "bg-rose-800 text-white font-semibold shadow-2xs",
  CR: "bg-red-600 text-white font-semibold shadow-2xs",
  EN: "bg-red-500 text-white font-semibold shadow-2xs",
  VU: "bg-amber-500 text-white font-semibold shadow-2xs",
  NT: "bg-yellow-400 text-yellow-950 font-bold shadow-2xs",
  LC: "bg-emerald-600 text-white font-semibold shadow-2xs",
};
