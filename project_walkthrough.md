# AI Career Mentor - Production Walkthrough and Upgrade Plan

Last updated: 2026-04-29

This document explains the current system, what has already been fixed, what is still pending, and what should be added to take AI Career Mentor from a working full-stack project to a production-ready SaaS platform.

---

## 1. Project Summary

AI Career Mentor is a full-stack AI career coaching platform. A user can register/login, upload a resume, get an AI resume analysis, generate a target-role roadmap, research market trends, review LinkedIn profile text, and run a live mock interview over WebSocket with voice output.

At a high level:

- Frontend: Next.js 16, React 19, TypeScript
- Backend: FastAPI, SQLAlchemy, Alembic, JWT auth
- AI: Microsoft AutoGen / ag2 agents
- LLM providers: Groq, OpenAI, Azure OpenAI through env config
- External tools: DuckDuckGo search, Edge TTS, PDF parsing
- Deployment target: Vercel for frontend, Render Docker service for backend

The app is already functional, builds successfully, and backend tests pass. The next step is production hardening: security, observability, database reliability, CI/CD, environment management, and stronger test coverage.

---

## 2. Current Architecture

Visual files:

- Preview image in Markdown: `architecture.svg`
- Editable draw.io source: `architecture.drawio`

![AI Career Mentor Architecture](architecture.svg)

### Request Flow

1. User opens the frontend.
2. User logs in or registers.
3. Frontend stores JWT token in browser localStorage.
4. Axios attaches the token to protected REST calls.
5. FastAPI validates the token and loads the current user.
6. API routes call AI agents, database, PDF parser, search tool, or TTS tool.
7. AI responses are normalized into JSON and returned to the frontend.

### WebSocket Interview Flow

1. Frontend starts an interview and opens `WS /interview/ws/{session_id}`.
2. The JWT token is sent as a query parameter.
3. Backend validates the token before accepting the WebSocket session.
4. Backend creates or resumes an interview session owned by that user.
5. User answers questions through the socket.
6. Interview agent replies and Edge TTS generates audio.
7. Final interview score is stored in the database.

---

## 3. Tech Stack

| Layer | Current Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16, React 19, TypeScript | UI, dashboard, forms, client state |
| Styling | CSS in `globals.css`, inline component styles | Dark dashboard UI |
| Backend | FastAPI | REST API and WebSocket server |
| ORM | SQLAlchemy | Database models and sessions |
| Migrations | Alembic | Database schema versioning |
| Auth | JWT, bcrypt, python-jose | Register/login and protected routes |
| AI agents | ag2 / Microsoft AutoGen style agents | Resume, roadmap, market, LinkedIn, interview |
| PDF parsing | pdfplumber | Resume PDF text extraction |
| Search | DuckDuckGo search | Market trend research |
| TTS | edge-tts | Mock interview voice output |
| Rate limiting | SlowAPI | API abuse protection |
| Logging | Loguru | App logging |
| Testing | Pytest | Backend tests |
| Frontend lint | ESLint + Next config | Code quality checks |
| Backend deploy | Docker + Render | Containerized FastAPI deployment |
| Frontend deploy | Vercel | Next.js hosting |

---

## 4. Important Files

| File / Folder | Purpose |
|---|---|
| `frontend/src/app` | Next.js app routes |
| `frontend/src/services/api.ts` | Axios API client and auth interceptor |
| `frontend/src/app/dashboard/interview/page.tsx` | Mock interview UI and WebSocket client |
| `backend/app/main.py` | FastAPI app setup, CORS, rate limit, routers |
| `backend/app/core/config.py` | Environment settings and LLM provider config |
| `backend/app/core/security.py` | Password hashing and JWT creation |
| `backend/app/api/deps.py` | Current user dependency for protected routes |
| `backend/app/api` | API routers |
| `backend/app/agents` | AI agent registry and workflow |
| `backend/app/models/models.py` | SQLAlchemy database models |
| `backend/app/models/schemas.py` | Pydantic request/response schemas |
| `backend/alembic` | Database migrations |
| `backend/Dockerfile` | Backend container |
| `.gitignore` | Ignore rules for dependencies, env files, local data |
| `render.yaml` | Render backend deployment config |
| `start.bat` | Local Windows startup helper |

---

## 5. Current API Surface

Base backend URL locally: `http://localhost:8000`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/` | No | Root welcome response |
| `GET` | `/health` | No | Service and LLM provider health |
| `POST` | `/auth/register` | No | Create user and return JWT |
| `POST` | `/auth/login` | No | Login and return JWT |
| `POST` | `/resume/upload` | Yes | Upload PDF and extract text only |
| `POST` | `/resume/analyze` | Yes | Upload PDF and run resume analyst agent |
| `POST` | `/roadmap/generate` | Yes | Generate 8-week learning roadmap |
| `GET` | `/market/trends` | Yes | Research live market trends |
| `POST` | `/career/full-analysis` | Yes | Run multi-agent career analysis |
| `POST` | `/linkedin/review` | Yes | Review LinkedIn profile text |
| `WS` | `/interview/ws/{session_id}` | Yes | Live mock interview over WebSocket |

Note: LinkedIn route is protected because `main.py` mounts the router with `dependencies=protected_depends`.

---

## 6. AI Agent System

| Agent | Main Job | Input | Output |
|---|---|---|---|
| Resume Analyst | Parse resume and identify strengths/gaps | Resume text | Skills, experience, strengths, skill gaps |
| Career Coach | Generate personalized roadmap | Target role + skill gaps | Week-by-week plan |
| Market Researcher | Research hiring trends | Role + location | Skills, salary, companies, trend |
| LinkedIn Reviewer | Review LinkedIn profile | Profile text | Headline tips, keywords, score, feedback |
| Interviewer | Conduct mock interview | Role + company + answers | Questions, feedback, score |

### Current AI Risk

LLM output can be inconsistent. Current code includes JSON parsing fallbacks, but production should add stricter structured-output validation, retries, and error telemetry.

---

## 7. Database Schema

Defined in `backend/app/models/models.py`.

| Table | Purpose | Key Fields |
|---|---|---|
| `users` | User accounts | `id`, `email`, `name`, `hashed_pw`, `created_at` |
| `resumes` | Resume uploads and parsed content | `id`, `user_id`, `filename`, `raw_text`, `parsed_content`, `uploaded_at` |
| `career_roadmaps` | Generated roadmap storage | `id`, `user_id`, `target_role`, `steps`, `created_at` |
| `interview_sessions` | Mock interview history | `id`, `user_id`, `target_role`, `chat_history`, `score`, `status`, `created_at`, `completed_at` |

### Production DB Recommendation

Current default is SQLite for local development:

```env
DATABASE_URL=sqlite:///./dev.db
```

Production should use Postgres:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

Why:

- SQLite is not ideal for concurrent production traffic.
- Postgres gives better reliability, backups, indexes, JSON support, and migrations.
- Render/Vercel/Azure/AWS all support managed Postgres options.

---

## 8. What Was Fixed Recently

These fixes were applied during the production-readiness pass.

### 8.1 `.gitignore` repaired

Old `.gitignore` contained a plain sentence instead of ignore rules. This caused `node_modules` and local artifacts to enter Git tracking.

Now ignored:

- `node_modules/`
- `frontend/node_modules/`
- `.next/`
- `.pytest_cache/`
- `venv/`
- `backend/venv/`
- `*.db`
- `.env`
- logs and OS files

### 8.2 `node_modules` removed from Git index

`node_modules` was removed from the Git index using cached removal. Files remain on disk but are no longer tracked by Git.

### 8.3 JWT secret mismatch fixed

Previously:

- `config.py` used `SECRET_KEY`
- `security.py` directly read `JWT_SECRET`
- fallback was a weak hardcoded secret

Now:

- `security.py` uses centralized `settings.SECRET_KEY`
- `SECRET_KEY` is primary
- `JWT_SECRET` remains as backward-compatible fallback

Recommended production env:

```env
SECRET_KEY=generate-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### 8.4 CORS locked down

Previously CORS allowed `"*"` while also allowing credentials.

Now CORS uses:

```env
CORS_ORIGINS=http://localhost:3000,https://ai-career-mentor.vercel.app
```

Production should set this to the actual frontend domain only.

### 8.5 Interview WebSocket protected

Previously:

- WebSocket accepted unauthenticated connections.
- Missing sessions created a dummy user.
- Any random session id could be created.

Now:

- WebSocket requires a valid JWT token.
- The backend validates the user before accepting the socket.
- Session ownership is checked.
- Dummy user fallback has been removed.

### 8.6 Frontend XSS risk removed in interview chat

Previously:

- Interview messages used `dangerouslySetInnerHTML`.
- User/AI content could inject HTML into the page.

Now:

- Messages are rendered as React text nodes.
- Code blocks are rendered safely with `<pre><code>`.
- Raw HTML is not injected.

### 8.7 Frontend lint dependency chain repaired

Missing lint dependencies were added:

- `@eslint-community/eslint-utils`
- `@babel/core`
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`

`npm run lint` now runs successfully.

---

## 9. Current Verification Status

Last checked:

```powershell
cd frontend
cmd /c npm run lint
cmd /c npm run build

cd ..\backend
.\venv\Scripts\python.exe -m pytest
```

Result:

| Check | Status | Notes |
|---|---|---|
| Frontend lint | Pass with warnings | 0 errors, warnings remain |
| Frontend build | Pass | Next.js production build succeeds |
| Backend tests | Pass | 4 tests passing |
| Backend import | Pass | `app.main` imports successfully |

Known warnings:

- Frontend has unused imports and some `any` types.
- Backend pytest cache has a permission warning for `.pytest_cache`.
- SQLAlchemy warns that `declarative_base()` import path is deprecated.
- `npm install` reports package vulnerabilities that need audit review.

---

## 10. Production Environment Variables

Backend env should include:

```env
APP_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=replace-with-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=https://your-frontend-domain.com

LLM_PROVIDER=groq
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.3-70b-versatile

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

BING_SEARCH_API_KEY=
```

Frontend env should include:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Important:

- Do not commit `.env` files.
- Use Render/Vercel secret managers.
- Rotate `SECRET_KEY` before production launch.
- Use different secrets for dev/staging/prod.

---

## 11. Production Upgrade Roadmap

### Phase 1 - Must Do Before Public Launch

These are non-negotiable production tasks.

| Task | Why |
|---|---|
| Move production DB to Postgres | SQLite is not enough for real users |
| Add real env secrets in hosting dashboard | Prevent secret leaks and weak defaults |
| Add HTTPS-only frontend/backend domains | Secure transport |
| Clean npm audit vulnerabilities | Reduce package security risk |
| Add CI pipeline for lint/build/tests | Prevent broken deploys |
| Fix pytest cache permission | Remove noisy test warnings |
| Improve WebSocket auth transport | Query token works, but cookie/subprotocol is better |
| Add request size limits | Prevent large upload abuse |
| Add PDF page/file limits | Prevent expensive parsing attacks |
| Add structured error responses | Better UX and debugging |

### Phase 2 - Reliability and Observability

| Task | Why |
|---|---|
| Add Sentry or OpenTelemetry | Catch runtime errors |
| Add structured JSON logs | Easier production debugging |
| Add request ID middleware | Trace a request across logs |
| Add health checks for DB and LLM provider | Real readiness monitoring |
| Add retry/backoff for LLM/search/TTS calls | External APIs fail sometimes |
| Add timeout handling per route | Prevent stuck requests |
| Add background jobs for long AI tasks | Avoid HTTP timeout issues |
| Add Redis cache/session store | Share state across workers |

### Phase 3 - Security Hardening

| Task | Why |
|---|---|
| Move token from localStorage to httpOnly cookie | Reduce XSS token theft risk |
| Add refresh token flow | Better session UX |
| Add email verification | Prevent fake accounts |
| Add password reset | Basic SaaS requirement |
| Add stricter password policy | Account security |
| Add per-user rate limits | Prevent abuse |
| Add audit logs for auth events | Security visibility |
| Add Content Security Policy | Browser-side protection |
| Add dependency scanning in CI | Catch vulnerable packages |

### Phase 4 - Product Quality

| Task | Why |
|---|---|
| Save resume analyses per user | Users can revisit reports |
| Save roadmaps per user | Better dashboard continuity |
| Add progress tracking backend persistence | Current localStorage data can be lost |
| Add interview history page | Users can compare performance |
| Add export to PDF | Useful career report deliverable |
| Add billing/limits if needed | SaaS monetization |
| Add admin dashboard | Monitor users, failures, usage |

### Phase 5 - AI Quality

| Task | Why |
|---|---|
| Enforce Pydantic validation on agent outputs | Prevent bad JSON shape |
| Add retry when JSON parse fails | Better AI reliability |
| Add prompt versioning | Track behavior changes |
| Add eval datasets | Test AI output quality |
| Add model fallback | If Groq/OpenAI fails, use another provider |
| Add cost and token tracking | Control production spend |
| Add human-readable agent logs | Debug agent decisions |

---

## 12. Recommended Production Architecture

Visual file: `production_architecture.svg`

![Recommended Production Architecture](production_architecture.svg)

Recommended additions:

- Postgres for persistent data
- Redis for rate limits, cache, sessions, and WebSocket scaling
- Background worker for long-running AI analysis
- Object storage for uploaded files if files need to be retained
- Sentry/OpenTelemetry for production monitoring

---

## 13. CI/CD Plan

### Minimum CI Checks

Every pull request should run:

```powershell
cd frontend
cmd /c npm ci
cmd /c npm run lint
cmd /c npm run build

cd ../backend
.\venv\Scripts\python.exe -m pytest
```

For GitHub Actions/Linux CI, use equivalent commands:

```bash
npm ci
npm run lint -w frontend
npm run build -w frontend

cd backend
pip install -r requirements.txt
pytest
```

### Recommended Pipeline

1. Install frontend dependencies.
2. Run frontend lint.
3. Run frontend build.
4. Install backend dependencies.
5. Run backend tests.
6. Run Alembic migration check.
7. Run dependency audit.
8. Deploy only if all checks pass.

---

## 14. Deployment Runbook

### Backend on Render

Backend uses `backend/Dockerfile`.

Current command:

```dockerfile
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips=\"*\""]
```

Before deploying:

1. Set `DATABASE_URL` to production Postgres.
2. Set `SECRET_KEY`.
3. Set `CORS_ORIGINS` to frontend production domain.
4. Set LLM provider keys.
5. Ensure Alembic migration runs successfully.
6. Open `/health` after deploy.

### Frontend on Vercel

Set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Then deploy the `frontend` workspace.

Post-deploy checks:

- Login/register works.
- Resume upload works.
- Roadmap generation works.
- Market endpoint works.
- Interview WebSocket connects.
- LinkedIn review works.

---

## 15. Known Issues Still Remaining

These are not blockers for local usage, but should be cleaned before production launch.

### 15.1 Encoding / mojibake in older files

Some older files still contain mojibake from box-drawing characters, emoji, and arrow symbols.

Impact:

- Mostly readability/log polish.
- Tests may depend on old strings, so fix carefully.

Recommended:

- Convert docs/comments/log messages to clean UTF-8 or plain ASCII.
- Avoid changing API response strings unless tests are updated.

### 15.2 Frontend lint warnings

Lint now passes, but warnings remain:

- Unused imports
- `any` types
- Some older component hygiene issues

Recommended:

- Clean warnings file by file.
- Add stricter CI later when warnings are reduced.

### 15.3 NPM vulnerabilities

`npm install` reports vulnerabilities.

Recommended:

```powershell
cmd /c npm audit
cmd /c npm audit fix
```

Do not blindly run `npm audit fix --force` without checking breaking upgrades.

### 15.4 Pytest cache permission warning

Backend tests pass, but pytest cannot write `.pytest_cache`.

Recommended:

- Delete/recreate `.pytest_cache` with correct permissions.
- Or set `PYTEST_DISABLE_PLUGIN_AUTOLOAD` / cache options in CI if needed.

### 15.5 WebSocket token transport

Current WebSocket auth sends token as query string. This is functional but not ideal.

Better production options:

- httpOnly secure cookie
- WebSocket subprotocol auth
- Short-lived one-time WebSocket ticket

---

## 16. Local Development Commands

### Install frontend dependencies

```powershell
cmd /c npm install
```

### Start backend

```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Start frontend

```powershell
cd frontend
cmd /c npm run dev
```

### Run backend tests

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest
```

### Run frontend checks

```powershell
cd frontend
cmd /c npm run lint
cmd /c npm run build
```

### Run migrations

```powershell
cd backend
.\venv\Scripts\alembic.exe upgrade head
```

---

## 17. Production Definition of Done

The project should be considered production-ready when all these are true:

- Frontend deploys on Vercel with correct `NEXT_PUBLIC_API_URL`.
- Backend deploys on Render or another cloud with HTTPS.
- Production database is Postgres, not local SQLite.
- All required env vars are set through secret manager.
- `SECRET_KEY` is strong and not default.
- CORS only allows real frontend domains.
- WebSocket interview requires auth.
- `npm run lint` has 0 errors.
- `npm run build` passes.
- Backend tests pass in CI.
- Alembic migrations run during deploy.
- API errors are logged and monitored.
- AI failures have retries/fallback responses.
- Dependency vulnerabilities are reviewed.
- Uploaded data has a retention/privacy policy.

---

## 18. Current Status Snapshot

| Area | Status |
|---|---|
| Frontend build | Passing |
| Frontend lint | Passing with warnings |
| Backend tests | Passing |
| JWT auth | Working, centralized secret config fixed |
| CORS | Wildcard removed, env-driven origins |
| WebSocket auth | Added |
| XSS risk in interview chat | Fixed |
| Git hygiene | `.gitignore` fixed, `node_modules` untracked |
| Production DB | Still pending |
| Monitoring | Still pending |
| CI hardening | Still pending |
| Dependency audit | Still pending |
| Encoding cleanup | Still pending |

---

## 19. Best Next Steps

Recommended order from here:

1. Move production database to Postgres.
2. Set real production env vars on Render and Vercel.
3. Add GitHub Actions for lint, build, and tests.
4. Clean remaining frontend lint warnings.
5. Fix encoding/mojibake in docs, comments, and logs.
6. Add Sentry or OpenTelemetry.
7. Add background jobs for long AI workflows.
8. Add Redis for rate limiting/session/cache if traffic grows.
9. Replace WebSocket query-token auth with cookie or one-time ticket.
10. Add more backend tests for auth, resume, roadmap, LinkedIn, and interview session ownership.

---

## 20. One-Line Summary

AI Career Mentor is now a working full-stack AI SaaS foundation with Next.js, FastAPI, JWT auth, AI agents, resume parsing, market research, roadmaps, LinkedIn review, and live mock interviews. The core security issues found in the review have been fixed; the next production push should focus on Postgres, CI/CD, monitoring, dependency audit, and stronger test coverage.
