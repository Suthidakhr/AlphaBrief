from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

from app.models.schemas import DailyBrief
from app.services.daily_brief_store import daily_brief_store

BKK_TZ = timezone(timedelta(hours=7))

router = APIRouter(prefix="/daily-brief", tags=["daily-brief"])


@router.get("/", response_model=DailyBrief)
async def get_daily_brief() -> DailyBrief:
    today = datetime.now(BKK_TZ).date()
    yesterday = today - timedelta(days=1)

    brief = daily_brief_store.get_for_date(today)
    if brief is not None:
        return DailyBrief(**{**brief, "is_fallback": False})

    brief = daily_brief_store.get_for_date(yesterday)
    if brief is not None:
        return DailyBrief(**{**brief, "is_fallback": True})

    raise HTTPException(status_code=404, detail="No daily brief available")
