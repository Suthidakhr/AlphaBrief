from typing import Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict


class StockImpact(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    symbol: str
    direction: Literal["positive", "negative", "neutral"]
    reason: str | None = None


class AIAnalysis(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    summary: str
    affected_sectors: list[str]
    affected_stocks: list[str]
    sentiment: Literal["bullish", "bearish", "neutral"]
    analysis_at: AwareDatetime


class NewsItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    headline: str
    summary: str
    source_url: str
    content: str
    category: Literal["ดอกเบี้ยโลก", "พลังงาน", "หุ้นไทย", "เทคโนโลยี", "ตลาดโลก"]
    published_at: AwareDatetime
    source: str
    ai_analysis: AIAnalysis | None = None
    stock_impacts: list[StockImpact]
    featured: bool = False


class MarketIndex(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    symbol: str
    price: float
    change: float
    change_pct: float
    market: str


class SectorPerformance(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    change_pct: float
    level: str


class TrendItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rank: int
    title: str
    description: str
    sentiment: str


class AISummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: str
    overview: str
    key_points: list[str]
    watch_sectors: list[str]
    avoid_sectors: list[str]
    set_range_low: float
    set_range_high: float


class MarketOverview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    indices: list[MarketIndex]
    sectors: list[SectorPerformance]
    trends: list[TrendItem]
    ai_summary: AISummary
    last_updated: str
    news_count: int
