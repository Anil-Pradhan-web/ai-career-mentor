"""
Resume API
  POST /resume/upload  → Save PDF + extract text (no AI)
  POST /resume/analyze → Upload PDF + run Resume Analyst Agent + return JSON
"""
import json
import os
import tempfile
import uuid

import pdfplumber
from fastapi import APIRouter, File, HTTPException, UploadFile
from loguru import logger

from app.agents.registry import get_resume_analyst, get_user_proxy

router = APIRouter()


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
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB.")

    tmp_path = os.path.join(tempfile.gettempdir(), f"resume_{uuid.uuid4().hex}.pdf")
    try:
        contents = await file.read()
        with open(tmp_path, "wb") as f:
            f.write(contents)

        resume_text = _extract_text_from_pdf(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    if not resume_text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text. Make sure the PDF is not a scanned image.",
        )

    logger.info(f"resume/upload: extracted {len(resume_text)} chars from '{file.filename}'")
    return {
        "filename": file.filename,
        "char_count": len(resume_text),
        "preview": resume_text[:500],   # first 500 chars as a quick preview
        "full_text": resume_text,
    }


# ── POST /resume/analyze ───────────────────────────────────────────────────────
@router.post("/analyze", summary="Upload PDF resume and get AI analysis")
async def analyze_resume(file: UploadFile = File(...)):
    """
    Upload a PDF resume → extract text → run Resume Analyst Agent → return JSON.
    """
    # ── Validate file type ──────────────────────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    # ── Save to temp file ───────────────────────────────────────────────────
    tmp_path = os.path.join(tempfile.gettempdir(), f"resume_{uuid.uuid4().hex}.pdf")
    try:
        contents = await file.read()
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
            detail="Could not extract text from PDF. Make sure it's not a scanned image.",
        )

    logger.info(f"resume/analyze: extracted {len(resume_text)} chars from '{file.filename}'")

    # ── Run Resume Analyst Agent ────────────────────────────────────────────
    user_proxy = get_user_proxy()
    analyst   = get_resume_analyst()

    user_proxy.initiate_chat(
        analyst,
        message=(
            "Analyze the following resume text and return ONLY a JSON object "
            "(no extra commentary) with exactly these keys:\n"
            "  technical_skills   : list of skill strings\n"
            "  soft_skills        : list of soft-skill strings\n"
            "  years_of_experience: integer\n"
            "  top_strengths      : list of exactly 3 strings\n"
            "  skill_gaps         : list of exactly 3 strings\n\n"
            f"Resume:\n{resume_text[:6000]}"
        ),
        # max_turns=2: turn-1 = proxy sends message, turn-2 = agent replies
        max_turns=2,
    )

    # ── Extract response ────────────────────────────────────────────────────
    # AutoGen quirk: when chat_messages is keyed by the AssistantAgent,
    # the *agent's* reply carries role="user" and the proxy's send is role="assistant".
    # So we grab the last non-empty "user" role message as the AI's answer.
    # Use AutoGen's official API to get the analyst's last reply.
    # Internally, when the dict is keyed by AssistantAgent, agent replies
    # carry role="user" (AutoGen quirk), so last_message() is safer than
    # manually filtering by role.
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

    return {
        "filename": file.filename,
        "char_count": len(resume_text),
        "analysis": analysis,
    }
