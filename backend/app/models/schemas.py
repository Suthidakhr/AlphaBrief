from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StockImpact(BaseModel):
    symbol: str
    direction: str  # "positive" | "negative" | "neutral"
    reason: Optional[str] = None


class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    category: str
    published_at: str
    source: str
    ai_analysis: str
    stock_impacts: list[StockImpact]
    featured: bool = False


class MarketIndex(BaseModel):
    name: str
    symbol: str
    price: float
    change: float
    change_pct: float
    market: str


class SectorPerformance(BaseModel):
    name: str
    change_pct: float
    level: str  # strong_up | up | flat | down | strong_down


class TrendItem(BaseModel):
    rank: int
    title: str
    description: str
    sentiment: str  # bullish | bearish | neutral


class AISummary(BaseModel):
    date: str
    overview: str
    key_points: list[str]
    watch_sectors: list[str]
    avoid_sectors: list[str]
    set_range_low: float
    set_range_high: float


class MarketOverview(BaseModel):
    indices: list[MarketIndex]
    sectors: list[SectorPerformance]
    trends: list[TrendItem]
    ai_summary: AISummary
    last_updated: str
    news_count: int
