from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import MarketOverview, MarketIndex, SectorPerformance, TrendItem, AISummary
from app.services.mock_data import MARKET_INDICES, SECTORS, TRENDS, AI_SUMMARY, TICKER_DATA, NEWS_DATA

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/overview", response_model=MarketOverview)
async def get_market_overview():
    return {
        "indices": MARKET_INDICES,
        "sectors": SECTORS,
        "trends": TRENDS,
        "ai_summary": AI_SUMMARY,
        "last_updated": datetime.now().strftime("%H:%M"),
        "news_count": len(NEWS_DATA),
    }


@router.get("/ticker")
async def get_ticker():
    return {"ticker": TICKER_DATA}


@router.get("/indices", response_model=list[MarketIndex])
async def get_indices():
    return MARKET_INDICES


@router.get("/sectors", response_model=list[SectorPerformance])
async def get_sectors():
    return SECTORS
