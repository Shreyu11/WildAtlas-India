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
  Sparkles,
  Tag,
  LayoutList,
  Palette,
  MapPin,
  List as ListIcon,
} from "lucide-react";
import {
  IconButton,
  Toggle,
  Button,
  Badge,
  Tabs,
  MarkerTooltip,
  SearchBar,
  Card,
  Marker,
  List,
  colorSwatches,
  typographyScale,
  zIndex,
  glassmorphism,
} from "@/design-system";

export default function DesignSystemPage() {
  const [clickCount, setClickCount] = useState(0);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [toggleState, setToggleState] = useState(true);
  const [mammalToggle, setMammalToggle] = useState(true);
  const [birdToggle, setBirdToggle] = useState(false);
  const [activeTabDemo, setActiveTabDemo] = useState("species");
  const [interactiveTooltipExpanded, setInteractiveTooltipExpanded] = useState(false);
  const [searchDemoQuery, setSearchDemoQuery] = useState("");
  const [activeSection, setActiveSection] = useState("tokens");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const navItems = [
    { id: "tokens", label: "Design Tokens", icon: <Palette className="h-3.5 w-3.5" /> },
    { id: "button", label: "Text Button", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "icon-button", label: "Icon only Button", icon: <MousePointer className="h-3.5 w-3.5" /> },
    { id: "badge", label: "Badge", icon: <Tag className="h-3.5 w-3.5" /> },
    { id: "tabs", label: "Tabs", icon: <LayoutList className="h-3.5 w-3.5" /> },
    { id: "tooltip", label: "Hover Tooltip", icon: <MapPin className="h-3.5 w-3.5" /> },
    { id: "searchbar", label: "Search Bar", icon: <Search className="h-3.5 w-3.5" /> },
    { id: "cards", label: "Cards", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "markers", label: "Markers", icon: <Compass className="h-3.5 w-3.5" /> },
    { id: "lists", label: "Lists", icon: <ListIcon className="h-3.5 w-3.5" /> },
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
          {/* Section 1: Design Tokens */}
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
              {/* 1. Color Palette (2-Column Layout: Grayscale Tokens vs Colored Tokens) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Color Palette (Swatches, Names & Hex Codes)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Column 1: Grayscale Tokens */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-800 font-mono uppercase tracking-wide border-b border-zinc-100 pb-2">
                      Grayscale Tokens
                    </h4>
                    <div className="space-y-2">
                      {colorSwatches
                        .filter((item) => item.category === "Grayscale")
                        .map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-3.5 py-1.5 px-1"
                          >
                            {/* Color Visual Swatch Box */}
                            <div className={`h-9 w-9 shrink-0 rounded-xl shadow-2xs ${item.class}`} />
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

                  {/* Column 2: Colored Tokens */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-800 font-mono uppercase tracking-wide border-b border-zinc-100 pb-2">
                      Colored Tokens
                    </h4>
                    <div className="space-y-2">
                      {colorSwatches
                        .filter((item) => item.category !== "Grayscale")
                        .map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-3.5 py-1.5 px-1"
                          >
                            {/* Color Visual Swatch Box */}
                            <div className={`h-9 w-9 shrink-0 rounded-xl shadow-2xs ${item.class}`} />
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
                      <div className="py-2.5 px-1 overflow-x-auto overflow-y-visible">
                        <p className={item.class}>{item.sample}</p>
                      </div>
                    </div>
              {/* 3. Z-Index Elevation Tokens */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  3. Z-Index Elevation Tokens (`tokens.zIndex`)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                  {Object.entries(zIndex).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50 flex items-center justify-between">
                      <span className="font-semibold text-zinc-800">{key}</span>
                      <span className="bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded text-[11px] font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Glassmorphic Surface Tokens */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  4. Glassmorphic Surface Tokens (`tokens.glassmorphism`)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(glassmorphism).map(([key, val]) => (
                    <div key={key} className={`p-4 ${val} space-y-1`}>
                      <span className="font-mono text-xs font-bold text-zinc-900 block capitalize">{key}</span>
                      <code className="font-mono text-[10px] text-zinc-500 block truncate">{val}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Text Button */}
          <section id="button" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Text Button</h2>
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

          {/* Section 3: Icon only Button */}
          <section id="icon-button" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Icon only Button</h2>
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

              {/* 2. Interactive Click to Expand Preview */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  2. Interactive Click to Expand Preview
                </h3>
                <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white flex flex-col items-center gap-4 shadow-2xs">
                  <span className="text-xs font-semibold text-zinc-500 font-sans">
                    Click to expand
                  </span>
                  <div className="pt-2">
                    <MarkerTooltip
                      photoUrl="https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&auto=format&fit=crop&q=80"
                      label="Royal Bengal Tiger"
                      subtitle="Panthera tigris tigris"
                      fact="Apex predator found across India's national parks, mangrove forests, and tiger reserves."
                      status="EN"
                      expanded={interactiveTooltipExpanded}
                      onClick={() => setInteractiveTooltipExpanded((prev) => !prev)}
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

          {/* Section 8: Cards */}
          <section id="cards" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Cards</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Container card primitives and floating interactive card variations like the daily wildlife Fun Fact card.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; Card &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              {/* 1. Fun Fact Card Variation */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Fun Fact Card Variation (Floating "Did you know?")
                </h3>
                <div className="py-1">
                  <Card.FunFact
                    imageSrc="https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&auto=format&fit=crop&q=80"
                    imageAlt="Bengal tiger"
                    factText="Bengal tigers have striped skin, not just striped fur — the pattern is unique to each individual like a fingerprint. India holds roughly 70% of the world's wild tiger population."
                    highlightText="Bengal tiger"
                    onDismiss={() => alert("Card dismissed!")}
                    onClick={() => alert("Navigating to species page!")}
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
                        `<Card.FunFact\n  title="Did you know?"\n  imageSrc="/images/tiger.jpg"\n  factText="Bengal tigers have striped skin..."\n  highlightText="Bengal tiger"\n  onDismiss={handleDismiss}\n  onClick={handleClick}\n/>`,
                        "card"
                      )
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                  >
                    {copiedSnippet === "card" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">
                  {`<Card.FunFact
  title="Did you know?"
  imageSrc="/images/tiger.jpg"
  factText="Bengal tigers have striped skin..."
  highlightText="Bengal tiger"
  onDismiss={handleDismiss}
  onClick={handleClick}
/>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 9: Markers */}
          <section id="markers" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Markers</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Map location pin markers for species, national parks, wildlife sanctuaries, zoos, and numbered cluster badges.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; Marker &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              {/* 1. Marker Types Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Marker Type Variants (Species, Parks, Sanctuaries, Zoos & Numbered Clusters)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-end">
                  {/* Species Marker */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <Marker
                      type="species"
                      photoUrl="https://images.unsplash.com/photo-1555169062-013468b47731?w=200&auto=format&fit=crop&q=80"
                      label="Species Pin"
                    />
                    <span className="font-mono text-[11px] text-zinc-600 text-center font-medium">Species</span>
                  </div>

                  {/* National Park Marker */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <Marker type="national-park" label="Jim Corbett" />
                    <span className="font-mono text-[11px] text-zinc-600 text-center font-medium">National Park</span>
                  </div>

                  {/* Sanctuary Marker */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <Marker type="sanctuary" label="Bharatpur" />
                    <span className="font-mono text-[11px] text-zinc-600 text-center font-medium">Sanctuary</span>
                  </div>

                  {/* Zoo Marker */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <Marker type="zoo" label="Mysore Zoo" />
                    <span className="font-mono text-[11px] text-zinc-600 text-center font-medium">Zoo</span>
                  </div>

                  {/* Numbered Cluster Marker */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-2">
                      <Marker type="cluster" count={5} />
                      <Marker type="cluster" count={14} />
                      <Marker type="cluster" count={32} />
                    </div>
                    <span className="font-mono text-[11px] text-zinc-600 text-center font-medium">Numbered Cluster</span>
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
                        `<Marker type="species" photoUrl="/images/tiger.jpg" label="Bengal Tiger" />\n<Marker type="national-park" label="Jim Corbett" />\n<Marker type="cluster" count={12} />`,
                        "marker"
                      )
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                  >
                    {copiedSnippet === "marker" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">
                  {`<Marker type="species" photoUrl="/images/tiger.jpg" label="Bengal Tiger" />
<Marker type="national-park" label="Jim Corbett" />
<Marker type="sanctuary" label="Bharatpur" />
<Marker type="zoo" label="Mysore Zoo" />
<Marker type="cluster" count={12} />`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 10: Lists */}
          <section id="lists" className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-xs scroll-mt-28">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">Lists</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Navigation list items used in National Park & Protected Area detail drawers featuring category icons, domain text, and external link triggers.
              </p>
              <div className="mt-3 font-mono text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-400">Import:</span>
                <code className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-mono text-[11px] select-all">
                  import &#123; List &#125; from "@/design-system";
                </code>
              </div>
            </div>

            <div className="space-y-8">
              {/* 1. Navigation Link List Item Variation */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  1. Navigation Link List Item (Drawer External Link)
                </h3>
                <div className="max-w-xl">
                  <List>
                    <List.LinkItem
                      label="Papikonda National Park"
                      url="https://forests.ap.gov.in"
                      category="official"
                    />
                  </List>
                </div>
              </div>

              {/* 2. Species List Item Variation */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4">
                  2. Species List Items (With Tag & Without Tag)
                </h3>
                <div className="max-w-xl space-y-2">
                  <List.SpeciesItem
                    commonName="Royal Bengal Tiger"
                    scientificName="Panthera tigris tigris"
                    photoUrl="https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=200&auto=format&fit=crop&q=80"
                    tag="DOMINANT"
                    status="EN"
                  />
                  <List.SpeciesItem
                    commonName="Indian Peafowl"
                    scientificName="Pavo cristatus"
                    photoUrl="https://images.unsplash.com/photo-1555169062-013468b47731?w=200&auto=format&fit=crop&q=80"
                    status="LC"
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
                        `<List.SpeciesItem\n  commonName="Royal Bengal Tiger"\n  scientificName="Panthera tigris tigris"\n  photoUrl="/images/tiger.jpg"\n  tag="DOMINANT"\n  status="EN"\n  onClick={handleClick}\n/>`,
                        "list"
                      )
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans"
                  >
                    {copiedSnippet === "list" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">
                  {`<List.SpeciesItem
  commonName="Royal Bengal Tiger"
  scientificName="Panthera tigris tigris"
  photoUrl="/images/tiger.jpg"
  tag="DOMINANT"
  status="EN"
  onClick={handleClick}
/>`}
                </pre>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
