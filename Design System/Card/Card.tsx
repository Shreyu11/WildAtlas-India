import React from "react";
import { Lightbulb, X } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export interface FunFactCardVariationProps {
  /** Card header title */
  title?: string;
  /** Thumbnail image source URL */
  imageSrc?: string | null;
  /** Alt text for image */
  imageAlt?: string;
  /** Fallback icon emoji if image is absent */
  fallbackIcon?: string;
  /** Fact description text */
  factText: string;
  /** Keyword or species name to bold highlight in text */
  highlightText?: string;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Card click callback */
  onClick?: () => void;
  /** Custom additional styling */
  className?: string;
}

// Highlights specified keyword/animal inside fact text
function renderFormattedText(text: string, highlight?: string) {
  if (!highlight) return text;
  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const idx = lowerText.indexOf(lowerHighlight);

  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);

  return (
    <>
      {before}
      <span className="font-bold text-zinc-900">{match}</span>
      {after}
    </>
  );
}

export const FunFactCardVariation: React.FC<FunFactCardVariationProps> = ({
  title = "Did you know?",
  imageSrc,
  imageAlt = "",
  fallbackIcon = "🐅",
  factText,
  highlightText,
  onDismiss,
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`group flex w-full max-w-[430px] flex-col items-start gap-3 rounded-[24px] border border-zinc-200/80 bg-white p-3 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-zinc-300 hover:shadow-2xl ${
        onClick ? "cursor-pointer active:scale-[0.99]" : ""
      } ${className}`}
    >
      {/* Header Row: Lightbulb + Title + Dismiss Button */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-zinc-800 shrink-0 stroke-[2.25]" />
          <h3 className="font-mono text-sm font-bold tracking-tight text-zinc-800">
            {title}
          </h3>
        </div>
        {onDismiss && (
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Dismiss card"
            icon={<X className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
          />
        )}
      </div>

      {/* Main Content Row: Image + Text Description */}
      <div className="flex w-full items-center gap-3.5">
        <div className="h-[110px] w-[110px] shrink-0 overflow-hidden rounded-[16px] bg-zinc-100 border border-zinc-200/60 shadow-2xs">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover rounded-[16px] group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl select-none">
              {fallbackIcon}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-zinc-600 font-normal">
            {renderFormattedText(factText, highlightText)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const Card: React.FC<CardProps> & {
  FunFact: typeof FunFactCardVariation;
} = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs ${className}`}
    >
      {children}
    </div>
  );
};

Card.FunFact = FunFactCardVariation;

Card.displayName = "Card";

export default Card;
