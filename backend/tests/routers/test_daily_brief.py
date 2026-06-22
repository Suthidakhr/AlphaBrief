import re
from datetime import date, datetime, timedelta, timezone

import pytest

from app.services.daily_brief_store import daily_brief_store

BKK_TZ = timezone(timedelta(hours=7))


def _today() -> date:
    return datetime.now(BKK_TZ).date()


def _yesterday() -> date:
    return _today() - timedelta(days=1)


SAMPLE_BRIEF = {
    "overall_sentiment": "bullish",
    "key_developments": ["SET rose 1%", "SCB gains", "Oil steady"],
    "opportunities": ["Banking sector"],
    "risks": ["Global rate uncertainty"],
    "generated_at": datetime(2026, 6, 22, 0, 0, 0, tzinfo=timezone.utc),
}


@pytest.fixture(autouse=True)
async def reset_store():
    yield
    daily_brief_store.reset()


async def test_get_daily_brief_returns_404_when_no_brief_exists(client):
    response = await client.get("/daily-brief/")
    assert response.status_code == 404


async def test_get_daily_brief_returns_today_with_is_fallback_false(client):
    daily_brief_store.upsert({**SAMPLE_BRIEF, "brief_date": _today()})
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    data = response.json()
    assert data["is_fallback"] is False


async def test_get_daily_brief_returns_yesterday_with_is_fallback_true(client):
    daily_brief_store.upsert({**SAMPLE_BRIEF, "brief_date": _yesterday()})
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    data = response.json()
    assert data["is_fallback"] is True


async def test_get_daily_brief_prefers_today_over_yesterday(client):
    daily_brief_store.upsert({**SAMPLE_BRIEF, "brief_date": _yesterday(), "overall_sentiment": "bearish"})
    daily_brief_store.upsert({**SAMPLE_BRIEF, "brief_date": _today(), "overall_sentiment": "bullish"})
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    data = response.json()
    assert data["is_fallback"] is False
    assert data["overall_sentiment"] == "bullish"


async def test_get_daily_brief_sentiment_is_valid_enum(client):
    daily_brief_store.upsert({**SAMPLE_BRIEF, "brief_date": _today()})
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    assert response.json()["overall_sentiment"] in ("bullish", "bearish", "neutral")


async def test_get_daily_brief_generated_at_is_timezone_aware(client):
    daily_brief_store.upsert({**SAMPLE_BRIEF, "brief_date": _today()})
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    generated_at = response.json()["generated_at"]
    assert re.search(r"([+-]\d{2}:\d{2}|Z)$", generated_at), (
        f"generated_at not timezone-aware: {generated_at}"
    )


async def test_get_daily_brief_all_required_fields_present(client):
    daily_brief_store.upsert({**SAMPLE_BRIEF, "brief_date": _today()})
    response = await client.get("/daily-brief/")
    assert response.status_code == 200
    data = response.json()
    required = {"overall_sentiment", "key_developments", "opportunities", "risks",
                "generated_at", "brief_date", "is_fallback"}
    assert required.issubset(data.keys()), f"Missing fields: {required - data.keys()}"
