# AI Career Mentor - Interview Preparation Notes

## Long English Interview Pitch Paragraph

AI Career Mentor is a full-stack, AI-powered career coaching platform that I built to solve a practical problem faced by students and early-career developers: they often have a resume, a goal role, and motivation, but they do not know exactly what skill gaps they have, what the current job market expects, how to convert those gaps into a weekly learning plan, or how to practice interviews in a realistic way. The system is designed as a decoupled web application with a Next.js 14 frontend and a FastAPI backend, connected through REST APIs and a real-time WebSocket interview endpoint. On the frontend, users can register or log in through email/password or Google OAuth, store a JWT in local storage, upload resumes, view dashboard statistics, generate roadmaps, analyze market trends, review LinkedIn profiles, run full career analysis, and take mock interviews with voice responses. On the backend, FastAPI exposes protected routers for resume analysis, roadmap generation, market intelligence, LinkedIn review, user stats, and full career analysis, while authentication is handled with bcrypt password hashing, Google ID token verification, and HS256 JWT access tokens. The AI layer is implemented using Microsoft AutoGen through the AG2 package, where specialized agents act as a resume analyst, career coach, market researcher, LinkedIn reviewer, and interviewer. The resume analyst extracts technical skills, soft skills, years of experience, strengths, skill gaps, and ATS-style scoring from PDF text extracted using pdfplumber. The career coach converts target roles and skill gaps into an eight-week roadmap with topics, resources, estimated hours, mini-projects, and success criteria. The market researcher uses a registered DuckDuckGo search tool to ground its response in current market signals such as salary ranges, hiring companies, and in-demand skills. The full analysis endpoint orchestrates multiple agents through AutoGen GroupChat so the resume analysis, market research, and roadmap can be produced as one connected workflow. The interview module is real-time: the frontend opens a WebSocket with the JWT token, the backend validates the user, creates or resumes an interview session in the database, asks seven structured questions through an AutoGen interviewer agent, converts each response into audio using Edge TTS, and persists chat history and final score. Data is modeled with SQLAlchemy tables for users, resumes, career roadmaps, interview sessions, and activity logs, with Alembic migrations managing schema changes, backed by production-grade connection pooling tailored for Neon serverless Postgres. Rate limiting is implemented at two levels: SlowAPI provides global request limits by client address, and a custom per-user daily AI feature limiter tracks expensive AI actions through Redis. To aggressively optimize LLM costs and latency, the system implements global AI response caching via Redis (hashing inputs via SHA-256), returning millisecond responses for duplicate queries while strictly enforcing daily usage quotas. The frontend uses Axios interceptors to attach the JWT, handle 401 session expiry, and show 429 rate-limit feedback through toast notifications. The application also includes Dockerfiles for backend and frontend, Docker Compose for local multi-service development with Redis, production Docker overrides, a Render deployment config for the backend, and GitHub Actions workflows for CI and Render deployment. The CI pipeline runs frontend linting and builds, backend pytest tests, and a pip-audit dependency scan. In local verification, the frontend lint and production build passed successfully, while backend pytest could not run on this machine because the active Python 3.13 environment does not have pytest installed; however, the repository CI is configured to install backend requirements and run tests under Python 3.11. Overall, this project demonstrates end-to-end engineering: authentication, authorization, persistence, agent orchestration, file upload processing, WebSockets, text-to-speech, rate limiting, CI/CD, Dockerization, dashboard UX, and practical AI product thinking. If I were explaining the project in an interview, I would emphasize that it is not just a wrapper around an LLM; it is a complete product architecture where each AI feature is isolated behind typed APIs, protected by authentication and usage limits, persisted for history and analytics, and integrated into a responsive frontend workflow.

## Project Snapshot

- Name: AI Career Mentor.
- Frontend: Next.js 14 App Router, React 18, TypeScript, Axios, Recharts, Lucide icons, Google OAuth, toast notifications.
- Backend: FastAPI, SQLAlchemy (Connection Pooling), Alembic, JWT, bcrypt, Google Auth, SlowAPI, Redis (Rate Limiting & Response Caching), AutoGen/AG2, pdfplumber, DuckDuckGo Search, Edge TTS.
- Main AI features: resume analysis, personalized roadmap generation, live market intelligence, LinkedIn review, full multi-agent analysis, mock interview with voice.
- Persistence: users, resumes, roadmaps, interview sessions, activity logs.
- Deployment: frontend is prepared for standalone Next.js Docker/Vercel style deployment; backend has Docker and Render config.
- CI/CD: GitHub Actions runs frontend lint/build, backend tests, dependency audit, and a separate Render deploy hook.

## File And Module Analysis

### Root

- `package.json`: npm workspace root that points to `frontend`.
- `package-lock.json`: workspace dependency lock file.
- `.gitignore`: ignores generated/local artifacts.
- `README.md`: detailed project overview, feature list, architecture, stack, and setup documentation.
- `project_walkthrough.md`: extra walkthrough documentation.
- `DOCKER_GUIDE.md`: Docker usage documentation.
- `docker-compose.yml`: local multi-service setup for backend, frontend, Redis, and optional Postgres.
- `docker-compose.prod.yml`: production override that removes source-code mounts and sets production environment values.
- `render.yaml`: Render backend deployment config using Docker and `backend` as root directory.
- `start.bat`: Windows helper that starts backend on port 8000 and frontend on port 3000.

### GitHub Actions

- `.github/workflows/ci.yml`: runs on pushes and PRs to `main`. Frontend job uses Node 20, `npm ci`, `npm run lint`, and `npm run build`. Backend job uses Python 3.11, installs `backend/requirements.txt`, runs `python -m pytest -p no:cacheprovider`, and runs `pip-audit`.
- `.github/workflows/backend-deploy.yml`: triggers Render deployment through `RENDER_DEPLOY_HOOK_URL` when backend files or the workflow change on `main`.

### Backend

- `backend/app/main.py`: FastAPI app setup, lifespan logs, CORS, SlowAPI middleware, request logging middleware, protected router registration, health and root endpoints.
- `backend/app/core/config.py`: environment-based settings for LLM provider, Groq, Google, database, auth, CORS, and active model selection.
- `backend/app/core/security.py`: bcrypt password hashing, password verification, JWT creation using HS256, token expiry configuration.
- `backend/app/core/database.py`: SQLAlchemy engine/session setup with production-grade connection pooling for Neon Postgres.
- `backend/app/core/rate_limit.py`: strict per-user daily limits for AI features (Interview: 3, Resume: 5, Roadmap: 5, Full Analysis: 4, Market: 5, LinkedIn: 10) tracked via Redis.
- `backend/app/core/cache.py`: global AI response caching via Redis using SHA-256 hashing to bypass redundant LLM calls and optimize tokens.
- `backend/app/core/activity.py`: writes feature activity logs.
- `backend/app/core/voice_engine.py`: converts text into base64 MP3 audio through Edge TTS for interview responses.
- `backend/app/api/deps.py`: decodes JWT bearer token and returns the authenticated user.
- `backend/app/api/auth.py`: email registration, email login, Google OAuth login, and token issuing.
- `backend/app/api/resume.py`: PDF upload/extraction and AI resume analysis with DB persistence and daily limit tracking.
- `backend/app/api/roadmap.py`: skill-gap-to-roadmap generation, JSON normalization, history, and deletion.
- `backend/app/api/market.py`: live job market research using an AutoGen tool backed by DuckDuckGo Search.
- `backend/app/api/career.py`: full multi-agent analysis through AutoGen GroupChat.
- `backend/app/api/interview.py`: authenticated WebSocket interview sessions with seven-question flow, chat persistence, scoring, and TTS audio.
- `backend/app/api/linkedin.py`: LinkedIn profile review using an AI reviewer agent and JSON extraction.
- `backend/app/api/user.py`: dashboard stats, last resume analysis, daily usage, weekly activity, recent activity, and streak calculation.
- `backend/app/models/models.py`: SQLAlchemy tables for users, resumes, roadmaps, interviews, and activity logs.
- `backend/app/models/schemas.py`: Pydantic request and response models.
- `backend/app/agents/registry.py`: factory functions for AutoGen user proxy, resume analyst, career coach, market researcher, LinkedIn reviewer, and interviewer.
- `backend/app/agents/workflow.py`: multi-agent GroupChat workflow for full career analysis.
- `backend/app/tools/market_search.py`: DuckDuckGo job trend search tool.
- `backend/alembic/*`: migration configuration and migration scripts.
- `backend/tests/test_main.py`: basic tests for root, health, and protected route authentication behavior.
- `backend/Dockerfile`: multi-stage Python 3.11 image with non-root user, healthcheck, Alembic migration, and Uvicorn startup.
- `backend/requirements.txt`: backend dependencies.
- `backend/.env.example`: documented environment variables.

### Frontend

- `frontend/src/services/api.ts`: central Axios client, JWT interceptor, 401 and 429 handling, and API wrapper functions.
- `frontend/src/app/layout.tsx`: root app layout and providers.
- `frontend/src/app/page.tsx`: public home page.
- `frontend/src/app/login/page.tsx`: login form and Google login integration.
- `frontend/src/app/register/page.tsx`: registration flow.
- `frontend/src/app/dashboard/page.tsx`: dashboard overview.
- `frontend/src/app/dashboard/resume/page.tsx`: resume upload and analysis UI.
- `frontend/src/app/dashboard/roadmap/page.tsx`: roadmap generation, history, and deletion UI.
- `frontend/src/app/dashboard/market/page.tsx`: market trend query UI.
- `frontend/src/app/dashboard/interview/page.tsx`: WebSocket mock interview UI.
- `frontend/src/app/dashboard/linkedin/page.tsx`: LinkedIn review UI.
- `frontend/src/app/dashboard/full-analysis/page.tsx`: upload resume text and run full multi-agent analysis.
- `frontend/src/app/dashboard/settings/page.tsx`: settings page.
- `frontend/src/components/*`: shared UI components such as navbar, sidebar, model selector, resume card, progress tracker, and analysis panel.
- `frontend/src/types/*`: TypeScript types for resume and roadmap responses.
- `frontend/next.config.js`: standalone Docker output, image settings, security headers, and currently ignores lint/type errors during production build.
- `frontend/Dockerfile`: multi-stage Node 20 Docker image for standalone Next.js.

## Verification Notes

- Frontend lint: passed with `cmd /c npm run lint`.
- Frontend production build: passed with `cmd /c npm run build`.
- Backend tests: attempted with `python -m pytest -p no:cacheprovider`, but local Python reported `No module named pytest`. CI installs backend requirements and runs tests under Python 3.11, so the pipeline is the intended test environment.

## Honest Interview Talking Points

- CORS currently allows all origins in `main.py`, even though `Settings.CORS_ORIGINS` exists. In production I would tighten this to configured origins.
- The old unused `rate_limit_filter` helper was removed so the rate-limit setup no longer has misleading dead code.
- Redis code expects `REDIS_URL`, while `.env.example` and Docker Compose mention Upstash REST variables. I would standardize this.
- `next.config.js` ignores lint and TypeScript errors during build. This helps deployment, but for production maturity I would remove those ignores and fix type issues.
- The old unused interview-start REST wrapper has been removed; the interview flow uses the WebSocket endpoint `/interview/ws/{session_id}` directly.
- Current backend tests are basic. I would add tests for auth success/failure, JWT expiry, rate limits, resume upload validation, roadmap input validation, and WebSocket interview behavior.

## 70 Interview Discussion Questions With Answers

1. What problem does this project solve?
Answer: It helps users understand their career readiness by combining resume analysis, skill-gap detection, market research, personalized learning roadmaps, LinkedIn feedback, and mock interview practice in one platform.

2. Why did you choose a full-stack architecture instead of a simple LLM script?
Answer: Because the goal is a real product, not just a prompt. Users need authentication, file uploads, persistent history, dashboard analytics, rate limits, real-time interviews, and deployment, so a full-stack architecture is justified.

3. What is the high-level architecture?
Answer: The frontend is a Next.js app, the backend is a FastAPI API server, the database layer uses SQLAlchemy and Alembic, authentication uses JWT, AI is handled by AutoGen agents, and deployment is supported by Docker, Render, and GitHub Actions.

4. What are the main frontend responsibilities?
Answer: The frontend handles user flows, forms, dashboard views, file upload UX, JWT storage, API calls through Axios, real-time interview interaction through WebSocket, charts, toasts, and responsive pages.

5. What are the main backend responsibilities?
Answer: The backend handles authentication, protected APIs, resume PDF parsing, AI orchestration, database persistence, WebSocket interview sessions, rate limiting, logging, health checks, and integrations with Google OAuth, DuckDuckGo, Redis, and Edge TTS.

6. How does authentication work?
Answer: For email/password, the backend hashes passwords with bcrypt during registration and verifies them during login. On success it creates a JWT access token. The frontend stores the token and sends it as `Authorization: Bearer <token>` on protected requests.

7. How does Google OAuth work?
Answer: The frontend receives a Google credential through `@react-oauth/google`, sends it to `/auth/google`, and the backend verifies the ID token using `google-auth` and `GOOGLE_CLIENT_ID`. If the user does not exist, it creates the user and returns a JWT.

8. Why use JWT?
Answer: JWT makes the backend stateless for session validation. The token contains the user id as `sub`, and protected dependencies decode it to load the current user from the database.

9. Which JWT algorithm is used?
Answer: HS256 is used through `python-jose`, with the secret coming from `SECRET_KEY` or `JWT_SECRET`.

10. What is the token expiry?
Answer: The default access token lifetime is now 60 minutes, configurable through `ACCESS_TOKEN_EXPIRE_MINUTES`, and auth responses also include a refresh token with a default 30-day lifetime through `REFRESH_TOKEN_EXPIRE_DAYS`.

11. How are passwords stored?
Answer: Passwords are never stored in plain text. The backend uses bcrypt salt and hash through `bcrypt.gensalt()` and `bcrypt.hashpw()`.

12. How are protected routes enforced?
Answer: Most routers are included with `Depends(get_current_user)`, and `get_current_user` decodes the JWT, extracts `sub`, queries the user table, and rejects invalid or missing tokens with 401.

13. Which routes are protected?
Answer: Resume, roadmap, market, career full analysis, LinkedIn, and user stats are protected at router level. Interview WebSocket validates the token manually from the query string.

14. How does resume upload work?
Answer: The backend accepts only PDF uploads, checks file size, writes the PDF to a temporary file, extracts text using pdfplumber, removes the temp file, and returns the extracted text or runs AI analysis depending on the endpoint.

15. Why use a temporary file for PDFs?
Answer: pdfplumber works well with file paths, and the code ensures cleanup in a `finally` block so uploaded files are not permanently stored on disk.

16. What file size validation exists?
Answer: Resume endpoints reject files above 5 MB when `UploadFile.size` is available.

17. What happens if the PDF is scanned?
Answer: If pdfplumber cannot extract text, the API returns a 422-style error explaining that the PDF may be scanned or image-based.

18. What does the resume analyst agent return?
Answer: It returns structured JSON with technical skills, soft skills, years of experience, top strengths, skill gaps, ATS score, and ATS score breakdown.

19. How do you handle invalid JSON from LLMs?
Answer: The backend strips markdown fences, attempts JSON parsing, and in some endpoints normalizes common alternative shapes. In resume analysis, if parsing fails it returns a raw response with a parse error marker.

20. What is the roadmap feature?
Answer: It takes a target role and skill gaps, asks the career coach agent to create an eight-week plan, normalizes each week into a typed response, stores it in the database, and allows history and deletion.

21. Why normalize roadmap output?
Answer: LLMs may return alternate field names such as `title` instead of `topic` or `hours` instead of `estimated_hours`. Normalization makes the API more resilient and frontend-friendly.

22. What is the market trends feature?
Answer: It accepts a role and location, registers a DuckDuckGo search tool with the market researcher agent, asks the agent to search and synthesize results, then returns skills, salary range, companies, and trend.

23. Why use DuckDuckGo Search?
Answer: It gives the market researcher some live external context instead of relying only on the model's internal knowledge.

24. What is the full analysis endpoint?
Answer: `/career/full-analysis` runs a GroupChat workflow with resume analyst, market researcher, and career coach, then extracts their outputs into one combined response.

25. Why use AutoGen GroupChat?
Answer: GroupChat allows specialized agents to collaborate in a controlled sequence, so resume findings, market demands, and roadmap recommendations can influence each other.

26. What is the role of `UserProxyAgent`?
Answer: It acts as the execution proxy and conversation initiator, with human input disabled and code execution disabled. It can also execute registered tools such as market search.

27. How is the mock interview implemented?
Answer: The frontend opens a WebSocket to `/interview/ws/{session_id}` with role, company, provider, and token. The backend validates the user, creates or resumes a session, sends questions from the interviewer agent, receives candidate answers, persists history, generates TTS audio, and eventually stores the score.

28. Why WebSocket for interviews?
Answer: Interviews are conversational and real-time, so WebSocket is better than repeated REST calls because it keeps a persistent full-duplex channel.

29. How many interview questions are asked?
Answer: The interview agent is designed around seven questions, covering introduction, system design or architecture, technical problem solving, domain knowledge, and behavioral assessment.

30. How is interview scoring handled?
Answer: The final interviewer message appends an `OVERALL SCORE : X/70` string. The backend parses different score formats and normalizes the result to a 0-100 scale.

31. How is voice added to the interview?
Answer: The backend passes each interviewer response to Edge TTS, saves temporary MP3 audio, base64-encodes it, deletes the temporary file, and sends the audio string over the WebSocket.

32. How is rate limiting implemented?
Answer: There are two layers. SlowAPI applies request limits by remote address, and a custom daily feature limiter tracks per-user AI usage for expensive features like interview, resume, roadmap, full analysis, and LinkedIn.

33. What are the daily feature limits?
Answer: Interview 3/day, full analysis 4/day, roadmap 5/day, market 5/day, resume 5/day, and LinkedIn 10/day. These limits are optimized based on token consumption (e.g. Interview consumes the most due to multi-turn conversation).

34. Why use Redis for rate limiting?
Answer: Redis gives atomic counters and shared state across workers or restarts, which is necessary for distributed production deployments.

35. What is the rate limiter fallback?
Answer: If Redis is unavailable, the code falls back to an in-memory dictionary. This is useful for local development but not ideal for multi-instance production.

36. When is usage incremented?
Answer: Usage is generally incremented after a successful AI action or after a new interview session is created, so failed attempts usually do not consume the user's daily quota.

37. What is ActivityLog used for?
Answer: It records user actions by feature so the dashboard can show recent activity, daily usage counts, weekly activity, and streaks.

38. What database tables exist?
Answer: `users`, `resumes`, `career_roadmaps`, `interview_sessions`, and `activity_logs`.

39. Why use SQLAlchemy?
Answer: SQLAlchemy provides ORM models, relationships, database session management, and compatibility with SQLite locally and Postgres in production.

40. Why use Alembic?
Answer: Alembic version-controls schema changes, so production databases can be migrated reliably instead of manually changing tables.

41. How does the dashboard get stats?
Answer: `/user/stats` queries the latest resume analysis, today's activity counts grouped by feature, weekly activity for the last seven days, recent logs, and streak calculation.

42. How does the frontend attach JWT tokens?
Answer: `frontend/src/services/api.ts` has an Axios request interceptor that reads `token` from localStorage and sets the Authorization header.

43. How does the frontend handle expired sessions?
Answer: The Axios response interceptor catches 401 responses outside auth routes, shows a toast, removes token and username from localStorage, and redirects to `/login`.

44. How does the frontend handle rate-limit errors?
Answer: It catches 429 responses, extracts the backend detail message, and shows a toast explaining the daily limit.

45. What is the model selector?
Answer: The `ModelSelector` component lets users choose between Groq and Google/Gemini, stores the preference in localStorage, and passes the provider to backend endpoints.

46. How are AI providers configured?
Answer: `Settings.get_llm_config()` returns AutoGen-compatible config for either Groq's OpenAI-compatible API or Google's Gemini configuration.

47. What is the default AI provider?
Answer: The default provider is `groq`, and the default Groq model is `llama-3.3-70b-versatile`.

48. What is the default Google model?
Answer: The default Google model is `gemini-1.5-flash`.

49. What security headers are set in Next.js?
Answer: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy` are configured in `next.config.js`.

50. What security issue would you improve first?
Answer: I would replace `allow_origins=["*"]` with `settings.CORS_ORIGINS`, especially because credentials are enabled. That is an important production hardening step.

51. What configuration mismatch exists around Redis?
Answer: The rate limiter reads `REDIS_URL`, while `.env.example` and Docker Compose mention Upstash REST variables. I would standardize the app to one Redis connection format.

52. What frontend/backend mismatch existed around interview start?
Answer: There used to be an unused frontend interview-start wrapper, while the backend interview flow actually uses `/interview/ws/{session_id}`. I removed that stale wrapper so the frontend API layer now matches the backend behavior.

53. How is CI configured?
Answer: CI runs on pushes and PRs to main. It checks frontend lint/build and backend tests/audit under Python 3.11.

54. What does the backend deploy workflow do?
Answer: On changes to backend files or the backend deploy workflow, it posts to a Render deploy hook stored in GitHub secrets.

55. What does Docker provide here?
Answer: Docker gives reproducible builds for backend and frontend. The backend image installs dependencies in a virtual environment and runs Alembic plus Uvicorn. The frontend image builds standalone Next.js and runs as a non-root user.

56. Why run containers as non-root?
Answer: Running as non-root reduces the impact of container compromise by limiting OS-level permissions.

57. What tests currently exist?
Answer: Basic backend tests verify root, health, and that protected roadmap and market routes reject unauthenticated requests.

58. What tests would you add?
Answer: I would add auth registration/login tests, Google token failure tests, JWT expiry tests, file validation tests, agent JSON parsing tests, rate-limit tests, dashboard stats tests, and WebSocket interview session tests.

59. Did local verification pass?
Answer: Frontend lint and build passed. Backend pytest could not run locally because pytest is not installed in the active Python environment, but CI is configured to install requirements before running tests.

60. Why is `next.config.js` ignoring lint/type errors during build?
Answer: It is likely a deployment workaround. For production quality I would remove those ignores and fix the underlying TypeScript and lint issues so CI and builds enforce correctness.

61. How do you prevent LLM cost abuse and optimize performance?
Answer: The platform uses authenticated routes, per-user daily AI limits, and SlowAPI. Most importantly, it implements global AI Response Caching via Redis. Identical queries (e.g., same resume text) bypass the LLM completely, saving tokens and returning responses in milliseconds, while still correctly incrementing the user's daily quota to prevent abuse.

62. How is observability handled?
Answer: The backend uses Loguru to log startup configuration, incoming requests, completion status, errors, rate-limit increments, and agent workflow details.

63. What happens on unexpected backend errors?
Answer: The request logging middleware catches exceptions, logs the traceback, and returns a generic 500 JSON response instead of exposing internal details.

64. Why use Pydantic schemas?
Answer: They define request and response contracts, improve validation, generate useful OpenAPI docs, and make frontend integration more predictable.

65. How does the app handle database sessions?
Answer: `get_db()` yields a SQLAlchemy session per request and closes it in a `finally` block.

66. What is the biggest engineering strength of this project?
Answer: The strongest part is that AI features are productized: they are authenticated, rate-limited, persisted, exposed through APIs, connected to UI workflows, and supported by deployment and CI.

67. What is the biggest technical risk?
Answer: LLM output reliability is a major risk. The project mitigates it with strict prompts and parsing helpers, but stronger JSON-schema validation and retry logic would make it more robust.

68. How would you scale this project?
Answer: I would use managed Postgres, Redis, multiple backend workers, stricter CORS, background jobs for long AI tasks, structured logs, tracing, a queue for TTS/AI processing, and stronger caching for market results.

69. How would you improve security?
Answer: I would tighten CORS, require strong production secrets, store JWTs in secure HTTP-only cookies if appropriate, add refresh tokens or shorter access tokens, validate all provider inputs, add request body size limits, and rate-limit auth attempts.

70. How would you explain this project in one line?
Answer: It is a production-style AI career coaching platform that combines authenticated user workflows, multi-agent AI analysis, real-time WebSocket interviews, persistent analytics, and deployment automation into one practical full-stack product.
