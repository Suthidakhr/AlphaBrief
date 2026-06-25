from datetime import date, datetime, timedelta, timezone

import pytest

from app.services.daily_brief_store import daily_brief_store

BKK_TZ = timezone(timedelta(hours=7))

VALID_PAYLOAD = {
    "overall_sentiment": "bullish",
    "key_developments": ["SET rose 0.8%", "SCB gains", "Oil steady"],
    "opportunities": ["Banking sector"],
    "risks": ["Global rate uncertainty"],
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "brief_date": date.today().isoformat(),
}


@pytest.fixture(autouse=True)
async def reset_store():
    daily_brief_store.reset()
    yield
    daily_brief_store.reset()


# --- AC1: Valid payload creates a new brief ---

async def test_ingest_valid_payload_returns_200(client):
    response = await client.post("/webhooks/daily-brief", json=VALID_PAYLOAD)
    assert response.status_code == 200


async def test_ingest_valid_payload_returns_created_status(client):
    response = await client.post("/webhooks/daily-brief", json=VALID_PAYLOAD)
    data = response.json()
    assert data["status"] == "created"


# --- AC2: Second call for same brief_date returns updated (upsert) ---

async def test_ingest_same_date_twice_returns_updated(client):
    first = await client.post("/webhooks/daily-brief", json=VALID_PAYLOAD)
    second = await client.post("/webhooks/daily-brief", json=VALID_PAYLOAD)
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["status"] == "created"
    assert second.json()["status"] == "updated"


async def test_ingest_idempotent_only_one_record_per_date(client):
    updated_payload = {**VALID_PAYLOAD, "overall_sentiment": "bearish"}
    await client.post("/webhooks/daily-brief", json=VALID_PAYLOAD)
    await client.post("/webhooks/daily-brief", json=updated_payload)
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    assert response.json()["overall_sentiment"] == "bearish"


# --- AC1 + AC6: Integration — POST then GET ---

async def test_ingest_creates_readable_brief_via_get(client):
    today = date.today().isoformat()
    payload = {**VALID_PAYLOAD, "brief_date": today}
    await client.post("/webhooks/daily-brief", json=payload)
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    data = response.json()
    assert data["is_fallback"] is False
    assert data["overall_sentiment"] == "bullish"


async def test_fallback_before_ingest_then_today_after_ingest(client):
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    today = date.today().isoformat()
    yesterday_payload = {**VALID_PAYLOAD, "brief_date": yesterday, "overall_sentiment": "bearish"}
    await client.post("/webhooks/daily-brief", json=yesterday_payload)
    before = await client.get("/daily-brief/")
    assert before.status_code == 200
    assert before.json()["is_fallback"] is True
    today_payload = {**VALID_PAYLOAD, "brief_date": today, "overall_sentiment": "bullish"}
    await client.post("/webhooks/daily-brief", json=today_payload)
    after = await client.get("/daily-brief/")
    assert after.status_code == 200
    assert after.json()["is_fallback"] is False
    assert after.json()["overall_sentiment"] == "bullish"


# --- AC3: Invalid overall_sentiment rejected ---

async def test_invalid_sentiment_returns_422(client):
    bad_payload = {**VALID_PAYLOAD, "overall_sentiment": "mixed"}
    response = await client.post("/webhooks/daily-brief", json=bad_payload)
    assert response.status_code == 422


async def test_missing_required_field_returns_422(client):
    bad_payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "brief_date"}
    response = await client.post("/webhooks/daily-brief", json=bad_payload)
    assert response.status_code == 422


# --- AC4: Timezone-naive generated_at rejected ---

async def test_naive_datetime_returns_422(client):
    bad_payload = {**VALID_PAYLOAD, "generated_at": "2026-06-22T07:05:00"}
    response = await client.post("/webhooks/daily-brief", json=bad_payload)
    assert response.status_code == 422
