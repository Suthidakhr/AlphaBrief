from fastapi import APIRouter, Query
from app.models.schemas import NewsItem
from app.services.mock_data import NEWS_DATA

router = APIRouter(prefix="/news", tags=["news"])

CATEGORIES = {item["category"] for item in NEWS_DATA}


@router.get("/", response_model=list[NewsItem])
async def get_news(
    category: str | None = Query(None, description="Filter by category"),
    limit: int = Query(20, le=50),
):
    data = NEWS_DATA
    if category:
        data = [n for n in data if n["category"] == category]
    return data[:limit]


@router.get("/categories")
async def get_categories():
    return {"categories": sorted(CATEGORIES)}


@router.get("/{news_id}", response_model=NewsItem)
async def get_news_by_id(news_id: str):
    for item in NEWS_DATA:
        if item["id"] == news_id:
            return item
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="News not found")
