import React from "react";

export type BadgeVariant =
  | "neutral"
  | "emerald"
  | "sky"
  | "amber"
  | "teal"
  | "red"
  | "orange"
  | "yellow"
  | "CR"
  | "EN"
  | "VU"
  | "NT"
  | "LC";

export interface BadgeProps {
  /** Visual color variant or conservation status code */
  variant?: BadgeVariant;
  /** Size tier */
  size?: "sm" | "md" | "lg";
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Badge text or elements */
  children: React.ReactNode;
  /** Custom additional styling */
  className?: string;
}

const statusToVariantMap: Record<string, string> = {
  CR: "red",
  EN: "red",
  VU: "orange",
  NT: "yellow",
  LC: "emerald",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  icon,
  children,
  className = "",
}) => {
  const resolvedVariant = statusToVariantMap[variant] || variant;

  const baseStyles =
    "inline-flex items-center gap-1.5 rounded-full font-mono transition-all duration-200 select-none shrink-0";

  const variantStyles: Record<string, string> = {
    neutral:
      "border border-zinc-200/80 bg-white/80 text-zinc-700 backdrop-blur-xl shadow-2xs hover:bg-white hover:border-zinc-300",
    emerald: "border border-emerald-200/80 bg-emerald-50/80 text-emerald-900 shadow-2xs",
    sky: "border border-sky-200/80 bg-sky-50/80 text-sky-900 shadow-2xs",
    amber: "border border-amber-200/80 bg-amber-50/80 text-amber-900 shadow-2xs",
    orange: "border border-orange-200/80 bg-orange-50/80 text-orange-900 shadow-2xs",
    yellow: "border border-yellow-200/80 bg-yellow-50/80 text-yellow-950 shadow-2xs",
    teal: "border border-teal-200/80 bg-teal-50/80 text-teal-900 shadow-2xs",
    red: "border border-red-200/80 bg-red-50/80 text-red-900 shadow-2xs",
  };

  const selectedVariantStyle = variantStyles[resolvedVariant] || variantStyles.neutral;


  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-xs font-semibold",
  };

  return (
    <span className={`${baseStyles} ${selectedVariantStyle} ${sizeStyles[size]} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};

Badge.displayName = "Badge";

export default Badge;
