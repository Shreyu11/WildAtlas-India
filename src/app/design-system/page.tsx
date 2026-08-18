"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Settings,
  Heart,
  Share2,
  Layers,
  Filter,
  Compass,
  MousePointer,
  ToggleRight,
  Sparkles,
  Tag,
  LayoutList,
  Palette,
  MapPin,
  Check,
} from "lucide-react";
import { IconButton, Toggle, Button, Badge, Tabs, MarkerTooltip, SearchBar, colorSwatches, typographyScale } from "@/design-system";

export default function DesignSystemPage() {
  const [clickCount, setClickCount] = useState(0);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [toggleState, setToggleState] = useState(true);
  const [mammalToggle, setMammalToggle] = useState(true);
  const [birdToggle, setBirdToggle] = useState(false);
  const [activeTabDemo, setActiveTabDemo] = useState("species");
  const [interactiveTooltipExpanded, setInteractiveTooltipExpanded] = useState(false);
  const [searchDemoQuery, setSearchDemoQuery] = useState("");
  const [activeSection, setActiveSection] = useState("icon-button");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const navItems = [
    { id: "icon-button", label: "IconButton", icon: <MousePointer className="h-3.5 w-3.5" /> },
    { id: "toggle", label: "Toggle (Switch)", icon: <ToggleRight className="h-3.5 w-3.5" /> },
    { id: "button", label: "Button", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "badge", label: "Badge", icon: <Tag className="h-3.5 w-3.5" /> },
    { id: "tabs", label: "Tabs", icon: <LayoutList className="h-3.5 w-3.5" /> },
    { id: "tooltip", label: "Hover Tooltip", icon: <MapPin className="h-3.5 w-3.5" /> },
    { id: "searchbar", label: "Search Bar", icon: <Search className="h-3.5 w-3.5" /> },
    { id: "tokens", label: "Design Tokens", icon: <Palette className="h-3.5 w-3.5" /> },
  ];

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans px-4 sm:px-6 md:px-10 pt-24 sm:pt-28 md:pt-32 pb-24">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-8 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            WildAtlas India Design System
          </h1>
          <p className="text-sm text-zinc-600 mt-1.5 w-full">
            Central single-source component library. High-contrast monochromatic UI chrome, WCAG 2.1 AA accessibility, and native React primitives.
          </p>
        </div>
      </header>

      {/* Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Table of Contents Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-xs">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-2">
            Table of Contents
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-2xs font-bold"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Right Main Content Showcase */}
        <main className="flex-1 w-full space-y-12 min-w-0">
          {/* Section 1: IconButton */}
          <section id="icon-button" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">IconButton</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Compact, accessible button for icons with standard 44px hit targets, screen reader labels, and focus rings.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; IconButton &#125; from "@/design-system";
                </code>
              </div>
            </div>

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
                    <div key={item.variant} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-200/80 bg-white gap-3 shadow-2xs">
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
                <div className="flex flex-wrap items-center gap-8 py-1">
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
                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="block text-xs font-semibold text-zinc-800">Active / Pressed</span>
                      <span className="font-mono text-[10px] text-zinc-500">aria-pressed="true"</span>
                    </div>
                    <IconButton active variant="ghost" aria-label="Bookmarked" icon={<Heart className="h-4 w-4 fill-white" />} />
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="block text-xs font-semibold text-zinc-800">Disabled State</span>
                      <span className="font-mono text-[10px] text-zinc-500">aria-disabled="true"</span>
                    </div>
                    <IconButton disabled variant="secondary" aria-label="Filter disabled" icon={<Filter className="h-4 w-4" />} />
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-between shadow-2xs">
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
                    type="button"
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

          {/* Section 2: Toggle */}
          <section id="toggle" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Toggle (Switch)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Authentic iOS-style switch toggle with smooth spring easing (`ease-ios`), keyboard navigation (`Space`/`Enter`), and ARIA role switch.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; Toggle &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              {/* Live Interactive Toggles */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Interactive Preview & Label Integration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-xs font-semibold text-zinc-800">Mammals Layer</span>
                    <Toggle checked={mammalToggle} onChange={setMammalToggle} aria-label="Mammals layer" />
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-xs font-semibold text-zinc-800">Birds Layer</span>
                    <Toggle checked={birdToggle} onChange={setBirdToggle} aria-label="Birds layer" />
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-between shadow-2xs">
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
                <div className="flex flex-wrap items-center gap-8 py-1">
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
                    type="button"
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

          {/* Section 3: Button */}
          <section id="button" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Button</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Standard action button with primary, secondary, outline, ghost, and danger variants, leading/trailing icon slots, and loading spinners.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; Button &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              {/* Visual Variants */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Visual Variants
                </h3>
                <div className="flex flex-wrap items-center gap-4 py-1">
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
                <div className="flex flex-wrap items-center gap-4 py-1">
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
                    type="button"
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

          {/* Section 4: Badge */}
          <section id="badge" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Badge</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Pill tags for species conservation status (CR, EN, VU, NT, LC), vibe badges, and category labels.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; Badge &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Conservation Status & Category Badges
                </h3>
                <div className="flex flex-wrap items-center gap-3 py-1">
                  <Badge variant="red">Critically Endangered (CR)</Badge>
                  <Badge variant="amber">Endangered (EN)</Badge>
                  <Badge variant="orange">Vulnerable (VU)</Badge>
                  <Badge variant="yellow">Near Threatened (NT)</Badge>
                  <Badge variant="emerald">Least Concern (LC)</Badge>
                  <Badge variant="neutral">Vibe Badge</Badge>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-[11px] text-zinc-400">JSX Example</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(`<Badge variant="amber">Endangered (EN)</Badge>`, "badge")
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                  >
                    {copiedSnippet === "badge" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">
                  {`<Badge variant="amber">Endangered (EN)</Badge>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 5: Tabs */}
          <section id="tabs" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Tabs</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Accessible tab bar strip with keyboard focus indicators (`role="tablist"`, `role="tab"`), count pills, and icons.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; Tabs &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Interactive Tab Strip
                </h3>
                <div className="py-1">
                  <Tabs
                    activeTab={activeTabDemo}
                    onChange={setActiveTabDemo}
                    tabs={[
                      { id: "species", label: "Species", count: 12 },
                      { id: "national-parks", label: "National Parks", count: 5 },
                      { id: "sanctuaries", label: "Sanctuaries", count: 8 },
                      { id: "zoos", label: "Zoos", count: 2 },
                    ]}
                  />
                  <div className="mt-4 p-4 rounded-2xl border border-zinc-200/80 bg-white font-mono text-xs text-zinc-700 shadow-2xs">
                    Active Panel: <span className="font-bold text-emerald-600">{activeTabDemo}</span>
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-[11px] text-zinc-400">JSX Example</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `<Tabs\n  activeTab={activeTab}\n  onChange={setActiveTab}\n  tabs={[\n    { id: "species", label: "Species", count: 12 },\n    { id: "parks", label: "National Parks", count: 5 }\n  ]}\n/>`,
                        "tabs"
                      )
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                  >
                    {copiedSnippet === "tabs" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">
                  {`<Tabs
  activeTab={activeTab}
  onChange={setActiveTab}
  tabs={[
    { id: "species", label: "Species", count: 12 },
    { id: "parks", label: "National Parks", count: 5 }
  ]}
/>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 6: Hover Tooltip */}
          <section id="tooltip" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Hover Tooltip</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Map marker speech-bubble card with compact default state (112px width) and expanded click/hover state (224px width) featuring scientific subtitle, fact description, conservation status badge, and arrow action button.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; MarkerTooltip &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              {/* 1. Default vs Expanded State Side-by-Side */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Component States (Default & Expanded)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Default State */}
                  <div className="p-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 flex flex-col items-center justify-center gap-4">
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold text-zinc-900 block font-sans">Default State</span>
                      <span className="font-mono text-[10px] text-zinc-500">w-28 (112px) · Compact photo & name</span>
                    </div>
                    <MarkerTooltip
                      photoUrl="https://images.unsplash.com/photo-1555169062-013468b47731?w=400&auto=format&fit=crop&q=80"
                      label="Coppersmith Barbet"
                      expanded={false}
                    />
                  </div>

                  {/* Expanded State */}
                  <div className="p-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 flex flex-col items-center justify-center gap-4">
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold text-zinc-900 block font-sans">Expanded State</span>
                      <span className="font-mono text-[10px] text-zinc-500">w-56 (224px) · Subtitle, Fact & Status</span>
                    </div>
                    <MarkerTooltip
                      photoUrl="https://images.unsplash.com/photo-1555169062-013468b47731?w=400&auto=format&fit=crop&q=80"
                      label="Coppersmith Barbet"
                      subtitle="Psilopogon haemacephalus"
                      fact="Named for its metallic 'tuck-tuck' call echoing across Indian woodland canopies."
                      status="LC"
                      expanded={true}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Interactive Toggle Preview */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  2. Interactive State Toggle
                </h3>
                <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white flex flex-col items-center gap-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-700 font-sans">Expand Tooltip Card</span>
                    <Toggle
                      checked={interactiveTooltipExpanded}
                      onChange={setInteractiveTooltipExpanded}
                      aria-label="Toggle tooltip expanded state"
                    />
                  </div>
                  <div className="pt-2">
                    <MarkerTooltip
                      photoUrl="https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&auto=format&fit=crop&q=80"
                      label="Royal Bengal Tiger"
                      subtitle="Panthera tigris tigris"
                      fact="Apex predator found across India's national parks, mangrove forests, and tiger reserves."
                      status="EN"
                      expanded={interactiveTooltipExpanded}
                    />
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-[11px] text-zinc-400">JSX Example</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `<MarkerTooltip\n  photoUrl="/images/species.jpg"\n  label="Coppersmith Barbet"\n  subtitle="Psilopogon haemacephalus"\n  fact="Metallic tuck-tuck call."\n  status="LC"\n  expanded={isHovered}\n/>`,
                        "tooltip"
                      )
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                  >
                    {copiedSnippet === "tooltip" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">
                  {`<MarkerTooltip
  photoUrl="/images/species.jpg"
  label="Coppersmith Barbet"
  subtitle="Psilopogon haemacephalus"
  fact="Metallic tuck-tuck call."
  status="LC"
  expanded={isHovered}
/>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 7: Search Bar */}
          <section id="searchbar" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Search Bar</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Pill search bar control with search glass icon, full-width glassmorphic input, keyboard shortcut badge (`⌘K`), and clear button.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; SearchBar &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              {/* 1. Live Interactive Search Bar */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Live Control Preview
                </h3>
                <div className="max-w-xl py-1">
                  <SearchBar
                    value={searchDemoQuery}
                    onChange={setSearchDemoQuery}
                    placeholder="Spotlight species, states, or parks…"
                    shortcut="⌘K"
                  />
                </div>
              </div>

              {/* Code Snippet */}
              <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-[11px] text-zinc-400">JSX Example</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `<SearchBar\n  value={query}\n  onChange={setQuery}\n  placeholder="Spotlight species, states, or parks…"\n  shortcut="⌘K"\n/>`,
                        "searchbar"
                      )
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                  >
                    {copiedSnippet === "searchbar" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">
                  {`<SearchBar
  value={query}
  onChange={setQuery}
  placeholder="Spotlight species, states, or parks…"
  shortcut="⌘K"
/>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 8: Design Tokens */}
          <section id="tokens" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Design Tokens</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Central design tokens aligned with Apple Design System guidelines: color swatches with hex codes, grayscale shades, conservation status badges, and typography hierarchy.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; tokens, colorSwatches, typographyScale &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-10">
              {/* 1. Color Palette (Apple HIG Swatches) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Color Palette (Swatches, Names & Hex Codes)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorSwatches.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3.5 py-2 px-1"
                    >
                      {/* Color Visual Swatch Box */}
                      <div className={`h-10 w-10 shrink-0 rounded-xl shadow-2xs ${item.class}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-zinc-900 truncate">{item.name}</span>
                          <span className="font-mono text-[10px] font-bold text-zinc-500 select-all shrink-0">{item.hex}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-400 block truncate mt-0.5">{item.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Typography Hierarchy (Apple HIG Scale) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  2. Typography Scale & Hierarchy (H1, H2, H3, Body, Sub-text, Tags)
                </h3>
                <div className="space-y-6">
                  {typographyScale.map((item) => (
                    <div
                      key={item.role}
                      className="py-3 border-b border-zinc-100 last:border-b-0 space-y-2"
                    >
                      {/* Role Header Info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 font-sans">{item.role}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">{item.font}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                          <span>{item.size}</span>
                          <span>·</span>
                          <span>{item.weight}</span>
                        </div>
                      </div>

                      {/* Live Text Sample */}
                      <div className="pt-1 overflow-x-auto">
                        <p className={item.class}>{item.sample}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
