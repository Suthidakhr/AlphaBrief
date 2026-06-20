from fastapi import APIRouter
from app.models.schemas import TrendItem, AISummary
from app.services.mock_data import TRENDS, AI_SUMMARY

router = APIRouter(prefix="/trends", tags=["trends"])


@router.get("/", response_model=list[TrendItem])
async def get_trends():
    return TRENDS


@router.get("/summary", response_model=AISummary)
async def get_ai_summary():
    return AI_SUMMARY
