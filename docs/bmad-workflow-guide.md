# From Idea to Implementation-Ready: The BMAD Workflow

**A case study using ASK (Aware Signals & Knowledge) — written for my future self, my friends, and anyone transitioning from vibe coding to structured AI-assisted development.**

---

## Who This Guide Is For

- **Future me (3 months from now):** You've forgotten half of this. Start at "Recommended Workflow" and work backwards when you get confused.
- **Friends new to BMAD:** You've heard me talk about this. This is the actual experience, not the pitch.
- **Developers coming from vibe coding:** You already know how to build things. This is about building the *right* thing *completely* before writing a single line of feature code.

---

## The Project: ASK — Aware Signals & Knowledge

ASK is an AI-powered financial research platform for Thai retail investors. It aggregates financial news, generates per-article AI impact analysis, groups articles into market themes, and delivers a daily market brief — all without requiring users to read dozens of articles.

**Why I chose this project for my first BMAD run:**

1. **It's real.** This isn't a toy. Thai retail investors genuinely lack AI-powered market tools compared to US-centric options like Bloomberg or Seeking Alpha.
2. **It has compliance constraints.** Anything touching financial information and AI needs disclaimers, WCAG accessibility, and careful error states. These are the exact pressures that expose gaps in vibe-coded products.
3. **It has multiple system components.** A frontend (Next.js), a backend (FastAPI), an orchestration layer (n8n), and an AI model (Claude) — all talking to each other via webhooks. Complexity reveals whether your planning is actually good.
4. **I already had a bootstrapped codebase.** BMAD works for both new projects (greenfield) and existing ones (brownfield). ASK was brownfield — the scaffold existed but the planning hadn't happened. This is the most common real-world situation.

---

## What Is BMAD?

BMAD (Business-driven Method for AI-assisted Development) is a structured workflow for building software with AI agents. The core insight is:

> **AI agents are incredibly capable at execution. They are terrible at knowing what to execute without good specifications.**

BMAD solves this by separating planning from coding. You produce high-quality planning artifacts (PRD, architecture, UX specs, stories) *before* any feature code is written. Then your AI coding agent has everything it needs to implement correctly on the first attempt — with no guessing.

Think of it like this: vibe coding is asking a contractor to build you a house while you describe your preferences out loud. BMAD is handing that contractor a full set of architectural drawings, material specs, and inspection checklists before they pick up a tool.

### The BMAD workflow at a glance

```
Idea
  ↓
[bmad-create-prd]         → Product Requirements Document (PRD)
  ↓
[bmad-create-architecture] → Architecture Decision Document
  ↓
[bmad-ux]                  → DESIGN.md + EXPERIENCE.md (UX spines)
  ↓
[bmad-create-epics-and-stories] → epics.md (6 epics, 26 stories)
  ↓
[bmad-check-implementation-readiness] → Readiness Report
  ↓
[bmad-dev-story]           → Developer tickets (implementation phase)
  ↓
Code
```

Each step produces a document. Each document is a versioned artifact committed to git. They build on each other — later steps reference earlier ones.

---

## Phase 1 — Product Requirements Document

**Skill:** `bmad-create-prd`
**Input:** Your product idea (brain dump, notes, conversation)
**Output:** `_bmad-output/planning-artifacts/prds/prd-ASK-2026-06-20/prd.md`

### What this agent does

The PRD agent interviews you like a product manager who needs to write a specification that will survive contact with an engineering team. It probes:

- Who exactly is the user? (Not "investors" — specific personas with specific jobs and constraints)
- What problem are you actually solving? (Not "news is hard" — *why* is news hard for *this person*)
- What is out of scope? (Critical — everything not listed will get built anyway if you don't say so)
- What are the acceptance criteria at the functional level?
- What are the non-functional requirements? (Performance, reliability, compliance, accessibility)
- What are the open questions that could block development?

### What ASK's PRD produced

- **29 Functional Requirements** across 5 domains (news aggregation, AI analysis, market trends, daily brief, navigation/UX)
- **14 Non-Functional Requirements** (performance, reliability, data integrity, AI output standards, compliance, accessibility)
- **3 User Journeys** with named protagonists: Nam (working professional, 10 minutes over coffee), Lek (beginner investor, 4 minutes on phone), Wanida (active investor, 12 minutes doing sector research)
- **6 Open Questions** — 2 flagged as must-resolve before development begins

### Why this matters

The user journeys are the most underrated output. Naming your users ("Nam, 34, marketing manager in Bangkok") and writing their session as a story forces you to answer: *what must work for this person in this exact situation?*

When Lek opens the Energy category on his phone and finds the OPEC news item — the sentiment badge must be readable, the AI summary must be in plain language, and the mobile layout must be functional. That's a real acceptance criterion hidden inside a story.

---

## Phase 2 — Architecture

**Skill:** `bmad-create-architecture`
**Input:** PRD + existing codebase (brownfield)
**Output:** `_bmad-output/planning-artifacts/architecture.md`

### What this agent does

The architecture agent reads your PRD, surveys your existing code, and produces a decision document — not a diagram collection. Every decision is justified by a specific requirement it serves.

For ASK, the key decisions were:

| Decision | Requirement it serves |
|---|---|
| ISR with 60s revalidate on all news endpoints | NFR-P02: feed refreshes within 60s |
| AwareDatetime on all Pydantic fields (UTC storage) | NFR-D03: timezone-aware datetimes; Bangkok display |
| No `alias=` in Pydantic, snake_case both sides | Schema sync discipline — prevents silent type mismatches |
| Idempotent webhook endpoints (payload hash dedup) | NFR-R01: n8n retries must not create duplicate records |
| Suspense boundary on every async Server Component | Next.js 15: missing boundary = silent production failure |
| isFinite() guard before every toFixed() | NFR-D02: NaN must never reach the DOM |

### The brownfield addition

Because ASK's codebase already existed, the architecture doc also captured **what was missing**: the testing infrastructure. Vitest + React Testing Library for the frontend; pytest + pytest-asyncio for the backend. This became Epic 1.

### Why this matters

Architecture decisions made early and written down prevent the worst class of technical debt: the kind where you *know* there's a better way but the codebase has already assumed the wrong one. The `AwareDatetime` rule is a perfect example — if you don't enforce it at the schema boundary, you eventually render Bangkok times as UTC and nobody notices until a user asks "why does it say this article was published at 3am?"

---

## Phase 3 — UX Design

**Skill:** `bmad-ux`
**Input:** PRD + Architecture
**Output:** Two peer contracts:
- `DESIGN.md` — the visual identity spine (colors, typography, component specs, do's and don'ts)
- `EXPERIENCE.md` — the behavioral spine (IA, component behaviors, state patterns, accessibility floor, key flows)

Plus validation artifacts from a three-lens review:
- `review-rubric.md` — coverage and completeness check
- `review-accessibility.md` — WCAG 2.1 AA audit
- `review-compliance.md` — financial product compliance audit

### What this agent does

The UX agent is a facilitator, not a designer. It elicits *your* vision through targeted questions, produces visual tools to help you see options, and captures decisions in two structured documents that become the authoritative visual and behavioral reference for every story.

**DESIGN.md** is based on the Google Labs design.md specification. It holds color tokens, typography, spacing, component visual specs, and a Do's/Don'ts section. Everything in the codebase that touches visual presentation traces back here.

**EXPERIENCE.md** holds the information architecture, how components *behave* (not how they look), state patterns (loading, error, empty, pending, stale), accessibility requirements, and named user flows.

### The validation: where bugs were caught before any code was written

This is the step I underestimated most. After producing the UX spines, the agent ran a three-lens validation using parallel review subagents. The reviewers found:

**Critical (6 findings):**
- `camel (#B2967D)` was assigned to body text and section labels — contrast ratio 2.39:1 on white. **Fails WCAG 4.5:1 by a wide margin.** Every label in the design was inaccessible.
- `positive (#16a34a)` was 4.13:1 on its own green background (`positive-bg`). **Fails WCAG 4.5:1** for text on background.
- The `DailyBriefCard` footer disclaimer was specified as a "link to the About page." A removable, navigable disclaimer violates financial compliance requirements — the disclaimer must be inline, non-navigable, and structurally non-removable.
- The Theme Detail page had no AI disclaimer at all (FR-A04 gap).
- Two other contrast failures in pending/muted states.

**The fixes were elegant precisely because they were caught early:**
- `camel` kept its hex value (brand color preserved) but its *role* was restricted to accents-only — no text. All text roles reassigned to `cocoa (#7D5A44)` which already existed in the token set.
- `positive` darkened minimally: `#16a34a` → `#15803d` (green-700). Small enough to preserve visual identity; passes at ~5.0:1.
- The pending state "muted" feeling was achieved through font-weight (400 vs 700) instead of opacity — full opacity, lighter weight. No contrast issue, same visual communication.

These six findings would have become six bugs in production if not caught here.

### The "spines win" principle

DESIGN.md and EXPERIENCE.md are the single source of truth. If a mockup in `.working/` contradicts them, the spine wins. If a developer's interpretation contradicts them, the spine wins. This prevents the slow drift that kills design consistency in long projects.

---

## Phase 4 — Epics and User Stories

**Skill:** `bmad-create-epics-and-stories`
**Input:** PRD + Architecture + DESIGN.md + EXPERIENCE.md + project-context.md
**Output:** `_bmad-output/planning-artifacts/epics.md` (6 epics, 26 stories)

### What this agent does

This is a four-step workflow (step files loaded one at a time):

1. **Step 1 — Requirements extraction:** The agent reads all source documents and builds a complete inventory: 29 FRs, 14 NFRs, 25 UX design requirements, architecture rules.

2. **Step 2 — Epic design:** The agent proposes the epic structure and you review it. You're not approving a wall of text — you're approving the *grouping logic*. Which FRs belong together? Which user experience should ship as a complete unit?

3. **Step 3 — Story generation:** Stories are written epic by epic. Each story has a user/system voice ("As a retail investor..." or "As the n8n orchestration system..."), Given/When/Then acceptance criteria, and explicit FR/NFR references. You review and approve each epic before the next is drafted.

4. **Step 4 — Final validation:** Coverage matrix, dependency check, story quality check.

### Key decisions made during epic design

**Decision: Keep Epic 2 as one large epic.**

The agent proposed splitting the news experience across multiple epics. I explicitly chose to keep it unified: "The news feed, article detail page, category filtering, responsive layouts, accessibility, and AI insight presentation all belong to one complete user experience and should be delivered together."

This was the right call. The `NewsCard`, `AIInsightBox`, `SentimentBadge` components would have been built and rebuilt across multiple epics — unnecessary churn in the same files.

**Decision: Epic 1 is technical (but justified).**

Epic 1 (test infrastructure) doesn't deliver user value directly. The implementation readiness check later flagged this as a minor concern. But for a brownfield project with *no testing infrastructure*, it's the right first step — every subsequent story's acceptance criteria depend on a working test harness.

### What the stories look like

Each story follows this structure:

```
### Story 2.4: SentimentBadge & AIInsightBox Components

As a retail investor,
I want AI sentiment shown with both a color dot and a text label...

Acceptance Criteria:

Given SentimentBadge receives sentiment: "bullish" | "bearish" | "neutral"
When it renders
Then it shows a colored dot AND a text label — never color alone
And aria-label="Market sentiment: bullish" is on the badge element
And badge text uses positive (#15803d) / negative (#dc2626) / neutral-text (#6b6560)
    — all verified ≥ 4.5:1 against their respective badge backgrounds
```

The acceptance criteria are specific enough that a developer (human or AI agent) can implement correctly without asking questions. The contrast ratios are right there. The ARIA pattern is specified. The forbidden pattern (color alone) is explicit.

---

## Phase 5 — Implementation Readiness Check

**Skill:** `bmad-check-implementation-readiness`
**Input:** All five planning artifacts
**Output:** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-06-20.md`

### What this agent does

This is an independent validation run (not self-review). Six steps:

1. **Document discovery** — finds all artifacts, flags duplicates
2. **PRD analysis** — re-extracts all FRs and NFRs from source
3. **Epic coverage validation** — maps every FR/NFR to a story that covers it
4. **UX alignment** — checks that UX spines are consistent with PRD and architecture
5. **Epic quality review** — checks for technical epics, forward dependencies, vague ACs
6. **Final assessment** — readiness verdict with specific blockers

### ASK's result

**READY for Epics 1–2.** Implementation can begin immediately.

**Conditionally READY for Epics 3–6.** Two open questions from the PRD must be resolved first:
- OQ-1: Which specific news sources (Reuters, Bangkok Post, SET API)? Needed before n8n workflow design.
- OQ-2: Which SET ticker symbols are supported? Needed before AI system prompt finalization.

Zero critical or major issues. Five minor findings, all noted.

### Why you need this step even if you think you're done

After all that planning work, it's tempting to skip the readiness check. Don't. This agent found that the nav label ("Stocks" in the existing codebase vs "Trends" in the PRD) was an undecided discrepancy. It found that Epics 4, 5, and 6 were missing the `NFRs covered:` line in their epic summaries (a documentation gap that would have confused future maintainers). These aren't blockers, but they're exactly the kind of small inconsistency that becomes a big confusion later.

---

## Phase 6 — Technical Documentation

**Agent:** `bmad-agent-tech-writer` (Paige)
**Input:** All planning artifacts + codebase
**Output:** `README.md`, `docs/bmad-workflow-guide.md` (this document)

Paige transforms the planning artifacts into developer-facing documentation. The README rewrite took the project from a one-sentence placeholder to a complete developer reference with an architecture diagram, data flow sequences, critical implementation rules with code examples, and a feature status table.

---

## Lessons Learned

### 1. The validation step is where the real value is

I expected the UX validation to be a rubber stamp. It found six critical issues that would have shipped as production bugs. Catching a WCAG contrast failure in a spec takes 5 minutes to fix. Catching it after a developer has implemented every text label across 9 components takes hours.

### 2. Open questions in the PRD are real blockers, not notes

OQ-1 and OQ-2 felt like minor details when I wrote them. The readiness check made clear they were blocking actual stories. If you don't have a news source list, you can't configure n8n. If you don't have a SET ticker list, you can't validate the AI system prompt's output. Write open questions down *and then resolve them.*

### 3. The epic structure conversation is important — don't skip it

When the agent proposes epics, it's not just asking for a thumbs up. It's asking: *what is a shippable unit of user value?* The decision to keep Epic 2 unified (rather than splitting it) saved churn across multiple files. If you just say "looks good" without thinking, you'll get a technically correct but practically awkward decomposition.

### 4. The spines are not the mockups

`DESIGN.md` and `EXPERIENCE.md` are decision documents. The `.working/` mockups (key screen HTML files) are visual references to help you see layout, but if they conflict with the spines, the spines win. This distinction matters when a developer asks "which one do I follow?"

### 5. Committing artifacts to git is not optional

Planning artifacts are version-controlled deliverables. They should be in git just like code. When a future developer (or AI agent) is implementing Story 5.3 three months from now, they need to be able to check out the repo and find all the context in one place. I committed each artifact separately with a meaningful commit message.

---

## Common Mistakes Beginners Make

### Mistake 1: Treating BMAD as a fancy prompt template

BMAD isn't a prompt. It's a workflow with state (the `stepsCompleted` frontmatter in output files), sequential steps (each step file loads the next), and persistent memory across sessions (the memory system at `.claude/projects/`). Treating it as "ask AI to write PRD, done" misses the whole point.

### Mistake 2: Skipping UX before implementation

The most common skipped step. "I'll design as I build." What actually happens: you build a component, then realize the state machine is wrong, then rebuild it. The UX spine takes a few hours. Rebuilding a component takes days and creates regression risk.

### Mistake 3: Writing vague acceptance criteria

"User can see the news feed" is not an acceptance criterion. "Given the news feed page loads, when it renders, then NewsCard components appear sorted by `published_at` descending, with a staleness banner if the most recent item is >60 minutes old during market hours" — that is an acceptance criterion. The specificity is what makes it implementable by an AI coding agent without interpretation.

### Mistake 4: Not resolving open questions before starting

See Lesson 2 above. Open questions that say "must resolve before development" mean *before development*. Not before launch. Not before the PR. Before the first story in that epic is worked.

### Mistake 5: Approving everything without reading

The epic and story generation is collaborative. When the agent presents Epic 3 and asks for approval, read the stories. Each story becomes a developer ticket. If the acceptance criteria for Story 3.1 says "HTTP 422 for missing fields" and you actually need it to return 400 for a specific reason, fix it now. Fixing it after implementation is a regression.

### Mistake 6: Not running the implementation readiness check

It takes 10 minutes and it's automated. The output is a full coverage matrix and a written verdict. There is no good reason to skip it.

---

## What I Misunderstood Initially

**I thought BMAD was about prompting better.**

It's not. It's about producing better *inputs* for AI agents. The prompting happens automatically inside the skill files. What you're doing is thinking clearly about your product — what it does, who it's for, how it works, what the rules are. BMAD structures that thinking process and captures the output in a form that AI coding agents can consume without interpretation.

**I thought the UX step was just for designers.**

DESIGN.md and EXPERIENCE.md are for developers. A developer implementing `SentimentBadge` should be able to open DESIGN.md, read the `SentimentBadge` component spec, and know: pill shape, always dot + text, three states, aria-label pattern, contrast ratios for each state. No guessing, no Slack messages, no design review meetings.

**I thought "planning" meant I'd spend less time on the fun coding part.**

The opposite happened. Because every story has clear acceptance criteria and every component has a detailed spec, implementation is faster. The AI coding agent produces better first drafts. Review cycles are shorter because "does this match the spec?" is a clear question with a clear answer.

**I thought the epics were for organizing work, not for architectural decisions.**

The decision to keep Epic 2 unified was an architectural decision: don't build the same components in multiple epics. The epic structure shapes how the codebase grows. "We'll add CategoryFilterBar in Epic 2 because it shares the same page as NewsCard and NewsDetail" is an architectural constraint encoded in the epic boundary.

---

## What I Learned After Completing the Workflow

**The workflow produces a second brain for the project.**

The five planning artifacts (PRD, Architecture, DESIGN.md, EXPERIENCE.md, epics.md) together contain everything a new developer — human or AI — needs to understand the project without talking to me. Three months from now, when I come back to this codebase, I can read epics.md and know exactly where I left off and what Story 6.3 requires.

**BMAD is a forcing function for decisions you'd otherwise defer.**

"Which specific news sources?" is a question I would have deferred indefinitely in vibe coding mode. The PRD's open questions section made it explicit, the readiness check flagged it as a blocker, and now it has a deadline: before Epic 3 begins. The workflow surfaces the things you're avoiding.

**Small fixes are free before implementation, expensive after.**

The contrast ratio fix (`camel` restricted from text roles) took 20 minutes in the UX spec. Implementing that fix after a developer has built all the components — finding every instance of `text-camel`, testing each one, writing regression tests — would take hours. The earlier you catch a decision, the cheaper the fix.

**The readiness report is a communication tool, not just a check.**

I can send `implementation-readiness-report-2026-06-20.md` to a developer starting on the project and they will know: here's what's ready, here's what's blocked, here's why. No meeting required.

---

## Recommended Workflow for Future Projects

```
Week 1: Planning
─────────────────
Day 1-2   bmad-create-prd
          → Resolve all "must resolve before development" open questions immediately
          → Don't leave OQs open overnight

Day 3     bmad-create-architecture
          → Pay attention to the "cross-cutting concerns" section
          → The rules here become the critical rules developers follow

Day 4-5   bmad-ux
          → Run all three validation lenses (rubric + accessibility + compliance)
          → Fix all critical findings before moving on — they compound

Week 2: Story Creation
───────────────────────
Day 6-7   bmad-create-epics-and-stories
          → Read every story before approving
          → Push back on epic boundaries if they split related components
          → Schema stories (like 2.1, 4.1, 5.1) should always be first within their epic

Day 8     bmad-check-implementation-readiness
          → Treat the report as the handoff document to implementation
          → Any "minor" finding that could confuse a developer: fix it now

Week 2-3: Documentation
────────────────────────
Day 9     bmad-agent-tech-writer (Paige)
          → Rewrite README with architecture diagram and developer guide
          → Commit each artifact to git separately with meaningful messages

Week 3+: Implementation
────────────────────────
Day 10+   bmad-dev-story (one story at a time)
          → Each story becomes an implementation ticket for the dev agent
          → Start with Epic 1 (infrastructure) before any feature work
```

### The most important rule

**Never start a story until all the stories it depends on are complete and tested.** The acceptance criteria in Story N.2 assume Story N.1's outputs exist. If they don't, the developer (human or AI) will invent missing pieces — and those inventions will conflict with what Story N.1 actually builds.

### Signs your planning is good enough

- Every story's acceptance criteria are testable without reading any other document
- You can point to a specific story for any FR from the PRD
- A developer who has never heard of your project could implement Story 2.5 with only `epics.md` and `project-context.md`
- The open questions list is empty (or every remaining OQ is explicitly non-blocking)

### Signs your planning needs more work

- Acceptance criteria use words like "appropriate," "reasonable," or "standard"
- The same component spec appears in multiple stories without a single authoritative source
- You have open questions labeled "must resolve" that are still open when you start coding
- Your epics don't correspond to anything a user could experience end-to-end

---

## Quick Reference: BMAD Skills Used for ASK

| Skill | Role | Key Output |
|---|---|---|
| `bmad-create-prd` | Product Manager | PRD with FRs, NFRs, user journeys, open questions |
| `bmad-create-architecture` | Architect | Architecture decisions with per-requirement justification |
| `bmad-ux` | UX Facilitator + Validator | DESIGN.md, EXPERIENCE.md, three-lens validation report |
| `bmad-create-epics-and-stories` | Product Strategist | Epics with Given/When/Then stories and FR traceability |
| `bmad-check-implementation-readiness` | QA Reviewer | Readiness report with coverage matrix and verdict |
| `bmad-agent-tech-writer` (Paige) | Technical Writer | README, workflow guides, developer documentation |
| `bmad-dev-story` | Story Executor | Developer tickets for implementation (Phase 4, not yet started) |

---

## Where to Find Everything

```
ASK/
├── README.md                                    ← Start here
├── _bmad-output/
│   ├── project-context.md                       ← 91 critical implementation rules
│   └── planning-artifacts/
│       ├── prds/prd-ASK-2026-06-20/
│       │   └── prd.md                           ← Product Requirements
│       ├── architecture.md                      ← Architecture decisions
│       ├── ux-designs/ux-ASK-2026-06-20/
│       │   ├── DESIGN.md                        ← Visual identity (authoritative)
│       │   ├── EXPERIENCE.md                    ← Behavioral specs (authoritative)
│       │   └── validation-report.html           ← UX validation findings
│       ├── epics.md                             ← All 26 stories with ACs
│       └── implementation-readiness-report-2026-06-20.md
└── docs/
    └── bmad-workflow-guide.md                   ← This document
```

---

*Written 2026-06-20 · ASK case study · BMAD Method v6.8.0*
