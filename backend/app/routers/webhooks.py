from fastapi import APIRouter
from app.models.schemas import NewsIngestPayload, WebhookIngestResponse
from app.services.news_store import news_store

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/news-ingest", response_model=WebhookIngestResponse)
async def ingest_news(payload: NewsIngestPayload) -> WebhookIngestResponse:
    payload_dict = payload.model_dump()
    event_id, status = news_store.ingest(payload_dict)
    return WebhookIngestResponse(event_id=event_id, status=status)
