<div align="center">

<img src="https://img.shields.io/badge/Microsoft%20AutoGen-0078D4?style=for-the-badge&logo=microsoft&logoColor=white" />
<img src="https://img.shields.io/badge/Groq-000000?style=for-the-badge&logo=groq&logoColor=white" />
<img src="https://img.shields.io/badge/Azure%20OpenAI-0089D6?style=for-the-badge&logo=microsoftazure&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/Google%20OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

# 🤖 AI Career Mentor

### *Your personal AI career coach — available 24/7, powered by a 5-agent AI system*

**Resume Analysis · Personalised Roadmaps · Live Market Intelligence · AI Mock Interviews · Google OAuth**

---

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-818cf8?style=flat-square)](https://ai-career-mentor-anil.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️%20Backend%20API-Render-46E3B7?style=flat-square)](https://ai-career-mentor-rrpu.onrender.com/docs)
[![Hackathon](https://img.shields.io/badge/🏆%20Microsoft%20AI%20Hackathon-Submitted-0078D4?style=flat-square)](https://microsoft.com)
[![Hackathon](https://img.shields.io/badge/🏆%20Amazon%20Nova%20Hackathon-Submitted-FF9900?style=flat-square)](https://devpost.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📌 What is AI Career Mentor?

**AI Career Mentor** is a full-stack, production-grade career coaching platform that uses a **5-agent AI system** to give developers and students a complete, personalised career acceleration plan — in under 60 seconds.

Most developers spend months trying to figure out what to learn, where to apply, and how to prepare for interviews. We solve all three — simultaneously — with AI agents that collaborate the same way a team of human experts would.

> 👋 **Built solo by a developer** — every line of backend, frontend, AI agents, Google OAuth, and cloud deployment done by one person.

---

## ✨ Core Features

| Feature | What it does |
|---------|-------------|
| 🔐 **Google OAuth 2.0** | One-click login/register via Google — no password required |
| 📄 **Resume Analyzer** | Uploads PDF, scores sections, calculates **ATS Score**, flags skill gaps |
| 📊 **Persistent Dashboard** | Real-time **Skill Radar**, **Day Streaks**, **Weekly Activity** tracking |
| 🎤 **Mock Interview Coach** | Live AI interview via WebSocket + voice feedback via **Edge-TTS** |
| 🗺️ **Learning Roadmap** | Generates 8-week plans with resources and history management |
| 📈 **Market Intelligence** | Real-time salary ranges and hiring trends via DuckDuckGo |
| 🔗 **LinkedIn Reviewer** | AI profile optimization and recruiter SEO scoring |
| 🛡️ **Smart Rate Limiting** | Production-grade daily limits via **Upstash Redis** |
| 📱 **Fully Responsive** | Optimized for desktop, tablet, and mobile with bottom nav |

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User(["👤 User"])

    subgraph Auth ["🔐 Authentication Layer"]
        GOOGLE["Google OAuth 2.0\n(One-Click Login)"]
        JWT["JWT Token\n(Session Management)"]
    end

    subgraph Vercel ["☁️ Vercel — Frontend (ai-career-mentor-anil.vercel.app)"]
        FE["Next.js App Router\n(TypeScript + Vanilla CSS)"]
        RESP["Responsive Design\n(Desktop · Tablet · Mobile)"]
    end

    subgraph Render ["☁️ Render.com — Backend (ai-career-mentor-rrpu.onrender.com)"]
        CORS["CORS Middleware\n(First-Priority Layer)"]
        RATE["SlowAPI Rate Limiter\n(100/hr · 1000/day)"]
        API["FastAPI Server\n(Python 3.11 · REST + WebSocket)"]
    end

    subgraph Agents ["🧠 Microsoft AutoGen — Multi-Agent GroupChat"]
        ORCH["GroupChatManager\n(Orchestrator)"]
        A1["📄 Resume Analyst\nATS Score · Skill Gaps"]
        A2["📈 Market Researcher\nSalary · Demand Trends"]
        A3["🗺️ Career Coach\n8-Week Roadmap"]
        A4["🎤 Mock Interviewer\nWebSocket + Voice"]
        A5["🔗 LinkedIn Reviewer\nProfile SEO"]
    end

    subgraph LLM ["🤖 LLM Layer"]
        GROQ["Groq API\nLlama 3.3 70B (Free)"]
        AZURE["Azure OpenAI\nGPT-4o (Production)"]
    end

    subgraph Tools ["🔧 External Tools"]
        DDG["DuckDuckGo Search\n(Market Research)"]
        TTS["Edge-TTS\n(Voice Feedback)"]
    end

    subgraph DB ["🗃️ Data Layer"]
        POSTGRES["Neon Postgres\n(Production DB)"]
        SQLITE["SQLite\n(Local Dev)"]
        REDIS["Upstash Redis\n(Rate Limiting)"]
    end

    User -->|"HTTPS"| FE
    User -->|"One-Click Login"| GOOGLE
    GOOGLE -->|"ID Token"| API
    FE -->|"JWT Bearer Token"| CORS
    CORS --> RATE
    RATE -->|"Allowed"| API
    RATE -->|"Blocked 429"| User
    API --> ORCH
    ORCH --> A1 & A2 & A3 & A4 & A5
    A1 & A2 & A3 & A4 & A5 -->|"Inference"| GROQ
    A1 & A2 & A3 & A4 & A5 -.->|"Production"| AZURE
    A2 -->|"Search"| DDG
    A4 -->|"Voice"| TTS
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

**Data Flow:**

1. **Auth** — Login via **Google OAuth 2.0** (one-click) or email/password. Backend verifies Google ID Token via `google-auth`, auto-creates user if new, returns **JWT**.
2. **Frontend** — Next.js App Router on **Vercel**, fully responsive. `GoogleOAuthProvider` wraps the app for OAuth context.
3. **CORS** — Every request first hits `CORSMiddleware` (highest priority) to handle browser `OPTIONS` preflight without `400` errors.
4. **Rate Limiter** — `SlowAPI` enforces **100/hr · 1000/day** per IP. Dashboard health + stats endpoints are **exempt**.
5. **Backend** — FastAPI on **Render.com** handles REST + WebSocket.
6. **Agents** — Microsoft AutoGen GroupChat with 5 specialized agents collaborating in parallel.
7. **LLM** — **Groq (Llama 3.3 70B)** for dev; one env switch (`LLM_PROVIDER=azure`) for **Azure GPT-4o** production.
8. **Data** — **Neon Postgres** (prod) / **SQLite** (local). **Upstash Redis** tracks AI usage per user.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | Full-stack React framework |
| **TypeScript** | Type safety |
| **Vanilla CSS** | Custom design system — no Tailwind |
| **@react-oauth/google** | Google OAuth 2.0 integration |
| **Recharts** | Dashboard charts (Radar, Bar, Area) |
| **Lucide React** | Icon library |
| **react-hot-toast** | Toast notifications |
| **axios** | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** (Python 3.11) | REST API + WebSocket server |
| **Microsoft AutoGen** (`ag2` v0.7.5) | Multi-agent GroupChat |
| **google-auth** | Google OAuth 2.0 token verification |
| **SQLAlchemy + Alembic** | ORM + migrations |
| **Neon Postgres** | Production database |
| **Upstash Redis** | Rate limiting |
| **SlowAPI** | Request rate limiting middleware |
| **JWT + bcrypt** | Auth + password hashing |
| **pdfplumber** | PDF resume parsing |
| **edge-tts** | Voice feedback for interviews |
| **DuckDuckGo Search** | Real-time market data |
| **Loguru** | Structured logging |

### Infrastructure
| Tool | Purpose |
|------|---------|
| **Vercel** | Frontend hosting |
| **Render.com** | Backend hosting |
| **Neon** | Serverless Postgres |
| **Upstash** | Serverless Redis |
| **GitHub Actions** | CI/CD pipeline |

### AI Providers
| Provider | Model | Environment |
|---------|-------|-------------|
| **Groq** | Llama 3.3 70B | Development (free) |
| **Azure OpenAI** | GPT-4o | Production (Microsoft Foundry) |
| **OpenAI** | GPT-4o-mini | Optional alternative |

---

## 🚀 Local Setup

### Prerequisites
- Python **3.11+**
- Node.js **18+**
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone
```bash
git clone https://github.com/Anil-Pradhan-web/ai-career-mentor.git
cd ai-career-mentor
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

**Create `backend/.env`:**
```env
# ── AI Provider ───────────────────────────────────────────
LLM_PROVIDER=groq

# ── Groq (FREE) ───────────────────────────────────────────
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# ── Azure OpenAI (production) ─────────────────────────────
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# ── Database ──────────────────────────────────────────────
DATABASE_URL=sqlite:///./dev.db

# ── Auth ──────────────────────────────────────────────────
SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=10080
APP_ENV=development

# ── Google OAuth ──────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Redis (optional for local) ────────────────────────────
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

```bash
uvicorn app.main:app --reload
# ✅ API: http://localhost:8000
# ✅ Docs: http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
npm install
```

**Create `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev
# ✅ Frontend: http://localhost:3000
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | System health + LLM status |
| `POST` | `/auth/register` | — | Email/password registration |
| `POST` | `/auth/login` | — | Login → JWT token |
| `POST` | `/auth/google` | — | Google OAuth → JWT token |
| `GET` | `/user/stats` | ✅ JWT | Dashboard stats + activity |
| `POST` | `/resume/upload` | ✅ JWT | Upload PDF resume |
| `POST` | `/resume/analyze` | ✅ JWT | AI resume scoring |
| `POST` | `/roadmap/generate` | ✅ JWT | 8-week roadmap |
| `GET` | `/market/trends` | ✅ JWT | Real-time job market data |
| `POST` | `/linkedin/review` | ✅ JWT | LinkedIn profile review |
| `WS` | `/interview/ws/{id}` | ✅ JWT | Live mock interview |
| `POST` | `/career/full-analysis` | ✅ JWT | Full 5-agent analysis |

> 📖 Interactive Swagger UI: `http://localhost:8000/docs`

---

## 🧠 How the Multi-Agent System Works

```
User: resume PDF + target role + location
         ↓
FastAPI → AutoGen GroupChat starts
         ↓
GroupChatManager coordinates 5 agents in parallel:
   📄 Resume Analyst    → "3 skill gaps: Docker, K8s, System Design. ATS: 72/100"
   📈 Market Researcher → "SDE-2 Bangalore: ₹18-28 LPA. Top skill: Go + K8s"
   🗺️ Career Coach      → "Week 1: Docker fundamentals → project → resource"
   🔗 LinkedIn Reviewer → "Headline needs more recruiter keywords"
   🎤 Mock Interviewer  → "System design question based on your gaps..."
         ↓
All outputs consolidated → returned in < 60 seconds
```

### The 5 AI Agents

| Agent | Output |
|-------|--------|
| **Resume Analyst** | `technical_skills`, `ats_score`, `skill_gaps`, `top_strengths` |
| **Market Researcher** | `salary_range`, `top_skills`, `top_companies`, `market_trend` |
| **Career Coach** | 8-week roadmap with `topic`, `resource_url`, `mini_project` |
| **LinkedIn Reviewer** | `headline_suggestions`, `profile_score`, `key_keywords` |
| **Mock Interviewer** | 7 structured questions → final score `/70` + voice feedback |

---

## 📁 Project Structure

```
ai-career-mentor/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # Register, login, Google OAuth
│   │   │   ├── resume.py        # PDF upload + AI analysis
│   │   │   ├── roadmap.py       # Roadmap generation
│   │   │   ├── market.py        # Market trends + DuckDuckGo
│   │   │   ├── interview.py     # WebSocket mock interview + TTS
│   │   │   ├── linkedin.py      # LinkedIn profile review
│   │   │   ├── career.py        # Full multi-agent analysis
│   │   │   └── user.py          # User stats + activity log
│   │   ├── agents/
│   │   │   ├── registry.py      # 5 AutoGen agent definitions
│   │   │   └── workflow.py      # GroupChat orchestration
│   │   ├── core/
│   │   │   ├── config.py        # LLM + OAuth config
│   │   │   ├── security.py      # JWT + bcrypt
│   │   │   ├── database.py      # SQLAlchemy connection
│   │   │   ├── rate_limit.py    # Redis rate limiting
│   │   │   └── activity.py      # Activity log helpers
│   │   ├── models/
│   │   │   ├── models.py        # DB models (User, nullable password)
│   │   │   └── schemas.py       # Pydantic schemas + GoogleLogin
│   │   └── main.py              # FastAPI app + middleware stack
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── login/           # Login + Google OAuth button
│   │   │   ├── register/        # Register + Google OAuth button
│   │   │   └── dashboard/
│   │   │       ├── page.tsx     # Main dashboard (responsive grids)
│   │   │       ├── resume/      # Resume analyzer
│   │   │       ├── roadmap/     # Career roadmap
│   │   │       ├── market/      # Market trends
│   │   │       ├── interview/   # Mock interview
│   │   │       ├── linkedin/    # LinkedIn reviewer
│   │   │       └── full-analysis/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx      # Sidebar → bottom nav on mobile
│   │   │   └── Providers.tsx    # GoogleOAuthProvider wrapper
│   │   └── services/
│   │       └── api.ts           # Axios client + googleLogin()
│   └── package.json
│
└── README.md
```

---

## 🌐 Deployment

### Live Production

| Component | Platform | URL |
|-----------|----------|-----|
| **Frontend** | Vercel | [ai-career-mentor-anil.vercel.app](https://ai-career-mentor-anil.vercel.app) |
| **Backend API** | Render.com | [ai-career-mentor-rrpu.onrender.com](https://ai-career-mentor-rrpu.onrender.com/docs) |
| **Database** | Neon Postgres | Serverless |
| **Cache** | Upstash Redis | Serverless |

### Environment Variables for Cloud

**Render (Backend):**
```env
LLM_PROVIDER=groq
GROQ_API_KEY=...
DATABASE_URL=postgresql://...  # Neon connection string
SECRET_KEY=...
APP_ENV=production
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
CORS_ORIGINS=https://ai-career-mentor-anil.vercel.app
```

**Vercel (Frontend):**
```env
NEXT_PUBLIC_API_URL=https://ai-career-mentor-rrpu.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Migration Paths

| Target | Changes |
|--------|---------|
| **AWS** | `LLM_PROVIDER=bedrock`, deploy to App Runner + Amplify |
| **Azure** | `LLM_PROVIDER=azure`, deploy to App Service + Static Web Apps |
| **GCP** | Add Vertex AI, deploy to Cloud Run |

---

## 🔐 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized origins:
   - `http://localhost:3000`
   - `https://ai-career-mentor-anil.vercel.app`
5. Copy **Client ID** and **Client Secret** to your env files

---

## 🧪 Testing

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

**Coverage:**
- ✅ Root endpoint
- ✅ Health check with LLM status
- ✅ Protected routes require JWT
- ✅ Google OAuth token flow

---

## 🏆 Hackathon Submissions

### 🔵 Microsoft AI Dev Days Hackathon

| Detail | Info |
|--------|------|
| Prize Pool | $80,000+ |
| Grand Prize | $20,000 × 2 |
| Requirements Met | AutoGen ✅ · Azure OpenAI ✅ · Deployed ✅ · Public Repo ✅ |

### 🟠 Amazon Nova AI Hackathon

| Detail | Info |
|--------|------|
| Prize Pool | $40,000 cash + $55,000 AWS Credits |
| Categories | Agentic AI ($10K) · Voice AI ($10K) |
| Requirements Met | 5 AutoGen Agents ✅ · Edge-TTS Voice ✅ · Full-stack ✅ |

---

## 🗺️ Upgrade Roadmap

| Feature | Status |
|---------|--------|
| Google OAuth 2.0 | ✅ Done |
| Responsive Mobile UI | ✅ Done |
| Redis Rate Limiting | ✅ Done |
| Neon Postgres | ✅ Done |
| httpOnly Cookie Auth | 🔜 Planned |
| Email Verification (Resend) | 🔜 Planned |
| Error Monitoring (Sentry) | 🔜 Planned |
| Amazon Bedrock Integration | 🔜 Planned |

---

## 👤 Team

| Name | Role |
|------|------|
| **Anil Pradhan** | Full-Stack Solo Developer |

> *Built solo — frontend, backend, AI agents, Google OAuth, cloud deployment, and UI/UX.*

---

## 🙏 Acknowledgements

- **Microsoft AutoGen** — multi-agent framework
- **Groq** — free-tier Llama 3.3 70B inference
- **Google** — OAuth 2.0 identity platform
- **Neon** — serverless Postgres
- **Upstash** — serverless Redis
- **Edge-TTS** — natural voice generation
- **DuckDuckGo** — real-time job market data
- FastAPI · Next.js · SQLAlchemy · pdfplumber open-source communities

---

<div align="center">

**Built with ❤️ by [Anil Pradhan](https://github.com/Anil-Pradhan-web)**

`#AutoGen` `#MultiAgent` `#GoogleOAuth` `#CareerTech` `#FastAPI` `#NextJS` `#AgenticAI`

</div>
