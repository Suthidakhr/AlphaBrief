---
name: AlphaBrief Design System
status: final
created: 2026-06-20
updated: 2026-06-20
colors:
  # Brand surfaces
  espresso: "#4A342A"
  cocoa: "#7D5A44"
  camel: "#B2967D"
  khaki: "#D7C9B8"
  linen: "#F5F1EA"
  linen-deep: "#EDE8E0"
  # Sentiment — enforced at data layer, not CSS convention
  # Vivid enough for at-a-glance recognition; calm enough for a research tool (not a trading terminal)
  positive: "#15803d"
  positive-bg: "#dcfce7"
  positive-border: "#86efac"
  negative: "#dc2626"
  negative-bg: "#fee2e2"
  negative-border: "#fca5a5"
  neutral-text: "#6b6560"
  neutral-bg: "#f5f5f4"
  neutral-border: "#e7e5e4"
  staleness: "#d97706"
  # Base
  white: "#ffffff"
typography:
  sans: ["Inter", "system-ui", "sans-serif"]
  mono: ["ui-monospace", "SFMono-Regular", "monospace"]
  variable: "--font-inter"
rounded:
  badge: "20px"
  card: "12px"
  card-sm: "8px"
  tag: "4px"
  insight-box: "6px"
  icon: "4px"
spacing:
  card-padding: "14px 16px"
  card-padding-sm: "10px 12px"
  page-x: "16px"
  page-y: "20px"
  card-gap: "10px"
  section-gap: "20px"
components:
  NewsCard:
    border-radius: "{rounded.card}"
    background: "{colors.white}"
    border: "1px solid {colors.khaki}"
    hover-shadow: "0 4px 16px rgba(74,52,42,0.10)"
  SentimentBadge:
    border-radius: "{rounded.badge}"
    structure: "dot + label"
  AIInsightBox:
    background: "{colors.linen}"
    border-left: "2px solid {colors.camel}"
    border-radius: "{rounded.insight-box}"
  DailyBriefCard:
    header-background: "{colors.espresso}"
    body-background: "{colors.white}"
    border: "1px solid {colors.khaki}"
    border-radius: "{rounded.card}"
  ThemeCard:
    background: "{colors.white}"
    border: "1px solid {colors.khaki}"
    border-radius: "{rounded.card}"
  Navbar:
    background: "{colors.espresso}"
    height: "56px"
    active-indicator: "border-bottom 2px {colors.khaki}"
  BottomTabBar:
    background: "{colors.espresso}"
    height: "56px"
    active-color: "{colors.khaki}"
---

## Brand & Style

AlphaBrief is a financial research assistant for Thai retail investors. The visual identity is built around a single metaphor: **reading financial research over morning coffee**. This shapes every decision — warmth over clinical precision, calm authority over urgent alerts, approachable depth over overwhelming data density.

The product sits deliberately between Bloomberg (too complex, too cold) and TradingView (too chart-heavy, too overwhelming) on the approachability spectrum. It does not look like a trading terminal. It looks like a premium financial editorial product.

**Design philosophy:** AlphaBrief is a financial research companion, not a trading platform. Every design decision is filtered through five principles: **Clarity · Trust · Context · Readability · Calm decision support**. The product helps users understand the market; the final investment decision is always theirs. Explicitly avoided: prediction language, trading signals, recommendation wording, urgency-driven design patterns (red flashes, countdown timers, "act now" copy).

**Identity markers:**
- Warm espresso palette anchored in the navigation chrome
- Bilingual labels (English primary, Thai subtitle) are a permanent design element — not a localization afterthought
- Thai retail investors understand English financial terms but feel more grounded with Thai confirmations
- Every surface communicates trustworthiness: measured, clean, unhurried

**Tone of visual language:** Informed calm. Not urgent. Not alarming. A product you open at 7am to understand what happened overnight — not one that makes you anxious.

---

## Colors

### Surface Hierarchy

AlphaBrief uses four stacked surface levels. Espresso fills are confined to nav and the Daily Brief header — never used as general content fills.

| Surface | Token | Hex | Usage |
|---|---|---|---|
| Page background | `linen-deep` | `#EDE8E0` | Body background between cards |
| Card background | `white` | `#FFFFFF` | All content cards |
| Inset background | `linen` | `#F5F1EA` | AI insight box, section sub-headers |
| Chrome | `espresso` | `#4A342A` | Navbar, footer, Daily Brief card header |

### Accent Scale

| Token | Hex | Primary role |
|---|---|---|
| `camel` | `#B2967D` | **Accent-only:** AI insight box border, nav active indicator, decorative borders, card accents. Do not use for normal-size body or label text — contrast is 2.39:1 on white (fails 4.5:1). |
| `khaki` | `#D7C9B8` | Card borders, dividers, khaki-on-dark text (espresso surfaces) |
| `cocoa` | `#7D5A44` | Body text on white/linen, section labels, AI insight text, metadata text on linen-deep (~5.1:1 on white) |
| `neutral-text` | `#6b6560` | Timestamps, tertiary metadata, muted UI copy (~4.6:1 on white) |

### Sentiment Colors

These three colors are **data-layer assignments**, not CSS convention. Green always means bullish/positive. Red always means bearish/negative. They must never be used decoratively or reassigned.

Calibrated for immediate at-a-glance recognition without creating urgency or a trading-terminal feel. Vivid enough to distinguish instantly; calm enough for a 10-minute morning reading session.

| Sentiment | Text | Background | Border |
|---|---|---|---|
| Bullish / Positive | `#15803d` | `#dcfce7` | `#86efac` |
| Bearish / Negative | `#dc2626` | `#fee2e2` | `#fca5a5` |
| Neutral | `#78716c` | `#f5f5f4` | `#e7e5e4` |

Applied to: sentiment badges on news cards and theme cards, sector heatmap cells, stock impact badges, market movement indicators in the ticker bar and Market Overview widget.

---

## Typography

**Font family:** Inter (Google Font, variable weight via CSS variable `--font-inter`). Loaded in `layout.tsx` via `next/font/google`. System stack fallback: `system-ui, sans-serif`.

**Monospace:** `ui-monospace, SFMono-Regular, monospace` — used for timestamps, ticker symbols, price figures, and live clock.

### Type Scale

| Role | Size | Weight | Color | Usage |
|---|---|---|---|---|
| Page heading | 17–18px | 700 | `espresso` | Section titles |
| Card headline | 15px | 700 | `espresso` | News card title — primary scan target |
| Body / AI insight | 13–14px | 400 | `cocoa` | AI insight box content |
| Label / section | 12px | 600 | `cocoa` | Section headers, category filter tabs, card section labels |
| Metadata | 11–12px | 400 | `neutral-text` | Source name, timestamps |
| Thai subtitle | 11px | 400 | `camel` at 90% opacity, `aria-hidden="true"` | Under English nav labels (decorative; English label is the accessible text) |
| Badge / tag | 9–11px | 700 | varies | Sentiment, category, stock badges |

**Letter spacing:** Applied to all-caps labels and badges (`0.08–0.12em`). Not applied to headline or body text.

**Line height:** Headlines `1.35`; body `1.55–1.6`; badges `1.0`.

---

## Layout & Spacing

### Desktop Grid

- Outer container: `max-w-screen-xl` (1280px), centered
- Page padding: `px-4 py-5` (`16px` / `20px`)
- Primary grid: `grid-cols-[1fr_340px]` activated at `lg:` breakpoint
  - Left column: News feed (fluid)
  - Right column: Sidebar widgets (fixed 340px — AI Brief, Market Overview, Sector Heatmap, Trend Summary)
- Gap between columns: `20px`
- Gap between cards: `10px`

### Card Anatomy

```
┌──────────────────────────────────────┐  ← khaki border
│  Headline                  ● BEARISH │  ← 15px bold + sentiment pill
│                                      │
│  ┌────────────────────────────────┐  │
│  │  AI insight (no label)         │  │  ← linen bg, camel left border
│  └────────────────────────────────┘  │
│                                      │
│  ▲ PTT    ▲ PTTEP    ▼ AAV          │  ← stock badges
│                                      │
│  ─────────────────────────────────── │  ← khaki divider
│  Reuters · 2 hrs ago      ENERGY    │  ← footer: source · time · tag
└──────────────────────────────────────┘
```

Internal padding: `14px 16px`. Card border-radius: `12px`. Featured card left accent: `3px solid {camel}`.

### Navbar

Height: `56px`. Sticky, `z-50`. Logo left, nav tabs center, live clock + LIVE badge right.

- Active tab indicator: `2px border-bottom` in `khaki`
- Active tab text: `khaki`
- Inactive tab text: `white` at 45% opacity
- Thai subtitle under each tab label: `khaki` at 55% opacity

### Ticker Bar

Fixed-height bar immediately below the navbar. Horizontal auto-scroll (CSS marquee or JS). Pause on hover. Ticker symbols in monospace. Direction indicators (`▲`/`▼`) in `positive`/`negative` colors.

### Daily Brief Card (Sidebar / Mobile top)

```
┌──────────────────────────────────────┐
│  espresso header bg                  │
│  AI Daily Brief · ภาพรวมตลาด  ● BEA│
├──────────────────────────────────────┤
│  white body                          │
│  2–3 sentence overview               │
│  1 · Key point one                   │
│  2 · Key point two                   │
│  ...                                 │
└──────────────────────────────────────┘
```

---

## Elevation & Depth

AlphaBrief uses **border-defined surfaces**, not shadow-defined surfaces. Shadows appear only on hover to signal interactivity.

| State | Treatment |
|---|---|
| Default card | `1px solid {khaki}` border, no shadow |
| Hovered card | `box-shadow: 0 4px 16px rgba(74,52,42,0.10)` |
| Focused element | `box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #4A342A` (espresso outer ring, white offset) — 12.5:1 on any AlphaBrief surface |
| Navbar | Bottom border `1px solid rgba(215,201,184,0.15)` |

No deeply layered shadows. Depth is communicated through surface color hierarchy (`linen-deep` → `white` → `linen`) rather than drop shadows.

---

## Shapes

| Element | Border Radius |
|---|---|
| Content cards (NewsCard, ThemeCard, DailyBriefCard) | `12px` |
| Smaller cards (MarketOverview widget panels) | `8px` |
| AI insight box | `6px` |
| Category tags | `4px` |
| Icon containers (Navbar logo, AI icon) | `4px` |
| Sentiment badges, LIVE badge, stock badges | `20px` (pill) |
| Search input | `8px` |

---

## Components

### NewsCard

**Anatomy (top to bottom):**
1. `[Headline — 15px 700 espresso]` + `[Sentiment badge — top-right, pill]`
2. AI insight box — linen bg, `2px camel` left border, `12px` radius, no label
3. Stock impact badges — row of pills (▲/▼/– + ticker symbol)
4. Khaki divider
5. Footer row: `[Source name · Relative time]` + `[Category tag — right-aligned]`

**Sentiment badge:** Dot + label (`● BEARISH` / `● BULLISH` / `● NEUTRAL`). Dot in sentiment color, label text in sentiment color, background in sentiment-bg, no border. This is the article-level classification.

**Stock badges:** Monospace font, `▲` in `positive`, `▼` in `negative`, `–` in `neutral-text`. Border + background in sentiment bg/border tokens. Each badge element: `aria-label="[SYMBOL]: rising"` / `"[SYMBOL]: falling"` / `"[SYMBOL]: unchanged"` — screen readers must not announce the arrow character.

**Featured card:** `border-left: 3px solid camel`. Editor-promoted items only.

**Pending state (AI not yet available):** AI insight box replaced with "Analysis in progress" text in `cocoa` at full opacity (400 weight, not bold — lighter weight communicates the muted state without inaccessible opacity). Card still visible and clickable.

### SentimentBadge

Dot + label pill. Always dot + text — never color alone. Used at article level (NewsCard top-right) and theme level (ThemeCard). Three states: bullish, bearish, neutral.

### ThemeCard (Trends page)

```
┌──────────────────────────────────────┐
│  [Theme name — 16px 700 espresso]    │
│  [Sentiment badge]     [N articles]  │
│                                      │
│  2–3 sentence theme description      │
│  in cocoa at 14px                    │
│                                      │
│  ─────────────────────────────────── │
│  Latest: "Most recent article        │
│  headline preview text here"         │
│  ─────────────────────────────────── │
│  3 hrs ago                           │
└──────────────────────────────────────┘
```

Spacious padding (`20px 24px`). Card gap on Trends page: `16px` (wider than News feed's `10px`).

**Article headline preview:** The most recent constituent article's headline appears below the theme description, preceded by a "Latest:" label. Visually secondary — 12px, neutral-text color, italic — to signal recency without competing with the theme narrative. Gives users a concrete anchor ("there's a real article here") before they click through to the detail page.

### DailyBriefCard

Two-zone card. Zone 1 (espresso bg): title "AI Daily Brief · ภาพรวมตลาด" + overall sentiment badge in white/khaki palette. Zone 2 (white bg): overview sentence + numbered key points list. Footer: generation timestamp + **inline non-removable disclaimer text** (FR-D05): *"AI-generated market summary for informational purposes only. Not investment advice."* — `10px`, `neutral-text`, no border or link. Never implemented as a hyperlink to the About page.

### BottomTabBar (mobile only)

Height: `56px`. Espresso background. Four tabs: Overview / News / Stocks / Trends. Each tab: icon (24px SVG) + English label + Thai sub-label. Active tab: `khaki` icon and text; `2px top border-top` in `khaki`. Inactive: white at 45% opacity.

### MarketOverviewWidget

**Anatomy:** Compact widget, `8px` border-radius. List of market index rows.

Each row: `[Index name]` (12px, 600, `cocoa`) + `[Current value]` (12px, mono, `espresso`) + `[Change ▲/▼ +X.XX%]` (12px, `positive` or `negative` color). Direction arrow (`▲`/`▼`/`–`) is the **non-color indicator** — required regardless of color.

**Loading state:** 3–4 skeleton rows, `animate-pulse`.

**Error state:** "Market data unavailable · Last attempted [time]" in `neutral-text`. Never a silent empty widget.

---

### SectorHeatmap

**Anatomy:** Grid of sector cells. Each cell: `[Sector name]` (11px, 600, text contrasted against cell fill) + `[Percentage change]` (12px, mono) — **both are non-color indicators required by WCAG 1.4.1**. Cell background uses `positive-bg`/`negative-bg` or a neutral fill as intensity signal; percentage text confirms direction.

**Loading state:** Skeleton grid, `animate-pulse`.

**Error state:** Same empty-card pattern as MarketOverviewWidget.

---

### TrendSummary

**Anatomy:** Compact ranked list. Each row: `[Theme name]` (13px, 500, `espresso`) + `[SentimentBadge]` (right-aligned). Clicking a row navigates to `/trends/[id]`.

**Empty state:** "No active themes today" in `neutral-text`.

**Loading state:** 3 skeleton rows.

---

### Disclaimer

Inline, non-removable. Appears: after every AI analysis on detail pages; as footer text in DailyBriefCard; on the About/Disclaimer page in full. Visual treatment: `10–11px`, `neutral-text`, no border or background — text only. Never styled as an alert or warning box. Never implemented as a link to the About page — the disclaimer must be readable inline without navigation.

---

## Do's and Don'ts

**Do:** Use green (`positive: #15803d`) for bullish sentiment and upward price direction exclusively.  
**Don't:** Use green for decorative purposes, success states, or positive UI feedback unrelated to market direction.

**Do:** Keep green = bullish/positive and red = bearish/negative without exception.  
**Don't:** Invert the green/red sentiment mapping under any circumstance — not in loading states, success toasts, or non-market UI contexts.

**Do:** Pair every color sentiment signal with a secondary text/icon indicator (dot + label badge, arrow + symbol).  
**Don't:** Rely on color alone for sentiment — users with color vision deficiency must get the same information.

**Do:** Confine espresso fills to the navbar, footer, and Daily Brief card header.  
**Don't:** Use espresso as a section fill in the content area — it creates visual heaviness on large screens.

**Do:** Use khaki (`#D7C9B8`) for card borders and dividers to give warm structure.  
**Don't:** Use gray (`#e5e7eb` or Tailwind default) borders — they break the warm palette cohesion.

**Do:** Show an explicit, timestamped "Data currently unavailable" message when data fails to load.  
**Don't:** Show empty components, zero-state cards, or silent failures — an empty news feed can be misread as "no news = calm market."

**Do:** Render the AI disclaimer wherever AI analysis appears. It is structural, not optional.  
**Don't:** Use a feature flag, prop, or conditional rendering to suppress the disclaimer.

**Do:** Mark data older than 60 minutes (market hours) or 24 hours (analysis) with a visible staleness indicator.  
**Don't:** Display stale financial data without acknowledgment — silent staleness is a trust issue.
