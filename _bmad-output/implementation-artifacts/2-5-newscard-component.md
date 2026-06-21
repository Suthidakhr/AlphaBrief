---
status: done
epic: 2
story: 5
story_key: "2-5-newscard-component"
created: 2026-06-21
baseline_commit: 08104b6b9fbd5e0ef6a738b1b06e68b822d53786
---

# Story 2.5: NewsCard Component

**Status:** done

## Story

As a retail investor,
I want each news item to show headline, sentiment, AI insight, and stock impacts in a clear visual hierarchy,
So that I can decide in under 10 seconds whether an article is worth reading in full.

## Acceptance Criteria

### AC1 — Loaded card: scan order and full-card click

**Given** a `NewsCard` with fully loaded data
**When** it renders
**Then** scan order top-to-bottom is: headline (15px, 700, espresso) + `SentimentBadge` top-right → `AIInsightBox` → stock impact badges row → khaki divider → footer (source name · relative time · category tag right-aligned)
**And** the card is wrapped in an `<article>` element
**And** the full card surface is a single clickable area navigating to `/news/[id]` — not just the headline text

### AC2 — Stock impact badges: accessibility

**Given** stock impact badges with ticker `PTT` and direction `"positive"`
**When** they render
**Then** the badge shows `▲ PTT` with `▲` in `positive` (#15803d) color
**And** the badge element has `aria-label="PTT: rising"` — the arrow character is not announced by screen readers

### AC3 — Pending state (null analysis)

**Given** a `NewsCard` with `ai_analysis: null`
**When** it renders
**Then** `AIInsightBox` shows the pending state ("Analysis in progress")
**And** the stock impact badges row and `SentimentBadge` are hidden
**And** the card remains fully clickable with headline, source, and timestamp visible

### AC4 — Featured card

**Given** a featured `NewsCard`
**When** it renders
**Then** it has `border-left: 3px solid #B2967D` (camel) applied to the card container

### AC5 — Edge-case data

**Given** `NewsCard` tests covering edge-case data shapes
**When** they run with `null ai_analysis`, empty `affected_stocks`, and a `null source_url`
**Then** the card renders without throwing
**And** a null `source_url` renders the source name as plain text — no broken link element

## Tasks / Subtasks

- [x] Task 1: Update `source_url` type to allow null (AC: 5)
  - [x] 1.1 In `frontend/src/types/index.ts`, change `source_url: string` → `source_url: string | null` on the `NewsItem` interface
  - [x] 1.2 Confirm `tsc --noEmit` still passes — source_url is currently unused in all components so no breakage expected
- [x] Task 2: Rebuild `NewsCard.tsx` (AC: 1, 2, 3, 4, 5)
  - [x] 2.1 Add imports: `Link` from `"next/link"`, `SentimentBadge` from `"./SentimentBadge"`, `AIInsightBox` from `"./AIInsightBox"`; keep `NewsItem` from `"@/types"`; keep `clsx` only if still needed
  - [x] 2.2 Add private `relativeTime(isoString: string): string` helper (same clamped pattern as AIInsightBox — `Math.max(0, ...)`) at module scope; NO import from shared util (only 2 callers so far)
  - [x] 2.3 Keep `CATEGORY_STYLES` lookup table unchanged — same Thai categories, same English labels, same hex colors
  - [x] 2.4 Add `DIRECTION_LABEL` lookup: `{ positive: "rising", negative: "falling", neutral: "unchanged" }`
  - [x] 2.5 Card container: `<article>` with card border/radius/shadow; `featured` → inline `borderLeft: "3px solid #B2967D"` so existing test `toHaveStyle({ borderLeftColor: '#B2967D' })` still passes
  - [x] 2.6 Wrap all card content in `<Link href={`/news/${news.id}`} className="block px-5 py-4">` — full card surface clickable as a single `<a>`; source name in footer stays plain text (no nested `<a>` inside)
  - [x] 2.7 Row 1 (headline + badge): `<div className="flex items-start gap-2 mb-3">` containing `<h2>` (text-[15px] font-bold #4A342A flex-1) + `<SentimentBadge>` (flex-shrink-0; hidden when `ai_analysis === null`)
  - [x] 2.8 `<AIInsightBox analysis={news.ai_analysis} />` (always shown — handles pending internally)
  - [x] 2.9 Stock badges row (hidden when `ai_analysis === null` OR `stock_impacts.length === 0`): each badge gets `aria-label` and arrow wrapped in `<span aria-hidden="true">`; colors use design token hexes
  - [x] 2.10 `<hr style={{ borderColor: "rgba(74,52,42,0.1)" }}>` khaki divider
  - [x] 2.11 Footer row: source name (plain text) · `relativeTime(news.published_at)`; right: category tag pill
  - [x] 2.12 REMOVE the existing summary `<p className="line-clamp-2">` — NOT in the new scan order
  - [x] 2.13 REMOVE the existing inline AI insight div — replaced by `<AIInsightBox>`
  - [x] 2.14 REMOVE the existing top header row (category + source + time) — replaced by the new footer
- [x] Task 3: Update `NewsCard.test.tsx` (AC: 1, 2, 3, 5)
  - [x] 3.1 Add `vi.mock('next/link', ...)` at top — same mock pattern as `Navbar.test.tsx` and `BottomTabBar.test.tsx`
  - [x] 3.2 Update VALID_NEWS fixture: `analysis_at: new Date().toISOString()` (dynamic); `published_at` set 2h ago for "2h ago" test
  - [x] 3.3 Update test → now expects `screen.getByText('Analysis in progress')` (AIInsightBox pending state text)
  - [x] 3.4 Update stock badge tests — new assertion uses `container.querySelector('[aria-label="SPALI: rising"]')` pattern
  - [x] 3.5 Add new test: SentimentBadge is hidden when `ai_analysis: null`
  - [x] 3.6 Add new test: stock badges are hidden when `ai_analysis: null`
  - [x] 3.7 Add new test: stock badge `aria-label` correct for positive / negative / neutral directions
  - [x] 3.8 Add new test: card contains a link to `/news/[id]`
  - [x] 3.9 Add new test: source name renders as plain text when `source_url: null`
  - [x] 3.10 Full test suite: 88/88 pass, 0 regressions (was 83, grew by 5 with new tests)

### Review Findings

- [x] [Review][Patch] DIRECTION_LABEL and DIRECTION_ARROW lack `??` fallback for unknown directions [NewsCard.tsx:35-40] — added `?? "unchanged"` and `?? "–"` to both lookups
- [x] [Review][Patch] Non-null assertion `news.ai_analysis!.sentiment` bypasses TypeScript narrowing [NewsCard.tsx:57] — removed `hasAnalysis` boolean; inlined `news.ai_analysis !== null` checks directly so TypeScript narrows without `!`
- [x] [Review][Defer] `getByRole('link')` test has silent coupling to child component links [NewsCard.test.tsx:118] — deferred, currently no child renders `<a>` but test will throw if SentimentBadge/AIInsightBox ever adds one
- [x] [Review][Defer] `<article>` has no accessible name [NewsCard.tsx] — deferred, pre-existing; ARIA APG recommends distinct labels for repeated article landmarks; WCAG AA does not strictly require it

## Dev Notes

### This story is a REBUILD, not an enhancement

`NewsCard.tsx` currently has a completely different layout (header-first, no footer, inline AI box, no SentimentBadge integration). Every section changes. Do NOT attempt to patch incrementally — read the file fully, then rewrite cleanly.

### Three files to touch

| File | Change type | What changes |
|---|---|---|
| `frontend/src/types/index.ts` | UPDATE | `source_url: string` → `source_url: string | null` |
| `frontend/src/components/NewsCard.tsx` | UPDATE (full rebuild) | Layout, imports, patterns |
| `frontend/src/components/NewsCard.test.tsx` | UPDATE | Mock, fixture, 3 updated tests, 4 new tests |

No new files. Do NOT create a shared `relative-time.ts` utility — only 2 callers at this point, below the 3-caller threshold for extraction.

### Full-card clickable: `<Link>` wraps all content inside `<article>`

```tsx
<article style={{ borderLeft: news.featured ? "3px solid #B2967D" : undefined, ... }}>
  <Link href={`/news/${news.id}`} className="block px-5 py-4">
    {/* all content: headline row, AIInsightBox, badges, divider, footer */}
  </Link>
</article>
```

`<Link>` from `next/link` renders as `<a>` with `display: block`. When `className="block"` is applied, the entire padding area of the link is clickable. Source name in the footer is ALWAYS plain text — never `<a>` — to avoid nested interactive elements.

This lets `NewsCard` remain a **Server Component** (no `"use client"` needed — `<Link>` is usable in Server Components). Do NOT add `"use client"`.

### `source_url` type change and its impact

After changing `source_url: string | null`:
- Nothing breaks — source_url is NOT used in any component today (the current NewsCard doesn't render it as a link)
- The test fixture must still compile: `source_url: 'https://...'` (string → still valid for `string | null`)
- The new test `source_url: null` now type-checks
- `tsc --noEmit` must pass after this change before proceeding

### `relativeTime` private helper — copy the clamped pattern from Story 2.4

```ts
function relativeTime(isoString: string): string {
  const hours = Math.floor(
    Math.max(0, Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60)
  );
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
```

This converts `news.published_at` ISO string to "3h ago" / "2 days ago" for the footer.

### Stock badge colors: design token hexes, NOT Tailwind generic classes

Current code uses `bg-green-50 text-green-700 border-green-200` for positive — **these are wrong** and must be replaced. Use the design system tokens:

| Direction | Text | Background | Border |
|---|---|---|---|
| positive | `#15803d` | `#dcfce7` | `#86efac` |
| negative | `#dc2626` | `#fee2e2` | `#fca5a5` |
| neutral | `#6b6560` | `#f5f5f4` | `#e7e5e4` |

Use inline `style={{...}}` for these (same pattern as SentimentBadge) for test verifiability.

### Stock badge accessibility pattern

```tsx
<span
  aria-label={`${impact.symbol}: ${DIRECTION_LABEL[impact.direction]}`}
  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border"
  style={{ backgroundColor: ..., color: ..., borderColor: ... }}
>
  <span aria-hidden="true">
    {impact.direction === "positive" ? "▲" : impact.direction === "negative" ? "▼" : "–"}
  </span>
  {impact.symbol}
</span>
```

`aria-label` on the badge span overrides the accessible name → screen reader says "PTT: rising" not "▲PTT". Arrow is `aria-hidden`. Symbol is plain text node (no wrapper span needed).

### Pending state: hide SentimentBadge AND stock badges

```tsx
const hasAnalysis = news.ai_analysis !== null;
// ...
{hasAnalysis && <SentimentBadge sentiment={news.ai_analysis!.sentiment} />}
// ...
{hasAnalysis && news.stock_impacts.length > 0 && (
  <div className="flex flex-wrap gap-1.5 mb-3">
    {/* badges */}
  </div>
)}
```

`AIInsightBox` is ALWAYS rendered (handles both pending and loaded states internally). The `hasAnalysis` guard only affects SentimentBadge and the badges row.

Note: `news.ai_analysis!.sentiment` — safe because it's inside `{hasAnalysis && ...}` which guarantees non-null.

### Featured card border: use inline style for test compatibility

The existing test `expect(article).toHaveStyle({ borderLeftColor: '#B2967D' })` checks inline style on the `<article>`. Keep using inline style, not Tailwind arbitrary class:

```tsx
<article
  className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
  style={{
    border: "1px solid rgba(74,52,42,0.1)",
    borderLeft: news.featured ? "3px solid #B2967D" : undefined,
  }}
>
```

When `borderLeft` is set, it overrides `border` on the left side. When undefined (non-featured), the uniform 1px border applies.

### Test: `vi.mock('next/link')` is required

`NewsCard` now imports `<Link>`. Without mocking, Next.js routing context is unavailable in the test environment and tests will fail. Add the standard mock used across the project:

```tsx
vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))
```

Pattern from: `frontend/src/components/Navbar.test.tsx` and `BottomTabBar.test.tsx`.

### Test: stock badge query pattern change

The existing tests use `screen.getByText('SPALI').closest('span')`. With the new badge structure (arrow inside the span + symbol as text node), this approach becomes fragile. Use `container.querySelector('[aria-label="SPALI: rising"]')` for precision:

```tsx
it('positive stock badge has ▲ arrow and aria-label', () => {
  const { container } = render(<NewsCard news={{ ...VALID_NEWS, stock_impacts: [{ symbol: 'SPALI', direction: 'positive', reason: null }] }} />)
  const badge = container.querySelector('[aria-label="SPALI: rising"]') as HTMLElement
  expect(badge).toBeTruthy()
  expect(badge).toHaveTextContent('▲')
  expect(badge).toHaveTextContent('SPALI')
})
```

Replace the old `screen.getByText('SPALI').closest('span')` tests for all three directions.

### Test: VALID_NEWS fixture — dynamic analysis_at prevents stale indicator

The existing fixture has `analysis_at: '2026-06-21T01:30:00Z'` — a hardcoded date. By the time tests run weeks or months from now, this will be >24h old and `AIInsightBox` will render the amber stale indicator, breaking snapshot-style tests.

Update the fixture:
```tsx
const VALID_NEWS: NewsItem = {
  // ...
  ai_analysis: {
    summary: 'สัญญาณบวกที่ชัดเจน',
    affected_sectors: ['อสังหาฯ'],
    affected_stocks: ['SPALI'],
    sentiment: 'bullish',
    analysis_at: new Date().toISOString(), // ← dynamic, always fresh
  },
  // ...
}
```

This matches the same approach used in `AIInsightBox.test.tsx`'s `VALID_ANALYSIS` fixture.

### Test: "Analysis pending" → "Analysis in progress"

The existing test:
```tsx
it('renders "Analysis pending" when ai_analysis is null', () => {
  render(<NewsCard news={{ ...VALID_NEWS, ai_analysis: null }} />)
  expect(screen.getByText('Analysis pending')).toBeInTheDocument()
})
```

Must become:
```tsx
it('AIInsightBox shows pending state when ai_analysis is null', () => {
  render(<NewsCard news={{ ...VALID_NEWS, ai_analysis: null }} />)
  expect(screen.getByText('Analysis in progress')).toBeInTheDocument()
})
```

"Analysis pending" was the OLD inline fallback. The NEW text comes from `AIInsightBox`.

### What NOT to do

- Do NOT add `"use client"` to NewsCard.tsx
- Do NOT use `bg-green-50`, `text-green-700`, `border-green-200` (Tailwind generic) for positive — use `#15803d`/`#dcfce7`/`#86efac`
- Do NOT keep the existing summary `<p className="line-clamp-2">` — the new scan order has no summary
- Do NOT keep the existing top header row (category + source + time) — replaced by footer
- Do NOT keep the existing inline AI box — replaced by `<AIInsightBox>`
- Do NOT render `source_url` as a link inside the card — would create nested `<a>` inside `<Link>`
- Do NOT create a shared `relativeTime` utility — only 2 callers (AIInsightBox + NewsCard), below 3-caller extraction threshold

### Preserved behaviors (do NOT regress)

- `CATEGORY_STYLES` Thai→English label mapping and fallback: `?? { bg: "#f5f5f4", text: "#44403c", label: news.category }` — existing tests check `expect(screen.getByText('RATES'))` and `expect(screen.getByText('อื่นๆ'))` (unknown category fallback)
- `screen.getByRole('article')` — keep `<article>` as the outer element
- Featured card border test: `toHaveStyle({ borderLeftColor: '#B2967D' })` must still pass
- Empty `stock_impacts: []` renders without throwing — guarded by `news.stock_impacts.length > 0`

### Project Structure Notes

- Component: `frontend/src/components/NewsCard.tsx` (UPDATE)
- Test: `frontend/src/components/NewsCard.test.tsx` (UPDATE)
- Types: `frontend/src/types/index.ts` (UPDATE — 1-line change)
- Test run: `cd frontend && npx vitest run`
- Type check: `cd frontend && npx tsc --noEmit`

### References

- `SentimentBadge` implementation: `frontend/src/components/SentimentBadge.tsx` (Story 2.4)
- `AIInsightBox` implementation: `frontend/src/components/AIInsightBox.tsx` (Story 2.4) — note the `Math.max(0, ...)` pattern in relativeTime
- `next/link` mock pattern: `frontend/src/components/Navbar.test.tsx:1-10`
- `AIInsightBox.test.tsx` — `vi.useFakeTimers()` pattern and `container.querySelector('[aria-label="..."]')` pattern
- `DESIGN.md` card anatomy: `_bmad-output/planning-artifacts/ux-designs/ux-ASK-2026-06-20/DESIGN.md#NewsCard`
- Story 2.4 deferred D4 (clock skew): not blocking — NewsCard footer time accuracy within minutes is fine

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Full rebuild of NewsCard.tsx: removed summary paragraph, inline AI box, header row; added Link wrapping, SentimentBadge top-right, AIInsightBox, design-token stock badges with aria-labels, khaki hr divider, footer with relativeTime + category tag
- `source_url: string | null` type change — no breakage, field was unused in card
- clsx dependency removed (no longer needed after rebuild)
- Test count: 88/88 (was 83; +5 new tests: link, source_url null, relative time, SentimentBadge hidden, badges hidden)
- `toHaveStyle({ borderLeftColor: '#B2967D' })` preserved via both `borderLeft` and `borderLeftColor` inline style properties on `<article>`
- `published_at` fixture set to `Date.now() - 2h` so "2h ago" test is deterministic

### File List

- `frontend/src/types/index.ts` (UPDATE)
- `frontend/src/components/NewsCard.tsx` (UPDATE — full rebuild)
- `frontend/src/components/NewsCard.test.tsx` (UPDATE)
