# Spine Pair Review — ASK

_Reviewed against: design-example-editorial.md (shape reference), experience-example-shadcn.md (shape reference), prd.md (UJ/FR source of truth). Date: 2026-06-20._

---

## Overall verdict

The spine pair is **implementation-ready with a few targeted fixes**. DESIGN.md is structurally sound and token-complete; EXPERIENCE.md covers all three UJs with clear climax beats and thorough state patterns. The most pressing issues are: (1) two hex value mismatches between the decision log and DESIGN.md frontmatter need reconciliation before dev touches color tokens; (2) four components used in the spines lack behavioral specs in EXPERIENCE.md Component Patterns; (3) the three working mockup files are never referenced inline by either spine, leaving them orphaned. No section is broken; none are blocking as a group, but the hex mismatch on `positive` is a critical single-point risk.

---

## 1. Flow coverage — adequate

**Checked:** PRD defines three User Journeys: UJ-1 (Morning Brief / Nam), UJ-2 (Impact Check / Lek), UJ-3 (Sector Sweep / Wanida). EXPERIENCE.md has Flow 1, Flow 2, Flow 3 mapped to these protagonists.

**Findings:**

- UJ names in EXPERIENCE.md diverge slightly from PRD names. PRD: "UJ-1 — Morning Brief (Working Professional)"; EXPERIENCE.md: "Flow 1 — The Morning Brief (Nam)". The protagonist names match (Nam, Lek, Wanida) and the scenarios are faithfully reproduced — this is a labeling discrepancy, not a coverage gap. Severity: low.
- All three flows have a named protagonist, numbered steps (5–6 steps each), and an explicit "Climax beat" paragraph. The example reference requires a "climax beat" — all three pass.
- Flow 1 has a failure path (data save fails → Toast). Flow 2 has no failure path. Flow 3 has no failure path.
  - Flow 2 omits the case where the OPEC article is missing from the Energy feed (e.g., feed stale, article not yet ingested). Given FR-N06 / FR-UX07, this is a realistic scenario. Severity: medium.
  - Flow 3 omits the case where a theme is expired/archived (FR-T04: themes archived after 48h). A Sunday-evening user could hit an empty Trends page. Severity: medium.
- All three flows map to MVP scope. No flow references out-of-scope features.

**Fix:** Add a failure branch to Flow 2 (stale Energy feed) and Flow 3 (Trends page with no active themes / all themes > 48h old).

---

## 2. Token completeness — strong

**Checked:** YAML frontmatter in DESIGN.md. All `{path.to.token}` references in prose.

**Color tokens (YAML frontmatter):**

All color tokens have hex values. No missing hex values. Full enumeration:
`espresso #4A342A`, `cocoa #7D5A44`, `camel #B2967D`, `khaki #D7C9B8`, `linen #F5F1EA`, `linen-deep #EDE8E0`, `positive #16a34a`, `positive-bg #dcfce7`, `positive-border #86efac`, `negative #dc2626`, `negative-bg #fee2e2`, `negative-border #fca5a5`, `neutral-text #78716c`, `neutral-bg #f5f5f4`, `neutral-border #e7e5e4`, `white #ffffff`.

**Token reference resolution:**

All `{colors.*}` and `{rounded.*}` references in the YAML components block resolve to defined tokens. Checked:
- `{rounded.card}` → `12px` ✓
- `{rounded.badge}` → `20px` ✓
- `{rounded.insight-box}` → `6px` ✓
- `{rounded.tag}` → `4px` ✓
- `{rounded.icon}` → `4px` ✓
- `{colors.white}` ✓, `{colors.khaki}` ✓, `{colors.linen}` ✓, `{colors.camel}` ✓, `{colors.espresso}` ✓

**CRITICAL — Hex mismatch between decision log and DESIGN.md frontmatter:**

The `.decision-log.md` (codebase observation block, Session 1) records the *original* sentiment token values from `tailwind.config.ts`:
- `positive` in codebase: `#2d6a4f`
- `negative` in codebase: `#c1121f`

Decision D-007 updated these to `#16a34a` / `#dc2626` — and DESIGN.md frontmatter correctly reflects D-007. However, the Do's and Don'ts section in DESIGN.md contains: "Use green (`positive: #2d6a4f`) for bullish sentiment" — this is the *old* pre-D-007 value, contradicting the frontmatter's `positive: "#16a34a"`.

Additionally, `tailwind.config.ts` in the codebase may still hold the pre-D-007 values. If a developer reads the Do's and Don'ts section and copies `#2d6a4f` into code, they will diverge from the frontmatter. Severity: **critical**.

**Fix:** Update the Do's section hex reference from `#2d6a4f` to `#16a34a`. Verify `tailwind.config.ts` has been updated to D-007 values and document that in the decision log.

**Typography tokens — partial gap:**

The typography YAML in the frontmatter is incomplete relative to the editorial reference shape. The frontmatter records font families and a CSS variable reference, but not the full type scale (no size/weight/lineHeight per role). The type scale is documented in the Typography section prose (table format) instead. This works but creates a consistency gap: `EXPERIENCE.md` cannot cite `{typography.card-headline}` with confidence because no such token is defined in frontmatter. Currently no EXPERIENCE.md prose references typography tokens by path — it references them by prose description — so this is not a broken reference. Severity: medium.

---

## 3. Component coverage — thin

**Checked:** Every component named in DESIGN.md and EXPERIENCE.md. Cross-referenced against DESIGN.md Components section and EXPERIENCE.md Component Patterns.

**Components with full coverage (visual + behavioral):**
- NewsCard ✓ (DESIGN.md detailed anatomy; EXPERIENCE.md behavioral spec with all states)
- ThemeCard ✓ (DESIGN.md anatomy + ASCII; EXPERIENCE.md anatomy + click behavior)
- DailyBriefCard ✓ (DESIGN.md two-zone spec; EXPERIENCE.md position + pending state)
- SentimentBadge ✓ (DESIGN.md visual spec; EXPERIENCE.md behavioral reference via NewsCard)
- Ticker Bar ✓ (DESIGN.md layout spec; EXPERIENCE.md interaction primitives)
- Category Filter Bar ✓ (EXPERIENCE.md detailed; implied in DESIGN.md spacing)
- Search (Home) ✓ (EXPERIENCE.md covered)
- BottomTabBar ✓ (DESIGN.md visual; EXPERIENCE.md nav section)
- Navbar ✓ (DESIGN.md visual + YAML; EXPERIENCE.md nav section)
- Disclaimer ✓ (DESIGN.md visual treatment; EXPERIENCE.md references throughout)

**Components with DESIGN.md YAML entry but NO behavioral spec in EXPERIENCE.md Component Patterns:**

These components appear in the DESIGN.md YAML frontmatter under `components:` but have no dedicated section in EXPERIENCE.md Component Patterns:

- **AIInsightBox** — YAML entry exists; no dedicated EXPERIENCE.md Component Pattern section. Its behavior is described *inline* in the NewsCard section (linen bg, camel border, no label, pending state). This is workable but means a developer searching for "AIInsightBox" in EXPERIENCE.md gets no direct hit. Severity: medium.

**Components mentioned in prose/IA with NO spec in either spine:**

- **MarketOverview widget** — Referenced in IA ("Market Overview widget — sidebar / below-fold mobile"), listed in the codebase observation as `MarketOverviewWidget`. No DESIGN.md component spec. No EXPERIENCE.md behavioral spec. What does its loading state look like? What does it show? Empty state? Severity: **high**.
- **SectorHeatmap widget** — Same situation. Listed in IA and decision log as `SectorHeatmap`. No visual spec, no behavioral spec. Sector heatmap cells use sentiment colors (noted in DESIGN.md color section) but no component-level spec exists in either spine. Severity: **high**.
- **TrendSummary widget** — Same situation. Listed in IA ("Trend Summary widget"). No spec in either spine. Severity: **high**.
- **News Detail page** — Listed as a surface in IA with a rich content list (headline, source link, AI analysis, sectors, stocks, sentiment, timestamp, disclaimer). No dedicated component or page spec in EXPERIENCE.md Component Patterns — coverage is only via the IA tree listing. An architect implementing this page has no behavioral spec to work from beyond the IA indentation. Severity: **high**.
- **Theme Detail page** — Same. IA lists it; no dedicated Component Pattern or page-level spec. Severity: **high**.

**"Real rules, not one-word descriptions" check:**

All components that do have sections pass this check — specifications are multi-property with interaction rules and state notes.

**Fix:** Add Component Pattern sections for MarketOverview widget, SectorHeatmap widget, TrendSummary widget, News Detail page, and Theme Detail page. At minimum: anatomy, primary action, loading/error state, and empty state for each.

---

## 4. State coverage — adequate

**Checked:** All IA surfaces from EXPERIENCE.md Information Architecture. States evaluated: empty, cold-load, loading/skeleton, error, stale, pending.

| Surface | Empty | Cold-load / Skeleton | Error | Stale | Pending |
|---|---|---|---|---|---|
| Home (Overview) | Not covered (what if feed + brief both empty?) | Covered — Suspense boundaries + SkeletonCard | Covered — full-width card | Covered — 60-min banner | Covered — DailyBriefCard pending |
| News feed | Covered — genuine empty state section | Covered — skeleton | Covered — category feed failure | Covered — 60-min banner | Covered — Analysis in progress |
| News detail | Not covered | Not covered | Not covered (implied by card failure) | Covered — 24h indicator | Covered — pending state |
| Trends | Not covered (no active themes / all archived) | Not covered | Not covered | Not covered | n/a |
| Theme detail | Not covered | Not covered | Not covered | Not covered | n/a |
| About | n/a | n/a | n/a | n/a | n/a |

**Findings:**

- News detail page has no dedicated state spec for cold-load, error, or empty. The partial coverage in the "Individual card failure" section of Error state is written from a *card* perspective, not a *detail page* perspective. A developer building `/news/[id]` needs: what renders if the article ID is not found (404)? What if AI analysis never arrives for a specific article? Severity: **high**.
- Trends page / Theme detail: zero state coverage for empty Trends (all themes archived), cold-load skeleton, or per-theme error. Per FR-T04, themes expire after 48h — a weekend-evening Trends visit will likely render nothing. Severity: **high**.
- Home "both fail" scenario: what if the Daily Brief AND the news feed both fail simultaneously? State pattern section covers them individually but not in combination. The DESIGN.md Do's and Don'ts partially addresses this ("explicit, timestamped 'Data currently unavailable' message") but behavioral composition is unspecified. Severity: medium.
- EXPERIENCE.md notes amber/yellow for staleness ("the only non-palette color in the system") but DESIGN.md has no amber token defined. A developer will need to pick a value; this should be specified. Severity: medium.

**Fix:** Add state rows for News detail and Trends surfaces to the State Patterns section. Define an amber staleness token in DESIGN.md frontmatter.

---

## 5. Visual reference coverage — broken

**Checked:** References to mockup/wireframe files in both spines. Files in `.working/` directory.

**Mockup files that exist:**
- `.working/card-hierarchy-1.html` — card hierarchy exploration
- `.working/color-themes-1.html` — color theme exploration
- `.working/keyscreen-home-1.html` — home screen key screen mockup

**References in DESIGN.md:** Zero. No mockup files are linked or cited anywhere in DESIGN.md.

**References in EXPERIENCE.md:** Zero. No mockup files are linked or cited anywhere in EXPERIENCE.md.

**Comparison to reference shape:** The EXPERIENCE.md example (Drift) includes: "→ Composition reference: `mockups/today.html`, `mockups/project-detail.html`, `mockups/command-palette.html`. Spine wins on conflict." — this is the expected pattern.

All three working mockup files are **orphaned** — they exist in `.working/` but are not referenced by either spine. A downstream architect or developer has no way to discover them from the spines. Severity: **high**.

**Fix:** Add a "Composition References" subsection to the EXPERIENCE.md IA section (or Foundation) linking to the three working files. Include the Spine-wins-on-conflict declaration. Example:
```
→ Composition references: `.working/keyscreen-home-1.html` (home layout), `.working/card-hierarchy-1.html` (card anatomy), `.working/color-themes-1.html` (color exploration). Spine wins on conflict.
```

---

## 6. Bloat & overspecification — adequate

**Findings:**

- **Design Philosophy in EXPERIENCE.md** is a restatement of the Design Philosophy from DESIGN.md Brand & Style section. Both files contain the five principles (Clarity, Trust, Context, Readability, Calm decision support) and the "Explicitly avoided" list word-for-word. The EXPERIENCE.md example (Drift) delegates "brand voice and aesthetic posture" to DESIGN.md rather than restating it. This duplication will create a maintenance problem if the principles are updated. Severity: medium.
  - Decision: if Design Philosophy must appear in EXPERIENCE.md, it should be a one-line pointer: "Five principles: see DESIGN.md Brand & Style." The full list should live in one place.

- **Voice and Tone** section in EXPERIENCE.md partially overlaps Brand & Style prose in DESIGN.md (the "calm authority," "no alarm" framing). This is less problematic than the Philosophy duplication because Voice and Tone covers microcopy examples that have no visual equivalent — this content earns its place. Low severity.

- **Pixel specs where tokens exist:** Card padding is specified as both `14px 16px` in prose and `{spacing.card-padding}` in the YAML — these are consistent, not redundant. However, the Typography section specifies sizes in px (e.g., "15px 700 espresso") rather than tokens, creating a prose-to-code translation gap. This is a style choice rather than a bloat problem given there are no typography tokens in frontmatter. Severity: low.

- **PRD persona restatement:** EXPERIENCE.md Key Flows give full protagonist backstories (age, job, investment behavior). This is expected pattern (the editorial reference does the same) and adds context not mechanically derivable from a persona row. Not flagged as bloat.

- No tables that should be prose, no prose that must be tables — the mix is appropriate throughout.

---

## 7. Inheritance discipline — adequate

**Findings:**

- **UJ name fidelity:** PRD calls them "UJ-1 — Morning Brief", "UJ-2 — Impact Check", "UJ-3 — Sector Sweep". EXPERIENCE.md calls them "Flow 1 — The Morning Brief", "Flow 2 — The Impact Check", "Flow 3 — The Sector Sweep". The lead words match ("Morning Brief", "Impact Check", "Sector Sweep") even if the prefix convention differs. An architect or story-writer cross-referencing by protagonist name (Nam/Lek/Wanida) will succeed. Cross-referencing by ID (UJ-1 vs. Flow 1) will require a lookup. Severity: low.

- **FR reference:** EXPERIENCE.md does not cite FR codes by number. State patterns for staleness and error clearly implement FR-N06, FR-A06, FR-A03, FR-UX07 but do not say so. For a story-dev tracing coverage, this creates ambiguity about whether a given state pattern intentionally implements a specific FR or is incidental. The Drift example also omits FR codes, so this is a style choice — but for a financial product with compliance requirements (FR-A04, NFR-C01), explicit FR citations in the disclaimer and error state sections would strengthen the contract. Severity: low.

- **Component name consistency — PASS:** "NewsCard" is consistent across DESIGN.md YAML, DESIGN.md Components section, EXPERIENCE.md Component Patterns, and the decision log. "ThemeCard" is consistent. "DailyBriefCard" is consistent. "SentimentBadge" is consistent. "BottomTabBar" is consistent. No kebab-case / PascalCase / title-case mixing found in the named components.

- **One naming inconsistency found:** EXPERIENCE.md IA tree and prose use "Trends" as the section name throughout. The IA Surface Inventory table labels the route `/trends` and the surface "Trends". However, EXPERIENCE.md's IA note says: "The navigation item labeled 'Stocks' in the current codebase maps to the Trends capability in the PRD." The nav label is "Stocks / หุ้น" in the bottom tab bar section. So the surface is called "Trends" in the spine but "Stocks" in the nav label. This is acknowledged in the spine but not fully resolved — the component section uses "ThemeCard (Trends page)" while the IA calls the nav label "Stocks." A developer will see "Stocks" in the nav but route to `/trends` and read docs about "Trends." Severity: medium.

- **EXPERIENCE.md token references to DESIGN.md:** EXPERIENCE.md references color tokens by name (e.g., "camel left border," "espresso header," "khaki at 40% opacity") rather than by path (`{colors.camel}`). These are prose references, not code references, and they correctly match defined tokens in DESIGN.md. No broken cross-refs found.

---

## 8. Shape fit — strong

**DESIGN.md canonical section order check:**

Expected: Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts

Actual: Brand & Style ✓ → Colors ✓ → Typography ✓ → Layout & Spacing ✓ → Elevation & Depth ✓ → Shapes ✓ → Components ✓ → Do's and Don'ts ✓

**DESIGN.md shape: PASS.** Section order matches canonical form exactly.

**EXPERIENCE.md required sections check:**

Expected: Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows

Actual: Foundation ✓, Information Architecture ✓, Design Philosophy (extra — see §6), Voice and Tone ✓, Component Patterns ✓, State Patterns ✓, Interaction Primitives ✓, Accessibility Floor ✓, Key Flows ✓, **Responsive & Platform** ✓

**Responsive & Platform:** Present ✓ — appropriate for a multi-surface product.

**Design Philosophy section:** This is an invented section not in the canonical shape. It appears between IA and Voice and Tone. As noted in §6, the content duplicates DESIGN.md. It does not disrupt section ordering, but it does not "earn its place" in the EXPERIENCE.md because everything in it is already in DESIGN.md Brand & Style. Severity: medium.

**EXPERIENCE.md shape: PASS with one redundancy (Design Philosophy).**

---

## Mechanical notes

1. **Hex value mismatch — CRITICAL:** DESIGN.md Do's section references `positive: #2d6a4f` (old pre-D-007 value). Frontmatter has `positive: "#16a34a"` (correct D-007 value). These conflict. One line needs updating: the Do's paragraph that reads "Use green (`positive: #2d6a4f`) for bullish sentiment" should read `#16a34a`.

2. **Amber staleness token undefined:** EXPERIENCE.md State Patterns specifies "amber/yellow — the only non-palette color in the system" for staleness indicators. No amber token is defined in DESIGN.md frontmatter. Implementation will require an ad-hoc pick.

3. **Orphaned mockup files:** `.working/card-hierarchy-1.html`, `.working/color-themes-1.html`, `.working/keyscreen-home-1.html` are not referenced in either spine.

4. **Frontmatter typography gap:** DESIGN.md YAML frontmatter does not define a named type-scale token object (unlike the editorial reference example). Prose table covers it, but `{typography.body}` style references cannot be validated.

5. **Nav label / surface name split:** Nav reads "Stocks" in implementation; spine docs say "Trends". IA note acknowledges but does not resolve. Confirm one canonical name before stories are written.

6. **WCAG version:** EXPERIENCE.md cites WCAG 2.1 AA. PRD NFR-ACC01 cites WCAG 2.1 AA. Consistent. Note: WCAG 2.2 is current (Oct 2023); consider upgrading commitment if launch is post-2024.

7. **Bottom tab bar has four tabs in EXPERIENCE.md** ("Overview / News / Stocks / Trends") but only three unique surfaces named in the nav tab description. Per the IA, "Stocks" maps to Trends — so the tab bar effectively has: Overview, News, Stocks (=Trends), and… what is the fourth tab? This may be an artifact of the nav-label naming confusion. Severity: medium.
