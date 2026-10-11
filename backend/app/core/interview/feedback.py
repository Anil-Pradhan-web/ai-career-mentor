"""
Interview Feedback — 360-degree structured final evaluation and performance scorecard.
"""
from __future__ import annotations

import re
import json
from typing import Any, Optional, Dict, List

from loguru import logger
from pydantic import BaseModel, Field

from app.core.interview.prompts import build_scoring_rubric
from app.core.interview.schemas import _coerce_string_list, _coerce_score


def build_structured_feedback_prompt(
    role: str,
    company: str,
    interview_type: str = "technical",
    role_level: str = "fresher",
    total_questions: int = 6,
) -> str:
    """System prompt for the 360-degree JSON evaluation report."""
    rubric = build_scoring_rubric(role, interview_type, role_level)
    return (
        f"You are the Senior Hiring Committee and Staff Technical Director at {company}.\n"
        f"Role: {role} ({role_level.capitalize()} level) | Interview: {interview_type.upper()}\n\n"
        f"SCORING RUBRIC:\n{rubric}\n\n"
        "Your task: produce a comprehensive, 360-degree candidate evaluation scorecard based on the interview transcript.\n"
        "Be objective, constructive, and rigorous according to real industry hiring standards.\n\n"
        "Return ONLY a single valid JSON object with EXACTLY this structure:\n"
        "{\n"
        '  "overall_score": 82.0,\n'
        '  "hiring_verdict": "Strong Hire" | "Hire" | "Leaning Hire" | "Leaning No Hire" | "No Hire",\n'
        '  "executive_summary": "Comprehensive 1-2 sentence assessment of candidate capability and readiness.",\n'
        '  "category_scores": {\n'
        '    "technical_depth": 85.0,\n'
        '    "problem_solving": 80.0,\n'
        '    "communication": 88.0,\n'
        '    "culture_fit": 82.0\n'
        "  },\n"
        '  "strengths": ["Max 4 specific strengths demonstrated"],\n'
        '  "improvements": ["Max 4 critical gaps or growth opportunities"],\n'
        '  "advice": ["Max 3 high-yield actionable study topics or practical exercises"],\n'
        '  "question_reviews": [\n'
        '    {\n'
        '      "question_number": 1,\n'
        '      "question": "Summary of question asked",\n'
        '      "score": 85.0,\n'
        '      "candidate_takeaway": "What the candidate answered well or missed",\n'
        '      "gold_standard_answer": "How an elite Staff Engineer would answer this question with technical precision and trade-offs"\n'
        "    }\n"
        "  ]\n"
        "}"
    )


class QuestionReviewItem(BaseModel):
    question_number: int = 1
    question: str = ""
    score: float = 75.0
    candidate_takeaway: str = ""
    gold_standard_answer: str = ""


class FeedbackReport(BaseModel):
    overall_score: float = Field(ge=0, le=100)
    hiring_verdict: str = "Hire"
    executive_summary: str = ""
    category_scores: Dict[str, float] = Field(default_factory=lambda: {
        "technical_depth": 75.0,
        "problem_solving": 75.0,
        "communication": 80.0,
        "culture_fit": 75.0,
    })
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    advice: List[str] = Field(default_factory=list)
    question_reviews: List[QuestionReviewItem] = Field(default_factory=list)


def parse_feedback_report(raw: Any) -> FeedbackReport | None:
    """Tolerant parser for the structured 360 feedback JSON. Returns None if unusable."""
    if isinstance(raw, str):
        text = raw.strip()
        # strip fences
        m = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
        if m:
            text = m.group(1).strip()
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            text = text[start : end + 1]
        try:
            raw = json.loads(text)
        except Exception:
            return None
    if not isinstance(raw, dict):
        return None

    try:
        overall = _coerce_score(
            raw.get("overall_score", raw.get("score", raw.get("final_score", raw.get("rating", ""))))
        )
    except Exception:
        return None

    # Determine verdict
    raw_verdict = str(raw.get("hiring_verdict", raw.get("verdict", ""))).strip()
    if not raw_verdict:
        if overall >= 88: raw_verdict = "Strong Hire"
        elif overall >= 75: raw_verdict = "Hire"
        elif overall >= 65: raw_verdict = "Leaning Hire"
        elif overall >= 50: raw_verdict = "Leaning No Hire"
        else: raw_verdict = "No Hire"

    # Category scores
    raw_cats = raw.get("category_scores", {})
    category_scores = {
        "technical_depth": _coerce_score(raw_cats.get("technical_depth", overall)),
        "problem_solving": _coerce_score(raw_cats.get("problem_solving", overall)),
        "communication": _coerce_score(raw_cats.get("communication", min(100.0, overall + 5))),
        "culture_fit": _coerce_score(raw_cats.get("culture_fit", overall)),
    }

    # Question reviews
    q_reviews: List[QuestionReviewItem] = []
    raw_reviews = raw.get("question_reviews", [])
    if isinstance(raw_reviews, list):
        for idx, qr in enumerate(raw_reviews, start=1):
            if isinstance(qr, dict):
                q_reviews.append(QuestionReviewItem(
                    question_number=qr.get("question_number", idx),
                    question=str(qr.get("question", "")).strip(),
                    score=_coerce_score(qr.get("score", overall)),
                    candidate_takeaway=str(qr.get("candidate_takeaway", qr.get("feedback", ""))).strip(),
                    gold_standard_answer=str(qr.get("gold_standard_answer", qr.get("model_answer", ""))).strip(),
                ))

    return FeedbackReport(
        overall_score=round(max(0.0, min(100.0, overall)), 1),
        hiring_verdict=raw_verdict,
        executive_summary=str(raw.get("executive_summary", raw.get("summary", "")) or "").strip(),
        category_scores=category_scores,
        strengths=_coerce_string_list(raw.get("strengths", []))[:5],
        improvements=_coerce_string_list(raw.get("improvements", raw.get("areas_of_improvement", [])))[:5],
        advice=_coerce_string_list(raw.get("advice", raw.get("actionable_advice", [])))[:4],
        question_reviews=q_reviews,
    )


def render_feedback_markdown(report: FeedbackReport) -> str:
    """Render a structured report into rich markdown matching expected contracts."""
    def bullets(items: list[str], default: str) -> str:
        items = [str(i).strip() for i in items if str(i).strip()]
        if not items:
            return f"- {default}"
        return "\n".join(f"- {i[:140]}" for i in items)

    summary = report.executive_summary or "The candidate demonstrated a solid technical grasp with clear growth opportunities."
    cats = report.category_scores

    md_parts = [
        "That concludes our interview today. Thank you for your time. Here is your detailed performance analysis.\n",
        f"### 🎯 Hiring Verdict: **{report.hiring_verdict}** ({int(round(report.overall_score))}/100)\n",
        f"**Executive Summary:** {summary}\n",
        "**Category Breakdown:**",
        f"- **Technical Depth & Core Foundations:** {int(round(cats.get('technical_depth', report.overall_score)))}%",
        f"- **Problem Solving & Complexity:** {int(round(cats.get('problem_solving', report.overall_score)))}%",
        f"- **Structured Communication:** {int(round(cats.get('communication', report.overall_score)))}%",
        f"- **Culture & Principle Alignment:** {int(round(cats.get('culture_fit', report.overall_score)))}%\n",
        "**Strengths:**",
        f"{bullets(report.strengths, 'Clear communication and structured answers')}\n",
        "**Areas of Improvement:**",
        f"{bullets(report.improvements, 'Could deepen technical depth on core topics')}\n",
        "**Actionable Advice:**",
        f"{bullets(report.advice, 'Practice the listed topics with hands-on projects')}\n",
    ]

    if report.question_reviews:
        md_parts.append("### 🔍 Question-by-Question Gold-Standard Review\n")
        for qr in report.question_reviews:
            q_title = qr.question if qr.question else f"Question {qr.question_number}"
            md_parts.append(f"#### Q{qr.question_number}: {q_title}")
            if qr.candidate_takeaway:
                md_parts.append(f"*Assessment:* {qr.candidate_takeaway}")
            if qr.gold_standard_answer:
                md_parts.append(f"**Staff-Engineer Gold-Standard:**\n> {qr.gold_standard_answer}\n")

    md_parts.append(f"OVERALL SCORE : {int(round(report.overall_score))}/100")
    return "\n".join(md_parts)


def average_phase_scores(phase_scores: list[float]) -> float | None:
    """Mean of recorded per-phase scores, or None when empty."""
    if not phase_scores:
        return None
    return round(sum(phase_scores) / len(phase_scores), 1)


def combine_final_score(report_score: float | None, phase_scores: list[float]) -> float:
    """Blend holistic report score with per-phase evidence."""
    phase_avg = average_phase_scores(phase_scores)

    if report_score is not None and phase_avg is not None:
        blended = round(0.6 * report_score + 0.4 * phase_avg, 1)
        logger.info(f"[interview] Final score = 0.6*report({report_score}) + 0.4*phase_avg({phase_avg}) → {blended}")
        return blended
    if report_score is not None:
        return report_score
    if phase_avg is not None:
        return phase_avg

    logger.warning("[interview] No report score and no phase scores — fallback 75.0")
    return 75.0