<div align="center">

# ⚙️ **AI Career Mentor — Complete API Reference**

**REST + SSE + WebSocket — Full Protocol Documentation**

![Swagger UI](https://img.shields.io/badge/Swagger%20UI-Live-46E3B7?style=for-the-badge&logo=swagger)
![REST](https://img.shields.io/badge/REST-JSON-06B6D4?style=for-the-badge)
![SSE](https://img.shields.io/badge/SSE-Streaming-f59e0b?style=for-the-badge)
![WebSocket](https://img.shields.io/badge/WebSocket-Full%20Duplex-ec4899?style=for-the-badge)

[![📖 Architecture](https://img.shields.io/badge/📖%20Architecture-ARCHITECTURE.md-8B5CF6?style=for-the-badge)](./ARCHITECTURE.md)
[![🖥️ System Design](https://img.shields.io/badge/🖥️%20System%20Design-SYSTEM.md-34D399?style=for-the-badge)](./SYSTEM.md)
[![📘 README](https://img.shields.io/badge/📘%20README-README.md-818cf8?style=for-the-badge)](./README.md)

</div>

---

## 📑 **Table of Contents**

| # | Section | 🔗 |
|---|---------|-----|
| 1 | [🌐 Overview](#1-overview) |
| 2 | [🔐 Authentication](#2-authentication) |
| 3 | [📝 Auth Endpoints](#3-auth-endpoints) |
| 4 | [📄 Resume Endpoints](#4-resume-endpoints) |
| 5 | [🗺️ Roadmap Endpoints](#5-roadmap-endpoints) |
| 6 | [📈 Market Endpoints](#6-market-endpoints) |
| 7 | [🧠 Career Full Analysis (SSE)](#7-career-full-analysis-sse) |
| 8 | [🔗 LinkedIn Endpoints](#8-linkedin-endpoints) |
| 9 | [🎤 Interview Endpoints (WebSocket)](#9-interview-endpoints-websocket) |
| 10 | [🎙️ Voice Assistant (WebSocket)](#10-voice-assistant-websocket) |
| 11 | [👤 User Endpoints](#11-user-endpoints) |
| 12 | [🏥 Health Endpoints](#12-health-endpoints) |
| 13 | [🛡️ Admin & Observability](#13-admin--observability-endpoints) |
| 14 | [❌ Error Codes](#14-error-codes) |
| 15 | [🚦 Rate Limits](#15-rate-limits) |

---

## 1. 🌐 **Overview**

### 📡 **Base URLs**

| Environment | Base URL | Docs |
|-------------|----------|------|
| 🌍 **Production** | `https://ai-career-mentor-rrpu.onrender.com` | `/docs` |
| 💻 **Local** | `http://localhost:8000` | `/docs` |

### 🚇 **Protocols**

| Protocol | Transport | Content Type | Use Cases |
|----------|-----------|:------------:|-----------|
| **REST** 📝 | HTTP/1.1 | `application/json` | CRUD operations, Auth, File upload |
| **SSE** 📡 | HTTP/1.1 | `text/event-stream` | Full career analysis streaming |
| **WebSocket** 🔌 | WS/WSS | JSON + Binary (PCM) | Mock interviews, Voice coaching |

### 🔒 **Protected vs Public Routes**

| Icon | Meaning |
|:----:|---------|
| 🔓 | Public — No authentication required |
| 🔒 | Protected — Requires JWT Bearer token |

### 📮 **Postman Collection**

To quickly test all REST, SSE, and WebSocket endpoints, a comprehensive Postman Collection is provided in the repository root at [`ai_career_mentor_postman_collection.json`](./ai_career_mentor_postman_collection.json).

* **Authentication Automation**: The collection includes test scripts that automatically capture the `access_token` and `refresh_token` upon a successful login or registration, then populate the environment variables. Protected routes will authorize automatically.
* **Environment Configuration**: Comes configured with variables for switching base URLs, dynamically generating mock email/passwords, saving roadmap IDs, and session IDs.

---

## 2. 🔐 **Authentication**

### 📋 **Token Lifecycle**

| Token | Expiry | Storage | Usage |
|-------|:------:|:-------:|-------|
| **🔑 Access Token** | 60 minutes | `localStorage` | `Authorization: Bearer <token>` header |
| **🔄 Refresh Token** | 30 days | `localStorage` | `POST /auth/refresh` body |

### 📨 **Auth Header Format**

All protected endpoints (marked with 🔒) require:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 🔄 **Auto-Refresh Flow**

```
1. Request with expired token → 401 Unauthorized
2. Axios interceptor catches 401
3. POST /auth/refresh { refresh_token }
4. Get new access_token + refresh_token
5. Retry original request with new token
6. If refresh fails → Redirect to /login
```

---

## 3. 📝 **Auth Endpoints**

### `POST /auth/register` 🔓

**📝 Create a new user account with email/password.**

```json
// Request
{
  "name": "Anil Pradhan",
  "email": "anil@example.com",
  "password": "securepassword123"
}

// Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "name": "Anil Pradhan"
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `400` | Email already registered |

---

### `POST /auth/login` 🔓

**📝 Authenticate with email/password.**

```json
// Request
{
  "email": "anil@example.com",
  "password": "securepassword123"
}

// Response 200 — Same as register
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `401` | Invalid credentials |

---

### `POST /auth/google` 🔓

**🌐 Authenticate via Google OAuth 2.0.** Accepts both ID Tokens (JWT) and Access Tokens (`ya29.`).

```json
// Request
{
  "credential": "ya29.A0AfH6SM..."
}

// Response 200 — Same as register. Creates new user on first login.
```

**🔐 Token Type Detection:**
| Token Type | Detection | Verification Method |
|-----------|:---------:|-------------------|
| **Access Token** `ya29.` | Starts with `ya29.` | Google UserInfo API |
| **ID Token** (JWT) | Contains 2+ dots | `verify_oauth2_token()` |

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `401` | Google authentication failed |

---

### `POST /auth/refresh` 🔓

**🔄 Generate a new token pair using a refresh token.**

```json
// Request
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

// Response 200 — Same as register
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `401` | Could not validate refresh token |

---

## 4. 📄 **Resume Endpoints** 🔒

### `POST /resume/upload`

**📁 Upload a PDF resume and extract text only (no AI analysis).**

| 📥 Field | Type | 📋 Description |
|----------|------|---------------|
| `file` | File | PDF file (max 5MB, `.pdf` only) |

```json
// Response 200
{
  "filename": "anil_resume.pdf",
  "char_count": 3456,
  "preview": "First 500 characters of resume text...",
  "full_text": "Complete extracted text from PDF..."
}
```

**✅ Validation Pipeline:**
```
1. Extension check   → file.endswith('.pdf')
2. MIME type check   → Content-Type = application/pdf
3. Magic bytes check → starts with b'%PDF-'
4. Size limit check  → < 5,242,880 bytes
5. Text extraction   → pdfplumber per-page extraction
6. Temp file cleanup → finally block
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `400` | Only PDF files accepted / Invalid file type |
| `400` | File too large. Max 5 MB |
| `400` | Invalid PDF file content |
| `422` | Could not extract text. Upload a text-based PDF |

---

### `POST /resume/analyze`

**🤖 Upload a PDF resume and run full AI analysis (Deterministic ATS + LLM).**

| 📥 Field | Type | 📋 Description |
|----------|------|---------------|
| `file` | File | PDF file (max 5MB) |

```json
// Response 200
{
  "filename": "anil_resume.pdf",
  "char_count": 3456,
  "cached": false,
  "analysis": {
    "technical_skills": ["Python", "FastAPI", "React", "PostgreSQL"],
    "soft_skills": ["Problem Solving", "Communication", "Team Collaboration"],
    "years_of_experience": 2.5,
    "experience_breakdown": ["SDE at Company X (Jan 2024 - Present)"],
    "top_strengths": [
      "Strong technical breadth across 4 technologies",
      "Professional experience of 2.5 years",
      "Strong action-oriented resume writing"
    ],
    "skill_gaps": ["Missing Cloud/DevOps stack exposure", "No CI/CD tooling experience"],
    "ats_score": 72,
    "ats_score_breakdown": {
      "keywords": 25,
      "achievements": 20,
      "action_verbs": 15,
      "formatting_and_length": 12
    }
  }
}
```

**🧠 Analysis Pipeline:**
```
PDF Upload → 4-Layer Validation → pdfplumber Extraction → 
  Sanitization (injection protection) → Cache Check →
    [Miss] Deterministic ATS (120+ skills, date merging, 4-factor score) → 
    LLM Analysis (NVIDIA NIM → Groq fallback, 120s timeout) → 
    Pydantic Validation (ATS capping, experience normalization) →
    Save to DB → Cache Update → Return Analysis
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `429` | Daily limit reached for resume analysis (max 3) |
| `504` | Resume analysis timed out (exceeded 120s) |
| `500` | Error analyzing resume |

---

## 5. 🗺️ **Roadmap Endpoints** 🔒

### `POST /roadmap/generate`

**🎯 Generate an 8-week personalized learning roadmap with AI-powered resources.**

```json
// Request
{
  "target_role": "Backend Engineer",
  "skill_gaps": ["System Design", "Docker", "CI/CD"],
  "experience_level": "intermediate",
  "learning_style": "balanced"
}
```

| 📌 Param | Type | Default | 📋 Description |
|----------|------|:-------:|---------------|
| `target_role` | string | — | 🎯 Target job role (required) |
| `skill_gaps` | string[] | — | 🔧 Skills to address (required) |
| `experience_level` | string | `intermediate` | 📊 `beginner`, `intermediate`, `advanced` |
| `learning_style` | string | `balanced` | 📐 `balanced`, `theory`, `practical` |

```json
// Response 200
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "target_role": "Backend Engineer",
  "weeks": [
    {
      "week": 1,
      "topic": "System Design Fundamentals",
      "skill_gap_addressed": "System Design",
      "estimated_hours": 10,
      "mini_project": "Design a URL shortener architecture",
      "success_criteria": "Can draw a complete system diagram with trade-offs",
      "why_it_matters": "Foundation for all distributed systems interviews",
      "completed": false,
      "youtube_resources": [
        "https://youtube.com/watch?v=...",
        "https://youtube.com/watch?v=..."
      ],
      "article_resources": [
        "https://blog.example.com/system-design-primer"
      ],
      "github_resources": [
        "https://github.com/donnemartin/system-design-primer"
      ],
      "official_docs": [
        "https://docs.aws.amazon.com/..."
      ]
    }
    // ... 7 more weeks
  ]
}
```

**🧠 Generation Pipeline:**
```
Input → Cache Check → [Miss] → 
  Phase 1: Structure Generation (Google Gemini, 8-week skeleton) →
  Phase 2: Detail Batch (3 + 3 + 2 chunks, parallel LLM) →
  Phase 3: Resource Enrichment (DDG search → heuristic scoring → GitHub audit → URL validation → dedup) →
  Phase 4: Normalize (exactly 8 weeks, required fields) →
  Save to DB + Cache → Return Response
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `400` | `target_role` must not be empty |
| `400` | `skill_gaps` list must not be empty |
| `429` | Daily limit reached / 48h gap lock active |
| `500` | An error occurred while generating the roadmap |

---

### `GET /roadmap/history`

**📋 Fetch all previously generated roadmaps.**

```json
// Response 200
{
  "history": [
    {
      "id": "uuid-string",
      "target_role": "Backend Engineer",
      "created_at": "2026-05-29T10:00:00+00:00",
      "weeks": [
        {"week": 1, "topic": "System Design", "completed": true, ...},
        {"week": 2, "topic": "Docker & K8s", "completed": false, ...}
      ]
    }
  ]
}
```

---

### `PUT /roadmap/{roadmap_id}/toggle-week/{week_number}`

**✅ Toggle or explicitly set the completed status of a specific week.**

| 📌 Param | Type | Default | 📋 Description |
|----------|------|:-------:|---------------|
| `completed` | bool | `null` | Explicit value; if null, toggles current state |

```json
// Response 200
{
  "message": "Week 1 completion updated",
  "weeks": [
    {"week": 1, "topic": "System Design", "completed": true},
    ...
  ]
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `404` | Roadmap not found |
| `404` | Week {n} not found in this roadmap |

---

### `GET /roadmap/{roadmap_id}/quiz/{week_number}`

**📝 Generate 5 AI-powered MCQ quiz questions for a specific week's topic.**

> ⚠️ **Rate Limited**: Free tier allows **3 quizzes/day**. Premium Pro allows **30 quizzes/day** (10x limits). Returns **429** when exhausted.

```json
// Response 200
{
  "topic": "System Design Fundamentals",
  "total_questions": 5,
  "questions": [
    {
      "id": 1,
      "question": "What is the primary purpose of a load balancer?",
      "options": [
        "A. Store data persistently",
        "B. Distribute traffic across servers",
        "C. Compress network packets",
        "D. Encrypt data in transit"
      ],
      "correct_answer": "B",
      "explanation": "A load balancer distributes incoming network traffic across multiple servers to ensure no single server becomes overwhelmed."
    }
    // ... 4 more questions
  ]
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `404` | Roadmap not found |
| `404` | Week not found in this roadmap |
| `429` | Daily limit reached for Weekly Quiz (max 3 per day) |

---

### `DELETE /roadmap/{roadmap_id}`

**🗑️ Delete a specific roadmap.**

```json
// Response 200
{
  "message": "Roadmap deleted successfully"
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `404` | Roadmap not found |

---

## 6. 📈 **Market Endpoints** 🔒

### `GET /market/config`

**⚙️ Returns dynamic configuration for all wizards (Market, Interview, Analysis).**

```json
// Response 200
{
  "locations": [
    "Bangalore, India", "Hyderabad, India", "Mumbai, India",
    "San Francisco, USA", "New York, USA", "Seattle, USA",
    "London, UK", "Berlin, Germany", "Dubai, UAE",
    "Singapore", "Sydney, Australia", "Remote"
  ],
  "roles": [
    "Software Engineer", "Data Scientist", "ML Engineer",
    "DevOps Engineer", "Product Manager", "Security Engineer",
    "Full Stack Developer", "Backend Engineer", "Frontend Engineer"
  ],
  "companies": {
    "google": {"name": "Google", "style": "GCA", "tier": "tier_1"},
    "microsoft": {"name": "Microsoft", "style": "AZ", "tier": "tier_1"},
    "amazon": {"name": "Amazon", "style": "LP", "tier": "tier_1"},
    "meta": {"name": "Meta", "style": "Meta", "tier": "tier_1"},
    "startup": {"name": "Startup", "style": "general", "tier": "other"}
  },
  "seniorities": ["Junior", "Middle", "Senior", "Principal"]
}
```

---

### `GET /market/trends`

**🔍 Fetch real-time, region-aware job market intelligence with live search.**

| 📌 Param | Type | Required | 📋 Description |
|----------|------|:--------:|---------------|
| `role` | string | ✅ | Target job role (e.g., `Data Scientist`) |
| `location` | string | ✅ | Target location (e.g., `Bangalore, India`) |
| `seniority` | string | ❌ | Experience level (`intern`, `junior`, `mid`, `senior`) |

```json
// Response 200
{
  "role": "Data Scientist",
  "location": "Bangalore, India",
  "seniority": "mid",
  "salary_range": {
    "min": 1200000,
    "max": 3500000,
    "currency": "INR",
    "formatted": "₹12,00,000 – ₹35,00,000 per annum"
  },
  "market_trend": "High Growth",
  "hiring_volume": "2,500+ Active Roles",
  "hiring_companies": [
    {"name": "Google", "hiring_volume": "Active openings"},
    {"name": "Microsoft", "hiring_volume": "Hiring ML Engineers"},
    {"name": "Flipkart", "hiring_volume": "Growing team"}
  ],
  "top_skills_freq": [
    {"skill": "Python", "frequency": 92},
    {"skill": "TensorFlow", "frequency": 78},
    {"skill": "SQL", "frequency": 85},
    {"skill": "PyTorch", "frequency": 71}
  ],
  "summary": "Strong demand for Data Scientists in Bangalore with competitive salaries ranging from ₹12L to ₹35L. Python and deep learning frameworks dominate the skill requirements.",
  "sources": [
    "https://linkedin.com/jobs/...",
    "https://naukri.com/..."
  ],
  "provider": "groq",
  "is_live": true
}
```

**🧠 Intelligence Pipeline:**
```
Input → Role Classification (domain + seniority) → Region Mapping (currency + multipliers) →
  Live Search: Tavily (primary) → Serper (fallback) → Deep URL Scraping →
  URL Classification (job_portal / blog / other) →
  Deterministic Extraction (sources, region profile) →
  LLM Structured Extraction (Groq, temp=0.2) →
  Merge LLM + Deterministic → Pydantic Validation →
  Save to DB → Return Report
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `429` | Daily limit reached for market research (max 3) |
| `500` | Market error: {detail} |

---

### `GET /market/history`

**📋 Fetch saved market intelligence history.**

| 📌 Param | Type | Default | 📋 Description |
|----------|------|:-------:|---------------|
| `limit` | int | `10` | Max results (1-50) |

```json
// Response 200
[
  {
    "id": "uuid-string",
    "target_role": "Data Scientist",
    "location": "Bangalore, India",
    "analysis": { ... full market report ... },
    "created_at": "2026-05-29T10:00:00+00:00"
  }
]
```

---

### `DELETE /market/{analysis_id}`

**🗑️ Delete a saved market analysis.**

```json
// Response 200
{
  "message": "Market analysis deleted successfully"
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `404` | Market analysis not found |

---

## 7. 🧠 **Career Full Analysis (SSE)** 🔒

### `POST /career/full-analysis/stream`

**🚀 Execute the complete LangGraph DAG pipeline via Server-Sent Events (SSE).**

This is the central orchestration endpoint of the Career AI Operating System. It runs a parallel multi-agent pipeline using a directed acyclic graph (DAG) in LangGraph, validates Pydantic models at each step, executes repair/fallback rules on error, and streams real-time logs and final results to the client.

#### 📡 **SSE Protocol & Connection Mechanics**
- **Transport**: `HTTP/1.1`
- **Headers**:
  - `Content-Type`: `text/event-stream`
  - `Cache-Control`: `no-cache`
  - `Connection`: `keep-alive`
- **Auth**: Requires JWT authorization. Because standard browser `EventSource` does not support custom headers natively, the client must use a `fetch` request with a stream reader (see [Client-Side Integration](#-client-side-integration-example) below).

#### 📊 **Pipeline Execution Flow (LangGraph DAG)**

```mermaid
graph TD
    classDef startCls fill:#818cf8,color:#fff
    classDef nodeCls fill:#34d399,color:#fff
    classDef endCls fill:#ef4444,color:#fff

    START(["▶ START"]) --> RESUME["📄 Resume Node<br/>• ATS parser<br/>• NVIDIA NIM Analysis"]
    START --> MARKET["📈 Market Node<br/>• Live Search Scraper<br/>• Groq Extraction"]

    RESUME --> LINKEDIN["🔗 LinkedIn Node<br/>• Recruiter Trends<br/>• Profile Optimization"]
    MARKET --> LINKEDIN

    RESUME --> ROADMAP["🗺️ Roadmap Node<br/>• Gemini Week Structure<br/>• Batch Resource RAG"]
    MARKET --> ROADMAP

    LINKEDIN --> END_NODE(["🏁 END & Save to DB"])
    ROADMAP --> END_NODE

    class START startCls
    class RESUME,MARKET,LINKEDIN,ROADMAP nodeCls
    class END_NODE endCls
```

- **Phase 1 (Parallel)**: `Resume Node` and `Market Node` run concurrently. Latency = `max(resume, market)`.
- **Phase 2 (Parallel)**: `LinkedIn Node` and `Roadmap Node` wait for both Phase 1 nodes to finish, then execute concurrently. Latency = `max(linkedin, roadmap)`.
- **Total Latency**: ~45s - 60s depending on LLM response speeds.

#### 📨 **Request Payload**
- **Content-Type**: `application/json`

```json
{
  "target_role": "Full Stack Developer",
  "resume_text": "Experienced developer with Python, FastAPI, and React skills. Built several distributed systems and scaled databases...",
  "location": "Bangalore, India",
  "provider": null
}
```

#### 📡 **SSE Event Format & Types**

The server streams data in standard Event-Stream format (`data: <JSON>\n\n`). Every message is a JSON object containing a `type` field:

1. **`log`**: Real-time progress updates sent as soon as a graph node starts, runs fallbacks, or completes.
   ```json
   data: {"type": "log", "message": "[2026-06-07T01:30:00] Started Resume Analysis", "node": "resume"}
   ```
2. **`error`**: Emitted if a non-fatal error occurs inside a node (e.g., validation fail or API timeout) prompting a repair flow.
   ```json
   data: {"type": "error", "message": "Resume validation failed: years_of_experience out of range. Running fallback.", "node": "resume"}
   ```
3. **`result`**: The final aggregated pipeline output. It is sent as a single large payload when the graph reaches the `END` state.
4. **`close`**: Signifies the end of the stream. The client should close the connection upon receiving this.
   ```json
   data: {"type": "close"}
   ```

#### 📦 **Complete Final Result Payload Schema (`type: "result"`)**

```json
data: {
  "type": "result",
  "payload": {
    "status": "success",
    "output": {
      "resume_analysis": {
        "technical_skills": ["Python", "React", "Docker", "FastAPI"],
        "soft_skills": ["Problem Solving", "Team Collaboration"],
        "years_of_experience": 3.5,
        "experience_breakdown": [
          "SDE at Tech Solutions (Jan 2023 - Present)"
        ],
        "top_strengths": [
          "Strong backend experience with FastAPI",
          "Solid frontend capabilities"
        ],
        "skill_gaps": [
          "No Kubernetes container orchestration",
          "No AWS cloud deployment exposure"
        ],
        "ats_score": 85,
        "ats_score_breakdown": {
          "keywords": 30,
          "achievements": 25,
          "action_verbs": 15,
          "formatting_and_length": 15
        }
      },
      "market_trends": {
        "role": "Full Stack Developer",
        "location": "Bangalore, India",
        "seniority": "mid",
        "salary_range": {
          "min": 1200000,
          "max": 2500000,
          "currency": "INR",
          "formatted": "₹12,00,000 – ₹25,00,000 per annum"
        },
        "market_trend": "High Demand",
        "hiring_volume": "1,800+ Active Roles",
        "hiring_companies": [
          {"name": "Google", "hiring_volume": "Active openings"},
          {"name": "Flipkart", "hiring_volume": "Growing team"}
        ],
        "top_skills_freq": [
          {"skill": "React", "frequency": 90},
          {"skill": "Python", "frequency": 85}
        ],
        "summary": "High volume of open full-stack roles in Bangalore. Python + React developers command ₹12L-₹25L.",
        "sources": ["https://linkedin.com/jobs/"]
      },
      "roadmap": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "target_role": "Full Stack Developer",
        "weeks": [
          {
            "week": 1,
            "topic": "Containerization with Docker",
            "skill_gap_addressed": "No container orchestration",
            "estimated_hours": 12,
            "mini_project": "Dockerize a multi-container FastAPI + Postgres application",
            "success_criteria": "Can run docker-compose up and verify app communication",
            "why_it_matters": "Core skill for modern deployment pipelines",
            "completed": false,
            "youtube_resources": ["https://www.youtube.com/results?search_query=docker+tutorial"],
            "article_resources": ["https://docs.docker.com/get-started/"],
            "github_resources": ["https://github.com/docker/labs"],
            "official_docs": ["https://docs.docker.com"]
          }
          // ... Weeks 2-8 follow
        ]
      },
      "linkedin_strategy": {
        "headlines": [
          "Full Stack Developer | Python (FastAPI) & React Expert 💻 | Building Scalable Web Apps 🚀"
        ],
        "about_section": "👋 Hi, I am a Full Stack Developer specializing in FastAPI backends and React frontends...",
        "demanding_skills": ["FastAPI", "React", "Docker", "PostgreSQL"],
        "ats_keywords_to_inject": ["Scalability", "API Optimization", "CI/CD"],
        "recruiter_search_trends": ["Increasing searches for Python + React hybrid engineers"],
        "profile_density_advice": "Add key technical metrics to your experiences. List at least 5 backend skills.",
        "certifications": ["AWS Certified Developer"]
      }
    },
    "logs": [
      "[2026-06-07T01:30:00] Started Resume Analysis",
      "[2026-06-07T01:30:05] Resume Node Complete",
      "..."
    ],
    "errors": [],
    "metadata": {
      "execution_time": "Completed",
      "agents_involved": 4,
      "roadmap_weeks": 8
    }
  }
}
```

#### 🚦 **Rate Limits & Gap Locks**
- **Daily Limit**: **1 request / day** (Free tier).
- **Gap Lock**: **48-hour cooldown lock** is activated on successful completion. Any call within 48 hours returns a `429 Too Many Requests` status.

#### 🔴 **Error Responses**

| Code | 💡 Detail |
|:----:|-----------|
| `401` | Unauthorized (Missing/invalid JWT bearer token) |
| `429` | Daily limit reached or 48-hour gap lock active |
| `500` | Internal server error (Graph orchestration collapsed on all fallback nodes) |

---

#### 🔌 **Client-Side Integration Example (React / TypeScript)**

Since standard browser `EventSource` does not support adding custom authorization headers (`Authorization: Bearer <token>`), you must fetch the stream using standard HTTP fetch and parse the chunks manually:

```typescript
async function startCareerAnalysisStream(
  requestBody: { target_role: string; resume_text: string; location: string },
  jwtToken: string,
  onLogReceived: (log: string) => void,
  onResultReceived: (result: any) => void,
  onError: (err: string) => void
) {
  try {
    const response = await fetch("http://localhost:8000/career/full-analysis/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 429) {
      onError("Rate limit exceeded or 48h lock is active.");
      return;
    }
    if (!response.ok) {
      onError(`Server error: ${response.statusText}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("ReadableStream not supported by browser.");

    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      
      // Save the last incomplete line back to the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine.startsWith("data: ")) continue;

        const rawJson = cleanLine.substring(6).trim();
        if (!rawJson) continue;

        const event = JSON.parse(rawJson);

        if (event.type === "log") {
          onLogReceived(event.message);
        } else if (event.type === "error") {
          onError(event.message);
        } else if (event.type === "result") {
          onResultReceived(event.payload);
        } else if (event.type === "close") {
          reader.cancel();
          return;
        }
      }
    }
  } catch (err: any) {
    onError(`Stream read error: ${err.message}`);
  }
}
```

---

## 8. 🔗 **LinkedIn Endpoints** 🔒

### `POST /linkedin/optimize`

**💼 Generate a LinkedIn profile optimization strategy with ATS keyword injection and recruiter trends.**

```json
// Request
{
  "target_role": "Backend Engineer"
}
```

```json
// Response 200
{
  "cached": false,
  "strategy": {
    "headlines": [
      "Backend Engineer | Building Scalable & Distributed Systems 💻 | Python & Cloud Enthusiast 🚀",
      "Software Engineer | Backend API Design & Cloud Architecture Specialist 🛠️",
      "Backend Engineer | Scalable Microservices & System Design Expert ⚙️ | Tech Career Mentor"
    ],
    "about_section": "👋 Hi there! I am a passionate Backend Engineer dedicated to crafting clean, efficient, and scalable software solutions.\n\n💻 With 3+ years of experience in designing and building distributed systems, I specialize in:\n• System Design & Microservices Architecture 🏗️\n• Cloud-Native Development (AWS, Docker, K8s) ☁️\n• RESTful API Design & Optimization 🔌\n\n🚀 I thrive in fast-paced environments where I can solve complex engineering challenges and mentor junior developers.\n\n📫 Let's connect if you're looking for a passionate backend engineer!",
    "demanding_skills": ["System Design", "PostgreSQL", "Docker", "REST APIs", "Microservices"],
    "ats_keywords_to_inject": [
      "Scalability", "Distributed Systems", "API Design",
      "Cloud Architecture", "CI/CD", "Database Optimization"
    ],
    "recruiter_search_trends": [
      "Increasing demand for backend engineers with microservices and containerization experience",
      "Recruiters prioritizing candidates with system design knowledge for senior roles"
    ],
    "profile_density_advice": "Ensure your headline uses high-converting keywords and your experience bullet points start with strong action verbs (Developed, Engineered, Architected). List at least 5 key skills with endorsements.",
    "certifications": [
      "AWS Certified Developer – Associate",
      "Docker Certified Associate",
      "Meta Backend Developer Certificate"
    ]
  }
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `400` | Target role is required |
| `429` | Daily limit reached for LinkedIn optimization (max 4) |
| `500` | LinkedIn optimization failed: {detail} |

---

## 9. 🎤 **Interview Endpoints (WebSocket)**

### `WebSocket /interview/ws/{session_id}`

**🎯 Establishes a WebSocket connection for a real-time mock interview session with 7-phase FSM.**

**📡 Connection URL:**

```
ws://localhost:8000/interview/ws/{session_id}?role=Software+Engineer&company=Google&type=technical&token=JWT_TOKEN
```

| 📌 Param | Type | Default | 📋 Description |
|----------|------|:-------:|---------------|
| `role` | string | `Software Engineer` | 🎯 Target interview role |
| `company` | string | `A top tech company` | 🏢 Target company for context |
| `company_style` | string | `null` | 🎭 Company interview style (GCA, LP, AZ, Meta) |
| `company_tier` | string | `other` | 🏅 Company tier classification |
| `token` | string | `null` | 🔐 JWT access token (recommended in query) |
| `type` | string | `technical` | 🎪 Interview type (`technical` or `behavioral`) |

**🎭 7-Phase Interview FSM:**
```
Phase 0: INITIAL → Phase 1: INTRO (2-3 min)
Phase 1: INTRO → Phase 2: CS_FUNDAMENTALS (3-5 min)
Phase 2: CS_FUNDAMENTALS → Phase 3: LEETCODE (10-15 min)
Phase 3: LEETCODE → Phase 4: PROJECT_DEEPDIVE (3-5 min)
Phase 4: PROJECT_DEEPDIVE → Phase 5: SYSTEM_DESIGN (8-12 min)
Phase 5: SYSTEM_DESIGN → Phase 6: COMPANY_DOMAIN (3-5 min)
Phase 6: COMPANY_DOMAIN → Phase 7: CLOSING (2-3 min)
Phase 7: CLOSING → Phase 8: FEEDBACK (scoring)
```

**🎯 Role Category Adaptation:**
| Category | CS Focus | Coding Style | System Design |
|----------|----------|-------------|---------------|
| 💻 SWE | OS/CN/DBMS | LeetCode | General SD |
| 🤖 Data/AI | ML/Stats | ML Case Study | ML Pipeline |
| ☁️ Infra/Cloud | Containers/CI | Infra Scenario | Cloud Arch |
| 🔐 Security | AppSec/Crypto | CTF Challenge | Security Arch |

**📨 Client → Server Messages:**

```json
// ✅ Answer a question
{
  "type": "response",
  "text": "I have 2 years of experience in full stack development..."
}

// 💻 Code update (LeetCode phase)
{
  "type": "code_update",
  "code": "function solve(nums) {\n  return nums.sort((a,b) => a - b);\n}"
}
```

**📩 Server → Client Messages:**

```json
// 💬 Interviewer question
{
  "type": "question",
  "phase": "intro",
  "text": "Welcome! Tell me about yourself and your experience.",
  "audio": "base64_encoded_tts_audio..."
}

// 💻 Coding challenge (LeetCode phase)
{
  "type": "question",
  "phase": "leetcode",
  "text": "Implement a function to find the longest palindromic substring.",
  "code_stub": "function longestPalindrome(s) {\n  // Your code here\n}"
}

// 📊 Feedback
{
  "type": "feedback",
  "text": "Great solution! Your time complexity analysis was spot on.",
  "phase": "leetcode"
}

// 🎯 Phase transition
{
  "type": "phase_update",
  "phase": 3,
  "phase_name": "LEETCODE"
}

// 🏆 Session score
{
  "type": "score",
  "score": 78.5,
  "feedback": "Strong problem-solving skills. Focus on system design depth.",
  "question_scores": [
    {"intro": 85, "cs_fundamentals": 80, "leetcode": 75, "system_design": 70}
  ]
}

// 🎵 Audio chunk
{
  "type": "audio",
  "data": "base64_encoded_audio_chunk..."
}
```

---

### `GET /interview/history` 🔒

**📋 Fetch previous mock interview sessions.**

```json
// Response 200
{
  "history": [
    {
      "id": "session-uuid-1",
      "target_role": "Software Engineer",
      "created_at": "2026-05-29T10:00:00+00:00",
      "score": 78.5,
      "status": "completed"
    },
    {
      "id": "session-uuid-2",
      "target_role": "Data Scientist",
      "created_at": "2026-05-28T14:00:00+00:00",
      "score": null,
      "status": "in_progress"
    }
  ]
}
```

---

### `GET /interview/{session_id}` 🔒

**📄 Fetch full details of a specific interview session including chat history.**

```json
// Response 200
{
  "id": "session-uuid",
  "target_role": "Software Engineer",
  "score": 78.5,
  "status": "completed",
  "created_at": "2026-05-29T10:00:00+00:00",
  "chat_history": [
    {"role": "interviewer", "content": "Welcome! Let me start with...", "timestamp": "..."},
    {"role": "candidate", "content": "Thank you! I have 2 years...", "timestamp": "..."}
  ]
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `404` | Interview not found |

---

### `DELETE /interview/{session_id}` 🔒

**🗑️ Delete a specific interview session.**

```json
// Response 200
{
  "message": "Interview deleted successfully"
}
```

| 🔴 Error | 💡 Detail |
|:--------:|-----------|
| `404` | Interview not found |

---

## 10. 🎙️ **Voice Assistant (WebSocket)**

### `WebSocket /career/voice-assistant/ws`

**🗣️ Real-time bidirectional voice conversation with Anya — your AI Career Coach.**

**📡 Connection URL:**

```
ws://localhost:8000/career/voice-assistant/ws?token=JWT_TOKEN
```

> ⚠️ **Authentication:** JWT token is **required** as query parameter. Rate limit: **2 calls/day**, max **5 minutes** per call.

**🧬 Anya's Configuration:**
| Feature | Value |
|---------|-------|
| **Name** | Anya 🎀 |
| **Language** | Hinglish (Hindi + English) 🇮🇳 |
| **Tone** | Sweet, friendly, encouraging, career mentor |
| **Voice** | Google's Aoede (Gemini Live) |
| **Context Awareness** | Resume analysis, roadmap progress, target role, market data |

**📨 Client → Server Messages:**

```json
// 🎤 Audio chunk (16kHz PCM, base64 encoded)
{
  "type": "audio",
  "data": "base64_encoded_PCM_16kHz_chunk..."
}

// 🛑 Interrupt AI speech
{
  "type": "interrupt"
}

// ❤️ Keepalive ping
{
  "type": "ping"
}
```

**📩 Server → Client Messages:**

```json
// 🎵 AI audio response (24kHz PCM, base64 encoded)
{
  "type": "audio",
  "data": "base64_encoded_PCM_24kHz_chunk..."
}

// 📝 Speech transcript
{
  "type": "transcript",
  "text": "Haan, toh tumhara resume dekh ke lagta hai ki tumhe system design pe focus karna chahiye! 🚀"
}

// 🛑 AI speech was interrupted
{
  "type": "interrupted"
}

// ⏱️ Call time limit reached
{
  "type": "time_limit",
  "message": "Call time limit reached (7m 30s). Please start a new call."
}

// ⚠️ Error
{
  "type": "error",
  "message": "Something went wrong. Please try again."
}

// ✅ Connection setup complete
{
  "type": "setup_complete",
  "call_id": "uuid-call-id"
}
```

**🔁 Bidirectional Audio Relay Flow:**
```
Client (16kHz PCM) → Server → Gemini Live (realtimeInput)
Gemini Live → Server → Client (24kHz PCM + transcript)
```

---

## 11. 👤 **User Endpoints** 🔒

### `GET /user/stats`

**📊 Fetch comprehensive dashboard statistics including activity, usage, and history.**

```json
// Response 200
{
  "lastResumeAnalysis": {
    "filename": "resume.pdf",
    "technical_skills": ["Python", "React", "Docker"],
    "ats_score": 72,
    "top_strengths": ["Strong technical breadth"],
    "skill_gaps": ["System Design", "Docker"],
    "analyzed_at": "2026-05-29T10:00:00+00:00"
  },
  "usageToday": {
    "resume": 1,
    "market": 0,
    "roadmap": 0,
    "linkedin": 1,
    "full_analysis": 0,
    "interview": 0,
    "voice": 0
  },
  "weeklyActivity": [
    {"day": "Mon", "actions": 3},
    {"day": "Tue", "actions": 5},
    {"day": "Wed", "actions": 2},
    {"day": "Thu", "actions": 7},
    {"day": "Fri", "actions": 4},
    {"day": "Sat", "actions": 1},
    {"day": "Sun", "actions": 0}
  ],
  "monthlyActivity": [
    {"week": "W1", "actions": 12},
    {"week": "W2", "actions": 18},
    {"week": "W3", "actions": 8},
    {"week": "W4", "actions": 15}
  ],
  "activityLog": [
    {
      "label": "Analyzed Resume",
      "time": "2026-05-29T10:00:00+00:00",
      "color": "#818cf8"
    },
    {
      "label": "Generated Roadmap",
      "time": "2026-05-29T11:00:00+00:00",
      "color": "#34d399"
    }
  ],
  "roadmapHistory": [
    {
      "id": "uuid",
      "target_role": "Backend Engineer",
      "created_at": "2026-05-29T10:00:00+00:00",
      "progress": 62.5
    }
  ],
  "interviewHistory": [
    {"score": 78.5, "status": "completed", "created_at": "2026-05-29T10:00:00Z"}
  ],
  "analysisHistory": [
    {"role": "Full Stack Developer", "location": "Bangalore", "created_at": "..."}
  ],
  "todayActionCount": 4,
  "careerReportDepthToday": 100,
  "streak": 5
}
```

---

## 12. 🏥 **Health Endpoints**

### `GET /health` 🔓

**🏥 Full system health check (includes database connectivity test).**

```json
// Response 200
{
  "status": "ok",
  "database": "connected",
  "service": "AI Career Mentor",
  "version": "1.0.0",
  "provider": "hybrid",
  "model": "hybrid",
  "timestamp": "2026-05-29T18:00:00+00:00"
}
```

```json
// Response 503 (DB down)
{
  "status": "degraded",
  "database": "disconnected",
  "service": "AI Career Mentor",
  "version": "1.0.0",
  "provider": "hybrid",
  "model": "hybrid",
  "timestamp": "2026-05-29T18:00:00+00:00"
}
```

---

### `GET /ping` 🔓

**🏓 Lightweight keep-alive endpoint (used by Render free tier cron to prevent spin-down).**

```json
// Response 200
{
  "pong": true
}
```

---

### `GET /` 🔓

**🏠 Root endpoint with navigation links.**

```json
// Response 200
{
  "message": "Welcome to AI Career Mentor API 🚀",
  "docs": "/docs",
  "health": "/health"
}
```

---

## 13. 🛡️ **Admin & Observability Endpoints**

### `GET /admin/metrics` 🔒 (Admin Whitelist Only)

**📊 Retrieves all real-time observability telemetry (Active users/WS, LLM latency arrays, costs, daily rollups, and rolling error log exception feed).**

* **Header Requirements**: `Authorization: Bearer <Admin Token>` (Only email `anilpradhan9644@gmail.com` is whitelisted).
* **Response 200**:
```json
{
  "active_users": 1,
  "active_websockets": 0,
  "latencies": {
    "nvidia": [1.25, 0.98],
    "groq": [0.55, 0.62],
    "google": [2.12]
  },
  "error_logs": [
    {
      "timestamp": "2026-05-31T04:45:00Z",
      "message": "Redis connection timeout",
      "traceback": "Traceback (most recent call last):\n..."
    }
  ],
  "historical_chart": [
    {
      "date": "2026-05-31",
      "requests": 25,
      "tokens": 120500,
      "cost": 0.0825,
      "fallbacks": 1,
      "errors": 0
    }
  ],
  "settings": {
    "llm_provider": "hybrid",
    "active_model": "llama-3.3-70b-versatile"
  }
}
```

* **Response 403 (Standard User)**:
```json
{
  "detail": "Forbidden: Admin access required"
}
```

---

### `GET /admin/prometheus-metrics` 🔒 (Admin Whitelist Only)

**📈 Exposes standard Prometheus scrape format metrics for server status instrumentation.**

* **Header Requirements**: `Authorization: Bearer <Admin Token>`
* **Response 200**: Prometheus raw text metrics.

---

## 14. ❌ **Error Codes**

### 📋 **Complete Error Reference**

| 🔴 Code | 🏷️ Meaning | 💡 Common Causes | 🛡️ Resolution |
|:-------:|:-----------:|------------------|---------------|
| **400** | Bad Request | Invalid input, missing fields, duplicate email, invalid PDF | Check request format and field requirements |
| **401** | Unauthorized | Invalid/expired JWT, bad Google OAuth token | Re-authenticate or refresh token |
| **404** | Not Found | Roadmap, interview, or market analysis not found | Verify resource ID exists for current user |
| **422** | Unprocessable Entity | Cannot extract text from scanned PDF | Upload a text-based PDF (not scanned/image) |
| **429** | Too Many Requests | Daily rate limit reached or 48h gap lock active | Wait for daily reset or 48h lock expiry |
| **500** | Internal Server Error | LLM provider failure, database error, unexpected exception | Retry; if persists, contact support |
| **504** | Gateway Timeout | Resume analysis exceeded 120s timeout | Try again with a shorter resume |

### 📨 **Error Response Format**

All errors follow a consistent JSON format:

```json
// Single error
{
  "detail": "Human-readable error message describing the issue"
}

// Validation error (multiple fields)
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error"
    },
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 6 characters",
      "type": "value_error"
    }
  ]
}

// Rate limit error
{
  "detail": "Daily limit reached for resume analysis (max 3 per day). Try again tomorrow."
}
```

### 🎯 **Error by Endpoint**

| Endpoint | 400 | 401 | 404 | 422 | 429 | 500 | 504 |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/auth/register` | ✅ | — | — | ✅ | — | — | — |
| `/auth/login` | — | ✅ | — | — | — | — | — |
| `/auth/google` | — | ✅ | — | — | — | — | — |
| `/auth/refresh` | — | ✅ | — | — | — | — | — |
| `/resume/upload` | ✅ | — | — | ✅ | — | — | — |
| `/resume/analyze` | ✅ | — | — | — | ✅ | ✅ | ✅ |
| `/roadmap/generate` | ✅ | — | — | — | ✅ | ✅ | — |
| `/roadmap/{id}/quiz/{week}` | — | — | ✅ | — | ✅ | — | — |
| `/market/trends` | — | — | — | — | ✅ | ✅ | — |
| `/career/full-analysis/stream` | — | — | — | — | ✅ | ✅ | — |
| `/linkedin/optimize` | ✅ | — | — | — | ✅ | ✅ | — |
| `/interview/*` | — | ✅ | ✅ | — | — | — | — |
| `/user/stats` | — | — | — | — | — | — | — |

---

## 15. 🚦 **Rate Limits**

### 🌐 **Global Rate Limits (per IP — SlowAPI)**

| Environment | Daily Limit | Hourly Limit | Backend |
|-------------|:-----------:|:------------:|---------|
| 💻 **Development** | 100,000 requests/day | Unlimited | `memory://` (no Redis needed) |
| 🌍 **Production** | 1,000 requests/day | 100 requests/hour | Redis (Upstash) |

### 📊 **Per-Feature Daily Caps (per user)**

| Feature | 🚦 Daily Cap | ⏰ 48h Lock | 🔑 Redis Key Pattern |
|---------|:----------:|:-----------:|---------------------|
| **📄 Resume Analysis** | **3** | ❌ | `usage:{uid}:resume:{date}` |
| **📈 Market Research** | **3** | ❌ | `usage:{uid}:market:{date}` |
| **🔗 LinkedIn Optimization** | **4** | ❌ | `usage:{uid}:linkedin:{date}` |
| **🗺️ Roadmap Generation** | **1** | ❌ | `usage:{uid}:roadmap:{date}` |
| **🧠 Full Career Analysis** | **1** | ✅ | `usage:{uid}:full_analysis:{date}` + `lock:full_analysis:{uid}` |
| **🎤 Mock Interview** | **1** | ✅ | `usage:{uid}:interview:{date}` + `lock:interview:{uid}` |
| **📝 Weekly Quiz** | **3** | ❌ | `usage:{uid}:quiz:{date}` |
| **🎙️ Voice Assistant** | **2** | ❌ (5 min max) | `usage:{uid}:voice_assistant:{date}` |

### 🚦 **Rate Limit Error Response**

When a rate limit is exceeded, the API returns:

```json
// HTTP 429 Too Many Requests
{
  "detail": "🚫 Daily limit reached for resume analysis (max 3 per day)."
}

// HTTP 429 with 48h lock
{
  "detail": "🔒 This feature is locked for 48 hours. Please check back later."
}
```

### ⚠️ **Important Notes**

> - Rate limits are **bypassed** when `APP_ENV=development` (local development)
> - **48h gap locks** use Redis TTL keys with 48-hour expiry
> - Voice Assistant has a **5 minute maximum call duration** per session
> - Rate limit counters **reset daily** at midnight UTC

---

<div align="center">

---

**Built with 🧠 by [Anil Pradhan](https://github.com/Anil-Pradhan-web)**

| 📘 README | 🏗️ Architecture | 🖥️ System Design | ⚙️ API Reference |
|:---------:|:---------------:|:-----------------:|:----------------:|
| [README.md](./README.md) | [ARCHITECTURE.md](./ARCHITECTURE.md) | [SYSTEM.md](./SYSTEM.md) | **You are here** |

---

</div>