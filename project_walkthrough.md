# AI Career Mentor - Production Walkthrough

Last updated: 2026-04-29 (Production Architecture Finalized)

This document is a concise guide to the project's architecture, features, and production setup.

---

## 1. Project Overview
AI Career Mentor is a full-stack platform providing AI-driven career coaching.
- **Frontend**: Next.js 16, React 19, TypeScript (Hosted on Vercel)
- **Backend**: FastAPI, SQLAlchemy (Hosted on Render)
- **AI**: Microsoft AutoGen / ag2 agents (Powered by Groq/Azure)
- **Database**: Neon Postgres (Production) / SQLite (Local)
- **Cache**: Upstash Redis (Daily Rate Limiting)
- **OAuth**: Google Login (Implemented)

---

## 2. Architecture
![AI Career Mentor Architecture](architecture.svg)

### Key Flows:
1. **Dashboard Stats**: Derived from database logs (`/user/stats`). Accurate across all devices.
2. **AI Analysis**: Multi-agent system (Resume, Roadmap, Market Researcher) consolidating data in < 60s.
3. **Mock Interviews**: WebSocket-based session with real-time AI feedback and Edge-TTS voice.
4. **Rate Limiting**: Daily limits (e.g., 6 resumes/day) enforced via Upstash Redis.

---

## 3. Tech Stack (Zero-Cost Production)
| Layer | Service | Purpose |
|---|---|---|
| **Frontend** | Vercel | Next.js Hosting (Free) |
| **Backend** | Render | FastAPI Docker Hosting (Free) |
| **Database** | Neon | Serverless Postgres (Free 0.5 GB) |
| **Cache** | Upstash | Redis for Rate Limiting (Free 10k cmds/day) |
| **LLM** | Groq | Llama 3.3 70B (Free / High Speed) |
| **Voice** | Edge-TTS | Natural Text-to-Speech (Free) |
| **Search** | DuckDuckGo | Market Research Tool (Free) |

---

## 4. Database Schema
| Table | Purpose |
|---|---|
| `users` | User accounts and credentials |
| `resumes` | Stored resume text and AI-parsed JSON results |
| `career_roadmaps` | Historical learning plans |
| `interview_sessions`| WebSocket chat history and final scores |
| `activity_logs` | Audit trail used for Day Streaks and Usage Tracking |

---

## 5. Local Setup
1. **Backend**:
   - `cd backend`
   - Create `venv`, install `requirements.txt`.
   - Setup `.env` with `GROQ_API_KEY`, `DATABASE_URL`, and `REDIS_URL`.
   - Run: `uvicorn app.main:app --reload`
2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

---

## 6. Deployment Checklist
- [ ] **Database**: Set `DATABASE_URL` to your Neon Postgres string.
- [ ] **Redis**: Set `REDIS_URL` to your Upstash connection string.
- [ ] **Environment**: Set `APP_ENV=production` and generated a strong `SECRET_KEY`.
- [ ] **CORS**: Update `CORS_ORIGINS` to your Vercel domain only.
- [ ] **Keep-Alive**: Set up UptimeRobot to ping your backend every 5 minutes to prevent Render free-tier sleep.

## 7. Upgrade Roadmap (Future Plans)

### Phase 1: Security & Reliability (High Priority)
- [x] **Google OAuth**: Implemented Google Login for one-click access.
- [ ] **httpOnly Cookies**: Move JWT from localStorage to secure cookies for XSS protection.
- [ ] **Email Verification**: Implement auth flows with **Resend** (3k/month free).
- [ ] **Sentry Monitoring**: Add error tracking for both frontend and backend.
- [ ] **Unit Testing**: Expand coverage for AI agent parsing and WebSocket sessions.

### Phase 2: Enhanced AI Capabilities
- [ ] **Cloud Storage (R2/S3)**: Implement binary storage for original PDF resumes and Interview Audio recordings.
- [ ] **Model Fallback**: Implement automatic switching to OpenAI/Azure if Groq hits rate limits.
- [ ] **Pydantic Validation**: Force AI agents to return strictly validated JSON structures.

### Phase 3: Product Growth
- [ ] **Job Search Tracker**: A Kanban board for users to manage their job applications.
- [ ] **LinkedIn SEO Auto-fix**: AI-suggested headline and about section one-click copy.
- [ ] **Export to PDF**: Generate a clean PDF report of the full career analysis.

---

For a full list of API endpoints and advanced configuration, see the [README.md](README.md).

