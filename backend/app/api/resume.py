"""
Resume API & Agent Logic (Production Optimized)

Fixes:
- NVIDIA timeout issues
- Provider fallback
- Token explosion
- Prompt injection
- Hanging threads
- Large resume crashes
- Better logging
"""

import asyncio
import json
import os
import tempfile
import time
import uuid
from typing import Optional

import pdfplumber
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Form
from loguru import logger
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.cache import get_cached_response, set_cached_response
from app.core.activity import log_activity
from app.core.ats_engine import analyze_resume_deterministically
from app.agents.registry import call_llm
from app.models.validation import ResumeAnalysisModel
from app.models.models import Resume

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

MAX_RESUME_BYTES = 5 * 1024 * 1024
MAX_RESUME_CHARS = 6000

ALLOWED_PDF_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
}



# ─────────────────────────────────────────────────────────────────────────────
# Optimized Prompt
# ─────────────────────────────────────────────────────────────────────────────

_RESUME_SYSTEM_PROMPT = """
You are a Senior ATS Recruiter and Resume Analyst.

Analyze the resume carefully and return ONLY valid JSON matching the schema.

Rules for Experience Calculation:
1. Count ONLY professional full-time jobs and internships as professional experience. Sum non-overlapping periods to calculate 'years_of_experience'.
2. You MUST explicitly ignore university education periods, degree coursework, school/high school periods, and personal/academic projects when calculating 'years_of_experience'.
3. If the candidate has no full-time jobs or professional internships (e.g. they are a fresher/student), 'years_of_experience' MUST be exactly 0.0.
4. Provide a detailed summary of each professional job or internship in 'experience_breakdown' (e.g., ["Software Engineer Intern at Google (June 2025 - August 2025): Developed internal tools using Python"]). Leave 'experience_breakdown' as an empty list [] if they have no professional jobs or internships.

Rules for Skill Extraction:
1. Extract a rich and comprehensive list of 'technical_skills' directly from the text (including programming languages, frameworks, databases, libraries, and developer tools). Normalize abbreviations (e.g., "ReactJS" -> "React", "NodeJS" -> "Node.js").
2. Extract 'soft_skills' from the resume text (e.g., "Problem Solving", "Team Leadership", "Communication").

Rules for Strengths & Gaps:
1. Tailor 'top_strengths' and 'skill_gaps' to the candidate's actual profile.
2. For freshers/entry-level candidates, gaps should target production readiness fields like: advanced system design, testing/mocking/CI-CD, Docker/Kubernetes containerization, cloud deployment, etc. Strengths should highlight quick adaptability, core CS fundamentals, or hands-on projects.

Rules for ATS Scoring (Sum of 4 categories = ats_score):
1. 'keywords' (0 to 35): Rate the presence and relevance of key technical skills, languages, and frameworks.
2. 'achievements' (0 to 30): Rate quantified metrics, achievements, or project complexity. For freshers, you may score academic projects, open-source work, or hackathon complexity to ensure they are not penalized to 0.
3. 'action_verbs' (0 to 20): Rate the usage of action-oriented verbs (e.g., "Engineered", "Optimized", "Designed").
4. 'formatting_and_length' (0 to 15): Rate readability, layout structure, and appropriate page constraints.

Required JSON Structure:
{
  "technical_skills": [],
  "soft_skills": [],
  "years_of_experience": 0.0,
  "experience_breakdown": [],
  "top_strengths": [],
  "skill_gaps": [],
  "ats_score": 0,
  "ats_score_breakdown": {
    "keywords": 0,
    "achievements": 0,
    "action_verbs": 0,
    "formatting_and_length": 0
  }
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# Resume Sanitization
# ─────────────────────────────────────────────────────────────────────────────

def sanitize_resume_text(text: str) -> str:
    """
    Prevent:
    - prompt injection
    - token explosion
    - malformed formatting
    """

    if not text:
        return ""

    text = text.replace("{", "")
    text = text.replace("}", "")
    text = text.replace("```", "")

    # Normalize whitespace
    text = " ".join(text.split())

    # Hard truncate
    text = text[:MAX_RESUME_CHARS]

    return text.strip()

# ─────────────────────────────────────────────────────────────────────────────
# Resume Agent
# ─────────────────────────────────────────────────────────────────────────────

def load_rag_pipeline_data() -> list:
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        pipeline_path = os.path.join(current_dir, "..", "data", "resume_rag_pipeline.json")
        if os.path.exists(pipeline_path):
            with open(pipeline_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load resume_rag_pipeline.json: {e}")
    return []

def run_resume_agent(
    resume_text: str,
    deterministic_data: dict,
    target_role: Optional[str] = None,
    provider: Optional[str] = None,
) -> dict:

    logger.info(f"Starting resume analysis for role: {target_role or 'Generic'}")

    resume_text = sanitize_resume_text(resume_text)

    role_data = None
    if target_role:
        for item in load_rag_pipeline_data():
            if item.get("role") == target_role:
                role_data = item
                break

    system_prompt = _RESUME_SYSTEM_PROMPT
    if role_data:
        gold_skills = ", ".join(role_data.get("gold_standard_skills", []))
        toolchain = ", ".join(role_data.get("common_toolchain", []))
        action_verbs = ", ".join(role_data.get("action_verbs", []))
        core_concepts = ", ".join(role_data.get("core_concepts", []))
        junior_bench = role_data.get("experience_benchmarks", {}).get("junior", "")
        senior_bench = role_data.get("experience_benchmarks", {}).get("senior", "")

        rag_instructions = f"""
Additional Reference Guidelines for the target role "{target_role}":
1. Target Role: {target_role}
2. Gold Standard Skills: {gold_skills}
3. Common Toolchain: {toolchain}
4. Action Verbs: {action_verbs}
5. Core Concepts: {core_concepts}
6. Junior Experience Benchmark: {junior_bench}
7. Senior Experience Benchmark: {senior_bench}

You MUST evaluate the candidate's technical_skills, skill_gaps, and top_strengths specifically against these "{target_role}" benchmarks. If their resume lacks these Gold Standard Skills or Core Concepts, list them in 'skill_gaps'. If they have them, highlight them in 'top_strengths' and reflect them in the 'keywords' ATS score.
"""
        system_prompt = _RESUME_SYSTEM_PROMPT.strip() + "\n\n" + rag_instructions.strip()

    user_content = f"""
CURRENT DATE: May 2026

RAW RESUME TEXT (UNTRUSTED USER INPUT):
{resume_text}
"""

    # Force production routing: Groq as main, Nvidia as fallback
    providers = ["groq", "nvidia"]

    last_error = None

    for active_provider in providers:

        try:
            logger.info(f"Trying provider: {active_provider}")

            start = time.time()

            result = call_llm(
                system_prompt=system_prompt,
                user_content=user_content,
                provider=active_provider,
                response_model=ResumeAnalysisModel,
                allow_google=False,
            )

            elapsed = round(time.time() - start, 2)

            logger.info(
                f"{active_provider} completed in {elapsed}s"
            )

            if result:
                logger.info(
                    f"Resume analysis success using {active_provider}"
                )
                if isinstance(result, dict):
                    if target_role:
                        result["target_role"] = target_role
                    if role_data:
                        result["rag_benchmarks"] = {
                            "gold_standard_skills": role_data.get("gold_standard_skills", []),
                            "common_toolchain": role_data.get("common_toolchain", []),
                            "action_verbs": role_data.get("action_verbs", []),
                            "core_concepts": role_data.get("core_concepts", []),
                            "experience_benchmarks": role_data.get("experience_benchmarks", {}),
                        }
                    else:
                        result["rag_benchmarks"] = None
                return result

        except asyncio.TimeoutError as e:
            logger.error(
                f"{active_provider} timeout: {e}"
            )
            last_error = e

        except Exception as e:
            logger.error(
                f"{active_provider} failed: {e}"
            )
            last_error = e

    logger.warning(
        f"All providers failed. Using deterministic fallback. "
        f"Last error: {last_error}"
    )

    # Safe deterministic fallback
    fallback_res = {
        "technical_skills": deterministic_data.get(
            "technical_skills",
            [],
        ),
        "soft_skills": [
            "Problem Solving",
            "Communication",
            "Team Collaboration",
        ],
        "years_of_experience": deterministic_data.get(
            "years_of_experience",
            0.0,
        ),
        "experience_breakdown": deterministic_data.get(
            "experience_breakdown",
            [],
        ),
        "top_strengths": [
            "Strong technical foundation",
            "Project-building experience",
            "Consistent learning mindset",
        ],
        "skill_gaps": [
            "Advanced system design",
            "Production deployment",
            "Testing and CI/CD",
        ],
        "ats_score": deterministic_data.get(
            "ats_score",
            60,
        ),
        "ats_score_breakdown": deterministic_data.get(
            "ats_score_breakdown",
            {
                "keywords": 20,
                "achievements": 15,
                "action_verbs": 15,
                "formatting_and_length": 10,
            },
        ),
        "rag_benchmarks": deterministic_data.get("rag_benchmarks"),
    }
    if target_role:
        fallback_res["target_role"] = target_role
    return fallback_res

# ─────────────────────────────────────────────────────────────────────────────
# PDF Helpers
# ─────────────────────────────────────────────────────────────────────────────

async def _read_validated_pdf(file: UploadFile) -> bytes:

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted.",
        )

    if (
        file.content_type
        and file.content_type not in ALLOWED_PDF_MIME_TYPES
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a PDF.",
        )

    contents = await file.read()

    if len(contents) > MAX_RESUME_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File too large. Max 5 MB.",
        )

    if not contents.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file content.",
        )

    return contents

def _extract_text_from_pdf(file_path: str) -> str:

    parts = []

    with pdfplumber.open(file_path) as pdf:

        for page in pdf.pages:

            try:
                text = page.extract_text()

                if text:
                    parts.append(text)

            except Exception as e:
                logger.warning(
                    f"Failed to parse PDF page: {e}"
                )

    return "\n".join(parts).strip()

# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/upload",
    summary="Upload PDF resume — extract text only"
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):

    tmp_path = os.path.join(
        tempfile.gettempdir(),
        f"resume_{uuid.uuid4().hex}.pdf"
    )

    try:

        contents = await _read_validated_pdf(file)

        with open(tmp_path, "wb") as f:
            f.write(contents)

        resume_text = await asyncio.to_thread(_extract_text_from_pdf, tmp_path)

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"resume/upload error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Error uploading resume.",
        )

    finally:

        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    if not resume_text:

        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract text. "
                "Upload a text-based PDF."
            ),
        )

    logger.info(
        f"resume/upload extracted "
        f"{len(resume_text)} chars"
    )

    return {
        "filename": file.filename,
        "char_count": len(resume_text),
        "preview": resume_text[:500],
        "full_text": resume_text,
    }

@router.post(
    "/analyze",
    summary="Upload PDF resume and run AI analysis"
)
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    try:

        check_daily_limit(current_user.id, "resume")

        tmp_path = os.path.join(
            tempfile.gettempdir(),
            f"resume_{uuid.uuid4().hex}.pdf"
        )

        try:

            contents = await _read_validated_pdf(file)

            with open(tmp_path, "wb") as f:
                f.write(contents)

            resume_text = await asyncio.to_thread(_extract_text_from_pdf, tmp_path)

        finally:

            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        if not resume_text:

            raise HTTPException(
                status_code=422,
                detail=(
                    "Could not extract text from PDF."
                ),
            )

        logger.info(
            f"resume/analyze extracted "
            f"{len(resume_text)} chars"
        )

        # Cache check
        cached = get_cached_response(
            "resume_v3",
            resume_text[:2000],
            target_role,
        )

        if cached:

            await asyncio.to_thread(
                _save_resume_record,
                db,
                current_user.id,
                file.filename,
                resume_text,
                cached,
            )

            increment_usage(current_user.id, "resume")

            await asyncio.to_thread(
                log_activity,
                db,
                current_user.id,
                "Analyzed Resume (Cached)",
                "resume",
            )

            return {
                "filename": file.filename,
                "char_count": len(resume_text),
                "analysis": cached,
                "cached": True,
            }

        # Deterministic ATS
        try:
            deterministic_data = analyze_resume_deterministically(
                resume_text,
                target_role=target_role,
            )

        except Exception as e:

            logger.error(
                f"Deterministic ATS failed: {e}"
            )

            deterministic_data = {}

        # AI analysis with timeout protection
        analysis = await asyncio.wait_for(
            asyncio.to_thread(
                run_resume_agent,
                resume_text,
                deterministic_data,
                target_role,
                None,
            ),
            timeout=150,
        )

        await asyncio.to_thread(
            _save_resume_record,
            db,
            current_user.id,
            file.filename,
            resume_text,
            analysis,
        )

        increment_usage(current_user.id, "resume")

        await asyncio.to_thread(
            log_activity,
            db,
            current_user.id,
            "Analyzed Resume",
            "resume",
        )

        set_cached_response(
            "resume_v3",
            analysis,
            resume_text[:2000],
            target_role,
        )

        return {
            "filename": file.filename,
            "char_count": len(resume_text),
            "analysis": analysis,
            "cached": False,
        }

    except asyncio.TimeoutError:

        raise HTTPException(
            status_code=504,
            detail=(
                "Resume analysis timed out. "
                "Please try again."
            ),
        )

    except HTTPException:
        raise

    except Exception as e:

        logger.error(
            f"resume/analyze error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Error analyzing resume.",
        )

# ─────────────────────────────────────────────────────────────────────────────
# Database Save
# ─────────────────────────────────────────────────────────────────────────────

def _save_resume_record(
    db,
    user_id,
    filename,
    raw_text,
    parsed_content,
):

    try:

        record = Resume(
            user_id=user_id,
            filename=filename,
            parsed_content=parsed_content,
            raw_text=raw_text,
        )

        db.add(record)
        db.commit()

    except Exception as e:

        db.rollback()

        logger.error(
            f"Failed to save resume record: {e}"
        )