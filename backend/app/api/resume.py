"""
Resume API
  POST /resume/upload  → Save PDF + extract text (no AI)
  POST /resume/analyze → Upload PDF + run Resume Analyst Agent + return JSON

FIX: provider param now typed as Optional[str] = Query(None) for type safety.
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
from app.core.config import settings
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.cache import get_cached_response, set_cached_response
from app.core.activity import log_activity
from app.models.models import Resume

router = APIRouter()

MAX_RESUME_BYTES = 5 * 1024 * 1024
ALLOWED_PDF_MIME_TYPES = {"application/pdf", "application/x-pdf", "application/octet-stream"}


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
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n".join(text_parts).strip()


def _parse_agent_response(raw: str) -> dict:
    cleaned = raw.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"raw_response": raw, "parse_error": "Could not parse JSON from agent"}


@router.post("/upload", summary="Upload PDF resume — extract text only (no AI)")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload a PDF and get back the extracted raw text. No AI is invoked."""
    try:
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
                detail=(
                    "Could not extract text. Please upload a text-based PDF; "
                    "scanned image PDFs need OCR before analysis."
                ),
            )

        logger.info(f"resume/upload: extracted {len(resume_text)} chars from '{file.filename}'")
        return {
            "filename": file.filename,
            "char_count": len(resume_text),
            "preview": resume_text[:500],
            "full_text": resume_text,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in upload_resume: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while uploading the resume.")


@router.post("/analyze", summary="Upload PDF resume and get AI analysis")
async def analyze_resume(
    file: UploadFile = File(...),
    # FIX: properly typed optional query param (was `provider: str = None` — ambiguous)
    provider: Optional[str] = Query(None, description="LLM provider override: 'groq' or 'google'"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a PDF → extract text → run Resume Analyst Agent → return JSON."""
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
                detail=(
                    "Could not extract text from PDF. Please upload a text-based PDF; "
                    "scanned image PDFs need OCR before analysis."
                ),
            )

        logger.info(f"resume/analyze: extracted {len(resume_text)} chars from '{file.filename}'")

        # Cache check
        cached_analysis = get_cached_response("resume", resume_text, provider)
        if cached_analysis:
            resume_record = Resume(
                user_id=current_user.id,
                filename=file.filename,
                parsed_content=cached_analysis,
                raw_text=resume_text,
            )
            db.add(resume_record)
            db.commit()
            increment_usage(current_user.id, "resume")
            log_activity(db, current_user.id, "Analyzed Resume (Cached)", "resume")
            return {
                "filename": file.filename,
                "char_count": len(resume_text),
                "analysis": cached_analysis,
                "cached": True,
            }

        # Lazy import to avoid slow startup
        from app.agents.registry import get_resume_analyst, get_user_proxy
        from app.core.ats_engine import analyze_resume_deterministically
        import asyncio

        llm_config = settings.get_llm_config(provider)
        user_proxy = get_user_proxy()
        analyst = get_resume_analyst(llm_config=llm_config)

        deterministic_data = analyze_resume_deterministically(resume_text)

        prompt = (
            "You are the final Explanation Layer for a professional ATS pipeline.\n"
            "Below is the RAW DETERMINISTIC DATA extracted mathematically from the resume.\n"
            "DO NOT CHANGE the numbers, scores, or experience.\n"
            "Augment this data by inferring 'soft_skills' from the resume text and provide "
            "human-readable strings for strengths and gaps.\n\n"
            f"DETERMINISTIC DATA:\n{json.dumps(deterministic_data, indent=2)}\n\n"
            "RULES:\n"
            "- Infer 2-3 soft skills from project descriptions, leadership, and collaboration signals.\n"
            "- Polish 'top_strengths' into professional 1-sentence explanations.\n"
            "- Polish 'skill_gaps' into actionable advice.\n"
            "- KEEP 'ats_score' and 'ats_score_breakdown' EXACTLY as provided.\n"
            "- KEEP 'technical_skills' and 'years_of_experience' EXACTLY as provided.\n\n"
            "REQUIRED JSON FORMAT:\n"
            '{"technical_skills": [], "soft_skills": [], "years_of_experience": 0.0, '
            '"top_strengths": [], "skill_gaps": [], "ats_score": 0, "ats_score_breakdown": {}}\n\n'
            f"RESUME TEXT (for context):\n{resume_text[:4000]}"
        )

        user_proxy._is_termination_msg = lambda x: (
            x.get("content")
            and "ats_score_breakdown" in x.get("content", "")
            and "soft_skills" in x.get("content", "")
        )

        await asyncio.to_thread(
            user_proxy.initiate_chat, analyst, message=prompt, max_turns=1
        )

        # Extract response
        try:
            last_msg_obj = user_proxy.last_message(analyst)
            last_agent_msg = (last_msg_obj.get("content") or "").strip() if last_msg_obj else None
        except Exception:
            messages = user_proxy.chat_messages.get(analyst, [])
            last_agent_msg = next(
                (
                    m["content"]
                    for m in reversed(messages)
                    if m.get("role") == "user" and (m.get("content") or "").strip()
                ),
                None,
            )

        if not last_agent_msg:
            raise HTTPException(status_code=500, detail="Agent did not return a response.")

        analysis = _parse_agent_response(last_agent_msg)
        if not isinstance(analysis.get("ats_score"), (int, float)):
            analysis["ats_score"] = 0
        else:
            analysis["ats_score"] = int(round(analysis["ats_score"]))

        resume_record = Resume(
            user_id=current_user.id,
            filename=file.filename,
            parsed_content=analysis,
            raw_text=resume_text,
        )
        db.add(resume_record)
        db.commit()

        increment_usage(current_user.id, "resume")
        log_activity(db, current_user.id, "Analyzed Resume", "resume")
        set_cached_response("resume", analysis, resume_text, provider)

        return {
            "filename": file.filename,
            "char_count": len(resume_text),
            "analysis": analysis,
            "cached": False,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_resume: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while analyzing the resume.")
