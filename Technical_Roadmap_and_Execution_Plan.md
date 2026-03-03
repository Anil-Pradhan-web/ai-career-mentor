# 🚀 AI Career Mentor — Technical Roadmap & Execution Plan
### Microsoft AI Dev Days Hackathon | Solo Developer
### 📅 Feb 20, 2026 → Mar 9, 2026 (18 Days)

---

## 👤 Developer

| Name | Role | Responsibility |
|------|------|----------------|
| **Anil Pradhan** | Full-Stack Solo Dev | Backend (FastAPI, AutoGen, Auth) + Frontend (Next.js, UI/UX, API Integration, Deployment) |

> 📌 All "Dev 1" (Backend) and "Dev 2" (Frontend) tasks are handled entirely by **Anil Pradhan**.

---

## 🏗️ Architecture Overview

```
Frontend (Next.js 14) — Vercel / Azure Static Web Apps
         ↓  REST API + WebSocket
FastAPI Backend (Python) — Render.com / Azure App Service
         ↓
Microsoft AutoGen — Multi-Agent GroupChat Orchestrator
   ├── Resume Analyst Agent    → Parses skills, gaps, strengths
   ├── Market Researcher Agent → DuckDuckGo live search
   ├── Career Coach Agent      → Builds 6-week roadmap
   └── Mock Interviewer Agent  → WebSocket real-time chat
         ↓
LLM Provider
   ├── Groq (Llama 3.3 70B)    → Free, used in development
   └── Azure OpenAI (GPT-4o)   → Production-ready via config switch
         ↓
SQLite (dev) / Azure Cosmos DB (optional prod)
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Vanilla CSS (Glassmorphism) |
| **Backend** | FastAPI (Python 3.11), Uvicorn |
| **AI Agents** | Microsoft AutoGen (ag2), GroupChat Orchestration |
| **LLM** | Groq (Llama 3.3 70B) in dev, Azure OpenAI (GPT-4o) in prod |
| **Auth** | JWT (python-jose) + bcrypt password hashing |
| **Database** | SQLAlchemy + SQLite |
| **PDF Parsing** | pdfplumber |
| **Search Tool** | DuckDuckGo Search API |
| **Deployment** | Render.com (backend) + Vercel (frontend) |

---

## 📅 WEEK 1 — Foundation & Core Agents (Feb 20 – Feb 26)

---

### ✅ DAY 1 — Feb 20 (Friday) | Project Setup & Planning — COMPLETED

#### Backend
- [x] Created GitHub repo, pushed initial structure
- [x] Set up Python virtual environment (`venv`)
- [x] Installed core deps: `fastapi`, `uvicorn`, `ag2`, `python-dotenv`, `sqlalchemy`, `pydantic`
- [x] Created folder structure (backend + frontend)
- [x] Wrote `config.py` with dual-mode LLM support (Groq for dev, Azure for prod)
- [x] Wrote `main.py` — FastAPI app with `/health` endpoint
- [x] Backend running locally: `uvicorn app.main:app --reload` ✅

#### Frontend
- [x] Initialized Next.js 14 project with TypeScript + App Router
- [x] Installed UI deps: `lucide-react`, `axios`, `react-dropzone`
- [x] Set up folder structure: `app/`, `components/`, `services/`, `types/`
- [x] Created premium landing page (glassmorphism dark theme)
- [x] Created sticky Navbar component
- [x] Pushed to `dev` branch ✅

#### Sync
- [x] API contract agreed — Pydantic schemas match TypeScript interfaces
- [x] `NEXT_PUBLIC_API_URL=http://localhost:8000` configured

---

### ✅ DAY 2 — Feb 21 (Saturday) | Database & Dashboard — COMPLETED

#### Backend
- [x] Wrote `database.py` — SQLAlchemy setup (SQLite for dev)
- [x] Defined DB models in `schemas.py` — User, Resume, CareerRoadmap, InterviewSession
- [x] DB connection working — CRUD tested ✅

#### Frontend
- [x] Built Dashboard layout — Left sidebar + main content area
- [x] Created `UploadResumeCard` component (drag & drop UI)
- [x] Created `CareerGoalInput` form component
- [x] Set up `axios` instance in `services/api.ts`
- [x] Glassmorphism dark theme applied across dashboard ✅

#### Sync
- [x] Frontend hits `GET /health` → `{status: ok, provider: groq}` ✅

---

### ✅ DAY 3 — Feb 23 (Monday) | Resume Analyst Agent — COMPLETED

#### Backend
- [x] Installed: `pdfplumber`, `python-multipart`
- [x] Created `POST /resume/upload` endpoint — PDF → text extraction
- [x] Wrote **Resume Analyst Agent** in `agents/registry.py`
- [x] Created `POST /resume/analyze` endpoint — AutoGen 2-agent chat
- [x] Returns: `technical_skills`, `soft_skills`, `years_of_experience`, `top_strengths`, `skill_gaps`
- [x] Tested with `sample_resume.pdf` via curl ✅

#### Frontend
- [x] Hooked up `UploadResumeCard` to `POST /resume/analyze`
- [x] Created `ResumeAnalysisPanel.tsx` with 5-section skill cards:
  - Experience Summary (stat counters)
  - Top Strengths (numbered list with animation)
  - Technical Skills (progress bars)
  - Skill Gaps (priority cards)
  - Full Skills Badge Cloud
- [x] Dashboard auto-scrolls to analysis panel after completion
- [x] TypeScript types in `types/resume.ts` match backend JSON ✅

---

### ✅ DAY 4 — Feb 23 (Monday) | Career Roadmap Agent — COMPLETED

#### Backend
- [x] Wrote **Career Architect Agent** in `agents/registry.py`
- [x] Created `POST /roadmap/generate` endpoint:
  - Input: `target_role`, `skill_gaps`
  - Output: 6-week JSON roadmap with topics, resources, hours, mini projects
- [x] Saves roadmap to database

#### Frontend
- [x] Built **Career Roadmap Page** with:
  - Target Role dropdown (45+ roles)
  - Skill Gaps text input
  - Timeline UI with weekly milestone cards
  - Each card: Topic, Resource Link, Hours, Mini Project, Expand/Collapse
  - "Mark as Complete" per week (localStorage persistence)
  - Progress bar showing completion percentage
  - Trophy badge on 100% completion

---

### ✅ DAY 5 — Feb 24 (Tuesday) | Market Research Agent — COMPLETED

#### Backend
- [x] Wrote **Market Research Agent** with DuckDuckGo search tool
- [x] Created `GET /market/trends?role=...&location=...` endpoint
- [x] Returns: top skills, salary range, top companies, market trend

#### Frontend
- [x] Built **Market Insights Page** with:
  - Role + Location search inputs
  - Skills Demand chart (recharts bar chart)
  - Salary Range card
  - Top Companies list
  - Market Trend badge (Growing/Stable/Declining)

---

### ✅ DAY 6 — Feb 25 (Wednesday) | Multi-Agent GroupChat Orchestration — COMPLETED

#### Backend
- [x] Created `agents/workflow.py` — AutoGen GroupChat combining all 4 agents
- [x] Created `POST /career/full-analysis` unified endpoint
- [x] All agent conversations logged per session
- [x] Results saved to database

#### Frontend
- [x] Built **Full Analysis Page** (`/dashboard/full-analysis`)
- [x] Resume upload → Career Goal input → real-time agent status stream
- [x] Shows all results in organized sections after completion
- [x] "🤖 AI agents are collaborating..." loading state with animation

---

### ✅ DAY 7 — Feb 26 (Thursday) | Mock Interview Agent — COMPLETED

#### Backend
- [x] Installed: `websockets`
- [x] Created **WebSocket endpoint** `ws://localhost:8000/interview/ws/{session_id}`
- [x] Wrote **Mock Interviewer Agent** — one question at a time, feedback after each answer
- [x] Stateful conversation maintained per `session_id`
- [x] Final score saved to database after 5 questions

#### Frontend
- [x] Built **Mock Interview Page** with:
  - ChatGPT-style chat UI
  - WebSocket real-time connection
  - "Start Interview" + "End Interview" buttons
  - Final Score Card with breakdown

---

## 📅 WEEK 2 — Auth, Polish & Deployment (Feb 27 – Mar 5)

---

### ✅ DAY 8 — Feb 26-27 (Thu-Fri) | Authentication + UI Overhaul — COMPLETED

> ⚠️ **Note:** Days 7 and 8 were completed back-to-back on same evening (Feb 26).

#### Backend
- [x] Dropped `passlib` (bcrypt compatibility issue) → used direct `bcrypt==4.0.0`
- [x] Created `backend/app/core/security.py` — `bcrypt.hashpw` / `bcrypt.checkpw`
- [x] Created `backend/app/api/auth.py`:
  - `POST /auth/register` — hash password, create user, return JWT + name
  - `POST /auth/login` — verify password, return JWT + name
- [x] Created `backend/app/api/deps.py` — `get_current_user` JWT dependency
- [x] Protected all routes with `Depends(get_current_user)`
- [x] `TokenResponse` schema updated to include `name` field
- [x] Auth flow tested — register + login + protected route ✅

#### Frontend
- [x] Built **Login Page** (`/login`) — glassmorphism split-panel:
  - Left: email/password form, JWT stored in localStorage
  - Right: branding panel with feature list and testimonial
- [x] Built **Register Page** (`/register`) — same premium design:
  - Name, Email, Password fields
  - Saves `userName` to localStorage after success
- [x] Built **Settings Page** (`/dashboard/settings`):
  - Update display name (live sync to Sidebar via storage events)
  - "Change Password" toast notification
  - "Log Out Everywhere" — clears storage + redirects to `/login`
- [x] Updated **Sidebar**:
  - Displays logged-in username from localStorage
  - Listens for `storage` events for live name updates
  - Logout clears both `token` and `userName`
- [x] Updated **Navbar**:
  - Removed internal dashboard links (cleaner public nav)
  - Smart CTA: "Get Started Free" → `/login` | "Go to Dashboard" → `/dashboard`
- [x] Fixed landing page text: "No signup required" → "100% free during beta"
- [x] AI Team section redesigned: 2×2 grid layout
- [x] Reduced neon glow intensity globally in `globals.css`

#### Commit
- [x] All pushed to `dev` branch — commit `0059682` ✅

---

### ✅ DAY 9 — Feb 28 (Saturday) | Deployment: Render.com + Vercel 🚀 — COMPLETED

> ⚠️ **Strategy Change:** Azure account blocked (no college email + credit card required). GitHub Student Pack applied and rejected ❌.
> **New Plan:** Render.com (Backend) + Vercel (Frontend) — both free, no credit card needed.
> **LLM:** Continue with Groq (Llama 3.3 70B) — working perfectly ✅

#### Backend (Anil) — Render.com
- [x] Write `Dockerfile` for FastAPI:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
  ```
- [x] Create `render.yaml` in project root
- [x] Go to [render.com](https://render.com) → Sign in with GitHub
- [x] New Web Service → Connect `ai-career-mentor` repo → Root: `backend/`
- [x] Set env variables in Render dashboard (GROQ_API_KEY, SECRET_KEY)
- [x] Deploy → Get live URL: `https://ai-career-mentor-backend.onrender.com`
- [x] Test `/health` endpoint live ✅

#### Frontend (Anil) — Vercel
- [x] Go to [vercel.com](https://vercel.com) → Sign in with GitHub
- [x] Import repo → Root Directory: `frontend/`
- [x] Add env var: `NEXT_PUBLIC_API_URL=https://ai-career-mentor-backend.onrender.com`
- [x] Deploy → Get live URL: `https://ai-career-mentor.vercel.app`
- [x] Update CORS in backend to allow Vercel URL
- [x] Test full flow: Frontend ↔ Render Backend ✅

---

### ✅ DAY 10 — Mar 1 (Sunday) | CI/CD + Error Handling ⚙️ — COMPLETED

#### CI/CD (Anil)
- [x] Create `.github/workflows/backend-deploy.yml` — trigger Render deploy on push
- [x] Render deploy hook URL → add as GitHub Secret `RENDER_DEPLOY_HOOK_URL`
- [x] Vercel auto-deploys on every push to `main` — nothing extra needed ✅

#### Code Quality (Anil)
- [x] Add comprehensive `try/except` error handling in all FastAPI endpoints
- [x] Add request logging with `loguru`
- [x] Add **error boundary** to all frontend pages (graceful failure if API is down)
- [x] Add **loading skeletons** (no blank screens while data loads)
- [x] Improve mobile responsiveness across all pages

---

### ✅ DAY 11 — Mar 2 (Monday) | UI Polish & UX Refinement ✨ — COMPLETED

#### Backend
- [x] Add rate limiting with `slowapi` (prevent API abuse)
- [x] Write basic unit tests for each endpoint with `pytest`
- [x] Clean up `/docs` (Swagger) — well-documented endpoints via `openapi_tags`

#### Frontend
- [x] Dark mode toggle (App is native Dark Mode via Glassmorphism ui)
- [x] Mobile-responsive fixes for all dashboard pages
- [x] Dashboard progress tracker widget (Roadmap %, Interview scores)
- [x] Cross-browser test: Chrome, Edge, Firefox

---

### 📅 DAY 12 — Mar 3 (Tuesday) | Demo Video 🎬

#### Anil (Frontend)
- [ ] Record **2-minute demo video** showing full app flow:
  1. Landing page (10s)
  2. Register → Login (20s)
  3. Resume upload → AI analysis results (30s)
  4. Generate roadmap (20s)
  5. Market insights dashboard (15s)
  6. Mock interview — 1 question round (20s)
  7. Full Analysis GroupChat page (5s)
- [ ] Use **OBS Studio** or **Windows + G (Xbox Game Bar)**
- [ ] Upload to YouTube (unlisted) → copy link for submission

#### Anil (Backend)
- [ ] Finalize architecture diagram in README.md (Mermaid) ✅ Done
- [ ] Write Technical Documentation in README ✅ Done

---

### ✅ DAY 13 — Mar 5 (Thursday) | Submission Prep 📋 — COMPLETED

#### Anil
- [x] Review all submission requirements:
  - [x] Working project
  - [x] Public GitHub repo
  - [x] Project description
  - [x] Architecture diagram
  - [x] Microsoft Learn username: **ANIL PRADHAN**
  - [x] Demo video link (YouTube)
  - [x] Live deployed URL
- [x] README.md final review — screenshots, live demo link, setup instructions
- [x] Push everything to `main` branch (clean commit history)

---

## 📅 WEEK 3 — Final Stretch & Submission (Mar 6 – Mar 9)

---

### ✅ DAY 14 — Mar 6 (Friday) | Integration Testing & Bug Fixes 🐛 — COMPLETED

#### Anil
- [x] End-to-end UI testing: go through ALL flows manually
- [x] Fix all browser console warnings/errors
- [x] Stress test each API endpoint (10 calls with sample data)
- [x] Confirm DB persists data across sessions
- [x] Test on mobile viewport (375px)
- [x] Check deployed backend logs on Render for any 500 errors

---

### ✅ DAY 15 — Mar 7 (Saturday) | Feature Freeze ❄️ — COMPLETED

> ⛔ **No new features after today!** Bug fixes only.

#### Anil
- [x] Final env variable check (all secrets set in Render dashboard)
- [x] Confirm CORS settings allow Vercel + any judge testing URLs
- [x] Cross-browser test: Chrome, Edge, Firefox, Safari
- [x] Add meta tags for SEO (`title`, `description`, `og:image`)
- [x] Final Vercel deployment check — production build works

---

### ✅ DAY 16 — Mar 8 (Sunday) | Final Rehearsal 🎤 — COMPLETED

#### Anil
- [x] Practice 2-min demo walkthrough 3 times
- [x] Prepare answers for judge questions:
  - *"Why AutoGen over LangChain?"* → Microsoft ecosystem, GroupChat multi-agent design
  - *"How is this different from ChatGPT?"* → Agentic, multi-step, real market data
  - *"How would you scale this?"* → Render → AWS/Azure App Service, Postgres DB
  - *"Is it secure?"* → JWT Auth, bcrypt, secrets in environment variables
- [x] Upload demo video to YouTube → get public link

---

### ✅ DAY 17 — Mar 9 (Monday) | SUBMISSION DAY ✅ — COMPLETED

#### Anil
- [x] Final `git push` to `main` branch
- [x] Fill Microsoft hackathon submission form:
  - [x] GitHub repo link (public)
  - [x] Demo video link (YouTube)
  - [x] Deployed app URL (Vercel)
  - [x] Microsoft Learn username: **ANIL PRADHAN**
  - [x] Architecture diagram (in README)
  - [x] Project description
- [x] Submit before deadline ⏰
- [x] Post on LinkedIn about the project 🎯

---

## 📦 Project Structure

### Backend
```
backend/
├── app/
│   ├── main.py                    ← FastAPI entry point
│   ├── core/
│   │   ├── config.py              ← LLM config (Groq/Azure switch)
│   │   ├── database.py            ← SQLAlchemy setup
│   │   └── security.py            ← bcrypt password hashing ✅
│   ├── agents/
│   │   ├── registry.py            ← All 4 AutoGen agents
│   │   └── workflow.py            ← GroupChat orchestration
│   ├── api/
│   │   ├── auth.py                ← Register/Login endpoints ✅
│   │   ├── deps.py                ← JWT auth dependency ✅
│   │   ├── resume.py              ← Resume upload & analyze
│   │   ├── roadmap.py             ← Career roadmap generation
│   │   ├── market.py              ← Market trends
│   │   └── interview.py           ← WebSocket mock interview
│   └── models/
│       └── schemas.py             ← Pydantic models
├── requirements.txt
├── .env                           ← 🚫 Never commit!
├── .env.example
└── Dockerfile
```

### Frontend
```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx               ← Landing page ✅
│   │   ├── layout.tsx             ← Root layout
│   │   ├── login/page.tsx         ← Login ✅
│   │   ├── register/page.tsx      ← Register ✅
│   │   └── dashboard/
│   │       ├── page.tsx           ← Dashboard home ✅
│   │       ├── resume/page.tsx    ← Resume Analyzer ✅
│   │       ├── roadmap/page.tsx   ← Career Roadmap ✅
│   │       ├── market/page.tsx    ← Market Insights ✅
│   │       ├── interview/page.tsx ← Mock Interview ✅
│   │       ├── full-analysis/page.tsx ← GroupChat ✅
│   │       └── settings/page.tsx  ← Settings ✅
│   ├── components/
│   │   ├── Navbar.tsx             ← Smart auth-aware navbar ✅
│   │   ├── Sidebar.tsx            ← Dashboard sidebar ✅
│   │   ├── UploadResumeCard.tsx
│   │   └── ResumeAnalysisPanel.tsx
│   ├── services/
│   │   └── api.ts                 ← Axios instance + all API calls
│   └── types/
│       ├── resume.ts
│       └── roadmap.ts
└── package.json
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite:///./dev.db
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🏆 Hackathon Winning Strategy

### Judging Criteria

| Criterion | Weight | Our Approach |
|-----------|--------|-------------|
| **Agentic Design** | 20% | 4 agents in AutoGen GroupChat — logged conversations show collaboration |
| **Enterprise Readiness** | 20% | JWT Auth, bcrypt, CI/CD, Docker, Render deployment |
| **Innovation** | 20% | Real-time market data via live search in agentic pipeline |
| **Technical Execution** | 20% | Clean FastAPI code, full TypeScript frontend, working demo |
| **Business Impact** | 20% | Democratizes career coaching for students globally |

### 💡 "Wow" Moments for Demo:
1. **Show agent collaboration logs** — agents "talking" to each other in real-time
2. **Upload YOUR own resume** — live personalized analysis
3. **Full pipeline in 60 seconds**: Resume → Analysis → Roadmap → Market → Interview
4. **Interview score card** — numerical score with detailed feedback feels enterprise-grade

---

## 📊 Progress Tracker

| Week | Days | Status |
|------|------|--------|
| **Week 1** | Day 1–7 | ✅ **100% Complete** |
| **Week 2** | Day 8-11 | ✅ **100% Complete** |
| **Week 3** | Day 12–17 | ✅ **Project Concluded / Wrap-up** |

**Current Status:** PROJECT FULLY COMPLETED ✅🚀

---

*Last Updated: February 26, 2026*
*Developer: Anil Pradhan (Solo)*
*Project: AI Career Mentor*
*Hackathon: Microsoft AI Dev Days 2026*
