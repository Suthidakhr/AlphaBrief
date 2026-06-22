---
status: done
epic: 3
story: 3
story_key: "3-3-ai-system-prompt-version-controlled-constraints"
created: 2026-06-22
baseline_commit: d7a868b883665cea6955e95745d79a03d26b3047
---

# Story 3.3: AI System Prompt — Version-Controlled Constraints

**Status:** done

## Story

As a developer,
I want the AI analysis system prompt committed to the repository as application code,
So that every change to AI behavior is tracked in git history, reviewed in PRs, and deployable without manual intervention in n8n.

## Acceptance Criteria

### AC1 — System prompt file exists at expected path with four constraint behaviors

**Given** `backend/app/ai/prompts.py` containing a `SYSTEM_PROMPT` string constant
**When** it is read
**Then** it explicitly constrains all four required behaviors:
  1. No price predictions
  2. No specific security recommendations
  3. Output sentiment must be exactly one of `bullish`, `bearish`, `neutral`
  4. Every response must include the phrase "for informational purposes only and does not constitute investment advice"

### AC2 — Prompt is version-controlled application code

**Given** the file `backend/app/ai/prompts.py`
**When** a developer changes its content
**Then** the change appears in `git diff` and must be committed — it is not a runtime-editable string stored in a database or n8n environment variable (NFR-AI01)

### AC3 — Tests assert all four constraint phrases are present

**Given** `backend/tests/ai/test_system_prompt.py`
**When** it runs
**Then** it asserts the prompt file exists at the expected path
**And** it asserts all four constraint phrases are present in the prompt content
**And** the test fails immediately if the file is deleted or any constraint phrase is removed

### AC4 — AI quality checklist document created

**Given** `docs/ai-quality-checklist.md`
**When** it is created
**Then** it documents the manual spot-check process for NFR-AI02: select 20 random articles, verify sentiment classification, record the error rate, and flag any run where error rate ≥ 15% for prompt review before public launch

---

## Tasks / Subtasks

- [x] Task 1: Create `backend/app/ai/` package and `prompts.py` with `SYSTEM_PROMPT` constant (AC1, AC2)
  - [x] Create `backend/app/ai/__init__.py` (empty — creates the Python package)
  - [x] Create `backend/app/ai/prompts.py` with `SYSTEM_PROMPT: str` constant
  - [x] Prompt must contain constraint phrase for (1) no price predictions
  - [x] Prompt must contain constraint phrase for (2) no specific security recommendations
  - [x] Prompt must enumerate all three sentiment values: `bullish`, `bearish`, `neutral`
  - [x] Prompt must contain the exact phrase: "for informational purposes only and does not constitute investment advice"
  - [x] Prompt must instruct Claude to output valid JSON with all `AIAnalysis` fields: `summary`, `affected_sectors`, `affected_stocks`, `sentiment`, `analysis_at`

- [x] Task 2: Create `backend/tests/ai/` package and `test_system_prompt.py` (AC3)
  - [x] Create `backend/tests/ai/__init__.py` (empty — creates the test package)
  - [x] Create `backend/tests/ai/test_system_prompt.py` with 5 sync (non-async) test functions
  - [x] `test_prompt_file_exists` — assert `backend/app/ai/prompts.py` exists using `pathlib.Path`
  - [x] `test_no_price_predictions_constraint` — assert "price prediction" in `SYSTEM_PROMPT.lower()`
  - [x] `test_no_security_recommendations_constraint` — assert "security recommendation" in `SYSTEM_PROMPT.lower()`
  - [x] `test_sentiment_values_constrained` — assert "bullish", "bearish", "neutral" all in `SYSTEM_PROMPT`
  - [x] `test_disclaimer_phrase_present` — assert "for informational purposes only and does not constitute investment advice" in `SYSTEM_PROMPT.lower()`

- [x] Task 3: Create `docs/ai-quality-checklist.md` (AC4)
  - [x] Create the checklist document at `docs/ai-quality-checklist.md` (NOT inside `backend/`)
  - [x] Document the 20-article random sample selection process
  - [x] Document the sentiment verification workflow (expected vs actual)
  - [x] Include the error rate calculation formula
  - [x] Include the ≥ 15% error rate trigger rule — prompt review required before public launch
  - [x] Reference NFR-AI02 explicitly

- [x] Task 4: Run full pytest suite and verify no regressions (AC3)
  - [x] Run `cd backend && pytest` — 112/112 pass (107 pre-existing + 5 new)
  - [x] New tests are sync (not async) — no `client` fixture, no `AsyncClient`, no `autouse` fixture needed
  - [x] Verify `tests/routers/` and `tests/models/` tests are unaffected

### Review Findings

- [x] [Review][Patch] `GET /news?limit=100` in checklist is invalid — max limit is 50, returns HTTP 422 [`docs/ai-quality-checklist.md` Step 1]
- [x] [Review][Defer] `test_prompt_file_exists` is redundant — `from app.ai import prompts` fires first if file deleted [`backend/tests/ai/test_system_prompt.py:8`] — deferred, harmless pre-existing design
- [x] [Review][Defer] Substring assertions catch phrase deletion but not dilution — a rewrite keeping keywords but weakening constraints passes [`backend/tests/ai/test_system_prompt.py:13,18`] — deferred, acceptable for MVP
- [x] [Review][Defer] Second prompt constant added to prompts.py would bypass all tests — no inventory test [`backend/app/ai/prompts.py`] — deferred, future risk out of scope

---

## Dev Notes

### Story Context

Story 3.3 is a non-HTTP story — no FastAPI endpoints, no webhook, no `news_store`. It establishes the AI analysis contract as version-controlled code (NFR-AI01) and creates the quality assurance checklist (NFR-AI02).

This story is a prerequisite for Story 3.4 (n8n workflow configuration), which will reference the system prompt from `backend/app/ai/prompts.py` when documenting how n8n passes it to Claude.

### Current Backend Structure

```
backend/app/
  __init__.py
  main.py
  models/
    __init__.py
    schemas.py
  routers/
    __init__.py
    news.py
    market.py
    trends.py
    webhooks.py
  services/
    __init__.py
    mock_data.py
    news_store.py
```

**No `ai/` package exists.** Story 3.3 creates it. No changes to any existing files — this is a pure addition.

### `backend/app/ai/prompts.py` — Exact Content Pattern

The file must define a module-level string constant named `SYSTEM_PROMPT`. Use triple-quoted string. Keep it importable as `from app.ai.prompts import SYSTEM_PROMPT`.

The four constraint behaviors the test will assert (case-insensitive substring checks):
1. `"price prediction"` must appear in the prompt
2. `"security recommendation"` must appear in the prompt
3. `"bullish"`, `"bearish"`, `"neutral"` must each appear in the prompt (case-sensitive is fine since they are the canonical values)
4. `"for informational purposes only and does not constitute investment advice"` must appear in the prompt

**Reference prompt (implement this or equivalent — must satisfy all 4 constraints above):**

```python
SYSTEM_PROMPT = """You are a financial news analyst for ASK (Aware Signals & Knowledge), \
a platform for Thai retail investors.

Your task is to analyze the provided financial news article and produce structured JSON output \
with exactly these fields:

{
  "summary": "2-4 sentences explaining the market impact in plain language for a Thai retail investor.",
  "affected_sectors": ["list", "of", "0-3", "sector", "labels"],
  "affected_stocks": ["list", "of", "0-5", "ticker", "symbols"],
  "sentiment": "bullish | bearish | neutral",
  "analysis_at": "ISO 8601 UTC datetime with timezone offset"
}

Constraints you must always follow:
1. Do not make price predictions. Never state that an asset will reach a specific price level.
2. Do not make specific security recommendations. Never advise buying, selling, or holding \
any specific investment or financial instrument.
3. The sentiment field must be exactly one of: "bullish", "bearish", or "neutral". \
No other values, synonyms, or variations are acceptable.
4. This analysis is for informational purposes only and does not constitute investment advice. \
Include this disclaimer in spirit throughout your summary language.

Sector labels must use standardized names: Banking, Finance, Energy, Technology, \
Materials, Healthcare, Consumer, Industrial, Real Estate, Utilities.
Stock tickers must use standard exchange codes as used on the Stock Exchange of Thailand (SET) \
or relevant international exchanges.

Output only valid JSON. Do not include markdown fences, preamble, or explanation outside the JSON object.
"""
```

### `backend/tests/ai/test_system_prompt.py` — Test Pattern

These are **sync tests** — no `async def`, no `client` fixture, no `autouse`. The test file has no imports from `httpx` or `pytest` fixtures (other than direct function calls). The `asyncio_mode = "auto"` setting in `pyproject.toml` does not affect sync test functions.

```python
from pathlib import Path
from app.ai import prompts

# Compute path relative to this test file:
# tests/ai/test_system_prompt.py → tests/ai/ → tests/ → backend/ → backend/app/ai/prompts.py
PROMPT_FILE = Path(__file__).resolve().parent.parent.parent / "app" / "ai" / "prompts.py"


def test_prompt_file_exists():
    assert PROMPT_FILE.exists(), f"System prompt file not found at {PROMPT_FILE}"


def test_no_price_predictions_constraint():
    assert "price prediction" in prompts.SYSTEM_PROMPT.lower(), \
        "Prompt must explicitly constrain price predictions"


def test_no_security_recommendations_constraint():
    assert "security recommendation" in prompts.SYSTEM_PROMPT.lower(), \
        "Prompt must explicitly constrain security recommendations"


def test_sentiment_values_constrained():
    for value in ("bullish", "bearish", "neutral"):
        assert value in prompts.SYSTEM_PROMPT, \
            f"Prompt must enumerate valid sentiment value: {value!r}"


def test_disclaimer_phrase_present():
    phrase = "for informational purposes only and does not constitute investment advice"
    assert phrase in prompts.SYSTEM_PROMPT.lower(), \
        "Prompt must contain the mandatory disclaimer phrase (FR-A04)"
```

### `docs/ai-quality-checklist.md` — Required Sections

The file lives at `docs/ai-quality-checklist.md` (project root level, NOT inside `backend/`).

Required sections (per AC4 and NFR-AI02):
1. **Purpose** — references NFR-AI02
2. **Sample selection** — how to pick 20 random articles
3. **Sentiment verification** — how to evaluate expected vs actual sentiment
4. **Error rate calculation** — formula: `errors / 20 × 100 = error_rate_%`
5. **Launch gate** — if error rate ≥ 15%: prompt review required before public launch
6. **Record keeping** — where/how to log results

### Path Resolution for Tests

```
backend/
  app/
    ai/
      __init__.py        ← new
      prompts.py         ← new
  tests/
    ai/
      __init__.py        ← new
      test_system_prompt.py  ← new
```

`Path(__file__).resolve()` from `tests/ai/test_system_prompt.py`:
- `.parent` → `tests/ai/`
- `.parent.parent` → `tests/`
- `.parent.parent.parent` → `backend/`
- `/ "app" / "ai" / "prompts.py"` → `backend/app/ai/prompts.py` ✓

### What This Story Does NOT Touch

- `backend/app/main.py` — no changes; `prompts.py` does not need to be registered with FastAPI
- Any existing router, schema, or service file — pure addition only
- `backend/tests/conftest.py` — no changes; sync tests don't need the async `client` fixture
- Any frontend files — backend only

### No `main.py` Registration Needed

`backend/app/ai/prompts.py` is application code (imported by n8n integration at runtime) but does NOT need to be registered with the FastAPI app. It is a module that holds a constant. No router registration, no middleware, no startup event.

### Test Count

| File | Tests |
|------|-------|
| Pre-existing suite | 107 |
| `tests/ai/test_system_prompt.py` | +5 |
| **Expected total** | **112** |

### `asyncio_mode = "auto"` Compatibility

`asyncio_mode = "auto"` in `pyproject.toml` means all `async def test_*` functions run as async automatically. Regular `def test_*` functions are still collected and run as normal sync tests. The 5 new tests are all sync — no conflict.

### References

- Story AC source: `_bmad-output/planning-artifacts/epics.md` — Epic 3, Story 3.3
- NFR-AI01: System prompt must be version-controlled as application code
- NFR-AI02: Manual spot-check — < 15% incorrect sentiment on 20-item random sample
- FR-A04: Mandatory disclaimer phrase on all AI analysis surfaces
- FR-A05: Sentiment typed as union at every layer
- Previous story: `_bmad-output/implementation-artifacts/3-2-ai-analysis-delivery-webhook-endpoint.md`
- Test patterns: `backend/tests/models/test_schemas.py` (sync tests with no async fixture)

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- No issues encountered. All 5 tests are sync — `asyncio_mode = "auto"` is compatible with regular `def test_*` functions. No `client` fixture or async setup needed.

### Completion Notes List

- Created `backend/app/ai/` Python package with empty `__init__.py`
- Created `backend/app/ai/prompts.py` with `SYSTEM_PROMPT: str` constant satisfying all 4 NFR-AI01 constraints: no price predictions, no security recommendations, sentiment enum, FR-A04 disclaimer phrase
- Created `backend/tests/ai/` test package with 5 sync tests verifying all 4 constraint phrases via substring assertions
- Created `docs/ai-quality-checklist.md` with full NFR-AI02 spot-check process: 20-article random sample, sentiment verification workflow, error rate formula, ≥15% launch gate, and results record table
- Full suite: 112/112 pass (107 pre-existing + 5 new); no regressions

### File List

**New files:**
- `backend/app/ai/__init__.py`
- `backend/app/ai/prompts.py`
- `backend/tests/ai/__init__.py`
- `backend/tests/ai/test_system_prompt.py`
- `docs/ai-quality-checklist.md`

**Modified files:**
_none_

### Change Log

- 2026-06-22: Implemented Story 3.3 — AI System Prompt Version-Controlled Constraints. Created backend/app/ai/prompts.py with SYSTEM_PROMPT constant, 5 constraint-assertion tests, and docs/ai-quality-checklist.md. 112/112 pass.
