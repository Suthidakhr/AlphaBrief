---
status: done
epic: 4
story: 3
story_key: "4-3-daily-brief-ingestion-webhook-and-n8n-scheduling"
created: 2026-06-22
baseline_commit: 3de19d1f4c5b33a1c0ecee30ebc48a9128b14093
---

# Story 4.3: Daily Brief Ingestion Webhook & n8n Scheduling

**Status:** done

## Story

As the n8n orchestration system,
I want to push the AI-generated Daily Brief into ASK each morning via a webhook endpoint,
So that a fresh brief is available for users by the time they open the app after 07:00 Bangkok time.

## Acceptance Criteria

### AC1 — `POST /webhooks/daily-brief` creates a new brief

**Given** `POST /webhooks/daily-brief` receives a valid `DailyBriefIngestPayload`
**When** called for a `brief_date` with no existing brief
**Then** it returns `HTTP 200` with `{"status": "created"}`
**And** `GET /daily-brief/` now returns today's brief with `is_fallback: false`

### AC2 — Upsert idempotency: second call for same `brief_date` updates, not duplicates

**Given** `POST /webhooks/daily-brief` is called a second time with the same `brief_date`
**When** n8n retries or re-generates the brief
**Then** it returns `HTTP 200` with `{"status": "updated"}`
**And** only one `DailyBrief` record exists per calendar date (upsert by `brief_date`)

### AC3 — Invalid `overall_sentiment` rejected

**Given** a payload with `overall_sentiment` outside `"bullish" | "bearish" | "neutral"`
**When** the endpoint receives it
**Then** it returns `HTTP 422` (Pydantic `Literal` validation at the boundary)

### AC4 — Timezone-naive `generated_at` rejected

**Given** a payload with a timezone-naive `generated_at` (e.g. `"2026-06-22T07:05:00"` — no offset, no `Z`)
**When** the endpoint receives it
**Then** it returns `HTTP 422` (Pydantic `AwareDatetime` validation enforces timezone awareness — NFR-D03)

### AC5 — n8n workflow configured at 07:00 Bangkok time

**Given** the n8n workflow for Daily Brief generation
**When** it is configured in n8n
**Then** it triggers daily at 07:00 Bangkok time (UTC+7) = `00:00 UTC` (cron: `0 0 * * *` in UTC)
**And** the trigger time is configurable without a code deploy
**And** the webhook URL is stored in an n8n environment variable (`ASK_DAILY_BRIEF_WEBHOOK_URL`) — never hardcoded (FR-D04)

### AC6 — Integration: webhook write → GET read verification

**Given** integration tests for `POST /webhooks/daily-brief`
**When** they run
**Then** idempotency is verified: calling for the same `brief_date` twice yields one record with the latest data (status: `"updated"`)
**And** the fallback behavior is confirmed: before the webhook fires, `GET /daily-brief/` returns yesterday's brief with `is_fallback: true`; after the webhook fires for today, `GET /daily-brief/` returns today's brief with `is_fallback: false`

---

## Dev Notes

### Critical Architecture: This Story is Purely Backend

**No frontend changes.** All work is in the backend and documentation.

**Files to create (NEW):**
- `backend/tests/routers/test_webhooks_daily_brief.py`

**Files to modify (UPDATE):**
- `backend/app/models/schemas.py` — add `DailyBriefIngestPayload` + `DailyBriefWebhookResponse`
- `backend/app/routers/webhooks.py` — add `POST /webhooks/daily-brief` endpoint
- `docs/n8n-setup.md` — add "Workflow 3: Daily Brief" section

---

### Existing Pattern: Follow `webhooks.py` Exactly

The webhook router (`backend/app/routers/webhooks.py`) currently has two endpoints. This story adds a third. Follow the EXACT same structure:

```python
# CURRENT state of webhooks.py — read this before adding to it
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    AIAnalysisPayload, AIAnalysisResponse,
    NewsIngestPayload, WebhookIngestResponse,
)
from app.services.news_store import news_store

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/news-ingest", response_model=WebhookIngestResponse)
async def ingest_news(payload: NewsIngestPayload) -> WebhookIngestResponse:
    payload_dict = payload.model_dump()
    event_id, status = news_store.ingest(payload_dict)
    return WebhookIngestResponse(event_id=event_id, status=status)

@router.post("/ai-analysis", response_model=AIAnalysisResponse)
async def attach_ai_analysis(payload: AIAnalysisPayload) -> AIAnalysisResponse:
    analysis_dict = payload.model_dump(exclude={"news_id"})
    result = news_store.attach_analysis(payload.news_id, analysis_dict)
    if result is None:
        raise HTTPException(status_code=404, detail="News item not found")
    return AIAnalysisResponse(status=result)
```

**What to add to `webhooks.py`:**
1. Import `DailyBriefIngestPayload`, `DailyBriefWebhookResponse` from schemas
2. Import `daily_brief_store` from services
3. Add `POST /daily-brief` endpoint

The endpoint body is simple — `DailyBriefStore.upsert()` already exists and returns `"created"` or `"updated"`. The endpoint just calls it and wraps the result:

```python
@router.post("/daily-brief", response_model=DailyBriefWebhookResponse)
async def ingest_daily_brief(payload: DailyBriefIngestPayload) -> DailyBriefWebhookResponse:
    status = daily_brief_store.upsert(payload.model_dump())
    return DailyBriefWebhookResponse(status=status)
```

---

### New Schemas to Add to `schemas.py`

Add at the end of `schemas.py`, after the existing `DailyBrief` class.

**`DailyBriefIngestPayload`** — the incoming webhook body. It is identical to `DailyBrief` MINUS `is_fallback` (which is computed at read time by the GET endpoint, never sent by n8n):

```python
class DailyBriefIngestPayload(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overall_sentiment: Literal["bullish", "bearish", "neutral"]
    key_developments: list[str]
    opportunities: list[str]
    risks: list[str]
    generated_at: AwareDatetime
    brief_date: date
```

**`DailyBriefWebhookResponse`** — the response body:

```python
class DailyBriefWebhookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: Literal["created", "updated"]
```

**Why a separate payload class?** Consistent with the pattern established by `NewsIngestPayload` (separate from `NewsItem`) and `AIAnalysisPayload` (separate from `AIAnalysis`). The ingest payload is what n8n sends; the response models are what the API returns. Keeping them separate means schema changes to the response model don't accidentally change the webhook contract.

---

### `DailyBriefStore.upsert()` — Already Implemented in Story 4.1

The store is at `backend/app/services/daily_brief_store.py`. `upsert()` returns `"created"` or `"updated"` and is thread-safe:

```python
def upsert(self, payload_dict: dict) -> str:
    with self._lock:
        key = payload_dict["brief_date"].isoformat()
        status = "created" if key not in self._briefs else "updated"
        self._briefs[key] = dict(payload_dict)
        return status
```

`payload.model_dump()` on `DailyBriefIngestPayload` produces a dict with `brief_date` as a Python `date` object — `upsert()` calls `.isoformat()` on it, which is exactly what it expects.

**No changes to `DailyBriefStore`.** It is complete.

---

### No Authentication on Webhook (MVP Decision)

All existing webhook endpoints in `webhooks.py` have no authentication. This was deliberately deferred as an MVP decision (recorded in deferred-work.md from Story 3.1 code review: "No authentication on webhook endpoint — deferred, pre-existing architectural decision for MVP"). The Daily Brief webhook follows the same pattern — no auth header, no secret validation. Do NOT add authentication in this story.

---

### Test File: `test_webhooks_daily_brief.py`

**Location:** `backend/tests/routers/test_webhooks_daily_brief.py`

**Test framework:** pytest with `asyncio_mode = "auto"`, `AsyncClient` + `ASGITransport`, conftest `client` fixture. Same as all other router test files. Run from `backend/` directory: `./venv/bin/pytest tests/ -q`

**Reset fixture pattern** (from `test_daily_brief.py` and `test_webhooks_news.py`):
```python
@pytest.fixture(autouse=True)
async def reset_store():
    daily_brief_store.reset()
    yield
    daily_brief_store.reset()
```

Note: `test_webhooks_news.py` resets BEFORE yield AND after. Use the same pattern here (reset both before and after) to ensure a clean state regardless of test ordering.

**VALID_PAYLOAD:**
```python
from datetime import date, datetime, timezone

VALID_PAYLOAD = {
    "overall_sentiment": "bullish",
    "key_developments": ["SET rose 0.8%", "SCB gains", "Oil steady"],
    "opportunities": ["Banking sector"],
    "risks": ["Global rate uncertainty"],
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "brief_date": date.today().isoformat(),
}
```

**Required test cases:**

| # | AC | Test name | Assertion |
|---|---|---|---|
| 1 | AC1 | `test_ingest_valid_payload_returns_200` | `status_code == 200` |
| 2 | AC1 | `test_ingest_valid_payload_returns_created_status` | `data["status"] == "created"` |
| 3 | AC2 | `test_ingest_same_date_twice_returns_updated` | first→"created", second→"updated" |
| 4 | AC2 | `test_ingest_idempotent_only_one_record_per_date` | `GET /daily-brief/` returns same data after second POST |
| 5 | AC1 | `test_ingest_creates_readable_brief_via_get` | POST today, GET → 200, `is_fallback=False` |
| 6 | AC6 | `test_fallback_before_ingest_returns_yesterday` | seed yesterday, GET → 200, `is_fallback=True`; POST today, GET → 200, `is_fallback=False` |
| 7 | AC3 | `test_invalid_sentiment_returns_422` | POST with `"overall_sentiment": "mixed"` → 422 |
| 8 | AC4 | `test_naive_datetime_returns_422` | POST with `"generated_at": "2026-06-22T07:05:00"` → 422 |
| 9 | AC3 | `test_missing_required_field_returns_422` | POST with omitted `brief_date` → 422 |

**Endpoint path:** `POST /webhooks/daily-brief` (prefix `/webhooks` + path `/daily-brief`)

---

### n8n Documentation Update: `docs/n8n-setup.md`

Append a new "Workflow 3: Daily Brief" section to the existing `docs/n8n-setup.md`. The existing file covers Workflow 1 (News Ingestion) and Workflow 2 (AI Analysis). This adds Workflow 3.

**New environment variable** (add to the Variables table in the existing doc):

| Variable | Description | Example |
|---|---|---|
| `ASK_DAILY_BRIEF_WEBHOOK_URL` | Full URL for `POST /webhooks/daily-brief` | `https://ask.example.com/webhooks/daily-brief` |

**Section to append:**

```markdown
---

## Workflow 3: Daily Brief

### Schedule Configuration (FR-D04)

The Daily Brief is generated once per day by the AI pipeline and pushed to ASK at 07:00 Bangkok time.

Bangkok time is UTC+7. The cron expression below is in **UTC**.

```
0 0 * * *
```

This fires at 00:00 UTC = 07:00 Bangkok time, every day including weekends.

**n8n version note:** For 6-field cron (with seconds): `0 0 0 * * *`

### Trigger Node

- **Type:** Schedule Trigger
- **Cron:** `0 0 * * *` (UTC)
- **Mode:** "At specified time" or "Custom (cron expression)" depending on n8n version

### AI Generation Node

Configure a Claude API HTTP Request node to call the model with the Daily Brief system prompt. The prompt instructs the model to return JSON matching the `DailyBriefIngestPayload` schema:

```json
{
  "overall_sentiment": "bullish" | "bearish" | "neutral",
  "key_developments": ["string", "string", "string"],
  "opportunities": ["string"],
  "risks": ["string"],
  "generated_at": "2026-06-22T00:05:00Z",
  "brief_date": "2026-06-22"
}
```

Note: `is_fallback` is **not** part of the payload — the ASK backend computes it.

### Webhook Delivery Node

- **Method:** POST
- **URL:** `{{ $env.ASK_DAILY_BRIEF_WEBHOOK_URL }}`
- **Content-Type:** `application/json`
- **Body:** The parsed JSON from the AI generation node
- **Success response:** `{"status": "created"}` or `{"status": "updated"}`

Both responses are treated as success — no retry needed.

### Error Handling

- **On AI generation failure:** n8n logs the error. The GET endpoint will serve yesterday's brief as fallback.
- **On webhook delivery failure:** n8n retries automatically. The endpoint is idempotent — retries for the same `brief_date` return `{"status": "updated"}` and are safe.
- **On validation error (422):** Fix the AI prompt; the schema contract is enforced at the boundary.
```

---

### Integration with `GET /daily-brief/`

The write path (this story) and read path (Story 4.1) are connected via `DailyBriefStore`:
- `POST /webhooks/daily-brief` → `daily_brief_store.upsert(payload.model_dump())` → stores under `brief_date.isoformat()` key
- `GET /daily-brief/` → `daily_brief_store.get_for_date(today)` → reads by Bangkok date

No additional wiring needed. The store is the shared in-memory singleton.

---

### Previous Story Intelligence

**From Story 4.1 (DailyBrief Schema & API Endpoint):**
- `DailyBrief` schema in `schemas.py`: `is_fallback` is NOT stored — injected at read time by the GET endpoint
- `DailyBriefStore.upsert()` accepts a `dict` with `brief_date: date` object (not a string); `.isoformat()` called inside `upsert()` for the key
- `model_dump()` on a Pydantic model with `brief_date: date` produces a Python `date` object — correct for `upsert()`

**From Story 4.2 (DailyBriefCard Component):**
- No backend changes — Story 4.3 is the write path; Story 4.2 was the frontend display

**From Stories 3.1 and 3.2 (webhook patterns):**
- `autouse` reset fixture runs BEFORE AND AFTER each test (`reset(); yield; reset()`)
- VALID_PAYLOAD uses `datetime.now(timezone.utc).isoformat()` for datetime fields
- Tests are grouped by AC in the file, with comments marking each AC section
- No authentication on any webhook endpoint — consistent with MVP pattern

**Test baseline (before this story):** 119 backend tests / 136 frontend tests

---

### Common Mistakes to Avoid

1. **Do NOT add `is_fallback` to `DailyBriefIngestPayload`** — n8n never sends it; the GET endpoint computes it
2. **Do NOT modify `DailyBriefStore`** — it is complete and tested
3. **Do NOT modify `daily_brief.py` (the GET router)** — only `webhooks.py` changes
4. **Do NOT use `date.today()`** for the test's `brief_date` without importing `date` from `datetime`
5. **Endpoint path is `/daily-brief`** on the router (the `APIRouter` prefix is `/webhooks`) → full path is `POST /webhooks/daily-brief`
6. **`model_dump()` not `dict()`** — use `payload.model_dump()` consistent with all other webhook endpoints
7. **Reset fixture BEFORE yield too** — `test_webhooks_news.py` resets before AND after; do the same to prevent test pollution from earlier test files

---

## Tasks / Subtasks

- [x] Task 1: Add schemas to `backend/app/models/schemas.py`
  - [x] 1a: Add `DailyBriefIngestPayload` class (all `DailyBrief` fields minus `is_fallback`)
  - [x] 1b: Add `DailyBriefWebhookResponse` class (`status: Literal["created", "updated"]`)

- [x] Task 2: Add `POST /webhooks/daily-brief` endpoint to `backend/app/routers/webhooks.py`
  - [x] 2a: Import `DailyBriefIngestPayload`, `DailyBriefWebhookResponse` from schemas
  - [x] 2b: Import `daily_brief_store` from services
  - [x] 2c: Add endpoint calling `daily_brief_store.upsert(payload.model_dump())`

- [x] Task 3: Create `backend/tests/routers/test_webhooks_daily_brief.py` with 9 tests
  - [x] 3a: VALID_PAYLOAD fixture + autouse reset fixture (reset before and after)
  - [x] 3b: AC1 tests (create: 200, "created" status)
  - [x] 3c: AC2 tests (upsert: second call → "updated"; one record per date)
  - [x] 3d: AC1+AC6 integration tests (POST then GET; fallback before/after webhook fires)
  - [x] 3e: AC3 test (invalid sentiment → 422)
  - [x] 3f: AC4 test (naive datetime → 422)
  - [x] 3g: AC3 test (missing required field → 422)

- [x] Task 4: Update `docs/n8n-setup.md` with Daily Brief workflow section
  - [x] 4a: Add `ASK_DAILY_BRIEF_WEBHOOK_URL` to the environment variables table
  - [x] 4b: Append "Workflow 3: Daily Brief" section with schedule, nodes, and error handling

- [x] Task 5: Run backend test suite and confirm zero regressions
  - [x] All 119 existing tests still pass
  - [x] 9 new tests pass
  - [x] Total: 128 tests, 0 failures

### Review Findings

- [x] [Review][Patch] Rotating Webhook URLs section omits `ASK_DAILY_BRIEF_WEBHOOK_URL` [docs/n8n-setup.md:197]
- [x] [Review][Defer] `VALID_PAYLOAD` captures `date.today()` at module import time — midnight CI flake risk [backend/tests/routers/test_webhooks_daily_brief.py:12] — deferred, pre-existing pattern in other test files
- [x] [Review][Defer] UTC vs BKK `brief_date` mismatch: ingester running in UTC sends wrong calendar date between 00:00–07:00 BKK — deferred, documented constraint in n8n-setup.md; not enforceable at schema level
- [x] [Review][Defer] Empty list fields `key_developments`, `opportunities`, `risks` accepted silently — deferred, no AC requirement; enhancement for a future validation story
- [x] [Review][Defer] async reset fixture acquires threading.Lock — potential event loop blocking under pytest-asyncio — deferred, pre-existing store design; all 128 tests pass
- [x] [Review][Defer] AC5 cron `0 0 * * *` cannot be exposed as n8n env var — schedule change requires n8n workflow edit (not a code deploy) — deferred, n8n platform constraint; interpretation of AC5 is satisfied

---

## Dev Agent Record

### Implementation Plan

RED→GREEN→REFACTOR cycle:
1. Wrote `test_webhooks_daily_brief.py` (9 tests) first — all 9 failed on 404 (endpoint missing).
2. Added `DailyBriefIngestPayload` and `DailyBriefWebhookResponse` to `schemas.py` (appended after `DailyBrief`).
3. Added `POST /webhooks/daily-brief` to `webhooks.py` — 4-line body calling `daily_brief_store.upsert(payload.model_dump())`.
4. All 9 tests passed. Full suite: 128/128.
5. Updated `docs/n8n-setup.md`: added `ASK_DAILY_BRIEF_WEBHOOK_URL` to env vars table, updated overview table to show 3 workflows, appended Workflow 3 section.

### Debug Log

No issues. `DailyBriefStore.upsert()` already accepted `dict` with `brief_date: date` object and called `.isoformat()` internally — `payload.model_dump()` produced exactly that shape.

### Completion Notes

- 2 new schema classes added to `schemas.py` (32 lines)
- 1 new endpoint added to `webhooks.py` (4-line body)
- 1 new test file: 9 tests covering AC1–AC4 + AC6 integration
- `docs/n8n-setup.md`: overview table updated, env var added, Workflow 3 section appended (~60 lines)
- Test count: 119 → 128 backend (all pass). Frontend: 136 unchanged.

---

## File List

### New Files
- `backend/tests/routers/test_webhooks_daily_brief.py`

### Modified Files
- `backend/app/models/schemas.py`
- `backend/app/routers/webhooks.py`
- `docs/n8n-setup.md`

---

## Change Log

| Date | Change |
|------|--------|
| 2026-06-22 | Story created |
| 2026-06-22 | Implementation complete — 2 schemas, 1 endpoint, 9 tests, n8n doc updated |
