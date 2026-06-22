from datetime import datetime, timezone

import pytest
from app.services.news_store import news_store

VALID_PAYLOAD = {
    "headline": "Test Article Headline",
    "source": "Test Source",
    "source_url": "https://example.com/article-001",
    "published_at": datetime.now(timezone.utc).isoformat(),
    "category": "หุ้นไทย",
    "content": "This is the full content of the test article for ingestion testing.",
    "summary": "Short summary.",
    "featured": False,
}


@pytest.fixture(autouse=True)
async def reset_store():
    news_store.reset()
    yield
    news_store.reset()


# --- AC1: Valid payload creates a new item ---

async def test_ingest_valid_payload_returns_200(client):
    response = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    assert response.status_code == 200


async def test_ingest_valid_payload_returns_created_status(client):
    response = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    data = response.json()
    assert data["status"] == "created"
    assert isinstance(data["event_id"], str)
    assert len(data["event_id"]) > 0


# --- AC2: URL deduplication ---

async def test_ingest_same_url_twice_returns_duplicate(client):
    first = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    second = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    assert first.status_code == 200
    assert second.status_code == 200
    first_data = first.json()
    second_data = second.json()
    assert first_data["status"] == "created"
    assert second_data["status"] == "duplicate"
    assert second_data["event_id"] == first_data["event_id"]


# --- AC3: Content hash deduplication ---

async def test_ingest_same_content_different_url_returns_duplicate(client):
    payload_a = {**VALID_PAYLOAD, "source_url": "https://source-a.com/article"}
    payload_b = {**VALID_PAYLOAD, "source_url": "https://source-b.com/article"}
    first = await client.post("/webhooks/news-ingest", json=payload_a)
    second = await client.post("/webhooks/news-ingest", json=payload_b)
    assert first.json()["status"] == "created"
    assert second.json()["status"] == "duplicate"
    assert second.json()["event_id"] == first.json()["event_id"]


# --- AC4: Non-nullable field validation ---

async def test_ingest_missing_headline_returns_422(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "headline"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


async def test_ingest_missing_source_returns_422(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "source"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


async def test_ingest_missing_source_url_returns_422(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "source_url"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


async def test_ingest_missing_content_returns_422(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "content"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


async def test_ingest_missing_published_at_returns_422(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "published_at"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


async def test_ingest_missing_category_returns_422(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "category"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


# --- AC5: Category validation ---

async def test_ingest_invalid_category_returns_422(client):
    payload = {**VALID_PAYLOAD, "category": "INVALID_CATEGORY"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


# --- AC6: Timezone-aware published_at ---

async def test_ingest_timezone_naive_published_at_returns_422(client):
    payload = {**VALID_PAYLOAD, "published_at": "2026-06-22T09:00:00"}
    response = await client.post("/webhooks/news-ingest", json=payload)
    assert response.status_code == 422


# --- AC7: n8n retry idempotency ---

async def test_ingest_three_retries_create_one_record(client):
    first = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    assert first.status_code == 200
    assert first.json()["status"] == "created"
    original_id = first.json()["event_id"]

    second = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    assert second.status_code == 200
    assert second.json()["status"] == "duplicate"
    assert second.json()["event_id"] == original_id

    third = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    assert third.status_code == 200
    assert third.json()["status"] == "duplicate"
    assert third.json()["event_id"] == original_id

    news_response = await client.get("/news/")
    items = news_response.json()["items"]
    matching = [i for i in items if i["source_url"] == VALID_PAYLOAD["source_url"]]
    assert len(matching) == 1


# --- AC8: Ingested item visible in GET /news/ ---

async def test_ingest_item_appears_in_news_feed(client):
    ingest_response = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    event_id = ingest_response.json()["event_id"]

    news_response = await client.get("/news/")
    items = news_response.json()["items"]
    matching = [i for i in items if i["source_url"] == VALID_PAYLOAD["source_url"]]
    assert len(matching) == 1
    item = matching[0]
    assert item["ai_analysis"] is None
    assert item["stock_impacts"] == []
    assert item["headline"] == VALID_PAYLOAD["headline"]
    assert item["id"] == event_id


async def test_ingest_item_retrievable_by_id(client):
    ingest_response = await client.post("/webhooks/news-ingest", json=VALID_PAYLOAD)
    event_id = ingest_response.json()["event_id"]

    detail_response = await client.get(f"/news/{event_id}")
    assert detail_response.status_code == 200
    data = detail_response.json()
    assert data["id"] == event_id
    assert data["source_url"] == VALID_PAYLOAD["source_url"]
    assert data["ai_analysis"] is None
    assert data["stock_impacts"] == []
