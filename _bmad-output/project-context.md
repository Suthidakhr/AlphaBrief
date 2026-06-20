---
project_name: 'ASK (Aware Signals & Knowledge)'
user_name: 'Suthidakhrueanak'
date: '2026-06-20'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 91
optimized_for_llm: true
last_updated: '2026-06-20'
---

# Project Context for AI Agents

_Critical rules and patterns AI agents must follow when implementing code in this project. Optimized for LLM context — every line here changes what code you write._

---

## Technology Stack

### Frontend (`frontend/`)
- Runtime: Node 20+, package manager: **npm**
- Next.js **15.1.0** — App Router ONLY (never Pages Router; no `getServerSideProps`, no `pages/` directory)
- React **19.0.0**
- TypeScript **^5**, strict mode enforced (`tsconfig.json` — `"strict": true`)
- Tailwind CSS **^3.4.17** — v3, NOT v4 (config via `tailwind.config.ts` with `content` array; v4 syntax will break build)
- `clsx` for conditional classnames — named import only: `import { clsx } from 'clsx'`
- Path alias: `@/*` → `./src/*` (defined in `tsconfig.json`)

### Backend (`backend/`)
- Runtime: Python **3.13**, dependencies: `pip` + `requirements.txt`
- FastAPI **0.115.0**
- Pydantic **v2.9.2** — NOT v1 (v1 syntax causes runtime errors; see Critical Rules below)
- `httpx` for all outbound HTTP calls — not `requests`

### Integrations
- n8n Cloud (`stdkn.app.n8n.cloud`) — webhook-only, no SDK; all interaction via HTTP POST to webhook URLs
- Backend API base URL: `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:8000`)

---

## Critical Implementation Rules

### Language-Specific Rules

#### TypeScript (Frontend)
- All pages are **Server Components by default** — never add `useState`/`useEffect` to a page without first adding `"use client"` as the **first line** (before all imports)
- `params` and `searchParams` in Next.js 15 page components are **Promises** — always `await` them:
  ```ts
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
- `cookies()` and `headers()` from `next/headers` are **async** in Next.js 15 — always `await`
- **No `forwardRef`** — React 19 passes `ref` as a regular prop; accept it directly in the component signature
- Revalidation is owned by `lib/api.ts` via `next: { revalidate: 60 }` on each `fetch()` call — do NOT also add `export const revalidate = 60` to page files; mixing causes unpredictable cache behavior
- Path alias `@/` maps to `src/` — use it for all internal imports; never use relative `../` chains across more than one level
- Null handling: use `value ?? fallback` not `value || fallback`; avoid `!` non-null assertion unless value is structurally guaranteed

#### Python (Backend)
- Use `X | None` syntax — never `Optional[X]` from `typing`
- Use `list[X]` / `dict[str, X]` — never `List[X]` / `Dict[str, X]` from `typing`
- All FastAPI endpoint functions must be `async def`
- `httpx.AsyncClient` must be managed via FastAPI lifespan — never instantiate globally:
  ```python
  @asynccontextmanager
  async def lifespan(app: FastAPI):
      async with httpx.AsyncClient() as client:
          app.state.http_client = client
          yield
  ```
- Use `asyncio.get_running_loop()` — never `asyncio.get_event_loop()` (deprecated in Python 3.13)

### Framework-Specific Rules

#### Next.js 15 App Router
- **File conventions**: pages → `app/**/page.tsx`, layouts → `app/**/layout.tsx`, loading states → `loading.tsx`, error boundaries → `error.tsx`
- **Client Components**: only when needed (event handlers, browser APIs, hooks). Mark with `"use client"` as line 1. Keep them as leaf nodes — never wrap a Server Component inside a Client Component
- **Data fetching**: always go through `src/lib/api.ts` — never call `fetch()` directly in a component. Add new API methods to the `api` object in that file
- **ISR**: cache duration is 60s globally via `next: { revalidate: 60 }` in `fetchAPI`. To opt a route out of caching, add `export const dynamic = 'force-dynamic'` to the page file — do not override the fetch-level revalidate

#### React 19
- Prefer Server Components for data display; Client Components only for interactivity
- Use `use()` hook to read a Promise or Context in a Client Component — not `useEffect + useState + fetch`
- No `React.FC` type annotation — type props directly: `function MyComponent({ prop }: Props) {}`

#### FastAPI (Backend)
- All routers live in `backend/app/routers/` and are registered in `main.py`
- Router pattern: `router = APIRouter(prefix="/path", tags=["tag"])`
- Always declare `response_model=` on GET endpoints
- All Pydantic models live in `backend/app/models/schemas.py` — do not define inline models in router files
- Business logic lives in `backend/app/services/` — routers handle only HTTP concerns (parsing, response codes)
- CORS: only `http://localhost:3000` is whitelisted in `main.py` — adding new origins requires updating `allow_origins` there

#### Pydantic v2
- `@field_validator('field_name')` + `@classmethod` — not `@validator`
- `model_config = ConfigDict(...)` — not inner `class Config`
- Serialize with `.model_dump()` — not `.dict()`
- Use `ConfigDict(from_attributes=True)` to support ORM objects when DB is added

### Testing Rules

#### Setup
- **Frontend**: Vitest + `@vitejs/plugin-react` + React Testing Library (not Jest)
  - Must add path alias to `vitest.config.ts`: `'@': path.resolve(__dirname, './src')` — tsconfig aliases do NOT auto-apply to Vitest
  - Coverage via `@vitest/coverage-v8` (not istanbul); floor: `lines: 80`
- **Backend**: pytest + `httpx.AsyncClient` + `pytest-asyncio`
  - Declare `asyncio_mode = "auto"` in `pyproject.toml` — without this, async tests require inconsistent `@pytest.mark.asyncio` decoration
  - Exact client pattern (agents get `ASGITransport` wrong):
    ```python
    # tests/conftest.py
    from httpx import AsyncClient, ASGITransport
    client = AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
    ```
  - Override FastAPI dependencies via `app.dependency_overrides[dep_fn] = override_fn`

#### Test Location
- Frontend: co-locate test files — `Component.test.tsx` next to `Component.tsx`
- Backend: `tests/` mirrors `app/` structure:
  - `app/routers/news.py` → `tests/routers/test_news.py`
  - `app/services/mock_data.py` → `tests/services/test_mock_data.py`
  - `app/models/schemas.py` → `tests/models/test_schemas.py`

#### Effort Split
- 40% unit — backend service pure functions; frontend utility functions and hooks with real logic
- 50% integration — full FastAPI request/response cycle asserting on *shape* (not mock values); frontend component behavior under edge-case data shapes (empty lists, null fields)
- 10% E2E — Playwright only for critical happy path (app loads, dashboard renders, no console errors); do not invest in E2E until UI is stable

#### Mocking Rules
- **Frontend**: mock at the module boundary closest to the component — `vi.mock('@/lib/api')` for components; mock raw `fetch` only when testing `lib/api.ts` itself
- **Backend**: use real Pydantic model instances with fixture data — never mock Pydantic models
- **Never mock financial data** in integration tests — use fixtures with real structure and explicit timestamps
- Do NOT test database interactions until PostgreSQL is added; when it is, use a real test DB (not mocks)
- Do NOT test n8n workflow internals — test only that the backend correctly receives n8n webhooks

#### What NOT to Test (agents will over-test without this)
- Next.js routing and middleware behavior → use Playwright, not Vitest
- Pydantic model validation inside route tests → test models directly in `tests/models/`
- FastAPI's own 422 validation → one smoke test per router is sufficient; don't test the framework
- Third-party library internals (React JSX rendering, FastAPI routing)
- CSS or visual layout — no snapshot tests
- Mock data magic values (`assert data["price"] == 1250.00` is meaningless)

#### Financial Data Rules
- Every data display must have a freshness contract — if data is older than 60 seconds (the ISR window), the UI must indicate staleness; tests must assert this
- Test priority order: **data correctness → notification accuracy → pipeline health → UI rendering**
- Write the failure-mode test before the happy-path test for any feature touching financial figures

### Code Quality & Style Rules

#### Naming Conventions
- **Components**: PascalCase filenames and exports — `NewsCard.tsx`, `export default function NewsCard`
- **Hooks**: `use` prefix — `useMarketData`, `useTickerScroll`
- **Types/Interfaces**: PascalCase, no `I` prefix — `NewsItem`, `StockImpact` (not `INewsItem`)
- **API functions**: camelCase verbs — `getNews`, `getMarketOverview`, `getTicker`
- **Python files/functions**: snake_case — `mock_data.py`, `get_news_by_id`
- **Python classes**: PascalCase — `NewsItem`, `MarketOverview`

#### Styling (Frontend)
- **Tailwind-only** for layout and spacing — no CSS modules, no styled-components
- Inline `style={{}}` is acceptable ONLY for the brand color palette where a Tailwind utility class does not exist. Prefer Tailwind token names in `className` (`bg-linen`, `text-espresso`) and fall back to `style={{ color: "#4A342A" }}` only when needed
- Use `{ clsx }` (named import) for all conditional class logic — no template literal class concatenation
- Responsive: mobile-first; `lg:` is the primary desktop breakpoint used throughout the codebase

#### File Organization
- New components → `frontend/src/components/`
- New pages → `frontend/src/app/<route>/page.tsx`
- Shared TypeScript types → `frontend/src/types/index.ts`
- New API calls → add to `api` object in `frontend/src/lib/api.ts`
- New FastAPI endpoints → `backend/app/routers/<domain>.py` + register in `main.py`
- New Pydantic schemas → `backend/app/models/schemas.py`
- New data/business logic → `backend/app/services/`
- Do not create new top-level directories without discussion

#### Comments
- Write no comments by default
- Only add a comment when the WHY is non-obvious: a hidden constraint, a workaround, or behavior that would surprise a reader
- Never explain WHAT the code does — well-named identifiers do that

### Development Workflow Rules

#### Running the Project
- **Backend**: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000`
- **Frontend**: `cd frontend && npm run dev` → http://localhost:3000
- Backend must be running before frontend dev server for API calls to resolve
- Swagger UI available at http://localhost:8000/docs during development

#### Git Conventions
- Commit message format: `type: description` (conventional commits)
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
  - Examples: `feat: add sector heatmap component`, `fix: null handling in ticker bar`
- Branch naming: `feat/<feature>`, `fix/<issue>`, `chore/<task>`

#### Adding New Features (order matters)
1. Add Pydantic schema to `backend/app/models/schemas.py` first
2. Add FastAPI route to appropriate router in `backend/app/routers/`
3. Add TypeScript type to `frontend/src/types/index.ts` — must mirror the Pydantic schema exactly
4. Add API call to `frontend/src/lib/api.ts`
5. Build the component/page last

#### Environment Variables
- `NEXT_PUBLIC_API_URL` — backend base URL (default: `http://localhost:8000`)
- All frontend env vars exposed to the browser must be prefixed `NEXT_PUBLIC_`
- Backend secrets go in `backend/.env` loaded via `python-dotenv` — never hardcode credentials
- Never commit `.env` files

### Critical Don't-Miss Rules

#### Schema Sync — The #1 Source of Silent Bugs
- TypeScript types in `frontend/src/types/index.ts` and Pydantic models in `backend/app/models/schemas.py` are manually kept in sync — no code generation. When changing one, always change the other
- Field names use `snake_case` on **both** sides — never camelCase TypeScript field names to match JS convention
- **No `alias=` on any Pydantic field** — ever. `Field(alias="changePct")` causes FastAPI to switch JSON keys to camelCase and silently breaks the TS sync
- Optional Pydantic fields serialize as `null`, not `undefined`. TypeScript types must be `T | null`, not `T?` — optional chaining `?.` does not guard against `null`

#### TypeScript Type Safety with Financial Data
- All numeric values from the API need an `isFinite()` guard before `toFixed()` or `Math.abs()` — `parseFloat("N/A")` returns `NaN`, and `NaN.toFixed(2)` throws at runtime
- Falsy-length guard: use `data.length > 0`, never `data.length &&` — React renders the number `0` to the DOM on an empty array
- Market status, sentiment, and direction fields must be typed as unions, not `string`: `"bullish" | "bearish" | "neutral"`, `"positive" | "negative" | "neutral"` — enforce with type predicates at the `api.ts` boundary
- Prices stay `float` in Pydantic, never `Decimal` — Pydantic v2 serializes `Decimal` as a string, breaking all TS `number` assertions. `toFixed(2)` is the documented precision contract

#### Pydantic v2 Serialization Traps
- `datetime` fields must be timezone-aware — Pydantic v2 without `tzinfo` serializes as `"2024-01-15T09:30:00"` (no Z); JavaScript parses this as local time, causing timestamps to be hours off for Thai users (UTC+7). Use `AwareDatetime` or append `"Z"` via a custom encoder
- When DB is added: use `ConfigDict(from_attributes=True)` and validate Pydantic models against Alembic migrations — never write models by hand without a migration

#### Server/Client Boundary
- `NEXT_PUBLIC_` env vars are exposed to the browser — never store credentials or internal URLs there
- Non-`NEXT_PUBLIC_` env vars are server-only — never reference them in `"use client"` files
- When adding interactivity, add a new leaf Client Component rather than converting an existing Server Component page with `"use client"` — converting a page defeats SSR and ISR for the entire route
- n8n chat widget must communicate user context only via server-side session tokens or a backend proxy — never via client-visible props, URL params, or DOM attributes

#### Next.js 15 Rendering Safety
- Every async Server Component fetching financial data must have a `<Suspense fallback={<SkeletonCard />}>` at the page level — missing boundary causes silent production failures
- `revalidate` value must be consistent for the same URL across all calls in `api.ts` — mixing `revalidate: 60` and `revalidate: 0` for the same endpoint produces undefined cache behavior
- ISR 60s is a deliberate business decision — any endpoint that must be real-time must be explicitly marked `export const dynamic = 'force-dynamic'` AND documented as an exception

#### n8n Integration Rules
- **The n8n webhook UUID is a live credential** — it must live in an environment variable, never in source code, and must be rotatable without a code deploy
- Every n8n webhook POST endpoint in FastAPI must be **idempotent** — use a payload hash or event ID for deduplication; n8n retries failed webhooks and will cause duplicate inserts without this
- Every new n8n workflow that writes data needs a corresponding FastAPI POST endpoint counterpart

#### Financial Product Compliance
- **AI disclaimer is non-negotiable**: every component rendering AI-generated analysis must include a disclaimer string as a non-removable element. If the analysis renders, the disclaimer renders. No prop or feature flag may disable it
- **Direction/color consistency**: green = positive change, red = negative change — enforced at the data layer, not CSS convention. Displaying a positive return in red is a misinformation event
- **Source attribution must survive the full pipeline**: every news item must carry `source` (publisher name) and original URL through n8n → Claude → API → UI. Enforce as non-nullable fields in both Pydantic and TypeScript
- **Error states must never mislead**: API failures and data-unavailable states must render explicit, timestamped "data currently unavailable" messages — never empty components. An empty news feed can be misread as "no news = calm market"
- **Staleness warning**: if `published_at` is older than 24 hours, the component must render a visible staleness indicator — do not silently display stale financial data
- **AI chat scope**: the n8n chat system prompt (constraining Claude to no price predictions, no specific security recommendations, mandatory disclaimer) must be version-controlled and treated as application code — not an editable string

#### When PostgreSQL Is Added (Pre-empt the Transition Bugs)
- Every DB-sourced field must be typed as nullable at the API boundary (`T | null`) and explicitly handled before rendering — mock data always returns defaults, real DBs return `NULL`
- Use `asyncpg` with an explicit connection pool size — default pool will exhaust under n8n burst webhook traffic
- Use Alembic for all schema migrations — never add a Pydantic field without a corresponding migration

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — these are not suggestions
- When in doubt, prefer the more restrictive option
- The "Critical Don't-Miss Rules" section is the highest priority — start there
- Update this file if new patterns emerge during implementation

**For Humans:**
- Keep this file lean — only rules whose absence would cause an agent to write wrong code
- Update when the technology stack changes (especially on major version bumps)
- Review when adding PostgreSQL, authentication, or real-time features — those transitions have documented pre-emption rules above
- Remove rules that become obvious over time

_Last Updated: 2026-06-20_
