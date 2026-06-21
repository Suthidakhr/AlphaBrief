# Deferred Work Log

## Deferred from: code review of 2-2-news-api-endpoints (2026-06-21)

- **D1: Mock data expiry** — All `NEWS_DATA` items have hardcoded `published_at` dates around 2026-06-21; after 2026-06-28 the retention filter will silently return an empty list. Fix by anchoring mock dates relative to `datetime.now()` or using dynamic dates.
- **D2: `GET /categories` missing `response_model`** — The endpoint returns a raw dict with no Pydantic validation. Add a `CategoriesResponse` schema or `response_model=dict[str, list[str]]`.
- **D3: `GET /categories` / `GET /news/` category inconsistency** — `GET /categories` is built from full `NEWS_DATA` at import time; `GET /news/` filters by retention window. A category with only stale items appears in `/categories` but returns 0 items from `/news/`. Fix by computing categories dynamically from the retention-filtered dataset.
- **D4: "STORIES TODAY" widget misleading count** — `newsResponse.items.length` in `news/page.tsx` shows the filtered/paginated count (max 20), not actual stories published today. Rename label or add a `total` field to `NewsListResponse` pre-slice.
- **D5: "15 MIN REFRESH RATE" label mismatch** — `news/page.tsx` displays "15 MIN" but the actual ISR interval is 60 seconds (set in `fetchAPI`). Update the label to match reality.
- **D6: `NEWS_RETENTION_DAYS` module-level parse** — Parsed as `int(os.getenv(...))` at import time; tests cannot override the value without patching the module global. Migrate to Pydantic `BaseSettings` or a per-request `os.getenv()` call when test isolation becomes necessary.
