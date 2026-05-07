"""
Resume API
  POST /resume/upload  -> Save PDF + extract text (no AI)
  POST /resume/analyze -> Upload PDF + run Resume Analyst Agent + return JSON
"""
import json
import os
import tempfile
import uuid

import pdfplumber
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from loguru import logger
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.cache import get_cached_response, set_cached_response
from app.models.models import Resume

# Agents imported lazily inside endpoint to avoid slow startup

router = APIRouter()

MAX_RESUME_BYTES = 5 * 1024 * 1024
ALLOWED_PDF_MIME_TYPES = {"application/pdf", "application/x-pdf", "application/octet-stream"}


async def _read_validated_pdf(file: UploadFile) -> bytes:
    """Validate PDF metadata and bytes before parsing."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if file.content_type and file.content_type not in ALLOWED_PDF_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    if file.size and file.size > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB.")

    contents = await file.read()
    if len(contents) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB.")

    if not contents.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF file content.")

    return contents


def _extract_text_from_pdf(file_path: str) -> str:
    """Extract plain text from a PDF file using pdfplumber."""
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n".join(text_parts).strip()


def _parse_agent_response(raw: str) -> dict:
    """
    Extract JSON from the agent's response.
    Handles cases where the agent wraps JSON inside ```json ... ``` blocks.
    """
    # Remove markdown code fences if present
    cleaned = raw.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback — return raw text inside a structure
        return {"raw_response": raw, "parse_error": "Could not parse JSON from agent"}


# ── POST /resume/upload ────────────────────────────────────────────────────────
@router.post("/upload", summary="Upload PDF resume — extract text only (no AI)")
async def upload_resume(file: UploadFile = File(...)):
    """
    Step 1 — Light endpoint: upload a PDF and get back the extracted raw text.
    No AI agent is called. Useful for a preview / word-count step.
    """
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
                detail="Could not extract text. Please upload a text-based PDF; scanned image PDFs need OCR before analysis.",
            )

        logger.info(f"resume/upload: extracted {len(resume_text)} chars from '{file.filename}'")
        return {
            "filename": file.filename,
            "char_count": len(resume_text),
            "preview": resume_text[:500],   # first 500 chars as a quick preview
            "full_text": resume_text,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in upload_resume: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while uploading the resume.")


# ── POST /resume/analyze ───────────────────────────────────────────────────────
@router.post("/analyze", summary="Upload PDF resume and get AI analysis")
async def analyze_resume(
    file: UploadFile = File(...),
    provider: str = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF resume -> extract text -> run Resume Analyst Agent -> return JSON.
    Limit: 6 AI analyses per user per day.
    """
    try:
        check_daily_limit(current_user.id, "resume")
        
        # ── Validate file type ──────────────────────────────────────────────────
        # ── Save to temp file ───────────────────────────────────────────────────
        tmp_path = os.path.join(tempfile.gettempdir(), f"resume_{uuid.uuid4().hex}.pdf")
        try:
            contents = await _read_validated_pdf(file)
            with open(tmp_path, "wb") as f:
                f.write(contents)

            # ── Extract text ────────────────────────────────────────────────────
            resume_text = _extract_text_from_pdf(tmp_path)
        finally:
            # Clean up temp file immediately after extraction (before agent call)
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        if not resume_text:
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from PDF. Please upload a text-based PDF; scanned image PDFs need OCR before analysis.",
            )

        logger.info(f"resume/analyze: extracted {len(resume_text)} chars from '{file.filename}'")

        # ── Check Cache First ───────────────────────────────────────────────────
        cached_analysis = get_cached_response("resume", resume_text, provider)
        if cached_analysis:
            # Still save to DB for history
            resume_record = Resume(user_id=current_user.id, filename=file.filename, parsed_content=cached_analysis, raw_text=resume_text)
            db.add(resume_record)
            db.commit()
            
            increment_usage(current_user.id, "resume")
            log_activity(db, current_user.id, "Analyzed Resume (Cached)", "resume")
            
            return {
                "filename": file.filename,
                "char_count": len(resume_text),
                "analysis": cached_analysis,
                "cached": True
            }

        # ── Run Resume Analyst Agent ────────────────────────────────────────────
        from app.agents.registry import get_resume_analyst, get_user_proxy  # lazy import
        llm_config = settings.get_llm_config(provider)
        user_proxy = get_user_proxy()
        analyst   = get_resume_analyst(llm_config=llm_config)

        user_proxy.initiate_chat(
            analyst,
            message=(
                "Analyze the following resume and return ONLY raw valid JSON. "
                "No markdown. No explanations. No conversational text. No comments. No trailing commas.\n\n"

                "REQUIRED JSON FORMAT:\n"
                "{\n"
                '  "technical_skills": ["skill_1", "skill_2"],\n'
                '  "soft_skills": ["skill_1", "skill_2"],\n'
                '  "years_of_experience": 1.5,\n'
                '  "top_strengths": ["strength_1", "strength_2", "strength_3"],\n'
                '  "skill_gaps": ["gap_1", "gap_2", "gap_3", "gap_4", "gap_5"],\n'
                '  "ats_score": 78,\n'
                '  "ats_score_breakdown": {\n'
                '    "keywords": 20,\n'
                '    "achievements": 14,\n'
                '    "formatting": 12,\n'
                '    "action_verbs": 16,\n'
                '    "education": 8,\n'
                '    "length": 8\n'
                "  }\n"
                "}\n\n"

                "RULES:\n"
                "- Extract ALL relevant technical skills (languages, frameworks, cloud, databases, DevOps, AI/ML tools).\n"
                "- Infer soft skills from project descriptions, leadership, and collaboration signals.\n"
                "- Calculate total NON-OVERLAPPING professional experience as float years.\n"
                "- Return EXACTLY 3 evidence-based top strengths.\n"
                "- Return EXACTLY 5 highly specific skill gaps aligned to the candidate's likely target role.\n"
                "- ATS score MUST equal the total of all breakdown scores. Never exceed 100.\n"
                "- Most student resumes fall between 55-80 unless exceptionally strong.\n\n"

                f"RESUME:\n{resume_text[:6000]}"
            ),
            max_turns=2,
        )

        # ── Extract response ────────────────────────────────────────────────────
        try:
            last_msg_obj = user_proxy.last_message(analyst)
            last_agent_msg = last_msg_obj.get("content", "").strip() if last_msg_obj else None
        except Exception:
            # Fallback: scan manually for the agent's reply (role="user" in this context)
            messages = user_proxy.chat_messages.get(analyst, [])
            last_agent_msg = next(
                (
                    m["content"]
                    for m in reversed(messages)
                    if m.get("role") == "user" and m.get("content", "").strip()
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

        # -- Save to Database -----------------------------------------------------
        resume_record = Resume(
            user_id=current_user.id,
            filename=file.filename,
            parsed_content=analysis,
            raw_text=resume_text
        )
        db.add(resume_record)
        db.commit()

        # -- Increment counter only on success ------------------------------------
        increment_usage(current_user.id, "resume")
        log_activity(db, current_user.id, "Analyzed Resume", "resume")
        
        # Save successful response to cache
        set_cached_response("resume", analysis, resume_text, provider)

        return {
            "filename": file.filename,
            "char_count": len(resume_text),
            "analysis": analysis,
            "cached": False
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_resume: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while analyzing the resume.")

from app.core.activity import log_activity
