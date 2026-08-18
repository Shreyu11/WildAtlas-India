import React from "react";

export interface ListItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  action,
  onClick,
  className = "",
}) => {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 hover:bg-zinc-50/80 transition-colors shadow-2xs text-left ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-lg border border-zinc-200">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {typeof title === "string" ? (
              <p className="font-semibold text-xs text-zinc-900 truncate">{title}</p>
            ) : (
              title
            )}
            {badge}
          </div>
          {subtitle && (
            <div className="text-[11px] text-zinc-500 truncate mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0 ml-2">{action}</div>}
    </Component>
  );
};

export default ListItem;
