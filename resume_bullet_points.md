# AI Career Mentor — Resume Bullet Points

---

**AI Career Mentor** | *Feb 2026 – Present*
*Next.js 14 · FastAPI · LangGraph · ChromaDB · Groq · NVIDIA NIM · Gemini 2.5 Flash · Neon Postgres · Upstash Redis · Google OAuth · Serper · Tavily · Docker*

---

## Bullet Point 1 — LangGraph Multi-Agent Orchestration

> Architected a production-grade career coaching platform using a **LangGraph static DAG** orchestrating **5 parallel AI agents** (Resume Analyst → Market Researcher + LinkedIn Optimizer → Roadmap Builder) with **Pydantic validation/repair loops** and **circuit-breaker fallbacks** — delivering complete career diagnostics **in under 60 seconds** across 254+ commits.

**Keywords:** LangGraph, multi-agent orchestration, static DAG, parallel execution, Pydantic validation, circuit breaker, fault tolerance

---

## Bullet Point 2 — Hybrid Semantic RAG Engine

> Built a **Hybrid Semantic RAG Engine** using **ChromaDB** persistent vector store (auto-seeded at startup with 50+ curated resources) with in-memory **MockRAG** fallback preventing **OOM crashes on Render's 512MB RAM containers** — enriching personalized **8-week roadmaps** with verified YouTube, GitHub, and documentation resources via multi-source deduplication pipeline.

**Keywords:** ChromaDB, vector database, RAG, semantic search, ONNX, auto-seed, OOM safety, resource deduplication, sequence matching

---

## Bullet Point 3 — Real-Time WebSocket Interview System

> Engineered real-time **WebSocket mock interview system** via OpenAI SDK over **Groq/NVIDIA** — **sub-2s token streaming**, **7-question adaptive state machine** with **3 difficulty tiers** (FAANG=Hard, Product=Medium, Service=Easy), **Edge-TTS voice synthesis**, and crash-resilient WebSocket cleanup preventing memory leaks across concurrent sessions.

**Keywords:** WebSocket, real-time streaming, adaptive questioning, state machine, TTS, edge-tts, memory management, concurrent sessions

---

## Bullet Point 4 — Multi-Provider LLM Router & Fallbacks

> Implemented **Dynamic Multi-Provider LLM routing** across **Groq (Llama 3.3 70B)**, **NVIDIA NIM (Llama 3.3 70B-Instruct)**, and **Gemini 2.5 Flash** with automatic **fallback chains** (groq→google, nvidia→google), deterministic fallback engines for malformed outputs, and **circuit-breaker mechanisms** ensuring **100% system availability** under free-tier API rate limits.

**Keywords:** LLM routing, provider abstraction, fallback chain, circuit breaker, deterministic fallback, fault tolerance, API resilience

---

## Bullet Point 5 — Market Intelligence & Search Pipeline

> Hardened market intelligence pipeline integrating **Serper.dev**, **Tavily AI**, and **DuckDuckGo** with regex-based JSON extraction from unstructured web data, **async link validation** (10 concurrent workers), and **resource scoring engine** (domain authority weights + freshness signals + GitHub star/recency penalties) — delivering real-time salary benchmarks and hiring volumes with **zero static mock data**.

**Keywords:** Serper API, Tavily API, DuckDuckGo, web scraping, regex extraction, async validation, scoring algorithm, real-time data, anti-spam

---

## Bullet Point 6 — Auth, Security & Full-Stack DevOps

> Designed secure auth pipeline (**Google OAuth 2.0**, JWT + Refresh Tokens, refresh-token rotation preventing replay attacks), **SHA-256 Redis caching** (7-day TTL), **SlowAPI 100 req/hr** rate limiting with per-feature daily caps, and **PostgreSQL connection pooling** (pool_size=3, pool_pre_ping for Neon compatibility) — deployed via **Docker + GHCR** + **GitHub Actions CI/CD** (ESLint + **83 pytest tests** + pip-audit) across **Vercel + Render + Neon Postgres**.

**Keywords:** Google OAuth, JWT, refresh token rotation, Redis caching, rate limiting, SlowAPI, PostgreSQL pooling, Docker, CI/CD, GitHub Actions, pytest

---

## Bullet Point 7 — Hackathon Recognition

> Submitted to **Microsoft AI DevDays ($80K+ prize pool)** and **Amazon Nova AI ($95K+ prize pool)** hackathons — solo-built over **5–6 months** with **254+ commits**, **83 passing tests**, and **zero circular dependencies** across the entire codebase.

**Keywords:** hackathon, solo developer, full-stack, production deployment, clean architecture

---

## Quick Stats Reference

| Metric | Value |
|--------|-------|
| Total Commits | **254+** |
| Automated Tests | **83 passing** |
| AI Agents | **5 (Resume, Market, LinkedIn, Roadmap, Interview)** |
| LLM Providers | **3 (Groq, NVIDIA NIM, Gemini)** |
| Response Time | **<60s full career analysis** |
| Build Time | **5–6 months solo** |
| Hackathon Prize Pool | **$175,000+** |
| Production Deployments | **Vercel + Render + Neon + Upstash** |
| Code Quality | **Zero circular deps, Pydantic validation, 100% availability** |