---
status: done
epic: 4
story: 4
story_key: "4-4-home-page-integration-dailybriefcard-as-primary-entry-point"
created: 2026-06-25
baseline_commit: 19a9276adbddcf294de1876a80f5d044408c604b
---

# Story 4.4: Home Page Integration — DailyBriefCard as Primary Entry Point

**Status:** done

## Story

As a retail investor,
I want the Daily Brief to appear at the top of the page when I open ASK,
So that I am oriented to the market the moment the page loads — before I read any individual articles.

## Acceptance Criteria

### AC1 — DailyBriefCard visible at top of right sidebar on desktop

**Given** the home page `/` on desktop (≥ 1024px)
**When** it renders
**Then** `DailyBriefCard` appears at the top of the right sidebar column, visible above the fold without scrolling (FR-D02)
**And** it replaces the `DailyBriefPlaceholder` component added in Story 2.8

### AC2 — DailyBriefCard first content element on mobile

**Given** the home page `/` on mobile (< 1024px)
**When** it renders
**Then** `DailyBriefCard` is the first content element after the Navbar and Ticker Bar — it appears above the news feed (FR-D02)
**And** it scrolls away naturally as the user reads down — it does not stick or dominate

### AC3 — Suspense boundary with DailyBriefCardSkeleton fallback

**Given** `DailyBriefCard` on the home page
**When** it is inside a `<Suspense>` boundary
**Then** the fallback is `<DailyBriefCardSkeleton />` from `DailyBriefCard.tsx` — both zones show `animate-pulse` linen blocks
**And** the `api.getDailyBrief()` call inherits `next: { revalidate: 60 }` from the global `fetchAPI` wrapper — consistent with the 60s ISR strategy (NFR-P01)

### AC4 — 404 renders error state, never throws

**Given** `GET /daily-brief/` returns `HTTP 404` (no brief exists yet — first run)
**When** `DailyBriefServer` calls the API
**Then** it catches the error and renders `DailyBriefCardError` — "Daily Brief unavailable · Last attempted [time]"
**And** the page does not throw or leave the sidebar slot empty

### AC5 — UJ-1 (Nam's morning brief journey) end-to-end

**Given** the home page after Epic 4 is complete
**When** reviewed against UJ-1
**Then** `DailyBriefCard` is visible immediately on desktop without scrolling
**And** `overall_sentiment` badge is readable at a glance from the top of the page
**And** `key_developments` list is visible in Zone 2 without expanding or clicking

---

## Dev Notes

### This Story is Purely Frontend

**No backend changes.** All work is in the Next.js frontend.

**Files to create (NEW):**
- `frontend/src/components/DailyBriefServer.tsx`
- `frontend/src/components/DailyBriefServer.test.tsx`

**Files to modify (UPDATE):**
- `frontend/src/app/page.tsx`

**Files to delete (DELETE):**
- `frontend/src/components/DailyBriefPlaceholder.tsx`
- `frontend/src/components/DailyBriefPlaceholder.test.tsx`

---

### Critical Architecture: DailyBriefPlaceholder Is Replaced, Not Extended

`DailyBriefPlaceholder` (added in Story 2.8) is a static placeholder that simulates an upcoming feature. This story delivers the real feature, making the placeholder obsolete. **Delete both the component file and its test file.** Do not import it anywhere after deletion.

Verify before deleting: `grep -r "DailyBriefPlaceholder" frontend/src/` — it should only appear in `page.tsx` and its own file/test.

---

### New Component: `DailyBriefServer.tsx`

Create `frontend/src/components/DailyBriefServer.tsx`:

```tsx
import { api } from "@/lib/api";
import DailyBriefCard, { DailyBriefCardError } from "./DailyBriefCard";

export default async function DailyBriefServer() {
  try {
    const brief = await api.getDailyBrief();
    return <DailyBriefCard brief={brief} />;
  } catch {
    return <DailyBriefCardError />;
  }
}
```

**Why a separate file (not inline in page.tsx)?**
- Makes it independently testable via `vi.mock("@/lib/api")`
- Consistent with the project pattern: `MarketOverviewWidget`, `NewsFeed`, `TrendSummary` etc. are all separate files in `/components`
- `HomeFeedServer` and `MarketSidebarServer` stay inline in `page.tsx` because they compose multiple components; `DailyBriefServer` maps 1-to-1 from API → component

**Why catch-all (no 404 vs 5xx distinction)?**
- `fetchAPI` throws a generic `Error` on any non-OK status: `API error: ${res.status} ${path}`
- The brief is either available or it isn't — distinguish 404 vs 500 offers no user-visible difference for this component
- `DailyBriefCardError` is the correct state for any unavailability

**ISR note:**
`api.getDailyBrief()` calls `fetchAPI<DailyBrief>("/daily-brief/")`. The global `fetchAPI` already passes `next: { revalidate: 60 }` — no override needed. The 60-second revalidation also limits `DailyBriefCardError`'s timestamp staleness to ≤ 60 seconds (resolving the deferred concern from Story 4.2 review).

---

### Page Layout: Reordering Columns for Mobile-First

The current `page.tsx` grid DOM order is: **left (news feed) first, right (sidebar) second.**

On mobile (`grid-cols-1`), this means news feed appears above DailyBriefCard. AC2 requires DailyBriefCard above the news feed on mobile. The fix: swap DOM order and use CSS `order` to restore desktop layout.

**New grid structure in `page.tsx`:**

```jsx
{/* Two-column content grid */}
<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

  {/* Right sidebar — first in DOM (mobile: shows above news feed) */}
  {/* On desktop: lg:order-last moves it back to the right column */}
  <div className="space-y-4 order-first lg:order-last">
    <Suspense fallback={<DailyBriefCardSkeleton />}>
      <DailyBriefServer />
    </Suspense>
    <Suspense fallback={<SkeletonCard />}>
      <MarketSidebarServer />
    </Suspense>
  </div>

  {/* Left: news feed — second in DOM (mobile: shows below DailyBriefCard) */}
  {/* On desktop: lg:order-first moves it back to the left column */}
  <div className="order-last lg:order-first">
    <div className="flex items-center justify-between mb-3">
      ...{/* existing Financial News header unchanged */}
    </div>
    <Suspense fallback={<SkeletonCard />}>
      <HomeFeedServer />
    </Suspense>
  </div>

</div>
```

**How CSS order works here:**
- `order-first` = `order: -9999` (Tailwind utility)
- `order-last` = `order: 9999` (Tailwind utility)
- Mobile (grid-cols-1, single column): sidebar (order-first) stacks first; news feed (order-last) stacks below ✓
- Desktop (lg:grid-cols-[1fr_340px]):
  - `lg:order-last` on sidebar → CSS order: 9999 → grid auto-places it in column 2 (right, 340px) ✓
  - `lg:order-first` on news feed → CSS order: -9999 → grid auto-places it in column 1 (left, 1fr) ✓

**Imports to add to `page.tsx`:**
```tsx
import DailyBriefServer from "@/components/DailyBriefServer";
import { DailyBriefCardSkeleton } from "@/components/DailyBriefCard";
```

**Imports to REMOVE from `page.tsx`:**
```tsx
import DailyBriefPlaceholder from "@/components/DailyBriefPlaceholder"; // DELETE THIS LINE
```

---

### Current `page.tsx` State (Read Before Modifying)

The file at `frontend/src/app/page.tsx` currently:
- Imports: `Suspense`, `api`, `MarketOverview`, `NewsItem`, `TickerItem`, `Navbar`, `TickerBar`, `NewsFeed`, `MarketOverviewWidget`, `SectorHeatmap`, `TrendSummary`, `DailyBriefPlaceholder`, `SkeletonCard`
- Has `HomeFeedServer` (async, calls `api.getNews()`) and `MarketSidebarServer` (async, calls `api.getMarketOverview()`) as inline server component functions above the page component
- Grid line 120: `<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">`
- Left div (line 123): news feed section with "Financial News" header + `<Suspense><HomeFeedServer /></Suspense>`
- Right div (line 151): `<div className="space-y-4">` containing `<DailyBriefPlaceholder />` and `<Suspense><MarketSidebarServer /></Suspense>`

**What to preserve:**
- All imports except `DailyBriefPlaceholder`
- `HomeFeedServer` and `MarketSidebarServer` functions — unchanged
- The "Financial News" header section (lines 124–147) — unchanged content, just wrapped in the reordered div
- The footer — unchanged
- The page header bar — unchanged
- The search input section — unchanged

---

### Tests: `DailyBriefServer.test.tsx`

**Location:** `frontend/src/components/DailyBriefServer.test.tsx`

**Test framework:** Vitest + `@testing-library/react` + jsdom. Same as all component tests.

**Key pattern:** Async server components are regular async functions returning JSX. Test by awaiting the function call and rendering the result:

```tsx
render(await DailyBriefServer());
```

**Mock setup:**

```tsx
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { api } from '@/lib/api';
import DailyBriefServer from './DailyBriefServer';

vi.mock('@/lib/api', () => ({
  api: { getDailyBrief: vi.fn() },
}));
```

**Mock brief fixture** (matches `DailyBrief` TypeScript type from `src/types/index.ts`):

```tsx
const MOCK_BRIEF = {
  overall_sentiment: "bullish" as const,
  key_developments: ["SET rose 0.8%", "SCB gains"],
  opportunities: ["Banking sector"],
  risks: ["Global rate uncertainty"],
  generated_at: "2026-06-22T00:05:00Z",
  brief_date: "2026-06-22",
  is_fallback: false,
};
```

**Required tests:**

| # | AC | Test name | Assertion |
|---|---|---|---|
| 1 | AC4 | `test renders DailyBriefCard when brief available` | mock resolves → "AI Daily Brief" in DOM |
| 2 | AC4 | `test renders DailyBriefCardError when api throws` | mock rejects → "Daily Brief unavailable" in DOM |
| 3 | AC4 | `test renders DailyBriefCardError on 404` | mock rejects with 404 error message → "Daily Brief unavailable" |

**Note on test 1 vs 2/3:** Test 1 confirms success path. Tests 2 and 3 can be combined (both are errors, different messages) — 3 distinct tests is the minimum; you may consolidate 2 and 3 into a single error test if they share identical assertions.

**Cleanup between tests:**
```tsx
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

### Delete DailyBriefPlaceholder

After page.tsx is updated and DailyBriefServer is wired in:

1. Verify: `grep -r "DailyBriefPlaceholder" frontend/src/` → should return 0 results
2. Delete `frontend/src/components/DailyBriefPlaceholder.tsx`
3. Delete `frontend/src/components/DailyBriefPlaceholder.test.tsx`

The placeholder tests (3 tests: renders without throwing, renders AI Daily Brief heading, renders preparing subtitle) will be removed. The new `DailyBriefServer.test.tsx` adds tests covering actual behavior. Net test count change: -3 + 3 = 0 (approximately 136 frontend tests).

---

### DailyBriefCardSkeleton — Already the Right Suspense Fallback

`DailyBriefCardSkeleton` is exported from `frontend/src/components/DailyBriefCard.tsx` (Story 4.2):
- Has `role="status"` and `aria-label="Loading daily brief"`
- Shows `animate-pulse` linen blocks in both Zone 1 and Zone 2
- Exactly what the AC3 Suspense boundary requires

Import: `import { DailyBriefCardSkeleton } from "@/components/DailyBriefCard";`

Do NOT use `SkeletonCard` for the DailyBriefCard Suspense boundary — `SkeletonCard` has `aria-label="Loading news"` and does not visually match the DailyBriefCard layout.

---

### Previous Story Intelligence

**From Story 4.2 (DailyBriefCard Component):**
- `DailyBriefCard` default export: `DailyBriefCard({ brief: DailyBrief })`
- Named exports: `DailyBriefCardSkeleton`, `DailyBriefCardError`
- All three from `frontend/src/components/DailyBriefCard.tsx`
- `DailyBriefCardError` renders `new Date().toISOString()` at render time. Under 60s ISR, max staleness is 60 seconds → "Last attempted HH:MM BKK" is at worst 1 minute stale — acceptable at minute-level display. This resolves the D1 deferred from Story 4.2 code review.

**From Story 4.1 (DailyBrief Schema & API Endpoint):**
- `api.getDailyBrief()` is already implemented in `frontend/src/lib/api.ts`
- It calls `fetchAPI<DailyBrief>("/daily-brief/")` which throws on any non-OK HTTP status
- 404 → throws `Error("API error: 404 /daily-brief/")` — caught by `DailyBriefServer`'s try/catch

**From Story 4.3 (Ingestion Webhook):**
- No frontend impact — Story 4.3 was purely backend
- The backend `GET /daily-brief/` endpoint is fully wired: returns today's brief, yesterday as fallback, or 404 if none exist

**From Story 2.8 (Home Page Layout):**
- `DailyBriefPlaceholder` was explicitly added as a sidebar placeholder "until Story 4.4 is implemented"
- The current DOM order has news feed first, sidebar second — must be swapped for AC2

---

### Common Mistakes to Avoid

1. **Do NOT inline `DailyBriefServer` in `page.tsx`** — extract to `components/DailyBriefServer.tsx` for testability
2. **Do NOT use `<DailyBriefCardSkeleton />` from a separate import** — it is a named export from `DailyBriefCard.tsx`, not a separate file
3. **Do NOT use `<SkeletonCard />` as the DailyBriefCard Suspense fallback** — it has wrong aria-label and wrong visual structure
4. **Do NOT forget to swap grid column order** — without `order-first`/`order-last` fix, DailyBriefCard appears below the news feed on mobile (violates AC2)
5. **Do NOT delete DailyBriefPlaceholder before removing its import from page.tsx** — TypeScript will fail the build
6. **Do NOT add a separate `next: { revalidate: 60 }` call** — `fetchAPI` already passes this globally; adding it again is redundant
7. **Do NOT wrap the test in `act()`** — just `await DailyBriefServer()` and `render()` the result

---

### Frontend Test Baseline

Before this story: **136 frontend tests** (from Story 4.2)

After this story:
- Remove `DailyBriefPlaceholder.test.tsx` → -3 tests
- Add `DailyBriefServer.test.tsx` → +3 tests (minimum)
- Expected total: **≥ 136 frontend tests** (net neutral or slightly higher)

Run tests: `cd frontend && npx vitest run` (or `./node_modules/.bin/vitest run`)

---

## Tasks / Subtasks

- [x] Task 1: Create `frontend/src/components/DailyBriefServer.tsx`
  - [x] 1a: Async server component with try/catch — success → `DailyBriefCard`, catch → `DailyBriefCardError`
  - [x] 1b: Import `api` from `@/lib/api` and both named components from `./DailyBriefCard`

- [x] Task 2: Create `frontend/src/components/DailyBriefServer.test.tsx` with ≥ 3 tests
  - [x] 2a: Mock `@/lib/api` with `vi.mock`, `beforeEach` clears mocks
  - [x] 2b: Test renders `DailyBriefCard` (via "AI Daily Brief" heading) when API resolves
  - [x] 2c: Test renders `DailyBriefCardError` (via "Daily Brief unavailable") when API throws

- [x] Task 3: Update `frontend/src/app/page.tsx`
  - [x] 3a: Remove `DailyBriefPlaceholder` import; add `DailyBriefServer` and `DailyBriefCardSkeleton` imports
  - [x] 3b: Replace `<DailyBriefPlaceholder />` with `<Suspense fallback={<DailyBriefCardSkeleton />}><DailyBriefServer /></Suspense>`
  - [x] 3c: Apply `order-first lg:order-last` to sidebar div and `order-last lg:order-first` to news feed div

- [x] Task 4: Delete placeholder files
  - [x] 4a: Verify `grep -r "DailyBriefPlaceholder" frontend/src/` returns 0 results
  - [x] 4b: Delete `frontend/src/components/DailyBriefPlaceholder.tsx`
  - [x] 4c: Delete `frontend/src/components/DailyBriefPlaceholder.test.tsx`

- [x] Task 5: Run frontend test suite and confirm zero regressions
  - [x] All remaining tests pass
  - [x] No TypeScript errors (`npx tsc --noEmit` from `frontend/`)
  - [x] Total: ≥ 136 frontend tests passing

### Review Findings

- [x] [Review][Patch] Silent catch — errors not logged before returning DailyBriefCardError [frontend/src/components/DailyBriefServer.tsx:8]
- [x] [Review][Defer] Null/malformed brief fields in DailyBriefCard (key_developments, brief_date, generated_at, overall_sentiment) — deferred, pre-existing [frontend/src/components/DailyBriefCard.tsx]
- [x] [Review][Defer] DailyBriefCardError timestamp ("Last attempted [time]") not tested in server component — deferred, pre-existing (Story 4.2 scope)
- [x] [Review][Defer] is_fallback: true rendering not covered in DailyBriefServer test — deferred, pre-existing (DailyBriefCard.tsx Story 4.2 scope)
- [x] [Review][Defer] DOM order reordering + screen reader traversal order — deferred, intentional design choice (requires accessibility audit)
- [x] [Review][Defer] Simultaneous Suspense boundary failures (DailyBriefServer + MarketSidebarServer) — deferred, pre-existing (MarketSidebarServer is not new)

---

## Dev Agent Record

### Implementation Plan

RED-GREEN-REFACTOR cycle per task:

1. **Task 2 first (tests before component):** Wrote `DailyBriefServer.test.tsx` — all 3 tests failed with "Failed to resolve import" (correct RED). Then created `DailyBriefServer.tsx` — all 3 turned GREEN immediately.
2. **Task 3 (page.tsx updates):** Swapped imports (`DailyBriefPlaceholder` → `DailyBriefServer` + `DailyBriefCardSkeleton`). Moved sidebar div before news feed div in DOM; applied `order-first lg:order-last` to sidebar, `order-last lg:order-first` to news feed to restore desktop column order via CSS.
3. **Task 4 (delete):** Verified grep returned 0 results from `page.tsx` before deleting both placeholder files.
4. **Task 5 (validation):** Full suite 136/136. `npx tsc --noEmit` clean.

### Debug Log

No issues. RED→GREEN in single pass. TypeScript inference of the async function return type (`JSX.Element`) worked without explicit annotation.

### Completion Notes

- Created `DailyBriefServer.tsx` (10 lines): async server component wrapping `api.getDailyBrief()` with try/catch; success → `DailyBriefCard`, any error → `DailyBriefCardError`
- Created `DailyBriefServer.test.tsx` (3 tests): mocks `@/lib/api`; tests success path, network error, and 404 error
- Updated `page.tsx`: removed `DailyBriefPlaceholder`, added `DailyBriefServer` in `<Suspense fallback={<DailyBriefCardSkeleton />}>`, swapped DOM order for mobile-first layout using CSS order utilities
- Deleted `DailyBriefPlaceholder.tsx` and `DailyBriefPlaceholder.test.tsx`
- Deferred D1 from Story 4.2 (DailyBriefCardError timestamp staleness) is resolved: 60s ISR revalidation caps max staleness to ≤ 60 seconds
- Final test count: 136 (net neutral: -3 placeholder tests, +3 DailyBriefServer tests)
- AC1 ✓ DailyBriefCard in right sidebar on desktop; AC2 ✓ first content on mobile via CSS order; AC3 ✓ Suspense + DailyBriefCardSkeleton; AC4 ✓ catch renders DailyBriefCardError, never throws; AC5 ✓ UJ-1 satisfied (DailyBriefCard above fold on desktop)

---

## File List

### New Files
- `frontend/src/components/DailyBriefServer.tsx`
- `frontend/src/components/DailyBriefServer.test.tsx`

### Modified Files
- `frontend/src/app/page.tsx`

### Deleted Files
- `frontend/src/components/DailyBriefPlaceholder.tsx`
- `frontend/src/components/DailyBriefPlaceholder.test.tsx`

---

## Change Log

| Date | Change |
|------|--------|
| 2026-06-25 | Story created |
| 2026-06-25 | Story implemented — DailyBriefServer component created, page.tsx updated with mobile-first grid reorder, DailyBriefPlaceholder deleted; 136/136 tests passing, no TypeScript errors |
| 2026-06-25 | Code review: 1 patch applied (add console.error in catch block), 5 deferred, 9 dismissed; status → done |
