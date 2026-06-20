---
name: Accessibility Review — AlphaBrief
type: review
created: 2026-06-20
reviewer: WCAG 2.1 AA automated audit (claude-sonnet-4-6)
sources:
  - DESIGN.md
  - EXPERIENCE.md
---

# Accessibility Review — AlphaBrief

## Overall verdict

The spec demonstrates genuine accessibility intent — non-color sentiment indicators, keyboard navigation, screen reader landmarks, touch target minimums, and motion preferences are all mentioned. However, four color combinations fail WCAG 1.4.3 AA contrast, the most serious being camel-on-white (ratio 2.39:1) used pervasively for section labels, nav sub-labels, and the AI insight box border text. Focus indicators are specified but the camel-toned ring (opacity 0.35) is likely too faint to meet 3:1 UI component contrast. The accessibility floor section in EXPERIENCE.md is a strong foundation; the gaps are primarily in contrast ratios not being verified at token-selection time.

---

## Color contrast

Contrast ratios calculated via WCAG 2.1 relative luminance formula. "Normal text" threshold = 4.5:1; "large text" (≥18pt regular / ≥14pt bold, i.e. ≥24px regular / ≥18.67px bold) threshold = 3:1. Badge text at 9–11px bold does not qualify as large text.

| Combination | Token names | Hex values | Estimated ratio | Threshold | Result |
|---|---|---|---|---|---|
| Camel on white | `camel` on `white` | `#B2967D` / `#FFFFFF` | 2.39:1 | 4.5:1 | **FAIL** |
| Espresso on white | `espresso` on `white` | `#4A342A` / `#FFFFFF` | 12.50:1 | 4.5:1 | PASS |
| Espresso on linen | `espresso` on `linen` | `#4A342A` / `#F5F1EA` | 11.20:1 | 4.5:1 | PASS |
| Neutral-text on white | `neutral-text` on `white` | `#78716c` / `#FFFFFF` | 4.30:1 | 4.5:1 | **FAIL** |
| White on espresso | `white` on `espresso` | `#FFFFFF` / `#4A342A` | 12.50:1 | 4.5:1 | PASS |
| Positive on positive-bg | `positive` on `positive-bg` | `#16a34a` / `#dcfce7` | 4.13:1 | 4.5:1 | **FAIL** |
| Negative on negative-bg | `negative` on `negative-bg` | `#dc2626` / `#fee2e2` | 5.87:1 | 4.5:1 | PASS |
| Khaki on espresso | `khaki` on `espresso` | `#D7C9B8` / `#4A342A` | 7.71:1 | 4.5:1 | PASS |
| Camel on linen-deep | `camel` on `linen-deep` | `#B2967D` / `#EDE8E0` | 2.01:1 | 4.5:1 | **FAIL** |

**Additional opacity-based concerns (not fully calculable without final rendered color):**
- Inactive navbar text: `white` at 45% opacity on `espresso` — effective contrast estimated ~4.8:1 (borderline; depends on exact blending). Flag for verification.
- Thai subtitle under nav labels: `camel` at 70% opacity on `espresso` — effective camel blends toward espresso, estimated ~3.5:1. Likely fails 4.5:1 for 11px normal text.
- Thai subtitle under bottom tab bar labels: same concern as above.
- Pending state: camel at 60% opacity on linen background — worse than base camel-on-linen-deep (2.01:1); estimated ~1.6:1. **Critical failure.**

---

## Non-color indicators

| Surface | Dot + label | Arrow indicator | Coverage complete? |
|---|---|---|---|
| NewsCard sentiment badge | Yes — `● BEARISH / BULLISH / NEUTRAL` specified (DESIGN.md §SentimentBadge) | N/A | Yes |
| ThemeCard sentiment badge | Yes — same SentimentBadge component (DESIGN.md §ThemeCard) | N/A | Yes |
| DailyBriefCard sentiment badge | Yes — EXPERIENCE.md §DailyBriefCard references badge in Zone 1 | N/A | Yes |
| Stock impact badges | N/A | Yes — `▲`/`▼`/`–` arrows specified (DESIGN.md §NewsCard) | Yes |
| Ticker bar direction | N/A | Yes — `▲`/`▼` specified (DESIGN.md §Ticker Bar) | Yes |
| Sector heatmap | Not specified | Not specified | **GAP — heatmap cells mentioned in DESIGN.md color section as a sentiment surface but no non-color indicator is defined** |
| Market Overview widget | Not specified | Not specified | **GAP — Market Overview is listed in IA but has no component spec; no non-color indicator defined** |

Non-color indicator coverage is strong for the primary badge components. The sector heatmap and Market Overview widget are architectural gaps — they appear in the color usage table ("Applied to: sentiment badges on news cards and theme cards, sector heatmap cells, stock impact badges, market movement indicators") but neither component has a spec section that defines non-color indicators.

---

## Keyboard navigation

| Requirement | Specified? | Notes |
|---|---|---|
| Full tab order through interactive elements | Yes — EXPERIENCE.md §Accessibility Floor: "Full tab order through navbar, feed, cards, filters" | |
| Enter/Space activation | Yes — "Enter/Space activate cards and tabs" | |
| Skip-to-content link | Yes — "Skip-to-content link as first focusable element" | Specified but no implementation detail (e.g., which element it skips to, whether it is visually hidden or visible on focus) |
| Focus indicator style | Yes — EXPERIENCE.md §Accessibility Floor and DESIGN.md §Elevation: `box-shadow: 0 0 0 2px rgba(178,150,125,0.35)` | Contrast of this ring against typical backgrounds needs verification (see Findings #5) |
| Category filter tab keyboard nav | Implied by "Enter/Space activate tabs" | Horizontal arrow-key navigation within tab row not specified |
| Ticker bar keyboard behavior | Not specified | Can keyboard users skip the ticker bar entirely? Is it in the tab order? |
| External link keyboard target | Implied by standard anchor behavior | Not explicitly confirmed |

---

## Screen reader

| Requirement | Specified? | Notes |
|---|---|---|
| `<article>` for NewsCards | Yes — EXPERIENCE.md §Accessibility Floor | |
| `<header>`, `<nav>`, `<main>`, `<footer>` landmarks | Yes — EXPERIENCE.md §Accessibility Floor | |
| Sentiment badge aria-label | Yes — `aria-label="Market sentiment: bearish"` example given | |
| Ticker bar aria-live or aria-hidden | Yes — "aria-live='polite' region or aria-hidden='true' if decorative" | The choice between live and hidden is deferred to implementation; both options have different UX impact and the spec should resolve this |
| AI insight box accessible name | Not specified — the box intentionally has no visible label (DESIGN.md: "no label is needed") | Screen readers will announce the box content without context; aria-label or visually-hidden heading recommended |
| Stock badges accessible text | Not specified — `▲ PTT` is symbol + arrow but no aria-label pattern defined | A screen reader would read "triangle up PTT" not "PTT rising" |
| Search input label | Not specified | Placeholder-only inputs are not accessible; explicit `<label>` or `aria-label` needed |
| ThemeCard `<article>` or equivalent | Not specified | EXPERIENCE.md specifies `<article>` for NewsCards but not ThemeCards |
| Category filter tab role/aria-selected | Not specified | Custom tab row needs `role="tablist"` / `role="tab"` / `aria-selected` |
| External link announcement | Implied by `target="_blank"` | WCAG 2.4.4 link purpose; "opens in new tab" announcement not specified |
| DailyBriefCard region label | Not specified | The two-zone card should have a landmark or region label for screen reader navigation |
| Staleness indicator (clock emoji) | Uses `🕐` emoji — not specified with aria-label | Screen readers will announce "hourglass" or variant; needs `aria-hidden` + visually-hidden text |

---

## Touch targets

| Element | Minimum size specified? | Notes |
|---|---|---|
| Bottom tab bar items | Yes — 56px bar height, four tabs; effective tap width ~25% of screen width | Height satisfies 44px minimum; individual tab width depends on screen width but is almost certainly ≥44px at any mobile viewport |
| Card tap areas (full card) | Yes — "Card tap area is the full card — not just the headline text" (EXPERIENCE.md §Responsive) | |
| Category filter tabs | Yes — "minimum 44px height" specified (EXPERIENCE.md §Accessibility Floor) | |
| External link icon (separate tap target) | Mentioned as "tappable separately from card" | Minimum 44×44px not explicitly stated for this small inline icon |
| Ticker bar individual tickers (mobile) | "navigate to relevant news category" on tap | No minimum size specified; ticker items in a marquee strip may be very narrow |
| Search input | Not specified | Input height not defined; likely acceptable with standard browser defaults but not guaranteed |

---

## Motion

| Element | prefers-reduced-motion specified? | Notes |
|---|---|---|
| Ticker bar scroll animation | Yes — "pause/stop when motion preference is reduce" (EXPERIENCE.md §Accessibility Floor) | |
| Skeleton pulse animation | Yes — same statement covers both | |
| Card hover shadow transition (`0.2s`) | Not specified | Low-severity; transition is short and not vestibular-triggering, but completeness requires coverage |
| Nav tab color transition (`0.15s`) | Not specified | Same as above — low severity |
| Stale analysis animated dot (opacity pulse) | Not specified — "CSS opacity pulse, no JS" noted in EXPERIENCE.md §Analysis Pending | Should respect prefers-reduced-motion |

---

## Findings

- **critical** Camel (#B2967D) on white (#FFFFFF) at 2.39:1 — fails 4.5:1. Used for section labels (12px 600), nav sub-labels, and AI insight box border. All usages fail. (§ DESIGN.md Colors/Accent Scale, Typography type scale row "Label/section", Components/AIInsightBox). *Fix:* Darken camel to approximately #8C6E55 (est. 4.5:1 on white) or shift these text roles to `cocoa` (#7D5A44, est. 5.1:1 on white). Alternatively promote label text to ≥18.67px bold to qualify as large text where 3:1 applies.

- **critical** Camel (#B2967D) on linen-deep (#EDE8E0) at 2.01:1 — fails 4.5:1. Used for page-level metadata. (§ DESIGN.md Colors/Surface Hierarchy, Typography metadata row). *Fix:* Use `neutral-text` (#78716c, 4.30:1 on linen-deep, still borderline) or `cocoa` (#7D5A44, ~5.1:1 on linen-deep) for metadata on linen-deep backgrounds.

- **critical** Analysis pending state — camel at 60% opacity on linen background — estimated contrast ~1.6:1. Completely inaccessible. (§ EXPERIENCE.md §Analysis Pending). *Fix:* Use full-opacity camel on linen at minimum, or preferably `cocoa` at full opacity. Do not use opacity-based text for meaningful content states.

- **high** Positive sentiment text (#16a34a) on positive background (#dcfce7) at 4.13:1 — fails 4.5:1 for badge text at 9–11px bold. (§ DESIGN.md Colors/Sentiment Colors, Components/SentimentBadge). *Fix:* Darken positive text to approximately #15803d (Tailwind green-700, est. 5.0:1 on #dcfce7) or increase badge text to ≥18.67px bold. Since badges are pills with 9–11px text, darkening the text color is the practical fix.

- **high** Sector heatmap and Market Overview widget have no non-color indicator specified. Both surfaces are listed as sentiment color targets in DESIGN.md but lack component specs defining text labels, patterns, or icons as secondary indicators. (§ DESIGN.md Colors/Sentiment Colors: "Applied to: …sector heatmap cells, stock impact badges, market movement indicators"). *Fix:* Add component specs for both widgets including: cell value labels (e.g., percentage text) that convey direction, and define non-color indicators (▲/▼/– or text labels) for Market Overview direction indicators.

- **high** Stock impact badges have no aria-label pattern specified. A screen reader will announce `▲ PTT` as "triangle up PTT" or similar, not "PTT: rising". (§ DESIGN.md Components/NewsCard stock badges). *Fix:* Specify `aria-label="PTT: rising"` / `aria-label="AAV: falling"` / `aria-label="DELTA: unchanged"` pattern on each badge element.

- **high** Search input has no label specification — placeholder-only inputs fail WCAG 1.3.1 and 4.1.2. (§ EXPERIENCE.md §Search). *Fix:* Add `aria-label="Search news, stocks, sectors"` or a visually-hidden `<label>` element. Placeholder text disappears on input and is not a substitute for a label.

- **medium** Neutral-text (#78716c) on white (#FFFFFF) at 4.30:1 — fails 4.5:1 by a small margin. Used for source name, timestamps, and metadata (11–12px 400). (§ DESIGN.md Typography metadata row). *Fix:* Darken neutral-text slightly to #6b6560 (est. 4.6:1) or ensure metadata is rendered at ≥14px bold or ≥18px regular to qualify as large text where 3:1 applies.

- **medium** AI insight box has no accessible name for screen readers. The box intentionally carries no visible label, but screen readers will announce its content without context heading. (§ DESIGN.md Components/AIInsightBox, EXPERIENCE.md §NewsCard). *Fix:* Add a visually-hidden heading or `aria-label="AI market analysis"` on the insight box container so screen reader users understand the content type before hearing it read.

- **medium** Category filter tab row has no ARIA role specification. Custom tab-like controls require `role="tablist"` on the container and `role="tab"` + `aria-selected` on each item, plus arrow-key navigation within the group. (§ EXPERIENCE.md §Category Filter Bar). *Fix:* Specify ARIA tab pattern: `role="tablist"` on the row, `role="tab"` + `aria-selected="true/false"` on each tab, left/right arrow keys to move focus within the group.

- **medium** Thai subtitle text (11px 400 camel at 70% opacity on espresso, and same in bottom tab bar) — estimated effective contrast ~3.5:1, below 4.5:1 for 11px normal text. (§ DESIGN.md Typography type scale Thai subtitle row, Components/Navbar, Components/BottomTabBar). *Fix:* Since these are sub-labels providing bilingual confirmation for labels that are already readable in English, consider marking them `aria-hidden="true"` (decorative reinforcement, not additional information) and increasing opacity to ≥90% to approach contrast compliance if they remain visible.

- **medium** Focus ring contrast — `box-shadow: 0 0 0 2px rgba(178,150,125,0.35)` is the same camel token at 35% opacity. On a white card background this is approximately #e9dfd6 effective color — contrast against white ~1.3:1, well below the WCAG 1.4.11 non-text contrast requirement of 3:1 for UI focus indicators. (§ EXPERIENCE.md §Accessibility Floor, DESIGN.md §Elevation). *Fix:* Use `rgba(178,150,125,1.0)` at full opacity (camel at 2.39:1 on white is still too low for non-text contrast) or use `espresso` for the focus ring (#4A342A, 12.5:1 on white) with a white or linen inner offset to visually separate it from dark backgrounds.

- **medium** Staleness indicator uses a clock emoji (`🕐`) without aria-label specification. (§ EXPERIENCE.md §Stale Data). *Fix:* Add `aria-hidden="true"` on the emoji and provide the textual description in a visually-shown span so screen readers read "Analysis from 3 hours ago" without announcing an emoji.

- **low** Analysis pending animated dot (CSS opacity pulse) is not listed under the prefers-reduced-motion coverage. (§ EXPERIENCE.md §Analysis Pending: "small animated dot (CSS opacity pulse, no JS)"). *Fix:* Add this animation to the motion policy: stop the opacity pulse when `prefers-reduced-motion: reduce` is active; replace with a static dot.

- **low** Card hover/active transitions (shadow 0.2s, color 0.15s) and nav active-indicator transition are not listed under prefers-reduced-motion. Low vestibular risk, but completeness requires inclusion. (§ DESIGN.md §Elevation, EXPERIENCE.md §Interaction Primitives). *Fix:* Add a blanket `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }` rule in the global stylesheet, or explicitly exclude these transitions in the motion policy note.

- **low** Ticker bar keyboard behavior is unspecified. If ticker items are in the tab order on mobile, they could create a keyboard trap or excessive tab stops. If `aria-hidden`, tapping individual tickers on mobile (which EXPERIENCE.md says navigates to a category) must still be keyboard-accessible. (§ EXPERIENCE.md §Ticker Bar). *Fix:* Specify whether the ticker bar is `aria-hidden="true"` (decorative marquee) or keyboard-navigable. If navigable, define how keyboard users access individual ticker items.

- **low** ThemeCard is not specified to use `<article>` or equivalent landmark, unlike NewsCard which explicitly uses `<article>`. (§ EXPERIENCE.md §Accessibility Floor — only NewsCard specified). *Fix:* Confirm ThemeCard also uses `<article>` element for screen reader navigation consistency.

- **low** External links are specified to open in new tab (`target="_blank"`) but no screen reader announcement of "opens in new tab" is specified. (§ EXPERIENCE.md §External Links). *Fix:* Add `aria-label="[Source name] article, opens in new tab"` or append a visually-hidden "(opens in new tab)" span after external link text.
