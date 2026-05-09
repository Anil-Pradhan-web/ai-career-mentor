# 🚀 AI Career Mentor: The Ultimate End-to-End Mastery Roadmap (90 Days)

Bhai, yeh tumhara ultimate guide hai. Isme project ka **100% har ek chota aur bada concept** shamil hai. Time ki koi limit nahi hai, target sirf ek hai: **Har ek line of code ka master banna.**

Copy-pen taiyar rakho, aur diagrams banana mat bhoolna!

---

## 🛠️ Phase 1: The Core Foundation (Backend & Setup)
*Backend kaise start hota hai, aur data kaise flow karta hai.*

- **Day 1-2: The Entry Point & Server Startup**
  - **Files:** `backend/app/main.py`
  - **Focus:** FastAPI instance creation, CORS Middleware (kon kahan se access kar sakta hai), aur Server Startup Events.
- **Day 3-4: Environment & Configuration Management**
  - **Files:** `backend/app/core/config.py`, `.env`
  - **Focus:** `pydantic-settings` ka use karke API keys, Database URLs, aur secrets ko safely load karna.
- **Day 5-6: Database Connection & ORM Concepts**
  - **Files:** `backend/app/core/database.py`
  - **Focus:** SQLAlchemy se PostgreSQL/SQLite ka engine banana, aur Database sessions ko manage karna.
- **Day 7-8: User Models & Database Schemas**
  - **Files:** `backend/app/models/user.py`
  - **Focus:** ORM Tables kaise define hote hain (id, email, password, timestamps).
- **Day 9-10: Database Migrations (Alembic)**
  - **Files:** `backend/alembic/`, `backend/alembic.ini`
  - **Focus:** Agar database mein naya column add karna ho, toh purana data bina delete kiye kaise karte hain.

---

## 🔐 Phase 2: Authentication & Security 
*User ko verify karna aur safe rakhna.*

- **Day 11-12: Password Hashing & Security**
  - **Files:** `backend/app/core/security.py`
  - **Focus:** Passwords ko `bcrypt` se encrypt karna aur verify karna. Password direct DB mein kyun nahi dikhte.
- **Day 13-14: JWT (JSON Web Tokens) Creation**
  - **Files:** `backend/app/core/security.py`
  - **Focus:** Login hone ke baad server "Token" kaise banata hai.
- **Day 15-16: Auth Endpoints (Login/Register)**
  - **Files:** `backend/app/api/auth.py`
  - **Focus:** `POST /register` aur `POST /login` routes ka flow aur Dependency Injection (`Depends`).
- **Day 17-18: Protecting Routes (Auth Middleware)**
  - **Files:** `backend/app/api/auth.py` (get_current_user function)
  - **Focus:** Token verify karke pata lagana ki request kaunsa user kar raha hai.

---

## 💻 Phase 3: Frontend Foundations & Auth Integration
*UI dikhana aur backend se connect karna.*

- **Day 19-20: Next.js Layouts & Routing**
  - **Files:** `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`
  - **Focus:** App router, global CSS, aur components ka structure.
- **Day 21-22: React State & Hooks Basics**
  - **Files:** `frontend/src/app/login/page.tsx`
  - **Focus:** `useState`, `useEffect` ka real use-case login form mein.
- **Day 23-24: Calling APIs from Frontend**
  - **Files:** `frontend/src/app/login/page.tsx`
  - **Focus:** `fetch` ya `axios` ka use karke backend se token lena.
- **Day 25-26: Session Management**
  - **Files:** `frontend/src/components/Sidebar.tsx` (ya dashboard layout)
  - **Focus:** Token ko `localStorage` mein save karna aur user ko log out karna.

---

## 📄 Phase 4: Data Processing & Caching (Resume Analyzer)
*Heavy files ko process karna aur speed badhana.*

- **Day 27-28: Handling File Uploads**
  - **Files:** `backend/app/api/resume.py`
  - **Focus:** FastAPI mein `UploadFile` ka use karke PDF receive karna.
- **Day 29-30: PDF Text Extraction**
  - **Files:** `backend/app/api/resume.py`
  - **Focus:** `pdfplumber` ya `PyPDF2` se PDF ka text nikalna.
- **Day 31-32: Upstash Redis & Caching System**
  - **Files:** `backend/app/core/cache.py`
  - **Focus:** Redis setup, data ko cache mein save karna taaki response fast ho.
- **Day 33-34: Rate Limiting (Spam Protection)**
  - **Files:** `backend/app/core/rate_limit.py`
  - **Focus:** SlowAPI ka use karke ek user ko 1 minute mein sirf 5 request karne dena.
- **Day 35-36: Frontend Data Visualization**
  - **Files:** `frontend/src/components/ResumeAnalysisPanel.tsx`
  - **Focus:** Backend se aane wale ATS score ko progress bars aur charts mein badalna.

---

## 🧠 Phase 5: The AI Brain (Microsoft AutoGen & Prompts)
*App ka intelligence layer.*

- **Day 37-38: LiteLLM & Model Routing**
  - **Files:** `backend/app/core/config.py` (LLM Config section)
  - **Focus:** Groq, Azure, aur AWS ke models ko ek sath kaise manage kiya jata hai.
- **Day 39-40: System Prompts Engineering**
  - **Files:** `backend/app/agents/registry.py`
  - **Focus:** AI agents ko unka "Persona" (e.g., Resume Analyst) dena.
- **Day 41-42: Single Agent Execution**
  - **Files:** `backend/app/api/resume.py`
  - **Focus:** Extracted PDF text AI ko bhejna aur usse strict JSON format mein result mangwana.
- **Day 43-44: Pydantic Validation for AI Output**
  - **Files:** `backend/app/models/...` (or directly in the API)
  - **Focus:** AI ke bheje hue JSON ko validate karna taaki code crash na ho.
- **Day 45-46: The LinkedIn Reviewer Feature**
  - **Files:** `backend/app/api/linkedin.py`, `frontend/src/app/dashboard/linkedin/page.tsx`
  - **Focus:** Multiple inputs combine karke AI ko pass karne ka flow.

---

## 🤖 Phase 6: Multi-Agent Orchestration (GroupChat)
*Jab bots aapas mein meeting karte hain.*

- **Day 47-49: GroupChat Configuration**
  - **Files:** `backend/app/api/career.py`
  - **Focus:** Microsoft AutoGen ka `GroupChatManager` kaise 4 agents (Market, Resume, Coach) ko manage karta hai.
- **Day 50-52: Web Search Integration (Market Researcher)**
  - **Files:** `backend/app/api/market.py`
  - **Focus:** AI agent ko internet access dena (DuckDuckGo ya Serper API).
- **Day 53-54: Career Roadmap Generator**
  - **Files:** `backend/app/api/roadmap.py`
  - **Focus:** Complex chronological JSON data (Week 1, Week 2...) banwana aur UI pe dikhana.

---

## 🎙️ Phase 7: Real-Time Communication (WebSockets & Audio)
*Live Interview ki mechanics.*

- **Day 55-57: WebSocket Architecture (Backend)**
  - **Files:** `backend/app/api/interview.py`
  - **Focus:** WebSocket connection accept karna aur state maintain karna (while loop).
- **Day 58-60: WebSocket Architecture (Frontend)**
  - **Files:** `frontend/src/app/dashboard/interview/page.tsx`
  - **Focus:** React mein `new WebSocket()` banana, reconnect logic, aur message list state update karna.
- **Day 61-63: Text-to-Speech (Voice Engine)**
  - **Files:** `backend/app/core/voice_engine.py`
  - **Focus:** Edge-TTS se text ko audio binary mein convert karna aur Base64 mein encode karna.
- **Day 64-66: Audio Playback in React**
  - **Files:** `frontend/src/app/dashboard/interview/page.tsx`
  - **Focus:** Base64 audio ko receive karke queue mein lagana aur browser mein smoothly play karna.

---

## ⌨️ Phase 8: Live Coding & Advanced UI
*Technical Interviews ke features.*

- **Day 67-69: Monaco Editor (VS Code in Browser)**
  - **Files:** `frontend/src/app/dashboard/interview/page.tsx`
  - **Focus:** Code editor embed karna, themes, aur languages (Python, Java, C++) toggle karna.
- **Day 70-72: Code String Parsing**
  - **Files:** `frontend/src/app/dashboard/interview/page.tsx`
  - **Focus:** User ke code aur text ko milakar backend ko bhejna (markdown formatting).
- **Day 73-75: AI Code Evaluation Prompting**
  - **Files:** `backend/app/agents/registry.py` (Mock Interviewer instructions)
  - **Focus:** AI ko sikhana ki wo Big-O Time/Space complexity check kare.

---

## ☁️ Phase 9: DevOps, Error Handling & Deployment
*Project ko real world ke liye ready karna.*

- **Day 76-78: Global Exception Handling**
  - **Files:** `backend/app/main.py`
  - **Focus:** Agar server mein koi bug aaye toh use handle karna taaki backend crash na ho.
- **Day 79-81: Dockerizing the App**
  - **Files:** `Dockerfile`, `docker-compose.yml`
  - **Focus:** Project ko ek container mein pack karna taaki kisi bhi machine pe chale.
- **Day 82-84: CI/CD (GitHub Actions)**
  - **Files:** `.github/workflows/`
  - **Focus:** GitHub par push karte hi automatically test run karna.
- **Day 85-87: Cloud Deployment Concepts**
  - **Files:** `render.yaml`, Vercel config
  - **Focus:** Frontend ko Vercel pe aur Backend ko Render/AWS pe host karna. Environment variables set karna.
- **Day 88-90: The Final Synthesis (Rubber Ducking)**
  - **Action:** Apne khud ke banaye hue flowcharts aur notes review karo. Har file ka purpose ek sentence mein explain karne ki practice karo. 

---
**Tera Lakshya (Goal):** 
Mujhe line-by-line samajhna hai, koi jaldi nahi hai. Jis din Phase 1 ka Day 1 clear hoga, tabhi Day 2 par jaunga!
