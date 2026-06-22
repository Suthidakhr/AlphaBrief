from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import news, market, trends, webhooks

app = FastAPI(
    title="ASK API",
    description="ASK (Aware Signals & Knowledge) — From news to understanding. AI financial research companion for Thai retail investors.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news.router)
app.include_router(market.router)
app.include_router(trends.router)
app.include_router(webhooks.router)


@app.get("/")
async def root():
    return {"service": "ASK API", "version": "1.0.0", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
