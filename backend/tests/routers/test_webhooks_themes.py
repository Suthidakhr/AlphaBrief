from datetime import datetime, timezone

import pytest

from app.services.news_store import news_store
from app.services.theme_store import theme_store

VALID_PAYLOAD = {
    "theme_id": "theme-webhook-001",
    "name": "Fed Rate Cut Sentiment",
    "description": "Markets anticipate rate cuts following softer CPI data.",
    "overall_sentiment": "bullish",
    "article_count": 2,
    "last_article_at": datetime.now(timezone.utc).isoformat(),
    "created_at": datetime.now(timezone.utc).isoformat(),
    "constituent_article_ids": ["news-001", "news-002"],
}


@pytest.fixture(autouse=True)
async def reset_stores():
    news_store.reset()
    theme_store.reset()
    yield
    news_store.reset()
    theme_store.reset()


# --- AC1: Valid payload creates a new theme ---


async def test_valid_payload_returns_200(client):
    response = await client.post("/webhooks/themes", json=VALID_PAYLOAD)
    assert response.status_code == 200


async def test_valid_payload_returns_created_status(client):
    response = await client.post("/webhooks/themes", json=VALID_PAYLOAD)
    assert response.json()["status"] == "created"


# --- AC2: Upsert idempotency ---


async def test_idempotent_same_theme_id_returns_updated(client):
    first = await client.post("/webhooks/themes", json=VALID_PAYLOAD)
    second = await client.post("/webhooks/themes", json=VALID_PAYLOAD)
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["status"] == "created"
    assert second.json()["status"] == "updated"


async def test_idempotent_only_one_record_stored(client):
    updated = {**VALID_PAYLOAD, "name": "Updated Name"}
    await client.post("/webhooks/themes", json=VALID_PAYLOAD)
    await client.post("/webhooks/themes", json=updated)
    response = await client.get("/trends/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Updated Name"


# --- AC3: Missing constituent article ID rejected ---


async def test_missing_article_id_returns_422(client):
    bad_payload = {**VALID_PAYLOAD, "constituent_article_ids": ["nonexistent-id-xyz"]}
    response = await client.post("/webhooks/themes", json=bad_payload)
    assert response.status_code == 422


async def test_missing_article_id_response_names_the_id(client):
    bad_id = "nonexistent-id-xyz"
    bad_payload = {**VALID_PAYLOAD, "constituent_article_ids": [bad_id]}
    response = await client.post("/webhooks/themes", json=bad_payload)
    assert response.status_code == 422
    assert bad_id in response.json()["detail"]


# --- AC4: Invalid overall_sentiment rejected ---


async def test_invalid_sentiment_returns_422(client):
    bad_payload = {**VALID_PAYLOAD, "overall_sentiment": "mixed"}
    response = await client.post("/webhooks/themes", json=bad_payload)
    assert response.status_code == 422


# --- AC5: Timezone-naive datetimes rejected ---


async def test_naive_last_article_at_returns_422(client):
    bad_payload = {**VALID_PAYLOAD, "last_article_at": "2026-06-26T07:00:00"}
    response = await client.post("/webhooks/themes", json=bad_payload)
    assert response.status_code == 422


async def test_naive_created_at_returns_422(client):
    bad_payload = {**VALID_PAYLOAD, "created_at": "2026-06-26T07:00:00"}
    response = await client.post("/webhooks/themes", json=bad_payload)
    assert response.status_code == 422


# --- AC7: Integration — POST then GET /trends/ includes theme ---


async def test_integration_post_then_get_trends_includes_theme(client):
    await client.post("/webhooks/themes", json=VALID_PAYLOAD)
    response = await client.get("/trends/")
    assert response.status_code == 200
    theme_ids = [t["theme_id"] for t in response.json()]
    assert "theme-webhook-001" in theme_ids
