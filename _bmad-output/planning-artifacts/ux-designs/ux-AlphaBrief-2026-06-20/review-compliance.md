# Financial Compliance Review — AlphaBrief

## Overall verdict

The spine pair (DESIGN.md + EXPERIENCE.md) is structurally strong: sentiment color enforcement is explicitly data-layer, error/empty states address the "empty feed = calm market" failure mode, and the financial language prohibition is specific enough to guide developers. Two critical gaps remain before implementation: the Theme Detail page has no AI disclaimer specification, and the exact disclaimer text for the Daily Brief card diverges from the PRD's canonical wording without acknowledgment. Source attribution on the News Detail page uses "source link" language that could be implemented as URL-only, which would violate NFR-D01's non-nullable publisher-name requirement.

---

## AI disclaimer

**News detail page:** EXPERIENCE.md IA tree lists "AI disclaimer (non-removable)" as the last item in the News Detail page structure. DESIGN.md Disclaimer component section explicitly states it is "inline, non-removable" and lists "after every AI analysis on detail pages" as a placement. The non-removable requirement is stated structurally in DESIGN.md Do's and Don'ts: "Don't: Use a feature flag, prop, or conditional rendering to suppress the disclaimer." Coverage is complete for the News Detail surface.

**Daily Brief card:** DESIGN.md DailyBriefCard anatomy references "footer: generation timestamp + disclaimer link" (DESIGN.md line 294 "generation timestamp + 'Not investment advice' disclaimer text"). The FR-D05 canonical text is: *"AI-generated market summary for informational purposes only. Not investment advice."* EXPERIENCE.md DailyBriefCard anatomy (Zone 2 footer) says "'Not investment advice' disclaimer text" without specifying the full canonical string. The word "link" in DESIGN.md's DailyBriefCard footer suggests the disclaimer is a hyperlink to the About page rather than inline text — this contradicts FR-A04's "if analysis renders, the disclaimer renders."

**Theme Detail page:** Neither DESIGN.md nor EXPERIENCE.md specifies that the Theme Detail page carries an AI disclaimer. FR-A04 covers "every surface that renders AI-generated analysis" — Theme Detail renders theme descriptions and constituent article analyses, making it a covered surface. No disclaimer placement is specified for this surface.

**Non-removable structural statement:** Present and explicit. DESIGN.md Do's and Don'ts directly prohibits feature-flag or conditional suppression. This is sufficient for developer guidance.

**Exact disclaimer text:** FR-A04 canonical: *"AI-generated analysis is for informational purposes only and does not constitute investment advice."* FR-D05 canonical: *"AI-generated market summary for informational purposes only. Not investment advice."* Neither DESIGN.md nor EXPERIENCE.md quotes either string verbatim. The Microcopy Examples section in EXPERIENCE.md gives: "AI-generated analysis is for informational purposes only and does not constitute investment advice" — this matches FR-A04 exactly and is the closest the spines come to locking the string. FR-D05's alternate wording for the Daily Brief is not surfaced separately.

---

## Sentiment color enforcement

DESIGN.md frontmatter includes an inline comment on the color tokens: `# Sentiment — enforced at data layer, not CSS convention`. The Colors section explicitly states: "These three colors are data-layer assignments, not CSS convention. Green always means bullish/positive. Red always means bearish/negative. They must never be used decoratively or reassigned." The Do's and Don'ts section reinforces: "Don't: Use green for decorative purposes, success states, or positive UI feedback unrelated to market direction."

The inversion prohibition is implicit in the "must never be reassigned" wording but is not stated as an explicit rule: "Do not invert green/red mapping." This is a minor gap — a developer building a loss/gain display in a different context could technically use green for a UI success toast without reading this as a violation.

FR-UX04's phrase "enforced at data layer" is echoed in DESIGN.md. Coverage is strong.

One color discrepancy: DESIGN.md Do's section reads "Use green (`positive: #2d6a4f`)" but the token table defines `positive: "#16a34a"`. The hex values differ. This is a minor but concrete error that would produce incorrect color if the Do's section is used as implementation reference.

---

## Error and empty states

EXPERIENCE.md State Patterns section is thorough. Error / Unavailable rules explicitly state: "Error states are never empty or silent." All three failure tiers (full-page API failure, category feed failure, individual card failure) require timestamped messages. The "Last attempted [time]" pattern directly addresses FR-UX07's timestamp requirement.

The specific PRD risk ("empty news feed misread as no news = calm market") is addressed verbatim in DESIGN.md Do's and Don'ts: "Don't: Show empty components, zero-state cards, or silent failures — an empty news feed can be misread as 'no news = calm market.'" Coverage is complete.

Empty state (genuine no-articles case) is also specified as a first-class state with explanatory text. No gaps.

---

## Staleness indicators

**Feed staleness (FR-N06, 60-min market hours):** EXPERIENCE.md State Patterns / Stale Data — threshold 1 covers exactly this: "If most recent article in a category is >60 min old during 09:00–18:00 Bangkok time, a yellow-amber banner appears above the feed." Coverage complete.

**Analysis staleness (FR-A06, 24h):** Threshold 2 covers: "If AI analysis is >24h old, an inline indicator below the insight box on the detail page." DESIGN.md NewsCard section also specifies: "Stale analysis: If AI analysis timestamp is >24 hours old, an amber inline indicator appears below the insight box." Coverage complete on both thresholds.

Both staleness contexts are distinguished: amber/yellow is used for staleness signals to avoid collision with the red negative-sentiment color. This is explicitly noted in EXPERIENCE.md: "stale ≠ bad news."

One gap: the stale analysis indicator is specified for the NewsCard (list view) and the detail page, but there is no explicit staleness specification for the Theme Detail page's constituent article analyses, which also render AI analysis.

---

## Source attribution

FR-UX05 requires the News Detail page to display "source name with link to original article." EXPERIENCE.md IA tree for the News Detail page lists "Headline + source link" as the first element — this names the link but does not explicitly call out source name as a required separate element. A developer could render a bare hyperlink on the headline with no visible publisher name and satisfy "source link."

NFR-D01 requires source name + URL to be non-nullable at every layer including UI display. The IA tree entry "Headline + source link" is ambiguous. EXPERIENCE.md External Links section states: "All external links include visible source name — no bare URLs." This partially covers it, but the rule is in the Interaction Primitives section (applies to all links) rather than the News Detail page spec itself.

DESIGN.md NewsCard footer anatomy specifies: "Source name · Relative time" as the footer row. This establishes source name as a required field on the list card. The News Detail page anatomy in EXPERIENCE.md does not include a matching explicit "source name (non-nullable)" line.

---

## Financial language guard

DESIGN.md Design Philosophy: "Explicitly avoided: prediction language, trading signals, recommendation wording, urgency-driven design patterns (red flashes, countdown timers, 'act now' copy)." EXPERIENCE.md Design Philosophy section provides the most specific list:

- Prediction language: examples given ("will rise," "expect growth," "likely to drop")
- Trading signals: examples given ("buy," "sell," "hold," "accumulate")
- Recommendation wording: examples given ("you should," "consider," "our pick")
- Urgency patterns: examples given (red flashing indicators, countdown timers, "act now" copy, exclamation marks in UI copy)

This is specific enough to guide a developer writing AI prompt copy or UI microcopy. The four categories with concrete examples constitute actionable guidance.

One gap: the prohibition covers UI microcopy and urgency patterns but does not explicitly state that AI-generated summary text is also bound by these rules, or that the AI system prompt must enforce them. NFR-AI01 covers the system prompt requirement separately in the PRD, but neither spine cross-references it. A developer reading only the spines does not see a pointer to the system prompt constraint.

---

## About/Disclaimer page

NFR-C02 requires the About page to include: scope of AI analysis, data sources used, limitations of AI-generated content, and absence of regulatory authorization.

EXPERIENCE.md IA tree for About / Disclaimer:
- Product description and scope
- AI analysis limitations
- Data sources used
- No investment advice statement
- Full regulatory disclaimer

All four NFR-C02 sub-items are present. The IA entry "absence of regulatory authorization" maps to "Full regulatory disclaimer." "No investment advice statement" is a fifth item beyond what the PRD requires. Coverage is complete.

No surface specification beyond the IA tree (no layout, no required copy blocks). This is acceptable for an MVP — the IA establishes the surface exists and what it must contain.

---

## Findings

- **[critical]** Theme Detail page carries no AI disclaimer specification (EXPERIENCE.md IA tree, `/trends/[id]`). FR-A04 applies to every surface rendering AI-generated analysis; Theme Detail renders both theme descriptions and constituent article analyses. *Fix:* Add "AI disclaimer (non-removable)" to the Theme Detail IA entry and to the ThemeCard component pattern's constituent article NewsCard rendering note.

- **[critical]** Daily Brief card disclaimer risks being implemented as a link rather than inline text. DESIGN.md DailyBriefCard footer says "disclaimer link" (implying hyperlink to About page). FR-A04 states: "If analysis renders, the disclaimer renders" — a link navigating away does not satisfy this. *Fix:* Change "disclaimer link" to "inline disclaimer text" in DailyBriefCard anatomy in both DESIGN.md and EXPERIENCE.md; specify FR-D05 canonical string verbatim.

- **[high]** News Detail page source attribution is ambiguous. EXPERIENCE.md IA entry says "Headline + source link" without naming source publisher as a distinct required text element. A developer could render a bare hyperlink, violating NFR-D01. *Fix:* Update News Detail IA entry to: "Headline + source name (non-nullable) + link to original article (non-nullable)."

- **[high]** Positive-color hex mismatch in DESIGN.md. Do's section references `positive: #2d6a4f`; token table and frontmatter define `positive: #16a34a`. These differ. *Fix:* Align Do's section hex to `#16a34a` to match the defined token.

- **[high]** Staleness indicator not specified for Theme Detail page constituent article analyses. If an analysis on a Theme Detail page is >24h old, no behavior is defined. FR-A06 applies. *Fix:* Add staleness indicator rule to the ThemeCard component pattern for constituent articles.

- **[medium]** Exact canonical disclaimer strings are not quoted verbatim in either spine. FR-A04 and FR-D05 strings differ slightly; EXPERIENCE.md microcopy section quotes the FR-A04 string but not FR-D05's. *Fix:* Add a "Required disclaimer strings" section to EXPERIENCE.md quoting both verbatim, by FR reference, so developers copy-paste rather than paraphrase.

- **[medium]** Financial language prohibition does not explicitly bind the AI system prompt. The prohibition is stated for UI microcopy but neither spine cross-references NFR-AI01 (system prompt as version-controlled code). A developer writing only the AI prompt layer may not see this requirement. *Fix:* Add a note in the Design Philosophy explicitly stating that these prohibitions apply to AI-generated output text and are enforced via the system prompt (see NFR-AI01).

- **[low]** Inversion prohibition is implicit. "Must never be reassigned" is present, but the explicit prohibition "Do not invert green = positive / red = negative" is not stated. *Fix:* Add one Do's/Don'ts line: "Don't: Invert the green/red sentiment mapping under any circumstance, including in success states, loading indicators, or non-market UI."
