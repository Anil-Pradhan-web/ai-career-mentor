# 🚀 AI-Powered Career Mentor — Complete Technical Roadmap
### Microsoft AI Dev Days Hackathon | 2-Person Team Plan
### 📅 Feb 20, 2026 → Mar 9, 2026 (18 Days)

---

## 👥 Team Roles
| Developer | Role | Primary Focus |
|-----------|------|---------------|
| **Dev 1** | Backend Lead | FastAPI, AutoGen Agents, Azure Services, Database |
| **Dev 2** | Frontend Lead | React/Next.js, UI/UX, API Integration, Deployment |

📌 **Overlap Time**: Both devs sync every day for 30 mins to review, unblock, and test together.

---

## 🏗️ Project Architecture Overview

```
Frontend (Next.js/React)
        ↓  HTTP/WebSocket
FastAPI Backend  (Python)
        ↓
AutoGen Orchestrator (Multi-Agent System)
   ├── Resume Analyst Agent  → Azure Document Intelligence
   ├── Market Research Agent → Azure MCP / Bing Search
   ├── Career Architect Agent→ Azure OpenAI (GPT-4o)
   └── Mock Interview Agent  → WebSocket Chat
        ↓
Azure OpenAI Service (GPT-4o)
        ↓
Azure Cosmos DB / PostgreSQL (User Profiles, Roadmaps, Sessions)
        ↓
Azure App Service (Deployment)
```

---

## 🗺️ WEEK 1 — Foundation & Core Agents (Feb 20 – Feb 26)

---

### ✅ DAY 1 — Feb 20 (Friday) | Project Setup & Planning — ✨ COMPLETED

#### 🔷 Dev 1 (Backend)
- [x] Create GitHub repo, push initial structure
- [x] Set up Python virtual env (`venv`)
- [x] Install core deps: `fastapi`, `uvicorn`, `ag2` (AutoGen v0.2 API fork), `python-dotenv`, `sqlalchemy`, `pydantic`
- [x] Create folder structure:
  ```
  backend/
  ├── app/
  │   ├── main.py
  │   ├── core/
  │   │   ├── config.py
  │   │   └── database.py
  │   ├── agents/
  │   │   ├── registry.py
  │   │   └── workflow.py
  │   ├── api/
  │   │   └── routes.py (replaced by individual router files Day 2+)
  │   └── models/
  │       └── schemas.py
  ├── requirements.txt
  ├── .env
  └── Dockerfile
  ```
- [x] Write `config.py` with Azure OpenAI env settings
  - 📝 **Note**: Dual-mode config — `LLM_PROVIDER=groq` for dev (free!), `LLM_PROVIDER=azure` for submission
- [x] Write `main.py` — FastAPI app with `/health` endpoint (lifespan-based startup)
- [x] Run locally: `uvicorn app.main:app --reload` ✅ `{"status": "ok", "provider": "groq"}`

#### 🔶 Dev 2 (Frontend)
- [x] Initialize Next.js project: `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
- [x] Install UI deps: `tailwindcss`, `axios`, `react-dropzone`, `lucide-react`
- [x] Set up folder structure:
  ```
  frontend/
  ├── src/
  │   ├── app/               (Next.js App Router)
  │   ├── components/        (Reusable UI components)
  │   ├── services/          (API calls — axios instance ready)
  │   ├── hooks/             (Custom React hooks)
  │   └── types/             (TypeScript interfaces — all schemas mapped)
  ├── public/
  └── .env.local             (NEXT_PUBLIC_API_URL=http://localhost:8000)
  ```
- [x] Create premium landing page (glassmorphism dark theme, hero, features, CTA)
- [x] Sticky Navbar component with scroll effect
- [X] Push to `dev` branch

#### 🤝 Sync (30 min) — ✅ DONE
- [x] API contract agreed — all Pydantic schemas in `backend/app/models/schemas.py` match TypeScript interfaces in `frontend/src/types/index.ts`
- [x] Share `.env` variables securely (WhatsApp/DM only, NOT GitHub)
- [x] `start.bat` added to project root — starts both servers simultaneously

> 💡 **LLM Note**: Using `GROQ` (Llama 3.3 70B) for dev to save costs. Switch to `LLM_PROVIDER=azure` + Azure OpenAI GPT-4o before final submission.

---

### ✅ DAY 2 — Feb 21 (Saturday) | Azure Setup & Database — ✨ COMPLETED

#### 🔷 Dev 1 (Backend)
- [x] Provision Azure OpenAI resource (GPT-4o deployment)
  - 📝 Using **Groq (free)** for dev: `llama-3.3-70b-versatile` via OpenAI-compatible API
- [x] Write `database.py` — SQLAlchemy setup (SQLite for dev)
- [x] Define DB models in `schemas.py` — User, Resume, CareerRoadmap, InterviewSession
- [x] Run `Alembic` migrations locally — `dev.db` created ✅
- [x] Test DB connection: CRUD working ✅

#### 🔶 Dev 2 (Frontend)
- [x] Design & build the **Dashboard** page layout:
  - Left sidebar with navigation (Resume, Roadmap, Interview, Market)
  - Main content area with Cards/widgets
- [x] Create **Upload Resume** card component (drag & drop UI with `react-dropzone`)
- [x] Create **Career Goal Input** form component
- [x] Set up `axios` instance in `services/api.ts` pointing to `http://localhost:8000`
- [x] Premium glassmorphism dark theme applied ✅

#### 🤝 Sync — ✅ DONE
- [x] Frontend hits `GET /health` — returns `{status: ok, provider: groq, model: llama-3.3-70b-versatile}` ✅

---

### ✅ DAY 3 — Feb 23 (Monday) | Resume Analyst Agent 🤖 — ✨ COMPLETED

#### 🔷 Dev 1 (Backend)
- [x] Install: `pdfplumber 0.11.9`, `python-multipart` — both in venv ✅
- [x] Create `POST /resume/upload` endpoint (`app/api/resume.py`):
  - Accepts PDF file upload (max 5MB)
  - Saves to temp file, extracts text with `pdfplumber`
  - Returns `filename`, `char_count`, `preview`, `full_text`
  - ✅ Tested live: 200 OK, text extracted correctly
- [x] Write **Resume Analyst Agent** in `agents/registry.py`:
  ```python
  resume_analyst = AssistantAgent(
      name="Resume_Analyst",
      llm_config=settings.llm_config,
      system_message="""You are an expert Technical Recruiter. 
      Analyze the given resume and extract:
      1. Technical Skills (list them)
      2. Soft Skills (list them)
      3. Total years of experience
      4. Top 3 strengths
      5. Top 3 skill gaps for modern tech jobs
      Return as structured JSON."""
  )
  ```
- [x] Create `POST /resume/analyze` endpoint — calls `Resume_Analyst` via AutoGen (`max_turns=2`)
  - 📝 **Bug fixed**: AutoGen stores agent reply as `role="user"` when `chat_messages` keyed by AssistantAgent — used `proxy.last_message(analyst)` instead
  - Returns structured JSON: `technical_skills`, `soft_skills`, `years_of_experience`, `top_strengths`, `skill_gaps`
- [x] Tested end-to-end with `sample_resume.pdf` via `curl.exe` → ✅ Full JSON analysis returned

#### 🔶 Dev 2 (Frontend)
- [x] Hook up `UploadResumeCard` to `POST /resume/analyze` (via `services/api.ts`)
  - Real API call with 60s timeout for LLM
  - Animated progress bar during analysis (fake ticks every 800ms)
  - Error handling with user-friendly messages
- [x] Created `ResumeAnalysisPanel.tsx` — beautiful 5-section Skill Cards UI:
  - **Experience Summary** — animated stat counters (Years / Tech Skills / Soft Skills)
  - **🏆 Top Strengths** — numbered gold-highlighted list with slide-in animation
  - **⚡ Your Top Skills** — progress bars per skill + soft skill badge cloud
  - **🔴 Skill Gaps** — Red → Orange → Yellow priority cards with context labels
  - **🧠 All Technical Skills** — cyan badge cloud showing all detected skills
- [x] Dashboard auto-scrolls to analysis panel after completion
- [x] TypeScript types in `types/resume.ts` matching backend JSON exactly
- [x] Zero TypeScript compile errors (`tsc --noEmit` passes clean)

#### 🤝 Sync — ✅ DONE
- [x] End-to-end test: Upload PDF → AI analyzes → Skill Cards appear in UI ✅
- [x] Both servers running: Backend `localhost:8000`, Frontend `localhost:3000`

---

### ✅ DAY 4 — Feb 23 (Monday) | Career Roadmap Agent 🗺️ — ✨ COMPLETED

#### 🔷 Dev 1 (Backend)
- [x] Write **Career Architect Agent** in `agents/registry.py`:
  ```python
  career_coach = AssistantAgent(
      name="Career_Coach",
      llm_config=settings.llm_config,
      system_message="""You are a Senior Career Coach.
      Given skill gaps and a target role, create a week-by-week learning plan.
      For each week specify:
      - Topic to learn
      - Free resource (YouTube/Docs/Course)
      - Estimated hours
      - Mini project to build
      Return as structured JSON array."""
  )
  ```
- [x] Create `POST /roadmap/generate` endpoint:
  - Input: `target_role`, `skill_gaps` (from previous step)
  - Run AutoGen 2-agent chat (user_proxy → career_coach)
  - Save result to `CareerRoadmap` table
  - Return JSON roadmap
- [x] Test with Postman

#### 🔶 Dev 2 (Frontend)
- [x] Build **Career Roadmap Page**:
  - Input: "Target Role" dropdown (Data Scientist, Cloud Engineer, etc.)
  - Call `POST /roadmap/generate`
  - Display a **Timeline/Stepper UI** with weekly milestones
  - Each step card: Topic, Resource link, Hours, Mini project
  - Mark steps as "Complete" with localStorage
- [x] Animate the roadmap cards on load (CSS transitions)

#### 🤝 Sync
- [x] Full flow test: Upload Resume → Analyze → Generate Roadmap

---

### ✅ DAY 5 — Feb 24 (Tuesday) | Market Research Agent & Azure MCP 📊 — ✨ COMPLETED

#### 🔷 Dev 1 (Backend)
- [x] Set up **Azure MCP integration** (or fallback: Bing Web Search API):
  - Register Bing Search resource in Azure Portal
  - Create `tools/market_search.py` with a function `search_job_trends(role, location)`
- [x] Write **Market Research Agent** with tool use:
  ```python
  @skill("search_job_trends")
  def search_job_trends(role: str, location: str) -> str:
      # Calls Azure MCP / Bing Search
      ...
  
  market_agent = AssistantAgent(
      name="Market_Researcher",
      llm_config=settings.llm_config,
      system_message="""You are a Job Market Analyst.
      Use the search tool to find:
      1. Top 5 in-demand skills for the given role
      2. Average salary range
      3. Top hiring companies
      4. Market growth trend (Growing/Stable/Declining)
      Return as structured JSON."""
  )
  ```
- [x] Create `GET /market/trends?role=...&location=...` endpoint
- [x] Test live job market data fetch

#### 🔶 Dev 2 (Frontend)
- [x] Build **Market Insights Page**:
  - Search bar: "role" + "location" inputs
  - Call `GET /market/trends`
  - Display results in:
    - **Skill Demand Chart** (bar chart using `recharts`)
    - **Salary Range Card**
    - **Top Companies List**
    - **Market Trend Badge** (Growing 🟢 / Declining 🔴)
- [x] Make it visually rich with icons and colors

#### 🤝 Sync
- [x] Test live data appears in the frontend chart

---

### ✅ DAY 6 — Feb 25 (Wednesday) | Multi-Agent Orchestration 🧠 — ✨ COMPLETED

#### 🔷 Dev 1 (Backend)
- [x] Create `agents/workflow.py` — **GroupChat Orchestration**:

  Combine Resume Analyst + Market Agent + Career Coach into a single AutoGen GroupChat so they collaborate:
  ```python
  from autogen import GroupChat, GroupChatManager
  
  def run_full_career_analysis(resume_text, target_role):
      groupchat = GroupChat(
          agents=[user_proxy, resume_analyst, market_agent, career_coach],
          messages=[],
          max_round=6
      )
      manager = GroupChatManager(groupchat=groupchat, llm_config=settings.llm_config)
      user_proxy.initiate_chat(
          manager,
          message=f"Resume: {resume_text}\nGoal: {target_role}\nAnalyze resume, find market trends, and generate roadmap."
      )
      return groupchat.messages
  ```
- [x] Create `POST /career/full-analysis` unified endpoint
- [x] Log all agent conversations for demo traceability
- [x] Save full analysis to DB

#### 🔶 Dev 2 (Frontend)
- [x] Build a **"Full Analysis" wizard** (3-step flow):
  - Step 1: Upload Resume
  - Step 2: Set Career Goal
  - Step 3: Show all results (Resume Analysis + Market + Roadmap) in tabs
- [x] Add **loading state**: "🤖 Agents are collaborating..." with a pulsing animation
- [x] Pass all steps together to `POST /career/full-analysis`

#### 🤝 Sync
- [x] Biggest milestone test! Full end-to-end multi-agent pipeline

---

### ✅ DAY 7 — Feb 26 (Thursday) | Mock Interview Agent 🎤

#### 🔷 Dev 1 (Backend)
- [ ] Install: `websockets`
- [ ] Create **WebSocket endpoint** `ws://localhost:8000/interview/ws/{session_id}`
- [ ] Write **Mock Interview Agent**:
  ```python
  interview_agent = AssistantAgent(
      name="Interviewer",
      llm_config=settings.llm_config,
      system_message="""You are a senior technical interviewer at a top tech company.
      Rules:
      - Ask ONE question at a time.
      - Wait for the candidate's answer before continuing.
      - After each answer, give brief feedback (1-2 sentences).
      - Score the answer out of 10 internally.
      - After 5 questions, give a final summary and overall score.
      - Tailor questions to the target job role."""
  )
  ```
- [ ] Handle stateful conversation: maintain chat history per `session_id`
- [ ] Save session + final score to DB after completion

#### 🔶 Dev 2 (Frontend)
- [ ] Build **Mock Interview Page**:
  - Chat UI (like WhatsApp/ChatGPT style)
  - Connect via WebSocket to backend
  - Interviewer messages: Left side (bot bubble, blue)
  - User messages: Right side (user bubble, gray)
  - Text input + "Send Answer" button
  - "Start Interview" button to init session
  - "End Interview" button to get final score
- [ ] Show **Final Score Card** at end with breakdown

#### 🤝 Sync
- Test full mock interview conversation end-to-end

---

## 🗺️ WEEK 2 — Polish, Integration & Deployment (Feb 27 – Mar 5)

---

### ✅ DAY 8 — Feb 27 (Friday) | User Authentication 🔐

#### 🔷 Dev 1 (Backend)
- [ ] Install: `python-jose`, `bcrypt`, `fastapi-users`
- [ ] Implement JWT-based auth:
  - `POST /auth/register` — Create user
  - `POST /auth/login` — Return JWT token
  - Protect all routes with `Depends(get_current_user)`
- [ ] Test auth flow with Postman

#### 🔶 Dev 2 (Frontend)
- [ ] Build **Login Page** and **Register Page**
- [ ] Store JWT in `localStorage` / `httpOnly cookie`
- [ ] Add auth guard: redirect to `/login` if not authenticated
- [ ] Add user avatar + logout button in navbar

#### 🤝 Sync
- Test full auth flow

---

### ✅ DAY 9 — Feb 28 (Saturday) | Azure Deployment & Docker 🐳

#### 🔷 Dev 1 (Backend)
- [ ] Write `Dockerfile` for FastAPI:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```
- [ ] Test Docker build locally: `docker build -t ai-career-mentor-backend .`
- [ ] Push backend Docker image to **Azure Container Registry**
- [ ] Deploy to **Azure App Service** (Basic tier is fine for hackathon)
- [ ] Confirm backend live on Azure URL

#### 🔶 Dev 2 (Frontend)
- [ ] Update `services/api.ts` — point to Azure backend URL
- [ ] Build production Next.js: `npm run build`
- [ ] Deploy frontend to **Vercel** (free, easiest for Next.js):
  - `npx vercel --prod`
- [ ] Confirm frontend live on Vercel URL
- [ ] Cross-origin test: Frontend ↔ Azure Backend

#### 🤝 Sync
- Both apps live! Share links.

---

### ✅ DAY 10 — Mar 1 (Sunday) | GitHub Actions CI/CD ⚙️

#### 🔷 Dev 1 (Backend)
- [ ] Create `.github/workflows/backend-deploy.yml`:
  ```yaml
  name: Deploy Backend to Azure
  on:
    push:
      branches: [main]
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Build Docker Image
          run: docker build -t ai-career-mentor-backend ./backend
        - name: Login to Azure Container Registry
          uses: azure/docker-login@v1
          with:
            login-server: ${{ secrets.ACR_LOGIN_SERVER }}
            username: ${{ secrets.ACR_USERNAME }}
            password: ${{ secrets.ACR_PASSWORD }}
        - name: Push Docker Image
          run: docker push ${{ secrets.ACR_LOGIN_SERVER }}/ai-career-mentor-backend
        - name: Deploy to Azure App Service
          uses: azure/webapps-deploy@v2
          with:
            app-name: ${{ secrets.AZURE_APP_NAME }}
            publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
  ```
- [ ] Set up GitHub Secrets for Azure credentials
- [ ] Push to `main` → verify pipeline runs

#### 🔶 Dev 2 (Frontend)
- [ ] Create `.github/workflows/frontend-deploy.yml` for Vercel auto-deploy
- [ ] Add **error boundary** to all pages (graceful failure if API is down)
- [ ] Add **loading skeletons** everywhere (no blank screens)
- [ ] Improve mobile responsiveness

#### 🤝 Sync
- Full CI/CD pipeline tested

---

### ✅ DAY 11 — Mar 2 (Monday) | UI Polish & UX Refinement ✨

#### 🔷 Dev 1 (Backend)
- [ ] Add comprehensive error handling in all endpoints (try/except)
- [ ] Add request logging with `loguru`
- [ ] Add rate limiting with `slowapi`
- [ ] Write basic unit tests for each endpoint with `pytest`
- [ ] Set up `swagger` docs: `http://localhost:8000/docs` is clean and well-documented

#### 🔶 Dev 2 (Frontend)
- [ ] Landing page full redesign:
  - Hero: "Your AI Career Coach, available 24/7"
  - 3 feature cards (Animate on scroll)
  - "Get Started Free" CTA
- [ ] Dashboard visually polished:
  - Progress tracker widget
  - Quick stats: Roadmap steps, Interview score, Skill match %
- [ ] Dark mode toggle
- [ ] Mobile-responsive fixes

#### 🤝 Sync
- Full walkthrough of the app together — note all visual bugs

---

### ✅ DAY 12 — Mar 3 (Tuesday) | Demo Video & Presentation Prep ��🎬

#### 🔶 Dev 2 (Frontend) — Primary
- [ ] Record **3-min demo video** of the entire app flow:
  1. Upload resume
  2. View skill gaps
  3. Generate roadmap
  4. View market trends
  5. Do a mock interview
  6. Show final score
- [ ] Use **OBS Studio** or **Loom** for recording
- [ ] Narrate what each agent is doing in real time

#### 🔷 Dev 1 (Backend) — Primary
- [ ] Create **Architecture Diagram** (draw.io or Excalidraw):
  - Shows all Azure services connected
  - Shows AutoGen agent flow
- [ ] Write **Technical Documentation** (README.md):
  - How to run locally
  - How to deploy
  - API endpoints list
- [ ] Add agent conversation logs to show "agentic design" clearly

---

### ✅ DAY 13 — Mar 5 (Thursday) | PowerPoint Slide Deck 📊

Both devs work together on slides.

#### Slide Deck Structure (10 slides max):
| Slide | Content |
|-------|---------|
| 1 | Project Title + Team Names |
| 2 | Problem Statement (why career mentoring is hard) |
| 3 | Solution Overview (AI Career Mentor) |
| 4 | Architecture Diagram |
| 5 | Agentic Design — Show the 4-agent system |
| 6 | Key Feature 1: Resume Analyzer + Skill Gap |
| 7 | Key Feature 2: Personalized Roadmap |
| 8 | Key Feature 3: Market Sync + Interview Agent |
| 9 | Enterprise Readiness (CI/CD, Docker, Azure, Auth) |
| 10 | Live Demo QR Code + Impact / Business Value |

---

## 🗺️ WEEK 3 — Final Stretch & Submission (Mar 6 – Mar 16)

---

### ✅ DAY 14 — Mar 6 (Friday) | Integration Testing & Bug Fixes 🐛

#### 🔷 Dev 1 (Backend)
- [ ] Run all `pytest` tests — fix any failures
- [ ] Stress test: Call each endpoint 10 times with sample data
- [ ] Confirm DB is persisting data across sessions
- [ ] Check Azure App Service logs for any 500 errors

#### 🔶 Dev 2 (Frontend)
- [ ] End-to-end UI testing: Manually go through ALL flows
- [ ] Fix all console warnings and errors
- [ ] Confirm all API calls go to the Azure backend (not localhost)
- [ ] Test on mobile viewport

#### 🤝 Sync
- Create a bug list → prioritize and fix top issues

---

### ✅ DAY 15 — Mar 7 (Saturday) | Feature Freeze ❄️

> **No new features after this day!** Only bug fixes.

#### 🔷 Dev 1 (Backend)
- [ ] Final environment variable check (all secrets set in Azure)
- [ ] Confirm CORS settings are correct
- [ ] Final Docker build + push to ACR
- [ ] Verify deployment is stable

#### 🔶 Dev 2 (Frontend)
- [ ] Final Vercel deployment check
- [ ] Cross-browser test (Chrome, Edge, Firefox)
- [ ] Add meta tags for SEO (`title`, `description`, `og:image`)
- [ ] Favicon + app name set

#### 🤝 Sync
- Final app demonstration run from scratch

---

### ✅ DAY 16 — Mar 8 (Sunday) | Demo Day Rehearsal 🎤

Both devs rehearse the presentation and demo.

#### Tasks (Both Devs):
- [ ] Practice the 5-min pitch (the "elevator speech")
- [ ] Rehearse the live demo 3 times
- [ ] Prepare answers for expected judge questions:
  - "Why AutoGen over LangChain?" → Multi-agent collaboration, Microsoft ecosystem
  - "How is this different from ChatGPT?" → Agentic, multi-step, uses real market data
  - "How would you scale this?" → Azure App Service scales horizontally, Cosmos DB for global
  - "Is it secure?" → JWT Auth, Secrets in GitHub/Azure, No data stored unencrypted
- [ ] Finalize slide deck
- [ ] Upload demo video to YouTube (unlisted) as backup

---

### ✅ DAY 17 — Mar 9 (Monday) | Final Submission Prep ✅

#### Both Devs:
- [ ] **Final GitHub push** to `main` branch — clean commit history
- [ ] README.md is polished (setup instructions, screenshots, live demo link)
- [ ] Submission form filled out:
  - GitHub repo link (public)
  - Demo video link
  - Slide deck link
  - Deployed app URL
- [ ] Double-check all submission requirements from Microsoft hackathon page
- [ ] Get a good night's sleep! 🛌

---

### 🏆 DAY 18 — Mar 9–15 (Mon–Sun) | SUBMISSION WINDOW 🎣

> ⏰ **Hackathon Deadline: March 16, 2026** — submit anytime before 11:59 PM!🎯

- [ ] **Submit before deadline**
- [ ] Both devs available online (in case of last-minute issues)
- [ ] Post on LinkedIn about the project (judges look at this too!)
- [ ] Celebrate! 🎉

---

## 📦 Full Backend Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings & LLM config
│   │   └── database.py            # SQLAlchemy DB setup
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── registry.py            # All AutoGen agents defined here
│   │   └── workflow.py            # GroupChat orchestration
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py                # Login/Register endpoints
│   │   ├── resume.py              # Resume upload & analyze endpoints
│   │   ├── roadmap.py             # Career roadmap endpoint
│   │   ├── market.py              # Market trends endpoint
│   │   └── interview.py           # WebSocket interview endpoint
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py             # Pydantic request/response models
│   └── tools/
│       ├── __init__.py
│       └── market_search.py       # Azure MCP / Bing Search tool
├── tests/
│   └── test_api.py
├── requirements.txt
├── .env                           # 🚫 NEVER commit this!
├── .env.example                   # Safe template to commit
├── Dockerfile
└── alembic/                       # DB migrations
```

---

## 📦 Full Frontend Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (navbar, theme)
│   │   ├── page.tsx               # Landing page
│   │   ├── dashboard/page.tsx     # Main dashboard
│   │   ├── resume/page.tsx        # Upload & analyze resume
│   │   ├── roadmap/page.tsx       # Career roadmap viewer
│   │   ├── market/page.tsx        # Market insights
│   │   ├── interview/page.tsx     # Mock interview chat
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SkillCard.tsx
│   │   ├── RoadmapStep.tsx
│   │   ├── InterviewChat.tsx
│   │   ├── MarketChart.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── services/
│   │   └── api.ts                 # Axios instance + all API calls
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useWebSocket.ts
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── public/
│   └── favicon.ico
├── .env.local
└── package.json
```

---

## 🔑 Starter Code

### `backend/.env.example`
```env
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
DATABASE_URL=sqlite:///./dev.db
SECRET_KEY=your_jwt_secret_key_here
BING_SEARCH_API_KEY=your_bing_key_here
```

### `backend/app/core/config.py`
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AZURE_OPENAI_API_KEY: str = os.getenv("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "changeme")

    @property
    def llm_config(self):
        return {
            "config_list": [{
                "model": self.AZURE_OPENAI_DEPLOYMENT,
                "api_key": self.AZURE_OPENAI_API_KEY,
                "base_url": self.AZURE_OPENAI_ENDPOINT,
                "api_type": "azure",
                "api_version": "2024-02-15-preview"
            }],
            "temperature": 0.7,
            "timeout": 120,
        }

settings = Settings()
```

### `backend/app/agents/registry.py`
```python
from autogen import AssistantAgent, UserProxyAgent
from app.core.config import settings

def get_user_proxy():
    return UserProxyAgent(
        name="User_Proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=0,
        code_execution_config=False,
    )

def get_resume_analyst():
    return AssistantAgent(
        name="Resume_Analyst",
        llm_config=settings.llm_config,
        system_message="""You are an expert Technical Recruiter. Analyze resumes and extract:
        1. Technical Skills, 2. Soft Skills, 3. Years of Experience, 4. Strengths, 5. Skill Gaps.
        Always respond in valid JSON format."""
    )

def get_market_researcher():
    return AssistantAgent(
        name="Market_Researcher",
        llm_config=settings.llm_config,
        system_message="""You are a Job Market Analyst. Identify:
        1. Top 5 in-demand skills for the given role
        2. Salary range
        3. Top hiring companies
        4. Market trend (Growing/Stable/Declining)
        Always respond in valid JSON format."""
    )

def get_career_coach():
    return AssistantAgent(
        name="Career_Coach",
        llm_config=settings.llm_config,
        system_message="""You are a Senior Career Coach. Create a week-by-week learning plan.
        For each week: Topic, Free Resource URL, Estimated Hours, Mini Project.
        Always respond in valid JSON format."""
    )

def get_interview_agent():
    return AssistantAgent(
        name="Interviewer",
        llm_config=settings.llm_config,
        system_message="""You are a senior technical interviewer.
        Ask ONE question at a time. After each answer give brief feedback.
        After 5 questions provide a final summary with an overall score out of 100."""
    )
```

### `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Career Mentor API",
    description="Powered by Azure OpenAI + Microsoft AutoGen",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock down in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.api import auth, resume, roadmap, market, interview

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/resume", tags=["Resume"])
app.include_router(roadmap.router, prefix="/roadmap", tags=["Career Roadmap"])
app.include_router(market.router, prefix="/market", tags=["Market Insights"])
app.include_router(interview.router, prefix="/interview", tags=["Mock Interview"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "AI Career Mentor"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 🏆 Hackathon Winning Strategy

### Judging Criteria Focus Areas

| Criterion | Weight | Your Strategy |
|-----------|--------|---------------|
| **Agentic Design** | 20% | Show 4 agents collaborating via AutoGen GroupChat with logged conversations |
| **Enterprise Readiness** | 20% | CI/CD with GitHub Actions, Docker, JWT Auth, Azure deployment |
| Innovation | 20% | Real-time market data sync via MCP is unique |
| Technical Execution | 20% | Clean FastAPI code, working demo, good docs |
| Business Impact | 20% | Clear problem/solution story, scalable architecture |

### 💡 "Wow" Moments to Show Judges:
1. **Open the agent chat logs** in the demo — show agents actually "talking" to each other
2. **Live market data**: Upload a resume → see real job postings in the roadmap
3. **The full pipeline in < 30 seconds**: Resume → Analysis → Roadmap → Market Sync
4. **Interview score card**: A numerical score with feedback feels very "enterprise"

---

*Document Last Updated: Feb 20, 2026 | Team: 2 Devs | Project: AI Career Mentor | Day 1 ✅ Complete*
