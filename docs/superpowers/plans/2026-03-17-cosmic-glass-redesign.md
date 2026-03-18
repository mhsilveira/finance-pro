# Cosmic Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Finance Pro frontend from a generic dark dashboard into a distinctive "Cosmic Glass" aesthetic with glassmorphism, cosmic purple palette, Space Grotesk typography, and magazine-style dashboard layout.

**Architecture:** Replace all design tokens, utility classes, and component styles in a foundation-up approach. Start with CSS variables and glass utilities, update shared UI primitives, then restyle each page. The dashboard gets a magazine layout rebuild; other pages get glass treatment while preserving their existing structure.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS 4, Radix UI Dialog, Lucide React icons, Chart.js + react-chartjs-2, class-variance-authority (cva)

**Spec:** `docs/superpowers/specs/2026-03-17-cosmic-glass-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/app/globals.css` | Rewrite | Design tokens, glass utilities, animations |
| `frontend/tailwind.config.ts` | Rewrite | Theme mapping for new tokens |
| `frontend/src/app/layout.tsx` | Modify | Font swap (Poppins → Space Grotesk) |
| `frontend/src/components/AppShell.tsx` | Modify | Background gradient on main wrapper |
| `frontend/src/components/ui/button.tsx` | Rewrite | Purple accent variants with glow |
| `frontend/src/components/ui/input.tsx` | Rewrite | Glass input styling |
| `frontend/src/components/ui/select.tsx` | Rewrite | Glass select styling |
| `frontend/src/components/ui/card.tsx` | Rewrite | Glass card system |
| `frontend/src/components/ui/skeleton.tsx` | Rewrite | Purple shimmer animation |
| `frontend/src/components/ui/table-skeleton.tsx` | Modify | Use new glass/skeleton classes |
| `frontend/src/components/ui/card-skeleton.tsx` | Modify | Use new glass/skeleton classes |
| `frontend/src/components/ui/pagination.tsx` | Modify | Glass pill buttons, purple active |
| `frontend/src/components/Sidebar.tsx` | Modify | Glass effect, purple accents |
| `frontend/src/components/TransactionTable.tsx` | Modify | Glass table styling |
| `frontend/src/components/TransactionCard.tsx` | Rewrite | Glass card mobile layout |
| `frontend/src/components/AddTransactionModal.tsx` | Modify | Glass modal styling |
| `frontend/src/components/EditTransactionModal.tsx` | Modify | Glass modal styling |
| `frontend/src/components/ImportCSVModal.tsx` | Modify | Glass modal styling |
| `frontend/src/components/ManageCategoriesModal.tsx` | Modify | Glass modal styling |
| `frontend/src/components/ReviewCategoriesModal.tsx` | Modify | Glass modal styling |
| `frontend/src/components/SpendingInsights.tsx` | Modify | Glass card, purple theme |
| `frontend/src/components/DevTools.tsx` | Modify | Glass panel styling |
| `frontend/src/app/page.tsx` | Rewrite | Redirect to /dashboard |
| `frontend/src/app/dashboard/page.tsx` | Rewrite | Magazine layout + glass treatment |
| `frontend/src/app/transactions/page.tsx` | Modify | Glass treatment, inline filters |
| `frontend/src/app/recurring/page.tsx` | Rewrite | Full restyle (strip dual-mode) |
| `frontend/src/app/analytics/page.tsx` | Modify | Glass treatment, purple charts |
| `frontend/src/app/budget/page.tsx` | Modify | Glass treatment, purple progress |
| `frontend/src/components/Navbar.tsx` | Delete | Replaced by Sidebar |

---

## Task 1: Foundation -- Design Tokens & Glass Utilities

**Files:**
- Rewrite: `frontend/src/app/globals.css`
- Rewrite: `frontend/tailwind.config.ts`
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/components/AppShell.tsx`

This task replaces the entire design system. The app may look visually inconsistent until subsequent tasks update each component -- this is acceptable as the foundation must land first.

- [ ] **Step 1: Rewrite globals.css with new design tokens and glass utilities**

Replace the entire file content with:

```css
@import "tailwindcss";

:root {
  --bg-base: #0a0a1a;
  --bg-deep: #1a1035;
  --bg-glass: rgba(255, 255, 255, 0.03);
  --bg-glass-hover: rgba(255, 255, 255, 0.06);
  --bg-glass-elevated: rgba(255, 255, 255, 0.08);
  --bg-glass-subtle: rgba(255, 255, 255, 0.02);

  --text-primary: #f0eef6;
  --text-secondary: #a8a3b8;
  --text-muted: #6b6580;

  --accent-primary: #8b5cf6;
  --accent-primary-hover: #a78bfa;
  --accent-glow: rgba(139, 92, 246, 0.2);
  --accent-income: #34d399;
  --accent-expense: #f472b6;
  --accent-info: #60a5fa;
  --accent-warning: #fbbf24;

  --border-glass: rgba(255, 255, 255, 0.08);
  --border-glass-hover: rgba(255, 255, 255, 0.15);
  --border-accent: rgba(139, 92, 246, 0.3);
}

@layer base {
  html, body {
    @apply min-h-screen;
    background: linear-gradient(135deg, var(--bg-base) 0%, var(--bg-deep) 100%);
    color: var(--text-primary);
  }

  * {
    @apply box-border;
  }

  button {
    @apply cursor-pointer;
  }

  input, select, textarea {
    background: rgba(0, 0, 0, 0.3);
    color: var(--text-primary);
    border-color: var(--border-glass);
  }

  input::placeholder, select::placeholder, textarea::placeholder {
    color: var(--text-muted);
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 12px var(--accent-glow);
  }
}

.glass {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  transition: all 200ms ease;
}

.glass-hover:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-glass-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.glass-elevated {
  background: var(--bg-glass-elevated);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(24px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

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
  border-radius: 8px;
}

@keyframes slide-in-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in-left 0.2s ease-out;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in-up 0.3s ease-out;
}

.dark {
  color-scheme: dark;
}
```

- [ ] **Step 2: Rewrite tailwind.config.ts with Cosmic Glass theme**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: "var(--bg-glass)",
          hover: "var(--bg-glass-hover)",
          elevated: "var(--bg-glass-elevated)",
          subtle: "var(--bg-glass-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          glow: "var(--accent-glow)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Swap font from Poppins to Space Grotesk in layout.tsx**

In `frontend/src/app/layout.tsx`, replace:
- Import: `Poppins` → `Space_Grotesk` from `next/font/google`
- Config: Change weights to `["400", "500", "600", "700"]`, keep `subsets: ["latin"]` and `display: "swap"`
- Rename variable: `poppins` → `spaceGrotesk`
- Update `className` reference in `<body>`

- [ ] **Step 4: Add background gradient to AppShell.tsx**

In `frontend/src/components/AppShell.tsx`, the `<main>` element already has `min-h-screen`. The background gradient is now applied globally via `html, body` in globals.css, so no change needed to AppShell beyond ensuring it doesn't override backgrounds.

Remove `bg-slate-950` from the AppShell if present.

- [ ] **Step 5: Verify foundation renders**

Run: `cd frontend && npx next dev --turbopack` (or via Docker)
Expected: App loads with purple gradient background. All components will look broken (wrong colors) -- that's expected. The gradient background and new font should be visible.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/globals.css frontend/tailwind.config.ts frontend/src/app/layout.tsx frontend/src/components/AppShell.tsx
git commit -m "feat: cosmic glass foundation — design tokens, glass utilities, Space Grotesk font"
```

---

## Task 2: UI Primitives -- Button, Input, Select, Card, Skeleton, Pagination

**Files:**
- Rewrite: `frontend/src/components/ui/button.tsx`
- Rewrite: `frontend/src/components/ui/input.tsx`
- Rewrite: `frontend/src/components/ui/select.tsx`
- Rewrite: `frontend/src/components/ui/card.tsx`
- Rewrite: `frontend/src/components/ui/skeleton.tsx`
- Modify: `frontend/src/components/ui/table-skeleton.tsx`
- Modify: `frontend/src/components/ui/card-skeleton.tsx`
- Modify: `frontend/src/components/ui/pagination.tsx`

- [ ] **Step 1: Rewrite button.tsx**

Replace the `buttonVariants` cva call. Key changes:
- Base: `rounded-xl transition-all duration-200` (was `rounded-lg`)
- `default`: `bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)] hover:bg-[var(--accent-primary-hover)] hover:shadow-[0_0_30px_var(--accent-glow)]` (was yellow-500)
- `destructive`: `bg-pink-500/15 text-pink-400 border border-pink-500/30 hover:bg-pink-500/25 hover:border-pink-500/50` (was solid red)
- `outline`: `border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-glass-hover)]` (was slate)
- `secondary`: Same as outline
- `ghost`: `text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]`
- `link`: `text-[var(--accent-primary)] underline-offset-4 hover:underline`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]`

- [ ] **Step 2: Rewrite input.tsx**

Replace Tailwind classes on the `<input>`:
```
flex h-10 w-full rounded-xl border border-[var(--border-glass)] bg-[rgba(0,0,0,0.3)]
px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)]
disabled:cursor-not-allowed disabled:opacity-50 transition-all
```

- [ ] **Step 3: Rewrite select.tsx**

Same as input but with `pr-9 appearance-none` and the custom SVG arrow. Change the arrow stroke color from `%239ca3af` (gray) to `%236b6580` (muted purple, matching `--text-muted`).

```
flex h-10 w-full rounded-xl border border-[var(--border-glass)] bg-[rgba(0,0,0,0.3)]
px-3 py-2 pr-9 text-sm text-[var(--text-primary)]
focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)]
disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none
bg-[length:16px_16px] bg-[position:right_0.625rem_center] bg-no-repeat
bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg...stroke=%226b6580%22...')]
```

- [ ] **Step 4: Rewrite card.tsx**

Replace all card sub-components:
- **Card**: `glass glass-hover` classes (replaces inline Tailwind)
- **CardHeader**: Keep `flex flex-col space-y-1.5 p-6`
- **CardTitle**: `text-lg font-semibold leading-none tracking-tight` (remove `uppercase tracking-wide`)
- **CardDescription**: `text-sm text-[var(--text-secondary)]` (was `text-gray-400`)
- **CardContent**: Keep `p-6 pt-0`
- **CardFooter**: Keep `flex items-center p-6 pt-0`

- [ ] **Step 5: Rewrite skeleton.tsx**

Replace: `animate-pulse rounded-lg bg-slate-800` → just the `skeleton` class (defined in globals.css with purple shimmer).

```tsx
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}
```

- [ ] **Step 6: Update table-skeleton.tsx**

Replace all slate color references:
- Table wrapper: `bg-slate-900 border border-slate-800` → `glass`
- Head: `bg-slate-950 border-b border-slate-800` → `bg-[var(--bg-glass-subtle)] border-b border-[var(--border-glass)]`
- Rows: `hover:bg-slate-800/50` → `hover:bg-white/[0.03]`
- Dividers: `divide-slate-800` → `divide-[var(--border-glass)]`

- [ ] **Step 7: Update card-skeleton.tsx**

Replace: `bg-slate-900 border border-slate-800` → `glass` class on both `StatsCardSkeleton` and `ChartCardSkeleton`.

- [ ] **Step 8: Update pagination.tsx**

Replace color references:
- Active link: `bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20` → `bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)]`
- Inactive link: `text-gray-400 hover:bg-slate-800 hover:text-gray-100` → `text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]`
- Focus: `focus-visible:ring-yellow-500` → `focus-visible:ring-[var(--accent-primary)]`

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/ui/
git commit -m "feat: cosmic glass UI primitives — button, input, select, card, skeleton, pagination"
```

---

## Task 3: Sidebar -- Glass Effect & Purple Accents

**Files:**
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Update Sidebar.tsx styling**

Key replacements in the JSX:
- **Desktop sidebar**: `bg-slate-900 border-r border-slate-800/60` → `bg-[var(--bg-glass-elevated)] backdrop-blur-xl border-r border-[var(--border-glass)]`
- **Logo icon**: `bg-amber-500` → `bg-gradient-to-br from-violet-600 to-purple-600`
- **Logo wallet icon text**: `text-slate-950` → `text-white`
- **Active nav item**: `bg-amber-500/10 text-amber-400` → `bg-purple-500/10 text-purple-300`
- **Active left bar**: `bg-amber-500` → `bg-[var(--accent-primary)]` + add `shadow-[0_0_8px_var(--accent-glow)]`
- **Active icon**: `text-amber-400` → `text-purple-400`
- **Inactive icon**: `text-gray-500 group-hover:text-gray-300` → `text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]`
- **Inactive text**: `text-gray-400 hover:text-gray-200 hover:bg-slate-800/60` → `text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5`
- **Collapse toggle**: `text-gray-500 hover:text-gray-300 hover:bg-slate-800/60` → `text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5`
- **Mobile header**: `bg-slate-900/95 backdrop-blur-md border-b border-slate-800/60` → `bg-[var(--bg-glass-elevated)]/95 backdrop-blur-md border-b border-[var(--border-glass)]`
- **Mobile overlay sidebar**: `bg-slate-900 border-r border-slate-800/60` → `bg-[var(--bg-glass-elevated)] border-r border-[var(--border-glass)]`
- **Mobile close button**: `hover:bg-slate-800` → `hover:bg-white/5`
- **Tooltip**: `bg-slate-800 text-gray-200 border border-slate-700/50` → `bg-[var(--bg-glass-elevated)] text-[var(--text-primary)] border border-[var(--border-glass)]`
- **Border dividers**: `border-slate-800/60` → `border-[var(--border-glass)]`

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat: cosmic glass sidebar — glass effect, purple accents"
```

---

## Task 4: Dashboard -- Magazine Layout Rebuild

**Files:**
- Rewrite: `frontend/src/app/dashboard/page.tsx`

This is the largest single task. The dashboard gets a complete magazine-style layout with glass cards.

- [ ] **Step 1: Rewrite dashboard page**

Key structural changes:
- **Page wrapper**: Remove `bg-slate-950`. Use `animate-fade-in` class.
- **Header**: Page title (`text-3xl font-bold tracking-tight`) + period selector (glass pill buttons)
- **Magazine grid** (desktop): CSS Grid with `grid-template-columns: 2fr 1fr` for hero row
  - Left: Hero chart in tall glass card (line/area chart with gradient fill)
  - Right: 2x2 grid of metric cards
- **Second row**: Two equal columns (category doughnut + recent transactions)
- **Third row**: Full-width AI insights panel (SpendingInsights component)

Replace all color references:
- Cards: `bg-slate-900 border border-slate-800` → `glass` class
- Card hover borders: `hover:border-green-500/30` etc → `glass-hover`
- Text: `text-gray-100` → `text-[var(--text-primary)]`, `text-gray-400` → `text-[var(--text-secondary)]`
- Metric colors: Keep semantic (green for income, pink for expense) but update to use accent tokens
- Chart colors: Purple primary, green income, pink expense

Chart.js config changes:
- Grid color: `rgba(255, 255, 255, 0.05)`
- Line chart: Add gradient fill (`ctx.createLinearGradient` from purple to transparent)
- Doughnut: Use cosmic palette (`#8b5cf6`, `#f472b6`, `#34d399`, `#60a5fa`, `#fbbf24`, `#a78bfa`)
- Tooltips: Custom external tooltip with glass styling

Responsive layout:
- **lg+**: Magazine grid (hero 2/3 + metrics 1/3 side by side)
- **md**: Full-width hero, 2-column metrics below
- **sm**: Single column -- metric cards FIRST (before hero chart), then hero chart, then remaining sections. Use `order-first` on the metrics grid at mobile breakpoint.

- [ ] **Step 2: Verify dashboard renders**

Check in browser: magazine layout visible, charts render, glass cards visible, purple accents throughout.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/page.tsx
git commit -m "feat: cosmic glass dashboard — magazine layout, glass cards, purple charts"
```

---

## Task 5: Transactions Page -- Glass Treatment

**Files:**
- Modify: `frontend/src/app/transactions/page.tsx`
- Modify: `frontend/src/components/TransactionTable.tsx`
- Rewrite: `frontend/src/components/TransactionCard.tsx`

- [ ] **Step 1: Update transactions page styling**

Replace all slate/yellow color references:
- Page wrapper: Remove `bg-slate-950`
- Title: `text-gray-100` → `text-[var(--text-primary)]`
- Subtitle: `text-gray-400` → `text-[var(--text-secondary)]`
- Action buttons: `bg-yellow-500 text-slate-950` → `bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)]`
- Filter section: Wrap in `glass` class, arrange inputs inline horizontally (flexbox with wrapping)
- Filter labels: `text-gray-400` → `text-[var(--text-secondary)]`
- Active filter badges: `bg-yellow-500/20 text-yellow-300` → `bg-purple-500/15 text-purple-300 border border-purple-500/30`
- Stats cards at bottom: Apply `glass` class

- [ ] **Step 2: Update TransactionTable.tsx styling**

Replace:
- Table container: `bg-slate-900 border border-slate-800 rounded-lg` → `glass rounded-2xl`
- Header: `bg-slate-950 border-b border-slate-800` → `bg-[var(--bg-glass-subtle)] border-b border-[var(--border-glass)]`
- Header text: `text-gray-400` → `text-[var(--text-muted)]`
- Rows: `hover:bg-slate-800/50` → `hover:bg-white/[0.03]`
- Dividers: `divide-slate-800` → `divide-[var(--border-glass)]`
- Category badge: `bg-slate-800 text-gray-300 border border-slate-700` → `bg-white/5 text-[var(--text-secondary)] border border-white/[0.08]`
- Income badge: `bg-green-500/10 text-green-400 border-green-500/30` → `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
- Expense badge: `bg-red-500/10 text-red-400 border-red-500/30` → `bg-pink-500/10 text-pink-400 border-pink-500/20`
- Amount: `text-green-400` stays, `text-red-400` → `text-pink-400`
- Sort active: `text-yellow-400` → `text-purple-400`
- Footer: `bg-slate-950 border-t border-slate-800` → `bg-[var(--bg-glass-subtle)] border-t border-[var(--border-glass)]`
- Footer stats: Update yellow → purple, red → pink
- Edit button: `text-yellow-400 hover:text-yellow-300` → `text-purple-400 hover:text-purple-300`
- Delete button: `text-red-400 hover:text-red-300` → `text-pink-400 hover:text-pink-300`
- Empty state: Update background/border colors

- [ ] **Step 3: Rewrite TransactionCard.tsx**

Replace with glass card mobile layout:

```tsx
"use client";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  origin: string;
  date: string | null;
}

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const isIncome = transaction.type === "income";
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(transaction.amount);

  return (
    <div className="glass glass-hover p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)] truncate mr-4">
          {transaction.description}
        </span>
        <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${isIncome ? "text-emerald-400" : "text-pink-400"}`}>
          {isIncome ? "+" : "-"}{formattedAmount}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {transaction.date && (
          <span className="text-[var(--text-muted)] tabular-nums">
            {new Date(transaction.date).toLocaleDateString("pt-BR")}
          </span>
        )}
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/[0.08] text-[var(--text-secondary)]">
          {transaction.category}
        </span>
        <span className="text-[var(--text-muted)]">
          {transaction.origin === "CREDIT_CARD" ? "Cartao" : "Dinheiro"}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/transactions/page.tsx frontend/src/components/TransactionTable.tsx frontend/src/components/TransactionCard.tsx
git commit -m "feat: cosmic glass transactions — glass table, inline filters, purple accents"
```

---

## Task 6: All Modals -- Glass Treatment

**Files:**
- Modify: `frontend/src/components/AddTransactionModal.tsx`
- Modify: `frontend/src/components/EditTransactionModal.tsx`
- Modify: `frontend/src/components/ImportCSVModal.tsx`
- Modify: `frontend/src/components/ManageCategoriesModal.tsx`
- Modify: `frontend/src/components/ReviewCategoriesModal.tsx`

All modals follow the same pattern. Apply these replacements to each:

- [ ] **Step 1: Update AddTransactionModal.tsx**

Replace in Dialog/modal styling:
- Overlay: `bg-black/50 backdrop-blur-sm` → `bg-black/60 backdrop-blur-sm` (keep similar)
- Content wrapper: `bg-slate-900 border border-slate-800 rounded-lg shadow-2xl` → `glass-elevated rounded-[20px] shadow-[0_24px_48px_rgba(0,0,0,0.5)]`
- Title: `text-2xl font-bold text-gray-100 mb-6 uppercase tracking-wide` → `text-xl font-semibold text-[var(--text-primary)] mb-6`
- Labels: `text-gray-400` → `text-[var(--text-secondary)]`
- Close button (Cross2Icon): Update hover from `hover:bg-slate-800` → `hover:bg-white/5`
- Submit button: `bg-yellow-500 text-slate-950` → use Button component default variant (now purple)
- Cancel button: Update to ghost variant
- Error messages: `text-red-400` → `text-pink-400`

- [ ] **Step 2: Update EditTransactionModal.tsx**

Same pattern as AddTransactionModal. Apply identical replacements.

- [ ] **Step 3: Update ImportCSVModal.tsx**

Same pattern. Additional:
- File drop zone styling: `border-dashed border-slate-700` → `border-dashed border-[var(--border-glass-hover)]`
- Upload icon: Update colors to purple

- [ ] **Step 4: Update ManageCategoriesModal.tsx**

Same modal pattern. Additional:
- Category list items: `bg-slate-800 border border-slate-700` → `bg-white/5 border border-[var(--border-glass)]`
- Edit/delete icons: Update from yellow/red to purple/pink

- [ ] **Step 5: Update ReviewCategoriesModal.tsx**

Same modal pattern. Read the file first to understand its current styling, then apply the same glass treatment.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/AddTransactionModal.tsx frontend/src/components/EditTransactionModal.tsx frontend/src/components/ImportCSVModal.tsx frontend/src/components/ManageCategoriesModal.tsx frontend/src/components/ReviewCategoriesModal.tsx
git commit -m "feat: cosmic glass modals — glass elevated panels, purple accents"
```

---

## Task 7: Recurring Page -- Full Restyle

**Files:**
- Rewrite: `frontend/src/app/recurring/page.tsx`

This page is the most inconsistent -- it uses `dark:` conditional classes and light-mode styles. Full replacement needed.

- [ ] **Step 1: Restyle recurring page**

Replace ALL color/styling classes:
- Page wrapper: `bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900` → remove (body gradient handles it)
- All cards: `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700` → `glass glass-hover`
- All text: `text-gray-900 dark:text-gray-100` → `text-[var(--text-primary)]`
- Secondary text: `text-gray-500 dark:text-gray-400` → `text-[var(--text-secondary)]`
- Buttons: `bg-blue-600 hover:bg-blue-700` → `bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)]`
- Income amounts: `text-green-600 dark:text-green-400` → `text-emerald-400`
- Expense amounts: `text-red-600 dark:text-red-400` → `text-pink-400`
- Form inputs in modal: Apply glass input styling
- Modal: Apply glass-elevated treatment
- Toggle buttons: Update to purple accent
- Empty state: Glass card with muted text

Strip ALL `dark:` prefixed classes.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/recurring/page.tsx
git commit -m "feat: cosmic glass recurring page — full restyle, strip dual-mode classes"
```

---

## Task 8: Analytics Page -- Glass Treatment

**Files:**
- Modify: `frontend/src/app/analytics/page.tsx`

- [ ] **Step 1: Update analytics page styling**

Replace:
- Page wrapper: Remove `bg-slate-950`
- Period selector buttons:
  - Active: `bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20` → `bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)]`
  - Inactive: `bg-slate-900 text-gray-400 border border-slate-800 hover:bg-slate-800` → `bg-[var(--bg-glass)] text-[var(--text-secondary)] border border-[var(--border-glass)] hover:bg-[var(--bg-glass-hover)]`
- Summary cards: `bg-slate-900 border border-slate-800` → `glass`
- Chart containers: `bg-slate-900 border border-slate-800` → `glass`
- Category table: Update header/row/divider colors (same as TransactionTable pattern)
- Progress bars: `from-yellow-500 to-yellow-400` → `from-violet-500 to-purple-400`
- Top expenses: Update index badges to purple, text colors to token variables
- Chart colors: Purple primary palette
- Text: All `text-gray-100/400/500` → token variables

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/analytics/page.tsx
git commit -m "feat: cosmic glass analytics — glass charts, purple palette"
```

---

## Task 9: Budget Page -- Glass Treatment

**Files:**
- Modify: `frontend/src/app/budget/page.tsx`

- [ ] **Step 1: Update budget page styling**

Replace:
- Page wrapper: Remove `bg-slate-950`
- All cards: `bg-slate-900 border border-slate-800` → `glass`
- Budget progress bars:
  - Good (<80%): `from-emerald-500 to-emerald-400`
  - Warning (80-100%): `from-amber-500 to-amber-400`
  - Over (>100%): `from-pink-500 to-pink-400`
  - Track: `bg-slate-800` → `bg-white/5`
- Goal progress bars: `from-yellow-500 to-yellow-400` → `from-violet-500 to-purple-400`
- Action buttons: `bg-yellow-500 text-slate-950` → `bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)]`
- Warning boxes: Update border/bg colors
- Modal forms: Glass-elevated treatment
- Text: All slate/gray → token variables

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/budget/page.tsx
git commit -m "feat: cosmic glass budget — glass cards, gradient progress bars"
```

---

## Task 10: Supporting Components -- DevTools & SpendingInsights

**Files:**
- Modify: `frontend/src/components/SpendingInsights.tsx`
- Modify: `frontend/src/components/DevTools.tsx`

- [ ] **Step 1: Update SpendingInsights.tsx**

Replace:
- Card: `bg-slate-900 border border-slate-800 rounded-xl` → `glass rounded-2xl`
- Icon backgrounds: `bg-purple-500/20` → `bg-[var(--accent-primary)]/20` (keep purple)
- Generate button: `bg-purple-600 hover:bg-purple-700` → `bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] shadow-[0_0_20px_var(--accent-glow)]`
- Text colors: `text-gray-300/400` → `text-[var(--text-secondary)]`/`text-[var(--text-muted)]`
- Error state: `border-red-500/30` → `border-pink-500/30`
- Highlight icons: `text-amber-400` → `text-[var(--accent-warning)]`
- Recommendation icons: `text-green-400` → `text-emerald-400`

- [ ] **Step 2: Update DevTools.tsx**

Replace all slate/yellow references:
- Panel: Apply `glass` class
- Buttons: Update to purple accent or ghost variants
- Destructive button: Pink instead of red
- Text: Token variables

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/SpendingInsights.tsx frontend/src/components/DevTools.tsx
git commit -m "feat: cosmic glass supporting components — insights, devtools"
```

---

## Task 11: Landing Page Redirect

**Files:**
- Rewrite: `frontend/src/app/page.tsx`

- [ ] **Step 1: Replace landing page with redirect**

Replace entire file content:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

Remove the `"use client"` directive -- `redirect()` works in server components.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: replace landing page with redirect to dashboard"
```

---

## Task 12: Cleanup -- Delete Navbar, Remove Stale References

**Files:**
- Delete: `frontend/src/components/Navbar.tsx`
- Verify: No remaining imports of Navbar anywhere

- [ ] **Step 1: Delete Navbar.tsx**

```bash
rm frontend/src/components/Navbar.tsx
```

- [ ] **Step 2: Search for stale Navbar imports**

```bash
grep -r "Navbar" frontend/src/ --include="*.tsx" --include="*.ts"
```

If any found, remove the import lines. The layout.tsx was already updated to use AppShell instead of Navbar.

- [ ] **Step 3: Search for remaining old token references**

```bash
grep -r "rgb(var(--" frontend/src/ --include="*.tsx" --include="*.ts" --include="*.css"
grep -r "bg-slate-9\|border-slate-8\|text-gray-1\|text-gray-4\|yellow-500\|yellow-400" frontend/src/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v __tests__
```

Fix any remaining old references found. This is a sweep to catch anything missed in previous tasks.

- [ ] **Step 4: Commit**

```bash
git add -A frontend/src/
git commit -m "chore: cleanup — delete Navbar, remove stale color references"
```

---

## Task 13: Typography & Spacing Normalization

Apply the spec's typography scale and spacing tokens consistently across all pages.

**Typography scale (apply to all pages):**
- Page titles: `text-3xl font-bold tracking-tight`
- Section headings: `text-xl font-semibold`
- Card titles: `text-lg font-semibold`
- Body text: `text-sm leading-relaxed`
- Labels: `text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]`
- Hero metrics: `text-5xl font-bold tabular-nums`
- Card metrics: `text-2xl font-bold tabular-nums`

**Spacing (apply to all pages):**
- Page wrapper padding: `px-6 lg:px-8 py-8` (replace current `px-4 sm:px-6 lg:px-8 py-8`)
- Section gaps: `gap-6`
- Card padding: `p-6` (standard) or `p-4` (compact)

- [ ] **Step 1: Sweep all pages for typography and spacing consistency**

Check each page file and ensure headings, labels, body text, and metrics match the scale above. Fix any that don't match.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/
git commit -m "feat: normalize typography scale and spacing across all pages"
```

---

## Task 14: Visual QA & Polish

No specific files -- this is a review pass across the entire app.

- [ ] **Step 1: Walk through every page in the browser**

Check each route:
- `/` → should redirect to `/dashboard`
- `/dashboard` → magazine layout, glass cards, purple charts
- `/transactions` → glass table, inline filters, pagination
- `/recurring` → glass cards, no light-mode styling
- `/analytics` → glass charts, purple pills
- `/budget` → glass cards, gradient progress bars

- [ ] **Step 2: Check mobile responsiveness**

Resize browser to mobile width. Verify:
- Sidebar becomes hamburger menu
- Dashboard stacks to single column
- Tables remain scrollable
- Modals fit screen

- [ ] **Step 3: Check interactions**

- Sidebar collapse/expand
- All modal open/close
- Table sorting
- Filter application
- CSV import flow
- DevTools seed/clear

- [ ] **Step 4: Fix any visual issues found**

Address anything broken during the review pass.

- [ ] **Step 5: Final commit**

```bash
git add -A frontend/src/
git commit -m "feat: cosmic glass redesign — visual QA polish"
```
