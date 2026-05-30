<div align="center">

# 🖥️ **AI Career Mentor — System Design Document**

**Comprehensive System Design, Internal Architecture & Technical Specifications**

![System Design](https://img.shields.io/badge/System%20Design-Complete-34D399?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Python%203.11+-009688?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2015-4169E1?style=for-the-badge)

</div>

---

## 📑 **Table of Contents**

| # | Section | 🔗 |
|---|---------|-----|
| 1 | [📋 Project Overview](#1-project-overview) |
| 2 | [🏗️ System Architecture Overview](#2-system-architecture-overview) |
| 3 | [🗂️ Backend Structure & Module Map](#3-backend-structure--module-map) |
| 4 | [🗂️ Frontend Structure & Module Map](#4-frontend-structure--module-map) |
| 5 | [📦 Data Models & Schemas Deep Dive](#5-data-models--schemas-deep-dive) |
| 6 | [🧠 Agent Architecture Deep Dive](#6-agent-architecture-deep-dive) |
| 7 | [⚙️ Core Services Deep Dive](#7-core-services-deep-dive) |
| 8 | [🌐 API Routes & Middleware](#8-api-routes--middleware) |
| 9 | [🔌 WebSocket Protocol Design](#9-websocket-protocol-design) |
| 10 | [🗃️ Database Design & Migrations](#10-database-design--migrations) |
| 11 | [🧪 Testing Strategy](#11-testing-strategy) |
| 12 | [🐳 Docker & Deployment](#12-docker--deployment) |
| 13 | [🔒 Security Architecture](#13-security-architecture) |
| 14 | [📈 Performance & Optimization](#14-performance--optimization) |
| 15 | [🔄 State Management Patterns](#15-state-management-patterns) |
| 16 | [🚦 Error Handling & Logging](#16-error-handling--logging) |
| 17 | [🧬 LLM Integration Patterns](#17-llm-integration-patterns) |
| 18 | [📊 Observability & Monitoring](#18-observability--monitoring) |
| 19 | [🔮 Future Architecture Roadmap](#19-future-architecture-roadmap) |

---

## 1. 📋 **Project Overview**

### 🎯 **Purpose**

AI Career Mentor is a **production-grade, full-stack career coaching platform** that leverages **6 specialized AI workflows** to help developers transition from career confusion to concrete execution plans. It combines **rule-based deterministic engines**, **LLM-powered analysis**, **real-time WebSocket communication**, and **RAG-enriched resource recommendations** into a unified dashboard.

### 📐 **Design Philosophy**

| Principle | Implementation |
|-----------|---------------|
| **⚡ Hybrid AI** | Rule-based engines (ATS scoring) + LLMs (strategy generation) = accuracy + intelligence |
| **🛡️ Defense in Depth** | Every AI workflow has 2-3 LLM fallback providers + deterministic/programmatic fallback |
| **⚡ Real-Time First** | WebSocket for interviews + voice, SSE for streaming analysis |
| **📦 Modular Monolith** | Clear separation of concerns without microservice complexity |
| **🔌 Protocol Diversity** | REST (CRUD) + SSE (streaming) + WebSocket (real-time bidirectional) |
| **🧪 Test-Infected** | 102 tests covering all critical paths with mock-free integrations |

### 🌟 **Core Capabilities**

| # | Workflow | Protocol | Engine | Fallback Strategy |
|---|----------|----------|--------|-------------------|
| 1 | **Resume Intelligence** | REST | Deterministic ATS + LLM | LLM → Deterministic → Default |
| 2 | **Career Roadmap Builder** | REST | LangGraph + Google Gemini + RAG | Gemini → Groq → NVIDIA → Programmatic |
| 3 | **Market Explorer** | REST | Tavily/Serper Search + Groq | Groq → NVIDIA → Unavailable Response |
| 4 | **LinkedIn Optimizer** | REST | Groq + Programmatic Fallback | Groq → NVIDIA → Deterministic Strategy |
| 5 | **Mock Interview Engine** | WebSocket | 7-Phase FSM + NVIDIA NIM | NVIDIA only (session stability) |
| 6 | **Voice Coach (Anya)** | WebSocket | Gemini Live Multimodal | Gemini Live only (no fallback) |

---

## 2. 🏗️ **System Architecture Overview**

### 🧭 **High-Level Component Architecture**

```mermaid
graph TB
    classDef client fill:#1e1e2e,color:#fff
    classDef gw fill:#009688,color:#fff
    classDef mid fill:#f59e0b,color:#fff
    classDef ai fill:#7c3aed,color:#fff
    classDef data fill:#0ea5e9,color:#fff

    subgraph "🌐 Client (Browser)"
        NEXT["Next.js 14 App Router<br/>React 18 · TypeScript · Tailwind"]
        VA["VoiceAssistant.tsx<br/>PCM Audio · WebSocket"]
        MI["Interview Console<br/>Monaco Editor · TTS"]
    end

    subgraph "⚡ API Gateway"
        FAPI["FastAPI · Uvicorn<br/>REST + SSE + WebSocket"]
        
        subgraph "🛡️ Middleware Chain"
            CORS["CORS"]
            LOG["Logger"]
            SLOW["SlowAPI Rate Limit"]
            JWT["JWT Auth"]
        end
    end

    subgraph "🧠 AI Layer"
        LG["LangGraph DAG"]
        REG["Agent Registry<br/>Circuit Breaker"]
        ATS["ATS Engine<br/>Deterministic"]
        RAG["RAG Service<br/>ChromaDB + Keyword"]
        SE["Search Engine<br/>Tavily → Serper → DDG"]
    end

    subgraph "🗃️ Data Layer"
        PG["PostgreSQL (Neon)"]
        RD["Redis (Upstash)"]
        CD["ChromaDB"]
        MEM["In-Memory Cache"]
    end

    NEXT -->|"REST"| FAPI
    NEXT -->|"SSE"| FAPI
    VA -->|"WS"| FAPI
    MI -->|"WS"| FAPI
    
    FAPI --> CORS --> LOG --> SLOW --> JWT
    
    JWT --> LG & REG & ATS & RAG & SE
    JWT --> PG & RD
    SLOW --> RD
    
    LG --> REG
    RAG --> CD & MEM

    class NEXT,VA,MI client
    class FAPI gw
    class CORS,LOG,SLOW,JWT mid
    class LG,REG,ATS,RAG,SE ai
    class PG,RD,CD,MEM data
```

### 📡 **Communication Protocol Matrix**

| Protocol | Transport | Use Cases | Data Format | Connection Lifecycle |
|----------|-----------|-----------|-------------|---------------------|
| **REST** | HTTP/1.1 | CRUD operations, Auth, File upload | JSON | Request-Response (stateless) |
| **SSE** | HTTP/1.1 | Full career analysis streaming | `text/event-stream` | Long-lived, server push |
| **WebSocket** | WS/WSS | Mock interviews, Voice coaching | JSON + Binary (PCM) | Persistent, full-duplex |

### 🔄 **Request Lifecycle Pattern**

```
Browser → Next.js (SSR) → FastAPI → Middleware Chain → Route Handler → 
  → AI Service/LLM → Database → Response → Browser
```

### 📊 **Data Flow Patterns**

| Pattern | Used In | Description |
|---------|---------|-------------|
| **Request-Response** | All REST endpoints | Sync CRUD operations |
| **Server-Sent Events** | `/career/full-analysis/stream` | Server pushes progress + result |
| **Full-Duplex** | `/interview/ws/*`, `/career/voice-assistant/ws` | Bidirectional real-time communication |
| **Fan-Out/Fan-In** | LangGraph DAG | Parallel node execution → sync point |
| **Fallback Chain** | Agent Registry | Primary→Fallback1→Fallback2→Deterministic |
| **Cache-Aside** | Resume, LinkedIn, Roadmap | Cache check → Miss → Compute → Store |

---

## 3. 🗂️ **Backend Structure & Module Map**

### 📁 **Complete Directory Structure**

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI application, middleware, lifespan
│   │
│   ├── agents/                          # 🧠 AI Agent Modules
│   │   ├── __init__.py
│   │   ├── registry.py                  # Unified LLM caller + circuit breaker
│   │   └── workflow.py                  # LangGraph DAG orchestration
│   │
│   ├── api/                             # 🌐 API Route Handlers
│   │   ├── __init__.py
│   │   ├── auth.py                      # Auth (register, login, Google OAuth, refresh)
│   │   ├── deps.py                      # Shared dependencies (JWT auth, rate limit)
│   │   ├── resume.py                    # Resume upload + analysis
│   │   ├── roadmap.py                   # Roadmap CRUD + quiz
│   │   ├── market.py                    # Market intelligence
│   │   ├── career.py                    # Full analysis SSE streaming
│   │   ├── linkedin.py                  # LinkedIn optimization
│   │   ├── interview.py                 # Mock interview WebSocket
│   │   ├── voice_assistant.py           # Anya voice coach WebSocket
│   │   └── user.py                      # User dashboard stats
│   │
│   ├── core/                            # ⚙️ Core Business Logic
│   │   ├── __init__.py
│   │   ├── config.py                    # Settings + env configuration
│   │   ├── database.py                  # SQLAlchemy engine + session factory
│   │   ├── security.py                  # Password hashing + JWT tokens
│   │   ├── rate_limit.py                # Redis + in-memory per-feature limits
│   │   ├── cache.py                     # Response caching layer
│   │   ├── activity.py                  # Activity logging helper
│   │   ├── ats_engine.py                # Deterministic ATS scoring (556 lines)
│   │   ├── rag_service.py               # ChromaDB RAG + keyword fallback
│   │   ├── search_engine.py             # DuckDuckGo + URL quality scoring
│   │   ├── voice_engine.py              # TTS audio generation
│   │   │
│   │   ├── interview/                   # 🎤 Interview Subsystem
│   │   │   ├── __init__.py
│   │   │   ├── state.py                 # 7-phase FSM (InterviewStateMachine)
│   │   │   ├── prompts.py               # Role/company-specific prompts
│   │   │   ├── session.py               # Compression + rolling memory
│   │   │   ├── constants.py             # 100+ roles, 80+ companies
│   │   │   ├── llm.py                   # Interview-specific LLM caller
│   │   │   └── websocket_manager.py     # WS lifecycle + audio management
│   │   │
│   │   ├── market/                      # 📈 Market Subsystem
│   │   │   ├── __init__.py
│   │   │   ├── service.py               # Market intelligence aggregator (567 lines)
│   │   │   └── history.py               # Market analysis persistence
│   │   │
│   │   └── roadmap/                     # 🗺️ Roadmap Subsystem
│   │       ├── __init__.py
│   │       ├── agents.py                # Structure + details LLM runners
│   │       ├── helpers.py               # JSON parsing, normalization, fallback
│   │       ├── prompts.py               # Dynamic system prompts
│   │       └── quiz.py                  # MCQ quiz generation (LLM + offline)
│   │
│   ├── models/                          # 📦 Data Models
│   │   ├── __init__.py
│   │   ├── models.py                    # SQLAlchemy ORM (6 tables, 131 lines)
│   │   ├── schemas.py                   # Pydantic request/response schemas
│   │   └── validation.py                # Strict agent output validation models
│   │
│   └── data/                            # 📚 Seed Data
│       └── curated_resources.json       # Gold-standard RAG seed data
│
├── tests/                               # 🧪 Test Suite (102 tests)
│   ├── test_agents_registry.py          # 26 tests
│   ├── test_roadmap_agents.py           # 24 tests
│   ├── test_validation.py               # 14 tests
│   ├── test_main.py                     # 9 tests
│   ├── test_features.py                 # 8 tests
│   ├── test_ats_engine.py               # 5 tests
│   ├── test_market_service.py           # 5 tests
│   ├── test_gamified_roadmap.py         # 3 tests
│   ├── test_voice_assistant.py          # 3 tests
│   └── test_linkedin.py                 # 2 tests
│
├── alembic/                             # Database migrations
├── Dockerfile
├── requirements.txt
└── alembic.ini
```

### 📏 **Module Dependency Graph**

```mermaid
graph TD
    classDef api fill:#818cf8,color:#fff
    classDef core fill:#34d399,color:#fff
    classDef agent fill:#f59e0b,color:#fff
    classDef model fill:#ec4899,color:#fff

    MAIN["main.py"] --> AUTH["api/auth.py"]
    MAIN --> RESUME["api/resume.py"]
    MAIN --> ROADMAP["api/roadmap.py"]
    MAIN --> MARKET["api/market.py"]
    MAIN --> CAREER["api/career.py"]
    MAIN --> LINKEDIN["api/linkedin.py"]
    MAIN --> INTERVIEW["api/interview.py"]
    MAIN --> VOICE["api/voice_assistant.py"]
    MAIN --> USER["api/user.py"]
    
    RESUME --> AGENTS["agents/registry.py"]
    RESUME --> CORE_ATS["core/ats_engine.py"]
    RESUME --> MODELS["models/models.py"]
    RESUME --> MODELS_VAL["models/validation.py"]
    
    MARKET --> AGENTS
    MARKET --> CORE_MARKET["core/market/service.py"]
    MARKET --> MODELS
    
    LINKEDIN --> AGENTS
    LINKEDIN --> MODELS_VAL
    
    ROADMAP --> CORE_ROADMAP["core/roadmap/agents.py"]
    ROADMAP --> CORE_ROADMAP_HELP["core/roadmap/helpers.py"]
    ROADMAP --> CORE_SEARCH["core/search_engine.py"]
    ROADMAP --> MODELS
    
    CAREER --> AGENTS_WF["agents/workflow.py"]
    CAREER --> CORE_MARKET
    
    INTERVIEW --> CORE_INT["core/interview/websocket_manager.py"]
    
    VOICE --> AGENTS
    
    AGENTS_WF --> RESUME
    AGENTS_WF --> MARKET
    AGENTS_WF --> LINKEDIN
    AGENTS_WF --> CORE_ROADMAP
    
    ALL_API["All API modules"] --> CORE_DB["core/database.py"]
    ALL_API --> CORE_CONFIG["core/config.py"]
    ALL_API --> CORE_RL["core/rate_limit.py"]
    ALL_API --> CORE_ACT["core/activity.py"]

    class MAIN,RESUME,ROADMAP,MARKET,CAREER,LINKEDIN,INTERVIEW,VOICE,USER,AUTH api
    class CORE_ATS,CORE_MARKET,CORE_ROADMAP,CORE_SEARCH,CORE_DB,CORE_CONFIG,CORE_RL,CORE_ACT core
    class AGENTS,AGENTS_WF agent
    class MODELS,MODELS_VAL model
```

---

## 4. 🗂️ **Frontend Structure & Module Map**

### 📁 **Complete Directory Structure**

```
frontend/
├── src/
│   ├── app/                             # 🗺️ Next.js 14 App Router
│   │   ├── layout.tsx                   # Root layout (fonts, metadata, providers)
│   │   ├── globals.css                  # Design system tokens, custom properties
│   │   ├── page.tsx                     # Landing page
│   │   │
│   │   ├── login/page.tsx              # Login page
│   │   ├── register/page.tsx           # Registration page
│   │   │
│   │   └── dashboard/                   # 🖥️ Dashboard (Protected Routes)
│   │       ├── layout.tsx              # Shared sidebar + navbar layout
│   │       ├── page.tsx                # Stats, charts, activity feed
│   │       ├── resume/page.tsx         # Resume upload & analysis UI
│   │       ├── roadmap/page.tsx        # Gamified learning tracker
│   │       ├── market/page.tsx         # Market explorer
│   │       ├── interview/page.tsx      # Mock interview console
│   │       ├── linkedin/page.tsx       # LinkedIn optimizer
│   │       ├── full-analysis/page.tsx  # Full career analysis (SSE)
│   │       └── settings/page.tsx       # User preferences
│   │
│   ├── components/                      # 🧩 React Components
│   │   ├── landing/                     # Landing page (9 files)
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Showcase.tsx
│   │   │   ├── Stats.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── PlacementStats.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── interview/                   # Interview console UI
│   │   ├── charts/                      # Data visualization (Recharts)
│   │   ├── auth/                        # Auth forms (Google OAuth)
│   │   ├── Sidebar.tsx                  # Dashboard navigation sidebar
│   │   ├── VoiceAssistant.tsx           # Anya voice call widget + wave canvas
│   │   ├── ResumeAnalysisPanel.tsx      # Analysis results display
│   │   └── UploadResumeCard.tsx         # PDF drag-and-drop upload
│   │
│   ├── services/                        # 🌐 API Client Layer
│   │   ├── client.ts                    # Axios instance + JWT interceptors
│   │   ├── auth.ts                      # Auth API functions
│   │   ├── resume.ts                    # Resume API functions
│   │   ├── career.ts                    # Career analysis SSE
│   │   ├── roadmap.ts                   # Roadmap API functions
│   │   ├── market.ts                    # Market API functions
│   │   ├── interview.ts                 # Interview API functions
│   │   ├── linkedin.ts                  # LinkedIn API functions
│   │   └── user.ts                      # User API functions
│   │
│   ├── hooks/                           # 🪝 Custom React Hooks
│   └── types/                           # 📘 TypeScript Type Definitions
│       └── index.ts                     # All interfaces (131 lines)
│
├── public/                              # Static assets
├── Dockerfile
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 🧩 **Component Dependency Graph**

```mermaid
graph TD
    classDef layout fill:#1e1e2e,color:#fff
    classDef page fill:#0ea5e9,color:#fff
    classDef comp fill:#7c3aed,color:#fff
    classDef svc fill:#34d399,color:#fff

    ROOT["layout.tsx"] --> LANDING["page.tsx (Landing)"]
    ROOT --> LOGIN["login/page.tsx"]
    ROOT --> REGISTER["register/page.tsx"]
    ROOT --> DLAYOUT["dashboard/layout.tsx"]
    
    DLAYOUT --> DASH["dashboard/page.tsx"]
    DLAYOUT --> DRES["resume/page.tsx"]
    DLAYOUT --> DROAD["roadmap/page.tsx"]
    DLAYOUT --> DMARK["market/page.tsx"]
    DLAYOUT --> DINT["interview/page.tsx"]
    DLAYOUT --> DLINK["linkedin/page.tsx"]
    DLAYOUT --> DFULL["full-analysis/page.tsx"]
    DLAYOUT --> DSET["settings/page.tsx"]
    
    DLAYOUT --> SIDEBAR["Sidebar.tsx"]
    DLAYOUT --> VOICE["VoiceAssistant.tsx"]
    
    DRES --> UPLOAD["UploadResumeCard.tsx"]
    DRES --> PANEL["ResumeAnalysisPanel.tsx"]
    DRES --> SC_RESUME["services/resume.ts"]
    
    DMARK --> SC_MARKET["services/market.ts"]
    DINT --> SC_INT["services/interview.ts"]
    DLINK --> SC_LINK["services/linkedin.ts"]
    DFULL --> SC_CAREER["services/career.ts"]
    
    SC_RESUME --> CLIENT["services/client.ts"]
    SC_MARKET --> CLIENT
    SC_CAREER --> CLIENT
    SC_INT --> CLIENT
    SC_LINK --> CLIENT

    class ROOT,LANDING,LOGIN,REGISTER,DLAYOUT layout
    class DASH,DRES,DROAD,DMARK,DINT,DLINK,DFULL,DSET page
    class SIDEBAR,VOICE,UPLOAD,PANEL comp
    class CLIENT,SC_RESUME,SC_MARKET,SC_CAREER,SC_INT,SC_LINK svc
```

### 🌐 **Client-Server Data Flow**

```
User Action → React Component → Service Function → client.ts (Axios) →
  → JWT Attach → HTTP Request → FastAPI → Middleware → Handler → Response →
  → Axios Interceptor → Service → Component State → UI Update
```

### 🔐 **Axios Interceptor Chain**

```typescript
// client.ts — Request Interceptor
config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;

// client.ts — Response Interceptor
if (status === 401) { autoRefreshToken(); redirectToLogin(); }
if (status === 429) { showToast('Daily limit reached'); }
if (status === 200) { return data; }
```

---

## 5. 📦 **Data Models & Schemas Deep Dive**

### 🗃️ **SQLAlchemy ORM Models**

#### **User** — `users` table
```python
class User(Base):
    __tablename__ = "users"
    
    id         = Column(String, primary_key=True, default=_uuid)  # UUID
    email      = Column(String, unique=True, nullable=False, index=True)  # Login
    name       = Column(String, nullable=False)  # Display name
    hashed_pw  = Column(String, nullable=True)   # NULL = OAuth user
    created_at = Column(DateTime(timezone=True), default=_now)
    
    # Relationships (cascade delete)
    resumes            = relationship("Resume",           back_populates="user", cascade="all, delete")
    roadmaps           = relationship("CareerRoadmap",    back_populates="user", cascade="all, delete")
    market_analyses    = relationship("MarketAnalysis",   back_populates="user", cascade="all, delete")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete")
    activity_logs      = relationship("ActivityLog",      back_populates="user", cascade="all, delete")
```

#### **Resume** — `resumes` table
```python
class Resume(Base):
    __tablename__ = "resumes"
    
    id             = Column(String, primary_key=True, default=_uuid)
    user_id        = Column(String, ForeignKey("users.id"), nullable=False)
    filename       = Column(String, nullable=False)          # Original PDF name
    parsed_content = Column(JSON, nullable=True)             # Full AI analysis
    raw_text       = Column(Text, nullable=True)             # Extracted PDF text
    uploaded_at    = Column(DateTime(timezone=True), default=_now)
    
    user = relationship("User", back_populates="resumes")
```

#### **CareerRoadmap** — `career_roadmaps` table
```python
class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"
    
    id          = Column(String, primary_key=True, default=_uuid)
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    target_role = Column(String, nullable=False)   # e.g., "Data Scientist"
    steps       = Column(JSON, nullable=True)       # 8-week plan array
    created_at  = Column(DateTime(timezone=True), default=_now)
    
    user = relationship("User", back_populates="roadmaps")
```

#### **MarketAnalysis** — `market_analyses` table
```python
class MarketAnalysis(Base):
    __tablename__ = "market_analyses"
    
    id          = Column(String, primary_key=True, default=_uuid)
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    target_role = Column(String, nullable=False)
    location    = Column(String, nullable=False)
    analysis    = Column(JSON, nullable=True)   # Full market report
    created_at  = Column(DateTime(timezone=True), default=_now)
    
    user = relationship("User", back_populates="market_analyses")
```

#### **InterviewSession** — `interview_sessions` table
```python
class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id           = Column(String, primary_key=True, default=_uuid)
    user_id      = Column(String, ForeignKey("users.id"), nullable=False)
    target_role  = Column(String, nullable=False)
    chat_history = Column(JSON, nullable=True)     # [{role, content, timestamp}]
    score        = Column(Float, nullable=True)     # 0-100
    status       = Column(String, default="in_progress")  # in_progress | completed
    created_at   = Column(DateTime(timezone=True), default=_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="interview_sessions")
```

#### **ActivityLog** — `activity_logs` table
```python
class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id         = Column(String, primary_key=True, default=_uuid)
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    action     = Column(String, nullable=False)    # "Generated Roadmap"
    feature    = Column(String, nullable=False)    # "roadmap"
    created_at = Column(DateTime(timezone=True), default=_now)
    
    user = relationship("User", back_populates="activity_logs")
```

### ✅ **Pydantic Validation Schemas**

#### **Agent Output Validation Models**

```python
# models/validation.py

class ResumeAnalysisModel(BaseModel):
    """Strict schema for resume agent output with custom validators."""
    technical_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    years_of_experience: float = Field(default=0.0, ge=0, le=25)
    experience_breakdown: List[str] = Field(default_factory=list)
    top_strengths: List[str] = Field(default_factory=list, max_length=5)
    skill_gaps: List[str] = Field(default_factory=list, max_length=5)
    ats_score: int = Field(default=0, ge=0, le=100)
    ats_score_breakdown: Dict[str, int] = Field(default_factory=lambda: {
        "keywords": 0, "achievements": 0, "action_verbs": 0, "formatting_and_length": 0
    })

    @field_validator("ats_score")
    @classmethod
    def cap_ats_score(cls, v: int) -> int:
        return min(v, 100)

class MarketTrendsModel(BaseModel):
    """Strict schema for market agent output."""
    role: str = Field(default="")
    location: str = Field(default="")
    salary_range: Dict[str, Any] = Field(default_factory=dict)
    market_trend: str = Field(default="")
    hiring_volume: str = Field(default="")
    hiring_companies: List[Dict[str, str]] = Field(default_factory=list)
    top_skills_freq: List[Dict[str, Any]] = Field(default_factory=list)

class LinkedInStrategyModel(BaseModel):
    """Strict schema for LinkedIn agent output."""
    headlines: List[str] = Field(default_factory=list)
    about_section: str = Field(default="")
    demanding_skills: List[str] = Field(default_factory=list)
    ats_keywords_to_inject: List[str] = Field(default_factory=list)
    recruiter_search_trends: List[str] = Field(default_factory=list)
    profile_density_advice: str = Field(default="")
    certifications: List[str] = Field(default_factory=list)

class RoadmapModel(BaseModel):
    """Strict schema for roadmap agent output."""
    weeks: List[Dict[str, Any]] = Field(default_factory=list)
```

### 📋 **Request/Response Schemas**

```python
# models/schemas.py

class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class FullAnalysisRequest(BaseModel):
    resume_text: str
    target_role: str
    location: str
    provider: Optional[str] = None

class RoadmapRequest(BaseModel):
    target_role: str
    skill_gaps: List[str]
    provider: Optional[str] = None
    experience_level: Optional[str] = "intermediate"
    learning_style: Optional[str] = "balanced"

class RoadmapWeek(BaseModel):
    week: int
    topic: str
    skill_gap_addressed: Optional[str] = None
    youtube_resources: List[str] = Field(default_factory=list)
    article_resources: List[str] = Field(default_factory=list)
    github_resources: List[str] = Field(default_factory=list)
    official_docs: List[str] = Field(default_factory=list)
    estimated_hours: int = 10
    mini_project: str = ""
    success_criteria: Optional[str] = None
    why_it_matters: Optional[str] = None
    completed: bool = False

class RoadmapResponse(BaseModel):
    id: Optional[str] = None
    target_role: str
    weeks: List[RoadmapWeek]
```

### 📘 **TypeScript Types (Frontend)**

```typescript
// types/index.ts — Complete type definitions

export interface ResumeAnalysis {
    technical_skills: string[];
    soft_skills: string[];
    years_of_experience: number;
    experience_breakdown?: string[];
    top_strengths: string[];
    skill_gaps: string[];
    ats_score?: number;
    ats_score_breakdown?: {
        keywords: number;
        achievements: number;
        action_verbs: number;
        formatting_and_length: number;
    };
}

export interface AnalyzeResponse {
    filename: string;
    char_count: number;
    analysis: ResumeAnalysis;
    cached: boolean;
}

export interface RoadmapWeek {
    week: number;
    topic: string;
    skill_gap_addressed?: string;
    youtube_resources: string[];
    article_resources: string[];
    github_resources: string[];
    official_docs: string[];
    estimated_hours: number;
    mini_project: string;
    success_criteria?: string;
    why_it_matters?: string;
    completed?: boolean;
}

export interface MarketTrends {
    role: string;
    location: string;
    market_trend: string;
    salary_range: string | { min?: number; max?: number; currency?: string; formatted?: string };
    hiring_volume?: string;
    top_skills_freq?: { skill: string; frequency: number }[];
    hiring_companies?: { name: string; hiring_volume?: string }[];
    is_live?: boolean;
}

export interface LinkedInStrategy {
    headlines: string[];
    about_section: string;
    demanding_skills: string[];
    certifications: string[];
}

export interface FullAnalysisResponse {
    status: "success" | "partial_success" | "error";
    output: FullAnalysisOutput;
    logs: string[];
    errors: string[];
    metadata: Record<string, any>;
}

export interface InterviewMessage {
    role: "interviewer" | "candidate";
    content: string;
    timestamp?: string;
}
```

---

## 6. 🧠 **Agent Architecture Deep Dive**

### 🧭 **Agent Registry (registry.py)**

The Agent Registry is the **central LLM caller** for the entire backend. It implements:

1. **Unified Interface**: `call_llm()` is used by all agent modules
2. **Circuit Breaker Pattern**: Per-provider state tracking
3. **Fallback Chain**: Automatic provider rotation on failure
4. **Exponential Backoff**: `2^attempt` seconds between retries
5. **Pydantic Structured Output**: `_parse_structured()` for type-safe responses

#### **Architecture**

```mermaid
flowchart TD
    CALL["call_llm(system_prompt, user_content, provider, response_model)"]
    
    CALL --> RESOLVE["Resolve Provider<br/>• Check allow_google<br/>• Check circuit breaker<br/>• Build fallback chain"]
    
    RESOLVE --> ATTEMPT["Attempt Loop<br/>max_retries=3"]
    
    ATTEMPT --> DISPATCH["_dispatch(provider)<br/>Route to correct endpoint"]
    
    DISPATCH -->|"provider='nvidia'"| NVIDIA["_call_nvidia()<br/>integrate.api.nvidia.com"]
    DISPATCH -->|"provider='groq'"| GROQ["_call_groq()<br/>api.groq.com"]
    DISPATCH -->|"provider='google'"| GOOGLE["_call_google()<br/>generativelanguage.googleapis.com"]
    
    NVIDIA & GROQ & GOOGLE --> CHECK{"Success?"}
    
    CHECK -->|"✅ Yes"| PARSE["_parse_structured()<br/>Pydantic model_validate_json()"]
    CHECK -->|"❌ No"| FAIL["Record Failure<br/>cb['fails'] += 1"]
    
    FAIL --> TRIP{"fails >= 5?"}
    TRIP -->|"Yes"| OPEN["OPEN Circuit Breaker<br/>cooldown: 60s"]
    TRIP -->|"No"| RETRY{"retries < 3?"}
    
    RETRY -->|"Yes"| BACKOFF["exponential sleep<br/>2^attempt s"] --> ATTEMPT
    RETRY -->|"No"| FALLBACK{"Fallback<br/>provider?"}
    FALLBACK -->|"Yes"| ATTEMPT
    FALLBACK -->|"No"| NONE["Return None"]
    
    OPEN --> FALLBACK
    
    PARSE --> VALID{"Pydantic<br/>Valid?"}
    VALID -->|"✅"| RESET["Reset Circuit Breaker"]
    VALID -->|"❌"| RETRY
    
    RESET --> RETURN["Return dict"]
```

#### **Circuit Breaker Implementation**

```python
# Module-level circuit breaker state
_CIRCUIT_BREAKERS: Dict[str, dict] = {}

def _get_circuit_breaker(provider: str) -> dict:
    if provider not in _CIRCUIT_BREAKERS:
        _CIRCUIT_BREAKERS[provider] = {"fails": 0, "disabled_until": 0.0}
    return _CIRCUIT_BREAKERS[provider]

# State machine transitions:
# CLOSED (fails < 5) → OPEN (fails >= 5, disabled_until = now + 60s)
# OPEN → HALF_OPEN (60s elapses)
# HALF_OPEN → CLOSED (success) | OPEN (failure)
```

#### **Provider Dispatch Implementation**

```python
def _dispatch(provider: str, system_prompt: str, user_content: str, 
              model: Optional[str] = None, temperature: Optional[float] = None) -> str:
    if provider == "nvidia":
        return _call_nvidia(system_prompt, user_content, model, temperature)
    elif provider == "groq":
        return _call_groq(system_prompt, user_content, model, temperature)
    return _call_google(system_prompt, user_content, model, temperature)

def _call_nvidia(system_prompt: str, user_content: str, model: Optional[str], 
                 temperature: Optional[float]) -> str:
    model_name = model or settings.NVIDIA_MODEL  # "meta/llama-3.3-70b-instruct"
    temp = temperature or 0.7
    with httpx.Client(timeout=60.0) as client:
        resp = client.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"},
            json={
                "model": model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                "temperature": temp,
                "max_tokens": 2048,
            }
        )
    if resp.status_code != 200:
        raise ValueError(f"NVIDIA API {resp.status_code}: {resp.text}")
    return resp.json()["choices"][0]["message"]["content"]
```

### 🧠 **LangGraph Workflow (workflow.py)**

The **Career AI OS** uses LangGraph's `StateGraph` with a `TypedDict` state and parallel nodes.

#### **State Definition**

```python
class CareerState(TypedDict):
    # Inputs
    resume_text: str
    target_role: str
    location: str
    provider: Optional[str]
    
    # Outputs (set by nodes)
    resume_analysis: Optional[Dict[str, Any]]
    market_analysis: Optional[Dict[str, Any]]
    linkedin_strategy: Optional[Dict[str, Any]]
    roadmap: List[Dict[str, Any]]
    
    # Audit — Annotated with operator.add for parallel accumulation
    logs: Annotated[List[str], operator.add]
    errors: Annotated[List[str], operator.add]
    metadata: Dict[str, Any]
```

#### **Node Implementation Pattern**

```python
async def resume_node(state: CareerState) -> dict:
    logger.info("OS_NODE: Resume Analysis Starting")
    new_logs = [f"[{datetime.now().isoformat()}] Started Resume Analysis"]
    new_errors: List[str] = []
    
    # 1. Deterministic ATS (fast, no LLM)
    det_resume = analyze_resume_deterministically(state["resume_text"])
    
    # 2. LLM Analysis (with timeout protection)
    analysis = await asyncio.to_thread(
        run_resume_agent, state["resume_text"], det_resume, state.get("provider")
    )
    
    # 3. Pydantic Validation
    is_valid, err = validate_output(analysis, ResumeAnalysisModel)
    if not is_valid:
        new_errors.append(f"Resume validation failed: {err}")
        analysis = det_resume  # Fallback to deterministic
    
    return {
        "resume_analysis": analysis,
        "logs": new_logs,
        "errors": new_errors,
    }
```

#### **Graph Builder (DAG Definition)**

```python
def create_career_graph():
    workflow = StateGraph(CareerState)
    
    workflow.add_node("resume", resume_node)
    workflow.add_node("market", market_node)
    workflow.add_node("linkedin", linkedin_node)
    workflow.add_node("roadmap", roadmap_aggregator_node)
    
    # Parallel Start
    workflow.add_edge(START, "resume")
    workflow.add_edge(START, "market")
    
    # Fan-In: linkedin and roadmap wait for both resume and market
    workflow.add_edge("resume", "linkedin")
    workflow.add_edge("market", "linkedin")
    workflow.add_edge("resume", "roadmap")
    workflow.add_edge("market", "roadmap")
    
    # Parallel End
    workflow.add_edge("linkedin", END)
    workflow.add_edge("roadmap", END)
    
    return workflow.compile()
```

### 🤖 **Resume Agent (api/resume.py)**

#### **Resume Analysis Pipeline**

```
PDF Upload → 4-Layer Validation → pdfplumber Extraction → 
  Sanitization (injection protection) → Cache Check →
    [Miss] Deterministic ATS → LLM Analysis (NVIDIA→Groq) → Pydantic Validation →
    Save to DB → Return Analysis
```

#### **Deterministic ATS Engine (ats_engine.py, 556 lines)**

```python
def analyze_resume_deterministically(text: str) -> dict:
    text = clean_text(text)        # Null byte removal, whitespace normalization
    if is_garbage_text(text):      # OCR garbage detection (>20% non-printable)
        return {"technical_skills": [], "ats_score": 0, ...}
    
    skills = extract_skills(text)      # 80+ aliases → canonical names
    experience = estimate_experience(text)  # Date parsing + interval merging
    ats = calculate_ats_score(text, skills)  # 4-factor formula
    strengths = detect_strengths(skills, experience, ats["breakdown"])
    gaps = detect_skill_gaps(skills)  # Cloud, CI/CD, DB, System Design
    
    return {"technical_skills": skills, "years_of_experience": experience, ...}
```

#### **ATS Score Formula**

```
ATS Score = keywords(35) + achievements(30) + action_verbs(20) + formatting(15)
          
keywords     = min(len(skills_found) × 2, 35)
achievements = min(metric_count × 4, 30)
  metrics: /\b\d+(\.\d+)?%/, /\$\d+(,\d+)*(\.\d+)?/, /\b\d+[kKmMbB]\b/
action_verbs = min(unique_verb_count × 2, 20)
  verbs: {developed, engineered, built, designed, led, managed, created, ...}
formatting   = 15 if 1500-5000 chars, 10 if >5000, 5 if <1500
```

### 📈 **Market Agent (api/market.py)**

#### **Market Intelligence Pipeline**

```
Input (Role + Location + Seniority) → Role Classification → Region Mapping →
  Live Search (Tavily → Serper) → URL Classification → Deep Scraping →
  Deterministic Extraction → LLM Formatting (Groq, temp=0.2) →
  Merge LLM + Deterministic → MarketIntelligenceModel Validation →
  Save to DB → Return Report
```

#### **Market Service (core/market/service.py, 567 lines)**

```python
async def get_market_intelligence(role: str, location: str, 
                                   provider: Optional[str] = None,
                                   seniority: Optional[str] = None) -> dict:
    # 1. Role & seniority classification
    cls = classify_role(role)
    senior_level = (seniority or cls["seniority"]).lower()
    
    # 2. Live search context
    context = await get_live_context(role, location, senior_level)
    if not context:
        return _unavailable_market_response(...)
    
    # 3. Deterministic extraction
    metrics = extract_metrics_deterministic(context, role, location)
    
    # 4. LLM structured extraction
    llm_res = _llm_summary(role, location, context, active_provider)
    
    # 5. Merge with deterministic fallback
    return {
        "role": role, "location": location,
        "salary_range": llm_res.get("salary_range") or metrics["salary_range"],
        "market_trend": llm_res.get("market_trend") or metrics["market_trend"],
        "hiring_companies": llm_res.get("hiring_companies") or metrics["hiring_companies"],
        "is_live": True,
        ...
    }
```

### 🔗 **LinkedIn Agent (api/linkedin.py)**

```python
def run_linkedin_agent(role: str, resume_analysis: Optional[dict] = None,
                        market_analysis: Optional[dict] = None) -> dict:
    strengths = (resume_analysis or {}).get("top_strengths", [])
    gaps = (resume_analysis or {}).get("skill_gaps", [])
    market_trend = (market_analysis or {}).get("market_trend", "Standard demand")
    
    try:
        result = call_llm(
            system_prompt=_LINKEDIN_SYSTEM_PROMPT,
            user_content=f"TARGET ROLE: {role}\nSTRENGTHS: {json.dumps(strengths)}\n..."
            provider="groq",
            response_model=LinkedInStrategyModel,
        )
        return result if result else _get_fallback_linkedin_strategy(role, strengths, gaps)
    except Exception as e:
        return _get_fallback_linkedin_strategy(role, strengths, gaps)
```

---

## 7. ⚙️ **Core Services Deep Dive**

### 🗄️ **Database Module (core/database.py)**

```python
# PostgreSQL connection with Neon/Heroku compatibility
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

_is_sqlite = db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if _is_sqlite else {}

_pool_kwargs = {} if _is_sqlite else {
    "pool_size": 3,           # Render free = 512MB RAM
    "max_overflow": 5,
    "pool_timeout": 30,
    "pool_recycle": 300,      # 5min (Neon drops idle)
    "pool_pre_ping": True,    # Health check before use
}

engine = create_engine(db_url, connect_args=connect_args, echo=False, **_pool_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency — yields session, auto-closes on completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 🔐 **Security Module (core/security.py)**

```python
# Password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### 🚦 **Rate Limiter (core/rate_limit.py)**

```python
DAILY_LIMITS = {
    "interview":     {"limit": 1, "lock_48h": True},
    "resume":        {"limit": 3, "lock_48h": False},
    "roadmap":       {"limit": 1, "lock_48h": False},
    "full_analysis": {"limit": 1, "lock_48h": True},
    "linkedin":      {"limit": 4, "lock_48h": False},
    "market":        {"limit": 3, "lock_48h": False},
    "voice_assistant": {"limit": 2, "lock_48h": False},
}

def check_daily_limit(user_id: str | int, feature: str) -> None:
    if feature in ("interview", "full_analysis"):
        if redis_client:
            if redis_client.exists(f"usage_block:{user_id}:{feature}"):
                raise HTTPException(429, "This feature is locked for 48 hours.")
        else:
            block = _usage_block_fallback.get(str(user_id), {}).get(feature)
            if block and datetime.now(timezone.utc) < block["expires_at"]:
                raise HTTPException(429, "This feature is locked for 48 hours.")

    if feature not in DAILY_LIMITS:
        return

    limit = DAILY_LIMITS[feature]
    current = get_usage(user_id, feature)
    if current >= limit:
        raise HTTPException(429, f"Daily limit reached for {feature.replace('_', ' ').title()}.")
```

### 📦 **Configuration (core/config.py)**

```python
class Settings:
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")
    
    # ⚡ Groq (100% FREE)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # 🔵 Google Gemini
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash")
    
    # 🟢 NVIDIA NIM
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")
    
    # 🗄️ Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    
    # 🔐 Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # 🔍 Search APIs
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    SERPER_API_KEY: str = os.getenv("SERPER_API_KEY", "")
    
    # 🚀 App
    APP_ENV: str = os.getenv("APP_ENV", "development")
    CORS_ORIGINS: list = [origin.strip() for origin in 
        os.getenv("CORS_ORIGINS", "http://localhost:3000,https://ai-career-mentor.vercel.app").split(",")]
    
    def __init__(self):
        if self.APP_ENV == "production":
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("SQLite cannot be used in production!")
            if self.SECRET_KEY == "dev-secret-change-in-prod":
                raise ValueError("Default SECRET_KEY blocked in production!")
```

### 🔍 **Search Engine (core/search_engine.py, 405 lines)**

```python
# Domain Quality Weights
HIGH_QUALITY_DOMAINS = {
    "roadmap.sh": 40, "developer.mozilla.org": 40, "react.dev": 40,
    "nextjs.org": 40, "fastapi.tiangolo.com": 40, "kubernetes.io": 40,
    "docs.docker.com": 40, "github.com": 25, "freecodecamp.org": 20,
    "medium.com": 5, "dev.to": 5
}

def enrich_weeks_with_resources(weeks: list) -> list:
    """Enrich each roadmap week with curated learning resources."""
    for week in weeks:
        topic = week["topic"]
        
        # DuckDuckGo search
        results = ddgs.text(f"{topic} tutorial guide best practices", max_results=10)
        
        # Heuristic scoring
        scored = []
        for r in results:
            score = 0
            domain = extract_domain(r["href"])
            score += HIGH_QUALITY_DOMAINS.get(domain, 0)
            if "github.com" in r["href"] and r.get("stars", 0) > 100:
                score += 10
            if any(legacy in r["title"].lower() for legacy in ["angularjs", "class-components"]):
                score -= 20
            scored.append((score, r))
        
        # Sort and select top results
        scored.sort(key=lambda x: x[0], reverse=True)
        week["youtube_resources"] = [r["href"] for s, r in scored if s > 15][:3]
        week["article_resources"] = [r["href"] for s, r in scored if 5 <= s <= 15][:3]
    
    return weeks
```

### 📚 **RAG Service (core/rag_service.py, 197 lines)**

```python
class RAGService:
    def __init__(self, db_path: str = "./chroma_db"):
        self.mock_db = []  # In-memory fallback
        
        if CHROMA_AVAILABLE:
            try:
                self.client = chromadb.PersistentClient(path=db_path)
                self.collection = self.client.get_or_create_collection("resource_kb")
            except Exception:
                self.client = None  # Fallback to keyword matcher
    
    def auto_seed(self):
        """Load gold-standard curated resources into ChromaDB."""
        resources = json.load(open("data/curated_resources.json"))
        self.mock_db = resources
        
        if self.collection:
            texts = [f"Topic: {r['topic']} | Title: {r['title']}" for r in resources]
            metadatas = [{"topic": r["topic"], "youtube_url": r.get("youtube_url")} for r in resources]
            self.collection.add(documents=texts, metadatas=metadatas, 
                              ids=[f"res_id_{i}" for i in range(len(resources))])
    
    def query_similarity(self, query_text: str, n_results: int = 1) -> list:
        # 1. ChromaDB vector search (if available)
        if self.client:
            results = self.collection.query(query_texts=[query_text], n_results=n_results)
            # Format and return...
        
        # 2. Fallback keyword matcher
        scored = []
        for res in self.mock_db:
            score = sum(5 for word in res["topic"].lower().split() if word in query_text.lower())
            if score > 0:
                scored.append((score, res))
        scored.sort(key=lambda x: x[0], reverse=True)
        return scored[:n_results]
```

---

## 8. 🌐 **API Routes & Middleware**

### 🧭 **Route Map**

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/auth/register` | ❌ | Email/password registration |
| POST | `/auth/login` | ❌ | Email/password login |
| POST | `/auth/google` | ❌ | Google OAuth login |
| POST | `/auth/refresh` | ❌ | Refresh JWT token |
| POST | `/resume/upload` | ✅ | Upload PDF, extract text |
| POST | `/resume/analyze` | ✅ | Upload + AI analysis |
| POST | `/roadmap/generate` | ✅ | Generate 8-week roadmap |
| GET | `/roadmap/history` | ✅ | Fetch past roadmaps |
| PUT | `/roadmap/{id}/toggle-week/{n}` | ✅ | Toggle week completion |
| GET | `/roadmap/{id}/quiz/{n}` | ✅ | Get week quiz questions |
| GET | `/market/config` | ✅ | Get wizard config |
| GET | `/market/trends` | ✅ | Get market intelligence |
| GET | `/market/history` | ✅ | Fetch past market analyses |
| POST | `/career/full-analysis/stream` | ✅ | SSE streaming career analysis |
| POST | `/linkedin/optimize` | ✅ | Generate LinkedIn strategy |
| GET | `/interview/history` | ✅ | Fetch past interviews |
| GET | `/interview/{session_id}` | ✅ | Get interview details |
| WS | `/interview/ws/{session_id}` | ✅ | Mock interview WebSocket |
| WS | `/career/voice-assistant/ws` | ✅ | Anya voice WebSocket |
| GET | `/user/stats` | ✅ | Dashboard statistics |
| GET | `/health` | ❌ | Health check |
| GET | `/ping` | ❌ | Keep-alive ping |

### 🛡️ **Middleware Implementation**

```python
# CORS
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Request Logger
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"→ {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"← {response.status_code} ({time.time() - start_time:.3f}s)")
        return response
    except Exception as exc:
        logger.error(f"✗ {request.url.path} — {str(exc)}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})
```

### 📋 **Route Registration**

```python
app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
app.include_router(resume.router,    prefix="/resume",    tags=["Resume"], 
                   dependencies=[Depends(get_current_user)])
app.include_router(roadmap.router,   prefix="/roadmap",   tags=["Roadmap"],
                   dependencies=[Depends(get_current_user)])
app.include_router(market.router,    prefix="/market",    tags=["Market"],
                   dependencies=[Depends(get_current_user)])
app.include_router(career.router,    prefix="/career",    tags=["Career Full Analysis"],
                   dependencies=[Depends(get_current_user)])
app.include_router(linkedin.router,  prefix="/linkedin",  tags=["LinkedIn"],
                   dependencies=[Depends(get_current_user)])
app.include_router(user.router,      prefix="/user",      tags=["User"],
                   dependencies=[Depends(get_current_user)])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(voice_assistant.router, prefix="/career/voice-assistant", 
                   tags=["Voice Assistant"])
```

---

## 9. 🔌 **WebSocket Protocol Design**

### 🎤 **Interview WebSocket Protocol**

#### **Connection Setup**
```
Client → WS /interview/ws/{session_id}?role=SWE&company=Google&token=JWT
Server → {"type":"connected","session_id":"...","phase":"intro"}
```

#### **Message Flow** (7-Phase FSM)

| Phase | Server Sends | Client Sends | Duration |
|-------|-------------|--------------|:--------:|
| **intro** | `{"type":"question","phase":"intro","text":"..."}` | `{"type":"response","text":"..."}` | 2-3 min |
| **cs_fundamentals** | `{"type":"question","phase":"cs","text":"..."}` | `{"type":"response","text":"..."}` | 3-5 min |
| **leetcode** | `{"type":"question","phase":"leetcode","code_stub":"..."}` | `{"type":"code_update","code":"..."}` + `{"type":"response"}` | 10-15 min |
| **project_deepdive** | `{"type":"question","phase":"project","text":"..."}` | `{"type":"response","text":"..."}` | 3-5 min |
| **system_design** | `{"type":"question","phase":"design","text":"..."}` | `{"type":"response","text":"..."}` | 8-12 min |
| **company_domain** | `{"type":"question","phase":"domain","text":"..."}` | `{"type":"response","text":"..."}` | 3-5 min |
| **closing** | `{"type":"question","phase":"closing","text":"..."}` | `{"type":"response","text":"..."}` | 2-3 min |
| **feedback** | `{"type":"feedback","score":85,"summary":"..."}` | Close | Instant |

#### **State Machine Implementation**

```python
# core/interview/state.py

class Phase(Enum):
    INITIAL = 0
    INTRO = 1
    CS_FUNDAMENTALS = 2
    LEETCODE = 3
    PROJECT_DEEPDIVE = 4
    SYSTEM_DESIGN = 5
    COMPANY_DOMAIN = 6
    CLOSING = 7
    FEEDBACK = 8
    COMPLETED = 9

class InterviewStateMachine:
    VALID_TRANSITIONS = {
        Phase.INITIAL: [Phase.INTRO],
        Phase.INTRO: [Phase.CS_FUNDAMENTALS],
        Phase.CS_FUNDAMENTALS: [Phase.LEETCODE],
        Phase.LEETCODE: [Phase.PROJECT_DEEPDIVE],
        Phase.PROJECT_DEEPDIVE: [Phase.SYSTEM_DESIGN],
        Phase.SYSTEM_DESIGN: [Phase.COMPANY_DOMAIN],
        Phase.COMPANY_DOMAIN: [Phase.CLOSING],
        Phase.CLOSING: [Phase.FEEDBACK],
        Phase.FEEDBACK: [Phase.COMPLETED],
    }
    
    def transition_to(self, target: Phase):
        if target not in self.VALID_TRANSITIONS[self.current_phase]:
            raise ValueError(f"Invalid transition: {self.current_phase} → {target}")
        self.current_phase = target
```

### 🎙️ **Voice Assistant WebSocket Protocol**

#### **Connection Setup**
```
Client → WS /career/voice-assistant/ws?token=JWT
Server → {"type":"setup_complete","call_id":"uuid"}
```

#### **Bidirectional Audio Relay**

```
Client → Server: {"type":"audio","data":"base64_pcm_16khz_chunk"}
Server → Gemini: realtimeInput({"mediaChunks":[...]})
Gemini → Server: serverContent({"modelTurn":{"parts":[{"inlineData":...}]}})
Server → Client: {"type":"audio","data":"base64_pcm_24khz_chunk"}
Server → Client: {"type":"transcript","text":"..."}
```

#### **Audio Processing Pipeline**

```typescript
// Client-side (VoiceAssistant.tsx)
const AudioPipeline = {
  // Capture: 16kHz, 16-bit, mono PCM
  mic: await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } }),
  
  // Process: Silence detection + adaptive chunking
  processor: new AudioChunkProcessor({
    sampleRate: 16000,
    chunkDurationMs: 100,  // 100ms chunks
    silenceThreshold: 0.02,
  }),
  
  // Queue: Zero-jitter playback buffer
  queue: new AudioQueue({
    lookaheadMs: 200,      // Pre-buffer 200ms
    resampleTo: 24000,     // Gemini outputs 24kHz
  }),
  
  // Suppression: Mute mic during AI playback
  onPlaybackStart: () => mic.mute(),
  onPlaybackEnd: () => mic.unmute(),
};
```

---

## 10. 🗃️ **Database Design & Migrations**

### 📐 **Entity Relationship Summary**

| Entity | Table | PK | FKs | JSON Columns | Cascade |
|--------|-------|:---:|:---:|:------------:|:-------:|
| User | `users` | `id` (UUID) | — | — | — |
| Resume | `resumes` | `id` (UUID) | `user_id` | `parsed_content` | ✅ |
| Career Roadmap | `career_roadmaps` | `id` (UUID) | `user_id` | `steps` | ✅ |
| Market Analysis | `market_analyses` | `id` (UUID) | `user_id` | `analysis` | ✅ |
| Interview Session | `interview_sessions` | `id` (UUID) | `user_id` | `chat_history` | ✅ |
| Activity Log | `activity_logs` | `id` (UUID) | `user_id` | — | ✅ |

### 🔄 **Migration Strategy (Alembic)**

```bash
# Generate a new migration
alembic revision --autogenerate -m "add_market_analyses"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View history
alembic history
```

### 📊 **Alembic Configuration**

```ini
# alembic.ini
sqlalchemy.url = sqlite:///./dev.db  # Override in alembic/env.py

# alembic/env.py
from app.core.database import Base
from app.models.models import *  # Import all models
target_metadata = Base.metadata
```

### 🗃️ **Database Engine Configuration**

```python
# SQLite (development)
db_url = "sqlite:///./dev.db"
connect_args = {"check_same_thread": False}
_pool_kwargs = {}

# PostgreSQL (production via Neon)
db_url = "postgresql://user:pass@ep-xxx.neon.tech/neondb"
connect_args = {}
_pool_kwargs = {
    "pool_size": 3,
    "max_overflow": 5,
    "pool_timeout": 30,
    "pool_recycle": 300,      # 5 minutes (Neon drops idle connections)
    "pool_pre_ping": True,    # Verify connection health before use
}
```

---

## 11. 🧪 **Testing Strategy**

### 🏗️ **Test Architecture**

```mermaid
graph TD
    classDef unit fill:#818cf8,color:#fff
    classDef integ fill:#34d399,color:#fff
    classDef e2e fill:#f59e0b,color:#fff

    PYTEST["pytest (Python 3.11)"]
    
    PYTEST --> UNIT["🔬 Unit Tests (79 tests)"]
    PYTEST --> INTEG["🔗 Integration Tests (23 tests)"]
    
    subgraph UNIT [Unit Tests]
        U1["test_agents_registry.py (26)<br/>• parse_json()<br/>• escape control chars<br/>• circuit breaker states<br/>• fallback chains"]
        U2["test_roadmap_agents.py (24)<br/>• fallback structures<br/>• detail batching<br/>• week normalization"]
        U3["test_validation.py (14)<br/>• ATS score capping<br/>• coercion validators<br/>• required fields"]
        U4["test_ats_engine.py (5)<br/>• date range parsing<br/>• interval merging<br/>• skill extraction"]
        U5["test_market_service.py (5)<br/>• salary conversion<br/>• role classification<br/>• location mapping"]
        U6["test_gamified_roadmap.py (3)<br/>• week completion<br/>• quiz generation"]
        U7["test_linkedin.py (2)<br/>• fallback strategy<br/>• model structures"]
    end
    
    subgraph INTEG [Integration Tests]
        I1["test_main.py (9)<br/>• auth endpoints<br/>• rate limiting<br/>• JWT lifecycle"]
        I2["test_features.py (8)<br/>• market scraper<br/>• TTS audio<br/>• search algorithms"]
        I3["test_voice_assistant.py (3)<br/>• WS auth flow<br/>• Gemini config"]
    end

    class U1,U2,U3,U4,U5,U6,U7 unit
    class I1,I2,I3 integ
```

### 🏃 **Running Tests**

```bash
# All tests (102)
cd backend
PYTHONPATH=. python -m pytest tests/ -v

# With coverage report
pip install pytest-cov
PYTHONPATH=. python -m pytest tests/ --cov=app --cov-report=html

# Watch mode (re-run on changes)
pip install pytest-watch
ptw tests/
```

### 📊 **Key Test Patterns**

```python
# Pattern 1: Circuit Breaker State Test
def test_circuit_breaker_trips_after_5_failures():
    for _ in range(5):
        call_llm(system_prompt="test", user_content="test", provider="failing")
    assert _get_circuit_breaker("failing")["disabled_until"] > time.time()

# Pattern 2: ATS Score Capping
def test_ats_score_capped_at_100():
    result = ResumeAnalysisModel(ats_score=150)
    assert result.ats_score == 100

# Pattern 3: Experience Interval Merging
def test_experience_overlap_merging():
    text = """Jan 2020 - Dec 2022, Company A
              Jun 2021 - Present, Company B"""
    assert estimate_experience(text) == pytest.approx(6.1, rel=0.1)

# Pattern 4: Fallback Chain
def test_fallback_to_groq_when_nvidia_fails():
    result = run_resume_agent("resume text", {}, provider="nvidia")
    assert result is not None  # Falls back to deterministic data
```

---

## 12. 🐳 **Docker & Deployment**

### 🐳 **Docker Compose Architecture**

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
    depends_on: [redis]
    volumes:
      - chroma_data:/app/chroma_db
  
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
  
  redis:
    image: redis:alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

volumes:
  chroma_data:
```

### 🏗️ **Dockerfiles**

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

### ☁️ **Production Deployment**

| Service | Platform | Configuration |
|---------|----------|---------------|
| **Frontend** | Vercel | Auto-deploy from `main` branch, `NEXT_PUBLIC_API_URL` env |
| **Backend** | Render | Docker container, auto-deploy from `main`, health check `/ping` |
| **Database** | Neon (PostgreSQL) | Serverless, connection pooling, auto-pause on idle |
| **Cache** | Upstash (Redis) | Serverless, REST API, 100MB free tier |

### 🔄 **Deployment Pipeline**

```
git push origin main → GitHub Actions →
  ├── Frontend: npm ci → ESLint → Next.js Build → ✅ → Vercel Deploy
  └── Backend:  pip install → pytest (102) → pip-audit → ✅ → Render Deploy
```

---

## 13. 🔒 **Security Architecture**

### 🛡️ **Security Layers**

```mermaid
flowchart TD
    REQ["Incoming Request"]
    
    L1["🔴 Layer 1: Network<br/>• HTTPS (TLS 1.3)<br/>• CORS whitelist"]
    L2["🟠 Layer 2: Rate Limiting<br/>• SlowAPI (global)<br/>• Custom (per-feature)"]
    L3["🟡 Layer 3: Authentication<br/>• JWT (60min)<br/>• Refresh Token (30d)<br/>• Google OAuth 2.0"]
    L4["🟢 Layer 4: Authorization<br/>• get_current_user()<br/>• WebSocket token check"]
    L5["🔵 Layer 5: Input Validation<br/>• Pydantic schemas<br/>• PDF validation (4 checks)<br/>• Prompt injection defense"]
    L6["🟣 Layer 6: Production Guards<br/>• SQLite blocked<br/>• Default secret blocked<br/>• OOM prevention"]
    L7["⚪ Layer 7: Error Handling<br/>• Safe logging (loguru)<br/>• Graceful degradation"]
    
    REQ --> L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> HANDLER["Route Handler"]

    style REQ fill:#1e1e2e,color:#fff
    style HANDLER fill:#34d399,color:#fff
```

### 🔐 **Authentication Flow**

```python
# JWT Token Verification (FastAPI dependency)
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(status_code=401, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
```

### 🛡️ **Prompt Injection Defenses**

```python
def sanitize_resume_text(text: str) -> str:
    """4-layer sanitization for AI prompt injection prevention."""
    if not text:
        return ""
    text = text.replace("{", "")          # Layer 1: Strip JSON brackets
    text = text.replace("}", "")          
    text = text.replace("```", "")        # Layer 2: Strip code blocks
    text = " ".join(text.split())         # Layer 3: Normalize whitespace
    text = text[:6000]                    # Layer 4: Hard truncate
    return text.strip()
```

### ✅ **PDF Validation (4 Checks)**

```python
async def _read_validated_pdf(file: UploadFile) -> bytes:
    # Check 1: Extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted.")
    # Check 2: MIME type
    if file.content_type not in ALLOWED_PDF_MIME_TYPES:
        raise HTTPException(400, "Invalid file type.")
    # Check 3: Size limit (5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 5 MB.")
    # Check 4: Magic bytes
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(400, "Invalid PDF content.")
    return contents
```

---

## 14. 📈 **Performance & Optimization**

### ⚡ **Latency Optimization**

| Optimization | Technique | Impact |
|-------------|-----------|:------:|
| **Parallel DAG** | LangGraph fan-out (Resume + Market in parallel) | ~60% reduction in total pipeline time |
| **LLM Selection** | Groq (~200ms first token) for speed-critical tasks | 2-4x faster than alternatives |
| **Response Caching** | Redis-based cache for resume, roadmap, LinkedIn | 0ms for repeated requests |
| **Async I/O** | `asyncio.to_thread()` for blocking LLM calls | Non-blocking event loop |
| **Batch Processing** | Roadmap detail generation in (3+3+2) chunks | Reduces API rate limit pressure |
| **Connection Pooling** | PgBouncer with Neon (pool_size=3) | Eliminates connection overhead |
| **In-Memory Fallback** | Redis down → dict() fallback | Zero downtime for rate limiting |

### 📊 **Caching Strategy**

| Cache Key Pattern | TTL | Storage | Invalidation |
|------------------|:---:|---------|:------------:|
| `resume_v3:{hash}` | 1 hour | Redis | On re-upload |
| `roadmap:{role}:{gaps}` | 24 hours | Redis | On regeneration |
| `linkedin_opt_v3:{role}` | 24 hours | Redis | On re-optimization |
| `usage:{uid}:{feature}:{date}` | 24 hours | Redis | Auto-expiry |

### 🧠 **Memory Optimization**

```python
# OOM Prevention — Auto-disable ChromaDB on Render (512MB RAM)
if os.environ.get("RENDER") or os.environ.get("DISABLE_CHROMA") == "true":
    CHROMA_AVAILABLE = False
    logger.info("ChromaDB disabled: 512MB RAM environment")
```

### 📦 **Data Size Limits**

| Item | Max Size | Enforcement |
|------|:--------:|:-----------:|
| Resume PDF | 5 MB | `_read_validated_pdf()` |
| Resume text | 6,000 chars | `sanitize_resume_text()` |
| ATS engine input | 15,000 chars | `clean_text()` |
| LLM tokens | 2,048 output | `max_tokens` parameter |
| Roadmap weeks | 8 | `_build_validated_weeks()` |
| SQLite (dev) | Unlimited | Local only |
| PostgreSQL (prod) | 500 MB (Neon free) | External managed |

---

## 15. 🔄 **State Management Patterns**

### 🧠 **LangGraph State (Backend)**

#### **CareerState TypedDict**

```python
class CareerState(TypedDict):
    # Immutable inputs (set once at start)
    resume_text: str
    target_role: str
    location: str
    provider: Optional[str]
    
    # Mutable outputs (accumulated by nodes)
    resume_analysis: Optional[Dict[str, Any]]    # Set by resume_node
    market_analysis: Optional[Dict[str, Any]]    # Set by market_node
    linkedin_strategy: Optional[Dict[str, Any]]  # Set by linkedin_node
    roadmap: List[Dict[str, Any]]                 # Set by roadmap_aggregator
    
    # Accumulated audit trail
    logs: Annotated[List[str], operator.add]      # Parallel-safe append
    errors: Annotated[List[str], operator.add]    # Parallel-safe append
    metadata: Dict[str, Any]                      # Final summary
```

#### **State Flow**

```
START → {resume_text, target_role, location, provider}
  └─ resume_node → {resume_analysis, logs+=[...]}
  └─ market_node → {market_analysis, logs+=[...]}
  └─ linkedin_node → {linkedin_strategy, logs+=[...]}
  └─ roadmap_aggregator → {roadmap, logs+=[...], metadata}
END → Full state dict
```

### ⚛️ **React State (Frontend)**

```typescript
// Custom hook pattern for API calls
function useCareerAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    logs: [],
    result: null,
    error: null,
  });
  
  const startAnalysis = useCallback(async (request: FullAnalysisRequest) => {
    setState(s => ({ ...s, status: 'loading' }));
    
    const eventSource = new EventSource(`/career/full-analysis/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setState(s => ({ ...s, logs: [...s.logs, data.message] }));
      } else if (data.type === 'result') {
        setState(s => ({ ...s, status: 'success', result: data.payload }));
        eventSource.close();
      } else if (data.type === 'error') {
        setState(s => ({ ...s, status: 'error', error: data.message }));
        eventSource.close();
      }
    };
  }, []);
  
  return { state, startAnalysis };
}
```

---

## 16. 🚦 **Error Handling & Logging**

### 📝 **Logging Configuration**

```python
# app/main.py — Configured at startup
from loguru import logger

# Structured JSON logging for production
logger.add("logs/error.log", rotation="1 day", level="ERROR", format="{time} | {level} | {message}")
logger.add("logs/app.log", rotation="1 day", level="INFO", format="{time} | {level} | {name} | {message}")
```

### 🚦 **Error Handling Patterns**

```python
# Pattern 1: Graceful LLM Degradation
try:
    result = call_llm(system_prompt, user_content, provider="nvidia")
except Exception as e:
    logger.warning(f"NVIDIA failed: {e}. Using deterministic fallback.")
    result = deterministic_data  # Graceful fallback

# Pattern 2: Circuit Breaker Safety
if time.time() < cb["disabled_until"]:
    logger.warning(f"Circuit breaker OPEN for [{provider}]. Skipping.")
    return None  # Caller handles None gracefully

# Pattern 3: DB Transaction Safety
try:
    db.add(record)
    db.commit()
except Exception as e:
    db.rollback()
    logger.error(f"DB error: {e}")
    # Continue — record is optional

# Pattern 4: Async Timeout Safety
try:
    analysis = await asyncio.wait_for(
        asyncio.to_thread(run_resume_agent, text, data),
        timeout=120  # 2-minute hard limit
    )
except asyncio.TimeoutError:
    raise HTTPException(504, "Analysis timed out.")
```

### 📋 **Error Response Format**

```json
// Standard error response
{
  "detail": "Human-readable error message"
}

// Rate limit error
{
  "detail": "Daily limit reached for resume analysis."
}

// Validation error
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error"
    }
  ]
}
```

---

## 17. 🧬 **LLM Integration Patterns**

### 📐 **Provider Configuration**

```python
# Each provider has a dispatch function with consistent interface:
def _call_<provider>(system_prompt: str, user_content: str, 
                     model: Optional[str], temperature: Optional[float]) -> str:
    """Returns raw response text."""
    ...
```

### 📊 **Model Routing Rules**

| Workflow | Primary | Reason | Fallback | allow_google |
|----------|---------|--------|----------|:------------:|
| Resume Analysis | NVIDIA NIM | Structured output quality | Groq | ❌ |
| Market Intelligence | Groq | Speed (~200ms) | NVIDIA | ❌ |
| LinkedIn Strategy | Groq | Speed + JSON reliability | NVIDIA | ❌ |
| Roadmap Structure | Google Gemini | Creative quality | Groq → NVIDIA | ✅ |
| Mock Interview | NVIDIA NIM | Session stability | None | ❌ |
| Voice Coach | Gemini Live | Multimodal required | None | N/A |
| Assessment Quiz | NVIDIA NIM | Deterministic output | Offline fallback | ❌ |

### 🔗 **Response Parsing Chain**

```python
def _parse_structured(response_text: str, response_model: Type[BaseModel]) -> dict:
    # Step 1: Strip markdown code fences
    clean = re.sub(r"```(?:json)?\s*(.*?)\s*```", r"\1", response_text, flags=re.DOTALL)
    
    # Step 2: Find outermost JSON object/array
    start, end = clean.find("{"), clean.rfind("}")
    if start != -1 and end > start:
        clean = clean[start:end+1]
    
    # Step 3: Escape control characters
    clean = escape_json_string_control_chars(clean)
    
    # Step 4: Pydantic validation
    parsed = response_model.model_validate_json(clean)
    return parsed.model_dump()
```

### ⚡ **JSON Control Character Escape**

```python
def escape_json_string_control_chars(s: str) -> str:
    """Escapes ASCII control characters (0-31) inside JSON string literals."""
    result = []
    in_string = False
    escape = False
    for char in s:
        if char == '"':
            if not escape:
                in_string = not in_string
            result.append(char)
        elif char == '\\':
            escape = not escape
            result.append(char)
        else:
            if in_string and ord(char) < 32:
                if char == '\n': result.append('\\n')
                elif char == '\t': result.append('\\t')
                elif char == '\r': result.append('\\r')
                else: result.append(f"\\u{ord(char):04x}")
            else:
                result.append(char)
    return "".join(result)
```

---

## 18. 📊 **Observability & Monitoring**

### 🏥 **Health Check Endpoints**

```python
# GET /health — Full health check
@app.get("/health")
async def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return {
        "status": "ok",
        "database": db_status,
        "service": "AI Career Mentor",
        "version": "1.0.0",
        "provider": settings.LLM_PROVIDER,
        "model": settings.active_model,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

# GET /ping — Lightweight keepalive (for Render free tier cron)
@app.get("/ping")
async def ping():
    return {"pong": True}
```

### 📋 **Startup Validation**

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 50)
    logger.info("🚀 AI Career Mentor API starting...")
    logger.info(f"   Provider : {settings.LLM_PROVIDER.upper()} ({settings.active_model})")
    logger.info(f"   API Key  : {'✅ Set' if settings.is_configured else '❌ NOT SET!'}")
    logger.info(f"   Docs     : http://localhost:8000/docs")
    logger.info("=" * 50)
    
    if not settings.is_configured:
        raise ValueError(f"Missing API Key for {settings.LLM_PROVIDER}")
    
    # Auto-seed RAG engine
    try:
        rag_engine.auto_seed()
    except Exception as e:
        logger.error(f"RAG auto-seed failed: {e}")
    
    yield
    logger.info("🛑 API shutting down.")
```

### 📊 **Request Logging Middleware**

```python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    
    start_time = time.time()
    logger.info(f"→ {request.method} {request.url.path} | Origin: {request.headers.get('origin', 'N/A')}")
    
    try:
        response = await call_next(request)
        logger.info(f"← {response.status_code} {request.url.path} ({time.time() - start_time:.3f}s)")
        return response
    except Exception as exc:
        logger.error(f"✗ {request.url.path} — {str(exc)}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})
```

### 📈 **Key Metrics to Monitor**

| Metric | Source | Alert Threshold |
|--------|--------|:---------------:|
| LLM API Latency | Request timing | > 30s on p95 |
| LLM Error Rate | Circuit breaker trips | > 10% per hour |
| DB Connection Pool | SQLAlchemy engine | > 80% utilization |
| Cache Hit Ratio | Redis metrics | < 20% |
| Rate Limit Hits | SlowAPI counters | > 100/day per IP |
| WebSocket Connections | Active sessions | > 50 concurrent |
| API Response Time | Request logger | > 5s on p99 |

---

## 19. 🔮 **Future Architecture Roadmap**

### 🚀 **Planned Improvements**

| Priority | Feature | Description | Impact |
|:--------:|---------|-------------|:------:|
| 🔴 P0 | **Dynamic Supervisor Agent** | Replace static DAG with LLM-driven routing in LangGraph | Adaptive workflow optimization |
| 🔴 P0 | **WebSocket Auth Refactor** | Make interview WS depend on `get_current_user` | Consistent auth pattern |
| 🟡 P1 | **Async SQLAlchemy** | Switch to `asyncpg` + `SQLAlchemy async` engine | Non-blocking DB queries |
| 🟡 P1 | **Comprehensive E2E Tests** | Add Playwright browser tests, full pipeline integrations | 200+ test coverage |
| 🟡 P1 | **Serverless Workers** | Offload LLM calls to Celery/Redis task queue | Background processing |
| 🟢 P2 | **User Feedback Loop** | Add ratings, corrections, and re-training data collection | Continuous improvement |
| 🟢 P2 | **Model Fine-tuning** | Fine-tune a small LLM on curated career data | Lower latency, lower cost |
| 🟢 P2 | **Multi-language Support** | Add Hindi, Spanish, and other language prompts | Broader user base |
| ⚪ P3 | **GraphQL API** | Add GraphQL endpoint for flexible data queries | Frontend flexibility |
| ⚪ P3 | **Admin Dashboard** | Usage analytics, model performance, user management | Operational visibility |

### 🧭 **Architecture Evolution**

```
Current (v1): Static DAG + Fan-Out/Fan-In
  ↓
Next (v2): Dynamic Supervisor Agent (LLM chooses routing)
  ↓
Future (v3): Multi-Agent Swarm (microservices with message queue)
```

---

<div align="center">

---

**Built with 🧠 by [Anil Pradhan](https://github.com/Anil-Pradhan-web)**

| 🏷️ Tag | 🏷️ Tag | 🏷️ Tag | 🏷️ Tag | 🏷️ Tag |
|---------|---------|---------|---------|---------|
| `#LangGraph` | `#NVIDIANIM` | `#GoogleOAuth` | `#RAG` | `#ChromaDB` |
| `#FastAPI` | `#NextJS` | `#Groq` | `#Gemini` | `#GeminiLive` |
| `#WebSocket` | `#VoiceAI` | `#Pytest` | `#Docker` | `#CI/CD` |

---

</div>