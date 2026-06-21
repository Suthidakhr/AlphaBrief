---
status: done
epic: 2
story: 2
story_key: "2-2-news-api-endpoints"
created: 2026-06-21
baseline_commit: 8a7887c86641b6501b2a2af232d1c8d9163a73d9
---

# Story 2.2: News API Endpoints

**Status:** done

## Story

As a retail investor,
I want to retrieve a filtered, fresh list of financial news items and open individual articles via the API,
So that the frontend can display current news with all required fields enforced.

## Acceptance Criteria

### AC1 — Sorted, Fresh News List
`GET /news/` returns a `NewsListResponse` object with items sorted by `published_at` descending (most recent first). Items older than `NEWS_RETENTION_DAYS` days (env var, default `7`) are excluded. `source` and `source_url` are non-nullable — already enforced by Pydantic `NewsItem` from Story 2.1.

### AC2 — Category Filter with 422 on Invalid Input
`GET /news/?category=<value>` returns only items in that category. Valid categories are the 5 Thai strings defined in `NewsCategory`. Any unrecognized category value returns HTTP 422 — enforced automatically by FastAPI when the query param is typed as `NewsCategory | None`.

### AC3 — `last_updated` in Response
`GET /news/` response body includes `last_updated: string (ISO 8601, UTC)` representing the `published_at` of the most recent item in the filtered, sliced result. The `fetchAPI` function in `frontend/src/lib/api.ts` already has `next: { revalidate: 60 }` — confirm it is present and do not change it.

### AC4 — Single Item with Required Fields Non-Null
`GET /news/<id>` returns a single `NewsItem` where `ai_analysis` is fully populated or `null` (never partial). `source`, `source_url`, `headline`, and `published_at` are never null — already enforced by Pydantic from Story 2.1.

### AC5 — 404 for Missing ID
`GET /news/<nonexistent-id>` returns HTTP 404.

### AC6 — Integration Test Correctness
- All `published_at` and `analysis_at` values in responses parse as timezone-aware ISO 8601 (contain `+00:00` or `Z`)
- All `sentiment` values in `ai_analysis` are strictly one of `"bullish"`, `"bearish"`, `"neutral"`
- `isFinite()` guard must be applied before any `toFixed()` / `Math.abs()` on numeric API values — `NaN` must never reach a component. `NewsItem` has no numeric fields; this establishes the pattern for future numeric endpoints.

## Tasks / Subtasks

- [x] **Task 1:** Extract `NewsCategory` and add `NewsListResponse` to `backend/app/models/schemas.py`
  - [x] 1a. Add `NewsCategory = Literal["ดอกเบี้ยโลก", "พลังงาน", "หุ้นไทย", "เทคโนโลยี", "ตลาดโลก"]` at the top of the file (after the `Literal` import)
  - [x] 1b. Change `NewsItem.category` field type from the inline Literal to `NewsCategory`
  - [x] 1c. Add `NewsListResponse(BaseModel)` class after `NewsItem`:
    - `model_config = ConfigDict(from_attributes=True)`
    - `items: list[NewsItem]`
    - `last_updated: AwareDatetime`

- [x] **Task 2:** Update `backend/app/routers/news.py`
  - [x] 2a. Add imports: `import os` and `from datetime import datetime, timedelta, timezone` at the top; import `NewsListResponse` and `NewsCategory` from schemas
  - [x] 2b. Add module-level constant: `NEWS_RETENTION_DAYS = int(os.getenv("NEWS_RETENTION_DAYS", "7"))`
  - [x] 2c. Change `GET /` signature: `response_model=NewsListResponse`, and query param `category: NewsCategory | None = Query(None)`
  - [x] 2d. In the handler body: compute `cutoff = datetime.now(timezone.utc) - timedelta(days=NEWS_RETENTION_DAYS)`; filter `NEWS_DATA` to items where `item["published_at"] >= cutoff`
  - [x] 2e. Sort the filtered list by `published_at` descending; apply category filter if provided; slice by `limit`
  - [x] 2f. Compute `last_updated = items[0]["published_at"] if items else datetime.now(timezone.utc)`
  - [x] 2g. Return `NewsListResponse(items=items, last_updated=last_updated)`

- [x] **Task 3:** Add `NewsListResponse` to `frontend/src/types/index.ts`
  - [x] 3a. Add the interface after `NewsItem`:
    ```ts
    export interface NewsListResponse {
      items: NewsItem[];
      last_updated: string;
    }
    ```

- [x] **Task 4:** Update `frontend/src/lib/api.ts`
  - [x] 4a. Import `NewsListResponse` from `@/types`
  - [x] 4b. Change `getNews()` to return `fetchAPI<NewsListResponse>('/news/')` (was `NewsItem[]`)

- [x] **Task 5:** Update `frontend/src/app/page.tsx`
  - [x] 5a. Read `frontend/src/components/NewsFeed.tsx` to confirm it accepts `news: NewsItem[]`
  - [x] 5b. In `Promise.all([...])`, the first result is now `NewsListResponse` — rename the destructured variable to `newsResponse`
  - [x] 5c. Pass `newsResponse.items` to `<NewsFeed news={newsResponse.items} />`
  - [x] 5d. Remove `export const revalidate = 60` from `page.tsx` — per project-context.md this must NOT coexist with `next: { revalidate: 60 }` in `fetchAPI`; mixing causes unpredictable cache behavior
  - [x] Also updated `frontend/src/app/news/page.tsx` which also used `getNews()` as `NewsItem[]` (also removed its duplicate `export const revalidate = 60`)

- [x] **Task 6:** Update `backend/tests/routers/test_news.py`
  - [x] 6a. Fix `test_get_news_returns_list` — `response.json()` is now a dict; assert `data["items"]` is a list
  - [x] 6b. Fix `test_get_news_items_have_required_fields` — iterate `response.json()["items"]`
  - [x] 6c. Fix `test_get_news_no_null_non_nullable_fields` — iterate `response.json()["items"]`
  - [x] 6d. Fix `test_get_news_filter_by_category` — read items from `response.json()["items"]`
  - [x] 6e. Add `test_get_news_response_has_last_updated` — assert `"last_updated"` key is in `response.json()` and its value matches timezone-aware pattern `r'([+-]\d{2}:\d{2}|Z)$'`
  - [x] 6f. Add `test_get_news_invalid_category_returns_422` — `GET /news/?category=INVALID` asserts status 422
  - [x] 6g. Add `test_get_news_sorted_by_published_at_desc` — assert `items[0]["published_at"] >= items[-1]["published_at"]` (only when `len(items) > 1`)
  - [x] 6h. Add `test_get_news_ai_analysis_sentiment_valid_values` — assert every non-null `ai_analysis["sentiment"]` is in `{"bullish", "bearish", "neutral"}`
  - [x] 6i. Add `test_get_news_by_id_required_fields_non_null` — `GET /news/news-001`, assert `source`, `source_url`, `headline`, `published_at` are all non-null and non-empty

- [x] **Task 7:** Add `NewsListResponse` test to `backend/tests/models/test_schemas.py`
  - [x] 7a. Construct a `NewsListResponse` from a minimal valid `NewsItem` dict and `AwareDatetime`; assert `items` is a list and `last_updated` is timezone-aware

### Review Findings (2026-06-21)

**Decision-needed (resolved):**
- [x] [Review][Decision] DN1: `last_updated` fallback when result set is empty — resolved: field changed to `AwareDatetime | None`; returns `null` when no items survive filtering [`backend/app/models/schemas.py`, `backend/app/routers/news.py`, `frontend/src/types/index.ts`]
- [x] [Review][Decision] DN2: `GET /news/{id}` has no retention-window check — resolved: leave as-is (detail view always accessible regardless of age)

**Patches (all applied):**
- [x] [Review][Patch] P1: Dead assignment `data = response = await client.get(...)` — fixed [`backend/tests/routers/test_news.py:12`]
- [x] [Review][Patch] P2: Sort test only compares `items[0]` vs `items[-1]` — fixed to check full sequence [`backend/tests/routers/test_news.py`]
- [x] [Review][Patch] P3: `limit` query param has no lower bound — added `ge=1` [`backend/app/routers/news.py:20`]
- [x] [Review][Patch] P4+P5: `NEWS_RETENTION_DAYS` env var — added `try/except ValueError` + `max(1, ...)` guard [`backend/app/routers/news.py:11-14`]
- [x] [Review][Patch] P6: `api.test.ts` mocks updated to `{ items: [], last_updated: null }` shape [`frontend/src/lib/api.test.ts`]
- [x] [Review][Patch] P7: Added `test_get_news_items_published_at_timezone_aware` (item-level `published_at` and `analysis_at`) [`backend/tests/routers/test_news.py`]
- [x] [Review][Patch] P8: Added `test_get_news_by_id_ai_analysis_fully_populated_or_null` [`backend/tests/routers/test_news.py`]
- [x] [Review][Patch] P9 (from DN1): `last_updated: AwareDatetime | None` in schema; `string | null` in TypeScript; returns `None` when empty

**Deferred (pre-existing):**
- [x] [Review][Defer] D1: Mock `NEWS_DATA` items have hardcoded `published_at` dates — will all expire after 2026-06-28 and return empty — deferred, pre-existing
- [x] [Review][Defer] D2: `GET /categories` has no `response_model` annotation — deferred, pre-existing, not changed by this diff
- [x] [Review][Defer] D3: `GET /categories` returns categories from full `NEWS_DATA` at import time, inconsistent with retention-filtered `GET /news/` — deferred, pre-existing
- [x] [Review][Defer] D4: "STORIES TODAY" widget shows filtered/paginated count, not actual stories today — deferred, pre-existing UI design issue
- [x] [Review][Defer] D5: "15 MIN REFRESH RATE" label on news page doesn't match actual 60s ISR interval — deferred, pre-existing label mismatch
- [x] [Review][Defer] D6: `NEWS_RETENTION_DAYS` parsed at module import time — cannot be overridden per-test without patching the module global — deferred, design concern for future test isolation

## Dev Notes

### File State at Story Start

**`backend/app/models/schemas.py`**
Current state: `NewsItem.category` is an inline `Literal["ดอกเบี้ยโลก", "พลังงาน", "หุ้นไทย", "เทคโนโลยี", "ตลาดโลก"]`. No `NewsListResponse` exists. `StockImpact.reason: str | None = None` has a default — mock data items without a `reason` key silently default to `None` (do not change this). `MarketOverview.last_updated: str` is deliberately typed `str` for legacy reasons; `NewsListResponse.last_updated` must be `AwareDatetime` to enforce timezone-awareness at the Pydantic boundary.

**`backend/app/routers/news.py`**
Current state: `GET /` returns `response_model=list[NewsItem]` directly; no retention filter; `category: str | None` accepts any string without validation; no `last_updated` in response. `GET /{news_id}` already returns 404 on missing ID — no change needed. The `CATEGORIES` set is used by `GET /categories` only — preserve it.

**`backend/app/services/mock_data.py`**
`published_at` values are Python `datetime` objects with `tzinfo=timezone.utc` — already timezone-aware. Comparison `item["published_at"] >= cutoff` works directly without parsing. All 5 mock items are from 2026-06-21, within 7 days of today — none will be filtered out by retention in normal operation.

**`backend/tests/routers/test_news.py`**
Four existing tests will break when the response shape changes from `list` to `dict`. All four must be updated before adding new tests. The breakage is:
```python
# BEFORE (breaks after Task 2)
items = response.json()           # was list, now dict
assert isinstance(items, list)    # fails — it's a dict now

# AFTER (correct)
data = response.json()
items = data["items"]
assert isinstance(items, list)
```

**`frontend/src/app/page.tsx`**
Already has `export const revalidate = 60` on line 9 — this must be removed (project-context.md: "do NOT also add `export const revalidate = 60` to page files; mixing causes unpredictable cache behavior"). Currently destructures `[news, overview, ticker]` from `Promise.all`; rename `news` → `newsResponse` and pass `newsResponse.items` to `<NewsFeed>`.

### URL Path Reality
The epics file documents endpoints as `/api/news`, but the actual router prefix is `/news` (registered in `main.py` as `app.include_router(news.router)` with no additional prefix). All paths in tests and `api.ts` use `/news/` — do not add `/api` prefix.

### Correct Operation Order in `GET /` Handler
```python
# 1. Retention filter first
cutoff = datetime.now(timezone.utc) - timedelta(days=NEWS_RETENTION_DAYS)
data = [n for n in NEWS_DATA if n["published_at"] >= cutoff]

# 2. Category filter (after retention — last_updated reflects remaining items)
if category:
    data = [n for n in data if n["category"] == category]

# 3. Sort desc, slice
data = sorted(data, key=lambda n: n["published_at"], reverse=True)
data = data[:limit]

# 4. last_updated from the final filtered+sorted+sliced list
last_updated = data[0]["published_at"] if data else datetime.now(timezone.utc)

return NewsListResponse(items=data, last_updated=last_updated)
```

### Category Validation — No Manual Check Needed
FastAPI validates `Literal` query param types automatically. When `category: NewsCategory | None` is declared:
- Valid values: the 5 Thai strings → proceed
- Any other string (e.g., `"INVALID"`, `"energy"`, `"พลังงาน2"`) → FastAPI returns 422 automatically
- No explicit `if category not in VALID_CATEGORIES: raise HTTPException` needed

### Timezone-Aware Assertion Pattern for Tests
```python
import re

def test_get_news_response_has_last_updated(client):
    response = await client.get("/news/")
    data = response.json()
    assert "last_updated" in data
    # Pydantic AwareDatetime serializes with offset, e.g. "2026-06-21T05:30:00Z"
    assert re.search(r'([+-]\d{2}:\d{2}|Z)$', data["last_updated"]), \
        f"last_updated not timezone-aware: {data['last_updated']}"
```

### TypeScript Compile Verification
After Task 3, 4, 5 — run from `frontend/`:
```bash
npx tsc --noEmit
```
Must pass with zero errors. Then run `npm run test` to confirm 54 existing Vitest tests still pass.

### Backend Test Verification
After Task 6, 7 — run from project root or `backend/`:
```bash
pytest backend/tests/ -v
```
All tests must pass. Expected final count: ~16 tests (8 existing, 6 new router tests, 1 new schema test, plus any others from Stories 1.1 and 2.1).

### Story 2.1 Learnings Applied
- `StockImpact.reason: str | None = None` — has default, so mock data without `reason` key is valid. Do not change.
- TypeScript `T | null` is required; `T?` (optional) does not guard against `null` at runtime.
- Vitest does NOT run `tsc` — always run `tsc --noEmit` separately to catch compile errors.
- After changing `StockImpact.reason` from `?: string` to `string | null` last story, 3 test fixtures needed to add `reason: null`. Watch for similar cascade effects here: changing `getNews()` return type to `NewsListResponse` requires updating `page.tsx` usage or TypeScript will fail.

### Non-Goals for This Story
- No service layer file — retention filter logic stays in the router for now
- No UI display of `last_updated` — the field is in the API contract; display is a later story
- No pagination — `limit` query param is pre-existing and sufficient for MVP
- No search endpoint
- No changes to `GET /news/categories` — it remains as-is

## File Change Summary

| File | Action | Reason |
|---|---|---|
| `backend/app/models/schemas.py` | MODIFY | Extract `NewsCategory`, add `NewsListResponse` |
| `backend/app/routers/news.py` | MODIFY | Retention filter, sort, `last_updated`, 422 category validation |
| `frontend/src/types/index.ts` | MODIFY | Add `NewsListResponse` interface |
| `frontend/src/lib/api.ts` | MODIFY | Change `getNews()` return type to `NewsListResponse` |
| `frontend/src/app/page.tsx` | MODIFY | Use `newsResponse.items`, remove duplicate `export const revalidate` |
| `backend/tests/routers/test_news.py` | MODIFY | Fix 4 broken tests + add 5 new tests |
| `backend/tests/models/test_schemas.py` | MODIFY | Add `NewsListResponse` construction test |

---

## Dev Agent Record

### Implementation Plan

Red-green-refactor per task. Wrote failing schema tests first, implemented `NewsCategory` + `NewsListResponse` in schemas.py, confirmed 50/50 schema tests green. Wrote failing router tests (including updated assertions for the new response shape), implemented all router changes, confirmed 13/13 router tests green. Updated TypeScript types and `api.ts`; discovered `news/page.tsx` also used `getNews()` as `NewsItem[]` (not in story spec but required for TypeScript to compile). Fixed both pages. `tsc --noEmit` passes with only the pre-existing `N8nChat.test.tsx` error. Full suites: 80 backend tests pass, 54 frontend tests pass.

### Debug Log

- `src/app/news/page.tsx` also used `api.getNews()` as `NewsItem[]` — not in the story's Task 5 spec but required fix to make `tsc --noEmit` clean. Fixed: renamed to `newsResponse`, used `.items`, removed duplicate `export const revalidate`.

### Completion Notes

- `NewsCategory` Literal type extracted to `schemas.py`; `NewsItem.category` uses it; eliminates duplication between router and schema.
- `NewsListResponse` Pydantic model added with `items: list[NewsItem]` and `last_updated: AwareDatetime` — enforces timezone-awareness at the model boundary.
- Router `GET /news/`: retention filter (default 7 days), sort desc by `published_at`, category validation via `Literal` type (FastAPI auto-validates → 422 on invalid), `last_updated` from most recent item.
- Frontend: `getNews()` returns `NewsListResponse`; `page.tsx` and `news/page.tsx` both updated to use `.items`. Both duplicate `export const revalidate = 60` removed.
- All 6 ACs satisfied. Backend: 80 tests pass (53 schema + 13 news router + 10 market + 4 trends). Frontend: 54 Vitest tests pass.

### File List

- `backend/app/models/schemas.py` — MODIFIED (added `NewsCategory`, `NewsListResponse`; updated `NewsItem.category`)
- `backend/app/routers/news.py` — MODIFIED (retention filter, sort, `NewsListResponse` response model, `NewsCategory` query param, `last_updated`)
- `backend/tests/models/test_schemas.py` — MODIFIED (added import `NewsListResponse`; added 3 `NewsListResponse` tests)
- `backend/tests/routers/test_news.py` — MODIFIED (fixed 4 tests for new response shape; added 5 new tests)
- `frontend/src/types/index.ts` — MODIFIED (added `NewsListResponse` interface)
- `frontend/src/lib/api.ts` — MODIFIED (`getNews()` returns `NewsListResponse`)
- `frontend/src/app/page.tsx` — MODIFIED (renamed `news` → `newsResponse`, pass `.items` to NewsFeed, removed duplicate `export const revalidate`)
- `frontend/src/app/news/page.tsx` — MODIFIED (renamed `news` → `newsResponse`, use `.items`, removed duplicate `export const revalidate`)

### Change Log

- 2026-06-21: Story 2.2 implemented — news API endpoints with 7-day retention, sorted response, `last_updated` field, category 422 validation, and `NewsListResponse` wrapper type across backend and frontend.
