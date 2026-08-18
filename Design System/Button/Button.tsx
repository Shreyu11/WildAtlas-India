import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /** Size tier */
  size?: "sm" | "md" | "lg";
  /** Optional icon element rendered before children */
  leadingIcon?: React.ReactNode;
  /** Optional icon element rendered after children */
  trailingIcon?: React.ReactNode;
  /** Indicates background action loading state */
  isLoading?: boolean;
  /** Custom additional CSS classes */
  className?: string;
  /** Button content */
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leadingIcon,
      trailingIcon,
      isLoading = false,
      disabled = false,
      type = "button",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-all duration-200 ease-ios focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none shrink-0 active:scale-98";

    const variantStyles = {
      primary: "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-2xs",
      secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 active:bg-zinc-200 border border-zinc-200/60",
      outline: "border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100",
      ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200/60",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-2xs",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[32px]",
      md: "px-4 py-2 text-xs gap-2 min-h-[40px]",
      lg: "px-5 py-2.5 text-sm gap-2.5 min-h-[48px]",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        aria-busy={isLoading || undefined}
        aria-disabled={isDisabled || undefined}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" aria-hidden="true" />
        ) : (
          leadingIcon
        )}
        <span>{children}</span>
        {!isLoading && trailingIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
