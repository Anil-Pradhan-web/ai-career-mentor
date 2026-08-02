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

<a id="1-project-overview"></a>
## 1. 📋 **Project Overview**

### 🎯 **Purpose**

AI Career Mentor is a **production-grade, full-stack career coaching platform** built around **2 core AI pillars**: (1) **Full Career Analysis** (Resume, RAG Roadmap, Live Market Scraper, LinkedIn Optimization) using a LangGraph parallel DAG, and (2) **Streaming Technical Mock Interviewer** using a 7-Phase FSM. It combines **rule-based deterministic engines**, **LLM-powered analysis**, **real-time WebSocket communication**, and **RAG-enriched resource recommendations** into a unified dashboard.

### 📐 **Design Philosophy**

| Principle | Implementation |
|-----------|---------------|
| **⚡ Hybrid AI** | Rule-based engines (ATS scoring) + LLMs (strategy generation) = accuracy + intelligence |
| **🛡️ Defense in Depth** | Every AI workflow has 2-3 LLM fallback providers + deterministic/programmatic fallback |
| **⚡ Real-Time First** | WebSocket for interviews + voice, SSE for streaming analysis |
| **📦 Modular Monolith** | Clear separation of concerns without microservice complexity |
| **🔌 Protocol Diversity** | REST (CRUD) + SSE (streaming) + WebSocket (real-time bidirectional) |
| **🧪 Test-Infected** | 114 tests covering all critical paths with mock-free integrations |

### 🌟 **Core Capabilities**

| # | Workflow | Protocol | Engine | Fallback Strategy |
|---|----------|----------|--------|-------------------|
| 1 | **Resume Intelligence** | REST | Deterministic ATS + LLM | LLM → Deterministic → Default |
| 2 | **Career Roadmap Builder** | REST | LangGraph + Groq/NVIDIA/Cerebras + RAG | Cerebras → Groq → NVIDIA → Programmatic |
| 3 | **Market Explorer** | REST | Tavily/Serper Search + Groq/Cerebras | Groq → Cerebras → NVIDIA → Offline Mock |
| 4 | **LinkedIn Optimizer** | REST | Cerebras + Programmatic Fallback | Cerebras → Groq → NVIDIA → Deterministic Strategy |
| 5 | **Mock Interview Engine** | WebSocket | 7-Phase FSM + Groq/NVIDIA NIM | Groq to NVIDIA (no Google) |
| 6 | **Voice Coach (Anya)** | WebSocket | Gemini Live Multimodal | Gemini Live only (no fallback) |
| 7 | **Full Career Analysis** | SSE Stream | LangGraph + Groq/NVIDIA/Cerebras | Parallel multi-agent pipeline orchestrator |

---

<a id="2-system-architecture-overview"></a>
## 2. 🏗️ **System Architecture Overview**

> [!NOTE]
> Please refer to [**ARCHITECTURE.md**](./ARCHITECTURE.md) for the comprehensive layout of system boundaries, request lifecycles, LangGraph orchestration models, and database Entity Relationship diagrams. That document contains the detailed Mermaid graphs illustrating system topology, LangGraph workflow execution, mock interview FSM state transitions, and client-server request lifecycles.

### 🧭 **Architecture Layers Walkthrough**

1. **🌐 Client Presentation Layer (Next.js 14):**
   * **App Router Console:** Renders static pages server-side for speed and SEO, and client-side dashboards using React 18 SPA mechanics for dynamic interactions.
   * **Voice Assistant Client:** Captures user voice inputs via the browser's `navigator.mediaDevices` API at 16kHz mono PCM, base64-encodes them, and streams them over a live WebSocket. It decodes incoming 24kHz audio chunks for instant playback.
   * **Interactive Monaco Editor Interface:** Emits code editor modifications (syntactic inputs, line lengths) to sync coding states with the backend interview evaluator node.

2. **⚡ ASGI Gateway & Security Layer (FastAPI + Uvicorn):**
   * **Uvicorn Daemon:** Executes the FastAPI application using asynchronous ASGI loops, handling long-running WebSocket channels and Server-Sent Events (SSE) without blocking.
   * **Middleware Pipeline:** Matches CORS configurations securely, logs request metadata, checks client IPs against sliding-window token buckets backended by Upstash Redis, and decodes Jose JWT signature scopes to attach user metadata.

3. **🧠 AI Orchestration & Inference Layer:**
   * **LangGraph Orchestrator:** Models parallel operations as a directed acyclic graph (DAG). It schedules parallel parsing loops (Resume and Market scrapers), fanning back in to feed LinkedIn optimizations and week-by-week roadmaps.
   * **Agent Registry:** A registry of prompt instructions, temperature configurations, and LLM providers. Built-in circuit breakers handle failed API calls, automatically routing traffic from Groq/Cerebras to NVIDIA NIM.
   * **Deterministic ATS Evaluator:** Audits resumes deterministically checking spelling, active verbs, numeric impact measurements, and 120+ skill categories before running LLM refinement nodes.
   * **Local RAG Service:** Integrates ChromaDB vector search running the `all-MiniLM-L6-v2` transformer model locally via the **ONNX Runtime** library, ensuring embedding calculations remain offline, fast, and free.

4. **🤖 LLM Provider Pool:**
   * **Cerebras Cloud:** Resolves high-throughput JSON generation tasks (roadmap structures, LinkedIn optimizations) under sub-second latencies using the Llama 3.3 models.
   * **Groq Cloud:** Drives stateful coding evaluations and mock interview sessions using Llama 3.3 speculative decoding models.
   * **NVIDIA NIM:** Drives backup evaluations and mock interview sessions using Llama 3.3 Instruct models.
   * **Google Gemini Live:** Connects via full-duplex WebSockets to the `gemini-2.5-flash-native-audio-latest` model to drive Anya, the voice career mentor.

5. **🗃️ Persistence & Cache Layer:**
   * **Serverless PostgreSQL (Neon):** Houses relational models (Users, Roadmaps, Analyses, Sessions) using PgBouncer connection pooling to control connection handshakes.
   * **Upstash Redis:** Tracks daily rate limit counters, temporary lock records (preventing race conditions during multi-agent calls), and user-activity caches.

### 📊 **Data Flow Patterns Summary**

The system coordinates different network communication channels depending on the latency requirements of each feature:

| Pattern | Used In | Description |
|---------|---------|-------------|
| **Request-Response (REST)** | All REST endpoints | Synchronous CRUD operations (e.g. auth, settings, history delete) |
| **Server-Sent Events (SSE)** | `/career/full-analysis/stream` | Server pushes live graph execution logs & incremental milestone data |
| **Full-Duplex (WebSocket)** | `/interview/ws/*`, `/career/voice-assistant/ws` | Bidirectional real-time communication (voice streams or Monaco editor sync) |
| **Fan-Out/Fan-In** | LangGraph DAG | Parallel node execution (Resume audit & Market search concurrently) |
| **Fallback Chain** | Agent Registry / Config Manager | Primary provider $\to$ Secondary provider $\to$ Fallback provider $\to$ Offline local backup |
| **Cache-Aside** | Resume, LinkedIn, Roadmap | Redis verification $\to$ Miss $\to$ Invoke LLM model $\to$ Save to cache |

### 📡 **Communication Protocol Matrix**

* **REST (JSON):** Used for lightweight CRUD operations where requests complete in under 500ms. All routes except `/auth/` endpoints require a valid JWT header token.
* **Server-Sent Events (SSE):** Ideal for long-running workflows (like the 60-second Full Career Analysis). The backend pushes real-time status updates (e.g., `[Resume Node] Audit completed...`, `[Market Node] Scraping salary benchmarks...`) before returning the final combined result object.
* **WebSockets (Full-Duplex):** Powers low-latency features (Anya Voice Assistant and Mock Coding Interviews). It allows audio data (PCM streams) and text state synchronizations to pass back and forth concurrently without HTTP overhead.

---

<a id="3-backend-structure--module-map"></a>
## 3. 🗂️ **Backend Structure & Module Map**

Please refer to `ARCHITECTURE.md` Section 3 for the visual backend module dependency graph. All core services map as a modular monolith structure designed for simple scalability.

---

<a id="4-frontend-structure--module-map"></a>
## 4. 🗂️ **Frontend Structure & Module Map**

### 🌐 **Client-Server Data Flow**

```
User Action → React Component → Service Function → client.ts (Axios) →
  → JWT Attach → HTTP Request → FastAPI → Middleware → Handler → Response →
  → Axios Interceptor → Service → Component State → UI Update
```

### 🔐 **Axios Interceptor Chain**

Configured in [client.ts](file:///c:/Users/ANIL/Desktop/ai-career-mentor/frontend/src/services/client.ts) to automatically handle authentication token injection, token refresh requests, and global limit notifications:

```typescript
// client.ts — Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// client.ts — Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const freshTokens = await authService.refreshToken();
        localStorage.setItem('token', freshTokens.access_token);
        originalRequest.headers.Authorization = `Bearer ${freshTokens.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 429) {
      toast.error(error.response.data.detail || 'Daily rate limit reached.');
    }
    return Promise.reject(error);
  }
);
```

---

<a id="5-data-models--schemas-deep-dive"></a>
## 5. 📦 **Data Models & Schemas Deep Dive**

### 🗃️ **SQLAlchemy ORM Models**

Defined in [models.py](file:///c:/Users/ANIL/Desktop/ai-career-mentor/backend/app/models/models.py):

```python
# app/models/models.py

class User(Base):
    __tablename__ = "users"
    
    id         = Column(String, primary_key=True, default=_uuid)
    email      = Column(String, unique=True, nullable=False, index=True)
    name       = Column(String, nullable=False)
    hashed_pw  = Column(String, nullable=True)   # Null for Google OAuth users
    created_at = Column(DateTime(timezone=True), default=_now)
    
    resumes            = relationship("Resume",           back_populates="user", cascade="all, delete")
    roadmaps           = relationship("CareerRoadmap",    back_populates="user", cascade="all, delete")
    market_analyses    = relationship("MarketAnalysis",   back_populates="user", cascade="all, delete")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete")
    activity_logs      = relationship("ActivityLog",      back_populates="user", cascade="all, delete")
    career_analyses    = relationship("CareerAnalysis",   back_populates="user", cascade="all, delete")

class Resume(Base):
    __tablename__ = "resumes"
    
    id             = Column(String, primary_key=True, default=_uuid)
    user_id        = Column(String, ForeignKey("users.id"), nullable=False)
    filename       = Column(String, nullable=False)
    parsed_content = Column(JSON, nullable=True)             # Full parsed gaps analysis
    raw_text       = Column(Text, nullable=True)             # Extracted plain text
    uploaded_at    = Column(DateTime(timezone=True), default=_now)
    
    user = relationship("User", back_populates="resumes")

class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"
    
    id          = Column(String, primary_key=True, default=_uuid)
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    target_role = Column(String, nullable=False)
    steps       = Column(JSON, nullable=True)       # Custom 8-week schedule array
    created_at  = Column(DateTime(timezone=True), default=_now)
    
    user = relationship("User", back_populates="roadmaps")

class CareerAnalysis(Base):
    __tablename__ = "career_analyses"

    id              = Column(String, primary_key=True, default=_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False)
    target_role     = Column(String, nullable=False)
    location        = Column(String, nullable=False)
    resume_analysis = Column(JSON, nullable=True)
    market_analysis = Column(JSON, nullable=True)
    roadmap         = Column(JSON, nullable=True)
    linkedin_strategy = Column(JSON, nullable=True)
    created_at      = Column(DateTime(timezone=True), default=_now)

    user = relationship("User", back_populates="career_analyses")
```

### ✅ **Pydantic Validation Models**

Defined in [validation.py](file:///c:/Users/ANIL/Desktop/ai-career-mentor/backend/app/models/validation.py):

```python
# app/models/validation.py

class ResumeAnalysisModel(BaseModel):
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
    role: str = Field(default="")
    location: str = Field(default="")
    salary_range: Dict[str, Any] = Field(default_factory=dict)
    market_trend: str = Field(default="")
    hiring_volume: str = Field(default="")
    hiring_companies: List[Dict[str, str]] = Field(default_factory=list)
    top_skills_freq: List[Dict[str, Any]] = Field(default_factory=list)
```

---

<a id="6-agent-architecture-deep-dive"></a>
## 6. 🧠 **Agent Architecture Deep Dive**

### 🧭 **Unified LLM Dispatcher (registry.py)**

The LLM caller configuration in [registry.py](file:///c:/Users/ANIL/Desktop/ai-career-mentor/backend/app/agents/registry.py) enforces fallback loops and circuit breaker transitions:

```python
# app/agents/registry.py

_CIRCUIT_BREAKERS: Dict[str, dict] = {}

def _get_circuit_breaker(provider: str) -> dict:
    if provider not in _CIRCUIT_BREAKERS:
        _CIRCUIT_BREAKERS[provider] = {"fails": 0, "disabled_until": 0.0}
    return _CIRCUIT_BREAKERS[provider]

def _dispatch(provider: str, system_prompt: str, user_content: str, 
              model: Optional[str] = None, temperature: Optional[float] = None):
    # Route all text generations based on manager provider selection
    if provider == "nvidia":
        return _call_nvidia(system_prompt, user_content, model, temperature)
    elif provider == "cerebras":
        return _call_cerebras(system_prompt, user_content, model, temperature)
    return _call_groq(system_prompt, user_content, model, temperature)
```

### 🎯 **Role Category Adaptation**

The FSM dynamically adjusts mock interview questions based on the candidate's target role category:
* **Software Engineer:** Deep theory queries (Data structures, algorithms, databases, OS internals, OOP design), Monaco LeetCode Medium/Hard challenges, web-scale System Design whiteboard scenarios.
* **Data / AI / ML:** Machine learning algorithms, statistics, model evaluation metrics, ML pipeline architectures.
* **Infrastructure / Cloud:** Containers, CI/CD pipelines, Cloud architectures (AWS/GCP), IaC, Kubernetes configurations.
* **Security:** Cryptography, application security filters, penetration testing case studies.
* **Product / Design:** Metric definitions, product strategy, UX case studies.
* **Gaming:** Physics, game loops, game graphics pipeline architectures.

### 📋 **Phase Configuration Details**

The interview state machine operates on a strict unidirectional sequence:

| Phase | Name | Duration | Questions | Evaluation Criteria |
|:----:|------|:--------:|:---------:|-------------------|
| 0 | **INITIAL** | Instant | — | Session initialization and role setup |
| 1 | **INTRO** | 2-3 min | 2-3 | Self-presentation, background fit, communication |
| 2 | **CORE_THEORY** | 3-5 min | 1-2 | Role-specific technical depth, systems knowledge |
| 3 | **HANDS_ON_CHALLENGE** | 10-15 min | 1 | Live Monaco code sandbox correctness, logic pacing |
| 4 | **PAST_EXPERIENCE** | 3-5 min | 1-2 | Problem solving under pressure, tech decisions |
| 5 | **ARCHITECTURE_DESIGN** | 8-12 min | 1 | Distributed scaling, bottleneck isolation |
| 6 | **BUSINESS_DOMAIN** | 3-5 min | 1 | Company domain case-studies, trade-off awareness |
| 7 | **CLOSING** | 2-3 min | 1-2 | Interactive dialogue, cultural questions |
| 8 | **FEEDBACK** | Instant | — | Scorecard compilation and persistence |

### 🎙️ **Incremental Text-To-Speech (Edge-TTS) Pipeline**

To keep the interviewer responses natural, text paragraphs are streamed word-by-word. A look-ahead regex splits tokens on punctuation bounds (sentence buffers). Sentences are immediately added to a compilation queue.

> [!IMPORTANT]
> **Sequential Audio Streaming Fix:** 
> Previously, the voice assistant ran multiple parallel background `tts_worker` tasks, causing audio fragments to return out-of-order (creating stuttered, disjointed speech). 
> The system has been refactored to launch a **single tts_worker task** (`max_workers=1` equivalent behavior), guaranteeing that sentence audio fragments are processed and returned in strict serial queue order.

#### **TTS Configuration Details**
* **Interviewer Voice Profile:** Microsoft Edge-TTS `en-US-AndrewNeural` configured at `-5%` speech rate for natural professional pacing.
* **Concurrence Semaphore:** `asyncio.Semaphore(2)` restricts concurrent Edge-TTS subprocess calls to prevent API rate limit locks.
* **Format Filter:** Strips raw Markdown characters (`*`, `#`, `_`) and raw JSON/URL strings to prevent reading raw tags.
* **Memory Cache:** Caches up to 80 audio files or 50MB maximum cache memory.

---

<a id="7-core-services-deep-dive"></a>
## 7. ⚙️ **Core Services Deep Dive**

### 🗃️ **Database Engine Config (core/database.py)**

Configures connection pooling boundaries to match production targets:

```python
# app/core/database.py
_pool_kwargs = {} if _is_sqlite else {
    "pool_size": 3,
    "max_overflow": 5,
    "pool_timeout": 30,
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
```

### 🚦 **Redis Rate Limiting Core (core/rate_limit.py)**

The limits check in [rate_limit.py](file:///c:/Users/ANIL/Desktop/ai-career-mentor/backend/app/core/rate_limit.py) triggers HTTP exceptions when user quotas are exhausted:

```python
# Mapped limits configuration
DAILY_LIMITS = {
    "interview": 1,
    "resume": 1,
    "roadmap": 1,
    "full_analysis": 1,
    "linkedin": 1,
    "market": 1,
    "voice_assistant": 2,
    "quiz": 3,
}

GAP_BLOCK_DAYS = {
    "full_analysis": 7,
    "interview": 7,
    "roadmap": 5,
    "resume": 2,
    "voice_assistant": 3,
}
```

* **Rate Limit Bypass:** Automatically bypassed during local development if `APP_ENV=development` or `DEBUG=True`.
* **In-Memory Graceful Fallback:** If Upstash Redis experiences connection timeouts, the system falls back to in-memory dictionaries (`_usage_fallback` and `_usage_block_fallback`) with custom expiration date stamps.

### 📚 **RAG & Resource Enrichment Engine**

Roadmap weeks are automatically enriched with official documentation, GitHub repositories, articles, and video resources.

#### **Domain Scoring Matrix**

| Source Type | Score Modifier | Key Domain Examples |
|-------------|:--------------:|---------------------|
| **Official Documentation** | `+40 pts` | `roadmap.sh`, `fastapi.tiangolo.com`, `react.dev`, `nextjs.org`, `postgresql.org`, `redis.io`, `docs.aws.amazon.com`, `docs.docker.com`, `docs.python.org` |
| **Official Platforms** | `+30 pts` | `learn.microsoft.com` |
| **GitHub Repository** | `+25 pts` | `github.com` (additional `+10 pts` if stars count > 100) |
| **Educational Sites** | `+20 pts` | `freecodecamp.org` |
| **Tutorial Platforms** | `+10 pts` | `geeksforgeeks.org` |
| **Community Blogs** | `+5 pts` | `medium.com`, `dev.to`, `hashnode.dev` |
| **Deprecated/Archived** | `-30 pts` | Deprecated domains or archived tags |

* **Deduplication Check:** Uses `difflib.SequenceMatcher` with a `0.85` threshold to prevent adding highly similar titles.
* **Parallel URL Reachability Check:** Uses a `ThreadPoolExecutor` with `max_workers=10` executing HTTP `HEAD` requests (1.5s timeout) to verify that target resources return a `200 OK` status before injection.
* **Render OOM Protection:** Render's free tier imposes a strict 512MB RAM cap. To prevent OOM crashes from embedding computations (`all-MiniLM-L6-v2` ONNX model), the vector DB automatically falls back to keyword matching (`self.mock_db` pre-populated from `curated_resources.json`) if `RENDER=true` or `DISABLE_CHROMA=true` is set.

---

<a id="8-api-routes--middleware"></a>
## 8. 🌐 **API Routes & Middleware**

See `SYSTEM.md` Section 8 source file codes for logger and rate limiting middleware execution chains.

---

<a id="9-websocket-protocol-design"></a>
## 9. 🔌 **WebSocket Protocol Design**

### 📋 **WebSocket Message Types**

#### **1. Mock Interview Channel (`/interview/ws/{session_id}`)**
* **Client-to-Server Messages:**
  * `__ping__`: 25s keepalive pulse.
  * `Plain Text Response`: Bundles candidate message input and Monaco editor workspace contents wrapped in markdown fencings.
* **Server-to-Client Messages:**
  * `{"role": "system", "content": "Connected. Preparing..."}`: Handshake confirmation.
  * `{"role": "interviewer_stream", "content": "text"}`: Real-time text token streams.
  * `{"role": "interviewer", "audio": "base64", "fragment": true}`: Serial base64 MP3 chunks.
  * `{"role": "interviewer", "type": "question"/"feedback", "content": "text"}`: Complete text responses.
  * `{"role": "system", "content": "Interview Completed.", "score": 85}`: Evaluation scorecard.

#### **2. Voice Assistant (Anya) Channel (`/career/voice-assistant/ws`)**
* **Client-to-Server Messages:**
  * `{"type": "audio", "data": "base64"}`: 16kHz raw mono PCM mic capture.
  * `{"type": "interrupt"}`: Interrupts Anya when candidate starts talking.
* **Server-to-Client Messages:**
  * `{"type": "audio", "data": "base64"}`: 24kHz raw PCM live voice response.
  * `{"type": "transcript", "text": "..."}`: Transcripts.

---

<a id="10-database-design--migrations"></a>
## 10. 🗃️ **Database Design & Migrations**

### 📐 **Column Detail Reference**

| Table | Column | Type | Constraints | Description |
|-------|--------|------|:-----------:|-------------|
| **users** | `id` | `String` | PK, default uuid4 | Unique user identifier |
| | `email` | `String` | UK, NOT NULL, INDEX | Login email |
| | `name` | `String` | NOT NULL | Display name |
| | `hashed_pw` | `String` | NULLABLE | bcrypt hash (NULL for Google OAuth) |
| | `created_at` | `DateTime` | default now() | Account creation timestamp |
| **resumes** | `id` | `String` | PK | Resume record ID |
| | `user_id` | `String` | FK to users.id | Owner |
| | `filename` | `String` | NOT NULL | Original filename |
| | `parsed_content` | `JSON` | NULLABLE | Full AI analysis result |
| | `raw_text` | `Text` | NULLABLE | Extracted PDF text |
| | `uploaded_at` | `DateTime` | default now() | Upload timestamp |
| **career_roadmaps** | `id` | `String` | PK | Roadmap ID |
| | `user_id` | `String` | FK to users.id | Owner |
| | `target_role` | `String` | NOT NULL | Target job role |
| | `steps` | `JSON` | NULLABLE | 8-week plan array |
| | `created_at` | `DateTime` | default now() | Creation timestamp |
| **market_analyses** | `id` | `String` | PK | Analysis ID |
| | `user_id` | `String` | FK to users.id | Owner |
| | `target_role` | `String` | NOT NULL | Target role |
| | `location` | `String` | NOT NULL | Target location |
| | `analysis` | `JSON` | NULLABLE | Market intelligence report |
| | `created_at` | `DateTime` | default now() | Analysis timestamp |
| **interview_sessions** | `id` | `String` | PK | Session ID |
| | `user_id` | `String` | FK to users.id | Owner |
| | `target_role` | `String` | NOT NULL | Interview role |
| | `chat_history` | `JSON` | NULLABLE | Message history |
| | `score` | `Float` | NULLABLE | Score 0-100 |
| | `status` | `String` | default in_progress | Session status |
| | `created_at` | `DateTime` | default now() | Start time |
| | `completed_at` | `DateTime` | NULLABLE | End time |
| **career_analyses** | `id` | `String` | PK | Analysis ID |
| | `user_id` | `String` | FK to users.id | Owner |
| | `target_role` | `String` | NOT NULL | Target job role |
| | `location` | `String` | NOT NULL | Target location |
| | `resume_analysis` | `JSON` | NULLABLE | Parsed resume gap report |
| | `market_analysis` | `JSON` | NULLABLE | Target market demand details |
| | `roadmap` | `JSON` | NULLABLE | Custom learning schedule |
| | `linkedin_strategy` | `JSON` | NULLABLE | Profile improvement instructions |
| | `created_at` | `DateTime` | default now() | Creation timestamp |
| **activity_logs** | `id` | `String` | PK | Log ID |
| | `user_id` | `String` | FK to users.id | Owner |
| | `action` | `String` | NOT NULL | Action description |
| | `feature` | `String` | NOT NULL | Feature category |
| | `created_at` | `DateTime` | default now() | Log timestamp |
| **daily_analytics** | `id` | `String` | PK | Rollup record ID |
| | `date` | `Date` | UK, NOT NULL, INDEX | Rollup date |
| | `total_requests` | `Integer` | default 0 | Total API requests |
| | `total_tokens` | `Integer` | default 0 | Total API tokens used |
| | `estimated_cost` | `Float` | default 0.0 | Estimated LLM API cost in USD |
| | `fallback_count` | `Integer` | default 0 | Total fallback provider triggers |
| | `error_count` | `Integer` | default 0 | Total backend exceptions |
| | `groq_cost` | `Float` | default 0.0 | Estimated Groq API cost in USD |
| | `nvidia_cost` | `Float` | default 0.0 | Estimated Nvidia API cost in USD |
| | `google_cost` | `Float` | default 0.0 | Estimated Google API cost in USD |

---

<a id="11-testing-strategy"></a>
## 11. 🧪 **Testing Strategy**

The testing suite enforces stability across the modular monolith backend, implementing both mock integration scopes and schema constraint tests.

### 🔬 **Automated Test Distribution (114 Total Tests)**

* **`test_agents_registry.py` (24 tests):** Tests JSON structures cleanup, circuit breaker transitions (Tripping at 5 failures, half-open cooldown checking), and provider fallback chains.
* **`test_roadmap_agents.py` (24 tests):** Tests learning structures normalizations, study details batch parallelization, and edge case fallbacks.
* **`test_validation.py` (16 tests):** Validates Pydantic constraints, ATS score boundary caps (cap at 100), and experience normalizations.
* **`test_features.py` (13 tests):** Validates vector database embeddings, search engine domain scoring, reachability checks, and local caching.
* **`test_main.py` (9 tests):** Validates API router gateways, slowapi rates checks, and auth tokens validation hooks.
* **`test_admin_metrics_fetch.py` (2 tests) & `test_observability.py` (2 tests):** Validates metrics aggregation payloads and rollups synchronization.
* **`test_ats_engine.py` (5 tests):** Validates deterministic resume parser scoring components.
* **`test_market_service.py` (4 tests) & `test_linkedin.py` (2 tests):** Tests location mappings and headlines optimization.
* **`test_gamified_roadmap.py` (4 tests):** Tests gamification XP multipliers and completions trackers.
* **`test_voice_assistant.py` (3 tests):** Tests Anya WebSocket auth and Gemini live config overrides.

---

<a id="12-docker--deployment"></a>
## 12. 🐳 **Docker & Deployment**

### ☁️ **Production Service Mappings**

* **Frontend UI (Vercel):** Runs Next.js SSR and static page routing. Relies on the `NEXT_PUBLIC_API_URL` environment flag.
* **Backend API (Render Web Service):** Multi-stage optimized Docker deployment container. Requires:
  * LLM keys: `CEREBRAS_API_KEY`, `GROQ_API_KEY`, `NVIDIA_API_KEY`, `GOOGLE_API_KEY`.
  * Middleware engines: `REDIS_URL`, `DATABASE_URL`.
  * Env selectors: `APP_ENV=production` or `DISABLE_CHROMA=true` (Render OOM prevention flag).
* **Database (Neon Serverless Postgres):** Primary transactional storage database.
* **Cache & Rate Limit (Upstash Redis):** Serverless sliding rate limiting data store.

---

<a id="13-security-architecture"></a>
## 13. 🔒 **Security Architecture**

### 🔑 **JWT Token Payload Key Structure**

* **Access Token (60-minute lifetime):**
  * `sub`: User ID UUID string.
  * `type`: `"access"`.
  * `exp`: Unix timestamp threshold.
* **Refresh Token (30-day lifetime):**
  * `sub`: User ID UUID string.
  * `type`: `"refresh"`.
  * `exp`: Unix timestamp threshold.

---

<a id="14-performance--optimization"></a>
## 14. 📈 **Performance & Optimization**

See `SYSTEM.md` Section 14 source file codes for caching expiration policies and async thread pool matrices.

---

<a id="15-state-management-patterns"></a>
## 15. 🔄 **State Management Patterns**

See `SYSTEM.md` Section 15 source file codes for graph states schemas and SSE React progress streaming hooks.

---

<a id="16-error-handling--logging"></a>
## 16. 🚦 **Error Handling & Logging**

See `SYSTEM.md` Section 16 source file codes for Loguru config and database transaction rollback blocks.

---

<a id="17-llm-integration-patterns"></a>
## 17. 🧬 **LLM Integration Patterns**

### 📊 **Model Routing Rules**

The system employs a hybrid capability routing matrix, sending structured outputs to Cerebras, real-time responses to Groq/Gemini, and reasoning backups to NVIDIA NIM.

| Workflow | Primary LLM Provider | Fallback Chain | Temperature | Purpose |
|----------|----------------------|----------------|:-----------:|---------|
| **Resume Analysis** | `Cerebras` (`gpt-oss-120b`) | `groq` $\to$ `nvidia` | 0.3 | High-precision JSON extraction |
| **Market Analysis** | `Groq` (`openai/gpt-oss-120b`) | `cerebras` $\to$ `nvidia` | 0.2 | Scraped text reasoning |
| **Roadmap Structure**| `Cerebras` (`gpt-oss-120b`) | `groq` $\to$ `nvidia` | 0.4 | 8-week syllabus generation |
| **Roadmap Details** | `Groq` (`openai/gpt-oss-120b`) | `cerebras` $\to$ `nvidia` | 0.5 | Granular week topic expansion |
| **Mock Interview** | `Groq` (`openai/gpt-oss-120b`) | `nvidia` | 0.65 | Low-latency chat evaluation |
| **LinkedIn Strategy**| `Cerebras` (`gpt-oss-120b`) | `groq` $\to$ `nvidia` | 0.7 | Profile copy generation |
| **Voice Assistant** | `Gemini` (`gemini-2.5-flash`) | None | Default | Multimodal native audio stream |

### 🛠️ **LLM Client & Configurations Manager**

To cleanly isolate prompt configurations and routing parameters, the system decouples agent logic from API routes:
1. **`llm_config.py` (LLMConfigManager):** Standardizes agent settings (`AGENT_PROFILES`) and handles overrides (e.g. `AGENT_RESUME_PROVIDER` env flags).
2. **`llm_client.py`:** Provides wrapper interfaces (`run_resume_analysis`, `run_market_agent`) to execute LLM workflows cleanly.

#### **Model Selector Configuration (`llm_config.py`)**

```python
# app/core/llm_config.py

AGENT_PROFILES = {
    "resume": {
        "env_prefix": "AGENT_RESUME",
        "capability": "structured_json",
        "default_provider": "cerebras",
        "default_model": "gpt-oss-120b",
        "default_temperature": 0.3,
        "fallback_chain": ["cerebras", "groq", "nvidia"],
    },
    "market": {
        "env_prefix": "AGENT_MARKET",
        "capability": "reasoning",
        "default_provider": "groq",
        "default_model": "openai/gpt-oss-120b",
        "default_temperature": 0.2,
        "fallback_chain": ["groq", "cerebras", "nvidia"],
    },
    "linkedin": {
        "env_prefix": "AGENT_LINKEDIN",
        "capability": "creative",
        "default_provider": "cerebras",
        "default_model": "gpt-oss-120b",
        "default_temperature": 0.7,
        "fallback_chain": ["cerebras", "groq", "nvidia"],
    },
    "roadmap_structure": {
        "env_prefix": "AGENT_ROADMAP_STRUCTURE",
        "capability": "reasoning",
        "default_provider": "cerebras",
        "default_model": "gpt-oss-120b",
        "default_temperature": 0.4,
        "fallback_chain": ["cerebras", "groq", "nvidia"],
    },
    "roadmap_details": {
        "env_prefix": "AGENT_ROADMAP_DETAILS",
        "capability": "cheap",
        "default_provider": "groq",
        "default_model": "openai/gpt-oss-120b",
        "default_temperature": 0.5,
        "fallback_chain": ["groq", "cerebras", "nvidia"],
    },
}
```

---

<a id="18-observability--monitoring"></a>
## 18. 📊 **Observability & Monitoring**

### 📊 **Loguru Global Error Interceptor Sink**

To ensure comprehensive tracking of all runtime errors, a global Loguru error interceptor sink is configured in `app/core/observability.py`. Any system-wide log matching level `ERROR` or `CRITICAL` is captured automatically:

```
[System Logger / logger.error()]
             │
             ▼
┌──────────────────────────────────────────────┐
│       Loguru Observability Sink              │
│  - Filters out recursion loops               │
│  - Formats exception tracebacks              │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             _persist_error()                 │
│  - Updates Redis / PostgreSQL daily metrics  │
│  - Appends to rolling Exception Feed logs    │
└──────────────────────────────────────────────┘
```

This guarantees that database downtimes, external API timeouts, parsing errors, or background worker failures show up immediately on the administrator console telemetry charts and traceback lists.

---

<a id="19-future-architecture-roadmap"></a>
## 19. 🔮 **Future Architecture Roadmap**

See `SYSTEM.md` Section 19 source file codes for planned dynamic supervisors, async migrations, and evolution roadmaps.

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