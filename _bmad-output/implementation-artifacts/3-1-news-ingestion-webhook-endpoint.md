---
status: done
epic: 3
story: 1
story_key: "3-1-news-ingestion-webhook-endpoint"
created: 2026-06-22
baseline_commit: 66717d6cf5ee40cf0278f103fb0a91850a5b74b8
---

# Story 3.1: News Ingestion Webhook Endpoint

**Status:** done

## Story

As the n8n orchestration system,
I want to push ingested news articles into ASK via a FastAPI webhook endpoint,
So that news items appear in the feed automatically within 30 minutes of publication without manual intervention.

## Acceptance Criteria

### AC1 — Valid payload creates a new news item

**Given** `POST /webhooks/news-ingest` receives a valid payload
**When** n8n calls the endpoint
**Then** it returns `HTTP 200` with `{"event_id": "<generated-uuid>", "status": "created"}`
**And** the news item is stored and becomes available via `GET /news/`

### AC2 — URL deduplication (same `source_url`)

**Given** the same `source_url` is submitted a second time
**When** `POST /webhooks/news-ingest` is called again
**Then** it returns `HTTP 200` with `{"event_id": "<original-id>", "status": "duplicate"}` — the ORIGINAL `event_id` is returned
**And** no second record is created (idempotent — `GET /news/` still has only one item with that URL)

### AC3 — Content hash deduplication (same content, different URL)

**Given** two articles with different `source_url` values but identical `content` body
**When** both are submitted
**Then** only the first is stored — the second returns `{"event_id": "<original-id>", "status": "duplicate"}`

### AC4 — Non-nullable field validation

**Given** a payload missing any non-nullable field (`headline`, `source`, `source_url`, `published_at`, `category`, `content`)
**When** the endpoint receives it
**Then** it returns `HTTP 422` with a clear field-level validation error — never `HTTP 500`

### AC5 — Category validation

**Given** a payload with a `category` value outside the 5 defined categories (`ดอกเบี้ยโลก`, `พลังงาน`, `หุ้นไทย`, `เทคโนโลยี`, `ตลาดโลก`)
**When** the endpoint receives it
**Then** it returns `HTTP 422` — freeform category strings are rejected at the boundary

### AC6 — Timezone-aware `published_at` enforcement

**Given** a payload with a timezone-naive `published_at` (no UTC offset or `Z`)
**When** the endpoint receives it
**Then** it returns `HTTP 422` — timezone-naive datetimes are rejected (NFR-D03)

### AC7 — n8n retry idempotency

**Given** n8n retries the same payload 3 times due to a transient network failure
**When** all three requests arrive
**Then** exactly one news item is stored — idempotency is guaranteed regardless of retry count (NFR-R01)

### AC8 — Ingested item visible in GET /news/

**Given** a valid article is ingested via `POST /webhooks/news-ingest`
**When** `GET /news/` is called
**Then** the ingested item appears in the list with `ai_analysis: null` and `stock_impacts: []`

---

## Tasks / Subtasks

- [x] Task 1: Add webhook schemas to `schemas.py` (AC1, AC4, AC5, AC6)
  - [x] Add `NewsIngestPayload(BaseModel)` with non-nullable fields: `headline: str`, `source: str`, `source_url: str`, `published_at: AwareDatetime`, `category: NewsCategory`, `content: str`; optional: `summary: str = ""`, `featured: bool = False`
  - [x] Add `WebhookIngestResponse(BaseModel)` with `event_id: str`, `status: Literal["created", "duplicate"]`
  - [x] Confirm `ConfigDict(from_attributes=True)` on both models (consistent with existing schemas)

- [x] Task 2: Create `backend/app/services/news_store.py` — mutable in-memory news store (AC1, AC2, AC3, AC7, AC8)
  - [x] Create `NewsStore` class with `__init__` that initializes from `NEWS_DATA` (preserves mock data for GET endpoints)
  - [x] Build `_url_index: dict[str, str]` mapping `source_url → id` from mock data at init
  - [x] Build `_content_hashes: dict[str, str]` mapping `sha256(content) → id` from mock data at init
  - [x] Implement `_hash(content: str) -> str` using `hashlib.sha256(content.encode()).hexdigest()`
  - [x] Implement `get_all() -> list[dict]` returning a copy of the items list
  - [x] Implement `get_by_id(news_id: str) -> dict | None`
  - [x] Implement `ingest(payload_dict: dict) -> tuple[str, str]` — checks URL → content hash → creates item; returns `(event_id, status)`; uses `str(uuid.uuid4())` for new IDs; sets `"ai_analysis": None`, `"stock_impacts": []` on new items
  - [x] Implement `reset() -> None` that reinitializes from `NEWS_DATA` (for test isolation)
  - [x] Create module-level singleton: `news_store = NewsStore()`

- [x] Task 3: Update `backend/app/routers/news.py` to use `news_store` (AC8)
  - [x] Add `from app.services.news_store import news_store` import
  - [x] Keep `from app.services.mock_data import NEWS_DATA` import ONLY for `CATEGORIES` set (do not remove — `CATEGORIES` still uses `NEWS_DATA` which is a static constant; no behavior change)
  - [x] In `get_news()`: change `[n for n in NEWS_DATA if ...]` → `[n for n in news_store.get_all() if ...]`
  - [x] In `get_news_by_id()`: replace the `for item in NEWS_DATA` loop with `news_store.get_by_id(news_id)` (if None → raise 404)
  - [x] Run `pytest tests/routers/test_news.py` — all existing tests must still pass (no regressions)

- [x] Task 4: Create `backend/app/routers/webhooks.py` (AC1–AC7)
  - [x] Create router with `prefix="/webhooks"`, `tags=["webhooks"]`
  - [x] Implement `POST /news-ingest` endpoint accepting `NewsIngestPayload` body and returning `WebhookIngestResponse`
  - [x] Call `news_store.ingest(payload.model_dump())` — Pydantic converts `AwareDatetime` to Python `datetime` object on `model_dump()`; make sure the dict item `"published_at"` remains a datetime (not re-serialized to string)
  - [x] Return `WebhookIngestResponse(event_id=event_id, status=status)` directly

- [x] Task 5: Register webhooks router in `main.py` (AC1)
  - [x] Add `from app.routers import webhooks` import
  - [x] Add `app.include_router(webhooks.router)` after existing router registrations

- [x] Task 6: Write integration tests in `tests/routers/test_webhooks_news.py` (AC1–AC8)
  - [x] Create `reset_store` autouse fixture that calls `news_store.reset()` before each test
  - [x] Implement valid `VALID_PAYLOAD` fixture dict with all required fields, `published_at` as ISO 8601 with UTC offset
  - [x] Test AC1: valid POST → 200, `status == "created"`, `event_id` is a UUID string
  - [x] Test AC2 (URL dedup): POST same payload twice → second returns `status == "duplicate"`, `event_id` matches first
  - [x] Test AC3 (content hash dedup): POST payload1 (url-a), then payload2 (url-b, same content) → second returns `"duplicate"`
  - [x] Test AC4: POST with `headline` missing → 422
  - [x] Test AC5: POST with `category="INVALID"` → 422
  - [x] Test AC6: POST with `published_at="2026-06-22T09:00:00"` (no timezone) → 422
  - [x] Test AC7 (idempotency): POST same payload 3× → only 1 item in `GET /news/`, all 3 calls return 200
  - [x] Test AC8: After successful POST, `GET /news/` returns item with matching `source_url`, `ai_analysis` is `null`, `stock_impacts` is `[]`

- [x] Task 7: Run full pytest suite and verify no regressions
  - [x] Run `cd backend && pytest` — all tests pass (≥ previous count + new webhook tests)

### Review Findings

- [x] [Review][Patch] P1: Hardcoded published_at in VALID_PAYLOAD expires after 7 days — tests will fail on 2026-06-29 [backend/tests/routers/test_webhooks_news.py:8]
- [x] [Review][Patch] P2: AC4 coverage gap — no test for missing published_at returning 422 [backend/tests/routers/test_webhooks_news.py]
- [x] [Review][Patch] P3: AC4 coverage gap — no test for missing category returning 422 [backend/tests/routers/test_webhooks_news.py]
- [x] [Review][Patch] P4: AC7 test doesn't assert retries 2 and 3 return status="duplicate" [backend/tests/routers/test_webhooks_news.py:108-116]
- [x] [Review][Patch] P5: get_by_id returns mutable dict reference — caller can corrupt store state [backend/app/services/news_store.py:23-27]
- [x] [Review][Patch] P6: No min_length on headline/content/source — empty string is accepted [backend/app/models/schemas.py:96-101]
- [x] [Review][Patch] P7: source_url is plain str — not validated as well-formed HTTP URL [backend/app/models/schemas.py:99]
- [x] [Review][Defer] D1: No authentication on webhook endpoint — deferred, pre-existing architectural decision for MVP [backend/app/routers/webhooks.py:8]
- [x] [Review][Defer] D2: In-memory store only — data lost on process restart — deferred, intentional MVP design [backend/app/services/news_store.py]
- [x] [Review][Defer] D3: threading.Lock ineffective across multiple worker processes — deferred, single-worker MVP [backend/app/services/news_store.py:7]
- [x] [Review][Defer] D4: get_by_id O(n) linear scan — no ID index — deferred, acceptable at MVP scale [backend/app/services/news_store.py:23-27]
- [x] [Review][Defer] D5: get_all shallow-copies list but not dicts — callers could mutate items — deferred, FastAPI serializes immediately [backend/app/services/news_store.py:19-21]
- [x] [Review][Defer] D6: AC3 content-hash dedup doesn't index the second source_url — deferred, dedup still correct [backend/app/services/news_store.py:34-37]
- [x] [Review][Defer] D7: KeyError in __init__ if mock data items lack source_url or content — deferred, controlled internal data [backend/app/services/news_store.py:9-12]
- [x] [Review][Defer] D8: No rate limiting on ingest endpoint — deferred, infrastructure concern outside MVP scope [backend/app/routers/webhooks.py]
- [x] [Review][Defer] D9: ingest() accepts untyped dict — type safety lost at store boundary — deferred, acceptable for MVP [backend/app/services/news_store.py:32]

---

## Dev Notes

### Architecture Context

Epic 3 begins the transition from static mock data to a live ingestion pipeline. Story 3.1 is **the first write path** into ASK — until now, the backend has been read-only (GET endpoints only). The webhook endpoint is how n8n pushes real news into the platform.

**Critical design principle (NFR-R01):** All n8n-facing endpoints must be idempotent. n8n retries webhook deliveries on transient failures. Without dedup, retries create duplicate records. Dedup is implemented at two levels:
1. `source_url` — same article URL submitted twice
2. `content` SHA-256 hash — same content body from two different source URLs (syndicated articles)

Both dedup paths return HTTP 200 (not 409) with `{"event_id": "<original>", "status": "duplicate"}`. This is intentional: n8n should not treat a duplicate as an error requiring retry.

### Current State of Data Layer (READ BEFORE CODING)

**`backend/app/services/mock_data.py`** — module-level `NEWS_DATA: list[dict]` with 5 hardcoded items. Currently READ ONLY — both `news.py` and `trends.py` import from it directly.

**`backend/app/routers/news.py`** — current pattern:
```python
from app.services.mock_data import NEWS_DATA
...
data = [n for n in NEWS_DATA if n["published_at"] >= cutoff]
```
This must be changed to use `news_store.get_all()` so ingested items appear in GET responses.

**`backend/app/routers/news.py` `CATEGORIES` set** — DO NOT change this:
```python
CATEGORIES = {item["category"] for item in NEWS_DATA}
```
This is fine as-is: mock data covers all 5 categories, and `NEWS_DATA` is a static constant used only here. No need to derive from the store for the `/categories` endpoint.

**`backend/app/main.py`** — no `/api/` prefix at the app level. Routes are at `/news/`, `/market/`, `/trends/`, and now `/webhooks/`. This is consistent with the existing frontend `api.ts` calls.

### `NewsStore` Design

The mutable in-memory store must:
1. **Initialize from `NEWS_DATA`** — so GET endpoints continue to return mock data with no change in behavior
2. **Maintain three data structures**: `_items: list[dict]`, `_url_index: dict[str, str]`, `_content_hashes: dict[str, str]`
3. **Use `threading.Lock()`** — FastAPI is async but can run in a multi-threaded context under uvicorn workers. Lock is lightweight and safe.
4. **Implement `reset()`** — for test isolation. Tests that POST to the webhook need the store to start clean.

```python
# backend/app/services/news_store.py
import hashlib
import uuid
from threading import Lock
from app.services.mock_data import NEWS_DATA

class NewsStore:
    def __init__(self):
        self._lock = Lock()
        self._items: list[dict] = list(NEWS_DATA)
        self._url_index: dict[str, str] = {item["source_url"]: item["id"] for item in self._items}
        self._content_hashes: dict[str, str] = {
            self._hash(item["content"]): item["id"] for item in self._items
        }

    def _hash(self, content: str) -> str:
        return hashlib.sha256(content.encode()).hexdigest()

    def get_all(self) -> list[dict]:
        with self._lock:
            return list(self._items)

    def get_by_id(self, news_id: str) -> dict | None:
        with self._lock:
            for item in self._items:
                if item["id"] == news_id:
                    return item
            return None

    def ingest(self, payload_dict: dict) -> tuple[str, str]:
        with self._lock:
            url = payload_dict["source_url"]
            content_hash = self._hash(payload_dict["content"])
            if url in self._url_index:
                return (self._url_index[url], "duplicate")
            if content_hash in self._content_hashes:
                return (self._content_hashes[content_hash], "duplicate")
            event_id = str(uuid.uuid4())
            item = {**payload_dict, "id": event_id, "ai_analysis": None, "stock_impacts": []}
            self._items.append(item)
            self._url_index[url] = event_id
            self._content_hashes[content_hash] = event_id
            return (event_id, "created")

    def reset(self) -> None:
        with self._lock:
            self._items = list(NEWS_DATA)
            self._url_index = {item["source_url"]: item["id"] for item in self._items}
            self._content_hashes = {
                self._hash(item["content"]): item["id"] for item in self._items
            }

news_store = NewsStore()
```

### `NewsIngestPayload` Schema

```python
class NewsIngestPayload(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    headline: str
    source: str
    source_url: str
    published_at: AwareDatetime        # Pydantic rejects timezone-naive → 422 automatically
    category: NewsCategory             # Pydantic rejects invalid category → 422 automatically
    content: str
    summary: str = ""
    featured: bool = False
```

**`ai_analysis` and `stock_impacts` are NOT in `NewsIngestPayload`** — these are set server-side (`None` and `[]` respectively). Story 3.2 will add the AI analysis delivery webhook.

### Webhook Router

```python
# backend/app/routers/webhooks.py
from fastapi import APIRouter
from app.models.schemas import NewsIngestPayload, WebhookIngestResponse
from app.services.news_store import news_store

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/news-ingest", response_model=WebhookIngestResponse)
async def ingest_news(payload: NewsIngestPayload) -> WebhookIngestResponse:
    payload_dict = payload.model_dump()
    event_id, status = news_store.ingest(payload_dict)
    return WebhookIngestResponse(event_id=event_id, status=status)
```

**Important**: `payload.model_dump()` serializes `AwareDatetime` to a Python `datetime` object (timezone-aware). The `_items` list stores dicts with `datetime` objects for `published_at` — exactly as `NEWS_DATA` stores them. The `news.py` router accesses `item["published_at"]` as a `datetime` for comparison: `n["published_at"] >= cutoff`. This is consistent.

### `payload.model_dump()` and datetime serialization

`model_dump()` (without `mode="json"`) returns Python objects, not JSON-serialized strings. So `payload_dict["published_at"]` will be a Python `datetime` with tzinfo — same type as what's in `NEWS_DATA`. This is correct. Do NOT use `model_dump(mode="json")` as it would serialize datetime to string, breaking the `>=` comparison in `news.py`.

### Test Isolation Strategy

The `news_store` singleton persists across test runs in the same pytest process. After a `POST /webhooks/news-ingest` test adds an item, the store is dirty for subsequent tests. Use an autouse fixture to reset:

```python
# tests/routers/test_webhooks_news.py
import pytest
from app.services.news_store import news_store

@pytest.fixture(autouse=True)
async def reset_store():
    news_store.reset()
    yield
    news_store.reset()  # cleanup after test too

VALID_PAYLOAD = {
    "headline": "Test Article Headline",
    "source": "Test Source",
    "source_url": "https://example.com/article-001",
    "published_at": "2026-06-22T09:00:00+00:00",
    "category": "หุ้นไทย",
    "content": "This is the full content of the test article for ingestion testing.",
    "summary": "Short summary.",
    "featured": False,
}
```

**Note**: The `autouse` fixture applies only to the test module where it's defined. Existing tests in `test_news.py` are unaffected.

### Existing Tests Must Still Pass

After Task 3 changes `news.py` to use `news_store`, the existing `test_news.py` tests (14 tests) must still pass. They will — because `news_store` initializes from `NEWS_DATA` and its `get_all()` returns the same 5 items. The `CATEGORIES` computation in `news.py` stays the same (`NEWS_DATA`-based). Zero regressions expected.

### File Structure

The `routers/` layer pattern is `router = APIRouter(prefix=...)` with endpoints as `@router.get/post(...)`. The `main.py` collects routers with `app.include_router(...)`. No changes to the layering pattern.

The `webhooks.py` router is a **new file** under `backend/app/routers/` — not added to the `__init__.py` (check if `__init__.py` exports anything before deciding). Looking at `main.py`, it imports `from app.routers import news, market, trends` — so just add `from app.routers import webhooks` to `main.py`.

### Test File Location

New file: `backend/tests/routers/test_webhooks_news.py`
Existing test files in `backend/tests/routers/`: `test_market.py`, `test_news.py`, `test_trends.py`

### Numeric Safety Not Applicable Here

This story deals with string/datetime/category fields. No financial numeric values are formatted in the webhook endpoint itself. `isFinite()` guards are a frontend concern and existing backend concern — not needed in the ingestion webhook.

### The `summary` Field

The existing `NewsItem` schema has `summary: str` (non-nullable) while the epics AC for Story 3.1 only lists `headline`, `source`, `source_url`, `published_at`, `category`, `content` as non-nullable ingest fields. The `summary` field defaults to `""` in `NewsIngestPayload` — n8n can provide it or omit it. Since `NewsItem` has `summary: str` (not optional), ingested items get `summary: ""` if not provided. This is acceptable for MVP.

### Previous Story Intelligence (Epic 2)

Epic 2 was entirely frontend. Key patterns to carry forward:
- All backend tests use `AsyncClient(transport=ASGITransport(app=app), base_url="http://test")` — do NOT use a different client pattern
- `pytest-asyncio` is installed with `asyncio_mode = "auto"` (no `@pytest.mark.asyncio` needed per test) — verify `pyproject.toml` has this set
- `conftest.py` provides the `client` fixture at `tests/conftest.py` — the webhook tests should use this same fixture
- Test files in `tests/routers/` follow the naming pattern `test_<feature>.py`

### `asyncio_mode = "auto"` — confirmed

`backend/pyproject.toml` already contains:
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```
No per-test `@pytest.mark.asyncio` decorators are needed. Async fixtures and tests work automatically.

### References

- Story AC source: `_bmad-output/planning-artifacts/epics.md` — Epic 3, Story 3.1 (lines ~808–848)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Idempotency, AwareDatetime, NFR-R01, NFR-D03
- Existing data model: `backend/app/models/schemas.py`
- Existing news router: `backend/app/routers/news.py`
- Mock data: `backend/app/services/mock_data.py`
- Existing test pattern: `backend/tests/conftest.py`, `backend/tests/routers/test_news.py`

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_none_

### Completion Notes List

- Introduced mutable `NewsStore` singleton in `services/news_store.py` initialized from `NEWS_DATA` — all existing GET endpoints continue to return mock data with zero behavior change
- `news.py` router migrated from direct `NEWS_DATA` reads to `news_store.get_all()` / `news_store.get_by_id()` — `CATEGORIES` set kept on `NEWS_DATA` (static constant, no change needed)
- `webhooks.py` router: `POST /webhooks/news-ingest` — Pydantic validates timezone-aware `published_at` and category automatically (422 on violation); dedup handled in `NewsStore.ingest()`
- 13 new integration tests cover all 8 ACs; `autouse` `reset_store` fixture provides per-test isolation
- Full suite: 95/95 pass (82 pre-existing + 13 new)

### File List

**New files:**
- `backend/app/services/news_store.py`
- `backend/app/routers/webhooks.py`
- `backend/tests/routers/test_webhooks_news.py`

**Modified files:**
- `backend/app/models/schemas.py`
- `backend/app/routers/news.py`
- `backend/app/main.py`

### Change Log

- 2026-06-22: Implemented Story 3.1 — News Ingestion Webhook Endpoint. Added NewsStore mutable store, POST /webhooks/news-ingest with URL+content-hash dedup, updated news router to use store, 13 integration tests. 95/95 pass.
