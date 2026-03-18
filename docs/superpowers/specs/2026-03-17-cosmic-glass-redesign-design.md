# Cosmic Glass -- Finance Pro Frontend Redesign

**Date:** 2026-03-17
**Status:** Approved
**Scope:** Full frontend visual redesign

---

## 1. Overview

Redesign Finance Pro's frontend from a generic dark dashboard into a distinctive "Cosmic Glass" aesthetic: midnight glassmorphism with a cosmic purple palette, Space Grotesk typography, and magazine-style layouts. The goal is a premium, futuristic feel that's visually unique without sacrificing usability.

**Key decisions made during brainstorming:**

- Visual personality: Midnight Glassmorphism (frosted panels, depth, gradients)
- Dashboard density: Magazine layout (asymmetric grid, hero chart, varied section sizes)
- Color palette: Cosmic Purple (near-black to deep indigo gradient, violet accents)
- Typography: Space Grotesk (geometric, futuristic, great for numbers)
- Landing page: Removed -- `/` redirects to `/dashboard`

---

## 2. Design Tokens

### 2.1 Color System

**Migration strategy:** The current `globals.css` uses space-separated RGB channels (e.g., `--bg-primary: 17 24 39`) consumed via `rgb(var(--bg-primary))`. The new system uses complete color values (hex/rgba) consumed via `var(--token)` directly. During implementation:
1. Replace the entire `:root, html.dark` block in `globals.css` with the new tokens below
2. All `rgb(var(--old-token))` usages across every component must be replaced with `var(--new-token)`
3. Remove all `dark:` prefixed Tailwind classes globally -- the app is dark-only, so apply dark styles directly
4. The `ThemeProvider` can remain (it sets the `dark` class) but no component should conditionally style based on it

#### Backgrounds

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#0a0a1a` | Page background (gradient start) |
| `--bg-deep` | `#1a1035` | Page background (gradient end) |
| `--bg-glass` | `rgba(255, 255, 255, 0.03)` | Glass card base |
| `--bg-glass-hover` | `rgba(255, 255, 255, 0.06)` | Glass card hover |
| `--bg-glass-elevated` | `rgba(255, 255, 255, 0.08)` | Elevated panels (sidebar, modals) |
| `--bg-glass-subtle` | `rgba(255, 255, 255, 0.02)` | Table header/footer, subtle areas |

#### Text

| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#f0eef6` | Headings, primary content |
| `--text-secondary` | `#a8a3b8` | Descriptions, labels |
| `--text-muted` | `#6b6580` | Placeholders, disabled |

#### Accents

| Token | Value | Usage |
|---|---|---|
| `--accent-primary` | `#8b5cf6` | Primary interactive (buttons, links, focus) |
| `--accent-primary-hover` | `#a78bfa` | Hover state |
| `--accent-glow` | `rgba(139, 92, 246, 0.2)` | Box shadow glow |
| `--accent-income` | `#34d399` | Income/positive values |
| `--accent-expense` | `#f472b6` | Expense/negative values |
| `--accent-info` | `#60a5fa` | Neutral/informational |
| `--accent-warning` | `#fbbf24` | Warnings, budget limits |

#### Borders

| Token | Value | Usage |
|---|---|---|
| `--border-glass` | `rgba(255, 255, 255, 0.08)` | Glass card borders |
| `--border-glass-hover` | `rgba(255, 255, 255, 0.15)` | Hover borders |
| `--border-accent` | `rgba(139, 92, 246, 0.3)` | Active/focused borders |

### 2.2 Tailwind Theme Configuration

Update `tailwind.config.ts` to map the new CSS variables into Tailwind's theme so utility classes work:

```ts
colors: {
  glass: {
    DEFAULT: 'var(--bg-glass)',
    hover: 'var(--bg-glass-hover)',
    elevated: 'var(--bg-glass-elevated)',
    subtle: 'var(--bg-glass-subtle)',
  },
  accent: {
    DEFAULT: 'var(--accent-primary)',
    hover: 'var(--accent-primary-hover)',
    glow: 'var(--accent-glow)',
  },
}
```

Remove the existing `primary`, `background`, `surface` theme keys that reference the old tokens.

### 2.3 Typography

**Font:** Space Grotesk (weights: 400, 500, 600, 700)

Note: Weight 300 (Light) is excluded -- too thin for body text on dark backgrounds. Minimum weight is 400 (Regular).

| Element | Size | Weight | Extras |
|---|---|---|---|
| Page title | `text-3xl` (30px) | 700 | `tracking-tight` |
| Section heading | `text-xl` (20px) | 600 | -- |
| Card title | `text-lg` (18px) | 600 | -- |
| Body | `text-sm` (14px) | 400 | `leading-relaxed` |
| Label | `text-xs` (12px) | 500 | `uppercase tracking-wider text-secondary` |
| Hero metric | `text-5xl` (48px) | 700 | `tabular-nums` |
| Card metric | `text-2xl` (24px) | 700 | `tabular-nums` |

### 2.4 Effects

| Effect | Value |
|---|---|
| Glass blur | `backdrop-filter: blur(20px)` |
| Card shadow | `0 4px 24px rgba(0, 0, 0, 0.3)` |
| Glow shadow | `0 0 20px var(--accent-glow)` |
| Hover scale | `transform: scale(1.01)` |
| Transition | `all 200ms ease` |

### 2.5 Spacing

| Context | Value |
|---|---|
| Page padding | `px-6 lg:px-8 py-8` |
| Section gap | `gap-6` |
| Card padding | `p-6` |
| Compact card padding | `p-4` |

---

## 3. Component Specifications

### 3.1 Glass Card

The foundational UI element. Replaces all current `bg-slate-900 border-slate-800` cards.

```
Base state:
  background: var(--bg-glass)
  border: 1px solid var(--border-glass)
  backdrop-filter: blur(20px)
  border-radius: 16px
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3)

Hover state (interactive cards only):
  background: var(--bg-glass-hover)
  border-color: var(--border-glass-hover)
  transform: translateY(-1px)
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)

Active/Focus state:
  border-color: var(--border-accent)
  box-shadow: 0 0 20px var(--accent-glow)
```

Tailwind implementation: Create `.glass`, `.glass-hover`, and `.glass-elevated` utility classes in globals.css.

### 3.2 Sidebar

- Background: `var(--bg-glass-elevated)` with `backdrop-blur-xl`
- Border-right: `var(--border-glass)`
- Active nav item: purple left bar + `bg-purple-500/10` + purple text glow
- Hover: `bg-white/5`
- Logo icon: purple gradient background (`from-violet-600 to-purple-600`) instead of amber
- Collapse toggle: glass button with purple hover

### 3.3 Buttons

**Primary:**
- Background: `var(--accent-primary)`
- Text: white
- Shadow: `0 0 20px var(--accent-glow)`
- Hover: `var(--accent-primary-hover)` + shadow `0 0 30px var(--accent-glow)`
- Border-radius: `12px`

**Secondary/Ghost:**
- Background: `var(--bg-glass)`
- Border: `1px solid var(--border-glass)`
- Text: `var(--text-secondary)`
- Hover: background `var(--bg-glass-hover)` + border `var(--border-glass-hover)`

**Destructive:**
- Background: `rgba(244, 114, 182, 0.15)`
- Text: `#f472b6`
- Border: `1px solid rgba(244, 114, 182, 0.3)`
- Hover: background `rgba(244, 114, 182, 0.25)` + border `rgba(244, 114, 182, 0.5)`

### 3.4 Inputs & Selects

- Background: `rgba(0, 0, 0, 0.3)`
- Border: `1px solid var(--border-glass)`
- Text: `var(--text-primary)`
- Placeholder: `var(--text-muted)`
- Focus: `border-color: var(--accent-primary)` + `box-shadow: 0 0 12px var(--accent-glow)`
- Border-radius: `12px`

### 3.5 Modals

- Overlay: `rgba(0, 0, 0, 0.6)` + `backdrop-blur-sm`
- Content: `var(--bg-glass-elevated)` + `backdrop-blur-xl`
- Border: `1px solid var(--border-glass)`
- Border-radius: `20px`
- Shadow: `0 24px 48px rgba(0, 0, 0, 0.5)`
- Title: `text-xl font-semibold` (not uppercase)

### 3.6 Table

- Container: glass card
- Header: `var(--bg-glass-subtle)` with bottom border
- Header text: `var(--text-muted)` uppercase, `text-xs`
- Rows: transparent, `hover:bg-[rgba(255,255,255,0.03)]` transition
- Row dividers: `border-color: var(--border-glass)` (subtle)
- Sort indicators: purple accent when active
- Footer: `var(--bg-glass-subtle)` with top border and summary

### 3.7 Badges/Pills

- Category: `bg-white/5` + `border border-white/[0.08]` + text `var(--text-secondary)`
- Income: `bg-emerald-500/10` + `border-emerald-500/20` + `text-emerald-400`
- Expense: `bg-pink-500/10` + `border-pink-500/20` + `text-pink-400`
- Filter active: `bg-purple-500/15` + `border-purple-500/30` + `text-purple-300`

### 3.8 Charts

- Grid lines: `rgba(255, 255, 255, 0.05)`
- Colors: match accent system (purple primary, pink expense, green income, blue info)
- Line charts: gradient fill under line with purple-to-transparent
- Doughnut: use accent palette with spacing between segments
- **Tooltips:** Use Chart.js `external` tooltip callback to render a custom HTML tooltip element with glass card styling (background `var(--bg-glass-elevated)`, border `var(--border-glass)`, `backdrop-filter: blur(12px)`). This replaces the default canvas-rendered tooltip.

### 3.9 Loading/Skeleton States

- Skeleton: `bg-white/5` with animated purple shimmer
- Shimmer animation: gradient sweep from transparent to `rgba(139, 92, 246, 0.08)` to transparent
- Duration: 1.5s infinite

### 3.10 Empty States

When a page or section has no data (no transactions, no budget goals, no analytics):
- Container: glass card, centered content
- Icon: relevant Lucide icon at `w-12 h-12` in `var(--text-muted)`
- Title: `text-lg font-semibold` in `var(--text-secondary)`
- Description: `text-sm` in `var(--text-muted)`
- Optional CTA: primary button to add first item

### 3.11 Transaction Card (Mobile)

`TransactionCard.tsx` is the mobile/compact view of a transaction row:
- Glass card with `p-4`
- Top row: description (bold) + amount (right-aligned, color-coded income/expense)
- Bottom row: date (muted) + category badge + origin badge
- Hover: standard glass-hover treatment
- Swipe or tap for edit/delete actions

---

## 4. Page Layouts

### 4.1 Landing Page (`/`)

Removed. `page.tsx` exports a redirect to `/dashboard` using Next.js `redirect()` from `next/navigation`.

### 4.2 Dashboard (Magazine Layout)

#### Desktop (lg+)
```
+-----------------------------------------------+
| Page Title + Period Selector          [actions] |
+-----------------------------------------------+
|                        |  Metric    | Metric   |
|   Hero Chart           |  Card 1    | Card 2   |
|   (2/3 width,         |  (small)   | (small)  |
|    tall, line/area)    |------------|----------|
|                        |  Metric    | Metric   |
|                        |  Card 3    | Card 4   |
+------------------------+------------------------+
|  Category Breakdown    |  Recent Transactions   |
|  (doughnut chart,      |  (compact list,        |
|   1/2 width)           |   1/2 width)           |
+------------------------+------------------------+
|  AI Insights Panel (full width, glass card)     |
+-----------------------------------------------+
```

#### Tablet (md)
```
+-----------------------------------------------+
| Page Title + Period Selector                    |
+-----------------------------------------------+
| Hero Chart (full width, shorter height)         |
+------------------------+------------------------+
| Metric Card 1          | Metric Card 2          |
+------------------------+------------------------+
| Metric Card 3          | Metric Card 4          |
+------------------------+------------------------+
| Category Breakdown     | Recent Transactions    |
+------------------------+------------------------+
| AI Insights (full width)                        |
+-----------------------------------------------+
```

#### Mobile (sm)
```
+---------------------------+
| Page Title                |
| Period Selector           |
+---------------------------+
| Metric Card 1 (full)     |
| Metric Card 2 (full)     |
| Metric Card 3 (full)     |
| Metric Card 4 (full)     |
+---------------------------+
| Hero Chart (full, shorter)|
+---------------------------+
| Category Breakdown (full) |
+---------------------------+
| Recent Transactions (full)|
+---------------------------+
| AI Insights (full)        |
+---------------------------+
```

- Hero chart: Large area/line chart showing spending trend, with gradient fill
- Metric cards: Varied sizes, each with icon + label + value + trend indicator
- Category breakdown: Doughnut with legend integrated
- Recent transactions: Compact 5-item list with quick view
- AI insights: Collapsible panel with purple sparkle icon

### 4.3 Transactions

```
+-----------------------------------------------+
| Page Title                        [+ Add] [CSV]|
+-----------------------------------------------+
| Filters bar (inline, glass)                     |
| [Search] [Type] [Category] [Origin] [Period]   |
+-----------------------------------------------+
| Glass Table                                     |
|  Date | Description | Category | Amount | Acts  |
|  ...  | ...         | ...      | ...    | ...   |
+-----------------------------------------------+
| Pagination + Page size selector                 |
+-----------------------------------------------+
```

- Filters: inline horizontal bar in a glass card, not a grid
- Table: glass container, clean rows, hover reveals actions
- Pagination: centered, glass pill buttons

### 4.4 Recurring

Full restyle to match the Cosmic Glass system. Replace all `dark:` conditional classes and light-mode classes with direct dark styling. Same card-based layout but with glass cards and purple accents.

### 4.5 Analytics

- Period selector: glass pill toggle (not button group)
- Charts: full glass cards with chart inside
- Maintain current layout structure but with glass treatment and purple color scheme

### 4.6 Budget

- Budget cards: glass with progress bars using purple-to-pink gradient
- Goal cards: glass with circular progress indicator
- Modals: glass overlay style

---

## 5. Animations & Transitions

### 5.1 Global

| Animation | Specification |
|---|---|
| Card hover | `transform: translateY(-1px)` + shadow increase, 200ms ease |
| Button hover | Glow intensity increase, 150ms ease |
| Focus ring | Purple glow fade-in, 200ms ease |
| Page load | Content fade-in with subtle slide-up, 300ms ease-out |

### 5.2 Skeleton Shimmer

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(139, 92, 246, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 5.3 Sidebar

- Mobile slide-in: keep current `slide-in-left` animation
- Collapse: smooth width transition (already implemented)
- Active indicator: purple bar with glow pulse on route change

---

## 6. Files to Modify

### New/Modified Design System Files
- `frontend/src/app/globals.css` -- Replace design tokens, add glass utilities, add shimmer/animations
- `frontend/tailwind.config.ts` -- Map new CSS variables to Tailwind theme, remove old color keys
- `frontend/src/app/layout.tsx` -- Swap Poppins for Space Grotesk, update body bg

### Components to Update
- `frontend/src/components/Sidebar.tsx` -- Glass effect, purple accents replacing amber
- `frontend/src/components/AppShell.tsx` -- Background gradient on main wrapper
- `frontend/src/components/ui/button.tsx` -- New variant styles (glass, glow)
- `frontend/src/components/ui/input.tsx` -- Glass input styling
- `frontend/src/components/ui/select.tsx` -- Glass select styling
- `frontend/src/components/ui/card.tsx` -- Glass card base
- `frontend/src/components/ui/skeleton.tsx` -- Purple shimmer
- `frontend/src/components/ui/table-skeleton.tsx` -- Purple shimmer
- `frontend/src/components/ui/card-skeleton.tsx` -- Purple shimmer
- `frontend/src/components/ui/pagination.tsx` -- Glass pill buttons
- `frontend/src/components/AddTransactionModal.tsx` -- Glass modal, purple focus
- `frontend/src/components/EditTransactionModal.tsx` -- Glass modal, purple focus
- `frontend/src/components/ImportCSVModal.tsx` -- Glass modal, purple focus
- `frontend/src/components/ManageCategoriesModal.tsx` -- Glass modal, purple focus
- `frontend/src/components/ReviewCategoriesModal.tsx` -- Glass modal, purple focus
- `frontend/src/components/TransactionTable.tsx` -- Glass table
- `frontend/src/components/TransactionCard.tsx` -- Glass card (see spec 3.11)
- `frontend/src/components/DevTools.tsx` -- Glass panel, purple accents
- `frontend/src/components/SpendingInsights.tsx` -- Glass card, purple sparkle theme

### Components to Delete
- `frontend/src/components/Navbar.tsx` -- Replaced by Sidebar. Remove file and any imports.

### Pages
- `frontend/src/app/page.tsx` -- Replace with redirect to `/dashboard`
- `frontend/src/app/dashboard/page.tsx` -- Magazine layout rebuild
- `frontend/src/app/transactions/page.tsx` -- Glass treatment, inline filters
- `frontend/src/app/recurring/page.tsx` -- Full restyle (strip all light/dark dual-mode classes)
- `frontend/src/app/analytics/page.tsx` -- Glass treatment, purple charts
- `frontend/src/app/budget/page.tsx` -- Glass treatment, purple progress bars

---

## 7. Implementation Strategy

1. **Foundation first:** Design tokens in globals.css, font swap, background gradient, glass utility classes, tailwind config
2. **Components second:** Update UI primitives (button, input, select, card, skeleton)
3. **Sidebar:** Glass effect + purple accents
4. **Pages one by one:** Dashboard (magazine layout), Transactions, Recurring, Analytics, Budget
5. **Landing page:** Replace with redirect
6. **Cleanup:** Delete Navbar.tsx, remove all stale `dark:` classes, strip old token references
7. **Polish:** Animations, hover states, loading states, empty states

Each step should produce a visually consistent intermediate state -- no page should look broken while another is updated.

---

## 8. Out of Scope

- Backend changes (none needed)
- New features or functionality
- Mobile-specific redesign (responsive adjustments only, breakpoints defined in Section 4.2)
- Chart library migration (keep Chart.js)
- New component library (keep Radix UI)
