<div align="center">

<br/>

![Career Mentor AI Banner](assets/banner.png)

### *5 Specialized AI Agents. One Career Transformation.*

> **Resume Analysis · Personalized Roadmaps · Live Market Intelligence · Streaming Mock Interviews · Google OAuth**

<br/>

<img src="https://img.shields.io/badge/Microsoft%20AutoGen-0078D4?style=for-the-badge&logo=microsoft&logoColor=white" />
<img src="https://img.shields.io/badge/Groq-000000?style=for-the-badge&logo=groq&logoColor=white" />
<img src="https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />

<br/><br/>

[![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-818cf8?style=for-the-badge)](https://ai-career-mentor-anil.vercel.app)
[![⚙️ API Docs](https://img.shields.io/badge/⚙️%20Backend%20API-Swagger%20UI-46E3B7?style=for-the-badge)](https://ai-career-mentor-rrpu.onrender.com/docs)
[![🏆 Microsoft AI DevDays](https://img.shields.io/badge/🏆%20Microsoft%20AI%20DevDays-$80K%20Hackathon-00A4EF?style=for-the-badge&logo=microsoft)](https://microsoft.com)
[![🏆 Amazon Nova AI](https://img.shields.io/badge/🏆%20Amazon%20Nova%20AI-$95K%20Hackathon-FF9900?style=for-the-badge&logo=amazon)](https://devpost.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)
[![Commits](https://img.shields.io/badge/Commits-125%2B-brightgreen?style=for-the-badge&logo=git)](https://github.com/Anil-Pradhan-web/ai-career-mentor/commits)

</div>

---

## 🧭 Table of Contents

- [What is AI Career Mentor?](#-what-is-ai-career-mentor)
- [Key Numbers](#-key-numbers)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture--design)
- [The 5 AI Agents](#-the-5-ai-agents)
- [Tech Stack](#-tech-stack)
- [Local Setup](#-local-setup)
- [API Reference](#-api-reference)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Hackathon Submissions](#-hackathon-submissions)
- [Upgrade Roadmap](#-upgrade-roadmap)

---

## 🎯 What is AI Career Mentor?

**AI Career Mentor** is a production-grade, full-stack career coaching platform that deploys a **5-agent AI system** to give developers and students a complete, hyper-personalized career acceleration plan — in under 60 seconds.

Most developers spend months trying to figure out:
- 📚 *What should I learn next?*
- 🏢 *Where should I apply?*
- 🎤 *How do I ace the interview?*

**We solve all three — simultaneously** — using AI agents that collaborate the same way a team of expert human coaches would: a Resume Analyst scores your CV, a Market Researcher pulls live salary data, a Career Coach builds your 8-week plan, a LinkedIn Reviewer optimizes your profile, and a Mock Interviewer stress-tests you with adaptive questions — all in one workflow.

> 🧑‍💻 **Solo-built** — every line of backend, frontend, multi-agent orchestration, Google OAuth, and cloud infrastructure by one developer.
> ⏱️ **5–6 months** from concept to fully deployed production product.
> 📝 **110+ commits** of iterative design, production hardening, and feature delivery.

---

## 📊 Key Numbers

| Metric | Value |
|--------|-------|
| AI Agents | **5 specialized agents** |
| Interview Latency | **< 2 seconds** (Direct GROQ Streaming) |
| Full Analysis Time | **< 60 seconds** |
| Rate Limit Architecture | **100 req/hr · 1000 req/day** per user |
| LLM Fallback | **Auto Gemini → GROQ on 429** |
| DB Connection Pool | **Optimized for free-tier** (pool_size=3) |
| Caching | **SHA-256 keyed Redis cache** — zero redundant LLM calls |
| Interview Questions | **7 adaptive questions** with Persona Discovery & Adaptive Difficulty |
| Hackathon Prize Pool | **$175,000+** across 2 submissions |

---

## ✨ Core Features

<details>
<summary><b>🔐 Google OAuth 2.0</b></summary>

One-click login and registration via Google — no password required. The frontend uses `@react-oauth/google` to securely obtain a Google ID Token, which the backend verifies using `google-auth`, then exchanges for a short-lived JWT and a long-lived refresh token.
</details>

<details>
<summary><b>📄 Resume Analyzer — ATS Scoring Engine</b></summary>

Upload any PDF resume. The platform:
1. Extracts raw text using `pdfplumber` (no S3 needed — stored directly in Postgres)
2. Runs a **deterministic ATS scoring engine** (`ats_engine.py`) for objective section scoring
3. Feeds into the Resume Analyst agent for AI-powered skill gap detection, strength identification, and recruiter-readability feedback
4. Persists the structured JSON analysis to the database for dashboard display
</details>

<details>
<summary><b>🌍 Regional Market Intelligence (India & USA)</b></summary>

No stale mock data. The Market Researcher agent uses a **Regional Intelligence Engine**:
- **Deterministic Logic**: Specific regional data (Salary, Companies, Market Health) is served based on the user's location (India/USA).
- **Global Fallback**: Defaults to international market trends for other locations.
- **Live Search**: Combines deterministic regional data with real-time DuckDuckGo search snippets for hyper-accurate market reporting.
</details>

<details>
<summary><b>🎤 Voice Engine 2.0 — Production-Grade TTS</b></summary>

The interview voice system has been hardened for production stability:
- **EricNeural Voice**: Switched to a premium, professional male voice with adjusted speech rates (-8%) for a natural interviewer tone.
- **Concurrency Limiter**: Implemented `asyncio.Semaphore(2)` to prevent CPU/RAM spikes and WebSocket disconnects on Render's free tier.
- **Smart Truncation**: Text is intelligently truncated at sentence boundaries (max 850 chars) to ensure concise and professional verbal feedback.
- **Advanced Cleaning**: Regex-based noise removal (markdown, URLs, code blocks) ensures a clean, stutter-free audio experience.
- **In-Memory Caching**: Common phrases and greetings are cached to provide near-instant audio responses.
- **Real-Time Streaming**: Token-by-token streaming via `interviewer_stream` events — real conversational feel.
</details>

<details>
<summary><b>🎯 Primary Goal Tracking & Progress</b></summary>

Set your "Primary Goal" from any generated roadmap. The platform provides:
- **Goal Persistence** — Mark a specific career path (e.g., "Full Stack Developer at Google") as your primary objective.
- **Real-Time Progress Synchronization** — Mark weeks as complete on the roadmap, and watch your dashboard update instantly.
- **One-Goal Constraint** — Focus on one career transformation at a time with easy "Remove/Change" functionality.
</details>

<details>
<summary><b>🗺️ 8-Week Career Roadmap</b></summary>

The Career Coach agent generates a structured weekly plan with real resource URLs (enriched by `search_engine.py`), topic breakdowns, and mini-projects. Roadmap history is persisted and accessible from the dashboard.
</details>

<details>
<summary><b>🔗 LinkedIn Profile Reviewer</b></summary>

Paste your LinkedIn profile content and receive headline optimization suggestions, profile SEO scoring, and keyword gap analysis — powered by the LinkedIn Reviewer AutoGen agent with Gemini→GROQ fallback.
</details>

<details>
<summary><b>📊 Persistent Dashboard & Analytics</b></summary>

Real-time **Skill Radar chart**, **Day Streaks**, and **Weekly Activity** tracking. Features a dynamic **Primary Goal Progress Donut Chart** that calculates real-time completion percentages based on your active roadmap steps.
</details>

<details>
<summary><b>⚡ Dual LLM Engine with Auto-Fallback</b></summary>

- **Groq (Llama 3.3 70B)** — Primary for all streaming interviews + fallback for all agents
- **Google Gemini 1.5 Flash** — Primary for all analysis agents (Resume, Market, Roadmap, LinkedIn)
- **Auto-fallback**: Every agent catches 429 rate limit errors from Gemini and automatically retries with GROQ — zero user-facing failures
</details>

<details>
<summary><b>🛡️ Global Redis Caching Layer</b></summary>

Performance is optimized across the entire platform using Upstash Redis:
- **Universal Caching**: AI responses for **Resume Analysis**, **Career Roadmaps**, **LinkedIn Reviews**, and **Full Career Analysis** are all cached.
- **SHA-256 Keying**: Unique request fingerprints ensure cache hits are precise and secure.
- **Debug Bypass**: Caching is automatically disabled in local `DEBUG` mode to allow for real-time testing of AI prompts.
- **Success-Only Increment**: Rate limit counters only increment on *successful* AI responses — not on errors or cached hits.
</details>

---

## 🏗️ System Architecture & Design

The platform follows a modern decoupled architecture with a dedicated Multi-Agent Orchestration layer sitting between the API gateway and the LLM providers.

```mermaid
flowchart TD
    User(["👤 User"])

    subgraph Auth ["🔐 Authentication Layer"]
        GOOGLE["Google OAuth 2.0\n(One-Click Login)"]
        JWT["JWT Token\n(Session Management)"]
    end

    subgraph Vercel ["☁️ Vercel — Frontend (Next.js 14)"]
        FE["App Router\n(TypeScript + Vanilla CSS)"]
        RESP["Responsive UI\n(Desktop · Tablet · Mobile)"]
    end

    subgraph Render ["☁️ Render.com — Backend (FastAPI)"]
        CORS["CORS Middleware\n(First-Priority Layer)"]
        RATE["SlowAPI Rate Limiter\n(100/hr · 1000/day)"]
        API["FastAPI Server\n(Python 3.11 · REST + WebSocket)"]
    end

    subgraph Agents ["🧠 Multi-Agent Orchestration (AutoGen v0.2)"]
        ORCH["GroupChatManager\n(Custom Speaker Selection)"]
        A1["📄 Resume Analyst\n(ATS Score · Skill Gaps)"]
        A2["📈 Market Researcher\n(Live DuckDuckGo · Salary Data)"]
        A3["🗺️ Career Coach\n(8-Week Roadmap · Real URLs)"]
        A4["🎤 Mock Interviewer\n(Direct GROQ Streaming · No AutoGen)"]
        A5["🔗 LinkedIn Reviewer\n(Profile SEO · Keyword Gaps)"]
    end

    subgraph LLM ["🤖 LLM Layer"]
        GROQ["Groq API\nLlama 3.3 70B\n(Streaming · Free Tier)"]
        GOOGLE_AI["Google Gemini\n1.5 Flash\n(Reasoning · Fallback)"]
    end

    subgraph Tools ["🔧 External Tools"]
        DDG["DuckDuckGo Search\n(Real-time Market Data)"]
        TTS["Edge-TTS\n(Voice Generation · 30s Guard)"]
    end

    subgraph DB ["🗃️ Data Layer"]
        POSTGRES["Neon Postgres\n(pool_size=3 · pool_recycle=300s)"]
        SQLITE["SQLite\n(Local Dev)"]
        REDIS["Upstash Redis\n(Rate Limiting + AI Cache)"]
    end

    User -->|"HTTPS"| FE
    User -->|"One-Click Login"| GOOGLE
    GOOGLE -->|"ID Token Verification"| API
    FE -->|"JWT Bearer Token"| CORS
    CORS --> RATE
    RATE -->|"Allowed"| API
    RATE -->|"429 Blocked"| User
    API --> ORCH
    ORCH --> A1 & A2 & A3 & A5
    A4 -->|"Direct Streaming"| GROQ
    A1 & A2 & A3 & A5 -->|"Primary Inference"| GROQ
    A1 & A2 & A3 & A5 -->|"Reasoning + 429 Fallback"| GOOGLE_AI
    A2 -->|"Search Query"| DDG
    A4 -->|"Text-to-Speech"| TTS
    API --> POSTGRES
    API -.- SQLITE
    API --> REDIS
    GOOGLE --> JWT
    JWT --> FE

    style Vercel fill:#000,stroke:#fff,color:#fff
    style Render fill:#46E3B7,stroke:#000,color:#000
    style Agents fill:#0078D4,stroke:#fff,color:#fff
    style LLM fill:#0089D6,stroke:#fff,color:#fff
    style DB fill:#1e1b4b,stroke:#818cf8,color:#fff
    style Auth fill:#7c3aed,stroke:#fff,color:#fff
    style Tools fill:#f59e0b,stroke:#000,color:#000
```

### 🔍 Component Deep Dive

#### 1. Frontend — Next.js 14 on Vercel
- **Framework:** Next.js 14 App Router with SSR and client-side routing
- **Styling:** Pure Vanilla CSS with CSS Variables — no Tailwind overhead, full design control
- **State:** React Context + Hooks for global auth state
- **Auth Flow:** `@react-oauth/google` fetches the Google ID Token client-side → sent to backend → verified → exchanged for JWT + refresh token

#### 2. API Gateway & Security — FastAPI on Render
- **CORS** is the outermost middleware layer to handle browser preflight flawlessly
- **SlowAPI** intercepts *before* routing — enforces Upstash Redis-backed per-user IP limits
- **Auth Middleware:** Custom dependency injection (`deps.py`) verifies JWT Bearer tokens on every protected route, attaching the authenticated `User` object to request context
- **Health Check exemptions:** `/health` and `/ping` explicitly excluded from rate limiting to support cron keep-alives

#### 3. AutoGen Multi-Agent Engine
- **Framework:** Microsoft AutoGen v0.2 (`ag2`) with a `GroupChat` of 4 specialized agents
- **Orchestration:** `GroupChatManager` with a custom `speaker_selection_method` to route tasks intelligently
- **Async Safety:** All agent calls wrapped in `asyncio.to_thread()` — prevents blocking Uvicorn's event loop on Render's free tier
- **Gemini→GROQ Fallback:** Every agent catches 429 errors from Gemini and retries with GROQ automatically
- **Live Data:** Market Researcher agent fetches DuckDuckGo search snippets *before* synthesizing salary/hiring reports

#### 4. Real-Time Mock Interviews
- **Zero AutoGen overhead:** Interview Agent uses the OpenAI SDK pointed at `base_url="https://api.groq.com/openai/v1"` for sub-2s first-token latency
- **WebSocket streaming:** Token-by-token streaming via `interviewer_stream` events — real conversational feel
- **Crash resilience:** `_safe_send_json()` guards wrap all WebSocket sends — server cleans up gracefully on client disconnect
- **Adaptive state machine:** 7-question flow with company-tier difficulty scaling (FAANG → Hard, Service-based → Easy)
- **Voice synthesis:** Full response piped into `edge-tts` post-stream, base64 encoded, sent back over WebSocket with a 30s timeout guard

#### 5. Data Persistence Layer
- **Neon Postgres:** Production relational DB with optimized connection pooling (`pool_size=3, max_overflow=5, pool_recycle=300s, pool_pre_ping=True`) — tuned to handle Neon's idle connection drops on free tier
- **Upstash Redis:** Powers both distributed rate limiting and SHA-256 keyed AI response caching
- **Resume storage:** `pdfplumber` extracts text in-memory → structured JSON analysis stored in Postgres — no S3 bucket required

---

## 🧠 The 5 AI Agents

```
User Input: resume PDF + target role + location
                    ↓
        FastAPI → AutoGen GroupChat (asyncio.to_thread)
                    ↓
    ┌───────────────────────────────────────┐
    │         GroupChatManager              │
    │  (Custom speaker_selection_method)    │
    └──────┬────────┬──────────┬────────────┘
           │        │          │          │
    📄 Resume   📈 Market  🗺️ Career  🔗 LinkedIn
    Analyst    Researcher   Coach     Reviewer
           │        │          │          │
           └────────┴──────────┴────────────┘
                    ↓
        Consolidated output → < 60 seconds

────────────────────────────────────────────────

User: Starts Mock Interview
                    ↓
    FastAPI WebSocket → Direct GROQ OpenAI SDK
                (Bypasses AutoGen entirely)
                    ↓
    Token-by-token streaming → Edge-TTS voice
                    ↓
    7 adaptive questions → Score /100 + Feedback
```

| Agent | Engine | Key Output |
|-------|--------|------------|
| **📄 Resume Analyst** | AutoGen + Gemini/GROQ | `ats_score`, `technical_skills`, `skill_gaps`, `top_strengths` |
| **📈 Market Researcher** | AutoGen + Gemini/GROQ + DuckDuckGo | `salary_range`, `top_skills`, `top_companies` — *live real-time data* |
| **🗺️ Career Coach** | AutoGen + Gemini/GROQ + DuckDuckGo | 8-week roadmap with `topic`, `resource_url`, `mini_project` per week |
| **🔗 LinkedIn Reviewer** | AutoGen + Gemini/GROQ | `headline_suggestions`, `profile_score`, `key_keywords` |
| **🎤 Mock Interviewer** | **Direct GROQ Streaming** (no AutoGen) | 7 adaptive questions → streaming voice → final score `/100` |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14 (App Router) | Full-stack React framework with SSR |
| **TypeScript** | — | Type safety across all components |
| **Vanilla CSS** | — | Custom design system — zero Tailwind overhead |
| **@react-oauth/google** | — | Google OAuth 2.0 integration |
| **Recharts** | — | Dashboard charts (Radar, Bar, Area) |
| **Lucide React** | — | Icon library |
| **react-hot-toast** | — | Toast notification system |
| **axios** | — | HTTP client with interceptors |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | Python 3.11 | Async REST API + WebSocket server |
| **Microsoft AutoGen** | `ag2` v0.7.5 | Multi-agent GroupChat orchestration |
| **OpenAI SDK** (via GROQ) | — | Direct streaming for Mock Interviews |
| **google-auth** | — | Google ID Token verification |
| **SQLAlchemy + Alembic** | — | ORM + schema migrations |
| **Neon Postgres** | — | Production DB (optimized pooling) |
| **Upstash Redis** | — | Rate limiting + AI response caching |
| **SlowAPI** | — | Request rate limiting middleware |
| **JWT + bcrypt** | — | Auth tokens + password hashing |
| **pdfplumber** | — | In-memory PDF resume parsing |
| **edge-tts** | — | Natural voice synthesis (30s guard) |
| **DuckDuckGo Search** | — | Live real-time market data |
| **Loguru** | — | Structured logging |

### Infrastructure
| Tool | Role |
|------|------|
| **Vercel** | Frontend hosting + CDN |
| **Render.com** | Backend hosting (FastAPI + WebSocket) |
| **Neon** | Serverless Postgres |
| **Upstash** | Serverless Redis |
| **GitHub Actions** | CI/CD pipeline |

### AI Providers
| Provider | Model | Role |
|---------|-------|------|
| **Groq** | Llama 3.3 70B | Primary for interviews (streaming) + fallback for all agents |
| **Google Gemini** | 1.5 Flash | Primary for all analysis agents — auto-fallback to GROQ on 429 |

---

## 🚀 Local Setup

### Prerequisites
- Python **3.11+**
- Node.js **18+**
- Groq API key — free at [console.groq.com](https://console.groq.com)
- Google OAuth credentials — [console.cloud.google.com](https://console.cloud.google.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Anil-Pradhan-web/ai-career-mentor.git
cd ai-career-mentor
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
# ── AI Providers ───────────────────────────────────────
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MODEL=gemini-1.5-flash

# ── Database ──────────────────────────────────────────
DATABASE_URL=sqlite:///./dev.db

# ── Auth ──────────────────────────────────────────────
SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
APP_ENV=development

# ── Google OAuth ──────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Redis (optional for local) ────────────────────────
REDIS_URL=redis://localhost:6379/0
```

```bash
uvicorn app.main:app --reload
# ✅ API:  http://localhost:8000
# ✅ Docs: http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev
# ✅ App: http://localhost:3000
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | System health — DB status, LLM info, timestamp |
| `GET` | `/ping` | — | Ultra-lightweight cron keep-alive (no DB query) |
| `POST` | `/auth/register` | — | Email/password registration |
| `POST` | `/auth/login` | — | Login → JWT + refresh token |
| `POST` | `/auth/google` | — | Google OAuth ID Token → JWT |
| `GET` | `/user/stats` | ✅ JWT | Dashboard stats + weekly activity |
| `POST` | `/resume/upload` | ✅ JWT | Upload PDF resume |
| `POST` | `/resume/analyze` | ✅ JWT | AI resume scoring + ATS analysis |
| `POST` | `/roadmap/generate` | ✅ JWT | Generate 8-week learning roadmap |
| `GET` | `/market/trends` | ✅ JWT | **Live** real-time job market data |
| `POST` | `/linkedin/review` | ✅ JWT | LinkedIn profile optimization |
| `WS` | `/interview/ws/{id}` | ✅ JWT | **Streaming** mock interview (Direct GROQ) |
| `POST` | `/career/full-analysis` | ✅ JWT | Full 5-agent coordinated analysis |

> 📖 **Interactive Swagger UI:** `http://localhost:8000/docs`

---

## 📁 Project Structure

```
ai-career-mentor/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py            # Register, login, Google OAuth
│   │   │   ├── deps.py            # JWT validation & user dependency injection
│   │   │   ├── resume.py          # PDF upload + AI analysis
│   │   │   ├── roadmap.py         # Roadmap generation
│   │   │   ├── market.py          # Market trends + DuckDuckGo
│   │   │   ├── interview.py       # Direct GROQ streaming + TTS
│   │   │   ├── linkedin.py        # LinkedIn profile review (async)
│   │   │   ├── career.py          # Full multi-agent analysis (async)
│   │   │   └── user.py            # User stats + activity log
│   │   ├── agents/
│   │   │   ├── registry.py        # 4 AutoGen agent definitions
│   │   │   └── workflow.py        # GroupChat orchestration
│   │   ├── core/
│   │   │   ├── config.py          # LLM + OAuth config
│   │   │   ├── security.py        # JWT + bcrypt
│   │   │   ├── database.py        # SQLAlchemy (optimized connection pooling)
│   │   │   ├── rate_limit.py      # Redis per-feature rate limiting
│   │   │   ├── cache.py           # Redis AI response caching (SHA-256)
│   │   │   ├── market_engine.py   # DuckDuckGo live market data pipeline
│   │   │   ├── search_engine.py   # Resource URL enrichment engine
│   │   │   ├── ats_engine.py      # Deterministic ATS scoring engine
│   │   │   ├── voice_engine.py    # Edge-TTS synthesis (30s timeout guard)
│   │   │   └── activity.py        # Activity log helpers
│   │   ├── tools/
│   │   │   └── market_search.py   # DuckDuckGo dynamic search tool
│   │   ├── models/
│   │   │   ├── models.py          # SQLAlchemy DB models
│   │   │   └── schemas.py         # Pydantic schemas + GoogleLogin
│   │   └── main.py                # FastAPI app + middleware stack
│   ├── tests/
│   │   └── ...                    # pytest suite
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── login/             # Login + Google OAuth
│   │   │   ├── register/          # Register + Google OAuth
│   │   │   └── dashboard/
│   │   │       ├── page.tsx       # Main dashboard (responsive grids)
│   │   │       ├── loading.tsx    # Dashboard loading state
│   │   │       ├── resume/        # Resume analyzer UI
│   │   │       ├── roadmap/       # Career roadmap UI
│   │   │       ├── market/        # Market trends UI
│   │   │       ├── interview/     # Mock interview UI
│   │   │       ├── linkedin/      # LinkedIn reviewer UI
│   │   │       ├── full-analysis/ # Multi-agent analysis UI
│   │   │       └── settings/      # User settings + API keys
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Sidebar → bottom nav on mobile
│   │   │   └── Providers.tsx      # GoogleOAuthProvider wrapper
│   │   └── services/
│   │       └── api.ts             # Axios client + googleLogin()
│   └── package.json
│
└── README.md
```

---

## 🔄 CI/CD Pipeline

```
Push to main branch
        ↓
┌───────────────────────────────────────┐
│         GitHub Actions CI             │
├───────────────────────────────────────┤
│  Frontend   │  npm install            │
│             │  eslint --max-warnings 0│
│             │  next build             │
├─────────────┼─────────────────────────┤
│  Backend    │  Python 3.11 setup      │
│             │  pip install -r reqs    │
│             │  pytest tests/ -v       │
├─────────────┼─────────────────────────┤
│  Docker     │  Build & Push to GHCR   │
│             │  (Frontend & Backend)   │
└───────────────────────────────────────┘
        ↓ (all checks pass)
┌───────────────────────────────────────┐
│              CD                       │
│  Vercel   → Auto-deploy frontend      │
│  Render   → Webhook → deploy backend  │
└───────────────────────────────────────┘
```

Only fully tested, lint-free, and security-audited code reaches production.

**Test coverage includes:**
- ✅ Root endpoint
- ✅ Health check with LLM status
- ✅ Protected routes require valid JWT
- ✅ Google OAuth token verification flow

---

## 🌐 Deployment

### Live Production

| Component | Platform | URL |
|-----------|----------|-----|
| **Frontend** | Vercel | [ai-career-mentor-anil.vercel.app](https://ai-career-mentor-anil.vercel.app) |
| **Backend API** | Render.com | [ai-career-mentor-rrpu.onrender.com/docs](https://ai-career-mentor-rrpu.onrender.com/docs) |
| **Database** | Neon Postgres | Serverless, auto-scaling |
| **Cache / Rate Limit** | Upstash Redis | Serverless, globally distributed |

### Production Environment Variables

**Render (Backend):**
```env
LLM_PROVIDER=google
GOOGLE_API_KEY=...
GOOGLE_MODEL=gemini-1.5-flash
DATABASE_URL=postgresql://...        # Neon connection string
SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
APP_ENV=production
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
REDIS_URL=rediss://...
CORS_ORIGINS=https://ai-career-mentor-anil.vercel.app
```

**Vercel (Frontend):**
```env
NEXT_PUBLIC_API_URL=https://ai-career-mentor-rrpu.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## 🔐 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application type)
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://ai-career-mentor-anil.vercel.app`
5. Copy the **Client ID** and **Client Secret** into your `.env` files

---

## 🧪 Testing

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

Coverage includes root endpoints, health checks, protected route JWT enforcement, and Google OAuth token flow.

---

## 🏆 Hackathon Submissions

### 🔵 Microsoft AI DevDays Hackathon

| Detail | Info |
|--------|------|
| Total Prize Pool | **$80,000+** |
| Grand Prize | **$20,000 × 2** |
| Submission Date | **April 12, 2026** ✅ |
| Requirements Satisfied | Microsoft AutoGen ✅ · Deployed MVP ✅ · Public Repo ✅ |

### 🟠 Amazon Nova AI Hackathon

| Detail | Info |
|--------|------|
| Total Prize Pool | **$40,000 cash + $55,000 AWS Credits** |
| Target Categories | Agentic AI ($10K) · Voice AI ($10K) |
| Submission Date | **April 12, 2026** ✅ |
| Requirements Satisfied | 5 AutoGen Agents ✅ · Edge-TTS Voice ✅ · Full-stack deployed MVP ✅ |

---

## 🗺️ Upgrade Roadmap

| Feature | Status |
|---------|--------|
| Google OAuth 2.0 | ✅ Shipped |
| Responsive Mobile UI (Desktop · Tablet · Mobile) | ✅ Shipped |
| Redis Rate Limiter + AI Response Cache | ✅ Shipped |
| Neon Postgres (Optimized Connection Pooling) | ✅ Shipped |
| Real-Time Market Data (DuckDuckGo Pipeline) | ✅ Shipped |
| Streaming Mock Interviews (Direct GROQ) | ✅ Shipped |
| Adaptive AI Interview Logic (Persona-based) | ✅ Shipped |
| Primary Goal Management & Progress Tracking | ✅ Shipped |
| Production WebSocket Hardening (Keep-Alive) | ✅ Shipped |
| Gemini → GROQ Auto-Fallback (All Agents) | ✅ Shipped |
| Edge-TTS Timeout Guards | ✅ Shipped |
| Cron Keep-Alive `/ping` Endpoint | ✅ Shipped |
| Rate Limit Increment on Success Only | ✅ Shipped |
| httpOnly Cookie Auth | 🔜 Planned |
| Email Verification (Resend) | 🔜 Planned |
| Error Monitoring (Sentry) | 🔜 Planned |

---

## 👤 Built By

| Name | Role |
|------|------|
| **[Anil Pradhan](https://github.com/Anil-Pradhan-web)** | Solo Full-Stack Developer |

> *Every line of backend, frontend, multi-agent orchestration, Google OAuth, cloud infrastructure, and UI/UX — built solo over 5–6 months across 110+ commits.*

---

## 🙏 Acknowledgements

- **[Microsoft AutoGen](https://github.com/microsoft/autogen)** — multi-agent orchestration framework
- **[Groq](https://groq.com)** — free-tier Llama 3.3 70B inference
- **[Google Gemini](https://ai.google.dev)** — multimodal AI via AI Studio
- **[Neon](https://neon.tech)** — serverless Postgres
- **[Upstash](https://upstash.com)** — serverless Redis
- **[Edge-TTS](https://github.com/rany2/edge-tts)** — natural voice generation
- **[DuckDuckGo](https://duckduckgo.com)** — real-time job market search
- FastAPI · Next.js · SQLAlchemy · pdfplumber — the open-source backbone of this project

---

<div align="center">

<br/>

**Built with 🧠 by [Anil Pradhan](https://github.com/Anil-Pradhan-web)**

<br/>

`#AutoGen` `#MultiAgent` `#GoogleOAuth` `#CareerTech` `#FastAPI` `#NextJS` `#AgenticAI` `#Groq` `#Gemini` `#WebSocket`

</div>
