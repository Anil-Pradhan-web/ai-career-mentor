<div align="center">

# 🏗️ AI Career Mentor — System Architecture

*Complete technical architecture documentation with Mermaid diagrams*

</div>

---

## Table of Contents
- [High-Level System Architecture](#1-high-level-system-architecture)
- [LangGraph DAG Orchestration](#2-langgraph-dag-orchestration)
- [Mock Interview FSM](#3-mock-interview-fsm-state-machine)
- [Voice Assistant Pipeline](#4-voice-assistant-pipeline-anya)
- [Agent Registry & Circuit Breaker](#5-agent-registry--circuit-breaker)
- [API Gateway & Middleware Stack](#6-api-gateway--middleware-stack)
- [Database Entity Relationship Diagram](#7-database-entity-relationship-diagram)
- [Frontend Component Architecture](#8-frontend-component-architecture)
- [Deployment Topology](#9-deployment-topology)
- [Data Flow: Full Career Analysis](#10-data-flow-full-career-analysis)
- [Data Flow: Resume Upload & Analysis](#11-data-flow-resume-upload--analysis)
- [Data Flow: Market Intelligence](#12-data-flow-market-intelligence)
- [Rate Limiting Architecture](#13-rate-limiting-architecture)
- [RAG & Resource Enrichment Pipeline](#14-rag--resource-enrichment-pipeline)

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client ["🌐 Client Layer"]
        Browser["Browser\n(Next.js 14 SPA)"]
    end

    subgraph Gateway ["⚡ API Gateway (FastAPI)"]
        REST["REST API\n(JSON)"]
        SSE["SSE Stream\n(text/event-stream)"]
        WS_INT["WebSocket\n(Interview FSM)"]
        WS_VOICE["WebSocket\n(Voice Proxy)"]
    end

    subgraph Middleware ["🛡️ Middleware Stack"]
        CORS["CORS\nMiddleware"]
        LOG["Request\nLogger"]
        RATE["SlowAPI\nRate Limiter"]
        AUTH["JWT Auth\n+ Google OAuth"]
    end

    subgraph AI ["🧠 AI Layer"]
        LG["LangGraph\nParallel DAG"]
        REG["Agent Registry\n(Circuit Breaker)"]
        ATS["ATS Engine\n(Deterministic)"]
        RAG["RAG Service\n(ChromaDB)"]
        SE["Search Engine\n(Tavily/Serper)"]
    end

    subgraph LLM ["🤖 LLM Providers"]
        GROQ["Groq\nLlama 3.3 70B"]
        NIM["NVIDIA NIM\nLlama 3.3 Instruct"]
        GEM["Google Gemini\n2.5 Flash"]
        GEM_LIVE["Gemini Live\nMultimodal Audio"]
    end

    subgraph DB ["🗃️ Data Layer"]
        PG["PostgreSQL\n(Neon)"]
        REDIS["Redis\n(Upstash)"]
        CHROMA["ChromaDB\n(Persistent)"]
        SQLITE["SQLite\n(Dev Only)"]
    end

    Browser --> REST & SSE & WS_INT & WS_VOICE
    REST --> CORS --> LOG --> RATE --> AUTH
    SSE --> CORS
    WS_INT --> AUTH
    WS_VOICE --> AUTH

    AUTH --> LG & REG & ATS & RAG & SE
    LG --> REG
    REG --> GROQ & NIM & GEM
    WS_VOICE --> GEM_LIVE

    AUTH --> PG & REDIS
    RATE --> REDIS
    RAG --> CHROMA
    ATS --> PG
```

---

## 2. LangGraph DAG Orchestration

The Career AI OS uses a static DAG (Directed Acyclic Graph) with parallel fan-out/fan-in execution. Total pipeline latency = `max(resume, market) + max(linkedin, roadmap)`.

```mermaid
graph TD
    START(["▶ START"])

    subgraph "Phase 1 — Parallel Fan-Out"
        RESUME["📄 Resume Node\n• Deterministic ATS Engine\n• LLM Analysis (NVIDIA/Groq)\n• Pydantic Validation\n• Fallback: deterministic data"]
        MARKET["📈 Market Node\n• Tavily/Serper Search\n• Deep URL Scraping\n• LLM Formatting (Groq)\n• Location-Aware Salary Scaling"]
    end

    subgraph "Phase 2 — Parallel Fan-In"
        LINKEDIN["🔗 LinkedIn Node\n• ATS Keyword Injection\n• Recruiter Trend Analysis\n• Market-Aware Headlines\n• Programmatic Fallback"]
        ROADMAP["🗺️ Roadmap Node\n• Structure Generation (Google)\n• Batch Details (3+3+2 chunks)\n• Resource Enrichment (RAG)\n• 8-Week Normalization"]
    end

    END_NODE(["⏹ END"])

    START --> RESUME
    START --> MARKET

    RESUME --> LINKEDIN
    MARKET --> LINKEDIN

    RESUME --> ROADMAP
    MARKET --> ROADMAP

    LINKEDIN --> END_NODE
    ROADMAP --> END_NODE

    style RESUME fill:#818cf8,color:#fff
    style MARKET fill:#34d399,color:#fff
    style LINKEDIN fill:#a78bfa,color:#fff
    style ROADMAP fill:#f59e0b,color:#fff
```

### State Schema (TypedDict)

```mermaid
classDiagram
    class CareerState {
        +str resume_text
        +str target_role
        +str location
        +str|None provider
        +dict|None resume_analysis
        +dict|None market_analysis
        +dict|None linkedin_strategy
        +list~dict~ roadmap
        +list~str~ logs ⊕ operator.add
        +list~str~ errors ⊕ operator.add
        +dict metadata
    }
```

---

## 3. Mock Interview FSM (State Machine)

The interview engine uses a 7-phase (+ feedback) Finite State Machine with strict unidirectional transitions.

```mermaid
stateDiagram-v2
    [*] --> INITIAL
    INITIAL --> INTRO: Session Start
    
    INTRO --> CS_FUNDAMENTALS: Phase 1 → 2
    CS_FUNDAMENTALS --> LEETCODE: Phase 2 → 3
    LEETCODE --> PROJECT_DEEPDIVE: Phase 3 → 4
    PROJECT_DEEPDIVE --> SYSTEM_DESIGN: Phase 4 → 5
    SYSTEM_DESIGN --> COMPANY_DOMAIN: Phase 5 → 6
    COMPANY_DOMAIN --> CLOSING: Phase 6 → 7
    CLOSING --> FEEDBACK: Phase 7 → 8
    FEEDBACK --> COMPLETED: Scoring

    state INTRO {
        [*] --> WelcomeCandidate
        WelcomeCandidate --> AskBackground
    }

    state CS_FUNDAMENTALS {
        [*] --> FeedbackOnIntro
        FeedbackOnIntro --> AskCSQuestion
        note right of AskCSQuestion: OS / CN / DBMS\nor role-specific
    }

    state LEETCODE {
        [*] --> FeedbackOnCS
        FeedbackOnCS --> PresentCodingChallenge
    }

    state SYSTEM_DESIGN {
        [*] --> FeedbackOnProject
        FeedbackOnProject --> PresentDesignScenario
    }

    state COMPLETED {
        [*] --> GenerateScorecard
        GenerateScorecard --> PersistToDB
    }
```

### Role Category Adaptation

The FSM adapts phase content based on role category:

```mermaid
graph LR
    FSM["InterviewStateMachine"]
    
    FSM --> SWE["SWE\n• OS/CN/DBMS\n• LeetCode\n• System Design"]
    FSM --> DATA["Data/AI\n• ML/Stats\n• ML Case Study\n• ML System Design"]
    FSM --> INFRA["Infra/Cloud\n• Containers/CI\n• Infra Scenario\n• Cloud Architecture"]
    FSM --> SEC["Security\n• AppSec/Crypto\n• CTF Scenario\n• Security Architecture"]
    FSM --> PM["Product/Design\n• Metrics/Research\n• Case Study\n• Product Strategy"]
    FSM --> GAME["Gaming\n• Game Loop/Physics\n• Game Dev Challenge\n• Game Architecture"]
```

---

## 4. Voice Assistant Pipeline (Anya)

```mermaid
sequenceDiagram
    participant User as 👤 User (Browser)
    participant Client as 🎤 VoiceAssistant.tsx
    participant Backend as ⚡ FastAPI WebSocket
    participant Gemini as 🔵 Gemini Live API

    User->>Client: Click "Call Anya"
    Client->>Backend: WS Connect (/career/voice-assistant/ws?token=JWT)
    
    Note over Backend: 1. JWT Authentication
    Note over Backend: 2. Rate Limit Check (2/day)
    Note over Backend: 3. Load Context (Resume + Roadmap + Market)
    Note over Backend: 4. Build Anya System Prompt
    
    Backend->>Gemini: WS Connect (wss://generativelanguage.googleapis.com)
    Backend->>Gemini: Setup Config (model, voice=Aoede, system_prompt)
    Gemini-->>Backend: Setup Complete

    par Bidirectional Relay
        loop User Speaking
            Client->>Backend: {"type":"audio","data":"base64_PCM_16kHz"}
            Backend->>Gemini: {"realtimeInput":{"mediaChunks":[...]}}
        end
        
        loop Anya Responding
            Gemini-->>Backend: {"serverContent":{"modelTurn":{"parts":[...]}}}
            Backend-->>Client: {"type":"audio","data":"base64_PCM_24kHz"}
            Backend-->>Client: {"type":"transcript","text":"..."}
        end
    end

    Note over Backend: Auto-disconnect after 7.5 min
    Backend-->>Client: {"type":"time_limit","message":"..."}
    Backend->>Client: WS Close
```

---

## 5. Agent Registry & Circuit Breaker

```mermaid
graph TD
    CALL["call_llm()"]
    
    CB_CHECK{"Circuit Breaker\nOPEN?"}
    DISPATCH["_dispatch()"]
    RETRY{"Retry\n(attempt < 3)?"}
    FALLBACK{"Fallback\nProvider?"}
    PARSE["_parse_structured()\n(if response_model)"]
    
    CALL --> CB_CHECK
    CB_CHECK -->|"Open (cooldown)"| FALLBACK
    CB_CHECK -->|"Closed"| DISPATCH
    
    DISPATCH -->|"Success"| PARSE
    DISPATCH -->|"Error"| RETRY
    
    RETRY -->|"Yes"| FALLBACK
    RETRY -->|"No (exponential backoff)"| DISPATCH
    
    FALLBACK -->|"Next provider exists"| CB_CHECK
    FALLBACK -->|"Chain exhausted"| RETURN_NONE["Return None"]
    
    PARSE --> VALIDATE["Pydantic\nValidation"]
    VALIDATE -->|"Valid"| RESET["Reset Circuit\nBreaker"]
    VALIDATE -->|"Parse Error"| RETRY
    
    RESET --> RETURN["Return dict"]

    style CALL fill:#818cf8,color:#fff
    style RETURN fill:#34d399,color:#fff
    style RETURN_NONE fill:#ef4444,color:#fff
```

### Fallback Chain Configuration

```mermaid
graph LR
    subgraph "Default Chains"
        N["nvidia"] --> N_G["groq"] --> N_GO["google"]
        G["groq"] --> G_GO["google"] --> G_N["nvidia"]
        GO["google"] --> GO_G["groq"] --> GO_N["nvidia"]
    end
    
    subgraph "Circuit Breaker"
        CB["Per-provider state\n• fails: counter\n• disabled_until: timestamp\n• Trips at 5 failures\n• 60s cooldown"]
    end
```

---

## 6. API Gateway & Middleware Stack

```mermaid
graph LR
    REQ["Incoming\nRequest"] --> CORS["CORS\nMiddleware"]
    CORS --> LOG["Request\nLogger"]
    LOG --> SLOW["SlowAPI\nRate Limiter"]
    SLOW --> ROUTE["Route\nHandler"]
    ROUTE --> AUTH{"Protected\nRoute?"}
    AUTH -->|"Yes"| JWT["JWT\nValidation"]
    AUTH -->|"No"| HANDLER["Handler\nLogic"]
    JWT --> HANDLER
    HANDLER --> RESP["Response"]

    style REQ fill:#818cf8,color:#fff
    style RESP fill:#34d399,color:#fff
```

### Route Mounting

```mermaid
graph TD
    APP["FastAPI App"]
    
    APP --> H_AUTH["/auth\n• POST /register\n• POST /login\n• POST /google\n• POST /refresh"]
    APP --> H_RESUME["/resume 🔒\n• POST /upload\n• POST /analyze"]
    APP --> H_ROADMAP["/roadmap 🔒\n• POST /generate\n• GET /history\n• DELETE /:id\n• PUT /:id/toggle-week/:n\n• GET /:id/quiz/:n"]
    APP --> H_MARKET["/market 🔒\n• GET /config\n• GET /trends\n• GET /history\n• DELETE /:id"]
    APP --> H_CAREER["/career 🔒\n• POST /full-analysis/stream"]
    APP --> H_LINKEDIN["/linkedin 🔒\n• POST /optimize"]
    APP --> H_USER["/user 🔒\n• GET /stats"]
    APP --> H_INTERVIEW["/interview\n• WS /ws/:session_id\n• GET /history\n• GET /:session_id\n• DELETE /:session_id"]
    APP --> H_VOICE["/career/voice-assistant\n• WS /ws"]
    APP --> H_HEALTH["/health\n• GET /health\n• GET /ping\n• GET /"]

    style H_AUTH fill:#06b6d4,color:#fff
    style H_INTERVIEW fill:#f59e0b,color:#fff
    style H_VOICE fill:#ec4899,color:#fff
```

---

## 7. Database Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ resumes : "has many"
    users ||--o{ career_roadmaps : "has many"
    users ||--o{ market_analyses : "has many"
    users ||--o{ interview_sessions : "has many"
    users ||--o{ activity_logs : "has many"

    users {
        string id PK "UUID"
        string email UK "indexed"
        string name
        string hashed_pw "nullable (OAuth users)"
        datetime created_at
    }

    resumes {
        string id PK "UUID"
        string user_id FK
        string filename
        json parsed_content "AI analysis result"
        text raw_text "Extracted PDF text"
        datetime uploaded_at
    }

    career_roadmaps {
        string id PK "UUID"
        string user_id FK
        string target_role
        json steps "8-week plan array"
        datetime created_at
    }

    market_analyses {
        string id PK "UUID"
        string user_id FK
        string target_role
        string location
        json analysis "Market intelligence"
        datetime created_at
    }

    interview_sessions {
        string id PK "UUID"
        string user_id FK
        string target_role
        json chat_history "Messages array"
        float score "0-100"
        string status "in_progress|completed"
        datetime created_at
        datetime completed_at
    }

    activity_logs {
        string id PK "UUID"
        string user_id FK
        string action "Human-readable label"
        string feature "resume|roadmap|interview|..."
        datetime created_at
    }
```

---

## 8. Frontend Component Architecture

```mermaid
graph TD
    subgraph "Next.js 14 App Router"
        LAYOUT["layout.tsx\n(Root Layout)"]
        
        LAYOUT --> LANDING["page.tsx\n(Landing Page)"]
        LAYOUT --> LOGIN["login/page.tsx"]
        LAYOUT --> REGISTER["register/page.tsx"]
        LAYOUT --> DASH_LAYOUT["dashboard/layout.tsx\n(Sidebar + Navbar)"]
    end

    subgraph "Dashboard Pages"
        DASH_LAYOUT --> DASH_HOME["dashboard/page.tsx\n(Stats + Charts + Activity)"]
        DASH_LAYOUT --> DASH_RESUME["resume/page.tsx"]
        DASH_LAYOUT --> DASH_ROADMAP["roadmap/page.tsx"]
        DASH_LAYOUT --> DASH_MARKET["market/page.tsx"]
        DASH_LAYOUT --> DASH_INTERVIEW["interview/page.tsx"]
        DASH_LAYOUT --> DASH_LINKEDIN["linkedin/page.tsx"]
        DASH_LAYOUT --> DASH_ANALYSIS["full-analysis/page.tsx"]
        DASH_LAYOUT --> DASH_SETTINGS["settings/page.tsx"]
    end

    subgraph "Shared Components"
        SIDEBAR["Sidebar.tsx"]
        NAVBAR["Navbar.tsx"]
        VOICE["VoiceAssistant.tsx\n(Floating Widget)"]
        RESUME_PANEL["ResumeAnalysisPanel.tsx"]
        UPLOAD["UploadResumeCard.tsx"]
        PROGRESS["ProgressTracker.tsx"]
        SKELETON["Skeleton.tsx"]
    end

    subgraph "Landing Components"
        L_NAV["Navbar.tsx"]
        L_HERO["Hero.tsx"]
        L_FEATURES["Features.tsx"]
        L_SHOWCASE["Showcase.tsx"]
        L_STATS["Stats.tsx"]
        L_PRICING["Pricing.tsx"]
        L_PLACEMENT["PlacementStats.tsx"]
        L_CTA["CTA.tsx"]
        L_FOOTER["Footer.tsx"]
    end

    subgraph "Service Layer"
        API_CLIENT["client.ts\n(Axios + Interceptors)"]
        SVC_AUTH["auth.ts"]
        SVC_RESUME["resume.ts"]
        SVC_CAREER["career.ts"]
        SVC_ROADMAP["roadmap.ts"]
        SVC_MARKET["market.ts"]
        SVC_INTERVIEW["interview.ts"]
        SVC_LINKEDIN["linkedin.ts"]
        SVC_USER["user.ts"]
    end

    DASH_LAYOUT --> SIDEBAR & NAVBAR & VOICE
    LANDING --> L_NAV & L_HERO & L_FEATURES & L_SHOWCASE & L_STATS & L_PRICING & L_PLACEMENT & L_CTA & L_FOOTER
```

---

## 9. Deployment Topology

```mermaid
graph TB
    subgraph "Production Infrastructure"
        subgraph "Frontend (Vercel)"
            VERCEL["Next.js 14\nSSR + Static\nEdge Network CDN"]
        end
        
        subgraph "Backend (Render)"
            RENDER["FastAPI\nDocker Container\nAuto-deploy on push"]
        end
        
        subgraph "Database (Neon)"
            NEON["PostgreSQL 15\nServerless\nConnection Pooling"]
        end
        
        subgraph "Cache (Upstash)"
            UPSTASH["Redis\nServerless\nRate Limit Storage"]
        end
        
        subgraph "Vector Store"
            CHROMADB["ChromaDB\nEmbedded (In-Container)\nPersistent Volume"]
        end
    end

    subgraph "External APIs"
        GROQ_API["Groq API"]
        NVIDIA_API["NVIDIA NIM API"]
        GEMINI_API["Google Gemini API"]
        GEMINI_LIVE["Gemini Live WS"]
        TAVILY_API["Tavily Search"]
        SERPER_API["Serper API"]
        GOOGLE_AUTH["Google OAuth"]
    end

    USER(["👤 Users"]) --> VERCEL
    VERCEL --> RENDER
    RENDER --> NEON & UPSTASH & CHROMADB
    RENDER --> GROQ_API & NVIDIA_API & GEMINI_API & GEMINI_LIVE
    RENDER --> TAVILY_API & SERPER_API
    VERCEL --> GOOGLE_AUTH

    style VERCEL fill:#000,color:#fff
    style RENDER fill:#46E3B7,color:#000
    style NEON fill:#4169E1,color:#fff
    style UPSTASH fill:#DC382D,color:#fff
```

---

## 10. Data Flow: Full Career Analysis

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as FastAPI
    participant RL as Rate Limiter
    participant Graph as LangGraph DAG
    participant ATS as ATS Engine
    participant Search as Search API
    participant LLM as LLM Provider
    participant RAG as RAG Service
    participant DB as Database

    Client->>API: POST /career/full-analysis/stream
    API->>RL: check_daily_limit(user_id, "full_analysis")
    RL-->>API: ✅ Allowed

    API->>Graph: Initialize CareerState

    par Phase 1 (Parallel)
        Graph->>ATS: analyze_resume_deterministically()
        ATS-->>Graph: Deterministic ATS data
        Graph->>LLM: run_resume_agent(text, ats_data)
        LLM-->>Graph: resume_analysis

        Graph->>Search: get_market_intelligence()
        Search-->>Graph: Raw market data
        Graph->>LLM: run_market_agent(role, location, data)
        LLM-->>Graph: market_analysis
    end

    Note over Graph: SSE: Stream log events to client

    par Phase 2 (Parallel)
        Graph->>LLM: run_linkedin_agent(role, resume, market)
        LLM-->>Graph: linkedin_strategy

        Graph->>LLM: run_roadmap_structure(role, gaps)
        LLM-->>Graph: 8-week skeleton
        Graph->>LLM: run_roadmap_details_batch(chunks)
        LLM-->>Graph: Detailed weeks
        Graph->>RAG: enrich_weeks_with_resources()
        RAG-->>Graph: Enriched roadmap
    end

    Graph-->>API: Final aggregated state
    API->>DB: Save roadmap + market analysis
    API->>RL: increment_usage()
    API->>DB: log_activity()
    API-->>Client: SSE: {"type":"result","payload":{...}}
```

---

## 11. Data Flow: Resume Upload & Analysis

```mermaid
flowchart TD
    UPLOAD["PDF Upload\n(Max 5MB)"]
    VALIDATE["Validate\n• Extension check (.pdf)\n• MIME type check\n• Magic bytes (%PDF-)\n• Size limit"]
    EXTRACT["Extract Text\n(pdfplumber)"]
    SANITIZE["Sanitize\n• Strip {}\n• Strip backticks\n• Normalize whitespace\n• Truncate to 6000 chars"]
    CACHE_CHECK{"Cache\nHit?"}
    DET["Deterministic ATS\n• Technical skill detection\n• Experience calculation\n• Action verb counting\n• Score breakdown"]
    LLM_CALL["LLM Analysis\n• NVIDIA NIM (primary)\n• Groq (fallback)\n• 120s timeout"]
    PYDANTIC["Pydantic Validation\n• ResumeAnalysisModel\n• ATS score capping\n• Experience normalization"]
    SAVE["Save to DB\n• Resume record\n• Increment usage\n• Log activity\n• Update cache"]

    UPLOAD --> VALIDATE --> EXTRACT --> SANITIZE --> CACHE_CHECK
    CACHE_CHECK -->|"Hit"| SAVE
    CACHE_CHECK -->|"Miss"| DET --> LLM_CALL --> PYDANTIC --> SAVE

    style UPLOAD fill:#818cf8,color:#fff
    style SAVE fill:#34d399,color:#fff
```

---

## 12. Data Flow: Market Intelligence

```mermaid
flowchart LR
    INPUT["Role + Location\n+ Seniority"]
    SEARCH["Search Pipeline\n1. Tavily Search\n2. Serper (fallback)"]
    SCRAPE["Deep URL Scraping\n• Strip HTML\n• Extract salary data\n• Company info"]
    DETERMINISTIC["Deterministic Layer\n• Curated salary DB\n• Company profiles\n• Skill frequency maps\n• Currency formatting"]
    LLM_FORMAT["LLM Formatting\n• Groq (primary)\n• NVIDIA (fallback)\n• Structured JSON"]
    VALIDATE["MarketTrendsModel\nPydantic Validation"]
    PERSIST["Persist\n• Save to market_analyses\n• Log activity"]

    INPUT --> SEARCH --> SCRAPE --> DETERMINISTIC --> LLM_FORMAT --> VALIDATE --> PERSIST

    style INPUT fill:#818cf8,color:#fff
    style PERSIST fill:#34d399,color:#fff
```

---

## 13. Rate Limiting Architecture

```mermaid
graph TD
    REQ["Incoming Request"]
    
    subgraph "Layer 1: Global (SlowAPI)"
        SLOW["SlowAPI Middleware\nDev: 100K/day\nProd: 1K/day + 100/hr"]
    end

    subgraph "Layer 2: Per-Feature (Custom)"
        CHECK["check_daily_limit()"]
        GAP{"48h Gap\nBlock?"}
        DAILY{"Daily Cap\nReached?"}
        REDIS_Q["Redis GET\n(Upstash)"]
        MEM_Q["In-Memory\nFallback"]
    end

    REQ --> SLOW --> CHECK
    CHECK --> GAP
    GAP -->|"Blocked"| REJECT_429["HTTP 429\nToo Many Requests"]
    GAP -->|"Clear"| DAILY
    DAILY -->|"Exceeded"| REJECT_429
    DAILY -->|"OK"| REDIS_Q
    REDIS_Q -->|"Connected"| ALLOW["✅ Allow"]
    REDIS_Q -->|"Redis Down"| MEM_Q --> ALLOW

    style REJECT_429 fill:#ef4444,color:#fff
    style ALLOW fill:#34d399,color:#fff
```

---

## 14. RAG & Resource Enrichment Pipeline

```mermaid
flowchart TD
    WEEKS["8-Week Roadmap\n(Topics + Queries)"]
    DDG["DuckDuckGo Search\n(per week)"]
    RESULTS["Raw URLs"]
    
    subgraph "Quality Engine"
        HEURISTIC["Heuristic Scoring\n• Official docs: +40pts\n• GitHub repos: +25pts\n• Legacy penalty: -20pts"]
        GH_AUDIT["GitHub Audit\n• Star count check\n• Push date check\n• Archive status"]
        URL_CHECK["URL Validation\n(10 parallel workers)"]
        DEDUP["Title Deduplication\n(SequenceMatcher)"]
    end

    subgraph "Fallback"
        CHROMA["ChromaDB Lookup\n(ONNX Embeddings)"]
        KEYWORD["In-Memory\nKeyword Matcher\n(OOM Fallback)"]
    end

    WEEKS --> DDG --> RESULTS
    RESULTS --> HEURISTIC --> GH_AUDIT --> URL_CHECK --> DEDUP
    DEDUP --> ENRICHED["Enriched Weeks\n(YouTube, Articles,\nGitHub, Docs)"]

    RESULTS -->|"No results"| CHROMA
    CHROMA -->|"OOM / No embeddings"| KEYWORD
    KEYWORD --> ENRICHED

    style WEEKS fill:#818cf8,color:#fff
    style ENRICHED fill:#34d399,color:#fff
```

---

<div align="center">

**Built with 🧠 by [Anil Pradhan](https://github.com/Anil-Pradhan-web)**

</div>
