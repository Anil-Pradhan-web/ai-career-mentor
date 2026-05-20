"""
Resume API & Agent Logic.

Responsibilities:
  POST /resume/upload  → Extract PDF text, no AI
  POST /resume/analyze → Extract PDF text + run resume agent + return JSON

Agent logic (run_resume_agent) is the single source of truth for resume
analysis prompts and is imported by workflow.py for the LangGraph pipeline.
"""
import json
import os
import tempfile
import uuid
from typing import Optional

import pdfplumber
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from loguru import logger
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.cache import get_cached_response, set_cached_response
from app.core.activity import log_activity
from app.core.ats_engine import analyze_resume_deterministically
from app.agents.registry import call_llm, parse_json
from app.models.validation import ResumeAnalysisModel
from app.models.models import Resume

router = APIRouter()

MAX_RESUME_BYTES = 5 * 1024 * 1024
ALLOWED_PDF_MIME_TYPES = {"application/pdf", "application/x-pdf", "application/octet-stream"}

# ─────────────────────────────────────────────────────────────────────────────
# Resume Agent — owned here, imported by workflow.py
# ─────────────────────────────────────────────────────────────────────────────

_RESUME_SYSTEM_PROMPT = """\
You are an elite Senior Technical Recruiter and ATS specialist.
Your task: take deterministic ATS scores and augment them with human-readable
strengths, soft-skill inference, and actionable gap advice.

Rules:
- NEVER change any numeric score from the deterministic input.
- Output ONLY valid JSON matching the exact schema below — no markdown, no explanation.
- All list fields must be non-empty arrays of strings.

Required JSON schema:
{
  "technical_skills": ["<skill>"],
  "soft_skills": ["<skill>"],
  "years_of_experience": 0.0,
  "top_strengths": ["<strength>"],
  "skill_gaps": ["<gap>"],
  "ats_score": 0,
  "ats_score_breakdown": {
    "keywords": 0,
    "achievements": 0,
    "action_verbs": 0,
    "formatting_and_length": 0
  }
}
"""


def run_resume_agent(
    resume_text: str,
    deterministic_data: dict,
    provider: Optional[str] = None,
) -> dict:
    """
    Resume Analysis Agent.

    Takes deterministic ATS output and enriches it with LLM-generated
    strengths, soft skills, and gap analysis.

    Returns validated dict. Falls back to deterministic_data on failure.
    """
    user_content = (
        f"DETERMINISTIC ATS DATA:\n{json.dumps(deterministic_data, indent=2)}\n\n"
        f"RAW RESUME TEXT (first 3000 chars):\n{resume_text[:3000]}"
    )

    result = call_llm(
        system_prompt=_RESUME_SYSTEM_PROMPT,
        user_content=user_content,
        provider=provider,
        response_model=ResumeAnalysisModel,
    )

    if not result:
        logger.warning("Resume agent returned no result — using deterministic fallback.")
        return deterministic_data

    # Ensure ats_score is a valid integer (never let LLM override deterministic value)
    result["ats_score"] = int(round(deterministic_data.get("ats_score", result.get("ats_score", 0))))
    return result


# ─────────────────────────────────────────────────────────────────────────────
# PDF Helpers
# ─────────────────────────────────────────────────────────────────────────────

async def _read_validated_pdf(file: UploadFile) -> bytes:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    if file.content_type and file.content_type not in ALLOWED_PDF_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    contents = await file.read()
    if len(contents) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB.")
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF file content.")
    return contents


def _extract_text_from_pdf(file_path: str) -> str:
    parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
    return "\n".join(parts).strip()


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/upload", summary="Upload PDF resume — extract text only (no AI)")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload a PDF and get back the extracted raw text. No AI invoked."""
    tmp_path = os.path.join(tempfile.gettempdir(), f"resume_{uuid.uuid4().hex}.pdf")
    try:
        contents = await _read_validated_pdf(file)
        with open(tmp_path, "wb") as f:
            f.write(contents)
        resume_text = _extract_text_from_pdf(tmp_path)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"resume/upload error: {e}")
        raise HTTPException(status_code=500, detail="Error uploading resume.")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    if not resume_text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text. Upload a text-based PDF (not a scanned image).",
        )

    logger.info(f"resume/upload: extracted {len(resume_text)} chars from '{file.filename}'")
    return {
        "filename": file.filename,
        "char_count": len(resume_text),
        "preview": resume_text[:500],
        "full_text": resume_text,
    }


@router.post("/analyze", summary="Upload PDF resume and run AI analysis")
async def analyze_resume(
    file: UploadFile = File(...),
    provider: Optional[str] = Query(None, description="LLM provider override: 'groq' or 'google'"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload PDF → extract text → run resume agent → return structured JSON."""
    try:
        check_daily_limit(current_user.id, "resume")

        tmp_path = os.path.join(tempfile.gettempdir(), f"resume_{uuid.uuid4().hex}.pdf")
        try:
            contents = await _read_validated_pdf(file)
            with open(tmp_path, "wb") as f:
                f.write(contents)
            resume_text = _extract_text_from_pdf(tmp_path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        if not resume_text:
            raise HTTPException(
                status_code=422,
                detail="Could not extract text. Upload a text-based PDF (not a scanned image).",
            )

        logger.info(f"resume/analyze: extracted {len(resume_text)} chars from '{file.filename}'")

        # Cache check
        cached = get_cached_response("resume_v2", resume_text, provider)
        if cached:
            _save_resume_record(db, current_user.id, file.filename, resume_text, cached)
            increment_usage(current_user.id, "resume")
            log_activity(db, current_user.id, "Analyzed Resume (Cached)", "resume")
            return {"filename": file.filename, "char_count": len(resume_text), "analysis": cached, "cached": True}

        import asyncio
        deterministic_data = analyze_resume_deterministically(resume_text)
        analysis = await asyncio.to_thread(run_resume_agent, resume_text, deterministic_data, provider)

        _save_resume_record(db, current_user.id, file.filename, resume_text, analysis)
        increment_usage(current_user.id, "resume")
        log_activity(db, current_user.id, "Analyzed Resume", "resume")
        set_cached_response("resume_v2", analysis, resume_text, provider)

        return {"filename": file.filename, "char_count": len(resume_text), "analysis": analysis, "cached": False}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"resume/analyze error: {e}")
        raise HTTPException(status_code=500, detail="Error analyzing resume.")


def _save_resume_record(db, user_id, filename, raw_text, parsed_content):
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
        logger.error(f"Failed to save resume record: {e}")