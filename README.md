<div align="center">

<img src="https://img.shields.io/badge/Amazon%20Nova-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
<img src="https://img.shields.io/badge/Microsoft%20AutoGen-0078D4?style=for-the-badge&logo=microsoft&logoColor=white" />
<img src="https://img.shields.io/badge/Azure%20OpenAI-0089D6?style=for-the-badge&logo=microsoftazure&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" />

# 🤖 AI Career Mentor

### *Your personal AI career coach — available 24/7, powered by multi-agent AI*

**Resume Analysis · Personalised Roadmaps · Live Market Intelligence · AI Mock Interviews**

---

[![Hackathon](https://img.shields.io/badge/🏆%20Amazon%20Nova%20AI%20Hackathon-Submitted-FF9900?style=flat-square)](https://devpost.com)
[![Hackathon](https://img.shields.io/badge/🏆%20Microsoft%20AI%20Dev%20Days%20Hackathon-Submitted-0078D4?style=flat-square)](https://microsoft.com)
[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-6366f1?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📌 What is AI Career Mentor?

**AI Career Mentor** is a full-stack, production-grade career coaching platform that uses a **4-agent AI system** to give developers and students a complete, personalised career acceleration plan — in under 60 seconds.

Most developers spend months trying to figure out what to learn, where to apply, and how to prepare for interviews. We solve all three — simultaneously — with AI agents that collaborate the same way a team of human experts would.

> **Hackathon submissions:**
> - 🏆 **Microsoft AI Dev Days Hackathon** (Deadline Mar 15, 2026 · $80,000+ prizes) — Microsoft AutoGen + Azure OpenAI/Groq, deployed on **Render + Vercel**
> - 🏆 **Amazon Nova AI Hackathon** (Devpost · Deadline Mar 16, 2026 · $95,000+ prizes) — Amazon Nova 2 Lite + Nova 2 Sonic via Bedrock, deployed on **AWS App Runner + Amplify**
>
> 👋 **Built solo by a beginner developer** — every line of backend, frontend, AI agents, and deployment done by one person.

---

## ✨ Core Features

| Feature | What it does | AI Agent Used |
|---------|-------------|--------------|
| 📄 **Resume Analyzer** | Uploads your PDF, scores all sections, calculates an **ATS Score**, flags skill gaps vs real job postings | Resume Analyst Agent |
| 🔗 **LinkedIn Reviewer** | Pastes your profile text, gets **Score out of 100**, SEO headlines, missing keywords, and About section tips | LinkedIn Reviewer Agent |
| 🗺️ **Learning Roadmap** | Generates a week-by-week plan with free resources & mini-projects for your target role | Career Coach Agent |
| 📈 **Market Intelligence** | Real-time salary ranges, in-demand skills, and top hiring companies for your role + location | Market Researcher Agent |
| 🎤 **Mock Interview Coach** | Live AI interview via WebSocket — asks questions, provides **DSA & Live Coding Editor** (Python, Java, C++, JS), listens, gives feedback | Mock Interviewer Agent |
| 🧠 **Full Career Analysis** | All 4 agents collaborate in one GroupChat — resume + market + roadmap in a single run | All Agents (GroupChat) |
| 🔐 **Auth System** | JWT-based register/login with bcrypt password hashing | — |
| ⚙️ **Settings** | User profile with persistent preferences | — |

---

## 🏗️ Architecture Diagrams

> Two separate architectures — one per hackathon. The core app (agents, API, frontend) is the same. Only the **AI engine** and **cloud platform** change.

---

### 🔵 Architecture 1 — Microsoft AI Dev Days Hackathon
**Key Tech: Microsoft AutoGen (Agent Framework) · Azure OpenAI (Microsoft Foundry) · GitHub Copilot**

```mermaid
flowchart TD
    User(["👤 User"])

    subgraph DevTools ["🛠️ Developed Using"]
        VSCODE["VS Code IDE"] --- COPILOT["GitHub Copilot\n(AI Coding Assistant)"]
    end

    subgraph Vercel ["☁️ Vercel — Frontend Hosting"]
        FE["Next.js 16 App\n(TypeScript + Vanilla CSS)"]
    end

    subgraph Render ["☁️ Render.com — Backend Hosting"]
        API["FastAPI Server\n(Python · REST + WebSocket)"]
    end

    subgraph Agents ["🧠 Microsoft AutoGen (Agent Framework)"]
        ORCH["GroupChatManager\n(Orchestrator)"]
        A1["📄 Resume Analyst\nExtracts skills, gaps, ATS Score"]
        A2["📈 Market Researcher\nReal-time job market data"]
        A3["🗺️ Career Coach\nBuilds 6-week roadmap"]
        A4["🎤 Mock Interviewer\nLive interview + Live Coding"]
        A5["🔗 LinkedIn Reviewer\nProfile Optimization & SEO"]
    end

    subgraph LLM ["🤖 Microsoft Foundry / Azure Layer"]
        GROQ["Groq API\n(Free · Dev mode)"]
        AZURE["Azure OpenAI Service\nGPT-4o (Production)\n[Microsoft Foundry]"]
    end

    subgraph DB ["🗃️ Data Storage"]
        SQLITE["PostgreSQL Database\n(Users · Roadmaps · Sessions)"]
        JWT["JWT Tokens\n(localStorage · Browser)"]
    end

    User -->|"HTTPS"| FE
    FE -->|"REST API calls\nWebSocket"| API
    API --> ORCH
    ORCH --> A1 & A2 & A3 & A4 & A5
    A1 & A2 & A3 & A4 & A5 -->|"LLM calls"| GROQ
    A1 & A2 & A3 & A4 & A5 -.->|"Production Switch"| AZURE
    API --> SQLITE
    FE --- JWT

    style Vercel fill:#000,stroke:#fff,color:#fff
    style Render fill:#46E3B7,stroke:#000,color:#000
    style Agents fill:#0078D4,stroke:#fff,color:#fff
    style LLM fill:#0089D6,stroke:#fff,color:#fff
    style DB fill:#1e1b4b,stroke:#818cf8,color:#fff
    style DevTools fill:#2ea043,stroke:#fff,color:#fff
```

**Data flow & Hackathon Requirements explained:**
1. **GitHub Copilot & VS Code**: Used throughout the entire development lifecycle to write, debug, and refactor the Next.js and FastAPI codebase.
2. User opens the app on **Vercel** (frontend) and requests hit **Render.com** (backend).
3. **Agent Framework (Microsoft AutoGen)**: The Python backend initializes a GroupChat with 4 specialized AutoGen AI agents to process the user's career profile.
4. **Microsoft Foundry & Azure Services**: The agents utilize **Azure OpenAI (GPT-4o)** to generate high-quality insights, ensuring enterprise-grade AI performance (groq fallback for free development).
5. Agents collaborate autonomously and return the personalized roadmap, resume feedback, and market insights to the user.

---

### 🟠 Architecture 2 — Amazon Nova AI Hackathon
**Stack: Next.js → AWS Amplify · FastAPI → AWS App Runner · Microsoft AutoGen · Amazon Nova 2 Lite + Sonic**

```mermaid
flowchart TD
    User(["👤 User"])

    subgraph Amplify ["☁️ AWS Amplify — Frontend"]
        FE["Next.js 16 App\n(TypeScript + Vanilla CSS)"]
    end

    subgraph AppRunner ["☁️ AWS App Runner — Backend"]
        API["FastAPI Server\n(Docker Container · Python)"]
    end

    subgraph Agents ["🧠 Microsoft AutoGen + LiteLLM Bridge"]
        ORCH["GroupChatManager\n(Orchestrator)"]
        A1["� Resume Analyst\nExtracts skills, gaps, ATS Score"]
        A2["� Market Researcher\nReal-time job market data"]
        A3["�️ Career Coach\nBuilds 6-week roadmap"]
        A4["🎤 Mock Interviewer\nLive interview + Live Coding"]
        A5["🔗 LinkedIn Reviewer\nProfile Optimization & SEO"]
    end

    subgraph Bedrock ["🤖 Amazon Bedrock"]
        NOVA["Amazon Nova 2 Lite\n(Text · Agentic AI prize)"]
        SONIC["Amazon Nova 2 Sonic\n(Speech-to-Speech · Voice AI prize)"]
    end

    subgraph AWSStorage ["🗃️ AWS Storage & Auth"]
        S3["Amazon S3\n(Resume PDF files)"]
        SQLITE["PostgreSQL / DynamoDB\n(Users · Sessions)"]
    end

    subgraph CICD ["🔄 CI/CD"]
        GHA["GitHub Actions"]
        ECR["Amazon ECR\n(Docker Registry)"]
    end

    User -->|"HTTPS"| FE
    FE -->|"REST API + WebSocket"| API
    API --> S3
    API --> ORCH
    ORCH --> A1 & A2 & A3 & A4 & A5
    A1 & A2 & A3 -->|"Text inference"| NOVA
    A4 -->|"Voice interview"| SONIC
    API --> SQLITE
    GHA -->|"Build + Push"| ECR
    ECR -->|"Deploy"| AppRunner

    style Amplify fill:#FF9900,stroke:#000,color:#000
    style AppRunner fill:#FF9900,stroke:#000,color:#000
    style Agents fill:#0078D4,stroke:#fff,color:#fff
    style Bedrock fill:#232F3E,stroke:#FF9900,color:#FF9900
    style AWSStorage fill:#232F3E,stroke:#FF9900,color:#FF9900
    style CICD fill:#1a1a1a,stroke:#fff,color:#fff
```

**Data flow explained in plain words:**
1. User opens the app on **AWS Amplify** (Amazon's free frontend hosting)
2. Uploads resume → file saved to **Amazon S3** (cloud storage)
3. Request hits **AWS App Runner** (Amazon's managed container hosting)
4. AutoGen agents run via **LiteLLM bridge** → calls **Amazon Nova 2 Lite** for text analysis
5. For mock interview → **Amazon Nova 2 Sonic** does real speech-to-speech (biggest differentiator!)
6. Results stream back to the browser via WebSocket

> 🔁 **Same code, two environments** — just change `LLM_PROVIDER=groq` → `LLM_PROVIDER=bedrock` in `.env`

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | Full-stack React framework |
| **TypeScript** | Type safety |
| **Vanilla CSS** | Custom design system — no Tailwind |
| **Lucide React** | Icon library |
| **react-hot-toast** | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** (Python) | High-performance REST API + WebSocket |
| **Microsoft AutoGen** | Multi-agent GroupChat orchestration |
| **SQLAlchemy + PostgreSQL** | Database ORM |
| **JWT + bcrypt** | Authentication & password hashing |
| **pdfplumber** | PDF resume text extraction |
| **DuckDuckGo Search** | Real-time market research tool for agents |
| **LiteLLM** | Bridge AutoGen → Amazon Bedrock (Nova) |

### AI Providers
| Provider | Model | Used For |
|---------|-------|----------|
| **Groq** | Llama 3.3 70B | 💻 Local dev + Microsoft hackathon (free) |
| **Azure OpenAI** | GPT-4o | 🔵 Microsoft AI Dev Days (production) |
| **Amazon Bedrock** | Nova 2 Lite | 🟠 Amazon hackathon (Agentic AI prize) |
| **Amazon Bedrock** | Nova 2 Sonic | � Amazon hackathon (Voice AI prize) |

### Deployment

> 👋 **A note from the developer (beginner here!):**
> I'm still learning cloud platforms. Right now I've deployed this project using **Render.com** (backend) and **Vercel** (frontend) — both are beginner-friendly, free, and work great for this project.
>
> As I learn more about **Microsoft Azure** and **AWS**, I plan to migrate to those platforms. The architecture diagrams above show exactly how that migration would look — the code is already designed to support it (just switch `LLM_PROVIDER` in `.env`). One step at a time! 🚀

| Platform | Service | Status |
|---------|---------|--------|
| **Vercel** | Frontend (Next.js) | ✅ **Live now** — free, easy, instant deploys |
| **Render.com** | Backend (FastAPI) | ✅ **Live now** — free tier, auto-deploys from GitHub |
| **Azure App Service** | Backend (FastAPI) | 🔜 Future — when I learn Azure |
| **Azure Static Web Apps** | Frontend (Next.js) | 🔜 Future — when I learn Azure |
| **AWS App Runner** | Backend (FastAPI + Docker) | 🔜 Future — for Amazon hackathon |
| **AWS Amplify** | Frontend (Next.js) | 🔜 Future — for Amazon hackathon |
| **Amazon S3** | Resume PDF storage | 🔜 Future — for Amazon hackathon |

---

## 🚀 Local Setup

### Prerequisites
- Python **3.11+**
- Node.js **18+**
- One of: Groq API key (free) · AWS credentials · Azure OpenAI key

### 1. Clone the repo
```bash
git clone https://github.com/Anil-Pradhan/ai-career-mentor.git
cd ai-career-mentor
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
```

**Create `backend/.env`:**
```env
# ── Choose your AI provider ──────────────────────────────
LLM_PROVIDER=groq            # Options: groq | bedrock | azure

# ── Groq (free dev mode) ─────────────────────────────────
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# ── Amazon Bedrock (Amazon hackathon version) ─────────────
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0

# ── Azure OpenAI (production) ─────────────────────────────
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# ── App ──────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@hostname:6543/postgres
SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

```bash
# Start backend
uvicorn app.main:app --reload
# ✅ API running at http://localhost:8000
# ✅ Swagger docs at http://localhost:8000/docs
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create frontend/.env.local
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local

npm run dev
# ✅ Frontend running at http://localhost:3000
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | System health check |
| `POST` | `/auth/register` | — | Create new account |
| `POST` | `/auth/login` | — | Login → get JWT token |
| `POST` | `/resume/upload` | ✅ JWT | Upload PDF, extract text |
| `POST` | `/resume/analyze` | ✅ JWT | AI resume scoring & gap analysis |
| `POST` | `/roadmap/generate` | ✅ JWT | Generate 6-week learning roadmap |
| `GET` | `/market/trends` | ✅ JWT | Real-time job market data |
| `POST` | `/linkedin/review` | ✅ JWT | AI LinkedIn profile review & scoring |
| `WS` | `/interview/ws/{session_id}` | ✅ JWT | Live mock interview (WebSocket) |
| `WS` | `/interview/voice/ws/{id}` | ✅ JWT | Voice interview — Nova 2 Sonic |
| `POST` | `/career/full-analysis` | ✅ JWT | Full multi-agent GroupChat analysis |

> 📖 Interactive API docs available at `http://localhost:8000/docs` (Swagger UI)

---

## 🧠 How the Multi-Agent System Works

When a user triggers **Full Career Analysis**, this is what happens behind the scenes:

```
User uploads resume + sets target role + location
         ↓
FastAPI receives request → starts AutoGen GroupChat
         ↓
GroupChatManager (Orchestrator) coordinates:
   ├── 🔵 Resume Analyst    → "I see 3 skill gaps: Docker, Kubernetes, System Design"
   ├── 🟢 Market Researcher → "For SDE-2 in Bangalore: ₹18-28 LPA, top skill is Go + K8s"
   ├── 🟣 Career Coach      → "Week 1: Docker fundamentals → resource → mini project"
   └── 🔴 Mock Interviewer  → "Here's a system design question based on your gaps..."
         ↓
All agent outputs consolidated → returned to user in < 60 seconds
```

Each agent has a **single responsibility**, talks to the LLM independently, and shares context through AutoGen's GroupChat protocol — exactly like a team of human experts would collaborate.

---

## 🏆 Hackathon Submissions

### 🟠 Amazon Nova AI Hackathon

| Detail | Info |
|--------|------|
| **Platform** | Devpost |
| **Deadline** | March 16, 2026 @ 8:00 PM EDT |
| **Prize Pool** | $40,000 cash + $55,000 AWS Credits |
| **Categories** | Agentic AI ($10K) · Voice AI ($10K) |
| **Required hashtag** | `#AmazonNova` in demo video |

**Why we win:**
- ✅ **Agentic AI** — 4 AutoGen agents powered by **Amazon Nova 2 Lite** via Bedrock
- ✅ **Voice AI** — Mock interview via **Amazon Nova 2 Sonic** (native speech-to-speech, no TTS pipeline)
- ✅ **Full AWS stack** — App Runner + Amplify + S3 + Bedrock
- ✅ Key differentiator: Nova 2 Sonic speech-to-speech — most teams won't implement real voice AI

---

### 🔵 Microsoft AI Dev Days Hackathon

| Detail | Info |
|--------|------|
| **Platform** | Microsoft Innovation Studio |
| **Dates** | Feb 10 – March 15, 2026 |
| **Prize Pool** | $80,000+ total |
| **Grand Prize** | $20,000 × 2 (Best Overall + Best Agentic DevOps) |
| **Category Prizes** | $10,000 × 2 (Microsoft Foundry · Best Enterprise) |
| **Bonus** | Ticket to Microsoft Build 2026 + mentoring session |

**Requirements met:**
- ✅ **Microsoft AutoGen** — multi-agent GroupChat (Agent Framework)
- ✅ **Azure OpenAI GPT-4o** — production LLM via Azure (Microsoft Foundry compatible)
- ✅ **Deployed on Azure** — backend on Azure-compatible infra with config switch
- ✅ **Public GitHub repo** — clean, well-documented codebase
- ✅ **VS Code + GitHub Copilot** — developed with Copilot assistance
- ✅ **Real-world impact** — democratises career coaching for millions of students

**Why we win:**
- ✅ End-to-end production system (auth, DB, full UI) — not a notebook demo
- ✅ 4 specialised agents collaborating in real GroupChat — genuine agentic behaviour
- ✅ Career coaching is a $4B+ market — clear real-world problem being solved
- ✅ Solo developer building what most teams can't — judges love the ambition

---

## 📁 Project Structure

```
ai-career-mentor/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # Register + login endpoints
│   │   │   ├── resume.py        # PDF upload + AI analysis
│   │   │   ├── roadmap.py       # Roadmap generation agent
│   │   │   ├── market.py        # Market trends agent
│   │   │   ├── interview.py     # WebSocket mock interview
│   │   │   ├── voice_interview.py # Nova 2 Sonic voice WS
│   │   │   └── career.py        # Full multi-agent analysis
│   │   ├── agents/
│   │   │   ├── resume_agent.py  # Resume Analyst
│   │   │   ├── market_agent.py  # Market Researcher
│   │   │   ├── roadmap_agent.py # Career Coach
│   │   │   └── interview_agent.py # Mock Interviewer
│   │   ├── core/
│   │   │   ├── config.py        # LLM provider config (Groq/Bedrock/Azure)
│   │   │   └── security.py      # JWT + bcrypt
│   │   ├── models/              # SQLAlchemy DB models
│   │   └── main.py              # FastAPI app entry
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration page
│   │   │   └── dashboard/
│   │   │       ├── page.tsx     # Dashboard home
│   │   │       ├── resume/      # Resume analyzer
│   │   │       ├── roadmap/     # Career roadmap
│   │   │       ├── market/      # Market trends
│   │   │       ├── interview/   # Mock interview
│   │   │       ├── full-analysis/ # Full AI analysis
│   │   │       └── settings/    # User settings
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ...
│   │   └── services/
│   │       └── api.ts           # All API calls
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD → AWS
├── render.yaml                  # Render.com config (Microsoft version)
└── README.md
```

---

## 🌐 Deployment

### Amazon Version (AWS)

| Layer | Service | Config |
|-------|---------|--------|
| Frontend | AWS Amplify | Auto-deploy from `frontend/` on `main` push |
| Backend | AWS App Runner | Docker from ECR, port 8000 |
| File Storage | Amazon S3 | Private bucket, resume PDFs |
| AI Inference | Amazon Bedrock | Nova 2 Lite (text) + Nova 2 Sonic (voice) |
| CI/CD | GitHub Actions | Push to main → build → ECR → App Runner |

### Microsoft Version (Cloud)

| Layer | Service |
|-------|---------|
| Frontend | Vercel |
| Backend | Render.com (render.yaml) |
| AI | Groq (dev) / Azure OpenAI (prod) |

---

## 🔐 Environment Variables Summary

```env
# ── Which AI to use ──────────────────────────────────────
LLM_PROVIDER=groq | bedrock | azure

# ── Amazon (Nova Hackathon) ───────────────────────────────
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0

# ── Groq (local dev) ─────────────────────────────────────
GROQ_API_KEY=...

# ── Azure OpenAI (production) ─────────────────────────────
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# ── Core ─────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@hostname:6543/postgres
SECRET_KEY=<strong-random-key>
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> ⚠️ **Never commit `.env` to GitHub.** Use `.env.example` as the template.

---

## 👤 Team

| Name | Role | Microsoft Learn Username | Contact |
|------|------|-------------------------|---------|
| **Anil Pradhan** | Full-Stack Solo Developer | ANIL PRADHAN (ap2019039) | ap2019039@gmail.com |

> *Built solo — frontend, backend, AI agents, cloud deployment, and UI/UX — all by one developer.*
> *[GitHub Copilot used extensively for development acceleration]*

---

## 🙏 Acknowledgements

- **Microsoft AutoGen** team for the multi-agent framework
- **Amazon Bedrock** for Nova 2 Lite & Nova 2 Sonic model access
- **Groq** for free-tier Llama 3.3 70B inference during development
- The open-source community behind FastAPI, Next.js, and pdfplumber

---

<div align="center">

**Built with ❤️ by [Anil Pradhan](https://github.com/Anil-Pradhan) — March 2026**

*Submitted to: Amazon Nova AI Hackathon · Microsoft AutoGen Hackathon*

`#AmazonNova` `#AutoGen` `#MultiAgent` `#CareerTech` `#AgenticAI`

</div>
