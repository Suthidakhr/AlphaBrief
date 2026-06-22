---
status: done
epic: 4
story: 1
story_key: "4-1-daily-brief-schema-and-api-endpoint"
created: 2026-06-22
baseline_commit: fd70d293efd94459377fbd3d6ba6f3eadc29f22f
---

# Story 4.1: Daily Brief Schema & API Endpoint

**Status:** done

## Story

As a developer,
I want the `DailyBrief` Pydantic schema defined and a `GET /daily-brief` endpoint that returns today's brief or yesterday's fallback,
So that the frontend always has valid brief data to display regardless of generation timing.

## Acceptance Criteria

### AC1 — `DailyBrief` Pydantic model defined in `schemas.py`

**Given** `DailyBrief` is defined in `backend/app/models/schemas.py`
**When** an instance is constructed
**Then** it contains exactly these fields:
  - `overall_sentiment`: `Literal["bullish", "bearish", "neutral"]`
  - `key_developments`: `list[str]` (3–5 items enforced by the generator; no min/max validation at schema level)
  - `opportunities`: `list[str]`
  - `risks`: `list[str]`
  - `generated_at`: `AwareDatetime`
  - `brief_date`: `date` (Python `datetime.date`, serialized as ISO date string)
  - `is_fallback`: `bool`
**And** no `alias=` fields — snake_case on both Python and TypeScript sides

### AC2 — `DailyBrief` TypeScript type defined in `frontend/src/types/index.ts`

**Given** `frontend/src/types/index.ts`
**When** the `DailyBrief` TypeScript type is defined
**Then** it mirrors the Pydantic schema exactly with these fields:
  - `overall_sentiment`: `"bullish" | "bearish" | "neutral"` — not `string`
  - `key_developments`: `string[]`
  - `opportunities`: `string[]`
  - `risks`: `string[]`
  - `generated_at`: `string` (ISO 8601 UTC, frontend converts to Bangkok time for display)
  - `brief_date`: `string` (ISO date string, e.g. `"2026-06-22"`)
  - `is_fallback`: `boolean`

### AC3 — `GET /daily-brief` returns today's brief

**Given** `GET /daily-brief` and today's brief has been generated
**When** called
**Then** it returns the current day's `DailyBrief` with `is_fallback: false`
**And** `generated_at` is timezone-aware UTC

### AC4 — `GET /daily-brief` fallback to yesterday

**Given** `GET /daily-brief` and no brief exists yet for today
**When** called
**Then** it returns yesterday's brief with `is_fallback: true`
**And** the response body is a valid `DailyBrief` — not an error, not `null`

### AC5 — `GET /daily-brief` returns 404 when no brief exists at all

**Given** `GET /daily-brief` and no brief exists for today or yesterday
**When** called
**Then** it returns `HTTP 404`

### AC6 — `api.ts` fetch method uses ISR revalidation

**Given** the `api.getDailyBrief()` call in `frontend/src/lib/api.ts`
**When** implemented
**Then** it calls `fetchAPI<DailyBrief>("/daily-brief")` — using the shared `fetchAPI` helper which already applies `next: { revalidate: 60 }` globally

### AC7 — Integration tests cover fallback and validation

**Given** integration tests for `GET /daily-brief`
**When** they run
**Then** the fallback scenario is tested: when today's brief is absent, yesterday's is returned with `is_fallback: true`
**And** `overall_sentiment` in the response is always one of the three valid strings
**And** `generated_at` parses as a timezone-aware ISO 8601 string (ends with offset like `+00:00`)
**And** the 404 scenario is tested: no brief at all returns HTTP 404

---

## Tasks / Subtasks

- [x] Task 1: Add `DailyBrief` Pydantic model to `backend/app/models/schemas.py` (AC1)
  - [x] Import `date` from `datetime`
  - [x] Define `DailyBrief(BaseModel)` with `ConfigDict(from_attributes=True)` and all 7 fields
  - [x] No `alias=` on any field — pure snake_case

- [x] Task 2: Create `backend/app/services/daily_brief_store.py` (AC3, AC4, AC5)
  - [x] `DailyBriefStore` class with `threading.Lock` (same pattern as `NewsStore`)
  - [x] `self._briefs: dict[str, dict]` keyed by `brief_date.isoformat()` (e.g., `"2026-06-22"`)
  - [x] `upsert(payload_dict: dict) -> str` — stores brief keyed by `brief_date`; returns `"created"` or `"updated"`
  - [x] `get_for_date(d: date) -> dict | None` — returns stored brief dict for that date or None
  - [x] `reset()` — clears `self._briefs` (for test teardown)
  - [x] Module-level singleton: `daily_brief_store = DailyBriefStore()`

- [x] Task 3: Create `backend/app/routers/daily_brief.py` — GET /daily-brief (AC3, AC4, AC5)
  - [x] `router = APIRouter(prefix="/daily-brief", tags=["daily-brief"])`
  - [x] Import `BKK_TZ = timezone(timedelta(hours=7))` — use Bangkok midnight to determine "today"
  - [x] `GET /` — compute `today = datetime.now(BKK_TZ).date()`, `yesterday = today - timedelta(days=1)`
  - [x] If `daily_brief_store.get_for_date(today)` is not None: return it with `is_fallback=False`
  - [x] Elif `daily_brief_store.get_for_date(yesterday)` is not None: return it with `is_fallback=True`
  - [x] Else: raise `HTTPException(status_code=404, detail="No daily brief available")`
  - [x] Response model: `DailyBrief`

- [x] Task 4: Register router in `backend/app/main.py` (AC3)
  - [x] Add `from app.routers import daily_brief` to imports
  - [x] Add `app.include_router(daily_brief.router)` after existing routers

- [x] Task 5: Add `DailyBrief` TypeScript type to `frontend/src/types/index.ts` (AC2)
  - [x] Add `interface DailyBrief` at the end of the file
  - [x] All 7 fields typed exactly as specified in AC2

- [x] Task 6: Add `getDailyBrief()` to `frontend/src/lib/api.ts` (AC6)
  - [x] Import `DailyBrief` from `@/types`
  - [x] Add `getDailyBrief: () => fetchAPI<DailyBrief>("/daily-brief/")` to the `api` object

- [x] Task 7: Write integration tests for `GET /daily-brief` (AC7)
  - [x] Create `backend/tests/routers/test_daily_brief.py`
  - [x] `autouse` fixture: `reset_store()` that calls `daily_brief_store.reset()` after each test
  - [x] `test_get_daily_brief_returns_404_when_no_brief_exists` — empty store → 404
  - [x] `test_get_daily_brief_returns_today_with_is_fallback_false` — upsert today's brief → 200, `is_fallback=False`
  - [x] `test_get_daily_brief_returns_yesterday_with_is_fallback_true` — upsert only yesterday's brief → 200, `is_fallback=True`
  - [x] `test_get_daily_brief_prefers_today_over_yesterday` — upsert both → returns today's (`is_fallback=False`)
  - [x] `test_get_daily_brief_sentiment_is_valid_enum` — sentiment must be one of three strings
  - [x] `test_get_daily_brief_generated_at_is_timezone_aware` — `generated_at` ends with timezone offset
  - [x] `test_get_daily_brief_all_required_fields_present` — all 7 fields in response
  - [x] Run full pytest suite: 119/119 passed (112 existing + 7 new)

### Review Findings

- [x] [Review][Patch] `date` not imported at module level in test file — `_today()` uses `-> "date"` string annotation with `date` not in module scope; `get_type_hints()` would raise `NameError` [`backend/tests/routers/test_daily_brief.py:2,11`]
- [x] [Review][Defer] `DailyBriefStore` is module-level singleton — won't share state across multiple OS processes (pre-existing architectural limitation, matches `NewsStore` pattern) [`backend/app/services/daily_brief_store.py`] — deferred, pre-existing
- [x] [Review][Defer] `BKK_TZ` constant duplicated in router and test file — no practical risk (Thailand has no DST), but could drift if either definition changes [`backend/app/routers/daily_brief.py:8`, `backend/tests/routers/test_daily_brief.py:8`] — deferred, pre-existing
- [x] [Review][Defer] No eviction of old date keys from `_briefs` dict — grows by 1 entry/day; consistent with all other in-memory stores [`backend/app/services/daily_brief_store.py`] — deferred, pre-existing

---

## Dev Notes

### Pattern: Follow NewsStore, Not MarketStore

The `DailyBriefStore` follows the exact same pattern as `backend/app/services/news_store.py`:
- Module-level singleton
- `threading.Lock` for thread safety
- In-memory dict storage
- `reset()` method for test isolation
- No external dependencies (no DB, no file I/O)

### brief_date and Timezone-Aware Fallback

The key design decision: "today" in the context of the Daily Brief means Bangkok time (UTC+7), because the brief is generated at 07:00 Bangkok and users are in Bangkok time.

```python
from datetime import date, datetime, timedelta, timezone

BKK_TZ = timezone(timedelta(hours=7))

def _today_bkk() -> date:
    return datetime.now(BKK_TZ).date()
```

Store key is the ISO date string (e.g., `"2026-06-22"`), not a datetime. This avoids timezone ambiguity in storage.

### DailyBriefStore: `upsert` not `create`

The store uses upsert semantics (Story 4.3 builds on this): if a brief for `brief_date` already exists, it is overwritten. This is the same pattern as `attach_analysis` in `NewsStore`.

```python
def upsert(self, payload_dict: dict) -> str:
    with self._lock:
        key = payload_dict["brief_date"].isoformat()  # brief_date is a date object
        status = "created" if key not in self._briefs else "updated"
        self._briefs[key] = dict(payload_dict)
        return status
```

Note: `brief_date` in `payload_dict` arrives as a Python `date` object after Pydantic parsing (for the webhook in Story 4.3). In tests, pass it as a `date` object directly.

### Injecting `is_fallback` at Response Time

`is_fallback` is NOT stored — it is computed by the GET endpoint:

```python
@router.get("/", response_model=DailyBrief)
async def get_daily_brief() -> DailyBrief:
    today = datetime.now(BKK_TZ).date()
    yesterday = today - timedelta(days=1)

    brief = daily_brief_store.get_for_date(today)
    if brief is not None:
        return DailyBrief(**{**brief, "is_fallback": False})

    brief = daily_brief_store.get_for_date(yesterday)
    if brief is not None:
        return DailyBrief(**{**brief, "is_fallback": True})

    raise HTTPException(status_code=404, detail="No daily brief available")
```

The stored dict does NOT have `is_fallback` in it (or if it does, it is overridden). This means the Pydantic model has `is_fallback: bool` as a required field — the endpoint always supplies it.

### Test Setup: Direct Store Manipulation

Since Story 4.1 does NOT include the webhook, tests set up data by calling `daily_brief_store.upsert()` directly:

```python
from datetime import date, datetime, timedelta, timezone
from app.services.daily_brief_store import daily_brief_store

BKK_TZ = timezone(timedelta(hours=7))

SAMPLE_BRIEF = {
    "overall_sentiment": "bullish",
    "key_developments": ["SET rose 1%", "SCB gains", "Oil steady"],
    "opportunities": ["Banking sector"],
    "risks": ["Global rate uncertainty"],
    "generated_at": datetime(2026, 6, 22, 0, 0, 0, tzinfo=timezone.utc),
    "brief_date": datetime.now(BKK_TZ).date(),
}

@pytest.fixture(autouse=True)
async def reset_store():
    yield
    daily_brief_store.reset()
```

For the "yesterday" fallback test, set `brief_date` to `today - timedelta(days=1)`.

### Existing Router Pattern

All existing routers follow the same pattern. Copy `news.py` as a reference:

```python
# backend/app/routers/daily_brief.py
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import DailyBrief
from app.services.daily_brief_store import daily_brief_store

BKK_TZ = timezone(timedelta(hours=7))
router = APIRouter(prefix="/daily-brief", tags=["daily-brief"])
```

Router prefix is `/daily-brief` (no `/api` prefix — consistent with all existing routers).

### main.py Registration

Current `main.py` imports:
```python
from app.routers import news, market, trends, webhooks
```

Add `daily_brief` to this import and `app.include_router(daily_brief.router)`.

### TypeScript Type Notes

`brief_date` is a Python `date` object serialized by FastAPI as an ISO date string `"2026-06-22"`. TypeScript type: `string`. Frontend components will use this for display only (no date arithmetic in TypeScript for this story).

`generated_at` is `AwareDatetime` → FastAPI serializes as `"2026-06-22T00:00:00+00:00"`. TypeScript type: `string`. Frontend converts to Bangkok time (+7h) for display.

### `fetchAPI` Already Has `next: { revalidate: 60 }`

The shared `fetchAPI` helper in `api.ts` already applies `next: { revalidate: 60 }` to ALL calls. No per-call override needed:

```typescript
async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 60 },   // ← already there
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`);
  return res.json();
}
```

So `getDailyBrief: () => fetchAPI<DailyBrief>("/daily-brief")` is all that is needed.

### File Locations

```
MODIFY  backend/app/models/schemas.py        ← add DailyBrief model
NEW     backend/app/services/daily_brief_store.py
NEW     backend/app/routers/daily_brief.py
MODIFY  backend/app/main.py                  ← add daily_brief router
MODIFY  frontend/src/types/index.ts          ← add DailyBrief interface
MODIFY  frontend/src/lib/api.ts              ← add getDailyBrief()
NEW     backend/tests/routers/test_daily_brief.py
```

### Test Count

Current: 112 tests. After this story: ~119 (7 new integration tests).

### What This Story Does NOT Include

- `POST /webhooks/daily-brief` — that is Story 4.3
- `DailyBriefCard` component — that is Story 4.2
- Home page integration — that is Story 4.4
- The `DailyBriefIngestPayload` Pydantic model — that is Story 4.3
- Any n8n scheduling — that is Story 4.3

### References

- Epic spec: `_bmad-output/planning-artifacts/epics.md` line 645
- Existing `NewsStore` pattern: `backend/app/services/news_store.py`
- Existing router pattern: `backend/app/routers/news.py`
- Existing test pattern: `backend/tests/routers/test_news.py`
- Existing conftest: `backend/tests/conftest.py`
- Frontend type pattern: `frontend/src/types/index.ts`
- Frontend API pattern: `frontend/src/lib/api.ts`

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No blockers. Straightforward implementation following existing patterns.

### Completion Notes List

- Added `from datetime import date` import and `DailyBrief` model (7 fields, no aliases) to `backend/app/models/schemas.py`
- Created `DailyBriefStore` in `backend/app/services/daily_brief_store.py` — threading.Lock, in-memory dict keyed by ISO date string, upsert/get_for_date/reset methods, module-level singleton
- Created `GET /daily-brief/` router in `backend/app/routers/daily_brief.py` — Bangkok timezone (UTC+7) for "today" determination, today→yesterday→404 fallback, `is_fallback` injected at response time (not stored)
- Registered `daily_brief.router` in `backend/app/main.py`
- Added `DailyBrief` TypeScript interface to `frontend/src/types/index.ts` (7 fields, `overall_sentiment` union literal, `is_fallback` boolean)
- Added `getDailyBrief()` to `frontend/src/lib/api.ts` using shared `fetchAPI` helper (inherits `next: { revalidate: 60 }`)
- Created 7 integration tests in `backend/tests/routers/test_daily_brief.py`: 404, today with is_fallback=False, yesterday with is_fallback=True, today-over-yesterday preference, sentiment enum, timezone-aware generated_at, all-fields-present
- Full test suite: 119/119 passed (no regressions). TypeScript: 0 type errors.

### File List

**New files:**
- `backend/app/services/daily_brief_store.py`
- `backend/app/routers/daily_brief.py`
- `backend/tests/routers/test_daily_brief.py`

**Modified files:**
- `backend/app/models/schemas.py`
- `backend/app/main.py`
- `frontend/src/types/index.ts`
- `frontend/src/lib/api.ts`

### Change Log

- 2026-06-22: Story 4.1 implemented — DailyBrief schema, DailyBriefStore, GET /daily-brief/ endpoint with Bangkok-timezone fallback, TypeScript type, api.ts method, 7 integration tests. 119/119 tests pass.
