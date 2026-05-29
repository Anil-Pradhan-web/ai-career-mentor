<div align="center">

# ⚙️ AI Career Mentor — API Reference

*Complete REST + WebSocket API documentation*

[![Swagger UI](https://img.shields.io/badge/Swagger%20UI-Live-46E3B7?style=for-the-badge&logo=swagger)](https://ai-career-mentor-rrpu.onrender.com/docs)

</div>

---

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Auth Endpoints](#1-auth-endpoints)
- [Resume Endpoints](#2-resume-endpoints)
- [Roadmap Endpoints](#3-roadmap-endpoints)
- [Market Endpoints](#4-market-endpoints)
- [Career Full Analysis Endpoints](#5-career-full-analysis-endpoints)
- [LinkedIn Endpoints](#6-linkedin-endpoints)
- [Interview Endpoints](#7-interview-endpoints-websocket)
- [Voice Assistant Endpoints](#8-voice-assistant-endpoint-websocket)
- [User Endpoints](#9-user-endpoints)
- [Health Endpoints](#10-health-endpoints)
- [Error Codes](#error-codes)
- [Rate Limits](#rate-limits)

---

## Overview

| Property | Value |
|----------|-------|
| **Base URL (Production)** | `https://ai-career-mentor-rrpu.onrender.com` |
| **Base URL (Local)** | `http://localhost:8000` |
| **Protocol** | REST (JSON), SSE (text/event-stream), WebSocket |
| **Auth** | Bearer JWT (access_token) |
| **Content-Type** | `application/json` (unless specified) |
| **Swagger UI** | `{BASE_URL}/docs` |
| **ReDoc** | `{BASE_URL}/redoc` |

---

## Authentication

All protected endpoints (marked with 🔒) require a valid JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Lifecycle
| Token | Expiry | Usage |
|-------|--------|-------|
| Access Token | 60 minutes | API authentication |
| Refresh Token | 30 days | Generate new access tokens |

---

## 1. Auth Endpoints

### `POST /auth/register`
Create a new user account with email/password.

**Request Body:**
```json
{
  "name": "Anil Pradhan",
  "email": "anil@example.com",
  "password": "securepassword123"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "name": "Anil Pradhan"
}
```

**Errors:**
| Code | Detail |
|------|--------|
| `400` | Email already registered |

---

### `POST /auth/login`
Authenticate with email/password.

**Request Body:**
```json
{
  "email": "anil@example.com",
  "password": "securepassword123"
}
```

**Response `200`:** Same as register.

**Errors:**
| Code | Detail |
|------|--------|
| `401` | Invalid credentials |

---

### `POST /auth/google`
Authenticate via Google OAuth 2.0. Accepts both ID Tokens and Access Tokens.

**Request Body:**
```json
{
  "credential": "ya29.A0AfH6SM..."
}
```

**Response `200`:** Same as register. Creates new user on first login.

**Errors:**
| Code | Detail |
|------|--------|
| `401` | Google authentication failed |

---

### `POST /auth/refresh`
Generate a new token pair using a refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200`:** Same as register.

**Errors:**
| Code | Detail |
|------|--------|
| `401` | Could not validate refresh token |

---

## 2. Resume Endpoints 🔒

### `POST /resume/upload`
Upload a PDF resume and extract text only (no AI analysis).

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF file (max 5MB) |

**Response `200`:**
```json
{
  "filename": "resume.pdf",
  "char_count": 3456,
  "preview": "First 500 characters of resume text...",
  "full_text": "Complete extracted text..."
}
```

**Errors:**
| Code | Detail |
|------|--------|
| `400` | Only PDF files accepted / Invalid file type / File too large / Invalid PDF content |
| `422` | Could not extract text (scanned PDF) |

---

### `POST /resume/analyze`
Upload a PDF resume and run full AI analysis (deterministic ATS + LLM).

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF file (max 5MB) |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `provider` | string | `null` | LLM provider override (`groq`, `nvidia`) |

**Response `200`:**
```json
{
  "filename": "resume.pdf",
  "char_count": 3456,
  "cached": false,
  "analysis": {
    "technical_skills": ["Python", "FastAPI", "React", "PostgreSQL"],
    "soft_skills": ["Problem Solving", "Communication"],
    "years_of_experience": 2.5,
    "experience_breakdown": ["SDE at Company X (Jan 2024 - Present)"],
    "top_strengths": ["Strong full-stack foundation"],
    "skill_gaps": ["System Design", "Testing"],
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

**Errors:**
| Code | Detail |
|------|--------|
| `429` | Daily resume analysis limit reached |
| `504` | Resume analysis timed out |

---

## 3. Roadmap Endpoints 🔒

### `POST /roadmap/generate`
Generate an 8-week personalized learning roadmap.

**Request Body:**
```json
{
  "target_role": "Backend Engineer",
  "skill_gaps": ["System Design", "Docker", "CI/CD"],
  "provider": null,
  "experience_level": "intermediate",
  "learning_style": "balanced"
}
```

**Response `200`:**
```json
{
  "id": "uuid-string",
  "target_role": "Backend Engineer",
  "weeks": [
    {
      "week": 1,
      "topic": "System Design Fundamentals",
      "skill_gap_addressed": "System Design",
      "estimated_hours": 10,
      "mini_project": "Design a URL shortener architecture",
      "success_criteria": "Can draw a complete system diagram",
      "why_it_matters": "Foundation for all distributed systems",
      "youtube_resources": ["https://youtube.com/..."],
      "article_resources": ["https://blog.example.com/..."],
      "github_resources": ["https://github.com/..."],
      "official_docs": ["https://docs.example.com/..."],
      "completed": false
    }
  ]
}
```

---

### `GET /roadmap/history`
Fetch all previously generated roadmaps.

**Response `200`:**
```json
{
  "history": [
    {
      "id": "uuid-string",
      "target_role": "Backend Engineer",
      "created_at": "2026-05-29T10:00:00",
      "weeks": [...]
    }
  ]
}
```

---

### `PUT /roadmap/{roadmap_id}/toggle-week/{week_number}`
Toggle or set the completed status of a specific week.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `completed` | bool | `null` | Explicit value; if null, toggles current state |

**Response `200`:**
```json
{
  "message": "Week 1 completion updated",
  "weeks": [...]
}
```

---

### `GET /roadmap/{roadmap_id}/quiz/{week_number}`
Generate 5 AI-powered MCQ quiz questions for a specific week's topic.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `provider` | string | `null` | LLM provider override |

**Response `200`:**
```json
{
  "topic": "System Design Fundamentals",
  "questions": [
    {
      "question": "What is the primary purpose of a load balancer?",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "B",
      "explanation": "A load balancer distributes..."
    }
  ]
}
```

---

### `DELETE /roadmap/{roadmap_id}`
Delete a specific roadmap.

**Response `200`:**
```json
{
  "message": "Roadmap deleted successfully"
}
```

---

## 4. Market Endpoints 🔒

### `GET /market/config`
Returns dynamic configuration (roles, locations, companies, seniorities) for all wizards.

**Response `200`:**
```json
{
  "locations": ["Bangalore, India", "San Francisco, USA", ...],
  "roles": ["Software Engineer", "Data Scientist", ...],
  "companies": {"Google": {...}, "Microsoft": {...}, ...},
  "seniorities": ["Junior", "Middle", "Senior", "Principal"]
}
```

---

### `GET /market/trends`
Fetch real-time, region-aware job market intelligence.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | ✅ | Target job role |
| `location` | string | ✅ | Target location |
| `seniority` | string | No | Experience level |
| `provider` | string | No | LLM provider override |

**Response `200`:**
```json
{
  "role": "Data Scientist",
  "location": "Bangalore, India",
  "salary_range": {
    "min": 1200000,
    "max": 3500000,
    "formatted": "₹12,00,000 – ₹35,00,000"
  },
  "market_trend": "High Growth",
  "hiring_volume": "2,500+ Active Roles",
  "hiring_companies": [
    {"name": "Google", "hiring_volume": "High"}
  ],
  "top_skills_freq": [
    {"skill": "Python", "frequency": 92}
  ],
  "summary": "Strong demand for Data Scientists..."
}
```

---

### `GET /market/history`
Fetch saved market intelligence history.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | `10` | Max results (1-50) |

**Response `200`:** Array of saved market analyses.

---

### `DELETE /market/{analysis_id}`
Delete a saved market analysis.

**Response `200`:**
```json
{
  "message": "Market analysis deleted successfully"
}
```

---

## 5. Career Full Analysis Endpoints 🔒

### `POST /career/full-analysis/stream`
Execute the complete LangGraph DAG pipeline via Server-Sent Events (SSE).

**Request Body:**
```json
{
  "target_role": "Full Stack Developer",
  "resume_text": "Extracted resume text...",
  "location": "Bangalore, India",
  "provider": null
}
```

**Response:** `text/event-stream`

SSE events are emitted as the pipeline progresses:

```
data: {"type": "log", "message": "Started Resume Analysis", "node": "resume"}

data: {"type": "log", "message": "Fetching Market Trends", "node": "market"}

data: {"type": "log", "message": "Resume Node Complete", "node": "resume"}

data: {"type": "log", "message": "Analysis Complete", "node": "roadmap"}

data: {"type": "result", "payload": {
  "status": "success",
  "output": {
    "resume_analysis": {...},
    "market_trends": {...},
    "roadmap": {
      "id": "uuid",
      "weeks": [...],
      "target_role": "Full Stack Developer"
    },
    "linkedin_strategy": {...}
  },
  "logs": [...],
  "errors": [],
  "metadata": {
    "execution_time": "Completed",
    "agents_involved": 4,
    "roadmap_weeks": 8
  }
}}
```

---

## 6. LinkedIn Endpoints 🔒

### `POST /linkedin/optimize`
Generate a LinkedIn profile optimization strategy.

**Request Body:**
```json
{
  "target_role": "Backend Engineer",
  "provider": null
}
```

**Response `200`:**
```json
{
  "cached": false,
  "strategy": {
    "headlines": [
      "Backend Engineer | Building Scalable Systems 💻",
      "Backend Engineer | API Design & Cloud Architecture 🚀",
      "Backend Engineer | Distributed Systems Expert 🛠️"
    ],
    "about_section": "👋 Hi there! I am a passionate Backend Engineer...",
    "demanding_skills": ["System Design", "PostgreSQL", "Docker"],
    "ats_keywords_to_inject": ["Microservices", "REST APIs", "CI/CD"],
    "recruiter_search_trends": ["Increasing demand for backend engineers with cloud experience"],
    "profile_density_advice": "Ensure your headline uses high-converting keywords...",
    "certifications": ["AWS Certified Developer", "Docker Certified Associate"]
  }
}
```

---

## 7. Interview Endpoints (WebSocket)

### `WebSocket /interview/ws/{session_id}`
Establishes a WebSocket connection for a real-time mock interview session.

**Connection URL:**
```
ws://localhost:8000/interview/ws/{session_id}?role=Software+Engineer&company=Google&type=technical&provider=nvidia&token=JWT_TOKEN
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `role` | string | `Software Engineer` | Target role |
| `company` | string | `A top tech company` | Target company |
| `company_style` | string | `null` | Company interview style |
| `company_tier` | string | `other` | Company tier classification |
| `token` | string | `null` | JWT access token |
| `type` | string | `technical` | Interview type (`technical` or `behavioral`) |
| `provider` | string | `nvidia` | LLM provider |

**Client → Server Messages:**
```json
{
  "type": "message",
  "content": "I have 2 years of experience in full stack development..."
}
```

**Server → Client Messages:**
```json
{
  "type": "message",
  "content": "That's a great introduction! Let me move to..."
}
```

```json
{
  "type": "audio",
  "data": "base64_encoded_audio..."
}
```

```json
{
  "type": "phase_update",
  "phase": 3,
  "phase_name": "LEETCODE"
}
```

```json
{
  "type": "score",
  "score": 78.5,
  "feedback": "Strong performance overall..."
}
```

---

### `GET /interview/history` 🔒
Fetch previous mock interview sessions.

**Response `200`:**
```json
{
  "history": [
    {
      "id": "session-uuid",
      "target_role": "Software Engineer",
      "created_at": "2026-05-29T10:00:00",
      "score": 78.5,
      "status": "completed"
    }
  ]
}
```

---

### `GET /interview/{session_id}` 🔒
Fetch full details of a specific interview session.

**Response `200`:**
```json
{
  "id": "session-uuid",
  "target_role": "Software Engineer",
  "score": 78.5,
  "status": "completed",
  "created_at": "2026-05-29T10:00:00",
  "chat_history": [
    {"role": "interviewer", "content": "Welcome! Let me start..."},
    {"role": "candidate", "content": "Thank you! I have..."}
  ]
}
```

---

### `DELETE /interview/{session_id}` 🔒
Delete a specific interview session.

**Response `200`:**
```json
{
  "message": "Interview deleted successfully"
}
```

---

## 8. Voice Assistant Endpoint (WebSocket)

### `WebSocket /career/voice-assistant/ws`
Real-time bidirectional voice conversation with Anya (AI Career Coach).

**Connection URL:**
```
ws://localhost:8000/career/voice-assistant/ws?token=JWT_TOKEN
```

**Authentication:** JWT token required as query parameter.

**Client → Server Messages:**

| Type | Description |
|------|-------------|
| `audio` | PCM audio chunk (16kHz, base64 encoded) |
| `interrupt` | Signal that user started speaking (interrupts AI) |

```json
{
  "type": "audio",
  "data": "base64_encoded_PCM_16kHz..."
}
```

```json
{
  "type": "interrupt"
}
```

**Server → Client Messages:**

| Type | Description |
|------|-------------|
| `audio` | AI response audio (24kHz PCM, base64) |
| `transcript` | Text transcript of AI speech |
| `interrupted` | AI speech was interrupted |
| `error` | Error message |
| `time_limit` | Call duration limit reached (7.5 min) |

```json
{
  "type": "audio",
  "data": "base64_encoded_PCM_24kHz..."
}
```

```json
{
  "type": "transcript",
  "text": "Haan, toh tumhara resume dekh ke lagta hai..."
}
```

```json
{
  "type": "time_limit",
  "message": "Call time limit reached (7m 30s). Please start a new call."
}
```

**Context Injection:** The backend automatically injects the user's latest resume analysis, roadmap progress, target role, and market/location data into Anya's system prompt.

---

## 9. User Endpoints 🔒

### `GET /user/stats`
Fetch comprehensive dashboard statistics.

**Response `200`:**
```json
{
  "lastResumeAnalysis": {
    "technical_skills": [...],
    "ats_score": 72,
    ...
  },
  "usageToday": {
    "resume": 1,
    "roadmap": 0,
    "interview": 1
  },
  "weeklyActivity": [
    {"day": "Mon", "actions": 3},
    {"day": "Tue", "actions": 5},
    ...
  ],
  "monthlyActivity": [
    {"week": "W1", "actions": 12},
    ...
  ],
  "activityLog": [
    {
      "label": "Analyzed Resume",
      "time": "2026-05-29T10:00:00",
      "color": "#818cf8"
    }
  ],
  "roadmapHistory": [...],
  "interviewHistory": [
    {"score": 78.5, "created_at": "2026-05-29T10:00:00Z"}
  ],
  "analysisHistory": [...],
  "todayActionCount": 4,
  "careerReportDepthToday": 100,
  "streak": 5
}
```

---

## 10. Health Endpoints

### `GET /health`
Full system health check (includes database connectivity).

**Response `200`:**
```json
{
  "status": "ok",
  "database": "connected",
  "service": "AI Career Mentor",
  "version": "1.0.0",
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "timestamp": "2026-05-29T18:00:00+00:00"
}
```

---

### `GET /ping`
Lightweight keep-alive (for Render free tier cron).

**Response `200`:**
```json
{
  "pong": true
}
```

---

### `GET /`
Root endpoint with navigation links.

**Response `200`:**
```json
{
  "message": "Welcome to AI Career Mentor API 🚀",
  "docs": "/docs",
  "health": "/health"
}
```

---

## Error Codes

| HTTP Code | Meaning | Common Causes |
|-----------|---------|---------------|
| `400` | Bad Request | Invalid input, missing fields, duplicate email |
| `401` | Unauthorized | Invalid/expired JWT, bad Google token |
| `404` | Not Found | Resource (roadmap, interview, analysis) not found |
| `422` | Unprocessable Entity | Cannot extract text from scanned PDF |
| `429` | Too Many Requests | Daily rate limit reached or 48h gap block active |
| `500` | Internal Server Error | LLM failure, database error |
| `504` | Gateway Timeout | Resume analysis exceeded 120s timeout |

### Error Response Format
```json
{
  "detail": "Human-readable error message"
}
```

---

## Rate Limits

### Global (per IP)
| Environment | Limit |
|-------------|-------|
| Development | 100,000 requests/day |
| Production | 1,000 requests/day + 100 requests/hour |

### Per Feature (per user)
| Feature | Daily Limit | Special Rules |
|---------|-------------|---------------|
| Resume Analysis | 3 | — |
| Market Research | 3 | — |
| LinkedIn Optimization | 4 | — |
| Roadmap Generation | 1 | + 48h gap lock after use |
| Full Career Analysis | 1 | + 48h gap lock after use |
| Mock Interview | 1 | + 48h gap lock after use |
| Voice Assistant | 2 | 7.5 min max call duration |

> **Note:** Rate limits are bypassed when `APP_ENV=development` (local development).

---

<div align="center">

**Built with 🧠 by [Anil Pradhan](https://github.com/Anil-Pradhan-web)**

</div>
