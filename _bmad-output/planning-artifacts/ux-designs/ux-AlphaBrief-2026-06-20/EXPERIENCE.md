---
name: AlphaBrief Experience Design
status: final
created: 2026-06-20
updated: 2026-06-20
design_reference: DESIGN.md
sources:
  - _bmad-output/planning-artifacts/prds/prd-AlphaBrief-2026-06-20/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/project-context.md
---

## Foundation

**Form factor:** Desktop-primary responsive web application. Mobile-responsive via Tailwind breakpoints; `lg:` is the primary desktop breakpoint. No native app in MVP.

**UI system:** Tailwind CSS v3.4.17 + custom design tokens in `tailwind.config.ts`. No component library (shadcn, MUI, etc.) — components are hand-built. Visual identity is fully specified in `DESIGN.md`; this document covers behavior only.

**Rendering:** Next.js 15 App Router. Server Components by default. ISR with 60s revalidate on all feed endpoints. Real-time endpoints (`force-dynamic`) documented explicitly as exceptions.

**Language:** English primary, Thai subtitles in navigation and section headers.

**Composition references:** `.working/keyscreen-home-1.html` (home page layout and sidebar composition), `.working/card-hierarchy-1.html` (NewsCard anatomy and hierarchy), `.working/color-themes-1.html` (color palette exploration). Spines win on any conflict with these files. All body copy, headlines, AI analysis, and UI labels in English for MVP. Thai presence is an identity marker, not a localization layer.

---

## Information Architecture

Four top-level sections. Navigation is persistent on desktop (top navbar) and mobile (bottom tab bar).

```
AlphaBrief
├── Overview (Home)
│   ├── Daily Brief card           ← primary anchor
│   ├── News feed (all categories) ← primary content
│   ├── Market Overview widget     ← sidebar / below-fold mobile
│   ├── Sector Heatmap widget      ← sidebar / below-fold mobile
│   └── Trend Summary widget       ← sidebar / below-fold mobile
│
├── News
│   ├── Category filter bar        ← All / Global Markets / Thai Stocks / Technology / Energy / Macro
│   ├── News feed (filterable)
│   └── [Each item → News Detail page]
│       ├── Headline + source name (non-nullable, visible text) + link to original article (non-nullable)
│       ├── Publication timestamp (Bangkok time, UTC+7)
│       ├── Full AI impact analysis
│       ├── Affected sectors list
│       ├── Affected stocks/indices (with direction)
│       ├── Sentiment classification
│       ├── Analysis timestamp + staleness indicator if >24h
│       └── AI disclaimer (non-removable)
│
├── Stocks (Trends in original PRD — renamed for nav clarity)
│   ├── Theme card list            ← editorial, spacious
│   └── [Each theme → Theme Detail page]
│       ├── Theme name + overall sentiment
│       ├── 2–3 sentence description
│       ├── Date range of constituent articles
│       ├── Constituent articles (with individual AI analysis + sentiment + staleness indicator if >24h)
│       └── AI disclaimer (non-removable, FR-A04)
│
└── About / Disclaimer
    ├── Product description and scope
    ├── AI analysis limitations
    ├── Data sources used
    ├── No investment advice statement
    └── Full regulatory disclaimer
```

> **Nav label note:** The navigation item labeled "Stocks" in the current codebase maps to the Trends capability in the PRD. The bilingual label reads: "Stocks / หุ้น" on desktop, same on the mobile bottom tab bar. Confirm whether this label aligns with user mental model before launch — the content is themes, not individual stock pages.

### Surface Inventory

| Surface | Entry | Primary action |
|---|---|---|
| Home (Overview) | Direct URL `/` | Scan Daily Brief, scroll news feed |
| News feed | `/news` | Filter by category, click to detail |
| News detail | `/news/[id]` | Read AI analysis, open source article |
| Trends | `/trends` | Scan theme cards, click to detail |
| Theme detail | `/trends/[id]` | Read theme + constituent articles |
| About | `/about` | Read disclaimer, understand scope |

---

## Design Philosophy

Five principles (Clarity · Trust · Context · Readability · Calm decision support) and the full "Explicitly avoided" list — see `DESIGN.md §Brand & Style`. These prohibitions apply equally to AI-generated analysis text; the system prompt (see NFR-AI01 in the PRD) is the enforcement mechanism for the AI output layer.

---

## Voice and Tone

AlphaBrief speaks like a knowledgeable colleague who read the news before you woke up — not like a compliance notice, not like a trading desk alert.

**Calm authority:** Statements are definitive but measured. "Fed rate signals push bond yields to a 4-month high" — not "BREAKING: Fed shocks markets."

**Plain language:** AI analysis uses plain-English equivalents for financial jargon. "Energy-importing economies" is explained by implication ("higher oil means higher input costs for Thai manufacturers"), not defined in a tooltip.

**No alarm, no hype:** Error states reassure. Staleness indicators inform. Neither should spike anxiety. The product helps users *understand before they act* — not act before they understand.

**Microcopy examples:**
- Staleness: "Updated 3 hrs ago · Market hours only" (not "WARNING: Stale data")
- Analysis pending: "Analysis in progress" (not "Loading..." or "Error")
- Empty category: "No new articles in Energy today · Check back during market hours" (not empty)
- Disclaimer: "AI-generated analysis is for informational purposes only and does not constitute investment advice." — tone is factual, not apologetic

---

## Component Patterns

### NewsCard

**Scan order (behavioral):** Headline → sentiment badge → AI insight text → stock badges → footer metadata. The card is designed to answer "what happened and why it matters" before asking "who reported it."

**AI insight box:** Linen background, camel left border, no label. The box is visually distinguished from the headline by background and border — no label is needed because its position and styling communicate "this is the analysis layer."

**Sentiment badge:** Top-right of headline row, pill shape. Always dot + text (`● BEARISH`). Three states: bullish, bearish, neutral. This is the per-article classification — distinct from per-stock direction arrows in the badge row below.

**Featured cards:** Left camel accent border (`3px`). Used for editor-promoted items. Visual weight draws the eye without changing the card hierarchy.

**Click behavior:** Navigates to `/news/[id]` — the detail page with full analysis, source link, and disclaimer. No inline expand.

**Pending state (no AI analysis yet):** AI insight box renders with "Analysis in progress" in `cocoa` at full opacity, 400 weight (lighter weight signals the muted state; opacity is never used for meaningful content text). Card is visible and clickable. The source article is accessible even without analysis.

**Stale analysis:** If AI analysis timestamp is >24 hours old, an amber inline indicator appears below the insight box: a small clock icon + "Analysis from [relative time]".

### ThemeCard (Trends page)

**Anatomy (top to bottom):**
1. Theme name (bold, 16px, espresso) + sentiment badge (right-aligned) + article count
2. 2–3 sentence theme description (cocoa, 14px) — carries the narrative
3. Khaki divider
4. "Latest:" label + most recent constituent article headline (12px, neutral-text, italic)
5. Footer: relative timestamp of most recent article

**Article headline preview:** Visually secondary (smaller, muted, italic) so it doesn't compete with the theme description. Its purpose is concrete anchoring — gives users proof that a real article backs the theme before they click through.

**Click behavior:** Navigates to `/trends/[id]`. The detail page shows the full theme description, date range, and all constituent articles in NewsCard format (with individual AI analysis and sentiment badges).

**Constituent article staleness (FR-A06):** If any constituent article's AI analysis is >24h old, the same amber staleness indicator appears below that article's insight box on the Theme Detail page — identical to the News Detail treatment.

**Spacing:** Padding `20px 24px`, card gap `16px`. Wider breathing room than the News feed to reinforce the editorial, curated feel.

### DailyBriefCard

**Position:**
- Desktop: Top of sidebar (right column), visible on initial load without scrolling
- Mobile: Top of page stack, first element after navbar + ticker bar

**Anatomy:**
- Zone 1 (espresso header): "AI Daily Brief" wordmark + Thai sub-label "ภาพรวมตลาด" + overall market sentiment badge + generation date
- Zone 2 (white body): 2–3 sentence market overview → numbered list of 3–5 key developments → footer (generation timestamp + **inline non-removable disclaimer text** (FR-D05): *"AI-generated market summary for informational purposes only. Not investment advice."* — 10px, neutral-text, never a link to About)

**Pending state (brief not yet generated for today):** Zone 1 shows yesterday's date + "Today's brief is being prepared." Zone 2 shows yesterday's brief content with a date label. This state should feel unhurried — not broken.

**The card does not dominate the page.** It anchors the experience without taking over. On desktop it is a sidebar card. On mobile it is the first card but scrolls away as the user reads the feed.

### Category Filter Bar (News page)

Horizontal scrollable tab row below the page header. Seven tabs: All · Global Markets · Thai Stocks · Technology · Energy · Macroeconomics.

Active tab: camel underline + espresso text. Inactive: neutral-text. Tab labels in English only (no Thai sub-label — tabs are too narrow).

Default selected: All. Selecting a category updates the feed in place (no page navigation). URL query param reflects active filter (`/news?category=energy`) for shareability.

### Ticker Bar

Fixed-height bar (`h-10`) immediately below the navbar. Scrolls horizontally on a continuous loop. Each item: `SYMBOL ▲ +1.23%` or `SYMBOL ▼ -0.87%` in monospace.

Direction arrow and percentage in `positive` or `negative` color. Symbol in espresso. Separator: `·` in khaki at 40% opacity.

**Pause on hover** (desktop only). Mobile: ticker scrolls continuously; no pause.

### Search (Home page)

Single-line input with magnifier icon. `aria-label="Search news, stocks, and sectors"` (explicit label required — placeholder is not accessible). Placeholder: "Search news, stocks, sectors... / ค้นหา". Border: khaki. Focus ring: espresso double-ring (see DESIGN.md §Elevation). Results are scoped to the news feed below.

### News Detail Page

**Content order (top to bottom):**
1. Headline (17–18px, 700, espresso)
2. Source name (non-nullable, visible text) + link to original article (non-nullable) + publication timestamp
3. Full AI impact analysis paragraph
4. Affected sectors list
5. Affected stocks/indices (stock badges with ▲/▼/– direction)
6. Sentiment classification (SentimentBadge)
7. Analysis timestamp + `staleness: #d97706` amber indicator if >24h old
8. AI disclaimer (non-removable, FR-A04): *"AI-generated analysis is for informational purposes only and does not constitute investment advice."*

**States:**
- 404 / not found: "Article not found" message + back navigation button. Never a blank page.
- Cold load: skeleton blocks at approximate content dimensions; `<Suspense>` boundary required.
- AI analysis pending: same pending state as NewsCard — "Analysis in progress" in cocoa at full opacity; source link still accessible.
- AI analysis error (permanent): "Analysis unavailable" message in neutral-text; source link and headline still render.

### Theme Detail Page

**Content order:**
1. Theme name + overall SentimentBadge
2. Date range of constituent articles
3. 2–3 sentence theme description
4. Constituent articles — each renders as a full NewsCard including AI analysis, stock badges, staleness indicator, and per-article disclaimer
5. AI disclaimer (non-removable, FR-A04) — applies to the theme description and constituent analyses

**States:**
- Error / theme expired (FR-T04 archives after 48h with no new articles): redirect to `/trends` with explanatory message "This theme has expired. Browse current themes."
- Empty constituent articles: unlikely by design (theme can't exist without articles), but if reached: "No articles available for this theme."

### MarketOverviewWidget (sidebar)

Compact widget showing market index rows. Each row: index name (12px, 600, cocoa) + current value (monospace, espresso) + direction change (▲/▼/– arrow + percentage, positive/negative color). Arrow is the **non-color indicator** — both arrow and color render simultaneously.

**Loading:** Skeleton rows. **Error:** "Market data unavailable · [timestamp]" — never silent.

### SectorHeatmap (sidebar)

Grid of sector cells. Each cell shows sector name + percentage change text — **both are required non-color indicators** (WCAG 1.4.1). Cell background color provides secondary visual confirmation of direction.

**Loading:** Skeleton grid. **Error:** "Sector data unavailable · [timestamp]".

### TrendSummary (sidebar)

Compact ranked list of active themes. Each row: theme name (13px, 500, espresso) + SentimentBadge (right-aligned). Clicking navigates to `/trends/[id]`.

**Empty:** "No active themes today" in neutral-text. **Loading:** 3 skeleton rows.

---

## State Patterns

### Loading / Skeleton

Server Components + ISR means most content renders on the server. Skeleton states apply to async child components inside `<Suspense>` boundaries.

Skeleton pattern: `bg-linen animate-pulse rounded` blocks at approximate content dimensions. No spinner. No "Loading..." text.

All financial data components must have a `<Suspense fallback={<SkeletonCard />}>` at the page level — missing boundary causes silent production failures.

### Analysis Pending

When a news item has no AI analysis yet:
- NewsCard renders normally (headline, source, time, category, sentiment badge hidden)
- AI insight box area shows: camel left-border box + "Analysis in progress" in `cocoa` at **full opacity**, 400 weight (lighter weight signals the muted state without inaccessible opacity) + small animated dot (CSS `opacity` pulse, no JS — paused when `prefers-reduced-motion: reduce`)
- Stock badges row: hidden (no analysis = no impact data yet)
- Card is fully clickable; detail page shows same pending state

### Stale Data

Two staleness thresholds enforced:
1. **Feed staleness (60 min during market hours):** If most recent article in a category is >60 min old during 09:00–18:00 Bangkok time, a yellow-amber banner appears above the feed: "Last updated [time] · New articles may be delayed"
2. **Analysis staleness (24h):** If AI analysis is >24h old, an inline indicator below the insight box on the detail page: `🕐 Analysis from [relative time]` in neutral-text at 80% opacity

Staleness indicators use `staleness` token (`#d97706`, amber-600) — defined in DESIGN.md frontmatter and `tailwind.config.ts`. This is the only non-palette color in the system — it communicates "pay attention" without using the negative/red sentiment color. **stale ≠ bad news.**

### Error / Unavailable

Error states are never empty or silent. Rules:
- **API failure (full page):** Full-width card with espresso icon + "Market data temporarily unavailable" + timestamp + "Please check back in a few minutes." No stack trace.
- **Category feed failure:** The failed category shows the unavailable card inline; other categories continue to render normally.
- **Individual card failure:** Card renders with headline (if available) + "Content unavailable" in place of AI box. Source link still visible if URL is available.

All error messages include a timestamp: "Last attempted [time]". This prevents users from assuming an empty state means "no news = calm market."

### Empty State (genuine)

If a category genuinely has no articles (e.g., no Thai Stocks news on a weekend):
- Feed shows: category illustration (subtle, non-alarming) + "No new articles in [Category] today." + "Check back during market hours (09:00–18:00 Bangkok time)."
- Never renders an empty list. The empty state is a first-class content state, not an afterthought.

### Trends Page States

**Empty (all themes archived, FR-T04):** "No active themes today. Themes are refreshed daily at 07:00 Bangkok time." + a link back to News feed. Common on weekend evenings.

**Error:** "Themes currently unavailable · Last attempted [time]." Same treatment as feed error.

### News Detail Page States

**404 / not found:** "Article not found." + back button to the news feed. Never a framework error page.

**Cold load / skeleton:** Skeleton blocks at approximate content dimensions inside a `<Suspense>` boundary. Required — missing boundary causes silent production failures on the detail page.

**AI analysis pending:** Same as NewsCard pending state — "Analysis in progress" in cocoa; source link and headline render immediately.

**AI analysis permanent error:** "Analysis unavailable for this article." in neutral-text. Source link, headline, and publication timestamp still render.

---

## Interaction Primitives

### Navigation

**Desktop:**
- Top navbar: sticky, `z-50`. Active tab: `2px border-bottom camel`. Transition: `color 0.15s`.
- Clicking the AlphaBrief logo navigates to `/`.

**Mobile:**
- Bottom tab bar: fixed, `z-50`. Four tabs: Overview / News / Stocks / Trends. Active: khaki icon + text + `2px border-top`. Safe area inset respected (`pb-safe`).
- No hamburger menu. All primary sections reachable with one tap.

### Card Interaction

- Hover (desktop): `box-shadow` appears (`0 4px 16px rgba(74,52,42,0.10)`), `cursor: pointer`. Transition: `box-shadow 0.2s`.
- Active/tap (mobile): `opacity: 0.92` flash, no hover state.
- Click: Navigate to detail page. No inline expand.

### Category Filter

- Tap/click: Instant feed update. No loading spinner — ISR content loads within one revalidation window.
- Horizontal scroll (mobile): Overflows with scroll snap, no visible scrollbar.

### Ticker Bar

- Desktop hover: pause scroll animation.
- Individual ticker tap (mobile): navigate to relevant news category or stock filter.

### External Links

- Source article links: open in new tab (`target="_blank" rel="noopener noreferrer"`). Visual indicator: small external link icon inline.
- All external links include visible source name — no bare URLs.

---

## Accessibility Floor

All behavioral — visual contrast and color specs live in `DESIGN.md`.

**WCAG 2.1 AA required.** Target: all interactive elements, all text content.

**Sentiment:** Color is never the sole indicator. Every sentiment signal has a secondary non-color indicator: dot + text label on badges, `▲`/`▼`/`–` arrows on stock badges. Color-blind users receive identical information.

**Keyboard navigation:** Full tab order through navbar, feed, cards, filters. `Enter`/`Space` activate cards and tabs. Skip-to-content link as first focusable element.

**Screen reader:** NewsCards and ThemeCards use `<article>` element. Sentiment badge: `aria-label="Market sentiment: bearish"`. Stock impact badges: `aria-label="[SYMBOL]: rising"` / `"[SYMBOL]: falling"` / `"[SYMBOL]: unchanged"` — the `▲`/`▼` arrow must not be announced by screen readers. Ticker bar: `aria-hidden="true"` (decorative marquee; category navigation is available via the News filter bar). Navigation landmark roles (`<header>`, `<nav>`, `<main>`, `<footer>`). AI insight box: `aria-label="AI market analysis"` or a visually-hidden heading. Search input: `aria-label="Search news, stocks, and sectors"` (explicit label; placeholder alone is not accessible). Category filter row: `role="tablist"` on container, `role="tab"` + `aria-selected="true/false"` on each tab, left/right arrow keys to move focus within the group. Thai subtitle text: `aria-hidden="true"` (duplicates the English label which is already announced).

**Focus indicators:** Visible focus ring on all interactive elements. `box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #4A342A` (espresso outer ring with white offset) — 12.5:1 contrast on any AlphaBrief surface, exceeds WCAG 1.4.11 3:1 requirement.

**Motion:** Ticker bar scroll, skeleton pulses, and the Analysis Pending animated dot all respect `prefers-reduced-motion`. All three pause/stop when preference is `reduce`. Card hover transitions (`0.2s shadow`) and nav transitions (`0.15s color`) are covered by a global `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }` rule.

**Touch targets (mobile):** Minimum 44×44px for all tab bar items and card tap areas. Category filter tabs minimum `44px` height.

**Disclaimer accessibility:** AI disclaimer text meets contrast requirements and is not hidden behind a toggle or tooltip.

---

## Key Flows

### Flow 1 — The Morning Brief (Nam)

**Protagonist:** Nam, 34, marketing manager in Bangkok. Invests in Thai tech stocks and US ETFs. Has 10 minutes over coffee before work. Opens AlphaBrief on desktop.

1. **Landing:** Page loads. Navbar shows "AlphaBrief · AI Financial Research" + live Bangkok clock. Ticker bar scrolls below.
2. **Daily Brief (gravity anchor):** Nam's eye lands on the espresso-header card in the sidebar: "AI Daily Brief · ภาพรวมตลาด — ● BEARISH." She reads the 2-sentence overview and two numbered key developments.
3. **Feed scan:** She scrolls the left column. News cards show: bold headline + sentiment badge (top-right). She scans badges — mostly neutral, one BEARISH in Energy.
4. **Card read:** She clicks the BEARISH Energy card. Detail page: headline → AI insight (2–3 sentences, no jargon) → sector impacts (Banks: negative, Technology: neutral) → source link → analysis timestamp → disclaimer.
5. **Decision:** She decides not to act. Closes browser. Session: under 8 minutes.

**Climax beat:** The sentiment badge on the news card lets her prioritize without reading. The AI insight on the detail page gives her the "so what" in under 30 seconds.

---

### Flow 2 — The Impact Check (Lek)

**Protagonist:** Lek, 27, software engineer. Recently bought into a renewable energy ETF. Heard OPEC news on his commute. Opens AlphaBrief on his phone.

1. **Landing (mobile):** App opens on Overview. Daily Brief card is first — ● BEARISH today. He scrolls past it.
2. **Tab navigation:** He taps "News" in the bottom tab bar. One tap.
3. **Category filter:** He taps "Energy" in the horizontal filter bar. Feed updates to Energy articles only.
4. **Card find:** OPEC article near the top. Headline bold. ● BEARISH badge top-right. He reads the AI insight box immediately below: supply restriction, oil price pressure, negative for energy importers.
5. **Sector impact:** Stock badges show ▲ PTT, ▲ PTTEP, ▼ AAV. He doesn't hold these but understands the sector shape.
6. **Decision:** He decides not to sell his ETF. He taps the source link, scans the original article for 30 seconds, closes.

**Climax beat:** One tap to News, one tap to Energy — 2 taps from home to the right category. The AI insight answers his question before he reads the article.

**Failure path (stale Energy feed):** If the Energy feed is >60 min stale during market hours, an amber banner renders above the feed: "Last updated [time] · New articles may be delayed." Lek sees the timestamp and knows the data lag before drawing conclusions.

---

### Flow 3 — The Sector Sweep (Wanida)

**Protagonist:** Wanida, 42, accountant. Actively manages Thai stocks. Wants to understand the technology sector before SET opens Monday morning. Opens AlphaBrief on desktop Sunday evening.

1. **Landing:** She goes directly to the Trends section via the navbar.
2. **Theme scan:** Trends page shows editorial theme cards — spacious, full descriptions. She spots: "AI Hardware Demand Cycle — 6 articles · ● BULLISH · Updated 4 hrs ago."
3. **Theme detail:** She clicks the card. Theme detail page: theme description → 6 constituent NewsCards with individual AI analysis and sentiment badges.
4. **Thai stock signal:** One article's stock badges show ▲ DELTA, ▲ HANA. She makes a mental note about DELTA.
5. **Cross-check:** She taps back to Trends, then goes to News → Technology filter. 4 additional articles. 2 are already in the theme she read.
6. **Decision:** She knows the narrative. She spends 12 minutes instead of 45.

**Climax beat:** The theme groups what would otherwise be 6 separate reads. The Thai stock identifiers (DELTA, HANA) appear in the AI impact analysis — she gets actionable signal without prediction language.

**Failure path (no active themes):** If all themes are archived (FR-T04 — 48h with no new articles, common late Sunday), the Trends page shows: "No active themes today. Themes are refreshed daily at 07:00 Bangkok time." with a link to the News feed. Wanida can still read individual articles in the Technology filter.

---

## Responsive & Platform

### Desktop (`lg:` and above, ≥1024px)

- Two-column grid: `grid-cols-[1fr_340px]`
- Sidebar widgets stack vertically in right column: Daily Brief → Market Overview → Sector Heatmap → Trend Summary
- Ticker bar: full width, pauses on hover
- Navbar: logo left, tabs center, live clock + LIVE badge right
- Theme cards on Trends: single column with generous padding

### Mobile (below `lg:`, <1024px)

**Home page stack (top to bottom):**
1. Navbar (top, sticky)
2. Ticker bar
3. Page header bar (section title + stats)
4. Search input
5. **Daily Brief card** (full width)
6. **News feed** (full width, single column)
7. Market Overview widget
8. Sector Heatmap widget
9. Trend Summary widget

**Bottom tab bar** replaces top nav for section switching. Always visible. Safe area inset applied.

**No sidebar.** The right-column widgets move below the news feed. They are accessible by scrolling — not hidden.

**Cards:** Full width. Same hierarchy as desktop. Sentiment badge stays top-right of headline. Stock badges wrap to two rows if needed.

**Category filter:** Horizontal scrollable tab row. No visible scrollbar. Tabs scroll left/right by swiping. Active tab is centered when possible.

**Theme cards (Trends, mobile):** Same editorial card, full width. Spacious padding preserved — do not compress to match News feed density on mobile.

**Touch:** All tap targets ≥44×44px. Card tap area is the full card — not just the headline text. External link icon tappable separately from card.

### Breakpoint Reference

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile (default) | < 768px | Single column, bottom tab bar, full-width cards |
| Tablet (`md:`) | 768px–1023px | Single column, bottom tab bar, wider cards |
| Desktop (`lg:`) | ≥ 1024px | Two-column grid, top navbar, sidebar widgets |
| Wide (`xl:`) | ≥ 1280px | `max-w-screen-xl` container centers, same layout |
