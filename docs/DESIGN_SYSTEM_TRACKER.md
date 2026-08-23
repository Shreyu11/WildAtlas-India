# WildAtlas India — Design System Component Audit & Progress Tracker

> [!NOTE]  
> This file tracks the componentisation progress of the WildAtlas India codebase. Update this document as components move from **To Build** → **In Progress** → **Ready**.

---

## 📊 Component & Token Status Tracker

| Category | Component / Token Name | Description & Purpose | Status | Location in Codebase |
| :--- | :--- | :--- | :---: | :--- |
| **Tokens** | **Color Palette Swatches** | Near-monochrome grayscale palette (`zinc-950` to `zinc-50`) + IUCN status accent colors | **✅ Ready** | [`Design System/tokens.ts`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/tokens.ts#L7-L28) |
| **Tokens** | **Typography Scale** | Apple HIG aligned scale (`H1`, `H2 Entity Title Extrabold`, `H3 Section Header`, `H4 Card Title`, `Body`, `Sub-text`, `Subtitle Italic`, `Tags & Mono Kicker`, `Map Labels`, `Attribution`) | **✅ Ready** | [`Design System/tokens.ts`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/tokens.ts#L30-L110) |
| **Tokens** | **Z-Index Elevation Tokens** | Standardised z-index tiering (`mapControls: z-[2]`, `floatingCard: z-20`, `topNav: z-30`, `drawer: z-50`, `loader: z-50`) | **✅ Ready** | [`Design System/tokens.ts`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/tokens.ts#L113-L121) |
| **Tokens** | **Glassmorphic Surface Tokens** | Standard backdrop blur & translucency styles (`floatingCapsule`, `floatingCard`, `drawer`) | **✅ Ready** | [`Design System/tokens.ts`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/tokens.ts#L123-L127) |
| **Atoms** | **Button** | Standard text button with 5 visual variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), icon slots & spinner | **✅ Ready** | [`Design System/Button/Button.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/Button/Button.tsx) |
| **Atoms** | **IconButton** | Accessible icon button (`28px`/`36px`/`44px`), screen reader support, 5 variants | **✅ Ready** | [`Design System/IconButton/IconButton.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/IconButton/IconButton.tsx) |
| **Atoms** | **Badge** | IUCN status badges (`CR`, `EN`, `VU`, `NT`, `LC`), category tags, and vibe pill tags | **✅ Ready** | [`Design System/Badge/Badge.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/Badge/Badge.tsx) |
| **Atoms** | **Toggle** | Accessible sliding switch toggle (`role="switch"`) with keyboard support | **✅ Ready** | [`Design System/Toggle/Toggle.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/Toggle/Toggle.tsx) |
| **Atoms** | **Tabs** | Accessible horizontal tab strip with active pill indicator & count badges | **✅ Ready** | [`Design System/Tabs/Tabs.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/Tabs/Tabs.tsx) |
| **Atoms** | **List & LinkItem** | Standard item row with thumbnail slot, title, subtitle, link chevron, and link preview card | **✅ Ready** | [`Design System/List/List.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/List/List.tsx) |
| **Atoms** | **List.ProtectedAreaItem** | List item primitive for National Parks, Sanctuaries, and Zoos with area/established tags | **✅ Ready** | [`Design System/List/List.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/List/List.tsx#L195-L248) |
| **Molecules** | **SearchBar** | Search input with glassmorphic container, search glass icon, clear button, and `⌘K` keyboard badge | **✅ Ready** | [`Design System/SearchBar/SearchBar.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/SearchBar/SearchBar.tsx) |
| **Molecules** | **Marker & Tooltip** | Fixed-size 44px species photo-bubble marker, protected area pins, and 112px/224px speech-bubble tooltip | **✅ Ready** | [`Design System/Marker/Marker.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/Marker/Marker.tsx) & [`MarkerTooltip`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/MarkerTooltip/MarkerTooltip.tsx) |
| **Molecules** | **SpeciesAudioButton & Player** | Audio trigger button with playing state animation & full audio player for bird calls | **✅ Ready** | [`src/components/audio/SpeciesAudioButton.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/audio/SpeciesAudioButton.tsx) |
| **Molecules** | **Card.Floating** | Base glassmorphic floating card container primitive (`w-XX rounded-[22px] bg-white/85 backdrop-blur-2xl`) | **✅ Ready** | [`Design System/Card/Card.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/Card/Card.tsx#L120-L132) |
| **Molecules** | **CitedFactRow / CitedFactList** | Displays Wikidata/Wikipedia cited facts (Mass, Height, Gestation, Lifespan, Diet) with source links | **⏳ To Build** | Inline helper in [`SpeciesDetail.tsx:L15-L45`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/detail/SpeciesDetail.tsx#L15-L45) |
| **Molecules** | **PopulationTrendChart** | Bar chart visualization for official census trends over time with dynamic percentage height scaling | **⏳ To Build** | Inline implementation in [`SpeciesDetail.tsx:L204-L233`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/detail/SpeciesDetail.tsx#L204-L233) |
| **Molecules** | **PublicAccessBadge** | Badge tag for public access rules (`"open"`, `"permit-required"`, `"restricted"`) with access notes | **⏳ To Build** | Inline instances in [`ProtectedAreaDetail.tsx:L57-L66`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/detail/ProtectedAreaDetail.tsx#L57-L66) |
| **Molecules** | **OfficialSymbolCard** | Card displaying official State Animal / State Bird with thumbnail photo, label, link & audio trigger | **⏳ To Build** | Inline grid in [`StateDetailTabs.tsx:L68-L100`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/detail/StateDetailTabs.tsx#L68-L100) |
| **Molecules** | **CalloutBox / FactCard** | Standardized highlighted callout box for "Did you know?", "Best time to visit", "Unique traits" | **⏳ To Build** | Inline callout containers in `SpeciesDetail.tsx` & `ProtectedAreaDetail.tsx` |
| **Molecules** | **MediaHeader** | Standardized aspect-ratio media photo header with attribution caption for detail panels | **⏳ To Build** | Duplicated aspect-video blocks in detail components |
| **Organisms** | **TopNav** | Floating navigation bar capsule containing brand logo, search bar, and action cluster (audio/info) | **✅ Ready** | [`src/components/TopNav/TopNav.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/TopNav/TopNav.tsx) |
| **Organisms** | **ExploreRail** | Floating quick-start species menu (top-left) built on `Card.Floating` with dismiss state | **✅ Ready** | [`src/components/ExploreRail/ExploreRail.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/ExploreRail/ExploreRail.tsx) |
| **Organisms** | **WelcomeCard** | Floating onboarding welcome card anchored bottom-right built on `Card.Floating` with `localStorage` state | **✅ Ready** | [`src/components/WelcomeCard/WelcomeCard.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/WelcomeCard/WelcomeCard.tsx) |
| **Organisms** | **FunFactCard** | Floating daily wildlife fact card using `Card.FunFact` | **✅ Ready** | [`src/components/FunFactCard/FunFactCard.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/FunFactCard/FunFactCard.tsx) |
| **Organisms** | **MapViewSettings** | Slide-over/modal layer settings panel triggered via `Shift+V` keyboard shortcut | **✅ Ready** | [`src/components/MapViewSettings/MapViewSettings.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/MapViewSettings/MapViewSettings.tsx) |
| **Organisms** | **Drawer** | Slide-over right drawer panel (~30vw/360px) with iOS grab handle, 300ms transition & Escape key handling | **✅ Ready** | [`src/components/Drawer/Drawer.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/Drawer/Drawer.tsx) |
| **Organisms** | **FootprintLoader** | Animated splash screen with footprint SVG keyframe animations & step status text | **✅ Ready** | [`src/components/FootprintLoader/FootprintLoader.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/FootprintLoader/FootprintLoader.tsx) |
| **Organisms** | **DataAttributionFooter** | Standardized data citation and copyright disclosure footer | **✅ Ready** | [`src/components/DataAttributionFooter.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/components/DataAttributionFooter.tsx) |

---

## 🛠️ Quick Access Links & References

- **Live Showcase Catalog**: [http://localhost:3001/design-system](http://localhost:3001/design-system)
- **Central Index Export**: [`Design System/index.ts`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/index.ts)
- **Central Tokens File**: [`Design System/tokens.ts`](file:///Users/shreyas/AI-Experiments/wildatlas-india/Design%20System/tokens.ts)
- **Showcase Source Code**: [`src/app/design-system/page.tsx`](file:///Users/shreyas/AI-Experiments/wildatlas-india/src/app/design-system/page.tsx)
