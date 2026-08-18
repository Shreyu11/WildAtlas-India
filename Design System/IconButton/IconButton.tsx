import React, { forwardRef } from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label mandatory for screen readers */
  "aria-label": string;
  /** Visual styling variant */
  variant?: "ghost" | "secondary" | "glass" | "outline" | "solid";
  /** Button dimensions */
  size?: "sm" | "md" | "lg";
  /** Icon element or Lucide icon component */
  icon?: React.ReactNode;
  /** Optional active/pressed state */
  active?: boolean;
  /** Custom additional CSS classes */
  className?: string;
  /** Children fallback if icon is passed as children */
  children?: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      "aria-label": ariaLabel,
      variant = "ghost",
      size = "md",
      icon,
      active = false,
      disabled = false,
      type = "button",
      className = "",
      title,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full transition-all duration-200 ease-ios focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none shrink-0 active:scale-95";

    const variantStyles = {
      ghost:
        "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 active:bg-zinc-200/90",
      secondary:
        "bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 active:bg-zinc-300/80",
      glass:
        "bg-white/90 text-zinc-700 border border-zinc-300/80 shadow-xs backdrop-blur-xl hover:bg-white hover:text-zinc-900 hover:border-zinc-400 active:bg-zinc-100",
      outline:
        "border border-zinc-300/80 text-zinc-700 bg-white hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100",
      solid:
        "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-2xs",
    };

    const sizeStyles = {
      sm: "h-7 w-7 text-xs",
      md: "h-9 w-9 text-sm",
      lg: "h-11 w-11 text-base",
    };

    const activeStyles = active
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : "";

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        aria-pressed={active ? true : undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        title={title || ariaLabel}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${activeStyles} ${className}`}
        {...props}
      >
        {icon || children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
