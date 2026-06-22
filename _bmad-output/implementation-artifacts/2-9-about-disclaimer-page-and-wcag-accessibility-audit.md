---
status: done
epic: 2
story: 9
story_key: "2-9-about-disclaimer-page-and-wcag-accessibility-audit"
created: 2026-06-22
baseline_commit: 6d019aaa579d6e76006d914e386be35485066732
---

# Story 2.9: About / Disclaimer Page & WCAG Accessibility Audit

**Status:** done

## Story

As a retail investor,
I want a clear disclaimer page and a fully accessible interface throughout the app,
So that I understand the product's limitations and can use it regardless of my assistive technology.

## Acceptance Criteria

### AC1 — `/about` page with five NFR-C02 sections

**Given** the `/about` page
**When** it renders
**Then** it contains all five required sections:
1. Product description and scope
2. AI analysis limitations
3. Data sources used
4. No investment advice statement
5. Full regulatory disclaimer
**And** the disclaimer in section 5 is a structural part of the component (not a prop, not conditional — FR-A04, NFR-C01)
**And** it is reachable from the Navbar "About" tab (already wired) AND the BottomTabBar

### AC2 — Espresso double-ring focus indicator on every interactive element

**Given** all interactive elements across every page delivered in Epic 2
**When** audited for keyboard focus
**Then** every element shows: `box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #4A342A`
(Tailwind: `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`)
**And** no element uses `camel` at reduced opacity as a focus style

### AC3 — prefers-reduced-motion rule in global stylesheet

**Given** the global stylesheet `globals.css`
**When** reviewed
**Then** it contains exactly:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```
covering card hover transitions, nav tab transitions, and skeleton pulse

### AC4 — Landmark roles on every Epic 2 page

**Given** all pages rendered in Epic 2 (`/`, `/news`, `/news/[id]`, `/news/[id]` 404, `/about`)
**When** audited for landmark roles
**Then** `<header>` (from Navbar), `<nav>` (from Navbar + BottomTabBar), `<main>`, and `<footer>` are present on every page

### AC5 — Disclaimer structural verification

**Given** all AI-analysis-rendering surfaces after Epic 2 is complete
**When** the disclaimer requirement (FR-A04, NFR-C01) is verified
**Then** the disclaimer appears on the News Detail page (`NewsDetailContent.tsx` — already done) and the About page — as a structural part of each component, not a prop, not conditional

---

## Tasks / Subtasks

- [x] Task 1: Update `BottomTabBar.test.tsx` to expect "About" tab instead of "Stocks" — RED (AC: 1)
  - [x] 1.1 Change "renders all 4 tab labels" to expect `About` instead of `Stocks`
  - [x] 1.2 Change "inactive tabs" test to reference `aboutLink` instead of `stocksLink`
  - [x] 1.3 Change Thai sub-labels regex: replace `หุ้น` with `เกี่ยวกับ`
  - [x] 1.4 Change "correct href" test: replace `/stocks` with `/about`

- [x] Task 2: Update `BottomTabBar.tsx` — replace Stocks tab with About tab — GREEN (AC: 1)
  - [x] 2.1 Replace `{ label: "Stocks", sub: "หุ้น", href: "/stocks", icon: <bar-chart-icon> }` with `{ label: "About", sub: "เกี่ยวกับ", href: "/about", icon: <info-circle-icon> }`
  - [x] 2.2 Use the same information-circle SVG as `DailyBriefPlaceholder` header: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>`
  - [x] 2.3 Run BottomTabBar tests — confirm all 6 pass

- [x] Task 3: Add `prefers-reduced-motion` rule to `globals.css` (AC: 3)
  - [x] 3.1 Append after existing animations in `globals.css`:
    ```css
    @media (prefers-reduced-motion: reduce) {
      * {
        transition-duration: 0.01ms !important;
      }
    }
    ```
  - [x] 3.2 NOTE: `.AIInsightBox` animated dot already uses `motion-safe:animate-pulse` (Tailwind) — no change needed for it

- [x] Task 4: Fix focus ring on `CategoryFilterBar.tsx` buttons (AC: 2)
  - [x] 4.1 Add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]` to the `<button>` className in `CategoryFilterBar.tsx`

- [x] Task 5: Fix focus ring on `NewsFeed.tsx` search input (AC: 2)
  - [x] 5.1 Replace `focus-visible:ring-2 focus-visible:ring-[#4A342A] focus-visible:ring-offset-2` with `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`

- [x] Task 6: Add focus ring to `NewsCard.tsx` Link (AC: 2)
  - [x] 6.1 Add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A] rounded-xl` to the `<Link>` className in NewsCard

- [x] Task 7: Add focus ring to remaining page-level links (AC: 2)
  - [x] 7.1 `app/page.tsx` "View All →" `<a>` link — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`
  - [x] 7.2 `app/news/[id]/page.tsx` breadcrumb `<Link>` — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A] rounded`
  - [x] 7.3 `app/news/[id]/not-found.tsx` back `<Link>` — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`

- [x] Task 8: Add `<footer>` and `<Navbar />` where missing for landmark completeness (AC: 4)
  - [x] 8.1 `app/news/[id]/page.tsx` — add `<footer>` (same design as home page and news page footer) after `<main>`
  - [x] 8.2 `app/news/[id]/not-found.tsx` — add `<Navbar />` import + render before `<main>`, add `<footer>` after `<main>`

- [x] Task 9: Create `app/about/page.tsx` — static Server Component (AC: 1, 4, 5)
  - [x] 9.1 Render `<Navbar />` (header landmark)
  - [x] 9.2 Page header bar with "About ASK · เกี่ยวกับ" heading (linen bg, consistent with other pages)
  - [x] 9.3 `<main id="main-content">` with five sections (numbered headings `<h2>`)
  - [x] 9.4 Section 1 — Product Description: what ASK is, who it's for, what it does
  - [x] 9.5 Section 2 — AI Analysis Limitations: accuracy, delay, historical training, no price predictions
  - [x] 9.6 Section 3 — Data Sources: public news sources, market data from public exchanges, AI via LLM
  - [x] 9.7 Section 4 — No Investment Advice: explicit statement, recommend consulting qualified financial advisors
  - [x] 9.8 Section 5 — Full Regulatory Disclaimer: not authorized by financial regulators, non-removable structural text (FR-A04)
  - [x] 9.9 `<footer>` (consistent with other pages)

- [x] Task 10: Run full test suite and TypeScript check (AC: all)
  - [x] 10.1 `npx vitest run` → 123/123 tests GREEN; BottomTabBar still 6 tests
  - [x] 10.2 `npx tsc --noEmit` → zero errors

---

## Dev Notes

### BottomTabBar Change: Stocks → About

The current `BottomTabBar.tsx` has a "Stocks" tab (href="/stocks") that doesn't align with the Navbar. Navbar has: Home, News, Trends, **About**. BottomTabBar has: Overview, News, Stocks, Trends — missing About.

Replace the Stocks tab with About:
```tsx
// REMOVE:
{
  label: "Stocks",
  sub: "หุ้น",
  href: "/stocks",
  icon: <svg ...bar-chart... />,
}

// ADD:
{
  label: "About",
  sub: "เกี่ยวกับ",
  href: "/about",
  icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
}
```

The 4-tab layout (Overview, News, Trends, About) now mirrors the Navbar (Home, News, Trends, About). Stocks is not a feature in Epic 2.

### BottomTabBar.test.tsx — All Lines That Change

This is a MANDATORY update — the existing tests reference "Stocks" and "/stocks" and `หุ้น`. All four must change:

```tsx
// Line 21: change Stocks → About
expect(screen.getByText('About')).toBeInTheDocument()

// Line 35-36: change stocksLink → aboutLink
const aboutLink = screen.getByText('About').closest('a')
expect(aboutLink).toHaveStyle({ color: 'rgba(255,255,255,0.45)' })

// Line 43: change Thai regex pattern
const thaiLabels = screen.getAllByText(/ภาพรวม|ข่าว|เกี่ยวกับ|แนวโน้ม/)

// Line 53: change href
expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about')
```

Run `npx vitest run src/components/BottomTabBar.test.tsx` after Task 1 to confirm RED, then again after Task 2 to confirm GREEN.

### Focus Ring Rule — Apply Everywhere

Every interactive element needs exactly:
```
focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]
```

Elements that ALREADY have it correctly (do NOT touch):
- `layout.tsx` skip-to-content link ✅
- `Navbar.tsx` logo link ✅
- `Navbar.tsx` nav links ✅
- `BottomTabBar.tsx` tab links ✅

Elements that NEED the focus ring (by file):
- `CategoryFilterBar.tsx:58` — `<button>` — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`
- `NewsFeed.tsx:42` — `<input>` — REPLACE `focus-visible:ring-2 focus-visible:ring-[#4A342A] focus-visible:ring-offset-2` with `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`
- `NewsCard.tsx:55` — `<Link className="block px-5 py-4">` — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A] rounded-xl`
- `app/page.tsx` — `<a href="/news">View All →</a>` — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`
- `app/news/[id]/page.tsx` — breadcrumb `<Link href="/news">` — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A] rounded`
- `app/news/[id]/not-found.tsx` — back `<Link href="/news">` — add `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`

Note on light vs dark backgrounds: The white inner ring (`0 0 0 2px #ffffff`) is invisible on linen/white backgrounds. This is intentional per spec — the espresso outer ring alone is still a clear focus indicator. Do NOT change the shadow value for light-background elements.

### Footer HTML — Copy Exactly

Every page that needs a footer should use this exact JSX:
```tsx
<footer
  className="border-t mt-8 px-6 py-5 flex items-center justify-between text-xs"
  style={{
    backgroundColor: "#4A342A",
    borderColor: "rgba(215,201,184,0.1)",
    color: "rgba(215,201,184,0.4)",
  }}
>
  <div className="flex items-center gap-2">
    <span className="font-bold text-sm" style={{ color: "#D7C9B8" }}>ASK</span>
    <span>·</span>
    <span>AI Financial Research Assistant</span>
  </div>
  <div>For educational purposes only. Not investment advice.</div>
</footer>
```

Pages that already have this footer (do NOT add again): `app/page.tsx` ✅, `app/news/page.tsx` ✅

Pages that NEED the footer added: `app/news/[id]/page.tsx` ❌, `app/news/[id]/not-found.tsx` ❌, `app/about/page.tsx` ❌ (new page)

### not-found.tsx — Add Navbar + Footer

Current state (bare `<main>` only):
```tsx
export default function NotFound() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 ...>Article not found.</h1>
      <Link href="/news" ...>← Back to News</Link>
    </main>
  );
}
```

After Task 8.2:
```tsx
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold mb-4" style={{ color: "#4A342A" }}>
          Article not found.
        </h1>
        <Link
          href="/news"
          className="text-sm font-medium hover:underline focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]"
          style={{ color: "#B2967D" }}
        >
          ← Back to News
        </Link>
      </main>
      <footer ... />
    </>
  );
}
```

### About Page — Content and Structure

The `/about` page is a pure static Server Component. No API calls. No Suspense. No `"use client"`.

Five sections mapped to NFR-C02:

**Section 1 — Product Description and Scope**
- ASK (Aware Signals & Knowledge) is an AI-powered financial research assistant for Thai retail investors
- Aggregates financial news, provides AI-generated analysis of market impact
- Designed to help users understand why market events matter, not to tell them what to trade
- Does not provide portfolio management, trade execution, or personalized advice

**Section 2 — AI Analysis Limitations**
- AI analysis is generated automatically using large language models trained on historical data
- Analysis may contain errors, omissions, or inaccuracies
- Content is based on publicly available information and may not reflect real-time conditions
- AI cannot predict future market movements or guarantee any outcome
- Analysis should be used to form questions, not investment decisions

**Section 3 — Data Sources**
- News content aggregated from publicly available Thai and international financial news sources
- Market data sourced from publicly available exchange feeds
- AI analysis generated via large language models (GPT-4o)
- Data may be delayed and is not guaranteed to be complete or accurate

**Section 4 — No Investment Advice**
- ASK is for educational and informational purposes only
- Nothing on this platform constitutes investment advice, a recommendation, or solicitation to buy or sell any security
- Users should consult a qualified, licensed financial advisor before making any investment decision
- Past analysis or market commentary does not predict future results

**Section 5 — Full Regulatory Disclaimer (non-removable, FR-A04)**
- ASK is not licensed, authorized, registered, or regulated by any financial regulatory authority in Thailand or elsewhere
- The developers and operators of ASK are not responsible for any investment decisions made based on content from this platform
- Non-removable disclaimer text (hardcoded structural JSX): "AI-generated analysis is for informational purposes only and does not constitute investment advice. Always consult a qualified financial advisor before making investment decisions."

### Page Header Bar Pattern

The page header bar (espresso background with title) should match the pattern from other pages:
```tsx
<div
  className="border-b px-6 py-3"
  style={{ backgroundColor: "#F5F1EA", borderColor: "rgba(74,52,42,0.1)" }}
>
  <h1 className="text-base font-bold" style={{ color: "#4A342A" }}>
    About ASK{" "}
    <span className="font-normal text-sm ml-1" style={{ color: "#B2967D" }}>
      เกี่ยวกับ
    </span>
  </h1>
</div>
```

### About Page Section Styling

Use a clean single-column layout within `<main id="main-content" className="max-w-3xl mx-auto px-4 py-8">`:

Each section:
```tsx
<section className="mb-8">
  <h2 className="text-base font-bold mb-3" style={{ color: "#4A342A" }}>
    1. Product Description and Scope
  </h2>
  <div className="space-y-2 text-sm leading-relaxed" style={{ color: "#6b6560" }}>
    <p>...</p>
  </div>
</section>
```

Section 5 disclaimer container must be structurally distinct — use an `<aside>` or a styled `<div>` with the espresso border pattern:
```tsx
<section className="mb-8">
  <h2 className="text-base font-bold mb-3" style={{ color: "#4A342A" }}>
    5. Full Regulatory Disclaimer
  </h2>
  <div className="rounded-lg p-4 text-sm leading-relaxed"
    style={{ backgroundColor: "#F5F1EA", borderLeft: "2px solid #B2967D", color: "#6b6560" }}>
    <p>ASK is not licensed, authorized, registered, or regulated by any financial regulatory authority...</p>
    <p className="mt-3 font-medium" style={{ color: "#4A342A" }}>
      AI-generated analysis is for informational purposes only and does not constitute investment advice.
      Always consult a qualified financial advisor before making investment decisions.
    </p>
  </div>
</section>
```

### What NOT to Do

- Do NOT add API calls or Suspense to the About page — it is fully static
- Do NOT add `"use client"` to the About page
- Do NOT add a test file for `about/page.tsx` — static Server Component pages are not tested in this project
- Do NOT change the Navbar (About tab already wired to href="/about") 
- Do NOT modify `AIInsightBox.tsx` — `motion-safe:animate-pulse` already handles prefers-reduced-motion for the dot
- Do NOT change the focus ring in `NewsFeed.tsx` for the surrounding `<div>` container — only the `<input>` element
- Do NOT use `"use client"` in `not-found.tsx` just because it now includes `<Navbar />` — Navbar is a client component but can be imported in a Server Component; Next.js renders it correctly

### Pattern Reference: Previous Story Files

The footer HTML, focus ring pattern, and page header bar pattern have all been established across Stories 2.6, 2.7, and 2.8. Read those pages if any uncertainty arises:
- `app/news/page.tsx` — footer + page header bar reference
- `Navbar.tsx` — focus ring on `<Link>` reference
- `BottomTabBar.tsx` — correct tab structure reference

---

## Dev Agent Record

### Completion Notes

- 1 new file, 8 files modified
- 0 new tests added (BottomTabBar tests updated: 4 assertions changed, count stays at 6; no other test additions needed per story spec)
- 123/123 total tests pass — zero regressions
- `npx tsc --noEmit` — zero errors
- AC1: `/about` page with 5 NFR-C02 sections; reachable from Navbar (pre-wired) and BottomTabBar (Stocks→About replacement) ✅
- AC2: Espresso double-ring `shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]` added to: CategoryFilterBar buttons, NewsFeed search input, NewsCard Link, `page.tsx` "View All →" anchor, `news/[id]/page.tsx` breadcrumb Link, `not-found.tsx` back Link ✅
- AC3: `globals.css` `@media (prefers-reduced-motion: reduce)` rule added; AIInsightBox dot already covered by `motion-safe:animate-pulse` ✅
- AC4: `app/news/[id]/page.tsx` and `not-found.tsx` now have `<header>` (Navbar), `<nav>` (Navbar + BottomTabBar from layout), `<main>`, `<footer>` ✅; `/about` page has all four ✅
- AC5: About page section 5 has non-removable structural disclaimer text matching FR-A04 canonical string; News Detail page disclaimer pre-existing in `NewsDetailContent.tsx` ✅
- Pre-existing stub `app/about/page.tsx` found and overwritten with full implementation

### Review Findings

- [x] [Review][Patch] AC2 violation — `NewsDetailContent.tsx:66` source URL `<a>` link missing espresso focus ring [`frontend/src/components/NewsDetailContent.tsx:66`] — fixed: added `focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]` to the source link className
- [x] [Review][Patch] NewsCard focus ring clipped by article `overflow: hidden` [`frontend/src/components/NewsCard.tsx:47`] — fixed: moved ring to `<article>` via `focus-within:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]`; `<Link>` keeps only `focus:outline-none`
- [x] [Review][Defer] `prefers-reduced-motion` rule doesn't suppress CSS `animation:` properties [`frontend/src/app/globals.css`] — deferred; `transition-duration: 0.01ms` only affects `transition:`, not `animation:`; `.ticker-animate`, `.live-dot`, and `animate-pulse` remain active at full speed for motion-sensitive users; AC3 spec text claims coverage of "skeleton pulse" but is technically inaccurate; implementation faithfully follows the spec text; fix requires adding `animation-duration` and `animation-iteration-count` to the media query
- [x] [Review][Defer] Footer JSX duplicated 5× across pages without a shared component — deferred; pre-existing pattern in `app/page.tsx` + `app/news/page.tsx` before this story; this diff adds 3 more; extract to `<PageFooter />` in a future cleanup story

---

## File List

**New files:**
- `frontend/src/app/about/page.tsx`

**Modified files:**
- `frontend/src/components/BottomTabBar.tsx`
- `frontend/src/components/BottomTabBar.test.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/components/CategoryFilterBar.tsx`
- `frontend/src/components/NewsFeed.tsx`
- `frontend/src/components/NewsCard.tsx`
- `frontend/src/components/NewsDetailContent.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/news/[id]/page.tsx`
- `frontend/src/app/news/[id]/not-found.tsx`
