---
status: done
epic: 6
story: 5
story_key: "6-5-trend-summary-widget-and-full-sidebar-composition"
created: 2026-06-29
baseline_commit: 7c0f7af2a307d6bc05b0924e5efa9e656627e026
---

# Story 6.5: TrendSummary Widget & Full Sidebar Composition

**Status:** done

## Story

As a retail investor,
I want to see the top active market themes in a compact sidebar widget and a fully composed home page sidebar,
So that I can jump to a theme without navigating to the Trends page, and so the complete right-column research context is available in a single scroll.

---

## Acceptance Criteria

**AC1 — TrendSummary renders top 3 themes**
- Fetches from `GET /api/trends` via `api.getTrends()` — the call site (page.tsx thin wrapper) passes `themes: MarketThemeSummary[] | null` as a prop
- Sorts by `last_article_at` descending, takes top 3
- Each row: theme `name` (13px, 500, espresso `#4A342A`) + `<SentimentBadge>` right-aligned
- Each row is a `<Link href="/trends/[theme_id]">` with espresso double-ring focus style
- "View all trends →" footer link to `/trends`
- `api.getTrends()` call uses `next: { revalidate: 60 }` — already set globally in `fetchAPI` in `lib/api.ts`; no change needed

**AC2 — Empty state**
- `themes` is `[]` → renders the card with header + "No active themes today." message (never a silent empty widget)

**AC3 — Skeleton loading state**
- Named export: `export function TrendSummarySkeleton()`
- 3 skeleton rows: each a `flex justify-between` with `h-3 bg-linen rounded animate-pulse` on each side
- `role="status"` + `aria-label="Loading market themes"` on wrapper

**AC4 — Error state**
- `themes` is `null` → renders card with header + "Trends unavailable · Last attempted HH:MM BKK"
- Timestamp from `new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })`

**AC5 — Full home page sidebar composition**
- Right sidebar column (`space-y-4 order-first lg:order-last`) has 4 individually-wrapped Suspense boundaries, top to bottom:
  1. `<Suspense fallback={<DailyBriefCardSkeleton />}><DailyBriefServer /></Suspense>`
  2. `<Suspense fallback={<MarketOverviewWidgetSkeleton />}><MarketOverviewSection /></Suspense>`
  3. `<Suspense fallback={<SectorHeatmapSkeleton />}><SectorHeatmapSection /></Suspense>`
  4. `<Suspense fallback={<TrendSummarySkeleton />}><TrendSummarySection /></Suspense>`
- `MarketSidebarServer` function is removed
- `MarketOverviewSection`, `SectorHeatmapSection`, `TrendSummarySection` are thin async functions defined locally in `page.tsx`
- Each widget handles its own error state via null prop — one failure never collapses the others

**AC6 — n8n scheduling + LCP gate**
- `POST /webhooks/market-snapshot` and `POST /webhooks/sector-performance` configured in n8n to trigger every 15 minutes during 09:00–18:00 Bangkok time; paused outside market hours
- Both webhook URLs stored in n8n environment variables (never hardcoded)
- Verification checkpoint: all 4 sidebar widgets are Server Components with ISR — no client-side data fetching on initial load

---

## Tasks / Subtasks

- [x] Task 1: Rewrite `TrendSummary.tsx`
  - [x] 1.1 Fix `import clsx from "clsx"` → `import { clsx } from 'clsx'` (project rule)
  - [x] 1.2 Import `Link` from `next/link` and `SentimentBadge` from `@/components/SentimentBadge`
  - [x] 1.3 Change prop from `trends: TrendItem[]` to `themes: MarketThemeSummary[] | null`
  - [x] 1.4 Add null guard → error state (AC4)
  - [x] 1.5 Add empty array guard → "No active themes today." (AC2)
  - [x] 1.6 Sort `themes` by `last_article_at` descending, slice top 3 (AC1)
  - [x] 1.7 Render each theme row as `<Link href="/trends/[theme_id]">` with espresso focus ring; name left, `<SentimentBadge>` right (AC1)
  - [x] 1.8 Add "View all trends →" footer link to `/trends` (AC1)
  - [x] 1.9 Extract shared card constants `CARD_SHELL`, `CARD_BORDER`, `HEADER_BORDER` and internal `CardHeader()` (consistency with 6.3/6.4)
  - [x] 1.10 Add named export `TrendSummarySkeleton` with `role="status"` + `aria-label` (AC3)

- [x] Task 2: Update call sites in `page.tsx`
  - [x] 2.1 Remove `MarketSidebarServer` function entirely
  - [x] 2.2 Add `MarketOverviewSection` thin async function: fetch `snapshot`, render `<MarketOverviewWidget snapshot={snapshot} />`
  - [x] 2.3 Add `SectorHeatmapSection` thin async function: fetch `sectors`, render `<SectorHeatmap sectors={sectors} />`
  - [x] 2.4 Add `TrendSummarySection` thin async function: fetch `themes`, render `<TrendSummary themes={themes} />`
  - [x] 2.5 Replace old Suspense block with 4 individual Suspense boundaries in order (AC5)
  - [x] 2.6 Import `SectorHeatmapSkeleton` from `SectorHeatmap` and `TrendSummarySkeleton` from `TrendSummary` — wire these as fallbacks (resolves deferred W1 from 6.4)
  - [x] 2.7 Remove unused `MarketOverview`, `overview` imports/variables from `page.tsx` (overview was only used for `overview.trends`)

- [x] Task 3: Update `TrendSummary.test.tsx`
  - [x] 3.1 Replace `TrendItem[]` fixture with `MarketThemeSummary[]` fixture (3 themes with distinct `last_article_at` timestamps)
  - [x] 3.2 Import `MarketThemeSummary` from `@/types` and `TrendSummarySkeleton` from `./TrendSummary`
  - [x] 3.3 Adapt existing test "renders each trend title" → "renders each theme name" (uses `theme.name`)
  - [x] 3.4 Replace 3 old sentiment label tests (▲ BULLISH etc.) with SentimentBadge tests: `aria-label="Market sentiment: bullish"` present
  - [x] 3.5 Adapt "empty array" test — now shows "No active themes today." text
  - [x] 3.6 Add: null themes shows "Trends unavailable" (AC4)
  - [x] 3.7 Add: each row is a `<Link>` (`<a>`) with `href="/trends/[theme_id]"` (AC1)
  - [x] 3.8 Add: "View all trends →" link to `/trends` is rendered (AC1)
  - [x] 3.9 Add: more than 3 themes → only 3 rendered, most recent first (AC1)
  - [x] 3.10 Add: `TrendSummarySkeleton` has `role="status"` and `aria-label="Loading market themes"` (AC3)

- [x] Task 4: Validate
  - [x] 4.1 `cd frontend && npx tsc --noEmit` — zero errors
  - [x] 4.2 `cd frontend && npx vitest run` — all tests pass (no regressions)

### Review Findings

- [x] [Review][Patch] `block` + `flex` conflict on theme Link className — removed `"block"` from clsx second arg [TrendSummary.tsx: Link className]
- [x] [Review][Patch] `theme_id` used raw in href — added `encodeURIComponent(theme.theme_id)` per codebase pattern [TrendSummary.tsx: href template literal]
- [x] [Review][Patch] Skeleton badge placeholder uses `h-5` but AC3 requires `h-3` on both sides — fixed `h-5` → `h-3` [TrendSummary.tsx: TrendSummarySkeleton right-side div]
- [x] [Review][Defer] ISR stale error-state timestamp — pre-existing pattern from 6.3/6.4, deferred
- [x] [Review][Defer] `SentimentBadge` crash on unknown sentiment — pre-existing in SentimentBadge component, deferred
- [x] [Review][Defer] Sort order test asserts count only, not sort direction — test quality improvement, deferred
- [x] [Review][Defer] `--tw-divide-color` CSS custom property — pre-existing pattern across codebase, deferred
- [x] [Review][Defer] `last_article_at` empty string → NaN sort promotion — backend Pydantic enforces AwareDatetime, deferred

---

## Dev Notes

### ⚠️ Current TrendSummary State — Wrong Type and Missing Features

File: `frontend/src/components/TrendSummary.tsx`

**What is broken today:**
- `import clsx from "clsx"` — must be named import per project-context rule
- Prop is `trends: TrendItem[]` — wrong type; should use `MarketThemeSummary` from Epic 5 API
- Renders `trend.title`, `trend.description`, inline sentiment badge — must switch to `theme.name` + `<SentimentBadge>`
- No Link navigation (AC1 not implemented)
- No null guard / error state (AC4 not implemented)
- No empty state message (AC2 shows nothing, which is forbidden — "never a silent empty widget")
- No `TrendSummarySkeleton` export (AC3 not implemented)
- Existing sentiment badge renders `▲ BULLISH` inline — replace with `<SentimentBadge>` component
- Header says "Weekly Themes / แนวโน้มสัปดาห์" — keep as-is

**Existing test file:** `frontend/src/components/TrendSummary.test.tsx` — 5 tests, ALL must be rewritten (prop type change + behavior change). None survive as-is because `TrendItem` is gone.

---

### 📋 TrendSummary Prop Pattern (Null Prop — mirrors 6.3 and 6.4)

```
null  → API threw        → error state card
[]    → API returned []  → "No active themes today." card
[...] → normal render    → top 3 themes sorted by last_article_at desc
```

```tsx
interface Props {
  themes: MarketThemeSummary[] | null;
}
```

---

### 📋 TrendSummary Complete Implementation Spec

```tsx
import Link from "next/link";
import { clsx } from "clsx";
import { MarketThemeSummary } from "@/types";
import SentimentBadge from "@/components/SentimentBadge";

interface Props {
  themes: MarketThemeSummary[] | null;
}

const CARD_SHELL = "bg-white rounded-xl border overflow-hidden";
const CARD_BORDER = { borderColor: "rgba(74,52,42,0.1)" };
const HEADER_BORDER = { borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" };

function CardHeader() {
  return (
    <div
      className="px-4 py-3 border-b flex items-center justify-between"
      style={HEADER_BORDER}
    >
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7D5A44" }}>
        Weekly Themes
      </span>
      <span className="text-xs" style={{ color: "#B2967D" }}>แนวโน้มสัปดาห์</span>
    </div>
  );
}

export function TrendSummarySkeleton() {
  return (
    <div className={CARD_SHELL} style={CARD_BORDER} role="status" aria-label="Loading market themes">
      <div className="px-4 py-3 border-b animate-pulse" style={HEADER_BORDER}>
        <div className="h-3 bg-linen rounded w-28" />
      </div>
      <div className="divide-y" style={{ "--tw-divide-color": "rgba(74,52,42,0.06)" } as React.CSSProperties}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between gap-3 animate-pulse">
            <div className="h-3 bg-linen rounded flex-1" />
            <div className="h-5 bg-linen rounded w-20 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrendSummary({ themes }: Props) {
  if (themes === null) {
    const attemptedAt = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
    return (
      <div className={CARD_SHELL} style={CARD_BORDER}>
        <CardHeader />
        <div className="px-4 py-4 text-xs" style={{ color: "#6b6560" }}>
          Trends unavailable · Last attempted {attemptedAt} BKK
        </div>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className={CARD_SHELL} style={CARD_BORDER}>
        <CardHeader />
        <div className="px-4 py-4 text-xs" style={{ color: "#6b6560" }}>
          No active themes today.
        </div>
      </div>
    );
  }

  const topThemes = themes
    .slice()
    .sort((a, b) => new Date(b.last_article_at).getTime() - new Date(a.last_article_at).getTime())
    .slice(0, 3);

  return (
    <div className={CARD_SHELL} style={CARD_BORDER}>
      <CardHeader />
      <div className="divide-y" style={{ "--tw-divide-color": "rgba(74,52,42,0.06)" } as React.CSSProperties}>
        {topThemes.map((theme) => (
          <Link
            key={theme.theme_id}
            href={`/trends/${theme.theme_id}`}
            className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors block focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]"
          >
            <span className="text-[13px] font-medium min-w-0 truncate" style={{ color: "#4A342A" }}>
              {theme.name}
            </span>
            <SentimentBadge sentiment={theme.overall_sentiment} />
          </Link>
        ))}
      </div>
      <div className="px-4 py-3 border-t flex justify-end" style={{ borderColor: "rgba(74,52,42,0.06)" }}>
        <Link
          href="/trends"
          className="text-xs font-bold tracking-widest uppercase hover:underline focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]"
          style={{ color: "#B2967D" }}
        >
          View all trends →
        </Link>
      </div>
    </div>
  );
}
```

**Note on empty array vs null:** Unlike SectorHeatmap (which returns `null` on empty — no ghost card), TrendSummary MUST render a card even when empty (AC2 says "never a silent empty widget"). So empty returns the card with "No active themes today." message.

---

### 📋 page.tsx Sidebar Refactor

**Current structure (to be replaced):**
```tsx
// ONE shared Suspense covering all 3 widgets:
async function MarketSidebarServer() {
  let overview: MarketOverview | null = null;
  let snapshot: MarketSnapshot | null = null;
  let sectors: SectorPerformance[] | null = null;
  // fetches ...
  return (
    <div className="space-y-4">
      <MarketOverviewWidget snapshot={snapshot} />
      <SectorHeatmap sectors={sectors} />
      {overview && <TrendSummary trends={overview.trends} />}
    </div>
  );
}

// In sidebar:
<Suspense fallback={<MarketOverviewWidgetSkeleton />}>
  <MarketSidebarServer />
</Suspense>
```

**Target structure (4 independent Suspense boundaries):**
```tsx
// THREE thin async functions replacing MarketSidebarServer:

async function MarketOverviewSection() {
  let snapshot: MarketSnapshot | null = null;
  try { snapshot = await api.getMarketSnapshot(); } catch {}
  return <MarketOverviewWidget snapshot={snapshot} />;
}

async function SectorHeatmapSection() {
  let sectors: SectorPerformance[] | null = null;
  try { sectors = await api.getMarketSectors(); } catch {}
  return <SectorHeatmap sectors={sectors} />;
}

async function TrendSummarySection() {
  let themes: MarketThemeSummary[] | null = null;
  try { themes = await api.getTrends(); } catch {}
  return <TrendSummary themes={themes} />;
}

// In sidebar (outer div stays `space-y-4 order-first lg:order-last`):
<Suspense fallback={<DailyBriefCardSkeleton />}>
  <DailyBriefServer />
</Suspense>
<Suspense fallback={<MarketOverviewWidgetSkeleton />}>
  <MarketOverviewSection />
</Suspense>
<Suspense fallback={<SectorHeatmapSkeleton />}>
  <SectorHeatmapSection />
</Suspense>
<Suspense fallback={<TrendSummarySkeleton />}>
  <TrendSummarySection />
</Suspense>
```

**Imports to add to page.tsx:**
```tsx
import { SectorHeatmapSkeleton } from "@/components/SectorHeatmap";
import { TrendSummarySkeleton } from "@/components/TrendSummary";
```

**Imports to remove from page.tsx:**
```tsx
// Remove: MarketOverview type (was only needed for overview.trends)
// Keep: MarketSnapshot, SectorPerformance, MarketThemeSummary (needed by new sections)
```

**Remove from page.tsx:**
- The entire `MarketSidebarServer` async function
- The `MarketOverview` type import (if only used in `MarketSidebarServer`)

---

### 📋 TrendSummary.test.tsx — Complete Rewrite

All 5 existing tests use `TrendItem[]` and must be replaced. New fixture uses `MarketThemeSummary[]`:

```tsx
import { render, screen } from "@testing-library/react";
import TrendSummary, { TrendSummarySkeleton } from "./TrendSummary";
import { MarketThemeSummary } from "@/types";

const T = (iso: string) => iso;  // helper for clarity

const VALID_THEMES: MarketThemeSummary[] = [
  {
    theme_id: "theme-001",
    name: "Fed Pivot ใกล้เข้ามา",
    description: "...",
    overall_sentiment: "bullish",
    article_count: 5,
    last_article_at: "2026-06-29T10:00:00Z",  // most recent
    created_at: "2026-06-29T08:00:00Z",
  },
  {
    theme_id: "theme-002",
    name: "น้ำมันพุ่ง — กดดัน margin",
    description: "...",
    overall_sentiment: "bearish",
    article_count: 3,
    last_article_at: "2026-06-29T09:00:00Z",
    created_at: "2026-06-29T07:00:00Z",
  },
  {
    theme_id: "theme-003",
    name: "จีนฟื้นตัว",
    description: "...",
    overall_sentiment: "neutral",
    article_count: 2,
    last_article_at: "2026-06-29T08:00:00Z",
    created_at: "2026-06-29T06:00:00Z",
  },
];

// 4th theme — older than the top 3, used to test slice(0,3)
const FOURTH_THEME: MarketThemeSummary = {
  theme_id: "theme-004",
  name: "หุ้นเทคไทยอ่อนตัว",
  description: "...",
  overall_sentiment: "bearish",
  article_count: 1,
  last_article_at: "2026-06-29T07:00:00Z",  // oldest
  created_at: "2026-06-29T05:00:00Z",
};

describe("TrendSummary", () => {
  it("renders each theme name", () => { ... });
  it("each theme row is a link to /trends/[theme_id]", () => { ... });
  it("SentimentBadge present for each theme", () => { ... });
  it("View all trends link navigates to /trends", () => { ... });
  it("more than 3 themes — only top 3 by last_article_at rendered", () => {
    render(<TrendSummary themes={[...VALID_THEMES, FOURTH_THEME]} />);
    expect(screen.queryByText("หุ้นเทคไทยอ่อนตัว")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link").filter(l => l.getAttribute("href")?.startsWith("/trends/"))).toHaveLength(3);
  });
  it("null themes shows Trends unavailable", () => { ... });
  it("empty themes shows No active themes today.", () => { ... });
});

describe("TrendSummarySkeleton", () => {
  it("renders without throwing", () => { ... });
  it("has role=status and aria-label for screen readers", () => { ... });
});
```

**Note on "View all trends →" link test:** The footer link goes to `/trends` (not `/trends/[id]`). Filter out that link when asserting the 3 theme-detail links:
```tsx
const themeLinks = screen.getAllByRole("link").filter(
  l => l.getAttribute("href")?.startsWith("/trends/")
);
expect(themeLinks).toHaveLength(3);
```

**Note on SentimentBadge tests:** SentimentBadge renders `aria-label="Market sentiment: bullish"`. Use:
```tsx
expect(screen.getByRole("link", { name: /Fed Pivot/ })).toBeInTheDocument();
// OR check aria-label on the badge span:
expect(screen.getByLabelText("Market sentiment: bullish")).toBeInTheDocument();
```

---

### 🔑 Patterns from Previous Stories (MUST follow)

**Named clsx import (project rule — violated in current TrendSummary):**
```tsx
import { clsx } from "clsx";  // ✅ named import
import clsx from "clsx";       // ❌ default import — project rule violation
```

**Focus ring (espresso double-ring — consistent with 6.3, 6.4):**
```tsx
"focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]"
```

**Card constants (same values as MarketOverviewWidget.tsx and SectorHeatmap.tsx):**
```tsx
const CARD_SHELL = "bg-white rounded-xl border overflow-hidden";
const CARD_BORDER = { borderColor: "rgba(74,52,42,0.1)" };
const HEADER_BORDER = { borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" };
```

**Null prop pattern (established in 6.3 and 6.4):**
```
null  → API failure   → error state (timestamped message)
[]    → empty list    → render card with message (NOT return null — see AC2 note)
[...] → data present  → normal render
```

**Skeleton a11y (established in 6.3 and 6.4):**
```tsx
role="status" aria-label="Loading market themes"
```

**Sort pattern for `last_article_at` (ISO 8601 strings):**
```tsx
const topThemes = themes
  .slice()  // avoid mutating original
  .sort((a, b) => new Date(b.last_article_at).getTime() - new Date(a.last_article_at).getTime())
  .slice(0, 3);
```

---

### ⚠️ Key Difference from SectorHeatmap Empty Handling

SectorHeatmap returns `null` on empty (no ghost card — sectors grid with no cells is meaningless).
TrendSummary MUST NOT return `null` on empty — it must show "No active themes today." per AC2.
Both variants (empty and null) still render the card shell + header.

---

### 📋 Type Reference

`MarketThemeSummary` (from `frontend/src/types/index.ts`):
```ts
export interface MarketThemeSummary {
  theme_id: string;           // use for Link href: /trends/${theme_id}
  name: string;               // display name in row
  description: string;        // NOT displayed in sidebar widget
  overall_sentiment: "bullish" | "bearish" | "neutral";  // passed to SentimentBadge
  article_count: number;      // NOT displayed in sidebar widget
  last_article_at: string;    // ISO 8601 — use for sorting
  created_at: string;
}
```

**Do NOT display `description`, `article_count`, or `created_at` in the sidebar widget** — the compact row shows only `name` + sentiment badge. Full details belong on the Trends page.

---

### 📋 n8n Configuration Note (AC6)

AC6 is a configuration checkpoint, not a code task. When both webhooks are operational:
- Go to n8n → Schedules: set `POST /webhooks/market-snapshot` and `POST /webhooks/sector-performance` to trigger every 15 min
- Add time filter: only trigger if Bangkok time (UTC+7) is between 09:00–18:00
- Store webhook URLs as n8n credential variables: `ASK_MARKET_SNAPSHOT_WEBHOOK_URL` and `ASK_SECTOR_PERFORMANCE_WEBHOOK_URL`

This is already partially designed in Epic 6.1 — verify the endpoint URLs are correct, mark AC6 ✅ after confirming.

---

### 📋 LCP Gate (AC6)

After implementation, verify all 4 sidebar widgets are Server Components:
- `DailyBriefServer` ✅ (async function, no `"use client"`)
- `MarketOverviewSection` ✅ (new thin async function in page.tsx)
- `SectorHeatmapSection` ✅ (new thin async function in page.tsx)
- `TrendSummary` ✅ (receives props from `TrendSummarySection`, itself is sync Server Component)

No client-side data fetching on initial load = ISR constraint satisfied.

---

### 📋 Deferred Items Being Resolved in This Story

**W1 from Story 6.4 code review:** `SectorHeatmapSkeleton` not wired to Suspense.
→ Task 2.6 resolves this by importing `SectorHeatmapSkeleton` and using it as the fallback for `<SectorHeatmapSection>`.

**W1 from Story 6.3 code review:** `MarketOverviewWidgetSkeleton` only covers the entire sidebar (3 widgets).
→ Task 2 refactor gives each widget its own Suspense, so skeleton coverage is now per-widget.

---

## Dev Agent Record

### Completion Notes

Story 6.5 implemented in full. All tasks complete.

**Task 1 — TrendSummary.tsx rewrite:**
- Replaced `TrendItem[]` prop with `MarketThemeSummary[] | null` (null prop pattern matching 6.3/6.4)
- Fixed named clsx import (`import { clsx } from 'clsx'`)
- Added null → error state with Bangkok timestamp
- Added empty array → "No active themes today." card (card visible, not silent)
- Sort by `last_article_at` descending, slice top 3
- Each row is a `<Link href="/trends/[theme_id]">` with espresso double-ring focus
- Right-aligned `<SentimentBadge>` using existing component
- "View all trends →" footer link to `/trends`
- Card constants (`CARD_SHELL`, `CARD_BORDER`, `HEADER_BORDER`) consistent with 6.3/6.4
- Named export `TrendSummarySkeleton` with 3 skeleton rows, `role="status"`, `aria-label`

**Task 2 — page.tsx sidebar refactor:**
- Removed `MarketSidebarServer` (single Suspense covering 3 widgets)
- Added 3 thin async functions: `MarketOverviewSection`, `SectorHeatmapSection`, `TrendSummarySection`
- 4 independent Suspense boundaries: DailyBriefCard → MarketOverview → SectorHeatmap → TrendSummary
- Wired `SectorHeatmapSkeleton` as fallback (resolves deferred W1 from 6.4)
- Removed `MarketOverview` type import (no longer needed)

**Task 3 — TrendSummary.test.tsx complete rewrite:**
- 5 old TrendItem-based tests replaced with 9 new MarketThemeSummary-based tests
- Tests cover: names, Link hrefs, SentimentBadge aria-labels, "View all trends", top-3 slice, null error state, empty state, skeleton a11y

**Task 4 — Validation:**
- `npx tsc --noEmit`: zero errors
- `npx vitest run`: 196/196 tests pass across 20 test files, zero regressions

**AC6 note:** n8n scheduling is a configuration checkpoint (not code). LCP gate satisfied — all 4 sidebar widgets are Server Components with ISR via `fetchAPI`'s `next: { revalidate: 60 }`.

### Debug Log
_No issues encountered_

---

## File List

### Modified Files
- `frontend/src/components/TrendSummary.tsx` — full rewrite: `MarketThemeSummary[] | null` prop, Link navigation, SentimentBadge, sort+slice top 3, empty/error states, `TrendSummarySkeleton` named export, card constants
- `frontend/src/components/TrendSummary.test.tsx` — complete rewrite: `MarketThemeSummary` fixture, all 5 old tests replaced, 9 new tests
- `frontend/src/app/page.tsx` — remove `MarketSidebarServer`, add `MarketOverviewSection` + `SectorHeatmapSection` + `TrendSummarySection` thin functions, 4 individual Suspense boundaries in sidebar

### New Files
_(none)_

---

## Change Log

| Date | Event |
|------|-------|
| 2026-06-29 | Story created — final story of Epic 6, resolves deferred W1 from 6.3 and 6.4 |
| 2026-06-29 | Implementation complete — TrendSummary rewrite, page.tsx sidebar refactor, test file rewrite; 196/196 tests pass, zero tsc errors; status → review |
