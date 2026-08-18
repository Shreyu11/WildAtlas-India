import React from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  /** Array of tab objects */
  tabs: TabItem<T>[];
  /** Currently active tab ID */
  activeTab: T;
  /** Callback fired on tab change */
  onChange: (id: T) => void;
  /** Custom additional styling */
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabsProps<T>) {
  return (
    <div className={`border-b border-zinc-200/80 ${className}`}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="-mb-px flex space-x-1 overflow-x-auto pb-0.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2 px-3 text-xs font-semibold transition-all duration-150 ease-ios focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 rounded-t-lg ${
                isActive
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono transition-colors ${
                    isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Tabs.displayName = "Tabs";

export default Tabs;
