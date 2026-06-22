import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import NewsCategory, NewsItem, NewsListResponse
from app.services.mock_data import NEWS_DATA
from app.services.news_store import news_store

router = APIRouter(prefix="/news", tags=["news"])

CATEGORIES = {item["category"] for item in NEWS_DATA}
try:
    NEWS_RETENTION_DAYS = max(1, int(os.getenv("NEWS_RETENTION_DAYS", "7")))
except ValueError:
    NEWS_RETENTION_DAYS = 7


@router.get("/", response_model=NewsListResponse)
async def get_news(
    category: NewsCategory | None = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=50),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=NEWS_RETENTION_DAYS)
    data = [n for n in news_store.get_all() if n["published_at"] >= cutoff]

    if category:
        data = [n for n in data if n["category"] == category]

    data = sorted(data, key=lambda n: n["published_at"], reverse=True)
    data = data[:limit]

    last_updated = data[0]["published_at"] if data else None
    return NewsListResponse(items=data, last_updated=last_updated)


@router.get("/categories")
async def get_categories():
    return {"categories": sorted(CATEGORIES)}


@router.get("/{news_id}", response_model=NewsItem)
async def get_news_by_id(news_id: str):
    item = news_store.get_by_id(news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="News not found")
    return item
