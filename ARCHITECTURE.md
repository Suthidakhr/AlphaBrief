# AlphaBrief — Technical Architecture

> AI Financial Research Assistant | หลักการทำงานและการเชื่อมต่อระบบ

---

## Overview

```
User (Browser / Mobile)
        │
        ▼
┌─────────────────────────────┐
│  Frontend  · Next.js 15     │  localhost:3000
│  TypeScript · Tailwind CSS  │
└────────────┬────────────────┘
             │ HTTP fetch (ISR 60s)
             ▼
┌─────────────────────────────┐
│  Backend  · FastAPI         │  localhost:8000
│  Python 3.13 · Pydantic     │
└────────────┬────────────────┘
             │ POST / GET
             ▼
┌─────────────────────────────┐
│  n8n Automation             │  stdkn.app.n8n.cloud
│  Workflows · AI · Alerts    │
└─────────────────────────────┘
```

---

## Layer 1 — Frontend

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS

### โครงสร้าง

```
frontend/
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout + N8nChat widget
    │   ├── page.tsx            # / — Market Overview
    │   ├── news/page.tsx       # /news — Financial News
    │   ├── stocks/page.tsx     # /stocks — Stock Analysis
    │   └── trends/page.tsx     # /trends — Market Trends
    ├── components/
    │   ├── Navbar.tsx          # Sticky nav + realtime clock
    │   ├── TickerBar.tsx       # Scrolling price ticker
    │   ├── NewsFeed.tsx        # Client-side filter tabs
    │   ├── NewsCard.tsx        # Individual news card + AI analysis
    │   ├── AISummaryCard.tsx   # AI daily brief widget
    │   ├── MarketOverviewWidget.tsx  # Index prices
    │   ├── SectorHeatmap.tsx   # Sector performance grid
    │   ├── TrendSummary.tsx    # Weekly themes
    │   └── N8nChat.tsx         # n8n chat widget (CDN inject)
    ├── lib/
    │   └── api.ts              # Centralized HTTP client
    └── types/
        └── index.ts            # Shared TypeScript interfaces
```

### Data Fetching

ทุก page ใช้ **Server Components** ดึงข้อมูลตอน render และ cache ด้วย ISR

```ts
// lib/api.ts
async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 60 },   // cache 60 วินาที
  });
  return res.json();
}
```

| Page | API ที่เรียก |
|------|-------------|
| `/` | `getNews()` + `getMarketOverview()` + `getTicker()` |
| `/news` | `getNews()` + `getTicker()` |
| `/stocks` | `getMarketOverview()` + `getTicker()` |
| `/trends` | `getMarketOverview()` + `getTicker()` |

### n8n Chat Widget

```tsx
// components/N8nChat.tsx — inject ผ่าน useEffect
const script = document.createElement("script");
script.type = "module";
script.innerHTML = `
  import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
  createChat({ webhookUrl: 'https://stdkn.app.n8n.cloud/webhook/596bf97f-...' });
`;
document.body.appendChild(script);
```

### Color Palette

| Token | Hex | ใช้ใน |
|-------|-----|-------|
| Espresso | `#4A342A` | Navbar, dark backgrounds, footer |
| Cocoa | `#7D5A44` | Section headers, icon backgrounds |
| Camel | `#B2967D` | Accents, labels, muted text |
| Khaki | `#D7C9B8` | Borders, light accents |
| Linen | `#F5F1EA` | Page background, card headers |

---

## Layer 2 — Backend

**Stack:** FastAPI · Python 3.13 · Pydantic v2 · Uvicorn

### โครงสร้าง

```
backend/
├── app/
│   ├── main.py                 # FastAPI app + CORS middleware
│   ├── routers/
│   │   ├── news.py             # /news endpoints
│   │   ├── market.py           # /market endpoints
│   │   └── trends.py           # /trends endpoints
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   └── services/
│       └── mock_data.py        # Mock data (→ แทนด้วย DB)
└── requirements.txt
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/news/` | รายการข่าวทั้งหมด |
| GET | `/news/?category=พลังงาน` | กรองตามหมวด |
| GET | `/news/{id}` | ข่าวเดี่ยว |
| GET | `/news/categories` | หมวดหมู่ทั้งหมด |
| GET | `/market/overview` | ภาพรวมตลาด + AI summary |
| GET | `/market/ticker` | ราคาหุ้น ticker |
| GET | `/market/indices` | ดัชนีตลาด |
| GET | `/market/sectors` | Sector performance |
| GET | `/trends/` | แนวโน้มสัปดาห์ |
| GET | `/trends/summary` | AI summary รายวัน |

Swagger UI อัตโนมัติที่ → `http://localhost:8000/docs`

### Pydantic Models

```python
class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    category: str
    published_at: str
    source: str
    ai_analysis: str
    stock_impacts: list[StockImpact]
    featured: bool

class MarketOverview(BaseModel):
    indices: list[MarketIndex]
    sectors: list[SectorPerformance]
    trends: list[TrendItem]
    ai_summary: AISummary
    last_updated: str
    news_count: int
```

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Layer 3 — n8n Automation

**Host:** `stdkn.app.n8n.cloud`

### Workflows (วางแผนไว้)

#### WF1 — News Pipeline *(แนะนำให้ทำก่อน)*

```
[Schedule: ทุก 15 นาที]
    → [HTTP: ดึง RSS จาก SET, Bloomberg, Reuters]
    → [Code: parse + clean ข่าว]
    → [Filter: คัดกรองหมวดการเงิน]
    → [Claude AI: วิเคราะห์ + ระบุหุ้นที่ได้รับผล]
    → [HTTP POST: /news API → บันทึก DB]
```

#### WF2 — Morning Digest

```
[Schedule: 07:00 ทุกวันทำการ]
    → [HTTP GET: /news?limit=10]
    → [Claude AI: สรุปภาพรวม + sentiment]
    → [Split: แจกไปหลาย channel]
        ├→ [LINE Notify: push ข่าวเช้า]
        ├→ [Email: ส่ง subscriber]
        └→ [Telegram: bot channel]
```

#### WF3 — Stock Price Alert

```
[Schedule: ทุก 5 นาที (ตลาดเปิด 10:00-16:30)]
    → [HTTP: ดึงราคาจาก SET API]
    → [IF: price change > threshold %]
        → [LINE Push: แจ้งเตือนทันที]
```

#### WF4 — Weekly Report

```
[Schedule: ศุกร์ 17:30]
    → [HTTP GET: รวบรวมข่าว + ราคา 5 วัน]
    → [Claude AI: สรุปภาพรวมสัปดาห์]
    → [Email: ส่ง PDF report]
```

### Chat Webhook (เชื่อมแล้ว ✓)

```
Webhook URL: https://stdkn.app.n8n.cloud/webhook/596bf97f-155d-4b22-a964-669953f19238/chat

Flow:
User พิมพ์ใน Chat Widget
    → n8n รับ via Webhook
    → Claude AI Agent ประมวลผล
    → ส่ง response กลับ Chat
```

---

## Data Flow สรุป

```
1. User เปิด browser
   └→ Next.js Server Component render
       └→ fetch() → FastAPI (port 8000)
           └→ JSON response → render เป็น component
               └→ cache 60 วินาที (ISR)

2. n8n WF1 (ทุก 15 นาที)
   └→ ดึงข่าว RSS
       └→ Claude AI วิเคราะห์
           └→ POST /news → FastAPI
               └→ บันทึกลง Database
                   └→ Frontend อ่านข้อมูลใหม่ใน refresh รอบถัดไป

3. User พิมพ์ใน Chat Widget
   └→ n8n Webhook รับข้อความ
       └→ Claude AI ตอบ
           └→ แสดงผลใน Chat bubble
```

---

## วิธีรัน

### Backend

```bash
cd backend
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## สิ่งที่ต้องทำต่อ

| Priority | งาน | รายละเอียด |
|----------|-----|------------|
| 🔴 High | เพิ่ม Database | PostgreSQL หรือ Neon — แทน mock_data.py |
| 🔴 High | สร้าง n8n WF1 | ให้ข้อมูลเป็น real news จริงๆ |
| 🟡 Medium | สร้าง n8n WF2 | Morning digest LINE/Email |
| 🟡 Medium | POST endpoint | Backend รับข้อมูลจาก n8n เขียนลง DB |
| 🟢 Low | n8n WF3 | Stock alert realtime |
| 🟢 Low | Authentication | Login / user portfolio |
| 🟢 Low | Deploy | Vercel (frontend) + Railway (backend) |
