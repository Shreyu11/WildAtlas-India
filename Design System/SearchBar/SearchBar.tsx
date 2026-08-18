"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";

export interface SearchBarProps {
  /** Search query string */
  value?: string;
  /** Callback fired on query change */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Keyboard shortcut hint string (e.g., "⌘K") */
  shortcut?: string;
  /** Callback fired on clear button click */
  onClear?: () => void;
  /** Callback fired on key press (e.g. Enter, Arrow keys) */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Focus event handler */
  onFocus?: () => void;
  /** Blur event handler */
  onBlur?: () => void;
  /** Dropdown suggestions overlay content */
  children?: React.ReactNode;
  /** Custom additional container styling */
  className?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "Spotlight species, states, or parks…",
      shortcut = "⌘K",
      onClear,
      onKeyDown,
      onFocus,
      onBlur,
      children,
      className = "",
    },
    ref
  ) => {
    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const setRef = (node: HTMLInputElement | null) => {
      internalInputRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    const handleClear = () => {
      onChange?.("");
      onClear?.();
      internalInputRef.current?.focus();
    };

    return (
      <div className={`relative flex items-center w-full group ${className}`}>
        <Search className="absolute left-4 z-10 h-4 w-4 text-zinc-800 pointer-events-none transition-colors" />
        <input
          ref={setRef}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-zinc-300/80 hover:border-zinc-400 focus:border-zinc-500 bg-white/90 hover:bg-white focus:bg-white pl-11 pr-12 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-black/5 shadow-md backdrop-blur-xl transition-all duration-200 ease-ios"
        />
        {!value ? (
          shortcut && (
            <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 hidden select-none rounded-md border border-black/10 bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 shadow-2xs sm:inline-block">
              {shortcut}
            </kbd>
          )
        ) : (
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Clear search"
            icon={<X className="h-3.5 w-3.5" />}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            onClick={handleClear}
          />
        )}
        {children}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
