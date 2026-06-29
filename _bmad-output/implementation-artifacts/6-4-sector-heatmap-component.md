---
status: done
epic: 6
story: 4
story_key: "6-4-sector-heatmap-component"
created: 2026-06-29
baseline_commit: 52f9983e6ff95310de1f58f289911e02370b5a36
---

# Story 6.4: SectorHeatmap Component

**Status:** done

## Story

As a retail investor,
I want to see all sectors' daily performance in a visual grid,
So that I can immediately identify which sector is driving market movement before choosing which articles to read.

---

## Acceptance Criteria

### AC1 — Cell content and non-color indicators

**Given** `SectorHeatmap` receives a non-null `SectorPerformance[]`
**When** it renders
**Then** each sector renders as a cell showing: sector name (visible text, 12px, semi-bold) + percentage change (visible text with `+`/`–` prefix, bold monospace)
**And** both sector name and percentage text are visible non-color indicators — color fill is only the secondary visual layer (WCAG 1.4.1, UX-DR12)
**And** `change_pct` has `isFinite()` applied before `toFixed(2)` — `NaN` never reaches the DOM; show `"—"` on guard failure
**And** non-negative `change_pct` (`>= 0`) displays with a `+` prefix; negative values use the natural `−` sign from `toFixed(2)`

### AC2 — Background fill and text color contrast

**Given** cell background fill colors applied by `direction`
**When** rendered
**Then** `bg-positive-bg` (`#dcfce7`) for `positive`, `bg-negative-bg` (`#fee2e2`) for `negative`, `bg-neutral-bg` (`#f5f5f4`) for `neutral`
**And** percentage text uses Tailwind tokens `text-positive` (`#15803d`), `text-negative` (`#dc2626`), `text-neutral-text` (`#6b6560`) — all ≥ 4.5:1 contrast on their respective backgrounds (verified in DESIGN.md)

### AC3 — Click navigation

**Given** any sector cell
**When** clicked (or activated via keyboard Enter/Space)
**Then** it navigates to `/news?category=[sector_name]` — the filtered news feed
**And** navigation works regardless of whether `top_article_id` is null

### AC4 — Skeleton / loading state

**Given** the widget is inside a `<Suspense>` boundary
**When** data is loading
**Then** `SectorHeatmapSkeleton` (named export) renders: `animate-pulse` linen blocks in a 3-column grid at approximate cell dimensions (same card shell as the live widget) — no spinner, no blank area
**And** the skeleton wrapper has `role="status" aria-label="Loading sector data"` for screen readers

### AC5 — Error / unavailable state

**Given** `GET /api/market/sectors` returns an error and the prop is `null`
**When** the widget renders
**Then** it shows: `"Sector data unavailable · Last attempted [time BKK]"` in the card body — never silent or blank (UX-DR12)
**And** the card header ("Sector Heatmap" / "กลุ่มอุตสาหกรรม") still renders above the message

### AC6 — Focus ring (keyboard navigation)

**Given** any sector cell (a `<Link>` rendered as `<a>`)
**When** focused via keyboard
**Then** the espresso double-ring focus indicator is visible: `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`

---

## Tasks / Subtasks

- [x] Task 1: Rewrite `SectorHeatmap` component
  - [x] 1.1 Fix `clsx` import to named form: `import { clsx } from 'clsx'` (project rule violation in current code)
  - [x] 1.2 Import `Link` from `next/link`
  - [x] 1.3 Change prop from `sectors: SectorPerformance[]` to `sectors: SectorPerformance[] | null`
  - [x] 1.4 Add null guard → error/unavailable state with timestamped message (AC5)
  - [x] 1.5 Switch `DIR_STYLES` from inline hex to Tailwind tokens: `bg-positive-bg`, `bg-negative-bg`, `bg-neutral-bg`, `text-positive`, `text-negative`, `text-neutral-text` (AC2)
  - [x] 1.6 Fix `change_pct >= 0` (not `> 0`) for `+` prefix — consistency with MarketOverviewWidget (AC1)
  - [x] 1.7 Wrap each cell in `<Link href={/news?category=...}>` with focus ring class (AC3, AC6)

- [x] Task 2: Export `SectorHeatmapSkeleton`
  - [x] 2.1 Add named export `SectorHeatmapSkeleton` to `SectorHeatmap.tsx` — same card shell + header + 3×3 `animate-pulse bg-linen` cells (AC4)
  - [x] 2.2 Add `role="status" aria-label="Loading sector data"` to skeleton wrapper (AC4)

- [x] Task 3: Update call sites
  - [x] 3.1 `frontend/src/app/page.tsx` (`MarketSidebarServer`): change `let sectors: SectorPerformance[] = []` to `SectorPerformance[] | null = null`; update catch comment; remove `sectors.length > 0 &&` guard; render `<SectorHeatmap sectors={sectors} />`
  - [x] 3.2 `frontend/src/app/stocks/page.tsx`: same `null` initialization; remove `sectors.length > 0 &&` guard; render `<SectorHeatmap sectors={sectors} />`

- [x] Task 4: Update `SectorHeatmap.test.tsx`
  - [x] 4.1 Keep 5 existing tests (sector names, + prefix, − percentage, neutral, empty-no-throw) — they remain compatible since `SectorPerformance[]` is assignable to `SectorPerformance[] | null`
  - [x] 4.2 Add: null sectors renders "Sector data unavailable" (AC5)
  - [x] 4.3 Add: each cell is a `<Link>` (`<a>` in tests) with `href` pointing to `/news?category=...` (AC3)
  - [x] 4.4 Add: `change_pct: NaN` renders `"—"` not throw (AC1 — `isFinite()` guard)
  - [x] 4.5 Add: positive, negative, neutral Tailwind token classes present on cells (AC2)
  - [x] 4.6 Add: focus ring class present on each cell link (AC6)
  - [x] 4.7 Add: `SectorHeatmapSkeleton` renders without throwing (AC4)
  - [x] 4.8 Add: `SectorHeatmapSkeleton` has `role="status"` and `aria-label` (AC4)

- [x] Task 5: Validate
  - [x] 5.1 `cd frontend && npx tsc --noEmit` — zero errors
  - [x] 5.2 `cd frontend && npx vitest run` — 192/192 tests pass (9 new SectorHeatmap tests + no regressions)

### Review Findings

- [x] [Review][Patch] `stocks/page.tsx` sectors catch block has `/* ignore */` comment — should match page.tsx pattern: `// sectors stays null — SectorHeatmap renders unavailable state` [`frontend/src/app/stocks/page.tsx:25`]
- [x] [Review][Defer] `SectorHeatmapSkeleton` is exported but not wired to any `<Suspense>` fallback at call sites [`frontend/src/components/SectorHeatmap.tsx:33`] — deferred, pre-existing architecture gap (W1 carried from 6.3)
- [x] [Review][Defer] `/news?category=Thai-sector-name` navigation silently lands on unfiltered feed — news page only accepts Latin slug keys in `SLUG_TO_THAI` [`frontend/src/app/news/page.tsx`] — deferred, separate story for news routing
- [x] [Review][Defer] Error state "Last attempted HH:MM BKK" computed at RSC render time, not exact API failure time — stale under `revalidate = 60` caching [`frontend/src/components/SectorHeatmap.tsx:50`] — deferred, same pattern as MarketOverviewWidget

---

## Dev Notes

### ⚠️ Current SectorHeatmap State — Partial Implementation

File: `frontend/src/components/SectorHeatmap.tsx`

The current component covers AC1 and AC2 in part, but is missing navigation, skeleton, error state, and focus ring. **Do not start from scratch** — preserve the existing grid structure and extend it.

**What works today:**
- `SectorPerformance[]` prop ✅
- `isFinite()` guard on `change_pct` ✅
- 3-column grid layout ✅
- Card shell + header structure ✅

**What is broken today:**
- `import clsx from "clsx"` — must be named import per project-context rule
- `sector.change_pct > 0 ? "+" : ""` — should be `>= 0` (AC1: "non-negative displays with + prefix")
- `DIR_STYLES` uses inline hex `bg-[#dcfce7]` instead of Tailwind tokens `bg-positive-bg` (use tokens — they exist in tailwind.config.ts)
- No click navigation (AC3 not implemented)
- No `SectorHeatmapSkeleton` export (AC4 not implemented)
- No null guard / error state (AC5 not implemented)
- No focus ring on cells (AC6 not implemented)

**Existing test file:** `frontend/src/components/SectorHeatmap.test.tsx` — 5 tests, keep all, add 8 more.

---

### Prop Change: `SectorPerformance[] | null`

The prop changes to allow distinguishing API error from empty list:

```tsx
// BEFORE
interface Props { sectors: SectorPerformance[] }

// AFTER
interface Props { sectors: SectorPerformance[] | null }
```

**State semantics:**
- `null` → API fetch threw → render error/unavailable state (AC5)
- `[]` (empty array) → API succeeded, no sectors → render nothing (return null from component)
- `[...items]` → normal heatmap render

This mirrors the `MarketOverviewWidget` pattern from Story 6.3 exactly.

---

### Call Site Changes (BOTH pages must be updated)

#### `frontend/src/app/page.tsx` — `MarketSidebarServer` (lines 36–60)

**Before:**
```tsx
let sectors: SectorPerformance[] = [];
try {
  sectors = await api.getMarketSectors();
} catch {
  // sectors stay empty on failure
}
// ...
{sectors.length > 0 && <SectorHeatmap sectors={sectors} />}
```

**After:**
```tsx
let sectors: SectorPerformance[] | null = null;
try {
  sectors = await api.getMarketSectors();
} catch {
  // sectors stays null — SectorHeatmap renders unavailable state
}
// ...
<SectorHeatmap sectors={sectors} />
```

Also add import: `import SectorHeatmap, { SectorHeatmapSkeleton } from "@/components/SectorHeatmap"` — but `SectorHeatmapSkeleton` will only be used when Story 6.5 adds per-widget Suspense boundaries. For now, just export it; the import is not yet used in a Suspense fallback. **Keep the existing `<Suspense fallback={<MarketOverviewWidgetSkeleton />}>` wrapper unchanged** — do not add a new Suspense boundary in this story.

#### `frontend/src/app/stocks/page.tsx` (line 13 and ~59)

**Before:**
```tsx
let sectors: SectorPerformance[] = [];
// ...
{sectors.length > 0 && <SectorHeatmap sectors={sectors} />}
```

**After:**
```tsx
let sectors: SectorPerformance[] | null = null;
// ...
<SectorHeatmap sectors={sectors} />
```

---

### Tailwind Token Classes for `DIR_STYLES`

The `tailwind.config.ts` already defines these tokens. Use them directly instead of inline hex:

```tsx
const DIR_STYLES: Record<string, { cell: string; pct: string }> = {
  positive: { cell: "bg-positive-bg", pct: "text-positive" },
  neutral:  { cell: "bg-neutral-bg",  pct: "text-neutral-text" },
  negative: { cell: "bg-negative-bg", pct: "text-negative" },
};
```

**Contrast verification (from DESIGN.md):**
- `text-positive` (#15803d) on `bg-positive-bg` (#dcfce7) → 4.74:1 ✅ WCAG AA
- `text-negative` (#dc2626) on `bg-negative-bg` (#fee2e2) → 4.62:1 ✅ WCAG AA
- `text-neutral-text` (#6b6560) on `bg-neutral-bg` (#f5f5f4) → 4.55:1 ✅ WCAG AA

---

### Click Navigation (AC3)

Each cell becomes a `<Link>` from `next/link`. The `href` uses `encodeURIComponent` to handle Thai sector names:

```tsx
import Link from "next/link";

// Inside the map:
<Link
  key={sector.sector_name}
  href={`/news?category=${encodeURIComponent(sector.sector_name)}`}
  className={clsx(
    "rounded-lg p-2.5 text-center block",
    s.cell,
    "focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]",
  )}
>
  <div className="text-xs font-semibold mb-0.5" style={{ color: "#4A342A" }}>
    {sector.sector_name}
  </div>
  <div className={clsx("text-sm font-bold font-mono", s.pct)}>
    {pctText}
  </div>
</Link>
```

**Why `<Link>` not `<a>`:** `<Link>` provides client-side navigation without full page reload; it also works correctly in Server Components. No `"use client"` needed.

**Why `encodeURIComponent`:** Sector names are Thai strings (e.g., `ก่อสร้าง`). The URL must encode them for correct browser parsing; `encodeURIComponent` handles multi-byte UTF-8 correctly.

**`top_article_id` is irrelevant:** The navigation goes to `/news?category=[sector_name]` regardless of whether `top_article_id` is null. Do not add any conditional on `top_article_id`.

---

### Error / Unavailable State (AC5)

When `sectors === null` (API fetch threw), render the card shell with the "unavailable" message:

```tsx
if (sectors === null) {
  const attemptedAt = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(74,52,42,0.1)" }}>
      <CardHeader />
      <div className="px-4 py-4 text-xs" style={{ color: "#6b6560" }}>
        Sector data unavailable · Last attempted {attemptedAt} BKK
      </div>
    </div>
  );
}
```

Extract `CardHeader` as an internal function (same pattern as `MarketOverviewWidget`):
```tsx
function CardHeader() {
  return (
    <div
      className="px-4 py-3 border-b flex items-center justify-between"
      style={{ borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" }}
    >
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7D5A44" }}>
        Sector Heatmap
      </span>
      <span className="text-xs" style={{ color: "#B2967D" }}>กลุ่มอุตสาหกรรม</span>
    </div>
  );
}
```

---

### Empty Array State

When `sectors` is a non-null empty array (`sectors.length === 0`), return `null` from the component — the widget does not render. The parent's Suspense boundary is unaffected; the card simply doesn't appear in the sidebar. This prevents an empty "ghost card" with just the header and no cells.

```tsx
if (sectors.length === 0) return null;
```

---

### Skeleton (AC4)

Same card shell structure as the live widget — 3-column grid of 6 `animate-pulse bg-linen` blocks:

```tsx
const CARD_SHELL = "bg-white rounded-xl border overflow-hidden";
const CARD_BORDER = { borderColor: "rgba(74,52,42,0.1)" };
const HEADER_BORDER = { borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" };

export function SectorHeatmapSkeleton() {
  return (
    <div className={CARD_SHELL} style={CARD_BORDER} role="status" aria-label="Loading sector data">
      <div className="px-4 py-3 border-b animate-pulse" style={HEADER_BORDER}>
        <div className="h-3 bg-linen rounded w-32" />
      </div>
      <div className="p-3 grid grid-cols-3 gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg h-14 bg-linen animate-pulse" />
        ))}
      </div>
    </div>
  );
}
```

**6 skeleton cells** (2 rows × 3 cols) matches a typical sector dataset. Cell height `h-14` (56px) approximates the live cell's `p-2.5` (10px top+bottom) + 12px name + 4px gap + 20px pct text.

---

### Test Approach

Keep all 5 existing tests unchanged. Add these 8 new tests:

```tsx
// AC5: null renders error state
it("null sectors shows Sector data unavailable", () => {
  render(<SectorHeatmap sectors={null} />);
  expect(screen.getByText(/Sector data unavailable/)).toBeInTheDocument();
});

// AC3: link navigation
it("each sector cell is a link to /news?category=[sector_name]", () => {
  render(<SectorHeatmap sectors={VALID_SECTORS} />);
  const links = screen.getAllByRole("link");
  expect(links.length).toBe(VALID_SECTORS.length);
  expect(links[0]).toHaveAttribute(
    "href",
    `/news?category=${encodeURIComponent(VALID_SECTORS[0].sector_name)}`
  );
});

// AC1: isFinite guard
it("change_pct NaN renders — not throw", () => {
  const snap = [{ ...VALID_SECTORS[0], change_pct: NaN }];
  render(<SectorHeatmap sectors={snap} />);
  expect(screen.getByText("—")).toBeInTheDocument();
});

// AC2: token classes
it("positive cell has bg-positive-bg class", () => {
  const { container } = render(<SectorHeatmap sectors={VALID_SECTORS} />);
  expect(container.querySelector(".bg-positive-bg")).toBeInTheDocument();
});

it("negative cell has bg-negative-bg class", () => {
  const { container } = render(<SectorHeatmap sectors={VALID_SECTORS} />);
  expect(container.querySelector(".bg-negative-bg")).toBeInTheDocument();
});

// AC6: focus ring class
it("sector cell link has espresso focus ring class", () => {
  const { container } = render(<SectorHeatmap sectors={VALID_SECTORS} />);
  const link = container.querySelector("a");
  expect(link?.className).toContain("focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]");
});

// AC4: skeleton
describe("SectorHeatmapSkeleton", () => {
  it("renders without throwing", () => {
    expect(() => render(<SectorHeatmapSkeleton />)).not.toThrow();
  });

  it("has role=status and aria-label for screen readers", () => {
    const { container } = render(<SectorHeatmapSkeleton />);
    const el = container.querySelector('[role="status"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-label", "Loading sector data");
  });
});
```

**Import additions for test file:**
```tsx
import SectorHeatmap, { SectorHeatmapSkeleton } from "./SectorHeatmap";
```

---

### Constants Pattern

Extract shared card shell values to module-level constants (same as `MarketOverviewWidget`):

```tsx
const CARD_SHELL = "bg-white rounded-xl border overflow-hidden";
const CARD_BORDER = { borderColor: "rgba(74,52,42,0.1)" };
const HEADER_BORDER = { borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" };
```

This eliminates duplication between the live component and skeleton.

---

### `>= 0` vs `> 0` for + Prefix

The current code uses `sector.change_pct > 0 ? "+" : ""` — this means `0.0` renders `0.00%` without a `+`. The spec says "non-negative `change_pct`" (i.e., `>= 0`). Fix to match `MarketOverviewWidget`'s pattern:

```tsx
const pctText = isFinite(sector.change_pct)
  ? `${sector.change_pct >= 0 ? "+" : ""}${sector.change_pct.toFixed(2)}%`
  : "—";
```

Existing test for neutral (`change_pct: -0.08`) still passes since `-0.08 >= 0` is false.

---

### What NOT to Change

- **`api.ts`** — `getMarketSectors()` already exists and returns `SectorPerformance[]`. No change needed.
- **`types/index.ts`** — `SectorPerformance` type is already correct. No change needed.
- **`tailwind.config.ts`** — All required tokens (`bg-positive-bg`, `bg-negative-bg`, `bg-neutral-bg`, `text-positive`, `text-negative`, `text-neutral-text`, `bg-linen`) already defined. No change needed.
- **`TrendSummary`** — not part of this story. Leave untouched.
- **Suspense boundaries** — Do not reorganize Suspense in page.tsx. Story 6.5 handles full sidebar composition. Just update the `<SectorHeatmap>` call from the guarded conditional to `<SectorHeatmap sectors={sectors} />`.

---

### Learning from Story 6.3 Review

- **Skeleton a11y**: Always add `role="status" aria-label="..."` to skeleton components (caught in 6.3 review P2)
- **`isNaN` guard for date strings**: If using `new Date(isoString)` for any timestamp, guard with `isNaN(d.getTime())` before calling `.toLocaleTimeString()`
- **Token classes over inline hex**: Use Tailwind tokens where defined (this story applies that principle to `DIR_STYLES`)
- **`>= 0` consistency**: MarketOverviewWidget uses `>= 0` for `+` prefix; maintain consistency here

---

## Dev Agent Record

### Completion Notes

Full rewrite of `SectorHeatmap` with all 6 ACs implemented. Key decisions:
- Pre-existing bug fixed: `import clsx from 'clsx'` → `import { clsx } from 'clsx'` (project rule)
- Pre-existing bug fixed: `> 0` → `>= 0` for `+` prefix (AC1 spec compliance, consistency with MarketOverviewWidget)
- `DIR_STYLES` migrated from inline hex (`bg-[#dcfce7]`) to Tailwind tokens (`bg-positive-bg`) — tokens were already defined in `tailwind.config.ts`
- Prop `sectors: SectorPerformance[] | null` mirrors Story 6.3's `MarketOverviewWidget` null pattern exactly
- `return null` on empty array prevents ghost card with just a header
- `<Link>` from next/link renders as `<a>` in tests; no `"use client"` needed
- `encodeURIComponent(sector.sector_name)` handles Thai sector name encoding in URL
- `SectorHeatmapSkeleton`: 3×3 grid of 6 `h-14 bg-linen animate-pulse` cells + `role="status"`
- Both call sites (page.tsx MarketSidebarServer + stocks/page.tsx) updated: `null` init, no conditional guard
- 5 existing tests preserved, 9 new tests added (14 total); 192/192 pass, zero TS errors

### Debug Log
_No issues encountered._

---

## File List

### New Files
_(none)_

### Modified Files
- `frontend/src/components/SectorHeatmap.tsx` — full rewrite: named `{ clsx }` import, `null` prop, `Link` navigation, focus ring, Tailwind tokens, `SectorHeatmapSkeleton` named export, error state, card constants
- `frontend/src/components/SectorHeatmap.test.tsx` — updated import + 9 new tests (14 total, 5 existing preserved)
- `frontend/src/app/page.tsx` — `MarketSidebarServer`: `sectors` init from `[]` → `null`, catch comment update, unconditional `<SectorHeatmap sectors={sectors} />`
- `frontend/src/app/stocks/page.tsx` — `sectors` init from `[]` → `null`, unconditional `<SectorHeatmap sectors={sectors} />`

---

## Change Log

| Date | Event |
|------|-------|
| 2026-06-29 | Story created — next after Story 6.3 (MarketOverviewWidget) completion |
| 2026-06-29 | Implementation complete — full rewrite with Link navigation, null error state, Tailwind tokens, skeleton; 192 tests pass |
