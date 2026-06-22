---
status: done
epic: 4
story: 2
story_key: "4-2-dailybriefcard-component"
created: 2026-06-22
baseline_commit: 74228033a947371c189940c2f8ae1fe56b21b1cd
---

# Story 4.2: DailyBriefCard Component

**Status:** done

## Story

As a retail investor,
I want a two-zone Daily Brief card that gives me the market overview and key developments at a glance,
So that I understand the day's market narrative in under 30 seconds before reading individual articles.

## Acceptance Criteria

### AC1 — Zone 1 (espresso header) — normal state

**Given** `DailyBriefCard` receives a `DailyBrief` with `is_fallback: false`
**When** it renders
**Then** Zone 1 (espresso header) shows:
- "AI Daily Brief" title (text-sm, font-bold, text-white)
- "ภาพรวมตลาด" subtitle with `aria-hidden="true"` (never read aloud — Thai speakers know what it means from context)
- `SentimentBadge` rendered with `overall_sentiment`
- `brief_date` formatted as Bangkok date (e.g. "22 Jun 2026")

### AC2 — Zone 2 (white body) — normal state

**Given** `DailyBriefCard` receives a `DailyBrief` with `is_fallback: false`
**When** Zone 2 renders
**Then** it shows:
- A one-sentence overview derived from `overall_sentiment` (see Dev Notes: SENTIMENT_OVERVIEW map)
- A numbered list of all `key_developments` items (same numbered-pill style as AISummaryCard)
- Footer with `generated_at` timestamp formatted in Bangkok timezone (e.g. "07:05 BKK")
- Inline disclaimer (FR-D05): *"AI-generated market summary for informational purposes only. Not investment advice."* in `10px`, `neutral-text` (`#6b6560`)

### AC3 — Disclaimer is static and non-suppressible (FR-D05)

**Given** the inline disclaimer in Zone 2
**When** a developer inspects the component
**Then** the disclaimer is rendered as plain static text — not a `<Link>`, not a prop, not behind a conditional
**And** the disclaimer is present whenever Zone 2 renders — it cannot be hidden or removed

### AC4 — Fallback state (`is_fallback: true`)

**Given** `DailyBriefCard` receives a `DailyBrief` with `is_fallback: true`
**When** it renders
**Then** Zone 1 shows yesterday's date + a "Today's brief is being prepared" indicator below the title
**And** Zone 2 shows yesterday's brief content with a label "(From yesterday)" next to the footer timestamp
**And** the disclaimer is still present
**And** the card renders without error or empty state — the experience feels unhurried, not broken (FR-D03)

### AC5 — Skeleton loading state

**Given** the brief data is loading inside a `<Suspense>` boundary
**When** the skeleton renders
**Then** Zone 1 shows `animate-pulse linen` skeleton blocks (espresso background)
**And** Zone 2 shows `animate-pulse linen` skeleton blocks
**And** there is no spinner, no blank white area, no loading text

### AC6 — Error state

**Given** `GET /daily-brief` returns an error
**When** `DailyBriefCardError` renders
**Then** it shows: "Daily Brief unavailable · Last attempted [HH:MM]" in Bangkok time
**And** it uses the two-zone card shell — never an empty or silent card

### AC7 — Component tests cover all states

**Given** component tests for `DailyBriefCard`
**When** they run
**Then** normal, fallback, loading (skeleton), and error states each render correctly without throwing
**And** a test asserts the disclaimer text is present for both normal and fallback states
**And** a test asserts the skeleton has no spinner
**And** all 123 existing tests continue to pass (zero regressions)

---

## Dev Notes

### Critical Architecture Constraints

**This story is frontend-only.** No backend changes. No schema changes.

**Files to create (NEW):**
- `frontend/src/components/DailyBriefCard.tsx` — main component + 2 named exports (`DailyBriefCardSkeleton`, `DailyBriefCardError`)
- `frontend/src/components/DailyBriefCard.test.tsx`

**Files to update (NONE in this story).**  
Story 4.4 wires `DailyBriefCard` into the Home Page layout. This story delivers the component only.

---

### Key Design Tokens (from DESIGN.md + tailwind.config.ts)

All tokens are already in `frontend/tailwind.config.ts`:

| Token | Value | Use |
|---|---|---|
| `espresso` | `#4A342A` | Zone 1 background |
| `khaki` | `#D7C9B8` | Zone 1 border, muted text |
| `linen` | `#F5F1EA` | Skeleton blocks, numbered pill bg |
| `camel` | `#B2967D` | Numbered pill text, footer accent |
| `cocoa` | `#7D5A44` | Body text |
| `neutral-text` | `#6b6560` | Disclaimer text |
| `neutral-bg` | `#f5f5f4` | (not used in this card) |

Card border: `1px solid rgba(74,52,42,0.1)` — same as `NewsCard` and `AISummaryCard`
Card border-radius: `rounded-xl` (12px — consistent with all content cards)

---

### Existing Component Patterns — Read Before Implementing

**`AISummaryCard.tsx`** is the closest structural ancestor. It uses the same two-zone layout (espresso header / white body), the same numbered-pill style for key points, and the same card chrome. **Do not reinvent this.** Match the established visual patterns exactly.

Key patterns from `AISummaryCard.tsx`:
```tsx
// Numbered pill (copy this style exactly):
<span className="text-xs font-bold mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center"
  style={{ backgroundColor: "#F5F1EA", color: "#B2967D" }}>{i + 1}</span>
<p className="text-xs leading-relaxed" style={{ color: "#78716c" }}>{pt}</p>

// Footer divider (copy this style exactly):
<div className="flex items-center justify-between pt-3 border-t text-xs"
  style={{ borderColor: "rgba(74,52,42,0.08)" }}>
```

**`SkeletonCard.tsx`** is the reference for skeleton pattern: `animate-pulse`, `bg-linen`, rounded height divs.

**`SentimentBadge.tsx`** — import and use directly. No changes needed.

**`DailyBriefPlaceholder.tsx`** — this was a placeholder used before Story 4.1 existed. The new `DailyBriefCardSkeleton` replaces it as the loading state. **Do not modify or delete `DailyBriefPlaceholder.tsx`** — it has its own passing tests and the home page currently uses it. Story 4.4 will swap it out.

---

### Data Shape — From Story 4.1 (`frontend/src/types/index.ts`)

```typescript
export interface DailyBrief {
  overall_sentiment: "bullish" | "bearish" | "neutral";
  key_developments: string[];
  opportunities: string[];   // NOT displayed in this card per DESIGN.md
  risks: string[];           // NOT displayed in this card per DESIGN.md
  generated_at: string;      // ISO 8601 UTC string — convert to Bangkok time for display
  brief_date: string;        // ISO date string e.g. "2026-06-22"
  is_fallback: boolean;
}
```

`opportunities` and `risks` are in the schema for the webhook pipeline (Story 4.3) but **not displayed** in the DailyBriefCard per DESIGN.md Zone 2 spec.

`api.getDailyBrief()` is already wired in `frontend/src/lib/api.ts` — Story 4.1 added it.

---

### SENTIMENT_OVERVIEW Map (derive Zone 2 opening sentence from `overall_sentiment`)

The `DailyBrief` schema has no `overview: string` field. DESIGN.md says Zone 2 opens with an "overview sentence." Derive it from `overall_sentiment` using a static lookup:

```typescript
const SENTIMENT_OVERVIEW: Record<string, string> = {
  bullish:  "Markets are showing bullish momentum today.",
  bearish:  "Markets are facing bearish pressure today.",
  neutral:  "Markets are showing neutral momentum today.",
};
```

Display this sentence in `text-sm leading-relaxed` with color `cocoa` (`#7D5A44`), matching `AISummaryCard.tsx`'s overview paragraph.

---

### Bangkok Date and Time Formatting

**`brief_date`** (ISO date string `"2026-06-22"`) → display as `"22 Jun 2026"`:
```typescript
function formatBkkDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
```
This uses the local Date constructor (no timezone offset issue since we're constructing from components directly).

**`generated_at`** (UTC ISO string) → display as `"07:05 BKK"`:
```typescript
function formatBkkTime(isoString: string): string {
  const time = new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok",
  });
  return `${time} BKK`;
}
```

---

### Zone 1 Layout — Exact Structure

```
┌─────────────────────────────────────────────────────────┐  espresso bg (#4A342A)
│  [AI icon 14×14, khaki stroke]    AI Daily Brief        │
│                                   ภาพรวมตลาด (aria-hidden)│
│                                   [SentimentBadge]       │
│                                   "22 Jun 2026"          │
└─────────────────────────────────────────────────────────┘
```

- Reuse the icon container pattern from `AISummaryCard.tsx` / `DailyBriefPlaceholder.tsx` (7×7 rounded div, khaki bg at 20% opacity, 14×14 SVG with khaki stroke)
- Title: `text-sm font-bold text-white`
- Thai subtitle: `text-xs`, color `rgba(215,201,184,0.5)`, `aria-hidden="true"`
- `brief_date` display: `text-xs`, color `rgba(215,201,184,0.7)` — muted but visible

**Fallback variant of Zone 1** (`is_fallback: true`):
- Same structure, but below the title row, add: `"Today's brief is being prepared"` in `text-xs`, `rgba(215,201,184,0.5)` — same style as `DailyBriefPlaceholder.tsx` subtitle
- Date shows yesterday's date (already in `brief_date` since it's yesterday's data)

---

### Zone 2 Layout — Exact Structure

```
┌─────────────────────────────────────────────────────────┐  white bg
│  Overview sentence (cocoa, text-sm)                     │
│                                                         │
│  1  Key development one (camel pill + cocoa text)       │
│  2  Key development two                                 │
│  3  Key development three                               │
│  ─────────────────────────────────── (divider)          │
│  Footer: "07:05 BKK · Today"                           │
│  [Disclaimer text 10px neutral-text]                    │
└─────────────────────────────────────────────────────────┘
```

**Fallback variant of Zone 2** — same structure but footer shows `"07:05 BKK · From yesterday"` instead of `"· Today"`.

---

### Skeleton (`DailyBriefCardSkeleton`) — Named Export

```tsx
// Zone 1: espresso bg + 2 animate-pulse linen blocks (title + subtitle skeleton)
// Zone 2: white bg + 3–4 animate-pulse linen blocks (text lines) + shorter footer block
```

Pattern to follow: `SkeletonCard.tsx` for the `animate-pulse` + `bg-linen` + `rounded` height blocks. The skeleton should look like a plausible content shape — two header lines in Zone 1 (wide + narrow), three paragraph lines + a footer line in Zone 2.

The skeleton needs `role="status"` and `aria-label="Loading daily brief"` for screen readers.

---

### Error State (`DailyBriefCardError`) — Named Export

```tsx
export function DailyBriefCardError() {
  const attempted = formatBkkTime(new Date().toISOString());
  return (
    // same card chrome (border, rounded-xl)
    // Zone 1: espresso bg, "AI Daily Brief" title, "ภาพรวมตลาด" subtitle (aria-hidden)
    // Zone 2: white bg
    //   "Daily Brief unavailable · Last attempted {attempted}"
    //   neutral-text, text-sm
  );
}
```

Zone 1 in the error state does NOT show a SentimentBadge (no data). It shows the title and Thai subtitle only. This keeps the card recognizable while signaling something is wrong through Zone 2 content.

---

### Component File Structure

```typescript
// frontend/src/components/DailyBriefCard.tsx

import { DailyBrief } from "@/types";
import SentimentBadge from "./SentimentBadge";

// (helpers: formatBkkDate, formatBkkTime, SENTIMENT_OVERVIEW)

// Default export: main data-driven component
export default function DailyBriefCard({ brief }: { brief: DailyBrief }) { ... }

// Named exports for loading/error states
export function DailyBriefCardSkeleton() { ... }
export function DailyBriefCardError() { ... }
```

---

### Test File Structure (`DailyBriefCard.test.tsx`)

Test framework: **Vitest + @testing-library/react** (already set up — `vitest.config.ts`, `src/test/setup.ts`)  
Run command: `cd /Users/suthidakhrueanak/project/AlphaBrief/frontend && npx vitest run`

Import pattern (see `AISummaryCard.test.tsx`):
```typescript
import { render, screen } from "@testing-library/react";
import DailyBriefCard, { DailyBriefCardSkeleton, DailyBriefCardError } from "./DailyBriefCard";
import { DailyBrief } from "@/types";
```

No mocks needed — this component has no `next/link`, no router, no async calls. Pure display component.

**VALID_BRIEF fixture:**
```typescript
const VALID_BRIEF: DailyBrief = {
  overall_sentiment: "bullish",
  key_developments: [
    "SET Index rose 0.8% on strong banking sector",
    "SCB reported Q2 profit above estimates",
    "Oil prices stabilized overnight",
  ],
  opportunities: ["Banking sector shows momentum"],
  risks: ["Global rate uncertainty remains"],
  generated_at: "2026-06-22T00:05:00Z",   // 07:05 Bangkok
  brief_date: "2026-06-22",
  is_fallback: false,
};

const FALLBACK_BRIEF: DailyBrief = {
  ...VALID_BRIEF,
  brief_date: "2026-06-21",
  is_fallback: true,
};
```

**Required test cases** (BDD — note all tests in one `describe("DailyBriefCard", ...)` block):

| # | State | Assertion |
|---|---|---|
| 1 | normal | renders without throwing |
| 2 | normal | "AI Daily Brief" heading is in the document |
| 3 | normal | shows a SentimentBadge (grep for "BULLISH" label) |
| 4 | normal | renders all key_developments items |
| 5 | normal | renders inline disclaimer text |
| 6 | fallback | renders without throwing |
| 7 | fallback | "Today's brief is being prepared" is in the document |
| 8 | fallback | disclaimer is still present |
| 9 | skeleton | renders without throwing |
| 10 | skeleton | no spinner present (queryByRole("img", {name: /spin/i}) is null) |
| 11 | skeleton | has `role="status"` |
| 12 | error | renders without throwing |
| 13 | error | "Daily Brief unavailable" text is in the document |

Disclaimer text to assert: `"AI-generated market summary for informational purposes only. Not investment advice."`

---

### Previous Story Intelligence (from Story 4.1)

- `DailyBrief` TypeScript type is already in `frontend/src/types/index.ts` (lines 82–90)
- `api.getDailyBrief()` is already in `frontend/src/lib/api.ts` (line 31)
- Schema has no `alias=` fields — `brief_date` and `generated_at` are already snake_case
- `is_fallback` is computed at the API endpoint and passed directly in the response

**Code review patterns from Story 4.1 (apply here too):**
- Import types at module level, not inside functions (caused a `NameError` in Python — same discipline applies to TS: no lazy imports)
- Test fixtures: define `VALID_BRIEF` once at the top, derive variants with spread (`{ ...VALID_BRIEF, is_fallback: true }`) — do not repeat full fixture

---

### Test Runner Baseline

Before implementing, confirm the current baseline:
```bash
cd /Users/suthidakhrueanak/project/AlphaBrief/frontend && npx vitest run
# Expected: 17 test files, 123 tests, 0 failures
```

After implementation, the expected count increases by 13 (one describe block, 13 tests).

---

### Common Mistakes to Avoid

1. **Do NOT display `opportunities` or `risks` fields** — they are not shown in the card per DESIGN.md
2. **Do NOT make the disclaimer a `<Link>`** — it must be plain `<p>` text (FR-D05)
3. **Do NOT add a `disclaimer` prop** — it is hardcoded static text, always present
4. **Do NOT modify `DailyBriefPlaceholder.tsx`** — it has passing tests and is still used by the home page until Story 4.4
5. **Do NOT change `DailyBrief` schema** in `types/index.ts` — it's locked from Story 4.1
6. **Zone 1 espresso background**: use `style={{ backgroundColor: "#4A342A" }}` — do NOT use `bg-espresso` class (tailwind JIT may not pick it up in the component; use inline style as in `AISummaryCard.tsx` and `DailyBriefPlaceholder.tsx`)
7. **Card border**: `style={{ border: "1px solid rgba(74,52,42,0.1)" }}` inline — same as `NewsCard.tsx` pattern
8. **`aria-hidden="true"` on ภาพรวมตลาด** — required per AC1; screen readers must skip it

---

## Tasks / Subtasks

- [x] Task 1: Create `frontend/src/components/DailyBriefCard.tsx`
  - [x] 1a: Zone 1 (espresso header) — normal state with icon, title, Thai subtitle (aria-hidden), SentimentBadge, formatted date
  - [x] 1b: Zone 2 (white body) — SENTIMENT_OVERVIEW sentence, numbered key_developments, footer, FR-D05 disclaimer
  - [x] 1c: Fallback variant — Zone 1 adds "Today's brief is being prepared" indicator; Zone 2 footer adds "(From yesterday)"
  - [x] 1d: `DailyBriefCardSkeleton` named export — animate-pulse linen blocks, Zone 1 + Zone 2, role="status"
  - [x] 1e: `DailyBriefCardError` named export — two-zone shell, "Daily Brief unavailable · Last attempted [time]" in Zone 2

- [x] Task 2: Create `frontend/src/components/DailyBriefCard.test.tsx`
  - [x] 2a: `VALID_BRIEF` and `FALLBACK_BRIEF` fixtures
  - [x] 2b: Normal state tests (5 tests: render, heading, badge, key_developments, disclaimer)
  - [x] 2c: Fallback state tests (3 tests: render, "being prepared" text, disclaimer still present)
  - [x] 2d: Skeleton tests (3 tests: render, no spinner, role="status")
  - [x] 2e: Error state tests (2 tests: render, "unavailable" text)

- [x] Task 3: Run full test suite and confirm zero regressions
  - [x] All 123 existing tests still pass
  - [x] 13 new tests pass
  - [x] Total: 136 tests, 0 failures

### Review Findings

- [x] [Review][Defer] `DailyBriefCardError` timestamp may appear stale under ISR caching [frontend/src/components/DailyBriefCard.tsx:162] — deferred; Story 4.4 concern

---

## Dev Agent Record

### Implementation Plan

1. Wrote test file first (RED) — 13 tests covering 4 states (normal, fallback, skeleton, error)
2. Confirmed tests fail with "module not found" before component existed
3. Implemented `DailyBriefCard.tsx` with default export + 2 named exports (`DailyBriefCardSkeleton`, `DailyBriefCardError`)
4. Component uses `SENTIMENT_OVERVIEW` map to derive overview sentence from `overall_sentiment` (no `overview` field in schema)
5. Ran new tests — 13/13 passed (GREEN)
6. Ran full suite — 136/136 passed (zero regressions)

### Debug Log

No issues. Clean implementation. `DailyBriefPlaceholder.tsx` untouched as specified.

### Completion Notes

- `DailyBriefCard.tsx`: default export handles `is_fallback` branching inline; no separate fallback component needed
- `DailyBriefCardSkeleton`: `role="status"` + `aria-label="Loading daily brief"`, animate-pulse blocks in both zones
- `DailyBriefCardError`: calls `formatBkkTime(new Date().toISOString())` to show attempted time
- Disclaimer hardcoded as `<p>` with `fontSize: "10px"` and `color: "#6b6560"` — never a link, never a prop (FR-D05)
- `aria-hidden="true"` on ภาพรวมตลาด subtitle as required by AC1
- Inline style hex values match existing components (AISummaryCard, DailyBriefPlaceholder patterns)

---

## File List

### New Files
- `frontend/src/components/DailyBriefCard.tsx`
- `frontend/src/components/DailyBriefCard.test.tsx`

### Modified Files
_(none)_

---

## Change Log

| Date | Change |
|------|--------|
| 2026-06-22 | Story created |
| 2026-06-22 | Implementation complete — DailyBriefCard.tsx (default + 2 named exports), DailyBriefCard.test.tsx (13 tests); 136/136 tests passing |
