import React, { forwardRef } from "react";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Checked/Active state */
  checked: boolean;
  /** Callback fired on state change */
  onChange?: (checked: boolean) => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional visible text label beside switch */
  label?: string;
  /** Accessible ARIA label for screen readers */
  "aria-label"?: string;
  /** Custom additional styling */
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked,
      onChange,
      size = "md",
      label,
      "aria-label": ariaLabel,
      disabled = false,
      className = "",
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onChange?.(!checked);
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onChange?.(!checked);
      }
      onKeyDown?.(e);
    };

    const trackSizeStyles = {
      sm: "h-5 w-9 p-0.5",
      md: "h-7 w-12 p-0.5",
      lg: "h-8 w-14 p-1",
    };

    const thumbSizeStyles = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-6 w-6",
    };

    const thumbTranslate = {
      sm: checked ? "translate-x-4" : "translate-x-0",
      md: checked ? "translate-x-5" : "translate-x-0",
      lg: checked ? "translate-x-6" : "translate-x-0",
    };

    const toggleButton = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label || "Toggle switch"}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-ios focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? "bg-emerald-500" : "bg-zinc-300/80 hover:bg-zinc-300"
        } ${trackSizeStyles[size]} ${className}`}
        {...props}
      >
        <span
          className={`pointer-events-none inline-block transform rounded-full bg-white shadow-md transition-transform duration-200 ease-ios ${thumbSizeStyles[size]} ${thumbTranslate[size]}`}
        />
      </button>
    );

    if (label) {
      return (
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          {toggleButton}
          <span className="text-sm font-medium text-zinc-900">{label}</span>
        </label>
      );
    }

    return toggleButton;
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
