# AI Career Mentor — Patch Guide

Complete list of bugs found and fixed. Copy each file to the corresponding path in your repo.

---

## Critical Crashes (🔴) — Apply these first

### 1. `app/main.py` — `import os` missing

**Bug:** `os.getenv("REDIS_URL")` called before `import os` → `NameError` on startup.

**Fix:** Added `import os` at the top. Also moved `limiter` construction after
`settings` is imported and used `"memory://"` as the safe fallback URI so the
app starts without Redis in dev.

**Copy:** `fixes/app/main.py` → `backend/app/main.py`

---

### 2. `app/agents/registry.py` — `get_resume_analyst()` missing

**Bug:** `backend/app/api/resume.py` calls `from app.agents.registry import get_resume_analyst`
but that function did not exist in `registry.py` → `ImportError` at request time.

**Fix:** Added `get_resume_analyst(llm_config)` which returns an `AssistantAgent`
configured as a senior technical recruiter / ATS specialist.

**Copy:** `fixes/app/agents/registry.py` → `backend/app/agents/registry.py`

---

### 3. `app/agents/workflow.py` — `CareerState` is Pydantic, not TypedDict

**Bug:** LangGraph's `StateGraph` requires state to be a `TypedDict`. Using Pydantic
`BaseModel` causes the `Annotated[List[str], operator.add]` reducer to silently fail
(state isn't merged correctly) and in some versions raises a `TypeError`.

**Fix:** Converted `CareerState` to `TypedDict`. All node return values are now plain
`dict` objects, which is what LangGraph expects. The `Annotated` reducers for `logs`
and `errors` now work correctly for parallel fan-in.

**Copy:** `fixes/app/agents/workflow.py` → `backend/app/agents/workflow.py`

---

### 4. `app/models/validation.py` — `salary_range: str` vs. `dict` mismatch

**Bug:** `MarketTrendsModel.salary_range` was typed `str`, but the market service
returns `{"min": ..., "max": ..., "formatted": "..."}` — a dict. Validation
always failed, triggering the error fallback path on every run.

**Fix:** Changed type to `Any`. Also updated `RoadmapModel` validator to use
Pydantic v2's `@model_validator(mode="after")` instead of the deprecated `@validator`.

**Copy:** `fixes/app/models/validation.py` → `backend/app/models/validation.py`

---

### 5. `requirements.txt` — `google-generativeai` duplicated, `ag2`/`autogen` missing

**Bug:** `google-generativeai` appeared twice (causes pip warnings and version conflicts).
More critically, neither `pyautogen` nor `ag2` was listed — the `from autogen import ...`
calls in `registry.py` and `roadmap.py` would crash on a fresh install.

**Fix:** Removed duplicate. Added `ag2[gemini]>=0.4.0` (the maintained AutoGen fork).

**Copy:** `fixes/requirements.txt` → `backend/requirements.txt`

---

## High Severity (🟡)

### 6. `app/api/career.py` — Streaming endpoint ran the graph TWICE

**Bug:** `run_full_analysis_stream` called `graph.astream()` (which already runs
the full graph) and then called `run_full_career_analysis()` again to get the result.
This doubled API costs and latency on every streaming request.

**Fix:** Extract the final state from the last event of `astream(stream_mode="updates")`
instead of re-invoking. The result dict is built from the accumulated `final_state`.

**Copy:** `fixes/app/api/career.py` → `backend/app/api/career.py`

---

### 7. `app/core/market/service.py` — AutoGen in extract_metrics + missing `top_companies`

**Bug 1:** `extract_metrics()` was using an AutoGen `AssistantAgent` for a simple
JSON-extraction task. This added 300-500ms of overhead, caused async event-loop
conflicts, and required AutoGen to be properly configured just to parse market data.

**Fix 1:** Replaced with a direct `httpx` call to Groq/Gemini — same JSON result,
much faster, no AutoGen dependency in the hot path.

**Bug 2:** The response dict exposed `hiring_companies` but not `top_companies`.
`test_market_service.py` and some frontend components use `top_companies`.

**Fix 2:** Added `"top_companies": hiring_companies` alias in the response dict.

**Bug 3:** KB fallback `hiring_volume` was `"1000+"` but the test asserted
`"Stable based on benchmarks"`. Aligned both.

**Copy:** `fixes/app/core/market/service.py` → `backend/app/core/market/service.py`

---

### 8. `tests/test_main.py` — Rate limit test hard-coded wrong count

**Bug:** Test incremented usage 5 times but `DAILY_LIMITS["roadmap"]` is 3.
The counter exceeded the limit on the 4th increment, not the 5th, but the test
only checked after all 5 — meaning the check sometimes passed/failed non-deterministically.

**Fix:** Read `rate_limit.DAILY_LIMITS[feature]` dynamically and increment exactly
that many times. Any future limit change will not break the test.

**Copy:** `fixes/tests/test_main.py` → `backend/tests/test_main.py`

---

### 9. `tests/test_market_service.py` — 3 assertions against wrong keys/values

**Bug:**
- `result["top_companies"]` → KeyError (key didn't exist in service response)
- `result["hiring_volume"] == "Stable based on benchmarks"` → was `"1000+"`
- `result["salary_range"]["formatted"]` tested on a string, not a dict

**Fix:** Updated all three assertions to match the corrected service response shape.

**Copy:** `fixes/tests/test_market_service.py` → `backend/tests/test_market_service.py`

---

## Medium Severity (🔵)

### 10. `app/api/resume.py` — `provider` query param untyped

**Bug:** `provider: str = None` is technically valid Python but mypy/pyright flags it
as `str | None` without the explicit `Optional`. FastAPI also handles it fine but the
OpenAPI docs showed it as required (no default in schema).

**Fix:** Changed to `provider: Optional[str] = Query(None, description="...")`.

**Copy:** `fixes/app/api/resume.py` → `backend/app/api/resume.py`

---

## How to apply all patches at once (bash)

```bash
cp fixes/app/main.py                       backend/app/main.py
cp fixes/app/agents/registry.py            backend/app/agents/registry.py
cp fixes/app/agents/workflow.py            backend/app/agents/workflow.py
cp fixes/app/api/career.py                 backend/app/api/career.py
cp fixes/app/api/resume.py                 backend/app/api/resume.py
cp fixes/app/core/market/service.py        backend/app/core/market/service.py
cp fixes/app/models/validation.py          backend/app/models/validation.py
cp fixes/tests/test_main.py                backend/tests/test_main.py
cp fixes/tests/test_market_service.py      backend/tests/test_market_service.py
cp fixes/requirements.txt                  backend/requirements.txt
```

Then:

```bash
cd backend
pip install -r requirements.txt --break-system-packages
alembic upgrade head
uvicorn app.main:app --reload
```
