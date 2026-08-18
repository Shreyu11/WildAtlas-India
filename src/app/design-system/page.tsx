"use client";

import React, { useState } from "react";
import { X, Search, Settings, Heart, Bell, Share2, Layers, Filter, Compass } from "lucide-react";
import { IconButton, Toggle, Button } from "@/design-system";

export default function DesignSystemPage() {
  const [clickCount, setClickCount] = useState(0);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [toggleState, setToggleState] = useState(true);
  const [mammalToggle, setMammalToggle] = useState(true);
  const [birdToggle, setBirdToggle] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 md:p-12 pb-24">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-10 pb-6 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/60 font-mono text-xs font-medium text-zinc-700 mb-3">
              <span>System Preview</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>v1.0</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              WildAtlas India Design System
            </h1>
            <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
              Central single-source component library. High-contrast monochromatic UI chrome, WCAG 2.1 AA accessibility, and native React primitives.
            </p>
          </div>
          <a
            href="/"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            ← Back to Map
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-12">
        {/* Component 1: IconButton */}
        <section id="icon-button" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">IconButton</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Compact, accessible button for icons with standard 44px hit targets, screen reader labels, and focus rings.
              </p>
            </div>

            <div className="font-mono text-xs text-zinc-400">
              Import: <code className="bg-zinc-100 px-2 py-1 rounded text-zinc-800">import &#123; IconButton &#125; from "@/design-system";</code>
            </div>
          </div>

          {/* Interactive Playground */}
          <div className="space-y-8">
            {/* Variant Showcase */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                1. Visual Variants
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { variant: "secondary" as const, label: "secondary (Close button style)", icon: <X className="h-4 w-4" /> },
                  { variant: "ghost" as const, label: "ghost (Header nav icon)", icon: <Settings className="h-4 w-4" /> },
                  { variant: "glass" as const, label: "glass (Map controls backdrop)", icon: <Layers className="h-4 w-4" /> },
                  { variant: "outline" as const, label: "outline (Card action)", icon: <Share2 className="h-4 w-4" /> },
                  { variant: "solid" as const, label: "solid (Primary action)", icon: <Search className="h-4 w-4" /> },
                ].map((item) => (
                  <div key={item.variant} className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 gap-3">
                    <IconButton
                      variant={item.variant}
                      aria-label={item.label}
                      icon={item.icon}
                      onClick={() => setClickCount((c) => c + 1)}
                    />
                    <span className="font-mono text-[11px] font-medium text-zinc-600 text-center">
                      {item.variant}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Options */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                2. Size Scaling
              </h3>
              <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <div className="flex items-center gap-3">
                  <IconButton size="sm" variant="secondary" aria-label="Small close button" icon={<X className="h-3.5 w-3.5" />} />
                  <span className="font-mono text-xs text-zinc-600">sm (28px)</span>
                </div>
                <div className="flex items-center gap-3">
                  <IconButton size="md" variant="secondary" aria-label="Medium close button" icon={<X className="h-4 w-4" />} />
                  <span className="font-mono text-xs text-zinc-600">md (36px)</span>
                </div>
                <div className="flex items-center gap-3">
                  <IconButton size="lg" variant="secondary" aria-label="Large close button" icon={<X className="h-5 w-5" />} />
                  <span className="font-mono text-xs text-zinc-600">lg (44px)</span>
                </div>
              </div>
            </div>

            {/* States & Accessibility */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                3. Interactive States & Accessibility (a11y)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-zinc-800">Active / Pressed</span>
                    <span className="font-mono text-[10px] text-zinc-500">aria-pressed="true"</span>
                  </div>
                  <IconButton active variant="ghost" aria-label="Bookmarked" icon={<Heart className="h-4 w-4 fill-white" />} />
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-zinc-800">Disabled State</span>
                    <span className="font-mono text-[10px] text-zinc-500">aria-disabled="true"</span>
                  </div>
                  <IconButton disabled variant="secondary" aria-label="Filter disabled" icon={<Filter className="h-4 w-4" />} />
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-zinc-800">Click Counter</span>
                    <span className="font-mono text-[10px] text-zinc-500">Clicks: {clickCount}</span>
                  </div>
                  <IconButton variant="solid" aria-label="Increment counter" icon={<Compass className="h-4 w-4" />} onClick={() => setClickCount((c) => c + 1)} />
                </div>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="text-[11px] text-zinc-400">JSX Example</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<IconButton\n  variant="secondary"\n  size="md"\n  aria-label="Close settings"\n  icon={<X className="h-4 w-4" />}\n  onClick={handleClose}\n/>`,
                      "iconbutton"
                    )
                  }
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                >
                  {copiedSnippet === "iconbutton" ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <pre className="overflow-x-auto text-emerald-300">
                {`<IconButton
  variant="secondary"
  size="md"
  aria-label="Close settings"
  icon={<X className="h-4 w-4" />}
  onClick={handleClose}
/>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Component 2: Toggle */}
        <section id="toggle" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Toggle (Switch)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Authentic iOS-style switch toggle with smooth spring easing (`ease-ios`), keyboard navigation (`Space`/`Enter`), and ARIA role switch.
              </p>
            </div>

            <div className="font-mono text-xs text-zinc-400">
              Import: <code className="bg-zinc-100 px-2 py-1 rounded text-zinc-800">import &#123; Toggle &#125; from "@/design-system";</code>
            </div>
          </div>

          <div className="space-y-8">
            {/* Live Interactive Toggles */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                1. Interactive Preview & Label Integration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Mammals Layer</span>
                  <Toggle checked={mammalToggle} onChange={setMammalToggle} aria-label="Mammals layer" />
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Birds Layer</span>
                  <Toggle checked={birdToggle} onChange={setBirdToggle} aria-label="Birds layer" />
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Disabled Toggle</span>
                  <Toggle disabled checked={false} aria-label="Disabled feature" />
                </div>
              </div>
            </div>

            {/* Size Options */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                2. Size Scaling
              </h3>
              <div className="flex items-center gap-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <div className="flex items-center gap-3">
                  <Toggle size="sm" checked={toggleState} onChange={setToggleState} aria-label="Small toggle" />
                  <span className="font-mono text-xs text-zinc-600">sm</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle size="md" checked={toggleState} onChange={setToggleState} aria-label="Medium toggle" />
                  <span className="font-mono text-xs text-zinc-600">md</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle size="lg" checked={toggleState} onChange={setToggleState} aria-label="Large toggle" />
                  <span className="font-mono text-xs text-zinc-600">lg</span>
                </div>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="text-[11px] text-zinc-400">JSX Example</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<Toggle\n  checked={isActive}\n  onChange={setIsActive}\n  aria-label="Toggle National Parks layer"\n/>`,
                      "toggle"
                    )
                  }
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                >
                  {copiedSnippet === "toggle" ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <pre className="overflow-x-auto text-emerald-300">
                {`<Toggle
  checked={isActive}
  onChange={setIsActive}
  aria-label="Toggle National Parks layer"
/>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Component 3: Button */}
        <section id="button" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Button</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Standard action button with primary, secondary, outline, ghost, and danger variants, leading/trailing icon slots, and loading spinners.
              </p>
            </div>

            <div className="font-mono text-xs text-zinc-400">
              Import: <code className="bg-zinc-100 px-2 py-1 rounded text-zinc-800">import &#123; Button &#125; from "@/design-system";</code>
            </div>
          </div>

          <div className="space-y-8">
            {/* Visual Variants */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                1. Visual Variants
              </h3>
              <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Icons & Loading States */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                2. Icons & States
              </h3>
              <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <Button variant="primary" leadingIcon={<Compass className="h-4 w-4" />}>
                  Explore Species
                </Button>
                <Button variant="outline" isLoading>
                  Processing
                </Button>
                <Button variant="secondary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="text-[11px] text-zinc-400">JSX Example</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<Button\n  variant="primary"\n  leadingIcon={<Compass className="h-4 w-4" />}\n  onClick={handleExplore}\n>\n  Explore Species\n</Button>`,
                      "button"
                    )
                  }
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                >
                  {copiedSnippet === "button" ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <pre className="overflow-x-auto text-emerald-300">
                {`<Button
  variant="primary"
  leadingIcon={<Compass className="h-4 w-4" />}
  onClick={handleExplore}
>
  Explore Species
</Button>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Future Component Placeholders */}
        <section className="border border-dashed border-zinc-300 rounded-3xl p-6 text-center text-zinc-400">
          <p className="font-mono text-xs">Upcoming Components: Badge, Tabs (Next in Step 4)</p>
        </section>
      </main>
    </div>
  );
}
