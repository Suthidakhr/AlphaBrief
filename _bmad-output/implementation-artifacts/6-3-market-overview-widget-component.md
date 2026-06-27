---
status: ready-for-dev
epic: 6
story: 3
story_key: "6-3-market-overview-widget-component"
created: 2026-06-27
---

# Story 6.3: MarketOverviewWidget Component

**Status:** ready-for-dev

## Story

As a retail investor,
I want to see the SET index and major market benchmarks in the sidebar,
So that I understand the macro direction before reading individual news articles.

---

## Acceptance Criteria

### AC1 — Index row layout and format

**Given** `MarketOverviewWidget` receives a `MarketSnapshot`
**When** it renders
**Then** each `IndexItem` renders as a row: index name (12px, weight 600, cocoa) + current `value` (monospace, espresso) + `▲`/`▼`/`–` arrow + percentage change in `positive` / `negative` / `neutral-text` color
**And** the `▲`/`▼`/`–` arrow is the required non-color direction indicator — never percentage alone (UX-DR11)
**And** `value` and `change_pct` have `isFinite()` applied before `toFixed()` — `NaN` never reaches the DOM; show `"—"` on guard failure
**And** non-negative `change_pct` displays with a `+` prefix; negative values use the natural `−` sign from `toFixed(2)`

### AC2 — Market closed state

**Given** `market_open` is `false` in the snapshot
**When** the widget renders
**Then** an amber note appears below the header: `"Market closed · As of [snapshot_at in Bangkok time]"` using the `staleness` color token (`text-staleness` = `#d97706`)

### AC3 — Skeleton / loading state

**Given** the widget is inside a `<Suspense>` boundary
**When** data is loading
**Then** `MarketOverviewWidgetSkeleton` renders: `animate-pulse` linen blocks at approximate index-row dimensions (header strip + 3 row-shaped blocks) — no spinner, no blank area

### AC4 — Error / unavailable state

**Given** `GET /api/market/snapshot` returns an error or `HTTP 404`
**When** the widget renders
**Then** it shows: `"Market data unavailable · Last attempted [time BKK]"` — never silent or blank (UX-DR11)

### AC5 — Focus ring (keyboard navigation)

**Given** any interactive element inside the widget
**When** focused via keyboard
**Then** the espresso double-ring focus indicator is visible: `focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`

---

## Tasks / Subtasks

- [ ] Task 1: Rewrite `MarketOverviewWidget` component
  - [ ] 1.1 Change prop from `{ indices: MarketIndex[] }` to `{ snapshot: MarketSnapshot | null }`
  - [ ] 1.2 Add null guard: when `snapshot === null`, render error state (AC4)
  - [ ] 1.3 Render index rows from `snapshot.indices` using `IndexItem` shape — `name`, `value`, `change_pct`, `direction` (AC1)
  - [ ] 1.4 Apply `isFinite()` guard on `value` before `.toLocaleString()` and on `change_pct` before `.toFixed(2)`; render `"—"` on fail (AC1)
  - [ ] 1.5 Apply `+` prefix for non-negative `change_pct`; use `direction` field for color token and arrow glyph (AC1)
  - [ ] 1.6 Add market closed amber note when `!snapshot.market_open` using Bangkok-localized `snapshot_at` (AC2)

- [ ] Task 2: Export `MarketOverviewWidgetSkeleton`
  - [ ] 2.1 Add named export `MarketOverviewWidgetSkeleton` to `MarketOverviewWidget.tsx` — header strip + 3 animate-pulse linen row blocks (AC3)

- [ ] Task 3: Update call sites
  - [ ] 3.1 `frontend/src/app/page.tsx` (`MarketSidebarServer`): add `snapshot = await api.getMarketSnapshot()` alongside the existing `overview` fetch; pass `snapshot` to `MarketOverviewWidget`; update `<Suspense fallback>` to use `<MarketOverviewWidgetSkeleton />`
  - [ ] 3.2 `frontend/src/app/stocks/page.tsx`: change `<MarketOverviewWidget indices={overview.indices} />` to `<MarketOverviewWidget snapshot={snapshot} />`

- [ ] Task 4: Update `MarketOverviewWidget.test.tsx`
  - [ ] 4.1 Replace `MarketIndex[]` fixture with `MarketSnapshot | null` shape matching the `VALID_SNAPSHOT` pattern from Story 6.2
  - [ ] 4.2 Update existing passing tests: index name renders, `▲` arrow, `▼` arrow, empty indices no-throw
  - [ ] 4.3 Add: `+` prefix on positive `change_pct`
  - [ ] 4.4 Add: `text-positive` / `text-negative` / `text-neutral-text` class applied by direction
  - [ ] 4.5 Add: market closed amber note when `market_open: false`
  - [ ] 4.6 Add: "Market data unavailable" renders when `snapshot: null`
  - [ ] 4.7 Add: `isFinite` NaN guard — `value: NaN` and `change_pct: NaN` render `"—"` not throw

- [ ] Task 5: Validate
  - [ ] 5.1 `cd frontend && npx tsc --noEmit` — zero errors
  - [ ] 5.2 `cd frontend && npx vitest run` — all tests pass

---

## Dev Notes

### ⚠️ CRITICAL: Prop Signature is a Breaking Change — Both Call Sites Must Change

The current `MarketOverviewWidget` signature uses the **OLD** `MarketIndex` type:
```tsx
// CURRENT (wrong — must change)
function MarketOverviewWidget({ indices }: { indices: MarketIndex[] })
```

The new signature must be:
```tsx
// NEW (Story 6.3)
function MarketOverviewWidget({ snapshot }: { snapshot: MarketSnapshot | null })
```

**Why `MarketSnapshot | null` not `IndexItem[]`:**
- AC2 needs `snapshot.market_open` and `snapshot.snapshot_at` to render the market-closed note
- AC4 needs `null` to trigger the unavailable error state (distinct from an empty indices array)
- Same rationale as Story 6.2's TickerBar prop change — null = API error, valid snapshot = data available

---

### Current MarketOverviewWidget State (MUST READ — full rewrite required)

File: `frontend/src/components/MarketOverviewWidget.tsx`

Current implementation uses `MarketIndex[]` with incompatible fields:
```tsx
// OLD — do not preserve any of these field references
interface Props { indices: MarketIndex[] }
// idx.symbol    ← IndexItem has no symbol field
// idx.price     ← IndexItem uses "value", not "price"
// idx.change    ← IndexItem has no "change" (absolute), only "change_pct"
// idx.change_pct ← exists in IndexItem ✅ but used wrongly (Math.abs + color from sign)
// idx.market    ← IndexItem has no market field
// idx.change >= 0 ? "text-green-600" : "text-red-500"  ← wrong tokens, wrong approach
```

**The entire render logic must be replaced.** The only things to preserve from the old file:
- The card shell structure: `bg-white rounded-xl border overflow-hidden` container
- The header bar: `Market Indices` label + `ดัชนีตลาด` subtitle
- The `divide-y` row layout

---

### IndexItem vs MarketIndex — Field Mapping

| Old `MarketIndex` | New `IndexItem` | Notes |
|-------------------|-----------------|-------|
| `name` | `name` | same |
| `symbol` | ❌ removed | don't render symbol sub-label |
| `price` | `value` | renamed; use `value.toLocaleString()` |
| `change` | ❌ removed | absolute change; don't show |
| `change_pct` | `change_pct` | same field, new formatting |
| `market` | ❌ removed | Thai exchange label; removed |
| ❌ none | `direction` | `"positive" \| "negative" \| "neutral"` — use for color AND arrow |

---

### Row Format (AC1)

Each row renders as two columns:
```
LEFT:  index name (text-xs, font-semibold, text-cocoa)
RIGHT: value (font-mono, text-espresso) + arrow + pct
```

**Value formatting:**
```tsx
const val = isFinite(idx.value) ? idx.value.toLocaleString() : "—";
```

**Change pct formatting (same pattern as TickerBar.tsx:58-60):**
```tsx
const pct = isFinite(idx.change_pct)
  ? `${idx.change_pct >= 0 ? "+" : ""}${idx.change_pct.toFixed(2)}%`
  : "—";
```

**Direction → color token mapping (semantic tokens work on white bg ✅):**
```tsx
const DIR_COLOR: Record<string, string> = {
  positive: "text-positive",    // #15803d on white — WCAG AA ✅
  negative: "text-negative",    // #dc2626 on white — WCAG AA ✅
  neutral:  "text-neutral-text",// #6b6560 on white — WCAG AA ✅
};
```

Note: Unlike `TickerBar` (which uses `text-green-200`/`text-red-200` because it's on camel `#B2967D` background), this widget is on a **white card background** — the semantic tokens `text-positive`, `text-negative`, `text-neutral-text` have sufficient contrast here.

**Direction → arrow glyph:**
```tsx
const DIR_ARROW: Record<string, string> = {
  positive: "▲",
  negative: "▼",
  neutral:  "–",
};
```

---

### Market Closed Note (AC2)

When `!snapshot.market_open`, render below the header (above the index rows):
```tsx
<div className="px-4 py-2 text-xs text-staleness border-b" style={{ borderColor: "rgba(74,52,42,0.08)" }}>
  Market closed · As of {formatBkkTime(snapshot.snapshot_at)}
</div>
```

**Bangkok time formatter** — copy this exact pattern from `DailyBriefCard.tsx:19-25`:
```tsx
function formatBkkTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }) + " BKK";
}
```

---

### Error / Unavailable State (AC4)

When `snapshot === null`, capture the attempted time from `new Date()` (server render time):
```tsx
if (snapshot === null) {
  const attemptedAt = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(74,52,42,0.1)" }}>
      <div className="px-4 py-3 border-b ..." style={...}>
        <span ...>Market Indices</span>
        <span ...>ดัชนีตลาด</span>
      </div>
      <div className="px-4 py-4 text-xs" style={{ color: "#6b6560" }}>
        Market data unavailable · Last attempted {attemptedAt} BKK
      </div>
    </div>
  );
}
```

This matches the same "never blank" rule (UX-DR11) that governs `TickerBar`'s null state.

---

### Skeleton (AC3)

Export a named `MarketOverviewWidgetSkeleton` from `MarketOverviewWidget.tsx`. It mimics the card structure with linen pulse blocks. Pattern from `SkeletonCard.tsx`:

```tsx
export function MarketOverviewWidgetSkeleton() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(74,52,42,0.1)" }}>
      <div className="px-4 py-3 border-b animate-pulse" style={{ borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" }}>
        <div className="h-3 bg-linen rounded w-28" />
      </div>
      <div className="divide-y">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 animate-pulse">
            <div className="h-3 bg-linen rounded w-20" />
            <div className="h-3 bg-linen rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Call Site Changes

#### `frontend/src/app/page.tsx` — `MarketSidebarServer`

**Current state:**
```tsx
async function MarketSidebarServer() {
  let overview: MarketOverview | null = null;
  let sectors: SectorPerformance[] = [];
  try { overview = await api.getMarketOverview(); } catch {}
  try { sectors = await api.getMarketSectors(); } catch {}
  return (
    <div className="space-y-4">
      {overview && <MarketOverviewWidget indices={overview.indices} />}  // ← must change
      {sectors.length > 0 && <SectorHeatmap sectors={sectors} />}
      {overview && <TrendSummary trends={overview.trends} />}
    </div>
  );
}
```

**After Story 6.3:**
```tsx
async function MarketSidebarServer() {
  let snapshot: MarketSnapshot | null = null;
  let sectors: SectorPerformance[] = [];
  try { snapshot = await api.getMarketSnapshot(); } catch {}
  try { sectors = await api.getMarketSectors(); } catch {}
  return (
    <div className="space-y-4">
      <MarketOverviewWidget snapshot={snapshot} />   // always render (handles null state internally)
      {sectors.length > 0 && <SectorHeatmap sectors={sectors} />}
      {/* TrendSummary stays — addressed in Story 6.5 */}
    </div>
  );
}
```

**Important notes:**
- `overview` fetch and `TrendSummary` can coexist OR `TrendSummary` can be temporarily removed/kept as-is if it already handles its own data. Check whether `TrendSummary` currently has its own fetch or relies on `overview.trends` being passed as a prop. If it's prop-driven, you'll need to keep the `overview` fetch just for `TrendSummary` until Story 6.5 refactors it.
- `api.getMarketSnapshot()` is ALREADY called in `HomePage` (parent Server Component) for `TickerBar`. Next.js 15 **deduplicates `fetch()` calls** with the same URL + options within a single request. So calling `api.getMarketSnapshot()` again in `MarketSidebarServer` costs **zero additional network requests** at runtime.
- Update `<Suspense fallback={<SkeletonCard />}>` to `<Suspense fallback={<MarketOverviewWidgetSkeleton />}>` for this Suspense boundary.

#### `frontend/src/app/stocks/page.tsx`

**Current state:**
```tsx
{overview && <MarketOverviewWidget indices={overview.indices} />}  // line ~56
```

**After:**
```tsx
<MarketOverviewWidget snapshot={snapshot} />
```

`overview` is still fetched in `stocks/page.tsx` (for the header bar with `overview.last_updated`). `snapshot` is already fetched (for `TickerBar`). No new fetch needed.

---

### Existing Test File — Full Rewrite Required

`frontend/src/components/MarketOverviewWidget.test.tsx` currently uses:
```tsx
import { MarketIndex } from '@/types'
const VALID_INDICES: MarketIndex[] = [...]
render(<MarketOverviewWidget indices={VALID_INDICES} />)
```

This must be **completely rewritten** to use `MarketSnapshot`. Use the same `VALID_SNAPSHOT` pattern established in `TickerBar.test.tsx` as the template:

```tsx
import { MarketSnapshot } from "@/types";

const VALID_SNAPSHOT: MarketSnapshot = {
  indices: [
    { name: "SET Index", value: 1384.52, change_pct: 0.60, direction: "positive" },
    { name: "Nikkei 225", value: 38947.00, change_pct: -0.32, direction: "negative" },
  ],
  tickers: [],
  market_open: true,
  snapshot_at: "2026-06-27T03:00:00Z",
};
```

**Tests to cover:**
1. Renders each index name ✅ (existing — update fixture)
2. Positive direction renders ▲ arrow ✅ (existing — update fixture)
3. Negative direction renders ▼ arrow ✅ (existing — update fixture)
4. Empty indices renders without throw ✅ (existing — update fixture)
5. **NEW** — positive `change_pct` shows `+` prefix (`+0.60%`)
6. **NEW** — negative `change_pct` shows natural `−` sign (`−0.32%`)
7. **NEW** — `direction: "positive"` applies `text-positive` CSS class
8. **NEW** — `direction: "negative"` applies `text-negative` CSS class
9. **NEW** — `market_open: false` renders "Market closed" note
10. **NEW** — `snapshot: null` renders "Market data unavailable"
11. **NEW** — `value: NaN` renders `"—"` not throw
12. **NEW** — `change_pct: NaN` renders `"—"` not throw

---

### TrendSummary Note

`TrendSummary` is **prop-driven** — `interface Props { trends: TrendItem[] }` — it receives `overview.trends`. You MUST keep the `overview = await api.getMarketOverview()` fetch in `MarketSidebarServer` for Story 6.3 so `TrendSummary` continues to render. The final `MarketSidebarServer` fetches **both** `overview` (for TrendSummary) and `snapshot` (for MarketOverviewWidget):

```tsx
async function MarketSidebarServer() {
  let overview: MarketOverview | null = null;
  let snapshot: MarketSnapshot | null = null;
  let sectors: SectorPerformance[] = [];
  try { overview = await api.getMarketOverview(); } catch {}
  try { snapshot = await api.getMarketSnapshot(); } catch {}
  try { sectors = await api.getMarketSectors(); } catch {}
  return (
    <div className="space-y-4">
      <MarketOverviewWidget snapshot={snapshot} />
      {sectors.length > 0 && <SectorHeatmap sectors={sectors} />}
      {overview && <TrendSummary trends={overview.trends} />}
    </div>
  );
}
```

Story 6.5 (TrendSummary Widget & Full Sidebar Composition) will complete the sidebar refactor.

---

### NFR Checklist

- `isFinite()` before every `toFixed()` and `.toLocaleString()` call (NFR-D02)
- Semantic direction tokens `text-positive`/`text-negative`/`text-neutral-text` on white bg (WCAG AA ✅)
- `▲`/`▼`/`–` non-color direction indicators (UX-DR11 / NFR-ACC01)
- Never blank: both null state and empty indices are handled (UX-DR11)
- No `isNaN()` — use `isFinite()` (catches both NaN and ±Infinity)

---

## Dev Agent Record

### Completion Notes
_To be filled by dev agent_

### Debug Log
_To be filled if issues encountered_

---

## File List

### New Files
_(none)_

### Modified Files
- `frontend/src/components/MarketOverviewWidget.tsx` — full rewrite + skeleton export
- `frontend/src/components/MarketOverviewWidget.test.tsx` — full rewrite
- `frontend/src/app/page.tsx` — `MarketSidebarServer`: add snapshot fetch, update widget prop + Suspense fallback
- `frontend/src/app/stocks/page.tsx` — update `MarketOverviewWidget` prop from `indices` to `snapshot`

---

## Change Log

| Date | Change |
|------|--------|
| 2026-06-27 | Story created |
