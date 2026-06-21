import re

import pytest


async def test_get_news_returns_200(client):
    response = await client.get("/news/")
    assert response.status_code == 200


async def test_get_news_returns_list(client):
    response = await client.get("/news/")
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) > 0


async def test_get_news_items_have_required_fields(client):
    response = await client.get("/news/")
    items = response.json()["items"]
    required_fields = {"id", "headline", "summary", "source_url", "content", "category", "published_at", "source", "ai_analysis", "stock_impacts"}
    for item in items:
        assert required_fields.issubset(item.keys()), f"Missing fields in item: {item.get('id')}"


async def test_get_news_no_null_non_nullable_fields(client):
    response = await client.get("/news/")
    items = response.json()["items"]
    non_nullable = ["id", "headline", "summary", "source_url", "content", "category", "published_at", "source"]
    for item in items:
        for field in non_nullable:
            assert item[field] is not None, f"Null value for {field} in item {item.get('id')}"


async def test_get_news_filter_by_category(client):
    response = await client.get("/news/?category=พลังงาน")
    assert response.status_code == 200
    items = response.json()["items"]
    for item in items:
        assert item["category"] == "พลังงาน"


# --- Story 2.2: new tests ---

async def test_get_news_response_has_last_updated(client):
    response = await client.get("/news/")
    data = response.json()
    assert "last_updated" in data
    assert re.search(r"([+-]\d{2}:\d{2}|Z)$", data["last_updated"]), (
        f"last_updated not timezone-aware: {data['last_updated']}"
    )


async def test_get_news_invalid_category_returns_422(client):
    response = await client.get("/news/?category=INVALID")
    assert response.status_code == 422


async def test_get_news_sorted_by_published_at_desc(client):
    response = await client.get("/news/")
    items = response.json()["items"]
    if len(items) > 1:
        timestamps = [item["published_at"] for item in items]
        assert timestamps == sorted(timestamps, reverse=True)


async def test_get_news_ai_analysis_sentiment_valid_values(client):
    response = await client.get("/news/")
    items = response.json()["items"]
    valid = {"bullish", "bearish", "neutral"}
    for item in items:
        if item["ai_analysis"] is not None:
            assert item["ai_analysis"]["sentiment"] in valid, (
                f"Invalid sentiment in item {item['id']}: {item['ai_analysis']['sentiment']}"
            )


async def test_get_news_by_id_required_fields_non_null(client):
    response = await client.get("/news/news-001")
    assert response.status_code == 200
    data = response.json()
    for field in ("source", "source_url", "headline", "published_at"):
        assert data[field] is not None and data[field] != "", (
            f"Field {field} is null or empty"
        )


async def test_get_news_items_published_at_timezone_aware(client):
    response = await client.get("/news/")
    items = response.json()["items"]
    tz_pattern = re.compile(r"([+-]\d{2}:\d{2}|Z)$")
    for item in items:
        assert tz_pattern.search(item["published_at"]), (
            f"published_at not timezone-aware in item {item['id']}: {item['published_at']}"
        )
        if item["ai_analysis"] is not None:
            assert tz_pattern.search(item["ai_analysis"]["analysis_at"]), (
                f"analysis_at not timezone-aware in item {item['id']}"
            )


async def test_get_news_by_id_ai_analysis_fully_populated_or_null(client):
    response = await client.get("/news/news-001")
    data = response.json()
    ai = data["ai_analysis"]
    if ai is not None:
        for field in ("summary", "affected_sectors", "affected_stocks", "sentiment", "analysis_at"):
            assert field in ai and ai[field] is not None, (
                f"ai_analysis.{field} is missing or null"
            )


async def test_get_news_by_id_returns_200(client):
    response = await client.get("/news/news-001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "news-001"


async def test_get_news_by_id_not_found_returns_404(client):
    response = await client.get("/news/nonexistent-id")
    assert response.status_code == 404


async def test_get_categories_returns_200(client):
    response = await client.get("/news/categories")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert isinstance(data["categories"], list)
