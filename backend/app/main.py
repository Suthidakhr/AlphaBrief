from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import news, market, trends

app = FastAPI(
    title="AlphaBrief API",
    description="AI Financial Research Assistant — News, Market Data & Trend Analysis",
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


@app.get("/")
async def root():
    return {"service": "AlphaBrief API", "version": "1.0.0", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
