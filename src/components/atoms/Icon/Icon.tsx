import React from "react";
import * as LucideIcons from "lucide-react";

export type IconName = keyof typeof LucideIcons;

export interface IconProps {
  name: string;
  size?: "sm" | "md" | "lg" | number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = "md", className = "" }) => {
  const IconComponent = (LucideIcons as Record<string, any>)[name] || LucideIcons.HelpCircle;

  const sizePixelMap = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const numericSize = typeof size === "number" ? size : sizePixelMap[size] || 18;

  return <IconComponent size={numericSize} className={`shrink-0 ${className}`} />;
};

export default Icon;
