---
status: done
epic: 2
story: 1
story_key: "2-1-pydantic-schemas-and-typescript-types-for-news-domain"
created: 2026-06-21
baseline_commit: b78ce6cf2e7c526d42538fac94195f058a792f3b
---

# Story 2.1: Pydantic Schemas & TypeScript Types for the News Domain

Status: done

## Story

As a developer,
I want the complete `NewsItem` and `AIAnalysis` Pydantic schemas with all non-nullable fields and strict types defined and mirrored exactly in TypeScript,
So that every subsequent story has a trustworthy data contract at compile time and runtime.

## Acceptance Criteria

**AC1 — `AIAnalysis` Pydantic model defined**
Given `AIAnalysis` is defined in `backend/app/models/schemas.py`
When an instance is constructed
Then it includes: `summary` (str), `affected_sectors` (list[str]), `affected_stocks` (list[str]), `sentiment` (Literal["bullish", "bearish", "neutral"]), `analysis_at` (AwareDatetime)
And it has `model_config = ConfigDict(from_attributes=True)` and NO `alias=` fields

**AC2 — `NewsItem` Pydantic model updated with correct fields**
Given `NewsItem` is defined in `backend/app/models/schemas.py`
When an instance is constructed
Then it includes these non-nullable fields: `id` (str), `headline` (str), `summary` (str), `source` (str), `source_url` (str), `published_at` (AwareDatetime), `category` (Literal of 5 Thai categories), `content` (str)
And `ai_analysis` is typed `AIAnalysis | None` (nullable — analysis may not exist yet)
And `stock_impacts: list[StockImpact]` is retained (needed for direction badges on NewsCard)
And `featured: bool = False` is retained

**AC3 — Category Literal enforced**
Given the `category` field on `NewsItem` is `Literal["ดอกเบี้ยโลก", "พลังงาน", "หุ้นไทย", "เทคโนโลยี", "ตลาดโลก"]`
When a value outside these 5 categories is supplied
Then Pydantic raises `ValidationError` — freeform category strings are rejected at the schema boundary

**AC4 — `AIAnalysis.sentiment` union enforced**
Given `sentiment` is `Literal["bullish", "bearish", "neutral"]` on `AIAnalysis`
When a value outside these 3 (e.g., `"up"`, `"positive"`) is supplied
Then Pydantic raises `ValidationError`

**AC5 — `analysis_at` AwareDatetime enforced**
Given `analysis_at` on `AIAnalysis` is typed `AwareDatetime`
When a timezone-naive datetime is supplied
Then Pydantic raises `ValidationError`

**AC6 — TypeScript types mirror Pydantic schemas**
Given `frontend/src/types/index.ts`
When `AIAnalysis` and `NewsItem` TypeScript types are defined
Then `AIAnalysis` has: `summary: string`, `affected_sectors: string[]`, `affected_stocks: string[]`, `sentiment: "bullish" | "bearish" | "neutral"`, `analysis_at: string`
And `NewsItem` has `headline: string` (not `title`), `source_url: string`, `content: string`, `category` typed as the 5-value union, `ai_analysis: AIAnalysis | null` (not `string`)
And there is no `alias=` on any field — snake_case on both sides

**AC7 — Schema tests updated and passing**
Given `backend/tests/models/test_schemas.py` is updated
When all tests run
Then `AIAnalysis` construction, sentinel validation, and nullable behavior are verified
And `NewsItem` non-nullable field enforcement (including `headline`, `source_url`, `content`) is verified
And coverage on `app/models/` is ≥ 80%

**AC8 — Existing tests pass with no regressions**
Given schemas.py, mock_data.py, and downstream files are all updated
When `cd backend && pytest` and `cd frontend && npm run test` are both run
Then all tests pass with 0 failures

---

## Tasks / Subtasks

- [x] Task 1: Update `backend/app/models/schemas.py` (AC1, AC2, AC3, AC4, AC5)

  **Task 1a: Remove `Optional` import and add `AIAnalysis` model**
  - [x] Change `from typing import Literal, Optional` → `from typing import Literal`
  - [x] Fix `StockImpact.reason`: `Optional[str] = None` → `str | None = None`
  - [x] Add `AIAnalysis` model BEFORE `NewsItem` (NewsItem depends on it):
    ```python
    class AIAnalysis(BaseModel):
        model_config = ConfigDict(from_attributes=True)

        summary: str
        affected_sectors: list[str]
        affected_stocks: list[str]
        sentiment: Literal["bullish", "bearish", "neutral"]
        analysis_at: AwareDatetime
    ```

  **Task 1b: Update `NewsItem`**
  - [x] Rename `title: str` → `headline: str`
  - [x] Keep `summary: str` (short preview text for card display — different from `content`)
  - [x] Add `source_url: str` (non-nullable — original article URL)
  - [x] Add `content: str` (non-nullable — full article body text)
  - [x] Change `category: str` → `category: Literal["ดอกเบี้ยโลก", "พลังงาน", "หุ้นไทย", "เทคโนโลยี", "ตลาดโลก"]`
  - [x] Change `ai_analysis: str` → `ai_analysis: AIAnalysis | None = None`
  - [x] Keep `stock_impacts: list[StockImpact]` — DO NOT remove (direction arrows on NewsCard depend on this)
  - [x] Keep `featured: bool = False`
  - [x] Final field order: `id`, `headline`, `summary`, `source_url`, `content`, `category`, `published_at`, `source`, `ai_analysis`, `stock_impacts`, `featured`

- [x] Task 2: Update `backend/app/services/mock_data.py` (AC2, AC8)

  **Task 2a: Restructure NEWS_DATA entries**

  - [x] `"title"` key → `"headline"` key in all 5 news items
  - [x] Add `"source_url"` key with a realistic URL per item
  - [x] Add `"content"` key with 1–2 sentences of article body per item
  - [x] Change `"ai_analysis"` from a Thai string to a structured dict for all 5 items

  **Task 2b: No changes needed to `MARKET_INDICES`, `SECTORS`, `TRENDS`, `AI_SUMMARY`, `TICKER_DATA`**
  - [x] Confirmed — those schemas are unchanged

- [x] Task 3: Update `backend/tests/models/test_schemas.py` (AC1, AC4, AC5, AC7)

  **Task 3a: Update `VALID_NEWS_ITEM` fixture**
  - [x] Renamed `"title"` → `"headline"`
  - [x] Added `"source_url"`, `"content"`
  - [x] Changed `"ai_analysis"` to structured dict referencing `VALID_AI_ANALYSIS`

  **Task 3b: Added `VALID_AI_ANALYSIS` fixture**
  - [x] Done

  **Task 3c: Add AIAnalysis tests**
  - [x] `test_ai_analysis_valid_construction`
  - [x] `test_ai_analysis_aware_datetime_accepted`
  - [x] `test_ai_analysis_naive_datetime_rejected`
  - [x] `test_ai_analysis_valid_sentiments` (parametrized: bullish/bearish/neutral)
  - [x] `test_ai_analysis_invalid_sentiment_rejected`
  - [x] `test_ai_analysis_summary_required`

  **Task 3d: Update `test_news_item_non_nullable_string_fields` parametrize list**
  - [x] Removed `"title"`, `"ai_analysis"` from parametrize list
  - [x] Added `"headline"`, `"source_url"`, `"content"` to parametrize list

  **Task 3e: Add category Literal tests**
  - [x] `test_news_item_valid_category_values` (parametrized: all 5 Thai categories)
  - [x] `test_news_item_invalid_category_rejected`
  - [x] `test_news_item_ai_analysis_nullable`
  - [x] `test_news_item_ai_analysis_with_object`

- [x] Task 4: Update `backend/tests/routers/test_news.py` (AC8)

  - [x] Updated `required_fields`: `"title"` → `"headline"`, added `"source_url"`, `"content"`
  - [x] Updated `non_nullable`: `"title"` → `"headline"`, removed `"ai_analysis"`, added `"source_url"`, `"content"`
  - [x] `test_get_news_by_id_returns_200` assertion unchanged

- [x] Task 5: Update `frontend/src/types/index.ts` (AC6)

  **Task 5a: Add `AIAnalysis` interface**
  - [x] Added above `NewsItem`

  **Task 5b: Update `NewsItem` interface**
  - [x] `title: string` → `headline: string`
  - [x] Added `source_url: string`, `content: string`
  - [x] `category: string` → 5-value Literal union
  - [x] `ai_analysis: string` → `ai_analysis: AIAnalysis | null`

- [x] Task 6: Minimal component update — `frontend/src/components/NewsCard.tsx` (AC8)

  - [x] `{news.title}` → `{news.headline}` in `<h2>`
  - [x] `{news.ai_analysis}` → `{news.ai_analysis?.summary ?? "Analysis pending"}`
  - [x] No other changes to styling, layout, or structure

- [x] Task 7: Update frontend test fixtures (AC8)

  **Task 7a: Update `frontend/src/components/NewsCard.test.tsx`**
  - [x] `title:` → `headline:` in `VALID_NEWS` fixture
  - [x] Added `source_url:`, `content:` to fixture
  - [x] `ai_analysis: 'string'` → structured `AIAnalysis` object
  - [x] Added new test: `renders "Analysis pending" when ai_analysis is null`
  - [x] `'unknown category falls back gracefully'` test uses `as never` cast

  **Task 7b: Update `frontend/src/components/NewsFeed.test.tsx`**
  - [x] `title:` → `headline:` in `makeNews` factory default
  - [x] Added `source_url:`, `content:` to factory defaults
  - [x] `ai_analysis: 'Analysis'` → `ai_analysis: null`
  - [x] `title:` overrides → `headline:` in `NEWS` array calls

- [x] Task 8: Run all tests to verify zero regressions (AC7, AC8)

  - [x] `pytest -v` → **72 passed in 0.04s**
  - [x] `npm run test` → **54 passed** (10 test files, 1.21s)
  - [x] Zero failures in both suites

---

## Dev Notes

### ⚠️ CRITICAL: `title` → `headline` rename cascades to 4 files

The field rename from `title` to `headline` on `NewsItem` affects:

| File | Change required |
|------|----------------|
| `backend/app/models/schemas.py` | Field definition: `title` → `headline` |
| `backend/app/services/mock_data.py` | Dict key: `"title"` → `"headline"` in all 5 news items |
| `backend/tests/models/test_schemas.py` | Fixture key + parametrize list |
| `backend/tests/routers/test_news.py` | `required_fields` set + `non_nullable` list |
| `frontend/src/types/index.ts` | Interface field: `title: string` → `headline: string` |
| `frontend/src/components/NewsCard.tsx` | Access: `news.title` → `news.headline` |
| `frontend/src/components/NewsCard.test.tsx` | Fixture key: `title:` → `headline:` |
| `frontend/src/components/NewsFeed.test.tsx` | Factory key: `title:` → `headline:` |

**Missing any one of these causes a test failure.** The backend fails at the router test (asserting `"title"` in required_fields). The frontend fails at runtime (component reads `news.headline` but fixture supplies `title`, rendering `undefined`).

### ⚠️ CRITICAL: `ai_analysis` type changes from `string` to `AIAnalysis | null`

**Current NewsCard.tsx code (line ~44):**
```tsx
<p className="text-[13px] leading-relaxed" style={{ color: "#7D5A44" }}>
  {news.ai_analysis}
</p>
```

**Must become:**
```tsx
<p className="text-[13px] leading-relaxed" style={{ color: "#7D5A44" }}>
  {news.ai_analysis?.summary ?? "Analysis pending"}
</p>
```

Without this change: `{news.ai_analysis}` tries to render an `AIAnalysis` object → React throws `Objects are not valid as a React child`.

**Vitest does NOT type-check** — TypeScript errors in `NewsCard.tsx` won't fail `npm run test`. BUT the rendered output will be wrong and tests asserting on the analysis text will fail because `news.ai_analysis` is an object, not a string.

### ⚠️ CRITICAL: `ai_analysis` is `AIAnalysis | None = None` — default is `None`

When constructing `NewsItem(**data)` where `data["ai_analysis"]` is a dict, Pydantic v2 automatically coerces it to an `AIAnalysis` object. When it's `None` or absent, it stays `None`. Test this explicitly — the mock data router tests will POST/GET items where the model must accept both.

### Category Literal values (Thai strings — exactly these 5)

```python
Literal["ดอกเบี้ยโลก", "พลังงาน", "หุ้นไทย", "เทคโนโลยี", "ตลาดโลก"]
```

The existing `CATEGORIES` set in `news.py` router is dynamically computed from `NEWS_DATA` — it will still work after mock data is updated. But the router's category filter query param (`category: str | None`) does NOT validate against the Literal yet — that comes in Story 2.2. For now, only Pydantic schema instantiation enforces the Literal.

### `AIAnalysis.affected_stocks: list[str]` is ticker strings only

Per epics spec, `affected_stocks` in `AIAnalysis` is `list[str]` — just ticker symbols like `["PTT", "KBANK"]`. This is distinct from `NewsItem.stock_impacts: list[StockImpact]` which carries the direction arrows for badge rendering on NewsCard. Both coexist:
- `news.ai_analysis.affected_stocks` → textual list of tickers in detail view (Story 2.7)
- `news.stock_impacts` → directional badges on the card (Story 2.5)

Do NOT remove `stock_impacts` from `NewsItem`. It is needed by the existing `NewsCard` component.

### `Optional[str]` → `str | None` in `StockImpact`

The current `StockImpact.reason: Optional[str] = None` uses `Optional` from `typing`. Per `project-context.md` rule: "Use `X | None` syntax — never `Optional[X]`". Update this alongside removing the `Optional` import.

### Pydantic v2 coercion: dict → nested model

When `mock_data.py` returns a dict with `"ai_analysis"` as a nested dict, Pydantic v2 automatically coerces it to an `AIAnalysis` instance. No manual instantiation needed — the existing `return item` pattern in the router works because Pydantic validates/coerces on `response_model` serialization.

### What is NOT in scope for Story 2.1

- Do NOT update `Navbar.tsx`, `TickerBar.tsx`, `MarketOverviewWidget.tsx`, `AISummaryCard.tsx`, `SectorHeatmap.tsx`, `TrendSummary.tsx` — they do not access `NewsItem` fields
- Do NOT add API endpoints (Story 2.2)
- Do NOT build new UI components like `SentimentBadge` or `AIInsightBox` (Stories 2.4–2.5)
- Do NOT change `MarketIndex`, `SectorPerformance`, `TrendItem`, `AISummary`, `MarketOverview` schemas — those are from a different domain
- Do NOT add n8n webhook endpoints (Stories 3.x)

### Git intelligence — recent commits

- `b78ce6c` chore: ignore coverage artifacts in gitignore
- `64563fa` feat(story-1.2): add frontend testing infrastructure
- `2102fe9` feat(story-1.1): add backend testing infrastructure

### Previous story learnings

From Story 1.1 backend implementation:
- `asyncio_mode = "auto"` in `pyproject.toml` — no `@pytest.mark.asyncio` decorators needed
- `ASGITransport(app=app)` in conftest.py client fixture — already set up correctly
- `ConfigDict(from_attributes=True)` must be on every Pydantic model

From Story 1.2 frontend implementation:
- `vi.mock` calls must go BEFORE the `import Component` statement in test files
- `globals: true` in `vitest.config.ts` means no per-file imports of `describe`/`it`/`expect`/`vi`
- `@testing-library/react` v16 required for React 19
- Vitest does NOT type-check — TypeScript errors in components are invisible to the test runner but WILL cause runtime rendering failures that break behavioral assertions

### File locations (all paths relative to repo root `/Users/suthidakhrueanak/project/AlphaBrief/`)

- Backend schemas: `backend/app/models/schemas.py`
- Mock data: `backend/app/services/mock_data.py`
- Schema tests: `backend/tests/models/test_schemas.py`
- News router tests: `backend/tests/routers/test_news.py`
- TS types: `frontend/src/types/index.ts`
- NewsCard component: `frontend/src/components/NewsCard.tsx`
- NewsCard test: `frontend/src/components/NewsCard.test.tsx`
- NewsFeed test: `frontend/src/components/NewsFeed.test.tsx`

### Running tests

```bash
cd backend && source venv/bin/activate && pytest -v
cd frontend && npm run test
cd frontend && npm run test:coverage
```

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Pydantic v2 auto-coerces nested dict → `AIAnalysis` object on `NewsItem` instantiation — no manual `AIAnalysis(**data["ai_analysis"])` needed
- `as never` cast on `category: 'อื่นๆ'` in `NewsCard.test.tsx` suppresses the TypeScript error for the fallback test without changing runtime behavior (Vitest doesn't type-check)
- `ai_analysis: null` in NewsFeed test factory is valid since `AIAnalysis | null` and tests don't assert on analysis text

### Completion Notes List

- Added `AIAnalysis` Pydantic model with `sentiment` Literal + `analysis_at` AwareDatetime enforcement
- `NewsItem` renamed `title` → `headline`, added `source_url: str`, `content: str`, changed `category` to 5-value Literal, changed `ai_analysis` from `str` to `AIAnalysis | None = None`
- `StockImpact.reason` fixed from `Optional[str]` → `str | None` (removed `Optional` import entirely)
- All 5 mock news items updated: `headline`, `source_url`, `content`, structured `ai_analysis` dict with correct sentiment per article
- `NewsCard.tsx` minimal fix: `news.title` → `news.headline`, `{news.ai_analysis}` → `{news.ai_analysis?.summary ?? "Analysis pending"}`
- Added new `renders "Analysis pending" when ai_analysis is null` test — total frontend tests: 54 (was 53)
- Backend: 72 tests pass (was 47 — 25 new schema tests added)
- Zero regressions in either suite

### File List

- `backend/app/models/schemas.py` — MODIFIED (AIAnalysis added, NewsItem updated, Optional removed)
- `backend/app/services/mock_data.py` — MODIFIED (all 5 NEWS_DATA items restructured)
- `backend/tests/models/test_schemas.py` — MODIFIED (25 new tests, fixtures updated)
- `backend/tests/routers/test_news.py` — MODIFIED (required_fields + non_nullable updated)
- `frontend/src/types/index.ts` — MODIFIED (AIAnalysis added, NewsItem updated)
- `frontend/src/components/NewsCard.tsx` — MODIFIED (headline + ai_analysis?.summary)
- `frontend/src/components/NewsCard.test.tsx` — MODIFIED (VALID_NEWS fixture + new null test)
- `frontend/src/components/NewsFeed.test.tsx` — MODIFIED (makeNews factory + NEWS array)
- `_bmad-output/implementation-artifacts/2-1-pydantic-schemas-and-typescript-types-for-news-domain.md` — MODIFIED (this file)

### Change Log

| Date | Description |
|------|-------------|
| 2026-06-21 | Task 1: schemas.py — AIAnalysis model, NewsItem field changes, Optional removed |
| 2026-06-21 | Task 2: mock_data.py — all 5 items: headline, source_url, content, ai_analysis dict |
| 2026-06-21 | Task 3: test_schemas.py — VALID_AI_ANALYSIS fixture, 25 new tests, parametrize updated |
| 2026-06-21 | Task 4: test_news.py — required_fields and non_nullable updated |
| 2026-06-21 | Task 5: types/index.ts — AIAnalysis interface added, NewsItem updated |
| 2026-06-21 | Task 6: NewsCard.tsx — news.headline, news.ai_analysis?.summary |
| 2026-06-21 | Task 7: NewsCard.test.tsx + NewsFeed.test.tsx — fixtures updated |
| 2026-06-21 | Task 8: 72 backend + 54 frontend tests — all pass, 0 failures |
